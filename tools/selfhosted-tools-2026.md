# Self-Hosted Tools for AI Agent Development (2026)

A curated collection of self-hosted tools that enhance AI agent development environments. All tools are Docker-based and quick to deploy on Coolify.

---

## 🤖 AI/LLM Tools

### Ollama
**What it does:** Run LLMs locally (Llama, Mistral, CodeLlama, Gemma, etc.) with a simple API  
**Docker:** `docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama`  
**Why useful for AI dev:** Local model testing without API costs, privacy-first development, supports code completion models

### Open WebUI
**What it does:** Feature-rich web UI for Ollama with RAG, multi-user auth, and tool integrations  
**Docker:** `docker run -d -p 3000:8080 -v open-webui:/app/backend/data ghcr.io/open-webui/open-webui:main`  
**Why useful for AI dev:** Chat interface for local models, document ingestion for RAG, API access for agents

### AnythingLLM
**What it does:** All-in-one AI productivity tool with RAG, multi-user support, and built-in agents  
**Docker:** Official Docker image available at `mintplexlabs/anythingllm`  
**Why useful for AI dev:** Built-in vector database, workspace management, document chat for codebase context

### LocalAI
**What it does:** Drop-in OpenAI API replacement for running open models locally  
**Docker:** `docker run -d -p 8080:8080 quay.io/go-skynet/local-ai`  
**Why useful for AI dev:** API-compatible with OpenAI, supports whisper, stable diffusion, and text models

### text-generation-webui (Ooba)
**What it does:** Web UI for text generation models with extensive customization  
**Docker:** `docker run -d -p 7860:7860 ghcr.io/oobabooga/text-generation-webui`  
**Why useful for AI dev:** Model comparison, fine-tuning support, multiple backends

---

## 🗄️ Database Tools

### Adminer
**What it does:** Lightweight database management UI supporting MySQL, PostgreSQL, SQLite, MS SQL, Oracle  
**Docker:** `docker run -d -p 8080:8080 adminer`  
**Why useful for AI dev:** Quick database inspection, query testing, schema exploration

### pgAdmin
**What it does:** Full-featured PostgreSQL administration tool  
**Docker:** `docker run -d -p 5050:80 -e PGADMIN_DEFAULT_EMAIL=admin@local.com -e PGADMIN_DEFAULT_PASSWORD=secret dpage/pgadmin4`  
**Why useful for AI dev:** Essential for PostgreSQL-based AI projects, visual query builder, backup management

### DockAdmin
**What it does:** Modern Docker-native database admin UI (15MB, lightweight)  
**Docker:** Add to docker-compose, connects to existing database containers  
**Why useful for AI dev:** Unified view of all databases, lightweight alternative to pgAdmin

---

## 🔀 Development Tools (Git, CI/CD)

### Forgejo
**What it does:** Lightweight self-hosted Git service (fork of Gitea) with Actions support  
**Docker:** Single Docker image, or Docker Compose with MySQL/PostgreSQL  
**Why useful for AI dev:** Private repos for proprietary AI code, Actions for CI/CD pipelines, Git hooks for model deployment

### Gitea
**What it does:** Lightweight GitHub alternative with issue tracking, PRs, and Actions  
**Docker:** `docker run -d -p 3000:3000 -p 2222:22 gitea/gitea`  
**Why useful for AI dev:** Fast, low-resource, perfect for indie projects, supports GitHub Actions workflows

### Woodpecker CI
**What it does:** Lightweight, pipeline-based CI engine (Drone fork)  
**Docker:** Docker Compose setup with SQLite or PostgreSQL  
**Why useful for AI dev:** Git-native CI/CD, container-based builds, secrets management

### Renovate
**What it does:** Automated dependency updates (keeps AI SDKs, libraries current)  
**Docker:** `docker run -d renovate/renovate` or SaaS with self-hosted runner  
**Why useful for AI dev:** Auto-updates LangChain, vector DB clients, AI SDKs

---

## 📊 Monitoring & Observability

### Uptime Kuma
**What it does:** Self-hosted status page and uptime monitoring  
**Docker:** `docker run -d -p 3001:3001 -v uptime-kuma:/app/data louislam/uptime-kuma`  
**Why useful for AI dev:** Monitor AI API endpoints, track model response times, public status pages for clients

### SigNoz
**What it does:** Open source observability platform (traces, metrics, logs)  
**Docker:** Docker Compose with OpenTelemetry collector  
**Why useful for AI dev:** Full-stack observability, track AI agent workflows, OpenTelemetry native

### VictoriaMetrics
**What it does:** High-performance time-series database (Prometheus replacement)  
**Docker:** `docker run -d -v victoria-metrics-data:/storage victoria_metrics/victorial-metrics`  
**Why useful for AI dev:** Store AI API metrics, monitor token usage, cost tracking

### Grafana + Prometheus
**What it does:** Classic monitoring stack for metrics visualization  
**Docker:** Both available as single containers or docker-compose  
**Why useful for AI dev:** Dashboard for model performance, latency tracking, custom alerting

---

## 💬 Communication

