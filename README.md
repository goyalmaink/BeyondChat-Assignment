# BeyondChat-Assignment

A full-stack application to scrape blog posts from BeyondChats, store them in a Laravel backend, and provide a Node.js service to find related external articles via Google Custom Search API. The React frontend displays articles and lets you view both original and updated versions along with saved related links.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Local Setup](#-local-setup)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)
- [API Endpoints](#-api-endpoints)
- [Data Flow / Architecture](#-data-flow--architecture)
- [Deployment](#-deployment)

---

## ✨ Features

- **Web Scraping**: Automatically scrape latest blog posts from BeyondChats.com
- **Article Management**: Store and manage articles with original and updated content
- **Related Articles Search**: Find top 2 related external articles using Google Custom Search API
- **Modern UI**: React-based frontend with Vite for fast development
- **RESTful API**: Laravel backend with comprehensive API endpoints
- **Real-time Updates**: Refresh and fetch latest articles on demand

---

## 🛠️ Tech Stack

### Backend (Laravel)
- **Framework**: Laravel 12.x
- **PHP**: 8.2+
- **Database**: SQLite (default) / MySQL / PostgreSQL
- **Libraries**: 
  - Guzzle HTTP Client (for web scraping)
  - Symfony DOM Crawler (for HTML parsing)

### Node Service
- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.x
- **Libraries**:
  - Axios (HTTP client)
  - Anthropic SDK (optional, for summarization)
  - Cheerio (HTML parsing)

### Frontend
- **Framework**: React 19.x
- **Build Tool**: Vite 7.x
- **HTTP Client**: Axios

---

## 📁 Project Structure

```
BeyondChat-Assignment/
├── backend/
│   ├── laravel-api/              # Laravel backend API
│   │   ├── app/
│   │   │   ├── Console/Commands/
│   │   │   │   └── ScrapeArticles.php    # Artisan command for scraping
│   │   │   ├── Http/Controllers/Api/
│   │   │   │   └── ArticleController.php  # Article CRUD & refresh endpoint
│   │   │   └── Models/
│   │   │       └── Article.php           # Article model
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   │   └── create_articles_table.php
│   │   │   └── database.sqlite          # SQLite database (default)
│   │   ├── routes/
│   │   │   └── api.php                  # API routes
│   │   └── vercel.json                  # Vercel deployment config
│   │
│   ├── script/                    # Node.js search service
│   │   ├── Controller/
│   │   │   ├── googlesearch.controller.js    # Google Search logic
│   │   │   └── fetcharticle.controller.js    # Laravel API integration
│   │   ├── routes/
│   │   │   └── searching.js                 # Search route handler
│   │   └── index.js                         # Express server entry
│   │
│   └── frontend/                  # React frontend
│       ├── src/
│       │   ├── components/
│       │   │   ├── Article.jsx            # Article display component
│       │   │   ├── Links.jsx              # Related links component
│       │   │   └── Navbar.jsx             # Navigation component
│       │   ├── service/
│       │   │   └── api.jsx                # API service functions
│       │   └── App.jsx                   # Main app component
│       └── vite.config.js
│
└── README.md
```

---

## 🔧 Prerequisites

- **PHP**: 8.2+ with Composer
- **Node.js**: 18+ with npm
- **Database**: SQLite (default, no setup needed), MySQL, or PostgreSQL
- **Google Custom Search API**: 
  - API Key from [Google Cloud Console](https://console.cloud.google.com/)
  - Custom Search Engine ID (CX)
- **Optional**: Anthropic API Key (for summarization features)

---

## 🚀 Local Setup

### Step 1: Backend (Laravel API)

```bash
cd backend/laravel-api

# Install dependencies
composer install

# Create environment file (if .env.example exists, otherwise create manually)
# cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database (SQLite is default - no setup needed)
# For SQLite, ensure database/database.sqlite exists:
touch database/database.sqlite

# Or configure MySQL/PostgreSQL in .env:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=beyondchat
# DB_USERNAME=root
# DB_PASSWORD=

# Run migrations
php artisan migrate

# Start Laravel development server
php artisan serve --host=127.0.0.1 --port=8000
```

**Alternative**: Use Laravel's built-in setup script:
```bash
composer run setup
```

**Console Command**: You can also scrape articles using the artisan command:
```bash
php artisan scrape:articles
```

### Step 2: Node Service (Search Service)

```bash
cd backend/script

# Install dependencies
npm install

# Create .env file (create manually if .env.example doesn't exist)
# Add the following environment variables (see Environment Variables section)

# Start the server
npm start
# Or for development with auto-reload:
npm run dev
```

The Node service will run on `http://localhost:3000` by default.

### Step 3: Frontend (React / Vite)

```bash
cd backend/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port Vite assigns).

**Build for production**:
```bash
npm run build
npm run preview  # Preview production build
```

---

## 🔐 Environment Variables

### Laravel Backend (`backend/laravel-api/.env`)

```env
APP_NAME=BeyondChat
APP_ENV=local
APP_KEY=base64:...  # Generated by php artisan key:generate
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database Configuration (SQLite - default)
DB_CONNECTION=sqlite
# DB_DATABASE=database/database.sqlite  # Auto-created

# Or use MySQL/PostgreSQL:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=beyondchat
# DB_USERNAME=root
# DB_PASSWORD=
```

### Node Service (`backend/script/.env`)

```env
# Laravel API URL
LARAVEL_API_URL=http://127.0.0.1:8000/api

# Google Custom Search API (Required)
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_CX=your_custom_search_engine_id_here

# Optional: Anthropic API (for summarization features)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Server Port (optional, defaults to 3000)
PORT=3000
```

### Frontend (`backend/frontend/.env` or update `src/service/api.jsx`)

Update the API URLs in `src/service/api.jsx`:
```javascript
const LARAVEL_API = "http://localhost:8000/api";
const NODE_API = "http://localhost:3000";  // Or your deployed Node service URL
```

---

## 📖 Usage

### Basic Workflow

1. **Start all services** (Laravel, Node, and Frontend in separate terminals)

2. **Open the frontend** at `http://localhost:5173`

3. **Refresh New Article**: 
   - Click the **"Refresh New Article"** button
   - This calls `POST /api/articles/refresh` which scrapes the latest article from BeyondChats.com
   - New articles appear at the top of the list

4. **View Article Details**:
   - Click on any article to expand and view details
   - Toggle between **Original** and **Updated** content versions
   - View saved **Reference Articles** (if any)

5. **Find Related Links**:
   - Click **"Find related links"** on any article
   - This calls the Node service which:
     - Searches Google Custom Search API using the article title
     - Filters out internal and social media links
     - Returns top 2 external related articles
     - Optionally saves them to the article's `reference_articles` field

### API Workflow

```
Frontend → Laravel API → Scrapes BeyondChats.com → Stores Article
Frontend → Node Service → Google Custom Search → Returns Related Links
Node Service → Laravel API → Updates Article with reference_articles
```

---

## 🗂️ Data flow / Architecture

<img width="1312" height="450" alt="image" src="https://github.com/user-attachments/assets/8c09df67-ac2e-4530-90de-aa239891afd4" />

---
## Using Nano Banana
<img width="1024" height="1024" alt="image" src="https://github.com/user-attachments/assets/467c712f-30b4-4b7a-b9a6-079fe076a71d" />


### Legend
- Solid arrows: main request/response flow (HTTP / function calls)
- Dashed arrows: error/edge cases (rate limits, no new articles)
- Colors: Backend (yellow), Service (pink), Frontend (blue)

### Key Endpoints & Environment Variables
- **Laravel**: GET `/api/articles`, GET `/api/articles/{id}`, POST `/api/articles/refresh`, PATCH `/api/articles/{id}`
- **Node**: POST `/related-articles` (body: `{ title }`), POST `/fetch-latest-and-search`
- **Environment Variables**: `GOOGLE_API_KEY`, `GOOGLE_CX`, `LARAVEL_API_URL`, `ANTHROPIC_API_KEY` (optional)

---

## 🔗 Live Demo

If you deploy the frontend to a hosting provider (Vercel / Netlify / Surge), add your live URL here:

**Live Frontend**: <REPLACE_WITH_YOUR_DEPLOYED_URL>

**Live API**: <REPLACE_WITH_YOUR_DEPLOYED_LARAVEL_API_URL>

**Live Node Service**: <REPLACE_WITH_YOUR_DEPLOYED_NODE_SERVICE_URL>

> **Note**: When deploying, ensure all services are configured with the correct API URLs and environment variables.

### Features Available in Live Demo

- ✅ View all scraped articles
- ✅ Toggle between **Original** and **Updated** content versions
- ✅ View saved **Reference Articles** (related external links)
- ✅ Refresh and fetch latest articles from BeyondChats.com
- ✅ Search for related articles using Google Custom Search

---

## 🧪 API Endpoints

### Laravel API (`http://localhost:8000/api`)

#### Articles

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/api/articles` | List all articles (latest first) | - | `200 OK` - Array of articles |
| `GET` | `/api/articles/{id}` | Get single article by ID | - | `200 OK` - Article object |
| `POST` | `/api/articles` | Create new article | `{ title, url, content, updated_content?, reference_articles?, is_updated? }` | `201 Created` - Article object |
| `PATCH` | `/api/articles/{id}` | Update article | `{ title?, content?, updated_content?, reference_articles?, is_updated? }` | `200 OK` - Updated article |
| `DELETE` | `/api/articles/{id}` | Delete article | - | `204 No Content` |
| `POST` | `/api/articles/refresh` | Scrape and save latest new article from BeyondChats | - | `201 Created` - New article<br>`204 No Content` - No new articles |

**Example Request/Response:**

```bash
# Get all articles
curl http://localhost:8000/api/articles

# Refresh latest article
curl -X POST http://localhost:8000/api/articles/refresh

# Update article with reference links
curl -X PATCH http://localhost:8000/api/articles/1 \
  -H "Content-Type: application/json" \
  -d '{"reference_articles": ["https://example.com/article1", "https://example.com/article2"]}'
```

### Node Service (`http://localhost:3000`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/` | Health check | - | `200 OK` - "Google Search API is running" |
| `POST` | `/related-articles` | Search for related articles by title | `{ title: string }` | `200 OK` - `{ links: string[] }`<br>`400 Bad Request` - Missing title<br>`500 Internal Server Error` |
| `POST` | `/fetch-latest-and-search` | Fetch latest article from Laravel and search for related links | - | `200 OK` - `{ article, links }`<br>`500 Internal Server Error` |

**Example Request/Response:**

```bash
# Search related articles
curl -X POST http://localhost:3000/related-articles \
  -H "Content-Type: application/json" \
  -d '{"title": "How to Build a REST API"}'

# Response:
# {
#   "links": [
#     "https://example.com/rest-api-guide",
#     "https://example.com/api-best-practices"
#   ]
# }

# Fetch latest and search
curl -X POST http://localhost:3000/fetch-latest-and-search
```

---

## 🗄️ Database Schema

### Articles Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint (PK) | Primary key |
| `title` | string | Article title |
| `url` | text | Article URL (unique identifier) |
| `content` | longText | Original article HTML content |
| `excerpt` | text (nullable) | Short excerpt (200 chars) |
| `author` | string (nullable) | Article author name |
| `published_at` | timestamp (nullable) | Publication date |
| `is_updated` | boolean (default: false) | Whether article has been updated |
| `updated_content` | longText (nullable) | Updated article content |
| `reference_articles` | json (nullable) | Array of related external article URLs |
| `created_at` | timestamp | Record creation time |
| `updated_at` | timestamp | Record last update time |

---

## 🚀 Deployment

### Frontend (Vercel / Netlify)

**Vercel:**
```bash
cd backend/frontend
npm run build
# Deploy to Vercel
vercel --prod
```

**Netlify:**
- Build command: `npm run build`
- Publish directory: `dist`
- Add environment variables in Netlify dashboard

**Important**: Update API URLs in `src/service/api.jsx` to point to your deployed services.

### Node Service

**Vercel (Serverless Functions):**
- Create `vercel.json` in `backend/script/`
- Deploy as serverless function
- Set environment variables in Vercel dashboard

**Railway / Render:**
- Connect GitHub repository
- Set root directory to `backend/script`
- Add environment variables
- Deploy

### Laravel Backend

**Vercel (PHP Runtime):**
- The project includes `vercel.json` configuration
- Deploy from `backend/laravel-api` directory
- Set environment variables in Vercel dashboard
- Configure database (use external MySQL/PostgreSQL for production)

**Traditional PHP Hosting:**
- Upload files to server
- Set up database (MySQL/PostgreSQL recommended for production)
- Configure `.env` file
- Run `composer install --optimize-autoloader --no-dev`
- Run `php artisan migrate --force`
- Set up cron job for periodic scraping:
  ```bash
  * * * * * cd /path-to-project && php artisan scrape:articles
  ```

**Docker (Optional):**
```dockerfile
# Example Dockerfile for Laravel
FROM php:8.2-fpm
# ... add your Docker configuration
```

---

## 🧪 Testing

### Laravel Tests

```bash
cd backend/laravel-api
php artisan test
```

### Manual Testing

1. **Test Scraping**: 
   ```bash
   php artisan scrape:articles
   ```

2. **Test API Endpoints**:
   ```bash
   # Using curl or Postman
   curl http://localhost:8000/api/articles
   ```

3. **Test Node Service**:
   ```bash
   curl -X POST http://localhost:3000/related-articles \
     -H "Content-Type: application/json" \
     -d '{"title": "Test Article"}'
   ```

---

## 🔧 Troubleshooting

### Common Issues

**1. Laravel API not responding**
- Check if server is running: `php artisan serve`
- Verify database connection in `.env`
- Check logs: `tail -f storage/logs/laravel.log`

**2. Node service can't connect to Laravel**
- Verify `LARAVEL_API_URL` in `backend/script/.env`
- Ensure Laravel CORS is configured (check `config/cors.php`)
- Test Laravel API directly: `curl http://localhost:8000/api/articles`

**3. Google Custom Search API errors**
- Verify `GOOGLE_API_KEY` and `GOOGLE_CX` are set correctly
- Check API quota limits in Google Cloud Console
- Ensure Custom Search Engine is configured to search the entire web

**4. Frontend can't fetch articles**
- Check browser console for CORS errors
- Verify API URLs in `src/service/api.jsx`
- Ensure both Laravel and Node services are running

**5. Database migration errors**
- For SQLite: Ensure `database/database.sqlite` file exists and is writable
- For MySQL/PostgreSQL: Verify database credentials in `.env`
- Try: `php artisan migrate:fresh` (⚠️ deletes all data)

**6. Scraping not working**
- Check if BeyondChats.com is accessible
- Verify network connectivity
- Check Laravel logs for scraping errors
- Try running manually: `php artisan scrape:articles`

---

## 📝 Development Notes

### Adding New Features

**Laravel:**
- Controllers: `app/Http/Controllers/Api/`
- Models: `app/Models/`
- Migrations: `database/migrations/`
- Routes: `routes/api.php`

**Node Service:**
- Controllers: `backend/script/Controller/`
- Routes: `backend/script/routes/`
- Main server: `backend/script/index.js`

**Frontend:**
- Components: `backend/frontend/src/components/`
- Services: `backend/frontend/src/service/`
- Main app: `backend/frontend/src/App.jsx`

### Code Style

- **Laravel**: Follow PSR-12 coding standards
- **Node.js**: Use ES6+ modules (project uses `"type": "module"`)
- **React**: Use functional components with hooks


