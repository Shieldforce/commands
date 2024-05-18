<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesSeeders extends Seeder
{
    public function run()
    {
        Role::updateOrCreate(['name'=>'SA',],['name'=>'SA',]);
        Role::updateOrCreate(['name' => 'User',],['name' => 'User',]);
    }
}
