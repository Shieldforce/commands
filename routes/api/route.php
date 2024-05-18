<?php

use App\Http\Controllers\Api\RouteController;
use Illuminate\Support\Facades\Route;

$model = "route";

Route::prefix("/{$model}")
    ->controller( RouteController::class )
    ->name("api.{$model}.")->group(function () use ($model) {

    Route::get("/","index")
        ->name("index")
        ->middleware("roles:SA");

});
