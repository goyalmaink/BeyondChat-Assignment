<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\DomCrawler\Crawler;
use Illuminate\Support\Str;

class ArticleController extends Controller
{
    public function index()
    {
        return response()->json(Article::latest()->get());
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'url' => 'required|url',
            'content' => 'required|string',
            'updated_content' => 'nullable|string',
            'reference_articles' => 'nullable|array',
            'is_updated' => 'boolean'
        ]);
        
        $article = Article::create($validated);
        return response()->json($article, 201);
    }
    
    public function show(Article $article)
    {
        return response()->json($article);
    }
    
    public function update(Request $request, Article $article)
    {
        $validated = $request->validate([
            'title' => 'string|max:255',
            'content' => 'string',
            'updated_content' => 'nullable|string',
            'reference_articles' => 'nullable|array',
            'is_updated' => 'boolean'
        ]);
        
        $article->update($validated);
        return response()->json($article);
    }
    
    public function destroy(Article $article)
    {
        $article->delete();
        return response()->json(null, 204);
    }

    public function refresh(Request $request)
    {
        $listingUrl = 'https://beyondchats.com/blogs/';
        $resp = Http::get($listingUrl);
        if (!$resp->successful()) {
            return response()->json(['error' => 'Failed to fetch listing'], 502);
        }

        $crawler = new Crawler($resp->body());
        $linkNodes = $crawler->filter('article h2 a, .post-card a, .blog-post a, .entry-title a');
        $links = [];
        foreach ($linkNodes as $node) {
            $href = $node->getAttribute('href');
            $text = trim($node->textContent ?: '');
            if (!$href) continue;
            $abs = $this->makeAbsoluteUrl($href, $listingUrl);
            $links[$abs] = $text ?: $abs;
        }

        foreach ($links as $url => $title) {
            if (Article::where('url', $url)->exists()) continue;
            $ar = Http::get($url);
            if (!$ar->successful()) continue;
            $c = new Crawler($ar->body());
            $contentNode = null;
            foreach (['article', '.post-content', '.article-content', '.entry-content'] as $sel) {
                try {
                    $node = $c->filter($sel);
                    if ($node->count()) { $contentNode = $node->first(); break; }
                } catch (\Exception $e) { continue; }
            }
            if (!$contentNode) continue;

            $html = trim($contentNode->html());
            $excerpt = Str::limit(strip_tags($html), 200);

            $author = null;
            foreach (['.author', '.by-line', '.post-author', '.vcard'] as $sel) {
                try {
                    $n = $c->filter($sel);
                    if ($n->count()) { $author = trim($n->first()->text()); break; }
                } catch (\Exception $e) { continue; }
            }
            $author = $author ?: 'Unknown';

            $publishedAt = null;
            try {
                if ($c->filter('meta[property="article:published_time"]')->count()) {
                    $publishedAt = $c->filter('meta[property="article:published_time"]')->attr('content');
                } elseif ($c->filter('time[datetime]')->count()) {
                    $publishedAt = $c->filter('time[datetime]')->attr('datetime');
                }
            } catch (\Exception $e) {  }

                $pageTitle = null;
                try {
                    if ($c->filter('title')->count()) {
                        $pageTitle = trim($c->filter('title')->text());
                    }
                } catch (\Exception $e) {
                    $pageTitle = null;
                }

                $article = Article::create([
                    'title' => $title ?: ($pageTitle ?: 'Untitled'),
                    'url' => $url,
                    'content' => $html,
                    'excerpt' => $excerpt,
                    'author' => $author,
                    'published_at' => $publishedAt,
                ]);

            return response()->json($article, 201);
        }

        return response()->json(['message' => 'No new article found'], 204);
    }

    private function makeAbsoluteUrl($href, $base)
    {
        if (strpos($href, 'http') === 0) return $href;
        if (strpos($href, '/') === 0) {
            $u = parse_url($base);
            return ($u['scheme'] ?? 'https') . '://' . ($u['host'] ?? '') . $href;
        }
        return rtrim($base, '/') . '/' . ltrim($href, '/');
    }
}
