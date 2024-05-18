#!/bin/bash

./vendor/bin/sail php artisan optimize
./vendor/bin/sail php artisan config:clear
./vendor/bin/sail php artisan cache:clear
./vendor/bin/sail php artisan migrate
./vendor/bin/sail php artisan db:seed --class=PermissionsSeeders
