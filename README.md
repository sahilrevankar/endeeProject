# AI Study Assistant using Endee Vector DB

This project demonstrates a simple yet powerful **Retrieval-Augmented Generation (RAG)** system built with Node.js and Express. It uses **Endee** as a vector database to store and retrieve document snippets based on semantic similarity.

## 🚀 Project Overview

The **AI Study Assistant** allows users to upload study materials (text files), process them into manageable chunks, and query them using natural language. Instead of a simple keyword search, it performs a similarity search in a vector space to find the most relevant context for a user's question.

## 🏗️ The RAG Pipeline

1.  **Extraction**: The server reads the uploaded text file and extracts the content.
2.  **Chunking**: The text is split into chunks of approximately 250 characters. This ensures that the retrieved context is focused and concise.
3.  **Embedding**: Each chunk is converted into a vector (a list of numbers) representing its semantic meaning.
4.  **Storage (Endee)**: The chunks, their IDs, and their embeddings are stored in the **Endee collection** using `collection.add()`.
5.  **Retrieval**: When a user asks a question, the query is converted into an embedding and matched against the stored vectors in Endee using `collection.query()`.
6.  **Response**: The system retrieves the top 3 most relevant chunks and presents them as the answer.

## 🧠 How Endee is Used

**Endee** serves as the vector engine, providing two critical operations:
- **`collection.add()`**: Handles the "Upsert" logic—storing document chunks along with their multi-dimensional embeddings and unique IDs.
- **`collection.query()`**: Handles the "Retrieval" logic—performing a similarity search (using cosine similarity or dot product) to return the most semantically related chunks to the user's input.

## ⚙️ Setup Instructions

To run this project locally, follow these steps:

1.  **Initialize & Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start the Server**:
    ```bash
    node server.js
    ```

3.  **Access the Application**:
    Open your browser and navigate to `http://localhost:3000`.

## 📝 Note on Embeddings

This project uses a **simulated embedding function** in `server.js` that calculates character frequency vectors. This allows the project to run **locally without any API keys**. In a production environment, you can easily replace this with an LLM-based embedding model (like OpenAI's `text-embedding-3-small` or HuggingFace transformers) to achieve true semantic understanding.