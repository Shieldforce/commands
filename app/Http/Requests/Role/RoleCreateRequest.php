<?php

namespace App\Http\Requests\Role;

use App\Models\Permission;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class RoleCreateRequest extends FormRequest
{

    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'name'               => ["required", "unique:roles"],
            'description'        => ["string"],
            "permissions_ids"    => ["required", "array", "in:".implode(",", Permission::pluck("id")->toArray())]
        ];
    }

    public function messages()
    {
        return [
            "permissions_ids.in" => "Permissões aceitas: ".implode(",", Permission::pluck("id")->toArray()),
        ];
    }
}
