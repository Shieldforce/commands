<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        return $next($request)
            ->header("Access-Control-Allow-Origin", "*")
            ->header('Content-Type', '*')
            ->header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
            ->header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS")
            ->header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers,Content-Type, Access-Control-Allow-Methods, Authorization")
            ->header('Access-Control-Allow-Origin', '*/*')
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    }
}
