<?php

/*
|--------------------------------------------------------------------------
| Router — src/Router.php
|--------------------------------------------------------------------------
| A simple HTTP router that maps method+path combinations to controller actions.
| Supports {id} style dynamic segments in URLs.
|
| This is a simplified version of what frameworks like Laravel do internally.
*/

declare(strict_types=1);

namespace App;

class Router
{
    private array $routes = [];

    public function get(string $path, array $handler): void
    {
        $this->addRoute('GET', $path, $handler);
    }

    public function post(string $path, array $handler): void
    {
        $this->addRoute('POST', $path, $handler);
    }

    public function put(string $path, array $handler): void
    {
        $this->addRoute('PUT', $path, $handler);
    }

    public function delete(string $path, array $handler): void
    {
        $this->addRoute('DELETE', $path, $handler);
    }

    private function addRoute(string $method, string $path, array $handler): void
    {
        // Convert {id} to a named regex capture group: (?P<id>[^/]+)
        $pattern = preg_replace('/\{(\w+)\}/', '(?P<$1>[^/]+)', $path);
        $this->routes[] = [
            'method'  => strtoupper($method),
            'pattern' => '#^' . $pattern . '$#',
            'handler' => $handler,
        ];
    }

    public function dispatch(string $method, string $uri): void
    {
        // Support _method override for PUT/DELETE via POST (optional)
        if ($method === 'POST' && isset($_POST['_method'])) {
            $method = strtoupper($_POST['_method']);
        }

        foreach ($this->routes as $route) {
            if ($route['method'] !== strtoupper($method)) continue;

            if (preg_match($route['pattern'], $uri, $matches)) {
                // Extract only string-keyed params (named captures)
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);

                [$class, $action] = $route['handler'];
                $controller = new $class();
                $controller->$action($params);
                return;
            }
        }

        // No route matched → 404
        http_response_code(404);
        echo json_encode(['error' => 'Route not found', 'path' => $uri]);
    }
}