### Simple Chatbot WebUI (Chatbot UI)
**What it does:** Self-hosted chat interface for AI models  
**Docker:** `docker run -d -p 3000:3000 ghcr.io/mckaywrigley/chatbot-ui`  
**Why useful for AI dev:** Custom chatbot interface, prototype AI products

### Mattermost
**What it does:** Slack-alternative with full self-hosting  
**Docker:** Docker Compose with PostgreSQL and optional S3  
**Why useful for AI dev:** Team communication for AI dev projects, webhook integrations

### Chatwoot
**What it does:** Customer support platform with live chat, email, API  
**Docker:** Docker Compose setup  
**Why useful for AI dev:** Build AI-powered customer support, integrate with AI agents

---

## 📁 File Management

### FileRun
**What it does:** Self-hosted Google Drive alternative with collaborative features  
**Docker:** `docker run -d -p 8080:80 filerun/filerun`  
**Why useful for AI dev:** Store datasets, model weights, collaborative document editing

### FileBrowser
**What it does:** Lightweight web-based file manager  
**Docker:** `docker run -d -v /path/to/files:/data -p 8080:80 filebrowser/filebrowser`  
**Why useful for AI dev:** Quick file management in containers, upload datasets

---

## ⚙️ Automation

### n8n
**What it does:** Workflow automation platform with AI integrations  
**Docker:** `docker run -d -p 5678:5678 n8nio/n8n`  
**Why useful for AI dev:** Automate AI pipelines, connect AI agents to external APIs, data processing workflows

### Windmill
**What it does:** Self-hosted platform for scripts, workflows, and internal tools  
**Docker:** Docker Compose with PostgreSQL  
**Why useful for AI dev:** Python/JS scripting with AI, building AI-powered internal tools, workflow orchestration

### Home Assistant
**What it does:** Smart home automation with extensive integrations  
**Docker:** `docker run -d --name homeassistant -v /path/to/config:/config --network=host homeassistant/home-assistant`  
**Why useful for AI dev:** Physical world automation, sensor data for AI, voice interfaces

---

## 🎨 Creative/Indie-Hacker Tools

### Penpot
**What it does:** Self-hosted design tool (Figma alternative)  
**Docker:** Docker Compose setup  
**Why useful for AI dev:** Design AI interfaces, create mockups for AI products

### Appwrite
**What it does:** Self-hosted Firebase alternative (auth, database, storage, functions)  
**Docker:** Docker Compose  
**Why useful for AI dev:** Backend for AI apps, user management, real-time database

### Plane
**What it does:** Self-hosted project management (Jira alternative)  
**Docker:** Docker Compose  
**Why useful for AI dev:** Track AI development sprints, issue tracking for AI features

### Glitchtip
**What it does:** Self-hosted error tracking (Sentry alternative)  
**Docker:** Docker Compose  
**Why useful for AI dev:** Monitor AI agent errors, track exceptions in production

---

## 🧠 Vector Databases & RAG

### Qdrant
**What it does:** Production-ready vector database with filtering  
**Docker:** `docker run -d -p 6333:6333 -p 6334:6334 qdrant/qdrant`  
**Why useful for AI dev:** Semantic search, RAG pipelines, document embedding storage

### Chroma
**What it does:** Lightweight vector database for AI apps  
**Docker:** `docker run -d -p 8000:8000 chromadb/chroma`  
**Why useful for AI dev:** Quick prototyping, embedded mode available, Python-first

### Weaviate
**What it does:** Vector search engine with built-in modules (summerizer, qa)  
**Docker:** Docker Compose  
**Why useful for AI dev:** RAG applications, multimodal search, built-in AI modules

---

## 🔧 Essential DevOps

### Coolify
**What it does:** Open-source, self-hosted alternative to Heroku/Vercel  
**Docker:** Single Docker install command  
**Why useful for AI dev:** Deploy everything here, manage all self-hosted tools, automatic SSL

### Traefik
**What it does:** Reverse proxy and load balancer  
**Docker:** Add to existing Docker Compose  
**Why useful for AI dev:** Route traffic to AI services, automatic SSL, middleware

### Portainer
**What it does:** Docker container management UI  
**Docker:** `docker run -d -p 9000:9000 -v /var/run/docker.sock:/var/run/docker.sock portainer/portainer`  
**Why useful for AI dev:** Visual container management, easy deployment of AI tools

---

## Quick Start Stack for AI Development

```yaml
# docker-compose.yml for AI dev environment
services:
  # Local LLM
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]

  # Web UI for Ollama
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    ports:
      - "3000:8080"
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434

  # Vector DB for RAG
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
      - "6334:6334"

  # Workflow automation
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"

  # Uptime monitoring
  uptime-kuma:
    image: louislam/uptime-kuma:latest
    ports:
      - "3001:3001"

volumes:
  ollama_data:
```

---

## Resources

- [Awesome Selfhosted Docker](https://github.com/hotheadhacker/awesome-selfhost-docker)
- [Self-Hosted Git Platforms Comparison](https://dasroot.net/posts/2026/01/self-hosted-git-platforms-gitlab-gitea-forgejo-2026/)
- [Ollama + Open WebUI Guide](https://blog.premai.io/self-hosted-llm-guide-setup-tools-cost-comparison-2026/)

---

*Last updated: March 2026*
