<?php

namespace App\Http\Middleware;

use App\Exceptions\UnauthorizedException;
use App\Models\Permission;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;

class AclMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if($this->verifyRole($request->user(), "SA")) {
            return $next($request);
        }

        try {

            $user = $request->user();

            if(!$this->verifyPermission($user, $request->route()->getName())) {
                throw new UnauthorizedException("Unauthorized", 403);
            }

        } catch (UnauthorizedException $exception) {

            return response()->json([
                "error" => $exception->getMessage()
            ])->setStatusCode($exception->getCode());

        }

        return $next($request);
    }

    public function verifyRole(User $user, $role)
    {
        return (boolean) $user->roles?->where("name", $role)?->count();
    }

    public function verifyPermission(User $user, string $permission)
    {
        $rolesIds   = $user->roles?->pluck("id")?->toArray();
        $permission = Permission::where("name", $permission)->first();

        return (boolean) $permission->roles->whereIn("id", $rolesIds)->count();
    }

    public static function listUserPermissions(User $user)
    {
        $rolesNames   = $user->roles?->pluck("name")?->toArray();
        $permissions = Permission::whereHas("roles", function ($roles) use ($rolesNames) {
            $roles->whereIn("name", $rolesNames);
        })->pluck("name");
        return $permissions;
    }
}
