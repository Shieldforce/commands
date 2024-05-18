<?php

namespace App\Services\Routes;

use App\Models\Permission;
use App\Models\Role;
use Exception;
use Illuminate\Support\Facades\Route;

class SetRoutesService
{

    public static function run()
    {
        return self::updateOrCreateRoutesInPermissions();
    }

    private static function routesInMiddleareSactum()
    {
        $arrayNew = [];
        $routes = Route::getRoutes()->getRoutes();
        foreach ($routes as $route) {
            if(in_array("auth:sanctum", array_values($route->middleware()))) {
                $arrayNew[] = $route;
            }
        }
        return $arrayNew;
    }

    private static function updateOrCreateRoutesInPermissions()
    {
        try {
            $routes = self::routesInMiddleareSactum();
            $idsNotDelete = [];
            foreach ($routes as $route) {

                if($route->getName()=="api.login") {
                    continue;
                }

                $permission = Permission::updateOrCreate([
                    "name" => $route->getName()
                ], [
                    "name" => $route->getName()
                ]);

                if(self::getRolesIds($route)) {
                    $routesIds = Role::whereIn("id", self::getRolesIds($route))->pluck("id")->toArray();
                    $permission->roles()->sync($routesIds, true);
                }

                $idsNotDelete[] = $permission->id;
            }
            Permission::whereNotIn("id", $idsNotDelete)->delete();
            return true;
        } catch (Exception $exception) {
            throw new Exception($exception->getMessage());
        }
    }

    private static function getRolesIds($route)
    {
        $middlewares    = $route->middleware();
        $filterNull     = self::filterNull($middlewares, $route);
        $filterAll      = self::filterAll($middlewares);
        $filterRoles    = self::filterRoles($middlewares, $route);
        return $filterNull ?? $filterAll ?? $filterRoles ?? [];
    }

    private static function filterNull($middlewares, $route)
    {
        $filterRolesNull = array_filter($middlewares, function ($midleware) {
            return strpos($midleware, "roles:null") !== false;
        });

        if($filterRolesNull) {
            $permission = Permission::where("name", $route->getName())->first();
            $permission->roles()->sync([], true);
            return [];
        }

        return null;
    }

    private static function filterAll($middlewares)
    {
        $filterRolesAll = array_filter($middlewares, function ($midleware) {
            return strpos($midleware, "roles:all") !== false;
        });

        if($filterRolesAll) {
            return array_values(Role::pluck("id")->toArray());
        }

        return null;
    }

    private static function filterRoles($middlewares, $route)
    {
        $filterRoles    = array_filter($middlewares, function ($midleware) {
            return strpos($midleware, "roles:") !== false;
        });

        if ($filterRoles) {

            $permission        = Permission::where("name", $route->getName())->first();
            $rolesIdsDB        = array_values($permission->roles->pluck("id")->toArray());
            $deleteRoleString  = str_replace("roles:", "", end($filterRoles));
            $rolesNames        = explode(",", $deleteRoleString);
            $rolesIdsRoute     = array_values(Role::whereIn("name", $rolesNames)->pluck("id")->toArray());
            $rolesAllIds       = array_merge($rolesIdsDB, $rolesIdsRoute);
            return array_values(array_unique($rolesAllIds));
        }

        return null;
    }
}
