/**
 * AI Study Assistant | Frontend Logic
 * Handles file selection, upload to server, and querying the Endee vector DB.
 */

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const fileNameDisplay = document.getElementById('file-name');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadStatus = document.getElementById('upload-status');
    const queryInput = document.getElementById('query-input');
    const queryBtn = document.getElementById('query-btn');
    const answerContainer = document.getElementById('answer-container');
    const answerText = document.getElementById('answer-text');
    const loading = document.getElementById('loading');

    let selectedFile = null;

    // Handle file selection
    fileInput.addEventListener('change', (e) => {
        selectedFile = e.target.files[0];
        if (selectedFile) {
            fileNameDisplay.textContent = `Selected: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`;
            uploadBtn.disabled = false;
        } else {
            fileNameDisplay.textContent = "";
            uploadBtn.disabled = true;
        }
    });

    // Handle file upload
    uploadBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        uploadBtn.disabled = true;
        uploadStatus.textContent = "INITIALIZING VECTOR MAPPING...";
        uploadStatus.style.color = "var(--primary)"; // Info blue

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (response.ok) {
                uploadStatus.textContent = `[SUCCESS] ${data.message}`;
                uploadStatus.style.color = "var(--success)"; // Success green
            } else {
                throw new Error(data.error || "Upload failed");
            }
        } catch (error) {
            uploadStatus.textContent = `[FAIL] Error: ${error.message}`;
            uploadStatus.style.color = "var(--danger)"; // Error red
        } finally {
            uploadBtn.disabled = false;
        }
    });

    // Handle query search
    const performQuery = async () => {
        const query = queryInput.value.trim();
        if (!query) return;

        // Reset UI state
        answerContainer.classList.add('hidden');
        loading.classList.remove('hidden');
        queryBtn.disabled = true;

        try {
            const response = await fetch('/api/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });

            const data = await response.json();
            if (response.ok) {
                // Format the output: simulate conversational formatting
                const formattedAnswer = data.answer.split('\n\n---\n\n')
                    .map(chunk => `<div class="chunk-card">${chunk}</div>`)
                    .join('');

                answerText.innerHTML = formattedAnswer;
                answerContainer.classList.remove('hidden');
            } else {
                throw new Error(data.error || "Query failed");
            }
        } catch (error) {
            alert(`Query error: ${error.message}`);
        } finally {
            loading.classList.add('hidden');
            queryBtn.disabled = false;
        }
    };

    queryBtn.addEventListener('click', performQuery);

    // Allow Enter key to trigger search
    queryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performQuery();
    });
});
