<?php

namespace Database\Seeders;

use App\Services\Routes\SetRoutesService;
use Illuminate\Database\Seeder;

class PermissionsSeeders extends Seeder
{
    public function run()
    {
        SetRoutesService::run();
    }
}
