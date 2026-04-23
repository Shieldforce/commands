<?php

use App\Http\Controllers\Api\RoleController;
use Illuminate\Support\Facades\Route;

$model = "role";

Route::prefix("/{$model}")
    ->controller(RoleController::class)
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

        Route::delete("/{{$model}?}", "destroy")
            ->name("destroy")
            ->middleware(["roles:SA"]);
    });
