<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $email = strtolower($request->email);
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => ['Akun tidak aktif.'],
            ]);
        }

        if (!$user->email_verified_at) {
            throw ValidationException::withMessages([
                'email' => ['Email belum diverifikasi. Silakan cek email Anda untuk verifikasi.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|string',
        ]);

        $user->update($validated);

        return response()->json($user);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password saat ini salah.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Password berhasil diubah',
        ]);
    }

    // Forgot Password - Kirim email reset
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = strtolower($request->email);
        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Email tidak terdaftar'
            ], 404);
        }

        // Generate token reset (simpan di cache 60 menit)
        $token = \Illuminate\Support\Str::random(64);
        \Illuminate\Support\Facades\Cache::put('password_reset_' . $token, $user->email, 3600);

        // Kirim email reset password
        $resetUrl = config('app.frontend_url', 'http://192.168.100.27:3001') . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);
        
        \Illuminate\Support\Facades\Mail::send('emails.reset-password', [
            'user' => $user,
            'resetUrl' => $resetUrl,
        ], function ($message) use ($user) {
            $message->to($user->email, $user->name)
                    ->subject('Permintaan Reset Password - ' . config('app.name', 'BarberShop'));
        });

        return response()->json([
            'message' => 'Link reset password telah dikirim ke email Anda'
        ]);
    }

    // Reset Password - Update password baru
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $cachedEmail = \Illuminate\Support\Facades\Cache::get('password_reset_' . $request->token);
        $requestEmail = strtolower($request->email);

        if (!$cachedEmail || strtolower($cachedEmail) !== $requestEmail) {
            return response()->json([
                'message' => 'Token tidak valid atau sudah kadaluarsa'
            ], 400);
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        // Hapus token setelah digunakan
        \Illuminate\Support\Facades\Cache::forget('password_reset_' . $request->token);

        // Kirim email konfirmasi password berhasil diubah
        $this->sendPasswordChangedEmail($user);

        return response()->json([
            'message' => 'Password berhasil direset. Silakan login dengan password baru.'
        ]);
    }

    // Kirim email konfirmasi password berhasil diubah
    private function sendPasswordChangedEmail($user)
    {
        $loginUrl = config('app.frontend_url', 'http://192.168.100.27:3001') . '/login';

        \Illuminate\Support\Facades\Mail::send('emails.password-changed', [
            'user' => $user,
            'loginUrl' => $loginUrl,
        ], function ($message) use ($user) {
            $message->to($user->email, $user->name)
                    ->subject('Password Berhasil Diubah - ' . config('app.name', 'BarberShop'));
        });
    }
}
