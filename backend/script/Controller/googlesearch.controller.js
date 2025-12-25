import 'dotenv/config';
import axios from 'axios';

async function getTopTwoExternalLinks(articleTitle) {
    const API_KEY = process.env.GOOGLE_API_KEY;
    const CX = process.env.GOOGLE_CX;

    if (!API_KEY || !CX) {
        throw new Error('Missing GOOGLE_API_KEY or GOOGLE_CX environment variables');
    }

    const query = encodeURIComponent(`${articleTitle} blog article`);
    const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${query}`;

    try {
        console.log(`Searching Google for: "${articleTitle}"`);
        const response = await axios.get(url);
        const results = response.data.items || [];

        const externalLinks = results
            .map(item => item.link)
            .filter(link => {
                const isInternal = link.includes('beyondchats.com');
                const isSocial = link.includes('linkedin.com') ||
                    link.includes('facebook.com') ||
                    link.includes('twitter.com') ||
                    link.includes('youtube.com');
                return !isInternal && !isSocial;
            });

        const topTwoLinks = externalLinks.slice(0, 2);

        return topTwoLinks;
    } catch (error) {
        console.error("Google Search Error:", error.response?.data?.error?.message || error.message);
        return [];
    }
}

export default getTopTwoExternalLinks;