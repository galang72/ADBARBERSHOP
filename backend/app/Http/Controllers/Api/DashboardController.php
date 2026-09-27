<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Product;
use App\Models\Queue;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Parse date range - default to today
        $startDate = $request->get('start_date', now()->toDateString());
        $endDate = $request->get('end_date', now()->toDateString());
        $previousStartDate = $request->get('previous_start_date');
        $previousEndDate = $request->get('previous_end_date');
        
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();
        
        // Calculate previous period for comparison if not provided
        if (!$previousStartDate || !$previousEndDate) {
            $daysDiff = $start->diffInDays($end) + 1;
            $previousStartDate = $start->copy()->subDays($daysDiff)->toDateString();
            $previousEndDate = $start->copy()->subDay()->toDateString();
        }
        
        $prevStart = Carbon::parse($previousStartDate)->startOfDay();
        $prevEnd = Carbon::parse($previousEndDate)->endOfDay();

        // Current period stats
        $currentStats = $this->getPeriodStats($start, $end);
        
        // Previous period stats for comparison
        $previousStats = $this->getPeriodStats($prevStart, $prevEnd);
        
        // Calculate trends (percentage change)
        $trends = $this->calculateTrends($currentStats, $previousStats);

        // Daily sales chart data (for the date range)
        $dailySales = $this->getDailySales($start, $end);
        
        // Extended chart data (30 days for trend view)
        $thirtyDaysSales = $this->getDailySales(
            now()->subDays(29)->startOfDay(),
            now()->endOfDay()
        );

        // Top services in period
        $topServices = DB::table('transaction_items')
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->whereBetween('transactions.created_at', [$start, $end])
            ->where('transactions.status', 'completed')
            ->where('transaction_items.item_type', 'service')
            ->select('transaction_items.item_name', 
                DB::raw('SUM(transaction_items.quantity) as total_qty'),
                DB::raw('SUM(transaction_items.total_price) as total_revenue')
            )
            ->groupBy('transaction_items.item_name')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get();

        // Top products in period
        $topProducts = DB::table('transaction_items')
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->whereBetween('transactions.created_at', [$start, $end])
            ->where('transactions.status', 'completed')
            ->where('transaction_items.item_type', 'product')
            ->select('transaction_items.item_name',
                DB::raw('SUM(transaction_items.quantity) as total_qty'),
                DB::raw('SUM(transaction_items.total_price) as total_revenue')
            )
            ->groupBy('transaction_items.item_name')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get();

        // Top barbers in period
        $topBarbers = DB::table('transactions')
            ->join('barbers', 'transactions.barber_id', '=', 'barbers.id')
            ->whereBetween('transactions.created_at', [$start, $end])
            ->where('transactions.status', 'completed')
            ->select(
                'barbers.name',
                DB::raw('COUNT(*) as total_transactions'),
                DB::raw('SUM(transactions.total_amount) as total_sales'),
                DB::raw('AVG(transactions.total_amount) as avg_transaction')
            )
            ->groupBy('barbers.id', 'barbers.name')
            ->orderByDesc('total_sales')
            ->limit(10)
            ->get();

        // Payment method breakdown
        $paymentMethods = Transaction::whereBetween('created_at', [$start, $end])
            ->completed()
            ->select(
                'payment_method',
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(total_amount) as total')
            )
            ->groupBy('payment_method')
            ->orderByDesc('total')
            ->get();

        // Hourly distribution (peak hours)
        $hourlyDistribution = Transaction::whereBetween('created_at', [$start, $end])
            ->completed()
            ->select(
                DB::raw('HOUR(created_at) as hour'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(total_amount) as sales')
            )
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        // Upcoming appointments
        $upcomingAppointments = Appointment::with(['barber'])
            ->where('appointment_date', '>=', today())
            ->whereIn('status', ['pending', 'confirmed'])
            ->orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->limit(5)
            ->get();

        // Low stock alerts
        $lowStockProducts = Product::whereRaw('stock <= min_stock')
            ->where('status', 'active')
            ->orderBy('stock')
            ->limit(5)
            ->get();

        return response()->json([
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'previous_start_date' => $previousStartDate,
                'previous_end_date' => $previousEndDate,
                'days' => $daysDiff ?? ($start->diffInDays($end) + 1),
            ],
            'current_stats' => $currentStats,
            'previous_stats' => $previousStats,
            'trends' => $trends,
            'daily_sales' => $dailySales,
            'thirty_days_sales' => $thirtyDaysSales,
            'top_services' => $topServices,
            'top_products' => $topProducts,
            'top_barbers' => $topBarbers,
            'payment_methods' => $paymentMethods,
            'hourly_distribution' => $hourlyDistribution,
            'upcoming_appointments' => $upcomingAppointments,
            'low_stock_products' => $lowStockProducts,
        ]);
    }

    private function getPeriodStats($start, $end)
    {
        $transactions = Transaction::whereBetween('created_at', [$start, $end])->completed();
        
        return [
            'sales' => $transactions->sum('total_amount'),
            'transactions_count' => $transactions->count(),
            'average_transaction' => $transactions->avg('total_amount') ?? 0,
            'total_items' => DB::table('transaction_items')
                ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
                ->whereBetween('transactions.created_at', [$start, $end])
                ->where('transactions.status', 'completed')
                ->sum('transaction_items.quantity'),
            'discounts_given' => $transactions->sum('discount_amount'),
            'tax_collected' => $transactions->sum('tax_amount'),
        ];
    }

    private function calculateTrends($current, $previous)
    {
        return [
            'sales' => [
                'value' => $this->calculatePercentageChange($previous['sales'], $current['sales']),
                'direction' => $current['sales'] >= $previous['sales'] ? 'up' : 'down',
                'absolute_change' => $current['sales'] - $previous['sales'],
            ],
            'transactions' => [
                'value' => $this->calculatePercentageChange($previous['transactions_count'], $current['transactions_count']),
                'direction' => $current['transactions_count'] >= $previous['transactions_count'] ? 'up' : 'down',
                'absolute_change' => $current['transactions_count'] - $previous['transactions_count'],
            ],
            'average_transaction' => [
                'value' => $this->calculatePercentageChange($previous['average_transaction'], $current['average_transaction']),
                'direction' => $current['average_transaction'] >= $previous['average_transaction'] ? 'up' : 'down',
            ],
        ];
    }

    private function calculatePercentageChange($old, $new)
    {
        if ($old == 0) {
            return $new > 0 ? 100 : 0;
        }
        return round((($new - $old) / $old) * 100, 1);
    }

    private function getDailySales($start, $end)
    {
        $sales = Transaction::whereBetween('created_at', [$start, $end])
            ->completed()
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as transactions'),
                DB::raw('SUM(total_amount) as sales')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // Fill in missing dates with zero
        $result = [];
        $current = $start->copy();
        while ($current <= $end) {
            $dateStr = $current->toDateString();
            $dayData = $sales->get($dateStr);
            $result[] = [
                'date' => $dateStr,
                'day' => $current->format('D'),
                'day_name' => $current->translatedFormat('l'),
                'sales' => $dayData ? (float) $dayData->sales : 0,
                'transactions' => $dayData ? (int) $dayData->transactions : 0,
            ];
            $current->addDay();
        }

        return $result;
    }

    public function getSalesReport(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $startDate = $request->start_date;
        $endDate = $request->end_date;
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        $today = now()->endOfDay();

        // Validate: cannot request future dates
        if ($start > $today) {
            return response()->json([
                'message' => 'Tanggal mulai (' . $startDate . ') belum dilewati. Tidak bisa melihat data masa depan.'
            ], 422);
        }

        if ($end > $today) {
            return response()->json([
                'message' => 'Tanggal akhir (' . $endDate . ') belum dilewati. Tidak bisa melihat data masa depan.'
            ], 422);
        }

        // Validate: max date range is 10 years (~3650 days)
        $maxDays = 3650;
        $diffDays = $start->diffInDays($end) + 1;
        
        if ($diffDays > $maxDays) {
            $years = round($diffDays / 365);
            return response()->json([
                'message' => 'Rentang waktu terlalu lama (' . $diffDays . ' hari / ~' . $years . ' tahun). ' .
                            'Maksimal ' . $maxDays . ' hari (~10 tahun). Silakan perkecil rentang tanggal.'
            ], 422);
        }

        // Daily breakdown - use start of day and end of day for proper date range
        $dailySales = Transaction::whereBetween('created_at', [$start->startOfDay(), $end->endOfDay()])
            ->completed()
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as transactions'),
                DB::raw('SUM(total_amount) as sales'),
                DB::raw('SUM(subtotal) as subtotal'),
                DB::raw('SUM(discount_amount) as discounts'),
                DB::raw('SUM(tax_amount) as tax')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Payment method breakdown - use start of day and end of day
        $paymentMethods = Transaction::whereBetween('created_at', [$start->startOfDay(), $end->endOfDay()])
            ->completed()
            ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as total'))
            ->groupBy('payment_method')
            ->get();

        // Category breakdown
        $categorySales = DB::table('transaction_items')
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->whereBetween('transactions.created_at', [$start->startOfDay(), $end->endOfDay()])
            ->where('transactions.status', 'completed')
            ->select('transaction_items.item_type', DB::raw('SUM(transaction_items.total_price) as total'))
            ->groupBy('transaction_items.item_type')
            ->get();

        return response()->json([
            'daily_sales' => $dailySales,
            'payment_methods' => $paymentMethods,
            'category_sales' => $categorySales,
            'summary' => [
                'total_sales' => $dailySales->sum('sales'),
                'total_transactions' => $dailySales->sum('transactions'),
                'total_discounts' => $dailySales->sum('discounts'),
                'total_tax' => $dailySales->sum('tax'),
            ],
        ]);
    }
}
