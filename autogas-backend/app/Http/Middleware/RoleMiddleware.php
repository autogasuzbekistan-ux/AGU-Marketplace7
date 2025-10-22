<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles  (e.g., 'owner', 'admin', 'kontragent')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Check if user is authenticated
        if (!$request->user()) {
            return response()->json([
                'message' => 'Autentifikatsiya talab qilinadi'
            ], 401);
        }

        // Check if user's account is active
        if (!$request->user()->is_active) {
            return response()->json([
                'message' => 'Sizning akkauntingiz bloklangan. Administrator bilan bog\'laning.'
            ], 403);
        }

        // Check if user has required role
        if (!in_array($request->user()->role, $roles)) {
            return response()->json([
                'message' => 'Sizda bu amalni bajarish uchun ruxsat yo\'q.',
                'required_roles' => $roles,
                'your_role' => $request->user()->role
            ], 403);
        }

        return $next($request);
    }
}