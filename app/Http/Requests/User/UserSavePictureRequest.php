<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UserSavePictureRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $array = [
            'id'      => ['required'],
            "picture" => ['nullable'],
            "name"    => ['required', "string"],
        ];

        return $array;
    }

    public function messages()
    {
        return [];
    }
}
