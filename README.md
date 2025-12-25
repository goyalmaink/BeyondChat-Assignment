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

<img width="1356" height="522" alt="image" src="https://github.com/user-attachments/assets/b7cfc925-11b8-4cd3-886b-d147ba78e6c9" />

---

## Using Nano Banana
<img width="1024" height="1024" alt="image" src="https://github.com/user-attachments/assets/7c1ca8a3-f1c3-4981-8cc3-47f0c4101cc2" />







