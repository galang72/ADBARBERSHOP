<?php

use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BarberController;

use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\QueueController;
use App\Http\Controllers\Api\SalarySlipController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-email', [UserController::class, 'verifyEmail']);
Route::post('/resend-verification', [UserController::class, 'resendVerification']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::get('/settings/public', [SettingController::class, 'getPublicSettings']);
Route::post('/upload', [UploadController::class, 'upload']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/sales-report', [DashboardController::class, 'getSalesReport']);

    // Barbers - List only (readonly)
    Route::get('/barbers/active', [BarberController::class, 'getActive']);
    Route::get('/barbers/dashboard', [BarberController::class, 'getDashboard']);
    Route::get('/barbers/my-queues', [BarberController::class, 'getMyQueues']);
    Route::get('/barbers/my-schedule', [BarberController::class, 'getMySchedule']);
    Route::get('/barbers/earnings', [BarberController::class, 'getEarningsReport']);
    Route::apiResource('barbers', BarberController::class)->only(['index', 'show']);

    // Services
    Route::get('/services/active', [ServiceController::class, 'getActive']);
    Route::get('/services/category/{category}', [ServiceController::class, 'getByCategory']);
    Route::apiResource('services', ServiceController::class);

    // Products
    Route::get('/products/active', [ProductController::class, 'getActive']);
    Route::put('/products/{product}/stock', [ProductController::class, 'updateStock']);
    Route::apiResource('products', ProductController::class);

    // Queue
    Route::get('/queues/stats/today', [QueueController::class, 'getTodayStats']);
    Route::get('/queues/active', [QueueController::class, 'getActiveQueues']);
    Route::put('/queues/{queue}/status', [QueueController::class, 'updateStatus']);
    Route::post('/queues/{queue}/call', [QueueController::class, 'callQueue']);
    Route::apiResource('queues', QueueController::class);

    // Appointments
    Route::get('/appointments/upcoming', [AppointmentController::class, 'getUpcoming']);
    Route::get('/appointments/reminders', [AppointmentController::class, 'getReminders']);
    Route::post('/appointments/{appointment}/remind', [AppointmentController::class, 'markAsReminded']);
    Route::get('/appointments/available-slots', [AppointmentController::class, 'getAvailableSlots']);
    Route::put('/appointments/{appointment}/status', [AppointmentController::class, 'updateStatus']);
    Route::apiResource('appointments', AppointmentController::class);

    // Transactions
    Route::get('/transactions/stats/today', [TransactionController::class, 'getTodayStats']);
    Route::get('/transactions/invoice/{invoiceNumber}', [TransactionController::class, 'getInvoice']);
    Route::post('/transactions/{transaction}/cancel', [TransactionController::class, 'cancel']);
    Route::apiResource('transactions', TransactionController::class);

    // Settings
    Route::post('/settings/batch', [SettingController::class, 'updateBatch']);
    Route::apiResource('settings', SettingController::class)->only(['index', 'show', 'update']);

    // Users Management (Admin only) - Full CRUD including barber creation
    Route::get('/users/all-for-filter', [UserController::class, 'allForFilter']);
    Route::get('/users/cashiers', [UserController::class, 'getCashiers']);
    Route::post('/users/{user}/reset-password', [UserController::class, 'resetPassword']);
    Route::post('/users/{user}/resend-verification', [UserController::class, 'resendVerification']);
    Route::apiResource('users', UserController::class);

    // Salary Slips - Payroll Management
    // Barber routes (own slips only)
    Route::get('/my-salary-slips', [SalarySlipController::class, 'mySlips']);
    Route::get('/my-salary-slips/{id}', [SalarySlipController::class, 'mySlipDetail']);
    Route::get('/my-salary-slips/{id}/pdf', [SalarySlipController::class, 'downloadPdf']);
    Route::get('/my-salary-statistics', [SalarySlipController::class, 'statistics']);
    
    // Admin routes (all slips management)
    Route::get('/salary-slips/statistics', [SalarySlipController::class, 'statistics']);
    Route::get('/salary-slips/available-years', [SalarySlipController::class, 'availableYears']);
    Route::post('/salary-slips/generate', [SalarySlipController::class, 'generate']);
    Route::post('/salary-slips/{id}/approve', [SalarySlipController::class, 'approve']);
    Route::post('/salary-slips/{id}/pay', [SalarySlipController::class, 'markAsPaid']);
    Route::get('/salary-slips/{id}/pdf', [SalarySlipController::class, 'downloadPdf']);
    Route::apiResource('salary-slips', SalarySlipController::class);
});
