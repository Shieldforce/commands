<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permission;

class RouteController extends Controller
{
    public function index()
    {
        try {
            return response()->json([
                "data" => Permission::get(["name"])->groupBY("group")
            ]);
        } catch (\Exception $exception) {
            return response()->json(["message"=>$exception->getMessage()]);
        }
    }
}
