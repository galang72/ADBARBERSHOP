<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'folder' => 'nullable|string',
        ]);

        $folder = $request->folder ?? 'uploads';
        $path = $request->file('file')->store($folder, 'public');

        return response()->json([
            'url' => asset('storage/' . $path),
            'path' => $path,
        ]);
    }
}
