# Correctify | Text Autocorrection & Spell Checker

A complete college mini-project demonstrating the **Levenshtein Distance Algorithm** using **Dynamic Programming**.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```
The application will be available at [http://localhost:3000](http://localhost:3000).

## 🧠 Algorithm: Levenshtein Distance (DP)
This project uses Dynamic Programming to calculate the minimum edit distance between words.

- **Optimal Substructure**: The distance between two strings can be computed from the distances of their prefixes.
- **Overlapping Subproblems**: Many recursive calls compute the same sub-distances; DP stores these in a table to ensure O(m*n) complexity.

## 🛠️ Tech Stack
- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Algorithm**: Dynamic Programming
