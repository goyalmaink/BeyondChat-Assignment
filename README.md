# BeyondChat-Assignment

A small project to scrape blog posts, store them in a Laravel backend, and provide a Node service to find related external articles via Google Custom Search. The frontend displays articles and lets you view both original and updated versions and saved related links.

---

## 🚀 Local setup (macOS / Linux)

Prerequisites:
- PHP 8.1+ and Composer
- Node.js 18+ and npm
- A database (MySQL, Postgres, or SQLite)

Quick start (run everything locally):

1. Backend (Laravel API)

```bash
cd backend/laravel-api
cp .env.example .env
# Edit .env to set DB and other values, then:
composer install
php artisan key:generate
# Configure DB (example: sqlite)
# touch database/database.sqlite
# set DB_CONNECTION=sqlite in .env
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```

2. Node service (search helper / orchestrator)

```bash
cd backend/script
cp .env.example .env    # set LARAVEL_API_URL=http://127.0.0.1:8000/api
npm install
node index.js           # starts server on :3000 by default
```

Set env variables in `backend/script/.env` (or export):
- LARAVEL_API_URL=http://127.0.0.1:8000/api
- GOOGLE_API_KEY=your_google_api_key
- GOOGLE_CX=your_custom_search_engine_id
- ANTHROPIC_API_KEY (optional, used for summarization endpoint)

3. Frontend (React / Vite)

```bash
cd backend/frontend
npm install
npm run dev              # open the UI on the port Vite shows (usually http://localhost:5173)
```

Usage:
- Open the frontend, click **Refresh New Article** to scrape and persist the latest new article from the target blog. The new article will appear at the top.
- Expand an article to view **Original** and **Updated** versions (if present) and any saved references (external links found for that article).
- Click **Find related links** on an article to call the Node search API and display the top related links.

---

## 🗂️ Data flow / Architecture

```mermaid
flowchart LR
  A[Scraper (Laravel Console Command)] -->|Stores| B[(Articles DB)]
  B --> C[Laravel API (GET /api/articles)]
  C -->|Consumed by| D[Frontend (React)]
  D -->|'Find related links'| E[Node service: Google Search helper]
  E -->|returns| D
  E -->|patches| C
  E --> F[Google Custom Search API]
  style A fill:#fef3c7,stroke:#f59e0b
  style B fill:#ecfeff,stroke:#06b6d4
  style D fill:#eef2ff,stroke:#6366f1
  style E fill:#fff1f2,stroke:#fb7185
  style F fill:#fff7ed,stroke:#f97316
```

This diagram summarizes the typical request path: the Laravel scraper populates the DB; the frontend reads articles via the Laravel API; the Node service performs Google Custom Search for a given article title, returns the top external links to the frontend, and persists them back on the Laravel `articles` resource as `reference_articles`.

---

## 🔗 Live Frontend

If you deploy the frontend to a hosting provider (Vercel / Netlify / Surge), paste your live URL here so reviewers can open it directly. Example:

**Live frontend**: <REPLACE_WITH_YOUR_DEPLOYED_URL>

When a live link is present, you can check an article and toggle between the **Original** and **Updated** versions in the article detail view.

---

## 🧪 Useful API endpoints

- GET `/api/articles` — list saved articles (latest first)
- GET `/api/articles/{id}` — show an article
- POST `/api/articles/refresh` — scrape blog listing and persist the first **new** article (returns 201 and the article, or 204 if nothing new)
- POST `/fetch-latest-and-search` (Node) — fetches latest article from Laravel and searches for related links
- POST `/related-articles` (Node) — accepts `{ title }` and returns `{ links: [...] }`

---

## ♻️ Deploy notes (quick)

- Frontend: push to Vercel or Netlify and point the build to the `backend/frontend` folder (or create a standalone Vite app). Ensure `LARAVEL_API_URL` in the Node service points to your deployed Laravel API.
- Node service: deploy to a server or serverless function; ensure env vars for Google API are set.
- Laravel: deploy to a PHP host with DB and set up cron/workers if you want periodic scraping.

---

## 🧾 Contact / Next steps

If you'd like, I can:
- Add a minimal `README` section with one-click deploy (e.g., Netlify/Vercel configuration), or
- Add a PHPUnit feature test for `POST /api/articles/refresh` and a small integration test for the Node `searching` flow.

---

*Edited on: 25 Dec 2025*