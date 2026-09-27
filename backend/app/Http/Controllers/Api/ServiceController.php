<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    // Check if user is barber and deny access to modify operations
    private function checkBarberAccess()
    {
        if (auth()->user()?->role === 'barber') {
            return response()->json([
                'message' => 'Akses ditolak. Barber hanya dapat melihat data layanan.'
            ], 403);
        }
        return null;
    }

    public function index()
    {
        $services = Service::orderBy('category')->orderBy('name')->get();
        return response()->json($services);
    }

    public function store(Request $request)
    {
        if ($response = $this->checkBarberAccess()) return $response;
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'photo' => 'nullable|string',
            'icon' => 'nullable|string|max:50',
            'price' => 'required|numeric|min:0',
            'duration_minutes' => 'integer|min:5',
            'category' => 'string|max:50',
            'status' => 'in:active,inactive',
        ]);

        $service = Service::create($validated);

        return response()->json($service, 201);
    }

    public function show(Service $service)
    {
        return response()->json($service);
    }

    public function update(Request $request, Service $service)
    {
        if ($response = $this->checkBarberAccess()) return $response;
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'photo' => 'nullable|string',
            'icon' => 'nullable|string|max:50',
            'price' => 'sometimes|numeric|min:0',
            'duration_minutes' => 'integer|min:5',
            'category' => 'string|max:50',
            'status' => 'in:active,inactive',
        ]);

        $service->update($validated);

        return response()->json($service);
    }

    public function destroy(Service $service)
    {
        if ($response = $this->checkBarberAccess()) return $response;
        
        $service->delete();

        return response()->json(['message' => 'Service deleted successfully']);
    }

    public function getActive()
    {
        $services = Service::where('status', 'active')->orderBy('name')->get();
        return response()->json($services);
    }

    public function getByCategory($category)
    {
        $services = Service::where('category', $category)
            ->where('status', 'active')
            ->orderBy('name')
            ->get();
        return response()->json($services);
    }
}
