<?php

namespace App\Http\Requests\User;

use App\Models\Role;
use App\Services\Auth\AllowClientsService;
use Illuminate\Foundation\Http\FormRequest;

class UserEditRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $unique = isset($this->user->id) ? "unique:users,email,".$this->user->id : "";
        $array = [
            'password'                => ['string', 'min:4'],
            "name"                    => ['string'],
            "email"                   => ['email', $unique],
            'picture'                 => [ "nullable", "string"],
            "client"                  => [ "in:" . AllowClientsService::getString() ],
            "roles_ids"               => [ "array", "in:".$this->rolesIdsExisting()]
        ];

        return $array;
    }

    public function messages()
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
