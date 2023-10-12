<?php

namespace app\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCommandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return false;
    }

    public function rules(): array
    {
        return [
            "title"       => ['string'],
            "description" => ['string'],
            "group"       => ['string'],
        ];
    }
}
