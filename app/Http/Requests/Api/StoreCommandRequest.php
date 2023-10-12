<?php

namespace app\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            "title"       => ['string', 'required'],
            "description" => ['string', 'required'],
            "group"       => ['string', 'required'],
        ];
    }
}
