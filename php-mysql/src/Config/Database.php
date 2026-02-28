<?php

/*
|--------------------------------------------------------------------------
| Database — src/Config/Database.php
|--------------------------------------------------------------------------
| PDO (PHP Data Objects) is the standard way to connect to databases in PHP.
| It provides a consistent interface regardless of which database you use.
|
| Singleton pattern: one PDO connection shared across the whole request.
| Creating a new connection per query would be slow and wasteful.
*/

declare(strict_types=1);

namespace App\Config;

use PDO;
use PDOException;

class Database
{
    private static ?PDO $instance = null;

    // Private constructor — prevents direct instantiation (use getInstance())
    private function __construct() {}

    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            $host     = $_ENV['DB_HOST']     ?? 'db';
            $port     = $_ENV['DB_PORT']     ?? '3306';
            $dbName   = $_ENV['DB_NAME']     ?? 'studentsdb';
            $user     = $_ENV['DB_USER']     ?? 'root';
            $password = $_ENV['DB_PASSWORD'] ?? '';

            // DSN: Data Source Name — tells PDO how to connect
            $dsn = "mysql:host={$host};port={$port};dbname={$dbName};charset=utf8mb4";

            try {
                self::$instance = new PDO($dsn, $user, $password, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,  // throw exceptions on error
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,        // fetch as associative array
                    PDO::ATTR_EMULATE_PREPARES   => false,                   // use real prepared statements
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
                exit(1);
            }
        }

        return self::$instance;
    }
}
