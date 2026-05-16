/**
 * Levenshtein Distance Algorithm (Dynamic Programming)
 * 
 * The Levenshtein distance is a string metric for measuring the difference between two sequences.
 * Informally, the Levenshtein distance between two words is the minimum number of single-character 
 * edits (insertions, deletions or substitutions) required to change one word into the other.
 * 
 * Time Complexity: O(m * n) - where m and n are the lengths of the two strings.
 * Space Complexity: O(m * n) - to store the DP table.
 * 
 * Why DP?
 * DP is efficient here because it avoids redundant calculations of the same subproblems.
 * Without DP (recursive approach), many sub-distances would be recalculated multiple times,
 * leading to exponential time complexity O(3^n).
 */

function calculateLevenshteinDistance(str1, str2) {
    const { matrix } = getLevenshteinMatrix(str1, str2);
    return matrix[str1.length][str2.length];
}

function getLevenshteinMatrix(str1, str2) {
    const m = str1.length;
    const n = str2.length;

    // Create a DP table (2D array) of size (m+1) x (n+1)
    const matrix = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    // Base cases
    for (let i = 0; i <= m; i++) matrix[i][0] = i;
    for (let j = 0; j <= n; j++) matrix[0][j] = j;

    // Fill the DP table
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = 1 + Math.min(
                    matrix[i - 1][j],    // Deletion
                    matrix[i][j - 1],    // Insertion
                    matrix[i - 1][j - 1] // Substitution
                );
            }
        }
    }

    return {
        matrix,
        str1: str1.split(''),
        str2: str2.split('')
    };
}

module.exports = { calculateLevenshteinDistance, getLevenshteinMatrix };
