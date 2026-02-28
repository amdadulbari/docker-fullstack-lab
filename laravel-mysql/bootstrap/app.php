<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

/*
|--------------------------------------------------------------------------
| Create The Application
|--------------------------------------------------------------------------
| Laravel 11 uses a simplified bootstrap/app.php (no separate Kernel files).
| All routing, middleware, and exception handling is configured here.
*/

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        health: '/health',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // No special middleware needed for a simple API
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Return JSON errors for API requests
        $exceptions->render(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Resource not found'], 404);
        });
    })->create();
