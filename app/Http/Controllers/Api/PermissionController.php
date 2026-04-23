<?php

namespace App\Http\Controllers\Api;

use App\Models\Permission;
use Illuminate\Http\Request;

class PermissionController
{
    public function index(Request $request)
    {
        $permissions = Permission::with('roles')
            ->orderBy('name')
            ->get()
            ->map(fn($p) => [
                'id'        => $p->id,
                'name'      => $p->name,
                'roles'     => $p->roles->pluck('name'),
                'roles_ids' => $p->roles->pluck('id'),
            ]);

        return response()->json(['data' => $permissions]);
    }
}
