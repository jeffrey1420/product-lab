# Self-Hosted AI/LLM Tools for AI Agent Development

> Research compiled March 2026. Context: OpenClaw AI assistant, SearXNG, Coolify. Building Alizé (AI agency), ts.news, Kuroba (web agency).

## Table of Contents

1. [LLM Inference & Model Serving](#1-llm-inference--model-serving)
2. [Embedding Models & Tools](#2-embedding-models--tools)
3. [Vector Databases](#3-vector-databases)
4. [RAG Frameworks](#4-rag-frameworks)
5. [AI Agent Frameworks](#5-ai-agent-frameworks)
6. [Prompt Management & Observability](#6-prompt-management--observability)
7. [Model Context Protocol (MCP)](#7-model-context-protocol-mcp)
8. [Recommended Stacks for Your Use Cases](#8-recommended-stacks-for-your-use-cases)
9. [Honest Assessment: Useful vs Over-Engineered](#9-honest-assessment-useful-vs-over-engineered)

---

## TL;DR — What to Actually Use

| Layer | Recommendation | Docker Difficulty | Resource Needs |
|-------|---------------|------------------|----------------|
| **Model Serving** | **Ollama** for dev, **vLLM** for prod | Trivial / Medium | 8GB+ VRAM for 7B, 24GB for 70B |
| **Vector DB** | **Qdrant** or **Chroma** (local) | Easy | Minimal — just storage |
| **RAG** | **LlamaIndex** or **AnythingLLM** | Easy | RAM-bound |
| **Agent Framework** | **n8n** (no-code), ** crewai** (multi-agent) | Easy | Depends on model |
| **Prompt Management** | **Langfuse** (open source) | Medium | PostgreSQL + Redis |
| **MCP** | Use for tool-calling parity with Claude | Easy | Minimal |

---

## 1. LLM Inference & Model Serving

These tools run open-source LLMs on your own hardware, exposing an OpenAI-compatible API.

### Ollama — The "Docker for LLMs"

**What it does:** Single-command model download and local inference. Bundles llama.cpp, handles quantization, exposes OpenAI-compatible API.

**Docker setup:**
```yaml
services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    restart: unless-stopped
volumes:
  ollama_data:
```

```bash
# Pull and run a model
docker exec -it ollama ollama pull llama3.2:8b
docker exec -it ollama ollama run llama3.2:8b "Hello"
```

**How it extends AI agent capabilities:**
- Zero-config local inference for prototyping agents
- Model parity with cloud APIs — swap `base_url` from OpenAI to `localhost:11434`
- Supports tool-calling with newer models (Llama 3.3+, Qwen3)

**Resource requirements:**
- 7B models: 4-6GB VRAM (RTX 3060 class)
- 13B models: 8-10GB VRAM (RTX 4060 Ti 16GB)
- 70B models (quantized Q4): 35-40GB VRAM (dual RTX 4090 or A100)

**Difficulty:** ⭐/5 — One command. This is where everyone starts.

**Honest take:** Ollama is the fastest path from zero to running local LLMs. Capped at ~4 parallel requests and ~41 TPS under load. Fine for single-user dev, inadequate for production traffic. The throughput gap vs vLLM is 19x at scale.

---

### vLLM — Production-Grade Inference

**What it does:** High-throughput inference engine with PagedAttention. Handles concurrent users efficiently. Benchmarks show ~793 TPS vs Ollama's ~41 TPS.

**Docker setup:**
```bash
# With CUDA 12.1
docker run --gpus all \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  -p 8000:8000 \
  --ipc=host \
  vllm/vllm-openai:latest \
  --model meta-llama/Llama-3.1-8B-Instruct
```

**How it extends AI agent capabilities:**
- Serve multiple concurrent agents without latency spikes
- Continuous batching for GPU efficiency
- OpenAI-compatible API for drop-in replacement

**Resource requirements:** Same as Ollama, but better utilized under load.

**Difficulty:** ⭐⭐/5 — More configuration than Ollama. Needs NVIDIA GPUs with CUDA.

**Honest take:** If you're building anything that multiple users will touch, invest in vLLM from day one. The performance difference under concurrency is massive.

---

### LocalAI — The Universal API Hub

**What it does:** Drop-in OpenAI replacement for text, images, audio, and embeddings through a single endpoint. Can route to multiple backends.

**Docker setup:**
```bash
docker run -p 8080:8080 --gpus all localai/localai:latest-gpu-nvidia-cuda-12
```

**How it extends AI agent capabilities:**
- Unified API for multimodal needs
- Distributed inference across multiple nodes
- Good for teams scaling beyond single-server deployments

**Difficulty:** ⭐⭐/5 — Docker-based but orchestration can get complex.

**Honest take:** LocalAI makes sense when you need multimodal (image generation + text + embeddings) under one roof. Otherwise, vLLM + separate services is simpler.

---

### llama.cpp — Maximum Portability

**What it does:** The underlying engine powering Ollama. Zero dependencies, runs on laptops, ARM devices, Raspberry Pis. CPU inference capable.

**Docker setup:** Usually via Ollama. Direct use is manual.

**How it extends AI agent capabilities:**
- Edge deployment where GPU isn't available
- Maximum control over quantization and inference parameters

**Resource requirements:** CPU-capable but slow (~80 TPS max, actual speed much lower).

**Difficulty:** ⭐⭐⭐/5 — Manual setup, quantization, API wrappers.

**Honest take:** Use Ollama unless you have a specific reason to go lower-level. llama.cpp is the engine; Ollama is the product.

---

## 2. Embedding Models & Tools

Embeddings convert text to vectors for similarity search in RAG.

### Top Embedding Models (Early 2026)

| Model | MTEB Score | Best For | Size |
|-------|-----------|----------|------|
| **Qwen3-Embedding-8B** | SOTA | General RAG, multilingual | 8B params |
| **BGE-M3** | Excellent | Multilingual, dense + sparse | 567MB |
| **Nomic Embed Text** | Strong | Cost-effective, local | 137MB |
| **e5-mistral-7b** | Excellent | High accuracy | 7B params |

### Ollama Embeddings

```bash
# Pull embedding model
docker exec -it ollama ollama pull nomic-embed-text

# Use in code
curl http://localhost:11434/api/embeddings -d '{
  "model": "nomic-embed-text",
  "prompt": "Your text here"
}'
```

### Docker Compose with Ollama + Embeddings

```yaml
services:
  ollama:
    image: ollama/ollama:latest
    volumes:
      - ollama_data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
  embedding-service:
    image: ghcr.io/chroma/chroma:latest
    ports:
      - "8000:8000"
```

**Honest take:** For your stack (OpenClaw + SearXNG), embedding models matter if you're building RAG pipelines. Qwen3-Embedding-8B is the current leader. Nomic is excellent for cost-sensitive local use.

---

## 3. Vector Databases

Vector databases store embeddings and enable fast similarity search.

### Comparison

| Database | Self-Hosted? | Difficulty | Best For |
|----------|-------------|------------|----------|
| **Qdrant** | ✅ | Easy | Production RAG, hybrid search |
| **Chroma** | ✅ | Very Easy | Local dev, prototypes |
| **Milvus** | ✅ | Medium | High scale, distributed |
| **pgvector** | ✅ | Easy | Teams with existing Postgres |
| **Weaviate** | ✅ | Medium | Knowledge graphs + vectors |
| **TiDB Vector** | ✅ | Medium | SQL + vectors in one |

### Qdrant (Recommended for Production)

**Docker setup:**
```yaml
services:
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_storage:/qdrant/storage
volumes:
  qdrant_storage:
```

**Python client:**
```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

client = QdrantClient("localhost", port=6333)

# Create collection
client.create_collection(
    collection_name="documents",
    vectors_config=VectorParams(size=768, distance=Distance.COSINE),
)

# Upsert vectors
client.upsert(
    collection_name="documents",
    points=[
        PointStruct(id=1, vector=[0.1]*768, payload={"text": "Your document"})
    ]
)
```

**Resource requirements:** Minimal. Storage is the main constraint. 500k vectors at 768 dims ≈ ~1.5GB.

**Difficulty:** ⭐/5 — Docker one-liner, clean REST/gRPC API.

**Honest take:** Qdrant is the sweet spot. More production-ready than Chroma, simpler than Milvus. Good Rust implementation means it's fast and memory-efficient.

---

### Chroma (Best for Local Prototyping)

**Docker setup:**
```yaml
services:
  chroma:
    image: ghcr.io/chroma/chroma:latest
    ports:
      - "8000:8000"
```

**Python client:**
```python
import chromadb
client = chromadb.Client()
collection = client.create_collection("documents")
collection.add(
    ids=["1"],
    embeddings=[[0.1]*384],
    documents=["Your document"]
)
```

**Difficulty:** ⭐/5 — Dead simple for local dev.

**Honest take:** Chroma is excellent for prototyping and local development. Python-native, works directly in notebooks. For production, use Qdrant or a managed service.

---

### pgvector (If You Already Use Postgres)

```sql
CREATE EXTENSION vector;
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  content TEXT,
  embedding vector(768)
);
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops);
```

**Difficulty:** ⭐/5 — If you have Postgres running, adding pgvector is trivial.

**Honest take:** If you're already running Postgres (common with Coolify deployments), pgvector is the lowest-friction path. Not as fast as dedicated vector DBs at scale, but "good enough" for most use cases.

---

## 4. RAG Frameworks

RAG = Retrieval Augmented Generation. Gives agents knowledge from your documents.

### LlamaIndex — The Data-Centric Framework

**What it does:** Build RAG pipelines over your data. Connect to vector DBs, chunk documents, retrieve and generate.

**Docker setup:** Runs as Python package, typically not containerized separately.

```bash
pip install llama-index
```

**How it extends AI agent capabilities:**
- Connect any data source (PDF, Notion, Slack, database)
- Build query engines over structured and unstructured data
- Supports agents that can "search before answering"

**Python example:**
```python
from llama_index import VectorStoreIndex, SimpleDirectoryReader

# Load documents
documents = SimpleDirectoryReader("./data").load_data()

# Build index
index = VectorStoreIndex.from_documents(documents)

# Query
query_engine = index.as_query_engine()
response = query_engine.query("What did the author build?")
```

**Difficulty:** ⭐⭐⭐/5 — More flexible than LangChain, but steeper learning curve.

**Honest take:** LlamaIndex is the right choice if you're building data-centric AI (document Q&A, knowledge bases). Pair it with Qdrant for storage and Ollama for inference.

---

### AnythingLLM — All-in-One RAG App

**What it does:** Complete RAG application with built-in chat UI, document management, and multi-user support. Handles the full pipeline: ingestion → chunking → embedding → retrieval → generation.

**Docker setup:**
```yaml
services:
  anything-llm:
    image: mintplexlabs/anythingllm:latest
    ports:
      - "3001:3001"
    volumes:
      - anything_llm_data:/app/backend/data
```

**How it extends AI agent capabilities:**
- No-code document upload and management
- Built-in RAG with configurable chunk sizes
- Supports Ollama, vLLM, or OpenAI as backend

**Difficulty:** ⭐/5 — Point at documents, start chatting.

**Honest take:** AnythingLLM is the fastest path to a full RAG chatbot. For Alizé or ts.news (internal knowledge bases), this is probably overkill but lets non-technical team members manage content. For Kuroba client projects, it's a great deliverable template.

---

### LangChain — The Comprehensive Framework

**What it does:** Build context-aware reasoning applications. Chains, agents, memory, tools.

**Docker setup:** Python package.

```bash
pip install langchain langchain-community
```

**How it extends AI agent capabilities:**
- Tool calling and agentic workflows
- Memory across conversations
- Integration with every LLM and vector DB

**Difficulty:** ⭐⭐⭐⭐/5 — Powerful but notoriously complex. API churn has been an issue.

**Honest take:** LangChain is the 800-pound gorilla. It can do everything, which is also its problem — it's complex and the API changes frequently. For Alizé's agent work, crewAI or n8n may be simpler. Use LangChain when you need its specific features (complex chains, deep customization).

---

## 5. AI Agent Frameworks

These let you build agents that can reason, plan, and use tools.

### crewAI — Multi-Agent Orchestration

**What it does:** Framework for orchestrating role-playing, autonomous AI agents. Agents have roles, goals, and tools. Tasks flow through processes.

**Docker setup:** Python package.

```bash
pip install crewai
```

**Example:**
```python
from crewai import Agent, Task, Crew, Process

researcher = Agent(
    role="Researcher",
    goal="Find the latest AI news",
    backstory="A diligent researcher",
    tools=[search_tool, scrape_tool]
)

tasks = [Task(description="Research AI trends", agent=researcher)]

crew = Crew(agents=[researcher], tasks=tasks, process=Process.hierarchical)
crew.kickoff()
```

**How it extends AI agent capabilities:**
- Multi-agent workflows with role-based specialization
- Hierarchical process (manager coordinates agents)
- Built-in tool usage and task delegation

**Difficulty:** ⭐⭐/5 — Conceptually clear, Python-native.

**Honest take:** crewAI is excellent for building multi-agent systems. For Alizé's AI agency work, this is likely your best bet for complex agent pipelines. For simpler automation, n8n is more accessible.

---

### n8n — Visual Workflow Automation

**What it does:** Open-source workflow automation with AI agent nodes. Connect to databases, APIs, and LLMs visually.

**Docker setup:**
```yaml
services:
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - WEBHOOK_URL=http://localhost:5678
```

**How it extends AI agent capabilities:**
- Drag-and-drop AI agent nodes
- Connect to Ollama for local LLM
- Integrate with your existing stack (Slack, Notion, databases)

**Difficulty:** ⭐/5 — No-code/low-code.

**Honest take:** n8n is the most accessible entry point for non-developers. For Kuroba client automations or internal Alizé workflows, it's excellent. For complex multi-agent reasoning, you'll eventually want crewAI.

---

### AutoGPT / AgentGPT — Autonomous Agents

**What it does:** Continuous AI agents that can self-prompt and execute tasks.

**Docker setup:**
```bash
docker run -d -p 8000:8000 agentgpt/reason-agent:latest
```

**Honest take:** AutoGPT was pioneering but often gets stuck in loops for real-world tasks. For production agents, crewAI or LangChain agents are more reliable.

---

### Microsoft AutoGen — Multi-Agent Conversations

**What it does:** Programming framework for agentic AI. Agents can converse to solve tasks.

**Docker setup:** Python package.

**Honest take:** AutoGen is powerful but Microsoft's enterprise focus shows. Steeper learning curve than crewAI. Good if you need deep Microsoft ecosystem integration.

---

### Comparison Table

| Framework | Difficulty | Best For | Docker-Friendly |
|-----------|-----------|----------|----------------|
| **crewAI** | ⭐⭐/5 | Multi-agent orchestration | ✅ |
| **n8n** | ⭐/5 | Workflow automation, no-code | ✅ |
| **LangChain Agents** | ⭐⭐⭐/5 | Complex chains, tools | ✅ |
| **AutoGen** | ⭐⭐⭐/5 | Microsoft ecosystem | ✅ |
| **AutoGPT** | ⭐⭐/5 | Experimentation | ✅ |
| **Flowise** | ⭐/5 | Visual LangChain builder | ✅ |

---

## 6. Prompt Management & Observability

Track, version, and evaluate prompts across environments.

### Langfuse — Open-Source Prompt Management

**What it does:** Prompt versioning, observability (tracing), evaluation, and metrics. Self-hostable with PostgreSQL + Redis.

**Docker setup (with docker-compose):**
```yaml
services:
  langfuse:
    image: langfuse/langfuse:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://langfuse:langfuse@db:5432/langfuse
      - NEXTAUTH_SECRET=your-secret
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db
      - redis
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=langfuse
      - POSTGRES_USER=langfuse
      - POSTGRES_PASSWORD=langfuse
  redis:
    image: redis:7
```

**Resource requirements:** PostgreSQL (10GB+ storage), Redis (minimal).

**Difficulty:** ⭐⭐⭐/5 — Requires PostgreSQL and Redis. More operational overhead than Ollama but manageable on Coolify.

**Honest take:** Langfuse is the best open-source option for prompt management. For your stack, it's overkill if you're just doing prototyping, but essential if you're building Alizé as an agency that needs to track prompt versions across client projects.

---

### Other Prompt Management Tools

| Tool | Self-Hosted | Best For | Difficulty |
|------|-------------|----------|------------|
| **PromptLayer** | ❌ (Enterprise) | Non-technical teams | Easy |
| **LangSmith** | ❌ (Enterprise) | LangChain users | Medium |
| **Braintrust** | ❌ | Evaluation-focused teams | Easy |
| **Promptfoo** | ✅ | CLI testing, red-teaming | Medium |
| **Weights & Biases Weave** | ❌ | ML experiment tracking | Easy |

**Honest take:** Promptfoo is the best self-hosted option for testing/red-teaming prompts via CLI. But for your use cases, Langfuse is the most practical open-source choice.

---

## 7. Model Context Protocol (MCP)

**What it is:** A protocol that lets AI agents connect to external tools and data sources. Think "USB for AI agents." Originally from Anthropic/Claude, now being adopted broadly.

### Why MCP Matters for Your Stack

OpenClaw already has MCP tools. Self-hosted MCP servers let your agents:
- Query your SearXNG search instance
- Connect to internal databases
- Access file systems, GitHub, Slack
- Call custom tools you build

### Popular MCP Servers

| Server | What it Connects | Self-Hosted? |
|--------|-----------------|--------------|
| **Filesystem** | Local files | ✅ |
| **GitHub** | Repos, issues, PRs | ✅ |
| **Slack** | Messages, channels | ✅ |
| **Database** | Postgres, SQLite | ✅ |
| **SearXNG** | Web search | ✅ (already running) |
| **Fetch** | Web pages | ✅ |

### Docker Setup (Example: Filesystem + GitHub)

```yaml
services:
  mcp-filesystem:
    image: ghcr.io/modelcontextprotocol/server-filesystem:latest
    environment:
      - ALLOWED_DIRECOTRIES=/data
    volumes:
      - /data:/data:ro

  mcp-github:
    image: ghcr.io/modelcontextprotocol/server-github:latest
    environment:
      - GITHUB_TOKEN=${GITHUB_TOKEN}
```

### For Your Projects

- **Alizé**: MCP servers for connecting agents to client data, internal docs
- **ts.news**: MCP for fetching articles, interacting with your CMS
- **Kuroba**: MCP for webhooks, GitHub integration, database access

**Honest take:** MCP is the real deal for agent capabilities. This is not over-engineering — it's the standard interface emerging across the industry. Build your self-hosted MCP server infrastructure early.

---

## 8. Recommended Stacks for Your Use Cases

### Stack 1: Rapid Prototyping (Alizé Dev)

```
Ollama (model serving)
  + Open WebUI (chat interface)
  + n8n (basic automations)
  + Chroma (vector store)
```

**What you get:** Full local AI dev environment. Prototype agent ideas in hours, not days.

**Hardware:** RTX 3060 12GB minimum. RTX 4090 24GB recommended.

---

### Stack 2: Production RAG (ts.news Knowledge Base)

```
vLLM (model serving, high concurrency)
  + Qdrant (vector database)
  + LlamaIndex (RAG framework)
  + AnythingLLM (document management UI)
```

**What you get:** Production-grade RAG for your news content. Upload articles, chat with your knowledge base.

**Hardware:** RTX 4090 24GB or A100 for 70B models.

---

### Stack 3: Multi-Agent Agency (Alizé)

```
Ollama or vLLM (model serving)
  + crewAI (multi-agent framework)
  + Langfuse (prompt management)
  + Qdrant (vector DB)
  + MCP servers (tool integration)
  + n8n (client workflow automation)
```

**What you get:** Full agent platform for agency work. Track prompts across clients, deploy specialized agents, connect to client systems.

**Hardware:** Multi-GPU setup or cloud A100s for production.

---

### Stack 4: Client Deliverables (Kuroba)

```
AnythingLLM (full RAG app)
  + Ollama (local inference)
  + Docker Compose (easy deployment)
```

**What you get:** Packaged AI solution for clients. Deploy to their Coolify instance, point at their documents, done.

**Hardware:** Client-provided or minimal cloud VM.

---

## 9. Honest Assessment: Useful vs Over-Engineered

### ✅ Actually Useful

1. **Ollama + Open WebUI** — Stop reading about this and just install it. Best way to experiment with local LLMs.

2. **Qdrant** — Production-ready vector DB that doesn't require a PhD to operate. Your SearXNG setup proves you can handle self-hosted services.

3. **AnythingLLM** — Fastest path to a working RAG chatbot. Great for ts.news internal knowledge base.

4. **crewAI** — Clean multi-agent framework. For Alizé's agent work, this is worth learning.

5. **n8n** — If you're automating anything for clients (Kuroba), n8n is the bridge between AI and real workflows.

6. **MCP** — This is the emerging standard. Build your MCP server infrastructure now.

### ⚠️ Over-Engineered (For Your Scale)

1. **Full LangChain applications** — Powerful but complex. API churn causes constant breakage. Use LlamaIndex or crewAI instead.

2. **LangSmith for prompt management** — You're not at the scale where this matters yet. Langfuse when you have multiple clients and prompt versions to track.

3. **Milvus for small/medium datasets** — Qdrant handles the same workloads with less operational overhead.

4. **Separate embedding services** — Just use Ollama's embedding endpoint. Don't build a separate microservice unless you have specific scaling needs.

5. **AutoGPT for production** — Interesting research, not production-ready. Use crewAI or n8n instead.

### 🚀 Start Here

1. **Today**: `docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama` + `ollama pull llama3.2:8b`

2. **This week**: Add Open WebUI. Deploy AnythingLLM. Connect to SearXNG via MCP.

3. **This month**: Build your first crewAI agent workflow. Set up Qdrant for ts.news RAG.

4. **When ready**: vLLM for production, Langfuse for prompt management.

---

## Quick Reference: Docker Compose Templates

### Minimal RAG Stack (AnythingLLM + Ollama)

```yaml
services:
  ollama:
    image: ollama/ollama:latest
    volumes:
      - ollama_data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  anything-llm:
    image: mintplexlabs/anythingllm:latest
    ports:
      - "3001:3001"
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
    depends_on:
      - ollama
    volumes:
      - anything_llm_data:/app/backend/data

volumes:
  ollama_data:
  anything_llm_data:
```

### Production Stack (vLLM + Qdrant + LlamaIndex)

```yaml
services:
  vllm:
    image: vllm/vllm-openai:latest
    ports:
      - "8000:8000"
    volumes:
      - ~/.cache/huggingface:/root/.cache/huggingface
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    command: --model meta-llama/Llama-3.1-8B-Instruct

  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_storage:/qdrant/storage

volumes:
  qdrant_storage:
```

---

## Resources

- [awesome-local-llm](https://github.com/rafska/awesome-local-llm) — Comprehensive list
- [Ollama Library](https://ollama.com/library) — All available models
- [MTEB Leaderboard](https://huggingface.co/spaces/mteb/leaderboard) — Embedding model rankings
- [Open LLM Leaderboard](https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard) — Model benchmarks
- [Qdrant Documentation](https://qdrant.tech/documentation/) — Vector DB setup
- [crewAI Documentation](https://docs.crewai.com/) — Multi-agent framework
- [Langfuse Documentation](https://langfuse.com/docs/) — Prompt management

---

*Last updated: March 2026. LLM tooling evolves rapidly — check for newer versions before deploying to production.*
