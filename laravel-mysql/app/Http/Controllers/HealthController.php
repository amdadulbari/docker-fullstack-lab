<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    public function check(): JsonResponse
    {
        try {
            DB::select('SELECT 1');
            return response()->json([
                'status'    => 'ok',
                'database'  => 'ok',
                'timestamp' => now()->toIso8601String(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'   => 'error',
                'database' => 'unreachable',
                'detail'   => $e->getMessage(),
            ], 500);
        }
    }
}
