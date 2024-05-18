<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolesSeeders::class);
        $this->call(PermissionsSeeders::class);
        $this->call(UsersSeeders::class);
    }
}
