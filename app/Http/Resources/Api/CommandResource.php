<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommandResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            "title"       => $this->title,
            "description" => $this->description,
            "group"       => $this->group,
            "groupData"   => $this->all()->groupBy("group")
        ];
    }
}
