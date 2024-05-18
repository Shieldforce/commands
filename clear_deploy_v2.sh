#!/bin/bash

docker exec -it laravel-php-fpm-8.2-55 php artisan optimize
docker exec -it laravel-php-fpm-8.2-55 php artisan config:clear
docker exec -it laravel-php-fpm-8.2-55 php artisan migrate --force
docker exec -it laravel-php-fpm-8.2-55 php artisan db:seed --class=PermissionsSeeders --force
docker exec -it laravel-php-fpm-8.2-55 php artisan horizon:install
docker exec -it laravel-php-fpm-8.2-55 php artisan horizon:publish
