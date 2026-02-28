<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use PDO;

class HealthController
{
    public function check(array $params = []): void
    {
        try {
            $pdo = Database::getInstance();
            $pdo->query('SELECT 1');

            http_response_code(200);
            echo json_encode([
                'status'    => 'ok',
                'database'  => 'ok',
                'timestamp' => date('c'),
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status'   => 'error',
                'database' => 'unreachable',
                'detail'   => $e->getMessage(),
            ]);
        }
    }
}
