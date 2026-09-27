<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Queue;
use App\Models\Service;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    // Check if user has access to transactions (admin or cashier only)
    private function checkTransactionAccess()
    {
        $user = auth()->user();
        if (!$user || !in_array($user->role, ['admin', 'cashier'])) {
            return response()->json([
                'message' => 'Akses ditolak. Hanya admin dan kasir yang dapat mengakses transaksi.'
            ], 403);
        }
        return null;
    }

    public function index(Request $request)
    {
        if ($response = $this->checkTransactionAccess()) return $response;
        
        // Get all transactions including users that may have been soft deleted
        $query = Transaction::with(['user' => function($q) {
            $q->withTrashed(); // Include soft deleted users
        }, 'barber', 'items']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date')) {
            if ($request->date === 'today') {
                $query->today();
            } else {
                $query->whereDate('created_at', $request->date);
            }
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [$request->start_date, $request->end_date]);
        }

        // Filter by user (optional) - include deleted users
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $transactions = $query->orderBy('created_at', 'desc')
                               ->paginate($request->per_page ?? 20);

        return response()->json($transactions);
    }

    public function store(Request $request)
    {
        if ($response = $this->checkTransactionAccess()) return $response;
        
        $validated = $request->validate([
            'barber_id' => 'nullable|exists:barbers,id',
            'queue_id' => 'nullable|exists:queues,id',
            'items' => 'required|array|min:1',
            'items.*.item_type' => 'required|in:service,product',
            'items.*.item_id' => 'required|integer',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string',
            'discount_amount' => 'numeric|min:0',
            'payment_method' => 'required|in:cash,debit,credit,qris,transfer',
            'paid_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            // Calculate totals
            $subtotal = 0;
            $items = [];

            foreach ($validated['items'] as $item) {
                if ($item['item_type'] === 'service') {
                    $service = Service::findOrFail($item['item_id']);
                    $unitPrice = $service->price;
                    $itemName = $service->name;
                } else {
                    $product = Product::findOrFail($item['item_id']);
                    $unitPrice = $product->price;
                    $itemName = $product->name;

                    // Reduce stock
                    $product->decrement('stock', $item['quantity']);
                }

                $totalPrice = $unitPrice * $item['quantity'];
                $subtotal += $totalPrice;

                $items[] = [
                    'item_type' => $item['item_type'],
                    'item_id' => $item['item_id'],
                    'item_name' => $itemName,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                    'notes' => $item['notes'] ?? null,
                ];
            }

            $discountAmount = $validated['discount_amount'] ?? 0;
            
            // Calculate tax
            $taxEnabled = \App\Models\Setting::get('enable_tax', false);
            $taxRate = $taxEnabled ? \App\Models\Setting::get('tax_rate', 0) : 0;
            $taxAmount = ($subtotal - $discountAmount) * ($taxRate / 100);
            
            $totalAmount = $subtotal - $discountAmount + $taxAmount;
            $paidAmount = $validated['paid_amount'];
            $changeAmount = $paidAmount - $totalAmount;

            // Create transaction
            $transaction = Transaction::create([
                'user_id' => $request->user()->id,
                'barber_id' => $validated['barber_id'] ?? null,
                'queue_id' => $validated['queue_id'] ?? null,
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
                'payment_method' => $validated['payment_method'],
                'paid_amount' => $paidAmount,
                'change_amount' => $changeAmount,
                'notes' => $validated['notes'] ?? null,
                'status' => 'completed',
            ]);

            // Create transaction items
            foreach ($items as $item) {
                $transaction->items()->create($item);
            }

            // Update queue status if provided
            if (!empty($validated['queue_id'])) {
                Queue::where('id', $validated['queue_id'])->update([
                    'status' => 'completed',
                    'completed_at' => now(),
                ]);
            }

            DB::commit();

            return response()->json($transaction->load(['barber', 'items']), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Transaction failed: ' . $e->getMessage()], 500);
        }
    }

    public function show(Transaction $transaction)
    {
        if ($response = $this->checkTransactionAccess()) return $response;
        
        return response()->json($transaction->load(['user', 'barber', 'queue', 'items']));
    }

    public function cancel(Request $request, Transaction $transaction)
    {
        if ($response = $this->checkTransactionAccess()) return $response;
        
        if ($transaction->status !== 'completed') {
            return response()->json(['message' => 'Transaction cannot be cancelled'], 400);
        }

        DB::beginTransaction();

        try {
            // Restore stock for products
            foreach ($transaction->items as $item) {
                if ($item->item_type === 'product') {
                    Product::where('id', $item->item_id)->increment('stock', $item->quantity);
                }
            }

            $transaction->update(['status' => 'cancelled']);

            DB::commit();

            return response()->json($transaction->load(['items']));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Cancel failed: ' . $e->getMessage()], 500);
        }
    }

    public function getTodayStats()
    {
        if ($response = $this->checkTransactionAccess()) return $response;
        
        $today = Transaction::today()->completed();

        return response()->json([
            'total_transactions' => $today->count(),
            'total_sales' => $today->sum('total_amount'),
            'total_items' => TransactionItem::whereHas('transaction', function ($q) {
                $q->today()->completed();
            })->sum('quantity'),
        ]);
    }

    public function getInvoice($invoiceNumber)
    {
        if ($response = $this->checkTransactionAccess()) return $response;
        
        $transaction = Transaction::with(['user', 'barber', 'items'])
            ->where('invoice_number', $invoiceNumber)
            ->firstOrFail();

        return response()->json($transaction);
    }
}
