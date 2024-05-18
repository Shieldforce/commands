<?php

namespace App\Http\Requests\Role;

use App\Models\Permission;
use Illuminate\Foundation\Http\FormRequest;

class RoleEditRequest extends FormRequest
{

    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $array = [
            "name" => ['string', "unique:roles,id,".$this->role->id],
            'description' => ["string"],
            'approver' => ["boolean"],
            "permissions_ids"  => ["array", "in:".implode(",", Permission::pluck("id")->toArray())]
        ];

        return $array;
    }

    public function messages()
    {
        return [
            "permissions_ids.in" => "Permissões aceitas: ".implode(",", Permission::pluck("id")->toArray()),
        ];
    }
}
