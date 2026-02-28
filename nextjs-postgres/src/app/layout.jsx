/*
 * Root Layout — src/app/layout.jsx
 * ──────────────────────────────────
 * In Next.js App Router, layout.jsx wraps all pages.
 * This is a Server Component by default — it runs on the server,
 * has no client-side JavaScript, and can access server-only resources.
 */

import './globals.css';

export const metadata = {
  title: 'Blog | Next.js + PostgreSQL',
  description: 'A simple blog built with Next.js 14 App Router and PostgreSQL',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <div className="nav-container">
            <a href="/" className="nav-brand">Next.js Blog</a>
            <div className="nav-links">
              <a href="/">Home</a>
              <a href="/posts">All Posts</a>
            </div>
          </div>
        </nav>
        <main className="main-content">
          {children}
        </main>
        <footer className="footer">
          <p>Built with Next.js 14 + PostgreSQL</p>
        </footer>
      </body>
    </html>
  );
}
