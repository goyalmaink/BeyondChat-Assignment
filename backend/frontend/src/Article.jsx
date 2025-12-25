import { useEffect, useState } from "react";
import { fetchArticles, fetchRelatedLinks, refreshLatestArticle } from "./service/api";
import ArticleCard from "./components/Article";
import RelatedLinks from "./components/Links";


export default function Articles() {
    const [articles, setArticles] = useState([]);
    const [activeArticleId, setActiveArticleId] = useState(null);
    const [links, setLinks] = useState([]);
    const [loadingLinks, setLoadingLinks] = useState(false);

    useEffect(() => {
        fetchArticles().then(setArticles);
    }, []);

    const [toast, setToast] = useState(null);

    async function handleRefresh() {
        // Trigger Laravel to fetch the latest article and persist it (if any)
        try {
            const res = await refreshLatestArticle();
            if (res && res.id) {
                // Prepend the new article and immediately fetch related links
                setArticles(prev => [res, ...prev]);
                handleFindLinks(res);
                setToast(`New article added: ${res.title}`);
                setTimeout(() => setToast(null), 3500);
            } else {
                // No new article found (204) or message
                setToast('No new article found');
                setTimeout(() => setToast(null), 2500);
            }
        } catch (err) {
            console.error('Refresh failed', err);
            setToast('Refresh failed — check console');
            setTimeout(() => setToast(null), 3500);
        }
    }

    async function handleFindLinks(article) {
        setActiveArticleId(article.id);
        setLinks([]);
        setLoadingLinks(true);

        try {
            const res = await fetchRelatedLinks(article.title);
            setLinks(res.links || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingLinks(false);
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Latest Articles</h1>
                <div>
                    <button
                        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                        onClick={handleRefresh}
                    >
                        Refresh New Article
                    </button>
                </div>
            </div>

            {articles.map(article => (
                <div key={article.id}>
                    <ArticleCard
                        article={article}
                        onFindLinks={() => handleFindLinks(article)}
                    />

                    {activeArticleId === article.id && (
                        <RelatedLinks links={links} loading={loadingLinks} />
                    )}
                </div>
            ))}
        </div>
    );
}
