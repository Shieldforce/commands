<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ResetPasswordUpdateRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules() : array
    {
        return [
            "token"                   => [ "required", "string"],
            "password"                => [ 'required', 'string', 'min:4', 'confirmed'],
            'password_confirmation'   => [ 'required', 'string', 'min:4'],
        ];
    }

}
