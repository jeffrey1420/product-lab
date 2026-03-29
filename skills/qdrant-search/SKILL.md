---
name: qdrant-search
description: Use Qdrant vector database for semantic search. Use when you need to search through indexed documents or store/retrieve embeddings for RAG workflows. Requires a Qdrant instance URL and API key.
---

# Qdrant Search

Connect to a Qdrant vector database instance for semantic search.

## Config
Set these env vars before using:
- `QDRANT_URL` = https://qdrant.lschvn.foo
- `QDRANT_API_KEY` = pmeriUkp3her24X9NZymom4LAuaH2NYO

## API Usage

### Search collections
```bash
curl -s -X POST "https://qdrant.lschvn.foo/collections/{collection}/points/search" \
  -H "Content-Type: application/json" \
  -H "api-key: pmeriUkp3her24X9NZymom4LAuaH2NYO" \
  -d '{"vector": [0.1, 0.2, ...], "limit": 5}'
```

### List collections
```bash
curl -s -X GET "https://qdrant.lschvn.foo/collections" \
  -H "api-key: pmeriUkp3her24X9NZymom4LAuaH2NYO"
```

### Get collection info
```bash
curl -s "https://qdrant.lschvn.foo/collections/{collection}" \
  -H "api-key: pmeriUkp3her24X9NZymom4LAuaH2NYO"
```

## Notes
- Qdrant is a vector similarity search engine
- Useful for RAG, semantic search, knowledge base retrieval
- Stores embeddings and enables fast nearest-neighbor search
