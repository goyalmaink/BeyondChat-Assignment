import 'dotenv/config';
import axios from 'axios';

const LARAVEL_API = process.env.LARAVEL_API_URL

export async function fetchLatestArticle() {
    try {
        const res = await axios.get(`${LARAVEL_API}/articles`, { timeout: 8000 });
        const items = res.data || [];
        if (!Array.isArray(items) || items.length === 0) return null;
        return items[0];

    }
    catch (err) {
        if (err.response) {
            throw new Error(`Laravel API returned ${err.response.status}: ${JSON.stringify(err.response.data)}`);
        }
        if (err.code) {
            throw new Error(`Network error when contacting Laravel API: ${err.code}`);
        }
        throw err;
    }
}


