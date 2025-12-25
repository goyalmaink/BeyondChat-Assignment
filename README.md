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
flowchart TD
  subgraph Backend [Laravel Backend]
    direction TB
    SCR[Scraper<br/>(Console: scrape:articles)]
    API[Laravel API<br/>(/api/articles)]
    DB[(Articles DB)]
  end

  subgraph Service [Search Service]
    direction TB
    NODE[Node Service<br/>POST /related-articles<br/>POST /fetch-latest-and-search]
    GOOGLE[Google Custom Search API]
  end

  subgraph Frontend [React / Vite]
    direction TB
    FE[Frontend UI<br/>List / Detail / Refresh / Find links]
  end

  SCR -->|stores scraped article| DB
  DB -->|article list (JSON)| API
  API -->|GET /api/articles| FE
  FE -->|POST { title }| NODE
  NODE -->|Google CSE request| GOOGLE
  GOOGLE -->|results| NODE
  NODE -->|returns { links }| FE
  NODE -->|PATCH /api/articles/{id} { reference_articles }| API

  %% Failure / Retry flows
  GOOGLE -.->|quota / network error| NODE
  SCR -.->|no new articles| FE

  classDef backend fill:#fef3c7,stroke:#f59e0b;
  classDef service fill:#fff1f2,stroke:#fb7185;
  classDef frontend fill:#eef2ff,stroke:#6366f1;
  class SCR,API,DB backend;
  class NODE,GOOGLE service;
  class FE frontend;
```

Data flow summary: The Laravel scraper detects and saves new articles to the Articles DB; the React frontend fetches articles via the Laravel API and shows Original / Updated versions. When a user requests related links, the frontend calls the Node service (which queries Google Custom Search) and shows the top links, which the Node service may persist back to Laravel as `reference_articles`.

### Legend
- Solid arrows: main request/response flow (HTTP / function calls)
- Dashed arrows: error/edge cases (rate limits, no new articles)
- Colors: Backend (yellow), Service (pink), Frontend (blue)

### Key endpoints & env variables
- Laravel: GET `/api/articles`, GET `/api/articles/{id}`, POST `/api/articles/refresh`, PATCH `/api/articles/{id}`
- Node: POST `/related-articles` (body: { title }), POST `/fetch-latest-and-search`
- Env / secrets: `GOOGLE_API_KEY`, `GOOGLE_CX`, `LARAVEL_API_URL`, `ANTHROPIC_API_KEY` (optional)

---

If you'd like, I can also export this diagram to an SVG/png and add the asset to the repo and a direct image link in the README. Would you like an SVG export added as well?

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