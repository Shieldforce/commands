<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up()
    {
        Schema::create('permissions_roles', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger("permission_id");
            $table->foreign("permission_id")
                ->references("id")
                ->on("permissions")
                ->onDelete("cascade");

            $table->unsignedBigInteger("role_id");
            $table->foreign("role_id")
                ->references("id")
                ->on("roles")
                ->onDelete("cascade");

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('permissions_roles');
    }
};
