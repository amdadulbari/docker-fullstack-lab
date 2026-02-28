<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
|--------------------------------------------------------------------------
| Create Posts Table Migration
|--------------------------------------------------------------------------
| Laravel migrations are version control for your database schema.
| Run with: php artisan migrate
*/

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();                                           // Auto-increment primary key
            $table->string('title', 255);                          // Post title
            $table->text('content');                               // Post body
            $table->string('author', 100)->default('Anonymous');   // Author name
            $table->boolean('published')->default(false);          // Draft or published
            $table->timestamps();                                   // created_at + updated_at (auto)
        });
    }

    public function down(): void
    {
        // down() undoes the migration (for rollback: php artisan migrate:rollback)
        Schema::dropIfExists('posts');
    }
};
