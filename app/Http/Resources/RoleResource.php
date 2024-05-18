<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'                        => $this->id,
            'name'                      => $this->name,
            "permissions_ids"           => $this->permissions->pluck("id"),
            "permissions_descriptions"  => $this->permissions->pluck("name"),
            'created_at'                => $this->created_at->diffForHumans(),
            'updated_at'                => $this->updated_at->diffForHumans(),
        ];
    }
}
