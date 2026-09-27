<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Queue;
use Illuminate\Http\Request;

class QueueController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Queue::with(['barber']);

        // Jika user adalah barber, hanya tampilkan antrian yang ditugaskan ke barber tersebut
        if ($user->role === 'barber' && $user->barber) {
            $query->where('barber_id', $user->barber->id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date')) {
            if ($request->date === 'today') {
                $query->today();
            } else {
                // Format: YYYY-MM-DD
                $query->whereDate('created_at', $request->date);
            }
        } else {
            $query->today();
        }

        $queues = $query->orderBy('created_at')
                         ->paginate($request->per_page ?? 10);
        return response()->json($queues);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'barber_id' => 'nullable|exists:barbers,id',
            'customer_name' => 'required|string|max:255',
            'services' => 'required|array',
            'services.*' => 'exists:services,id',
            'notes' => 'nullable|string',
        ]);

        // Generate queue number
        $lastQueue = Queue::today()->orderBy('id', 'desc')->first();
        $prefix = \App\Models\Setting::get('queue_prefix', 'A');
        $nextNumber = $lastQueue ? intval(substr($lastQueue->queue_number, 1)) + 1 : 1;
        $queueNumber = $prefix . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

        $queue = Queue::create([
            ...$validated,
            'queue_number' => $queueNumber,
            'status' => 'waiting',
        ]);

        return response()->json($queue->load(['barber']), 201);
    }

    public function show(Queue $queue)
    {
        return response()->json($queue->load(['barber', 'transaction']));
    }

    public function update(Request $request, Queue $queue)
    {
        $validated = $request->validate([
            'barber_id' => 'nullable|exists:barbers,id',
            'services' => 'sometimes|array',
            'notes' => 'nullable|string',
        ]);

        $queue->update($validated);

        return response()->json($queue->load(['barber']));
    }

    public function updateStatus(Request $request, Queue $queue)
    {
        $validated = $request->validate([
            'status' => 'required|in:waiting,in_progress,completed,cancelled',
        ]);

        $updateData = ['status' => $validated['status']];

        switch ($validated['status']) {
            case 'in_progress':
                $updateData['started_at'] = now();
                break;
            case 'completed':
                $updateData['completed_at'] = now();
                break;
        }

        $queue->update($updateData);

        return response()->json($queue->load(['barber']));
    }

    public function callQueue(Queue $queue)
    {
        $queue->update(['called_at' => now()]);

        return response()->json($queue->load(['barber']));
    }

    public function destroy(Queue $queue)
    {
        $queue->delete();

        return response()->json(['message' => 'Queue deleted successfully']);
    }

    public function getTodayStats()
    {
        $stats = [
            'waiting' => Queue::today()->where('status', 'waiting')->count(),
            'in_progress' => Queue::today()->where('status', 'in_progress')->count(),
            'completed' => Queue::today()->where('status', 'completed')->count(),
            'cancelled' => Queue::today()->where('status', 'cancelled')->count(),
        ];

        return response()->json($stats);
    }

    public function getActiveQueues()
    {
        $queues = Queue::with(['barber'])
            ->today()
            ->whereIn('status', ['waiting', 'in_progress'])
            ->orderBy('created_at')
            ->get();

        return response()->json($queues);
    }
}
