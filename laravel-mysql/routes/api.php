<?php

use App\Http\Controllers\HealthController;
use App\Http\Controllers\PostController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| All routes defined here are automatically prefixed with /api by Laravel.
| So Route::get('/posts') becomes GET /api/posts
*/

// Health check endpoint
Route::get('/health', [HealthController::class, 'check']);

// Resource routes — generates all 5 CRUD routes automatically:
//   GET    /api/posts         → index()
//   POST   /api/posts         → store()
//   GET    /api/posts/{id}    → show()
//   PUT    /api/posts/{id}    → update()
//   DELETE /api/posts/{id}    → destroy()
Route::apiResource('posts', PostController::class);
