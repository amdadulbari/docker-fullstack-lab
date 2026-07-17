# react-nginx-multistage — Multi-Stage Dockerfile (Production)

A small **Expense Tracker** React app (Vite) whose job is to teach how to
containerise a frontend for **production** using a **multi-stage** `Dockerfile`:
build the app with Node, then serve the compiled static files with **nginx** —
throwing the Node toolchain away in the final image.

> Pair this with the sibling project [`../react-dev-singlestage`](../react-dev-singlestage)
> to compare a production multi-stage build against a development build.

---

## 1. What students should learn here

- What a **multi-stage** build is: multiple `FROM` lines, only the **last** one
  becomes the shipped image.
- Why a React app **doesn't need Node at runtime** — it compiles to static
  HTML/CSS/JS, which any web server (nginx) can serve.
- How `COPY --from=builder` pulls **only** the compiled `dist/` into the final
  image, leaving `node_modules`, source, and npm behind.
- The payoff: a **much smaller** image and a **smaller attack surface**.
- Serving a **single-page app** with nginx (`try_files ... /index.html`),
  asset caching, gzip, and a `/health` endpoint.

---

## 2. The app

Add expenses (title, amount, category), see a running total, and remove items.
Data persists in the browser via `localStorage`, so the app is fully
self-contained — **no backend, no API keys, no database**.

```
react-nginx-multistage/
├── src/
│   ├── components/
│   │   ├── ExpenseForm.jsx
│   │   ├── ExpenseList.jsx
│   │   └── Summary.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── package.json
├── Dockerfile            <-- the multi-stage build (read the comments!)
├── nginx.conf            <-- SPA routing + caching + /health
├── docker-compose.yml
├── .dockerignore
└── .gitignore
```

---

## 3. Run it with Docker (recommended)

```bash
cd react-nginx-multistage

# Build the multi-stage image and start nginx.
docker compose up --build

# Open the app
open http://localhost:8080     # macOS
# or visit http://localhost:8080 in your browser

# Confirm the health endpoint
curl http://localhost:8080/health   # -> ok
```

Stop it:

```bash
docker compose down
```

## 4. Run it with plain `docker` (no compose)

```bash
cd react-nginx-multistage

docker build -t expense-tracker .
docker run --rm -p 8080:80 expense-tracker
# http://localhost:8080
```

---

## 5. How the multi-stage Dockerfile works

```dockerfile
# ---- Stage 1: build with Node ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
RUN npm run build            # produces /app/dist

# ---- Stage 2: serve with nginx (final image) ----
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html   # only the built assets
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

The magic line is `COPY --from=builder /app/dist ...`: it reaches back into the
first stage and copies **only** the compiled output. Node.js, npm, and
`node_modules` never make it into the final image.

**See the size difference for yourself:**

```bash
# Build just the builder stage (the "big" one)
docker build --target builder -t expense-builder .

# Build the final multi-stage image (the "small" one)
docker build -t expense-tracker .

docker images | grep -E 'expense-(builder|tracker)'
# The builder stage is hundreds of MB; the final nginx image is a fraction of that.
```

---

## 6. Single-stage vs multi-stage

| | Single-stage dev ([sibling](../react-dev-singlestage)) | Multi-stage prod (this project) |
|---|---|---|
| `FROM` count | 1 | 2 (builder + runtime) |
| Runs | `vite` dev server | static files via nginx |
| Node.js in final image? | Yes (needed at runtime) | No (discarded after build) |
| Image size | Large | Small |
| Hot reload | Yes | No — rebuild to ship changes |
| Use case | Local development | Production deployment |

---

## 7. nginx notes

`nginx.conf` does four things worth pointing out to students:

1. **SPA fallback** — `try_files $uri $uri/ /index.html` so deep-link refreshes
   don't 404.
2. **Long-lived asset cache** — Vite fingerprints filenames, so `/assets/` can be
   cached for a year and still update on the next build.
3. **gzip** — compresses text responses.
4. **`/health`** — returns `ok`, used by the compose health check.

---

## 8. Common issues

| Symptom | Fix |
|---|---|
| 404 on refresh of a sub-route | Ensure the `try_files ... /index.html` line is present in `nginx.conf`. |
| Old version still showing | Rebuild the image: `docker compose up --build`. Static assets are baked in at build time. |
| Port 8080 already in use | Change the host side, e.g. `"9090:80"`. |
