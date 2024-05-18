<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{

    protected  $fillable = [
        "name"
    ];

    /**
     * Relations
     */
    public function roles()
    {
        return $this->belongsToMany(
            Role::class,
            "permissions_roles",
            "permission_id",
            "role_id",
        )->withPivot(["id", "permission_id", "role_id"]);
    }
}
