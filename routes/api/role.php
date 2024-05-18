<?php

use App\Http\Controllers\Api\RoleController;
use Illuminate\Support\Facades\Route;

$model = "role";

Route::prefix("/{$model}")
    ->controller(RoleController::class)
    ->name("api.{$model}.")->group(function () use ($model) {

        Route::get("/", "index")
            ->name("index")
            ->middleware(["ability:api.{$model}.index", "roles:SA"]);

        Route::get("/{{$model}?}", "show")
            ->name("show")
            ->middleware(["ability:api.{$model}.show", "roles:SA"]);

        Route::post("/", "store")
            ->name("store")
            ->middleware(["ability:api.{$model}.store", "roles:SA"]);

        Route::put("/{{$model}?}", "update")
            ->name("update")
            ->middleware(["ability:api.{$model}.update", "roles:SA"]);

        Route::delete("/{{$model}?}", "destroy")
            ->name("destroy")
            ->middleware(["ability:api.{$model}.destroy", "roles:SA"]);

    });
