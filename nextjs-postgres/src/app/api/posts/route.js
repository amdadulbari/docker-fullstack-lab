/*
 * Posts API — src/app/api/posts/route.js
 * ────────────────────────────────────────
 * GET  /api/posts → list all posts
 * POST /api/posts → create a post
 *
 * Next.js Route Handlers run on the server — they have access to
 * environment variables, databases, and Node.js APIs.
 */

import { NextResponse } from 'next/server';
import { getAllPosts, createPost } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const posts = await getAllPosts();
    return NextResponse.json({ count: posts.length, posts });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.title?.trim() || !body.content?.trim()) {
      return NextResponse.json(
        { error: "'title' and 'content' are required" },
        { status: 400 }
      );
    }

    const post = await createPost(body);
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
