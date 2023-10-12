<?php

use App\Http\Controllers\Api\CommandController;
use Illuminate\Support\Facades\Route;

Route::name("api.")/*->middleware('auth:sanctum')*/->group(function () {
    Route::name("command.")->prefix("command")->group(function () {
        Route::get("/{group?}", [ CommandController::class, "index" ])->name("index");
        Route::post("/", [ CommandController::class, "store" ])->name("store");
        Route::put("/{command}", [ CommandController::class, "update" ])->name("update");
        Route::delete("/{command}", [ CommandController::class, "delete" ])->name("delete");
    });
});
