<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Barber;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::with('barber')
            ->whereIn('role', ['admin', 'cashier', 'barber'])
            ->whereNull('deleted_at') // Hanya user yang belum dihapus
            ->orderBy('name')
            ->paginate($request->per_page ?? 10);
        return response()->json($users);
    }

    // Get all users including deleted for transaction history filter
    public function allForFilter(Request $request)
    {
        $users = User::withTrashed() // Include soft deleted users
            ->whereIn('role', ['admin', 'cashier', 'barber'])
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'deleted_at']);
        return response()->json($users);
    }

    // Get cashiers for transaction dropdown (only admin & cashier who can transact)
    public function getCashiers(Request $request)
    {
        $users = User::withTrashed() // Include soft deleted to show historical
            ->whereIn('role', ['admin', 'cashier']) // Only admin & cashier can transact
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'deleted_at', 'role']);
        return response()->json($users);
    }

    public function store(Request $request)
    {
        // Normalize email (lowercase untuk konsistensi)
        $email = strtolower($request->email);
        
        // Cek apakah email sudah ada pada user AKTIF (tidak dihapus)
        $activeUser = User::where('email', $email)->first();
        
        if ($activeUser) {
            // Jika user aktif sudah terverifikasi -> tolak
            if ($activeUser->email_verified_at !== null) {
                return response()->json([
                    'message' => 'Validasi gagal',
                    'errors' => [
                        'email' => ['Email ini sudah terdaftar dan terverifikasi. Gunakan email lain.']
                    ]
                ], 422);
            }
            
            // Jika user aktif belum terverifikasi -> hapus yang lama (force delete)
            if ($activeUser->barber) {
                $activeUser->barber->forceDelete();
            }
            $activeUser->forceDelete();
        }
        
        // Cek juga user yang sudah soft deleted
        $softDeletedUser = User::onlyTrashed()->where('email', $email)->first();
        if ($softDeletedUser) {
            // Hapus permanen user yang sudah di-soft-delete
            if ($softDeletedUser->barber) {
                $softDeletedUser->barber->forceDelete();
            }
            $softDeletedUser->forceDelete();
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:20',
            'role' => 'required|in:admin,cashier,barber',
            'password' => 'required|string|min:6',
            // Barber specific fields
            'specialties' => 'nullable|array',
            'bio' => 'nullable|string',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'salary' => 'nullable|numeric|min:0',
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'name.required' => 'Nama wajib diisi.',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal 6 karakter.',
            'role.required' => 'Role wajib dipilih.',
        ]);

        $verificationToken = Str::random(64);

        // Create user dengan email lowercase
        $user = User::create([
            'name' => $validated['name'],
            'email' => $email, // gunakan email yang sudah lowercase
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'status' => 'active',
            'email_verified_at' => null,
        ]);

        // If role is barber, create or update barber record
        if ($validated['role'] === 'barber') {
            // Cek apakah sudah ada barber dengan email ini
            $existingBarber = Barber::where('email', $email)->first();
            
            if ($existingBarber) {
                // Update barber yang sudah ada dengan user_id baru
                $existingBarber->update([
                    'user_id' => $user->id,
                    'name' => $validated['name'],
                    'phone' => $validated['phone'] ?? null,
                    'specialties' => $validated['specialties'] ?? [],
                    'bio' => $validated['bio'] ?? null,
                    'status' => 'active',
                    'commission_rate' => $validated['commission_rate'] ?? 30,
                    'salary' => $validated['salary'] ?? 0,
                ]);
            } else {
                // Create barber baru
                Barber::create([
                    'user_id' => $user->id,
                    'name' => $validated['name'],
                    'phone' => $validated['phone'] ?? null,
                    'email' => $email,
                    'specialties' => $validated['specialties'] ?? [],
                    'bio' => $validated['bio'] ?? null,
                    'status' => 'active',
                    'commission_rate' => $validated['commission_rate'] ?? 30,
                    'salary' => $validated['salary'] ?? 0,
                ]);
            }
        }

        // Send verification email
        $this->sendVerificationEmail($user, $verificationToken);

        return response()->json([
            'message' => 'Pengguna berhasil dibuat. Email verifikasi telah dikirim.',
            'user' => $user->load('barber'),
        ], 201);
    }

    public function show(User $user)
    {
        return response()->json($user->load('barber'));
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'status' => 'sometimes|in:active,inactive',
            'specialties' => 'nullable|array',
            'bio' => 'nullable|string',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'salary' => 'nullable|numeric|min:0',
        ], [
            'name.required' => 'Nama wajib diisi.',
        ]);

        $user->update([
            'name' => $validated['name'] ?? $user->name,
            'phone' => $validated['phone'] ?? $user->phone,
            'status' => $validated['status'] ?? $user->status,
        ]);

        if ($user->role === 'barber' && $user->barber) {
            $user->barber->update([
                'name' => $validated['name'] ?? $user->barber->name,
                'phone' => $validated['phone'] ?? $user->barber->phone,
                'specialties' => $validated['specialties'] ?? $user->barber->specialties,
                'bio' => $validated['bio'] ?? $user->barber->bio,
                'commission_rate' => $validated['commission_rate'] ?? $user->barber->commission_rate,
                'salary' => $validated['salary'] ?? $user->barber->salary,
            ]);
        }

        return response()->json([
            'message' => 'Pengguna berhasil diupdate',
            'user' => $user->load('barber'),
        ]);
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Tidak bisa menghapus diri sendiri'], 403);
        }

        // Soft delete - set status inactive dan deleted_at
        $user->update(['status' => 'inactive']);
        
        if ($user->barber) {
            $user->barber->update(['status' => 'inactive']);
        }

        $user->delete(); // Soft delete

        return response()->json(['message' => 'Pengguna berhasil dihapus (soft delete)']);
    }

    // Verifikasi email via token
    public function verifyEmail(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
        ]);

        $email = strtolower($request->email);
        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        // Jika sudah terverifikasi, tetap return success (biar user bisa lanjut login)
        if ($user->email_verified_at) {
            return response()->json([
                'message' => 'Email sudah diverifikasi',
                'already_verified' => true,
                'user' => $user
            ], 200);
        }

        $user->update(['email_verified_at' => now()]);

        // Kirim email welcome setelah verifikasi berhasil
        $this->sendWelcomeEmail($user);

        return response()->json([
            'message' => 'Email berhasil diverifikasi',
            'user' => $user
        ]);
    }

    // Kirim ulang email verifikasi
    public function resendVerification(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = strtolower($request->email);
        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Jika email terdaftar, kami telah mengirimkan link verifikasi.'
            ], 200);
        }

        // Jika sudah terverifikasi
        if ($user->email_verified_at) {
            return response()->json([
                'message' => 'Email sudah diverifikasi sebelumnya.'
            ], 200);
        }

        // Generate token baru dan kirim email
        $verificationToken = \Illuminate\Support\Str::random(64);
        $this->sendVerificationEmail($user, $verificationToken);

        return response()->json([
            'message' => 'Link verifikasi telah dikirim ulang ke email Anda.'
        ]);
    }

    private function sendVerificationEmail($user, $token)
    {
        $verificationUrl = config('app.frontend_url', 'http://192.168.100.27:3001') . '/verify-email?token=' . $token . '&email=' . urlencode($user->email);

        \Illuminate\Support\Facades\Mail::send('emails.verify-email', [
            'user' => $user,
            'verificationUrl' => $verificationUrl,
        ], function ($message) use ($user) {
            $message->to($user->email, $user->name)
                    ->subject('Verifikasi Email - ' . config('app.name', 'BarberShop'));
        });
    }

    private function sendWelcomeEmail($user)
    {
        $loginUrl = config('app.frontend_url', 'http://192.168.100.27:3001') . '/login';
        
        // Simplified subject
        $subject = 'Selamat Datang di ' . config('app.name', 'BarberShop');
        
        $data = [
            'user' => $user,
            'loginUrl' => $loginUrl,
        ];
        
        Mail::send('emails.welcome', $data, function ($message) use ($user, $subject) {
            $message->to($user->email, $user->name)
                    ->subject($subject);
        });
    }
}
