<?php

use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

$model = "user";

Route::prefix("/{$model}")
    ->controller(UserController::class)
    ->name("api.{$model}.")->group(function () use ($model) {

    Route::get("/", "index")
        ->name("index")
        ->middleware(["roles:SA,admin"]);

    Route::get("/{{$model}?}", "show")
        ->name("show")
        ->middleware(["roles:SA,admin"]);

    Route::post("/", "store")
        ->name("store")
        ->middleware(["roles:SA,admin"]);

    Route::put("/{{$model}?}", "update")
        ->name("update")
        ->middleware(["roles:SA,admin"]);

    Route::post("/savePicture", "savePicture")
        ->name("savePicture")
        ->middleware(["roles:SA,admin"]);

    Route::delete("/{{$model}?}", "destroy")
        ->name("destroy")
        ->middleware(["roles:SA"]);
});
