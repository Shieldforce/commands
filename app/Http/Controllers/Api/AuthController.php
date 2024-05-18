<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AuthLoginRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Requests\ResetPasswordUpdateRequest;
use App\Http\Requests\User\UserCreatePublicRequest;
use App\Http\Resources\UserResource;
use App\Mail\ResetPasswordMail;
use App\Models\PasswordReset;
use App\Models\Role;
use App\Models\User;
use App\Services\Auth\LoginService;
use App\Services\Routes\SetRoutesService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{

    public function login(AuthLoginRequest $request)
    {
        return LoginService::handle($request);
    }

    public function verifyToken(Request $request)
    {
        return new UserResource($request->user());
    }

    public function logout(Request $request)
    {
        //$request->user()->tokens()->delete()
        return response()->json([
            'logout' => $request->user()->currentAccessToken()->delete()
        ]);
    }

    public function setupRoutes()
    {
        return response()->json([
            'setup' => SetRoutesService::run()
        ]);
    }

    public function register(UserCreatePublicRequest $request)
    {
        $create = User::create($request->validated());
        $rolesIds = array_values(Role::where("name", "User")->pluck("id")->toArray());
        $create->roles()->sync($rolesIds);
        return LoginService::handleRegister($request);
    }

    public function resetPasswordSend(ResetPasswordRequest $request)
    {
        $valid = $request->safe()->only(["email"]);
        Mail::to([$valid['email']])->queue(new ResetPasswordMail($valid['email']));
        return response()->json(true);
    }

    public function resetPassword(ResetPasswordUpdateRequest $request)
    {
        $valid         = $request->validated();
        $passwordReset = PasswordReset::where("token", $valid["token"])->first();

        if(!isset($passwordReset)) {
            throw new \Exception("Token inválido!!");
        }

        $current = Carbon::now();
        $expire  = $current->diffInHours($passwordReset->created_at);
        if ($expire > 1) {
            throw new \Exception("Token expirado!");
        }

        $user = $passwordReset->user;
        $user->update($request->safe()->only(["password"]));
        return LoginService::handleResetPasword($user, $valid["password"]);
    }
}
