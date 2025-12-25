import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import getTopTwoExternalLinks from './Controller/googlesearch.controller.js';
import { searching } from './routes/searching.js';

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

// Simple CORS middleware for local development
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/', (req, res) => {
    res.send('Google Search API is running');
    console.log('Backend is running');
});

// Provide the Article title by the User itself for testing purposes
app.post('/related-articles', async (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is missing' });
    }
    try {
        const links = await getTopTwoExternalLinks(title);
        return res.json({ links });
    } catch (err) {
        console.error('Error occured in related article APIs:', err.message || err);
        return res.status(500).json({ error: 'Failed to fetch related articles' });
    }
});

// Trigger the full flow: fetch latest article from Laravel and search for related links
app.post('/fetch-latest-and-search', async (req, res) => {
    try {
        const result = await searching();
        res.status(200).json(result || { message: 'Completed (no new data)' });
    } catch (err) {
        console.error('Error Occured in fetch and search api', err.message || err);
        res.status(500).json({ error: err.message || 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

