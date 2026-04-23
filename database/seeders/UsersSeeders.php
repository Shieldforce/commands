<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UsersSeeders extends Seeder
{
    public function run()
    {
        $data1 = [
            'name'      => 'SA',
            'email'     => 'admin@admin.com',
            'password'  => env('ADMIN_SEED_PASSWORD', ''),
            'client_id' => 'client'
        ];

        $data1b = $data1;

        unset($data1["password"]);

        if (!User::where("email", "admin@admin.com")->first()) {
            $user1 = User::updateOrCreate($data1, $data1b);
            $user1->roles()->sync([1], true);
        }
    }
}
