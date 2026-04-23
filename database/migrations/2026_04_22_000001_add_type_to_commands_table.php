<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('commands', function (Blueprint $table) {
            $table->enum('type', ['command', 'task'])->default('command')->after('group');
        });
    }

    public function down(): void
    {
        Schema::table('commands', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
