<?php

/*
|--------------------------------------------------------------------------
| Front Controller — public/index.php
|--------------------------------------------------------------------------
| All HTTP requests are routed through this single file.
| This is the "Front Controller" pattern used by all modern frameworks.
|
| nginx/apache rewrites all URLs to this file via .htaccess / try_files.
| In Docker we use the built-in PHP dev server with a router script.
*/

declare(strict_types=1);

// Load env vars from .env file (simple manual parser — no library needed)
$envFile = dirname(__DIR__) . '/.env';
if (file_exists($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (strpos($line, '#') === 0) continue; // skip comments
        if (strpos($line, '=') === false) continue;
        [$key, $value] = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($value);
        putenv(trim($key) . '=' . trim($value));
    }
}

// Auto-load our classes using PSR-4-style manual autoloader
spl_autoload_register(function (string $class): void {
    // Convert namespace to file path: App\Controllers\Foo → src/Controllers/Foo.php
    $prefix = 'App\\';
    $baseDir = dirname(__DIR__) . '/src/';
    if (strncmp($prefix, $class, strlen($prefix)) !== 0) return;
    $relativeClass = substr($class, strlen($prefix));
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';
    if (file_exists($file)) require $file;
});

// Set response headers — all responses are JSON
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');

// Boot the router and dispatch the request
use App\Router;
$router = new Router();

// ── Register routes ──────────────────────────────────────────────
$router->get('/health', ['App\Controllers\HealthController', 'check']);

// Students CRUD
$router->get('/api/students',          ['App\Controllers\StudentController', 'index']);
$router->post('/api/students',         ['App\Controllers\StudentController', 'store']);
$router->get('/api/students/{id}',     ['App\Controllers\StudentController', 'show']);
$router->put('/api/students/{id}',     ['App\Controllers\StudentController', 'update']);
$router->delete('/api/students/{id}',  ['App\Controllers\StudentController', 'destroy']);

// Dispatch current request
$router->dispatch(
    $_SERVER['REQUEST_METHOD'],
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH)
);
