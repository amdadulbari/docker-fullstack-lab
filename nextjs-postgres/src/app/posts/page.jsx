/*
 * Posts Page — src/app/posts/page.jsx
 * ──────────────────────────────────────
 * Server Component that lists all posts (published and draft).
 * Data is fetched at request time (dynamic rendering).
 *
 * Key Next.js concept: export const dynamic = 'force-dynamic' tells Next.js
 * NOT to cache this page — always fetch fresh data.
 */

import { getAllPosts } from '@/lib/posts';

export const dynamic = 'force-dynamic'; // re-fetch on every request

export default async function PostsPage() {
  const posts = await getAllPosts();

  return (
    <div className="posts-page">
      <h1>All Posts ({posts.length})</h1>
      <p className="page-sub">Manage posts via the REST API at <code>/api/posts</code></p>

      {posts.length === 0 ? (
        <div className="empty-state">
          <p>No posts yet.</p>
          <p>Create one:</p>
          <pre className="code-block">
{`curl -X POST http://localhost:3000/api/posts \\
  -H "Content-Type: application/json" \\
  -d '{"title":"My First Post","content":"Hello World!","published":true}'`}
          </pre>
        </div>
      ) : (
        <div className="posts-table-wrap">
          <table className="posts-table">
            <thead>
              <tr>
                <th>ID</th><th>Title</th><th>Author</th>
                <th>Status</th><th>Created</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id}>
                  <td>{post.id}</td>
                  <td>{post.title}</td>
                  <td>{post.author}</td>
                  <td>
                    <span className={post.published ? 'badge published' : 'badge draft'}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>{new Date(post.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
