<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Appointment::with(['barber']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date')) {
            $query->whereDate('appointment_date', $request->date);
        }

        if ($request->has('barber_id')) {
            $query->where('barber_id', $request->barber_id);
        }

        // Filter for upcoming appointments (today onwards, pending/confirmed)
        if ($request->boolean('upcoming')) {
            $query->whereDate('appointment_date', '>=', today())
                  ->whereIn('status', ['pending', 'confirmed']);
        }

        $appointments = $query->orderBy('appointment_date')
                              ->orderBy('appointment_time')
                              ->paginate($request->per_page ?? 10);

        return response()->json($appointments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'barber_id' => 'nullable|exists:barbers,id',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'appointment_date' => 'required|date',
            'appointment_time' => 'required',
            'services' => 'required|array',
            'services.*' => 'exists:services,id',
            'notes' => 'nullable|string',
            'reminder_minutes' => 'nullable|integer|min:1|max:1440',
        ]);

        $appointment = Appointment::create([
            ...$validated,
            'reminder_minutes' => $validated['reminder_minutes'] ?? 10,
            'status' => 'pending',
        ]);

        return response()->json($appointment->load(['barber']), 201);
    }

    public function show(Appointment $appointment)
    {
        return response()->json($appointment->load(['barber']));
    }

    public function update(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'barber_id' => 'nullable|exists:barbers,id',
            'customer_name' => 'sometimes|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'appointment_date' => 'sometimes|date',
            'appointment_time' => 'sometimes',
            'services' => 'sometimes|array',
            'notes' => 'nullable|string',
        ]);

        $appointment->update($validated);

        return response()->json($appointment->load(['barber']));
    }

    public function updateStatus(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,completed,cancelled,no_show',
        ]);

        $appointment->update(['status' => $validated['status']]);

        return response()->json($appointment->load(['barber']));
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->delete();

        return response()->json(['message' => 'Appointment deleted successfully']);
    }

    public function getUpcoming()
    {
        $appointments = Appointment::with(['barber'])
            ->upcoming()
            ->orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->limit(10)
            ->get();

        return response()->json($appointments);
    }

    public function getReminders(Request $request)
    {
        // Ambil booking yang reminder-nya harus ditampilkan sekarang
        // (status pending/confirmed, belum di-remind, dan waktu reminder sudah lewat)
        $now = now();
        
        $appointments = Appointment::with(['barber'])
            ->whereIn('status', ['pending', 'confirmed'])
            ->whereNull('reminded_at')
            ->whereRaw("CONCAT(appointment_date, ' ', appointment_time) <= ?", 
                [$now->copy()->addMinutes(10)->format('Y-m-d H:i:s')])
            ->whereRaw("CONCAT(appointment_date, ' ', appointment_time) >= ?", 
                [$now->format('Y-m-d H:i:s')])
            ->orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->get();

        return response()->json($appointments);
    }

    public function markAsReminded(Appointment $appointment)
    {
        $appointment->update(['reminded_at' => now()]);
        return response()->json(['message' => 'Reminder marked']);
    }

    public function getAvailableSlots(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'barber_id' => 'nullable|exists:barbers,id',
        ]);

        $date = $request->date;
        $barberId = $request->barber_id;

        $openingTime = \App\Models\Setting::get('opening_time', '09:00');
        $closingTime = \App\Models\Setting::get('closing_time', '21:00');
        $interval = \App\Models\Setting::get('appointment_interval', 30);

        // Generate all possible slots
        $slots = [];
        $current = strtotime($openingTime);
        $end = strtotime($closingTime);

        while ($current < $end) {
            $slots[] = date('H:i', $current);
            $current += $interval * 60;
        }

        // Get booked slots
        $query = Appointment::whereDate('appointment_date', $date)
            ->whereIn('status', ['pending', 'confirmed']);

        if ($barberId) {
            $query->where('barber_id', $barberId);
        }

        $bookedSlots = $query->pluck('appointment_time')->map(function ($time) {
            return substr($time, 0, 5);
        })->toArray();

        // Mark available slots
        $availableSlots = array_map(function ($slot) use ($bookedSlots) {
            return [
                'time' => $slot,
                'available' => !in_array($slot, $bookedSlots),
            ];
        }, $slots);

        return response()->json($availableSlots);
    }
}
