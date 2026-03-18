# Directive: AI Study Assistant (RAG Pipeline)

## Goal
Implement a fully functional RAG system using Node.js and the Endee Vector Database.

## Implementation Details
- **Frontend**: Vanilla JavaScript + Outfit Typography + Modern UI themes (Glassmorphism/Minimalism).
- **Backend**: Express.js server for handling file uploads and vector queries.
- **Vector DB Layer (Endee)**: Local mock implementation using `collection.add()` and `collection.query()` to demonstrate similarity search.
- **Embedding Layer**: Deterministic character-frequency vectorization (local-only, no API key).

## Project Flow
1.  **Ingest**: User uploads a `.txt` file.
2.  **Process**: Server chunks the text and initializes embeddings.
3.  **Store**: `collection.add()` saves the vector data.
4.  **Query**: `collection.query()` retrieves relevant chunks based on semantic distance.

## Key Methods
- `getEmbeddings(text)`: Mock generator for semantic vectors.
- `chunkText(text)`: Segmenting text for localized context retrieval.
