<?php

namespace App\Services\RateLimit;

use Illuminate\Support\Facades\RateLimiter;
use Mockery\Exception;

class ErrorRateLimitService
{
    public static function run($key, $attempts = 1, $decayRateSeconds = 21600)
    {
        $executed = RateLimiter::attempt(
            $key,
            $attempts,
            function () {
                //
            },
            $decayRateSeconds
        );

        if (!$executed) {
            $seconds = RateLimiter::availableIn($key);
            $minutes = $seconds / 60;
            $hours = $minutes / 60;
            $time = $seconds;
            $text = "segundos";

            if ((int)$minutes > 0) {
                $time = $minutes;
                $text = "minutos";
            }

            if ((int)$hours > 0) {
                $time = $hours;
                $text = "horas";
            }
            $time = intval($time);
            throw new Exception("Tente novamente em {$time} {$text}");
        }
    }
}
