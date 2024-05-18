<?php

namespace App\Http\Requests\User;

use App\Services\Auth\AllowClientsService;
use Illuminate\Foundation\Http\FormRequest;

class UserCreatePublicRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules() : array
    {
        return [
            'name'                    => [ "required", "string",],
            'email'                   => [ "required", "email", 'max:255', 'unique:users'],
            'picture'                 => [ "nullable", "string"],
            "password"                => [ 'required', 'string', 'min:4', 'confirmed'],
            'password_confirmation'   => [ 'required', 'string', 'min:4'],
            "client"                  => [ "required", "in:" . AllowClientsService::getString() ],
        ];
    }

    public function messages() : array
    {
        return [
            "client.in"       => "Tipos de clientes permitidos: " . AllowClientsService::getString(),
        ];
    }
}
