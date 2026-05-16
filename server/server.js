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
app.post('/api/check', (req, res) => {
    const { text } = req.body;

    if (!text || text.trim() === "") {
        return res.status(400).json({ error: "Input text cannot be empty." });
    }

    // Preprocessing: Remove punctuation and split into words
    const words = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(/\s+/);
    
    const results = words.map(word => {
        const lowerWord = word.toLowerCase();
        
        // Exact match check
        if (dictionary.includes(lowerWord)) {
            return { word, correct: true, suggestions: [] };
        }

        // Calculate distances for all dictionary words
        const suggestions = dictionary.map(dictWord => {
            return {
                word: dictWord,
                distance: calculateLevenshteinDistance(lowerWord, dictWord)
            };
        });

        // Sort by minimum distance and take top 5
        const rankedSuggestions = suggestions
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 5);

        return {
            word,
            correct: false,
            suggestions: rankedSuggestions
        };
    });

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

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
