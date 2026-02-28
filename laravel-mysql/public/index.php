<?php

/*
|--------------------------------------------------------------------------
| Laravel Public Entry Point
|--------------------------------------------------------------------------
| All HTTP requests enter the application through this file.
| It bootstraps Laravel and dispatches the request.
*/

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Load Composer's autoloader
require __DIR__.'/../vendor/autoload.php';

// Bootstrap the application
$app = require_once __DIR__.'/../bootstrap/app.php';

// Handle the request
$app->handleRequest(Request::capture());
