<?php

namespace App\Models;

use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{

    use Filterable;

    protected  $fillable = [
        "name"
    ];

    /**
     * Relations
     */
    public function users()
    {
        return $this->belongsToMany(
            User::class,
            "users_roles",
            "role_id",
            "user_id",
        )->withPivot(["id", "role_id", "user_id"]);
    }

    public function permissions()
    {
        return $this->belongsToMany(
            Permission::class,
            "permissions_roles",
            "role_id",
            "permission_id",
        )->withPivot(["id", "role_id", "permission_id"]);
    }
}
