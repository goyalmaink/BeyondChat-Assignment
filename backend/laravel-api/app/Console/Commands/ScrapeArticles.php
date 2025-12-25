<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Article;
use Illuminate\Support\Facades\Http;
use Symfony\Component\DomCrawler\Crawler;

class ScrapeArticles extends Command
{
    protected $signature = 'scrape:articles';
    protected $description = 'Scrape articles from BeyondChats blog';

    public function handle()
    {
        // https://beyondchats.com/blogs/
        $url = 'https://beyondchats.com/blogs/';
        
        try {
            $response = Http::withHeaders(['User-Agent' => 'BeyondChatScraper/1.0 (+dev@beyondchats.com)'])
                        ->retry(2, 200)
                        ->get($url);

            if (! $response->successful()) {
                $this->error("Failed to fetch {$url} (status: {$response->status()})");
                return;
            }

            $html = $response->body();
            $crawler = new Crawler($html);

            $lastPageUrl = null;
            if ($crawler->filter('a[rel="last"], .pagination a, .page-numbers a')->count()) {
                $maxPage = 0;
                $crawler->filter('a[rel="last"], .pagination a, .page-numbers a')->each(function (Crawler $node) use (&$maxPage, &$lastPageUrl) {
                    $href = $node->attr('href');
                    if (! $href) return;
                    if (preg_match_all('/(\d+)/', $href, $m)) {
                        $nums = $m[1];
                        $num = (int) end($nums);
                        if ($num > $maxPage) {
                            $maxPage = $num;
                            $lastPageUrl = $href;
                        }
                    } else {
                        $lastPageUrl = $href;
                    }
                });
            }

            if ($lastPageUrl) {
                $lastPageUrl = $this->makeAbsoluteUrl($lastPageUrl);
                $this->info("Found last page: {$lastPageUrl}");
                $response = Http::withHeaders(['User-Agent' => 'BeyondChatScraper/1.0 (+dev@beyondchats.com)'])
                            ->retry(2, 200)
                            ->get($lastPageUrl);

                if (! $response->successful()) {
                    $this->error("Failed to fetch last page {$lastPageUrl} (status: {$response->status()})");
                    return;
                }

                $html = $response->body();
                $crawler = new Crawler($html);
            }

            $articlesByUrl = [];
            $crawler->filter('article a, .blog-post a, .article-link, .post-card a, article h2 a')->each(function (Crawler $node) use (&$articlesByUrl) {
                $link = $node->attr('href');
                $title = trim($node->text());

                if (! $link || ! $title) {
                    return;
                }

                $abs = $this->makeAbsoluteUrl($link);

                if (preg_match('#/(author|tag|category)/#i', parse_url($abs, PHP_URL_PATH))) {
                    return;
                }

                if (strpos($abs, 'beyondchats.com') === false) {
                    return;
                }

                if (! isset($articlesByUrl[$abs])) {
                    $articlesByUrl[$abs] = ['url' => $abs, 'title' => $title];
                }
            });

            $articles = array_values($articlesByUrl);
            $articles = array_slice($articles, 0, 5);

            foreach ($articles as $articleData) {
                $this->scrapeArticleContent($articleData);
                sleep(1);
            }
            
            $this->info('Scraping completed!');
            
        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
        }
    }
    
    private function scrapeArticleContent($articleData)
    {
        try {
            $response = Http::withHeaders(['User-Agent' => 'BeyondChatScraper/1.0 (+dev@beyondchats.com)'])
                        ->retry(2, 200)
                        ->get($articleData['url']);

            if (! $response->successful()) {
                $this->error("Failed to fetch {$articleData['url']} (status: {$response->status()})");
                return;
            }

            $crawler = new Crawler($response->body());

            $contentNode = $crawler->filter('article, .post-content, .article-content');
            if ($contentNode->count() === 0) {
                $this->warn('Skipping non-article page: ' . $articleData['url']);
                return;
            }

            $content = trim($contentNode->first()->html());

            $authorNode = $crawler->filter('.author, .by-line');
            $author = $authorNode->count() ? trim($authorNode->first()->text()) : 'Unknown';

            $publishedAt = null;
            if ($crawler->filter('meta[property="article:published_time"], meta[name="published_time"], meta[name="pubdate"], time[datetime]')->count()) {
                if ($crawler->filter('meta[property="article:published_time"]')->count()) {
                    $publishedAt = $crawler->filter('meta[property="article:published_time"]')->first()->attr('content');
                } elseif ($crawler->filter('meta[name="published_time"]')->count()) {
                    $publishedAt = $crawler->filter('meta[name="published_time"]')->first()->attr('content');
                } elseif ($crawler->filter('time[datetime]')->count()) {
                    $publishedAt = $crawler->filter('time[datetime]')->first()->attr('datetime');
                }
            }

            Article::updateOrCreate(
                ['url' => $articleData['url']],
                [
                    'title' => $articleData['title'],
                    'content' => $content,
                    'author' => $author,
                    'published_at' => $publishedAt ? $publishedAt : now(),
                ]
            );

            $this->info('Scraped: ' . $articleData['title']);

        } catch (\Exception $e) {
            $this->error('Failed to scrape ' . $articleData['url'] . ': ' . $e->getMessage());
        }
    }
    
    private function makeAbsoluteUrl($url)
    {
        if (str_starts_with($url, 'http')) {
            return $url;
        }
        return 'https://beyondchats.com' . (str_starts_with($url, '/') ? '' : '/') . $url;
    }
}