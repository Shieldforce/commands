<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ResetPasswordRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules() : array
    {
        return [
            "email" => [ "required", "email", Rule::exists("users", "email") ],
        ];
    }

}
