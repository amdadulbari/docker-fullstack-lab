<?php

/*
|--------------------------------------------------------------------------
| Student Model — src/Models/Student.php
|--------------------------------------------------------------------------
| Data Access Object (DAO) for the students table.
| All SQL queries are written here. Controllers never touch SQL directly.
|
| Using PDO prepared statements (bindParam/execute) prevents SQL injection.
| NEVER use string concatenation to build SQL queries with user input!
*/

declare(strict_types=1);

namespace App\Models;

use App\Config\Database;
use PDO;

class Student
{
    private PDO $db;

    public function __construct()
    {
        // Get the shared PDO connection
        $this->db = Database::getInstance();
    }

    /** Create the students table if it doesn't exist */
    public function createTable(): void
    {
        $this->db->exec("
            CREATE TABLE IF NOT EXISTS students (
                id          INT AUTO_INCREMENT PRIMARY KEY,
                name        VARCHAR(100) NOT NULL,
                email       VARCHAR(200) NOT NULL UNIQUE,
                grade       ENUM('A', 'B', 'C', 'D', 'F') DEFAULT 'C',
                enrolled    TINYINT(1)   DEFAULT 1,
                created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
                updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ");
    }

    /** Fetch all students */
    public function findAll(): array
    {
        $stmt = $this->db->query('SELECT * FROM students ORDER BY created_at DESC');
        return $stmt->fetchAll();
    }

    /** Fetch one student by ID */
    public function findById(int $id): array|false
    {
        // Prepared statement: ? is a placeholder, never interpolate $id directly
        $stmt = $this->db->prepare('SELECT * FROM students WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    /** Insert a new student */
    public function create(array $data): array
    {
        $stmt = $this->db->prepare(
            'INSERT INTO students (name, email, grade, enrolled) VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['name'],
            $data['email'],
            $data['grade'] ?? 'C',
            isset($data['enrolled']) ? (int)$data['enrolled'] : 1,
        ]);

        $id = (int)$this->db->lastInsertId();
        return $this->findById($id);
    }

    /** Update an existing student */
    public function update(int $id, array $data): array|false
    {
        $existing = $this->findById($id);
        if (!$existing) return false;

        $stmt = $this->db->prepare(
            'UPDATE students SET name = ?, email = ?, grade = ?, enrolled = ? WHERE id = ?'
        );
        $stmt->execute([
            $data['name']     ?? $existing['name'],
            $data['email']    ?? $existing['email'],
            $data['grade']    ?? $existing['grade'],
            isset($data['enrolled']) ? (int)$data['enrolled'] : $existing['enrolled'],
            $id,
        ]);

        return $this->findById($id);
    }

    /** Delete a student */
    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM students WHERE id = ?');
        return $stmt->execute([$id]);
    }
}
