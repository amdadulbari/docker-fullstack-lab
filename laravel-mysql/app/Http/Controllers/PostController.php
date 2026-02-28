<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/*
|--------------------------------------------------------------------------
| PostController
|--------------------------------------------------------------------------
| Handles all CRUD operations for the Post resource.
| Laravel's built-in validate() automatically returns 422 JSON on failure.
*/

class PostController extends Controller
{
    /**
     * GET /api/posts
     * Returns all posts, optionally filtered by ?published=true/false
     */
    public function index(Request $request): JsonResponse
    {
        $query = Post::query()->latest(); // latest() = ORDER BY created_at DESC

        // Filter by published status if query param is provided
        if ($request->has('published')) {
            $query->where('published', filter_var($request->published, FILTER_VALIDATE_BOOLEAN));
        }

        $posts = $query->get();

        return response()->json([
            'count' => $posts->count(),
            'posts' => $posts,
        ]);
    }

    /**
     * POST /api/posts
     * Creates a new post. Laravel validates the request automatically.
     */
    public function store(Request $request): JsonResponse
    {
        // validate() throws ValidationException (422) if rules fail
        $validated = $request->validate([
            'title'     => 'required|string|max:255',
            'content'   => 'required|string',
            'author'    => 'sometimes|string|max:100',
            'published' => 'sometimes|boolean',
        ]);

        // Post::create() uses $fillable to prevent mass-assignment vulnerabilities
        $post = Post::create($validated);

        return response()->json($post, 201);
    }

    /**
     * GET /api/posts/{id}
     * Returns a single post. findOrFail() throws ModelNotFoundException → 404.
     */
    public function show(int $id): JsonResponse
    {
        $post = Post::findOrFail($id);
        return response()->json($post);
    }

    /**
     * PUT /api/posts/{id}
     * Updates an existing post.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $post = Post::findOrFail($id);

        $validated = $request->validate([
            'title'     => 'sometimes|string|max:255',
            'content'   => 'sometimes|string',
            'author'    => 'sometimes|string|max:100',
            'published' => 'sometimes|boolean',
        ]);

        // update() saves only the provided fields
        $post->update($validated);

        return response()->json($post);
    }

    /**
     * DELETE /api/posts/{id}
     * Permanently deletes a post.
     */
    public function destroy(int $id): JsonResponse
    {
        $post = Post::findOrFail($id);
        $post->delete();

        return response()->json(['message' => 'Post deleted successfully']);
    }
}
