// Next.js instrumentation hook — runs on server startup, not during build.
// This is the correct place for one-time DB initialization.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initDb } = await import('./lib/db.js');
    try {
      await initDb();
    } catch (err) {
      console.error('Database initialization failed:', err.message);
    }
  }
}
