const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Set up storage for uploaded files
const upload = multer({ dest: '.tmp/' });

// --- Endee Vector Database Mock Implementation ---
class EndeeCollection {
    constructor() {
        this.data = []; // Stores { id, embedding, text }
    }

    /**
     * Store embeddings, IDs, and original text in Endee
     * @param {Object} entry { ids, embeddings, metadatas, documents }
     */
    add({ ids, embeddings, metadatas, documents }) {
        for (let i = 0; i < ids.length; i++) {
            this.data.push({
                id: ids[i],
                embedding: embeddings[i],
                metadata: metadatas ? metadatas[i] : {},
                text: documents[i]
            });
        }
        console.log(`[Endee] Stored ${ids.length} entries. Total data in Endee: ${this.data.length} entries.`);
    }

    /**
     * Perform similarity search using Endee
     * @param {Object} queryOptions { queryEmbeddings, nResults }
     */
    query({ queryEmbeddings, nResults }) {
        const queryVector = queryEmbeddings[0];
        
        // Calculate cosine similarity (mock implementation)
        const results = this.data.map(item => {
            const similarity = this.calculateCosineSimilarity(queryVector, item.embedding);
            return { ...item, similarity };
        });

        // Sort by similarity descending
        results.sort((a, b) => b.similarity - a.similarity);

        // Filter: Keep unique text strings and similarity > 0
        const uniqueTexts = new Set();
        const topResults = [];

        for (const item of results) {
            // If the chunk doesn't match the query conceptually, stop (threshold > 0)
            if (item.similarity <= 0 && topResults.length > 0) continue; 

            if (!uniqueTexts.has(item.text)) {
                uniqueTexts.add(item.text);
                topResults.push(item);
                if (topResults.length === nResults) break;
            }
        }
        
        console.log(`[Endee] Query returned ${topResults.length} unique results.`);
        topResults.forEach((r, idx) => console.log(`  Top ${idx + 1} (sim: ${r.similarity.toFixed(4)}): ${r.text.substring(0, 50)}...`));

        return {
            documents: [topResults.map(r => r.text)],
            ids: [topResults.map(r => r.id)]
        };
    }

    /**
     * Basic Dot Product for Vector Similarity (Mock)
     */
    calculateCosineSimilarity(vecA, vecB) {
        let dotProduct = 0;
        let magA = 0;
        let magB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            magA += vecA[i] * vecA[i];
            magB += vecB[i] * vecB[i];
        }
        return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
    }
}

// Instantiate Endee
const collection = new EndeeCollection();

// --- Helper Functions ---

/**
 * Mock Embedding Function: Converts text into a normalized vector based on word hashes.
 * This is a deterministic mock for demonstration purposes without API keys.
 */
function getEmbeddings(text) {
    const vector = new Array(100).fill(0);
    const words = text.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/);
    for (const word of words) {
        if (!word) continue;
        // Simple hash function for the word
        let hash = 0;
        for (let i = 0; i < word.length; i++) {
            hash = (hash << 5) - hash + word.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
        }
        const index = Math.abs(hash) % 100;
        vector[index]++;
    }
    // Normalize vector
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => val / (magnitude || 1));
}

/**
 * Chunker: Splits text into meaningful chunks, not breaking sentences badly.
 */
function chunkText(text, size = 300) {
    const sentences = text.match(/[^.!?]+[.!?]+|\s+$/g) || [text];
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > size && currentChunk.trim().length > 0) {
            chunks.push(currentChunk.trim());
            currentChunk = '';
        }
        currentChunk += sentence + ' ';
    }
    if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
    }
    return chunks.length > 0 ? chunks : [text];
}

// --- Express API Middleware ---
app.use(express.json());
app.use(express.static('.'));

// --- Endpoints ---

/**
 * Endpoint to upload a text file and populate Endee
 */
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send({ error: 'No file uploaded.' });

    try {
        const filePath = req.file.path;
        const text = fs.readFileSync(filePath, 'utf-8');
        
        console.log(`\n[API] Upload received. File size: ${text.length} chars`);
        
        // chunk the text into roughly 250 characters
        const chunks = chunkText(text, 250);
        console.log(`[API] Created ${chunks.length} chunks from the file.`);
        
        const ids = [];
        const embeddings = [];
        const documents = [];

        chunks.forEach((chunk, index) => {
            ids.push(`id-${Date.now()}-${index}`);
            embeddings.push(getEmbeddings(chunk));
            documents.push(chunk);
        });

        // Store in Endee collection (clear past data so only newest file is searched)
        collection.data = []; 
        collection.add({ ids, embeddings, documents });

        // Clean up temp file
        fs.unlinkSync(filePath);

        res.json({ message: `Successfully stored ${chunks.length} chunks in Endee.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error processing file.' });
    }
});

/**
 * Endpoint for user queries (Similarity search in Endee)
 */
app.post('/api/query', (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required.' });

    console.log(`\n[API] Search query received: "${query}"`);

    // Convert query into embedding
    const queryVector = getEmbeddings(query);

    // Perform similarity search using Endee
    const searchResult = collection.query({
        queryEmbeddings: [queryVector],
        nResults: 3
    });

    if (!searchResult.documents || !searchResult.documents[0] || searchResult.documents[0].length === 0) {
        return res.json({ answer: "No relevant information found." });
    }

    // Retrieve combined text
    const responseText = searchResult.documents[0].join('\n\n---\n\n');
    res.json({ answer: responseText });
});

app.listen(port, () => {
    console.log(`AI Study Assistant listening at http://localhost:${port}`);
    // Keep alive heartbeat for this environment
    setInterval(() => {}, 1000 * 60 * 60);
});
