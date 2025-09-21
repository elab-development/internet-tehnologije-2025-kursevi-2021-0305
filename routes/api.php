<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\VideoController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\API\ForgotPasswordController;
use App\Http\Controllers\API\ResetPasswordController;


Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login']);

Route::get('/forgot-password', [ForgotPasswordController::class,'getView'])->middleware('guest')->name('password.request');

Route::post('/forgot-password',[ForgotPasswordController::class,'sendResetLink']);

Route::get('/reset-password/{token}', [ResetPasswordController::class,'getView'])->middleware('guest')->name('password.reset');
 
Route::post('/reset-password', [ResetPasswordController::class, 'reset']);


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);



    
});
?>