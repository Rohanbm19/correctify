# Viva Questions and Answers

**Q1: What is Levenshtein Distance?**
*A:* It is a string metric for measuring the difference between two sequences. It counts the minimum number of edits (insertion, deletion, substitution) to transform one string into another.

**Q2: Why did you use Dynamic Programming for this?**
*A:* Because the problem has overlapping subproblems. A recursive approach would recalculate the same distances multiple times. DP allows us to store these results in a table, reducing time complexity from exponential to polynomial.

**Q3: What are the base cases in your DP table?**
*A:* If one string is empty, the distance is the length of the other string (all insertions or all deletions). This fills the first row and first column of our matrix.

**Q4: How does the system handle uppercase and lowercase?**
*A:* All input words and dictionary words are converted to lowercase before comparison to ensure consistency.

**Q5: What are the limitations of this system?**
*A:* It only corrects single words based on a fixed dictionary. It does not handle grammar or contextual errors (e.g., "their" vs "there").

**Q6: What is the Time Complexity?**
*A:* O(m * n) for a single comparison. For checking against a dictionary of size D, it is O(D * m * n).

**Q7: Can we optimize the space complexity?**
*A:* Yes, since we only need the previous row to calculate the current row, we can reduce space complexity from O(m * n) to O(min(m, n)).
