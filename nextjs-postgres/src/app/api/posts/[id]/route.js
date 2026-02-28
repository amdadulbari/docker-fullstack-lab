/*
 * Single Post API — src/app/api/posts/[id]/route.js
 * ───────────────────────────────────────────────────
 * [id] is a dynamic segment — Next.js passes it in params.
 *
 * GET    /api/posts/:id → get one post
 * PUT    /api/posts/:id → update post
 * DELETE /api/posts/:id → delete post
 */

import { NextResponse } from 'next/server';
import { getPostById, updatePost, deletePost } from '@/lib/posts';

export async function GET(request, { params }) {
  try {
    const post = await getPostById(parseInt(params.id));
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const post = await updatePost(parseInt(params.id), body);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const deleted = await deletePost(parseInt(params.id));
    if (!deleted) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
