<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('docs_items', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger("doc_id");
            $table->foreign("doc_id")
            ->references("id")
            ->on("docs")
            ->onDelete("cascade");

            $table->string("title");
            $table->longText("content");
            $table->integer("type");
            $table->string("url")->nullable();
            $table->integer("port")->nullable();
            $table->string("user")->nullable();
            $table->string("password")->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('docs_items');
    }
};
