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
            'email'     => 'shieldforce2@gmail.com',
            'password'  => "@shieldforceforever",
            'client_id' => 'shieldforce'
        ];

        $data1b = $data1;

        unset($data1["password"]);

        if (!User::where("email", "shieldforce2@gmail.com")->first()) {
            $user1 = User::updateOrCreate($data1, $data1b);
            $user1->roles()->sync([1], true);
        }
    }
}
