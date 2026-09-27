<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalarySlip;
use App\Models\Barber;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class SalarySlipController extends Controller
{
    // Get all salary slips (for admin)
    public function index(Request $request)
    {
        $query = SalarySlip::with(['barber', 'user']);

        // Filter by barber
        if ($request->has('barber_id')) {
            $query->where('barber_id', $request->barber_id);
        }

        // Filter by period
        if ($request->has('year')) {
            $query->where('year', $request->year);
        }
        if ($request->has('month')) {
            $query->where('month', $request->month);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $slips = $query->orderBy('year', 'desc')
                       ->orderBy('month', 'desc')
                       ->paginate($request->per_page ?? 10);

        return response()->json($slips);
    }

    // Get salary slip for logged in barber
    public function mySlips(Request $request)
    {
        $user = $request->user();
        $barber = Barber::where('user_id', $user->id)->first();

        if (!$barber) {
            return response()->json(['message' => 'Barber not found'], 404);
        }

        $query = SalarySlip::where('barber_id', $barber->id);

        // Filter by year
        if ($request->has('year')) {
            $query->where('year', $request->year);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $slips = $query->orderBy('year', 'desc')
                       ->orderBy('month', 'desc')
                       ->paginate($request->per_page ?? 12);

        return response()->json($slips);
    }

    // Get single salary slip detail
    public function show($id)
    {
        $slip = SalarySlip::with(['barber', 'user'])->findOrFail($id);
        return response()->json($slip);
    }

    // Get my specific salary slip (for barber)
    public function mySlipDetail(Request $request, $id)
    {
        $user = $request->user();
        $barber = Barber::where('user_id', $user->id)->first();

        if (!$barber) {
            return response()->json(['message' => 'Barber not found'], 404);
        }

        $slip = SalarySlip::where('id', $id)
                          ->where('barber_id', $barber->id)
                          ->with(['barber', 'user'])
                          ->firstOrFail();

        return response()->json($slip);
    }

    // Generate salary slip for a period (admin only)
    public function generate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'barber_id' => 'required|exists:barbers,id',
            'year' => 'required|integer|min:2020|max:2100',
            'month' => 'required|integer|min:1|max:12',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $barber = Barber::findOrFail($request->barber_id);
        $year = $request->year;
        $month = $request->month;

        // Check if slip already exists
        $existingSlip = SalarySlip::where('barber_id', $barber->id)
                                   ->where('year', $year)
                                   ->where('month', $month)
                                   ->first();

        if ($existingSlip) {
            return response()->json([
                'message' => 'Slip gaji untuk periode ini sudah ada',
                'slip' => $existingSlip
            ], 422);
        }

        // Calculate period dates
        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();
        
        // Get month name in Indonesian
        $monthNames = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];

        // Get transactions for this period
        $transactions = Transaction::where('barber_id', $barber->id)
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

        $totalTransactionAmount = $transactions->sum('total_amount');
        $totalServices = $transactions->sum(function ($t) {
            return $t->items->where('item_type', 'service')->count();
        });
        $totalCustomers = $transactions->count();

        // Calculate commission
        $commissionTotal = ($totalTransactionAmount * $barber->commission_rate) / 100;

        // Base calculations
        $baseSalary = $barber->salary ?? 0;
        $totalIncome = $baseSalary + $commissionTotal;
        $totalDeduction = 0; // Can be customized
        $netSalary = $totalIncome - $totalDeduction;

        // Create salary slip
        $slip = SalarySlip::create([
            'barber_id' => $barber->id,
            'user_id' => $barber->user_id,
            'year' => $year,
            'month' => $month,
            'period_name' => $monthNames[$month] . ' ' . $year,
            'base_salary' => $baseSalary,
            'commission_total' => $commissionTotal,
            'bonus' => 0,
            'overtime' => 0,
            'deduction_late' => 0,
            'deduction_absence' => 0,
            'deduction_other' => 0,
            'total_income' => $totalIncome,
            'total_deduction' => $totalDeduction,
            'net_salary' => $netSalary,
            'status' => 'draft',
            'total_customers' => $totalCustomers,
            'total_services' => $totalServices,
            'total_transaction_amount' => $totalTransactionAmount,
        ]);

        // Kirim email notifikasi ke barber
        $this->sendSalarySlipCreatedEmail($slip);

        return response()->json([
            'message' => 'Slip gaji berhasil dibuat',
            'slip' => $slip->load('barber', 'user')
        ], 201);
    }

    // Update salary slip (admin only)
    public function update(Request $request, $id)
    {
        $slip = SalarySlip::findOrFail($id);

        // Only allow update if status is draft
        if ($slip->status !== 'draft') {
            return response()->json([
                'message' => 'Slip gaji tidak dapat diubah karena sudah ' . $slip->status
            ], 422);
        }

        $validated = $request->validate([
            'base_salary' => 'nullable|numeric|min:0',
            'bonus' => 'nullable|numeric|min:0',
            'overtime' => 'nullable|numeric|min:0',
            'deduction_late' => 'nullable|numeric|min:0',
            'deduction_absence' => 'nullable|numeric|min:0',
            'deduction_other' => 'nullable|numeric|min:0',
            'deduction_note' => 'nullable|string',
            'note' => 'nullable|string',
        ]);

        // Recalculate totals
        $baseSalary = $validated['base_salary'] ?? $slip->base_salary;
        $bonus = $validated['bonus'] ?? $slip->bonus;
        $overtime = $validated['overtime'] ?? $slip->overtime;
        $deductionLate = $validated['deduction_late'] ?? $slip->deduction_late;
        $deductionAbsence = $validated['deduction_absence'] ?? $slip->deduction_absence;
        $deductionOther = $validated['deduction_other'] ?? $slip->deduction_other;

        $totalIncome = $baseSalary + $slip->commission_total + $bonus + $overtime;
        $totalDeduction = $deductionLate + $deductionAbsence + $deductionOther;
        $netSalary = $totalIncome - $totalDeduction;

        $slip->update([
            'base_salary' => $baseSalary,
            'bonus' => $bonus,
            'overtime' => $overtime,
            'deduction_late' => $deductionLate,
            'deduction_absence' => $deductionAbsence,
            'deduction_other' => $deductionOther,
            'deduction_note' => $validated['deduction_note'] ?? $slip->deduction_note,
            'total_income' => $totalIncome,
            'total_deduction' => $totalDeduction,
            'net_salary' => $netSalary,
            'note' => $validated['note'] ?? $slip->note,
        ]);

        return response()->json([
            'message' => 'Slip gaji berhasil diupdate',
            'slip' => $slip->load('barber', 'user')
        ]);
    }

    // Approve salary slip (admin only)
    public function approve($id)
    {
        $slip = SalarySlip::findOrFail($id);

        if ($slip->status !== 'draft') {
            return response()->json([
                'message' => 'Slip gaji sudah ' . $slip->status
            ], 422);
        }

        $slip->update(['status' => 'approved']);

        return response()->json([
            'message' => 'Slip gaji berhasil disetujui',
            'slip' => $slip
        ]);
    }

    // Mark as paid (admin only)
    public function markAsPaid(Request $request, $id)
    {
        $slip = SalarySlip::findOrFail($id);

        if ($slip->status === 'paid') {
            return response()->json([
                'message' => 'Slip gaji sudah dibayar'
            ], 422);
        }

        $slip->update([
            'status' => 'paid',
            'paid_at' => now(),
            'paid_by' => $request->user()->name,
        ]);

        // Kirim email notifikasi pembayaran ke barber
        $this->sendSalarySlipPaidEmail($slip);

        return response()->json([
            'message' => 'Slip gaji berhasil ditandai sebagai dibayar',
            'slip' => $slip
        ]);
    }

    // Delete salary slip (admin only, only draft)
    public function destroy($id)
    {
        $slip = SalarySlip::findOrFail($id);

        if ($slip->status !== 'draft') {
            return response()->json([
                'message' => 'Hanya slip gaji dengan status draft yang dapat dihapus'
            ], 422);
        }

        $slip->delete();

        return response()->json([
            'message' => 'Slip gaji berhasil dihapus'
        ]);
    }

    // Get statistics for dashboard
    public function statistics(Request $request)
    {
        $user = $request->user();
        
        if ($user->role === 'barber') {
            $barber = Barber::where('user_id', $user->id)->first();
            if (!$barber) {
                return response()->json(['message' => 'Barber not found'], 404);
            }
            
            $query = SalarySlip::where('barber_id', $barber->id);
        }
        // Admin can see all or filter by barber
        elseif ($request->has('barber_id')) {
            $query = SalarySlip::where('barber_id', $request->barber_id);
        } else {
            $query = SalarySlip::query();
        }

        $year = $request->year ?? now()->year;
        
        $stats = [
            'total_slips' => $query->clone()->where('year', $year)->count(),
            'total_paid' => $query->clone()->where('year', $year)->where('status', 'paid')->sum('net_salary'),
            'total_pending' => $query->clone()->where('year', $year)->whereIn('status', ['draft', 'approved'])->sum('net_salary'),
            'year' => $year,
        ];

        return response()->json($stats);
    }

    // Get available years for filter
    public function availableYears()
    {
        $years = SalarySlip::select('year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year');

        // If no data, return current year
        if ($years->isEmpty()) {
            $years = [now()->year];
        }

        return response()->json($years);
    }

    // Kirim email notifikasi slip gaji dibuat
    private function sendSalarySlipCreatedEmail($slip)
    {
        $barber = $slip->barber;
        $user = $barber->user;
        
        if (!$user || !$user->email) {
            return;
        }

        $viewUrl = config('app.frontend_url', 'http://localhost:3000') . '/barber-salary';

        Mail::send('emails.salary-slip-created', [
            'slip' => $slip,
            'viewUrl' => $viewUrl,
        ], function ($message) use ($user, $slip) {
            $message->to($user->email, $user->name)
                    ->subject('Slip Gaji Tersedia - ' . $slip->period_name);
        });
    }

    // Kirim email notifikasi slip gaji dibayar
    private function sendSalarySlipPaidEmail($slip)
    {
        $barber = $slip->barber;
        $user = $barber->user;
        
        if (!$user || !$user->email) {
            return;
        }

        $viewUrl = config('app.frontend_url', 'http://localhost:3000') . '/barber-salary';

        Mail::send('emails.salary-slip-paid', [
            'slip' => $slip,
            'viewUrl' => $viewUrl,
        ], function ($message) use ($user, $slip) {
            $message->to($user->email, $user->name)
                    ->subject('Pembayaran Gaji - ' . $slip->period_name);
        });
    }

    // Download/View PDF slip gaji (untuk barber)
    public function downloadPdf(Request $request, $id)
    {
        $user = $request->user();
        
        // Jika barber, hanya bisa lihat slip sendiri
        if ($user->role === 'barber') {
            $barber = Barber::where('user_id', $user->id)->first();
            if (!$barber) {
                return response()->json(['message' => 'Barber not found'], 404);
            }
            
            $slip = SalarySlip::where('id', $id)
                              ->where('barber_id', $barber->id)
                              ->with('barber')
                              ->firstOrFail();
        } else {
            // Admin bisa lihat semua
            $slip = SalarySlip::with('barber')->findOrFail($id);
        }

        // Generate PDF
        $pdf = Pdf::loadView('pdf.salary-slip', compact('slip'));
        
        // Set paper size dan orientation
        $pdf->setPaper('A4', 'portrait');
        
        // Download PDF dengan nama file yang sesuai
        $filename = 'Slip_Gaji_' . $slip->barber->name . '_' . $slip->period_name . '.pdf';
        $filename = str_replace(' ', '_', $filename);
        
        return $pdf->download($filename);
    }
}
