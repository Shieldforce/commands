<?php

use App\Http\Controllers\Api\CommandController;
use Illuminate\Support\Facades\Route;

$model = "command";

Route::prefix("/{$model}")
    ->controller(CommandController::class)
    ->name("api.{$model}.")->group(function () use ($model) {

        Route::get("/{group?}/{type?}", "index")
            ->name("index")
            ->middleware(["ability:api.{$model}.index", "roles:all"]);

        Route::post("/", "store")
            ->name("store")
            ->middleware(["ability:api.{$model}.store", "roles:all"]);

        Route::put("/{command}", "update")
            ->name("update")
            ->middleware(["ability:api.{$model}.update", "roles:all"]);

        Route::delete("/{command}", "delete")
            ->name("delete")
            ->middleware(["ability:api.{$model}.delete", "roles:all"]);

    });
