<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/*
|--------------------------------------------------------------------------
| Post Model
|--------------------------------------------------------------------------
| Eloquent ORM model for the 'posts' table.
| Eloquent automatically maps snake_case column names to camelCase properties.
|
| Key Eloquent concepts:
|   $fillable  — mass-assignable fields (protection against mass-assignment attacks)
|   $casts     — auto-casts column values to PHP types
|   timestamps — Eloquent automatically manages created_at and updated_at
*/

class Post extends Model
{
    use HasFactory;

    protected $table = 'posts';

    // Only these fields can be mass-assigned (e.g. Post::create($request->all()))
    protected $fillable = [
        'title',
        'content',
        'author',
        'published',
    ];

    // Auto-cast: 'published' DB value (0/1) → PHP boolean (true/false)
    protected $casts = [
        'published'  => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
