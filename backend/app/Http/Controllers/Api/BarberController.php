<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Barber;
use Illuminate\Http\Request;

class BarberController extends Controller
{
    // List only - readonly
    public function index()
    {
        $barbers = Barber::with('user')
            ->orderBy('name')
            ->get();
        return response()->json($barbers);
    }

    public function show(Barber $barber)
    {
        return response()->json($barber->load(['user', 'transactions' => function($q) {
            $q->latest()->limit(10);
        }]));
    }

    public function getActive()
    {
        $barbers = Barber::where('status', 'active')->orderBy('name')->get();
        return response()->json($barbers);
    }

    // Dashboard for barber
    public function getDashboard(Request $request)
    {
        $user = $request->user();
        $barber = $user->barber;

        if (!$barber) {
            return response()->json(['message' => 'Barber not found'], 404);
        }

        $todayStats = [
            'total_queues' => $barber->todayQueues()->count(),
            'completed' => $barber->todayCompleted()->count(),
            'in_progress' => $barber->queues()->today()->where('status', 'in_progress')->count(),
            'commission_today' => $barber->calculateCommission(),
        ];

        $monthlyStats = [
            'total_jobs' => $barber->queues()
                ->whereMonth('created_at', now()->month)
                ->where('status', 'completed')
                ->count(),
            'commission_month' => $barber->calculateCommission(
                now()->startOfMonth(),
                now()->endOfMonth()
            ),
        ];

        $currentQueue = $barber->queues()
            ->today()
            ->where('status', 'in_progress')
            ->first();

        $nextQueue = $barber->queues()
            ->today()
            ->where('status', 'waiting')
            ->orderBy('created_at')
            ->first();

        $recentJobs = $barber->queues()
            ->where('status', 'completed')
            ->latest()
            ->limit(5)
            ->get();

        // Get latest salary slip
        $latestSlip = $barber->salarySlips()
            ->where('status', 'paid')
            ->first();

        // Get current month estimated earnings
        $currentMonthEarnings = [
            'base_salary' => $barber->salary ?? 0,
            'commission' => $monthlyStats['commission_month'],
            'estimated_total' => ($barber->salary ?? 0) + $monthlyStats['commission_month'],
        ];

        return response()->json([
            'barber' => $barber,
            'today_stats' => $todayStats,
            'monthly_stats' => $monthlyStats,
            'current_queue' => $currentQueue,
            'next_queue' => $nextQueue,
            'recent_jobs' => $recentJobs,
            'latest_salary_slip' => $latestSlip,
            'current_month_earnings' => $currentMonthEarnings,
        ]);
    }

    public function getMyQueues(Request $request)
    {
        $user = $request->user();
        $barber = $user->barber;

        if (!$barber) {
            return response()->json(['message' => 'Barber not found'], 404);
        }

        $queues = $barber->queues()
            ->today()
            ->orderBy('created_at')
            ->get();

        return response()->json($queues);
    }

    public function getMySchedule(Request $request)
    {
        $user = $request->user();
        $barber = $user->barber;

        if (!$barber) {
            return response()->json(['message' => 'Barber not found'], 404);
        }

        $date = $request->get('date', today());

        $appointments = $barber->appointments()
            ->whereDate('appointment_date', $date)
            ->orderBy('appointment_time')
            ->get();

        return response()->json($appointments);
    }

    public function getEarningsReport(Request $request)
    {
        $user = $request->user();
        $barber = $user->barber;

        if (!$barber) {
            return response()->json(['message' => 'Barber not found'], 404);
        }

        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());

        $transactions = $barber->transactions()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->completed()
            ->selectRaw('DATE(created_at) as date, SUM(total_amount) as total, COUNT(*) as count')
            ->groupBy('date')
            ->get();

        $totalSales = $transactions->sum('total');
        $commission = ($totalSales * $barber->commission_rate) / 100;
        $totalSalary = $barber->salary + $commission;

        return response()->json([
            'period' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
            'daily_breakdown' => $transactions,
            'summary' => [
                'total_sales' => $totalSales,
                'commission_rate' => $barber->commission_rate,
                'commission_amount' => $commission,
                'base_salary' => $barber->salary,
                'total_earnings' => $totalSalary,
            ],
        ]);
    }
}
