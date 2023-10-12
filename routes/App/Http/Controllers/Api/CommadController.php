<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\Auth\CommandResource;
use Illuminate\Http\Request;

class CommadController
{
    public function index(Request  $request)
    {
        return CommandResource::collection();
    }
}
