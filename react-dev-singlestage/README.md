# react-dev-singlestage — Single-Stage Dockerfile (Development Mode)

A small **Pomodoro Timer** React app (Vite) whose only job is to teach how to
containerise a frontend for **local development** using a **single-stage**
`Dockerfile` that runs the dev server with hot-reload.

> Pair this with the sibling project [`../react-nginx-multistage`](../react-nginx-multistage)
> to compare a development build against a production multi-stage build.

---

## 1. What students should learn here

- What a **single-stage** build is (exactly one `FROM`).
- Why the **dev image is intentionally large**: it keeps Node.js + all
  dependencies (including `devDependencies` like Vite) because they are needed
  **at runtime** to run the dev server.
- **Layer caching**: copy `package*.json` and install **before** copying source,
  so `npm install` re-runs only when dependencies change.
- **Hot Module Replacement (HMR)** inside a container via a **bind-mount** plus
  an **anonymous volume** for `node_modules`.
- The role of `.dockerignore`, `EXPOSE`, `CMD`, and port publishing.

---

## 2. The app

A focus timer with Focus / Short Break / Long Break modes, a start/pause/reset
control, a progress ring, and a completed-session counter. It is fully
self-contained — **no backend, no API keys, no database** — so it builds and
runs anywhere.

```
react-dev-singlestage/
├── src/
│   ├── components/
│   │   ├── Controls.jsx
│   │   ├── ModeTabs.jsx
│   │   └── TimerDisplay.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── package.json
├── Dockerfile            <-- the single-stage build (read the comments!)
├── docker-compose.yml    <-- bind-mount + anonymous volume for HMR
├── .dockerignore
└── .gitignore
```

---

## 3. Run it with Docker (recommended)

```bash
cd react-dev-singlestage

# Build the image and start the dev server with hot-reload.
docker compose up --build

# Open the app
open http://localhost:5173     # macOS
# or just visit http://localhost:5173 in your browser
```

Now edit any file under `src/` on your host (e.g. change the title in
`src/App.jsx`) and watch the browser update **instantly** — that is HMR working
through the bind-mount.

Stop it:

```bash
docker compose down
```

## 4. Run it with plain `docker` (no compose)

```bash
cd react-dev-singlestage

# Build the image
docker build -t pomodoro-dev .

# Run it. The bind-mounts replicate what compose does, enabling HMR.
docker run --rm -p 5173:5173 \
  -v "$(pwd)":/app \
  -v /app/node_modules \
  pomodoro-dev
```

Without the volume flags the app still runs, but edits on the host won't reach
the running container.

---

## 5. How the single-stage Dockerfile works

```dockerfile
FROM node:22-alpine        # one stage, full Node toolchain kept in the image
WORKDIR /app
COPY package*.json ./      # copy manifests first ...
RUN npm install            # ... so this layer is cached until deps change
COPY . .                   # then the source
EXPOSE 5173                # informational: the Vite dev port
CMD ["npm", "run", "dev"]  # start the dev server (HMR)
```

**Why single-stage is right for development but wrong for production:**

| | Single-stage dev (this project) | Multi-stage prod ([sibling](../react-nginx-multistage)) |
|---|---|---|
| Runs | `vite` dev server | static files via nginx |
| Contains Node.js at runtime? | Yes (needed) | No (thrown away after build) |
| Image size | Large (~hundreds of MB) | Tiny (nginx + static assets) |
| Hot reload | Yes | No |
| Use case | Local development | Deploy to production |

---

## 6. The HMR volume trick (important)

In `docker-compose.yml`:

```yaml
volumes:
  - .:/app              # bind-mount host source -> live edits reach the container
  - /app/node_modules   # anonymous volume -> keep the container's node_modules
```

The first line makes edits live. But it would also overwrite the container's
`/app/node_modules` with the host's (which may be empty or built for a different
OS). The second line re-mounts `node_modules` as a separate volume so the
container keeps the modules that were installed during `docker build`.

---

## 7. Common issues

| Symptom | Fix |
|---|---|
| Changes don't hot-reload | Ensure the bind-mount exists; polling is enabled in `vite.config.js` and via `CHOKIDAR_USEPOLLING=true`. |
| `Cannot find module` after adding a dependency | Rebuild: `docker compose up --build` (installs the new package into the image). |
| Port 5173 already in use | Change the host side of the mapping, e.g. `"3000:5173"`. |
