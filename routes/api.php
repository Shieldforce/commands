<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

Route::post('/login', [ AuthController::class, "login" ])->name("api.login");
Route::post('/register', [ AuthController::class, "register" ])->name("api.register");
Route::post("/resetPasswordSend", [ AuthController::class, "resetPasswordSend" ])->name("resetPasswordSend");
Route::post("/resetPassword", [ AuthController::class, "resetPassword" ])->name("resetPassword");

Route::middleware(['auth:sanctum', 'acl', 'auth'])->group(function () {

    foreach (File::allFiles(__DIR__ . '/api') as $route_file) {
        require $route_file->getPathname();
    }

});
