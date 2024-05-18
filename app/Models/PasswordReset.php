<?php

namespace App\Models;

use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\Model;

class PasswordReset extends Model
{

    use Filterable;

    const UPDATED_AT = null;

    protected $table = "password_resets";

    protected  $fillable = [
        "email",
        "token",
    ];

    public function user()
    {
        return $this->hasOne(User::class, "email", "email");
    }
}
