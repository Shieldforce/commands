#!/bin/bash

php artisan optimize
php artisan config:clear
php artisan migrate --force
php artisan db:seed --class=PermissionsSeeders --force
php artisan horizon:install
php artisan horizon:publish
