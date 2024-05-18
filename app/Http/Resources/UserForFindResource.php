<?php

namespace App\Http\Resources;

use App\Http\Middleware\AclMiddleware;
use Illuminate\Http\Resources\Json\JsonResource;

class UserForFindResource extends JsonResource
{

    public function toArray($request)
    {
        $abilities = AclMiddleware::listUserPermissions($this->resource);
        return [
            'access_token'      => $request->bearerToken(),
            'id'                => $this->id,
            'name'              => $this->name,
            'email'             => $this->email,
            'roles'             => array_unique($this->roles->pluck("name")->toArray()),
            'permissions'       => $abilities,
            'picture'           => $this->picture,
            'created_at'        => $this->created_at->diffForHumans(),
            'updated_at'        => $this->updated_at->diffForHumans(),
        ];
    }
}
