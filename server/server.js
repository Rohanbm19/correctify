const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { calculateLevenshteinDistance } = require('../algorithms/levenshtein');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Load Dictionary
let dictionary = [];
try {
    const data = fs.readFileSync(path.join(__dirname, '../dictionary/words.json'), 'utf8');
    dictionary = JSON.parse(data);
} catch (err) {
    console.error("Error loading dictionary:", err);
}

/**
 * REST API Endpoint: /api/check
 * Method: POST
 * Body: { text: "string" }
 */
app.post('/api/check', async (req, res) => {
    const { text } = req.body;

    if (!text || text.trim() === "") {
        return res.status(400).json({ error: "Input text cannot be empty." });
    }

    // Preprocessing: Remove punctuation and split into words
    const words = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(/\s+/);
    
    const results = await Promise.all(words.map(async (word) => {
        const lowerWord = word.toLowerCase();
        
        // 1. Exact match check (Local Dictionary)
        if (dictionary.includes(lowerWord)) {
            return { word, correct: true, suggestions: [] };
        }

        // 2. Fetch suggestions from Datamuse API (Words that sound like the input)
        let apiSuggestions = [];
        try {
            const response = await fetch(`https://api.datamuse.com/words?sl=${encodeURIComponent(lowerWord)}&max=10`);
            const data = await response.json();
            apiSuggestions = data.map(item => item.word);
        } catch (err) {
            console.error("API Fetch Error:", err);
        }

        // 3. Fallback to local dictionary if API fails or returns few results
        const localCandidates = dictionary.slice(0, 50); // Sample local words for diversity
        const allCandidates = [...new Set([...apiSuggestions, ...localCandidates])];

        // 4. Calculate distances using OUR local algorithm
        const rankedSuggestions = allCandidates
            .map(cand => ({
                word: cand,
                distance: calculateLevenshteinDistance(lowerWord, cand)
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 5);

        return {
            word,
            correct: false,
            suggestions: rankedSuggestions
        };
    }));

    res.json({ results });
});

/**
 * REST API Endpoint: /api/visualize
 * Method: POST
 * Body: { word1: "string", word2: "string" }
 */
app.post('/api/visualize', (req, res) => {
    const { word1, word2 } = req.body;
    
    if (!word1 || !word2) {
        return res.status(400).json({ error: "Both words are required for visualization." });
    }

    const { getLevenshteinMatrix } = require('../algorithms/levenshtein');
    const data = getLevenshteinMatrix(word1.toLowerCase(), word2.toLowerCase());
    
    res.json(data);
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;
