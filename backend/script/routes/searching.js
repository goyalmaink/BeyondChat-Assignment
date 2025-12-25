import getTopTwoExternalLinks from "../Controller/googlesearch.controller.js";
import { fetchLatestArticle } from "../Controller/fetcharticle.controller.js";
import axios from 'axios';

const LARAVEL_API = process.env.LARAVEL_API_URL;

export async function searching() {
    try {
        console.log('Fetching latest article from Laravel API...');
        const article = await fetchLatestArticle();
        if (!article) {
            console.error('No articles found from Laravel API');
            return null;
        }
        const links = await getTopTwoExternalLinks(article.title);
        console.log('\nTop 2 external links found for title:', article.title);
        links.forEach((l, i) => console.log(`${i + 1}. ${l}`));

        if (links && links.length && LARAVEL_API) {
            try {
                await axios.patch(`${LARAVEL_API}/articles/${article.id}`, { reference_articles: links });
                console.log('Updated article with reference_articles');
            } catch (err) {
                console.warn('Could not persist reference_articles to Laravel:', err.message || err);
            }
        }

        return { article, links };

    } catch (err) {
        console.error('Error:', err.message || err);
        throw err;
    }
}

