<?php

/*
|--------------------------------------------------------------------------
| StudentController — src/Controllers/StudentController.php
|--------------------------------------------------------------------------
| Handles HTTP requests and produces JSON responses.
| Each method reads input, calls the model, then writes output.
|
| In plain PHP, we manually read JSON body with php://input
| and set HTTP status codes with http_response_code().
*/

declare(strict_types=1);

namespace App\Controllers;

use App\Models\Student;

class StudentController
{
    private Student $model;

    public function __construct()
    {
        $this->model = new Student();
        // Create table on first request (no migrations tool in plain PHP)
        $this->model->createTable();
    }

    /** GET /api/students */
    public function index(array $params = []): void
    {
        $students = $this->model->findAll();
        http_response_code(200);
        echo json_encode(['count' => count($students), 'students' => $students]);
    }

    /** POST /api/students */
    public function store(array $params = []): void
    {
        $body = $this->getJsonBody();

        if (empty($body['name']) || empty($body['email'])) {
            http_response_code(400);
            echo json_encode(['error' => "'name' and 'email' are required"]);
            return;
        }

        if (!filter_var($body['email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid email format']);
            return;
        }

        $student = $this->model->create($body);
        http_response_code(201);
        echo json_encode($student);
    }

    /** GET /api/students/{id} */
    public function show(array $params = []): void
    {
        $student = $this->model->findById((int)$params['id']);

        if (!$student) {
            http_response_code(404);
            echo json_encode(['error' => 'Student not found']);
            return;
        }

        http_response_code(200);
        echo json_encode($student);
    }

    /** PUT /api/students/{id} */
    public function update(array $params = []): void
    {
        $body    = $this->getJsonBody();
        $student = $this->model->update((int)$params['id'], $body);

        if (!$student) {
            http_response_code(404);
            echo json_encode(['error' => 'Student not found']);
            return;
        }

        http_response_code(200);
        echo json_encode($student);
    }

    /** DELETE /api/students/{id} */
    public function destroy(array $params = []): void
    {
        $existing = $this->model->findById((int)$params['id']);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['error' => 'Student not found']);
            return;
        }

        $this->model->delete((int)$params['id']);
        http_response_code(200);
        echo json_encode(['message' => 'Student deleted successfully']);
    }

    /** Read and decode JSON request body */
    private function getJsonBody(): array
    {
        $raw = file_get_contents('php://input');
        return json_decode($raw ?: '{}', true) ?? [];
    }
}
