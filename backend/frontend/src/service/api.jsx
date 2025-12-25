const LARAVEL_API = "http://localhost:8000/api";
const NODE_API = "http://localhost:3000";

export async function fetchArticles() {
    const res = await fetch(`${LARAVEL_API}/articles`);
    if (!res.ok) throw new Error("Failed to fetch articles");
    return res.json();
}

export async function fetchRelatedLinks(title) {
    const res = await fetch(`${NODE_API}/related-articles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title })
    });
    if (!res.ok) throw new Error("Failed to fetch related links");
    return res.json();
}

export async function refreshLatestArticle() {
    const res = await fetch(`${LARAVEL_API}/articles/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });
    if (!res.ok && res.status !== 204) throw new Error("Failed to refresh latest article");
    if (res.status === 204) return { message: 'No new article found' };
    return res.json();
}
