document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const checkBtn = document.getElementById('checkBtn');
    const clearBtn = document.getElementById('clearBtn');
    const resultsSection = document.getElementById('resultsSection');
    const processedText = document.getElementById('processedText');
    const suggestionsList = document.getElementById('suggestionsList');
    const visualizerModal = document.getElementById('visualizerModal');
    const closeModal = document.getElementById('closeModal');
    const dpMatrix = document.getElementById('dpMatrix');
    const explanationBox = document.getElementById('explanationBox');
    const vizWord1 = document.getElementById('vizWord1');
    const vizWord2 = document.getElementById('vizWord2');

    checkBtn.addEventListener('click', async () => {
        const text = inputText.value.trim();
        if (!text) return alert("Please enter some text.");

        checkBtn.disabled = true;
        checkBtn.innerHTML = "<span>Processing...</span><div class='btn-shine'></div>";

        try {
            const response = await fetch('/api/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            const data = await response.json();
            displayResults(data.results);
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to connect to the server.");
        } finally {
            checkBtn.disabled = false;
            checkBtn.innerHTML = "<span>Check Spelling</span><div class='btn-shine'></div>";
        }
    });

    clearBtn.addEventListener('click', () => {
        inputText.value = "";
        resultsSection.classList.add('hidden');
    });

    closeModal.addEventListener('click', () => {
        visualizerModal.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
        if (e.target === visualizerModal) visualizerModal.classList.add('hidden');
    });

    function displayResults(results) {
        resultsSection.classList.remove('hidden');
        processedText.innerHTML = "";
        suggestionsList.innerHTML = "";

        results.forEach(item => {
            const span = document.createElement('span');
            span.textContent = item.word + " ";
            
            if (!item.correct) {
                span.className = "incorrect-word";
                
                // Add to suggestions grid
                const card = document.createElement('div');
                card.className = "suggestion-card";
                card.innerHTML = `<h4>"${item.word}"</h4>`;
                
                if (item.suggestions.length > 0) {
                    item.suggestions.forEach(sug => {
                        const sugDiv = document.createElement('div');
                        sugDiv.className = "suggestion-item";
                        sugDiv.innerHTML = `
                            <span class="suggestion-word">${sug.word}</span>
                            <div class="suggestion-meta">
                                <span class="suggestion-dist">dist: ${sug.distance}</span>
                                <button class="view-working-btn" data-word1="${item.word}" data-word2="${sug.word}">View Working</button>
                            </div>
                        `;
                        card.appendChild(sugDiv);
                    });
                } else {
                    card.innerHTML += `<p style="font-size: 0.8rem; color: var(--text-dim)">No suggestions found</p>`;
                }
                suggestionsList.appendChild(card);
            }
            
            processedText.appendChild(span);
        });

        // Add event listeners to "View Working" buttons
        document.querySelectorAll('.view-working-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                showVisualizer(btn.dataset.word1, btn.dataset.word2);
            });
        });

        // Add event listeners to suggestion words for "Click to Correct"
        document.querySelectorAll('.suggestion-word').forEach(wordSpan => {
            wordSpan.addEventListener('click', () => {
                const originalWord = wordSpan.closest('.suggestion-card').querySelector('h4').textContent.replace(/"/g, '');
                const correctedWord = wordSpan.textContent;
                applyCorrection(originalWord, correctedWord);
            });
        });
        
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    function applyCorrection(original, corrected) {
        const text = inputText.value;
        // Use regex with word boundaries to replace only the specific word
        const regex = new RegExp(`\\b${original}\\b`, 'gi');
        inputText.value = text.replace(regex, corrected);
        
        // Re-trigger the check automatically to show the updated results
        checkBtn.click();
    }

    async function showVisualizer(word1, word2) {
        console.log(`Visualizing: "${word1}" vs "${word2}"`);
        
        // Ensure words are strings and not undefined
        word1 = String(word1 || "");
        word2 = String(word2 || "");

        vizWord1.textContent = `"${word1}"`;
        vizWord2.textContent = `"${word2}"`;
        dpMatrix.innerHTML = "<tr><td colspan='100%' style='padding: 20px;'>Loading matrix...</td></tr>";
        explanationBox.textContent = "Fetching data from server...";
        visualizerModal.classList.remove('hidden');

        try {
            const response = await fetch('/api/visualize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ word1, word2 })
            });
            const data = await response.json();
            console.log("Matrix data received:", data);
            
            if (data.error) throw new Error(data.error);
            
            renderMatrix(data);
            explanationBox.textContent = "Hover over a cell to see the calculation steps.";
        } catch (error) {
            console.error("Visualization error:", error);
            dpMatrix.innerHTML = `<tr><td colspan='100%' style='color: var(--error); padding: 20px;'>Error: ${error.message}</td></tr>`;
            explanationBox.textContent = "Failed to load visualization data.";
        }
    }

    function renderMatrix(data) {
        const { matrix, str1, str2 } = data;
        let html = '<tr><th></th><th></th>';
        
        // Header row (str2)
        str2.forEach(char => html += `<th>${char}</th>`);
        html += '</tr>';

        for (let i = 0; i <= str1.length; i++) {
            html += '<tr>';
            // Row header (str1)
            if (i === 0) html += '<th></th>';
            else html += `<th>${str1[i-1]}</th>`;

            for (let j = 0; j <= str2.length; j++) {
                const isMatch = i > 0 && j > 0 && str1[i-1] === str2[j-1];
                let className = "";
                if (isMatch) className = "match-cell";
                
                html += `<td id="cell-${i}-${j}" data-i="${i}" data-j="${j}">${matrix[i][j]}</td>`;
            }
            html += '</tr>';
        }
        dpMatrix.innerHTML = html;

        // Add hover effects
        const cells = dpMatrix.querySelectorAll('td');
        cells.forEach(cell => {
            cell.addEventListener('mouseenter', () => {
                const i = parseInt(cell.dataset.i);
                const j = parseInt(cell.dataset.j);
                highlightCalculation(i, j, matrix, str1, str2);
            });
            cell.addEventListener('mouseleave', () => {
                clearHighlights();
            });
        });
    }

    function highlightCalculation(i, j, matrix, str1, str2) {
        const currentCell = document.getElementById(`cell-${i}-${j}`);
        currentCell.classList.add('highlight');

        if (i === 0 && j === 0) {
            explanationBox.textContent = "Starting point: Empty strings match (distance 0).";
            return;
        }

        if (i === 0) {
            explanationBox.textContent = `Insertion of "${str2[j-1]}": 1 + previous distance (${matrix[0][j-1]}) = ${matrix[0][j]}`;
            document.getElementById(`cell-0-${j-1}`).classList.add('source');
            return;
        }

        if (j === 0) {
            explanationBox.textContent = `Deletion of "${str1[i-1]}": 1 + previous distance (${matrix[i-1][0]}) = ${matrix[i][0]}`;
            document.getElementById(`cell-${i-1}-0`).classList.add('source');
            return;
        }

        const char1 = str1[i-1];
        const char2 = str2[j-1];
        
        if (char1 === char2) {
            explanationBox.textContent = `Match: "${char1}" === "${char2}". Take diagonal value (${matrix[i-1][j-1]}).`;
            document.getElementById(`cell-${i-1}-${j-1}`).classList.add('source');
            document.getElementById(`cell-${i-1}-${j-1}`).style.backgroundColor = "var(--success)";
        } else {
            const sub = matrix[i-1][j-1];
            const del = matrix[i-1][j];
            const ins = matrix[i][j-1];
            const min = Math.min(sub, del, ins);
            
            let op = "";
            if (min === sub) op = "Substitution";
            else if (min === del) op = "Deletion";
            else op = "Insertion";

            explanationBox.innerHTML = `
                Mismatch: "${char1}" vs "${char2}".<br>
                Take 1 + min(Diag: ${sub}, Top: ${del}, Left: ${ins}) = 1 + ${min} = ${matrix[i][j]}.<br>
                Action: <strong>${op}</strong>
            `;
            
            document.getElementById(`cell-${i-1}-${j-1}`).classList.add('source');
            document.getElementById(`cell-${i-1}-${j}`).classList.add('source');
            document.getElementById(`cell-${i}-${j-1}`).classList.add('source');
        }
    }

    function clearHighlights() {
        document.querySelectorAll('td').forEach(c => {
            c.classList.remove('highlight', 'source');
            c.style.backgroundColor = "";
        });
    }
});
