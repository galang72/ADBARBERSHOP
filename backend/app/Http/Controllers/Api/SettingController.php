<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->groupBy('group');
        return response()->json($settings);
    }

    public function show($key)
    {
        $value = Setting::get($key);
        
        if ($value === null) {
            return response()->json(['message' => 'Setting not found'], 404);
        }

        return response()->json(['key' => $key, 'value' => $value]);
    }

    public function update(Request $request, $key)
    {
        // Only admin can update shop settings
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $validated = $request->validate([
            'value' => 'required',
            'type' => 'in:string,number,boolean,json',
            'group' => 'string|max:50',
            'label' => 'string|max:255',
            'description' => 'nullable|string',
        ]);

        $setting = Setting::set(
            $key,
            $validated['value'],
            $validated['type'] ?? 'string',
            $validated['group'] ?? 'general',
            $validated['label'] ?? null,
            $validated['description'] ?? null
        );

        return response()->json($setting);
    }

    public function updateBatch(Request $request)
    {
        // Only admin can update shop settings in batch
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable',
        ]);

        foreach ($validated['settings'] as $item) {
            $setting = Setting::where('key', $item['key'])->first();
            
            if ($setting) {
                // Update existing setting
                $storedValue = match ($setting->type) {
                    'boolean' => $item['value'] ? '1' : '0',
                    'json' => json_encode($item['value']),
                    default => (string) $item['value'],
                };
                
                $setting->update(['value' => $storedValue]);
            } else {
                // Create new setting
                Setting::create([
                    'key' => $item['key'],
                    'value' => (string) $item['value'],
                    'type' => 'string',
                    'group' => 'general',
                    'label' => $item['key'],
                ]);
            }
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }

    public function getPublicSettings()
    {
        $settings = Setting::whereIn('group', ['general', 'business_hours', 'branding'])
            ->orWhereIn('key', ['shop_name', 'shop_logo', 'shop_address', 'shop_phone'])
            ->get()
            ->mapWithKeys(function ($setting) {
                return [$setting->key => [
                    'value' => Setting::get($setting->key),
                    'type' => $setting->type,
                ]];
            });

        return response()->json($settings);
    }
}
