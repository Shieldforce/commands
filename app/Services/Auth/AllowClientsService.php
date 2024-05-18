<?php

namespace App\Services\Auth;

class AllowClientsService
{
    public static function getArray()
    {
        return [
            "postman",
            "app",
            "front",
            "shieldforce"
        ];
    }

    public static function getString()
    {
        return implode("," , self::getArray());
    }
}
