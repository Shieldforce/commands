<?php

declare(strict_types=1);

namespace App\Services\Auth;

use App\Http\Requests\AuthLoginRequest;
use App\Http\Requests\User\UserCreatePublicRequest;
use App\Models\Permission;
use App\Models\User;
use App\Services\Routes\SetRoutesService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginService
{
    public static function handle(AuthLoginRequest $request)
    {
        $credentials = $request->only(["email", "password"]);

        if(!Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['Credênciais incorretas!.'],
            ]);
        }

        $user = $request->user();

        $user->tokens()->where("name", $request->client)->delete();

        SetRoutesService::run();

        $rolesIds = $user->roles()->get()->pluck("id")->toArray();

        $permissionsNames = Permission::whereHas("roles", function ($roles) use ($rolesIds) {
            $roles->where("role_id", $rolesIds);
        })->pluck("name")->toArray();

        $token = $user->createToken($request->client, array_values($permissionsNames));

        return [
            'type_token'   => 'Bearer',
            'access_token' => $token->plainTextToken,
            'expires_at'   => $token->expires_at ?? null,
            "user"         => $user
        ];
    }

    public static function handleRegister(UserCreatePublicRequest $request)
    {
        $credentials = $request->only(["email", "password"]);

        if(!Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['Credênciais incorretas!.'],
            ]);
        }

        $user = $request->user();

        $user->tokens()->where("name", $request->client)->delete();

        $token = $user->createToken($request->client, []);

        SetRoutesService::run();

        return [
            'type_token'   => 'Bearer',
            'access_token' => $token->plainTextToken,
            'expires_at'   => $token->expires_at ?? null,
            "user"         => $user
        ];
    }

    public static function handleResetPasword(User $user, string $password)
    {
        $credentials = [ "email" => $user->email, "password" => $password ];

        if(!Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['Credênciais incorretas!.'],
            ]);
        }

        $user->tokens()->delete();

        $token = $user->createToken("resetPassword", []);

        SetRoutesService::run();

        return [
            'type_token'   => 'Bearer',
            'access_token' => $token->plainTextToken,
            'expires_at'   => $token->expires_at ?? null,
            "user"         => $user
        ];
    }
}
