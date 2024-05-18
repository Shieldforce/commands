<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

$model = "auth";

Route::prefix("/{$model}")
    ->controller( AuthController::class )
    ->name("api.{$model}.")->group(function () use ($model) {

    Route::get("/setupRoutes", "setupRoutes")
        ->name("setupRoutes")
        ->middleware(["ability:api.{$model}.setupRoutes", "roles:SA"]);

    Route::get("/verifyToken", "verifyToken")
        ->name("verifyToken")
        ->middleware(["ability:api.{$model}.verifyToken", "roles:all"]);

    Route::post("/logout", "logout")
        ->name("logout")
        ->middleware(["ability:api.{$model}.logout", "roles:all"]);

});


