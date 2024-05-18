<?php

use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

$model = "user";

Route::prefix("/{$model}")
    ->controller( UserController::class )
    ->name("api.{$model}.")->group(function () use ($model) {

    Route::get("/", "index")
        ->name("index")
        ->middleware(["ability:api.{$model}.index", "roles:all"]);

    Route::get("/{{$model}?}", "show")
        ->name("show")
        ->middleware(["ability:api.{$model}.index", "roles:all"]);

    Route::post("/", "store")
        ->name("store")
        ->middleware("roles:all");

    Route::put("/{{$model}?}", "update")
        ->name("update")
        ->middleware(["ability:api.{$model}.index", "roles:all"]);

    Route::post("/savePicture", "savePicture")
        ->name("savePicture")
        ->middleware(["ability:api.{$model}.index", "roles:all"]);

    Route::delete("/{{$model}?}", "destroy")
        ->name("destroy")
        ->middleware(["ability:api.{$model}.index", "roles:SA"]);

});
