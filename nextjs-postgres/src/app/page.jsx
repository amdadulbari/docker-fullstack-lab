/*
 * Home Page — src/app/page.jsx
 * ──────────────────────────────
 * Server Component: fetches data directly on the server, no useEffect/fetch needed.
 * The HTML is pre-rendered and sent to the browser — great for SEO.
 */

import { getAllPosts } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // This runs on the server! We can call DB functions directly.
  const posts = await getAllPosts();
  const recentPosts = posts.filter(p => p.published).slice(0, 3);

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Welcome to the Blog</h1>
        <p>Built with Next.js 14 App Router + PostgreSQL</p>
        <p className="hero-sub">
          This page is Server-Side Rendered (SSR) — the data is fetched
          on the server and HTML is sent to the browser.
        </p>
      </section>

      <section className="recent-posts">
        <h2>Recent Published Posts</h2>
        {recentPosts.length === 0 ? (
          <p className="empty-state">
            No published posts yet. Create one via the API!
          </p>
        ) : (
          <div className="posts-grid">
            {recentPosts.map(post => (
              <article key={post.id} className="post-card">
                <h3>{post.title}</h3>
                <p className="post-meta">by {post.author}</p>
                <p className="post-excerpt">
                  {post.content.substring(0, 120)}...
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="api-info">
        <h2>REST API</h2>
        <p>This app also exposes a full REST API:</p>
        <ul>
          <li><code>GET /api/health</code> — health check</li>
          <li><code>GET /api/posts</code> — list all posts</li>
          <li><code>POST /api/posts</code> — create a post</li>
          <li><code>GET /api/posts/:id</code> — get one post</li>
          <li><code>PUT /api/posts/:id</code> — update a post</li>
          <li><code>DELETE /api/posts/:id</code> — delete a post</li>
        </ul>
      </section>
    </div>
  );
}
