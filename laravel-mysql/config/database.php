<?php

return [
    'default' => env('DB_CONNECTION', 'mysql'),
    'connections' => [
        'mysql' => [
            'driver'    => 'mysql',
            'host'      => env('DB_HOST', 'db'),
            'port'      => env('DB_PORT', '3306'),
            'database'  => env('DB_DATABASE', 'postsdb'),
            'username'  => env('DB_USERNAME', 'postuser'),
            'password'  => env('DB_PASSWORD', ''),
            'charset'   => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix'    => '',
            'strict'    => true,
            'engine'    => null,
        ],
    ],
    'migrations' => [
        'table'                => 'migrations',
        'update_date_on_publish' => true,
    ],
];
