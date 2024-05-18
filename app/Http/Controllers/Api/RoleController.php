<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Role\RoleCreateRequest;
use App\Http\Requests\Role\RoleEditRequest;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{

    public function index(Request $request)
    {
        return RoleResource::collection(
            Role::orderBy('created_at', 'desc')
                ->filter($request->all())->paginate()
        );
    }

    public function show(Role $role)
    {
        return new RoleResource($role);
    }

    public function store(RoleCreateRequest $request)
    {
        $data = $request->validated();
        $create = Role::updateOrCreate([ "name"=> $request->name ], $data );
        $create->permissions()->sync($request->permissions_ids);
        return new RoleResource($create);
    }

    public function update(RoleEditRequest $request, Role $role)
    {
        $data = $request->validated();
        $role->update( $data );
        if(isset($request->permissions_ids)) {
            $role->permissions()->sync($request->permissions_ids);
        }
        return new RoleResource($role);
    }

    public function destroy(Role $role)
    {
        return $role::destroy($role->id);
    }
}
