# Mini Project Report: Text Autocorrection System

## 1. Introduction
The Text Autocorrection and Spell Checker is a system designed to detect typographical errors in user input and suggest corrections. It utilizes the Levenshtein Distance algorithm, implemented via Dynamic Programming, to identify the most likely intended words from a predefined dictionary.

## 2. Algorithm Analysis (DAA)
### Levenshtein Distance
Defined as the minimum number of single-character edits (insertions, deletions, or substitutions) required to change one word into another.

#### Complexity:
- **Time Complexity**: O(m * n), where m and n are the lengths of the two strings.
- **Space Complexity**: O(m * n) to store the DP table.

### Why Dynamic Programming?
A naive recursive approach would have a complexity of O(3^n), which is computationally expensive for long words. DP optimizes this by breaking the problem into subproblems and storing results in a matrix, ensuring each subproblem is solved only once.

### Mathematical Formulation
The distance $L(i, j)$ between $str1[1..i]$ and $str2[1..j]$ is calculated as:
- If $str1[i] == str2[j]$, $L(i, j) = L(i-1, j-1)$
- Otherwise, $L(i, j) = 1 + \min($
    - $L(i-1, j)$ (Deletion)
    - $L(i, j-1)$ (Insertion)
    - $L(i-1, j-1)$ (Substitution)
$)$

### Visualization Example
For strings **"kitten"** and **"sitting"**, the DP matrix is filled iteratively. Each cell represents the minimum edits for that prefix. The bottom-right cell contains the final distance.
- **Match**: Diagonal move.
- **Substitution**: 1 + Diagonal.
- **Insertion**: 1 + Left.
- **Deletion**: 1 + Up.

## 3. Implementation Details
- **Dictionary**: A JSON-based repository of 500+ common English words.
- **Backend**: Express.js handles API requests and performs the algorithm computation.
- **Frontend**: A responsive UI with real-time feedback and distance visualization.

## 4. Test Cases
| Input | Detected Error | Suggestions | Top Distance |
|-------|----------------|-------------|--------------|
| "Helllo" | "Helllo" | "Hello" | 1 |
| "Phon" | "Phon" | "Phone" | 1 |
| "Cmputer" | "Cmputer" | "Computer" | 1 |

## 5. Conclusion
The project successfully demonstrates the application of Dynamic Programming in solving real-world string manipulation problems efficiently.
