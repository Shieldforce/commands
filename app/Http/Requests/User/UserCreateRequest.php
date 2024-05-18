<?php

namespace App\Http\Requests\User;

use App\Models\Role;
use App\Services\Auth\AllowClientsService;
use Illuminate\Foundation\Http\FormRequest;

class UserCreateRequest extends FormRequest
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
            "roles_ids"               => [ "required", "array", "in:".$this->rolesIdsExisting()]
        ];
    }

    public function messages() : array
    {
        return [
            "client.in"       => "Tipos de clientes permitidos: " . AllowClientsService::getString(),
            "roles_ids.in"    => "Tipos de roles ids permitidos: " .$this->rolesIdsExisting(),
        ];
    }

    private function rolesIdsExisting() : string
    {
        $arrayValues = array_values(Role::pluck("id")->toArray());
        return implode(",", $arrayValues);
    }
}
