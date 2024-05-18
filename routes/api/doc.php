<?php

use App\Http\Controllers\Api\DocController;
use Illuminate\Support\Facades\Route;

$model = "doc";

Route::prefix("/{$model}")
    ->controller(DocController::class)
    ->name("api.{$model}.")->group(function () use ($model) {

        Route::get("/", "index")
            ->name("index")
            ->middleware(["ability:api.{$model}.index", "roles:all"]);

        Route::get("/{doc}", "show")
             ->name("show")
             ->middleware(["ability:api.{$model}.show", "roles:all"]);

        Route::post("/", "store")
            ->name("store")
            ->middleware(["ability:api.{$model}.store", "roles:all"]);

        Route::put("/{doc}", "update")
            ->name("update")
            ->middleware(["ability:api.{$model}.update", "roles:all"]);

        Route::delete("/{doc}", "delete")
            ->name("delete")
            ->middleware(["ability:api.{$model}.delete", "roles:all"]);

    });
