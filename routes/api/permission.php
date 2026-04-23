<?php

use App\Http\Controllers\Api\PermissionController;
use Illuminate\Support\Facades\Route;

Route::prefix('/permission')
    ->controller(PermissionController::class)
    ->name('api.permission.')
    ->group(function () {
        Route::get('/', 'index')
            ->name('index')
            ->middleware(['roles:SA,admin']);
    });
