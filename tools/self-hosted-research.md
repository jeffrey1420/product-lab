# Self-Hosted Tools to Enhance Jeffrey (AI Assistant)

Research for Louis — French indie hacker building Alizé, ts.news, and Kuroba.

---

## Priority Overview

| Priority | Category | Tool | Why It Matters for Jeffrey |
|----------|----------|------|---------------------------|
| 🔴 HIGH | Knowledge/RAG | **Qdrant** | Enables Jeffrey to remember and reason over documents |
| 🔴 HIGH | Knowledge/Wiki | **Dify** or **AnythingLLM** | Complete RAG pipeline with UI |
| 🟡 MEDIUM | Data | **PostgreSQL + pgvector** | Structured data + vector search in one |
| 🟡 MEDIUM | Workflow | **n8n** | Automation between Jeffrey and external services |
| 🟡 MEDIUM | Code Execution | **VS Code Server** or **e2b** | Sandboxed code running for Jeffrey |
| 🟢 LOW | Communication | **Mailrise** or **Mailgun self-hosted** | Email integration |
| 🟢 LOW | File Storage | **FileStash** or **Nextcloud** | File management |
| 🟢 LOW | Monitoring | **Grafana + Loki** | Observability |

---

## 1. Knowledge Management (Wikis, Notes, Docs)

### 🔴 PRIMARY: Qdrant (Vector Database)

**What it does:** Open-source vector database for similarity search. Powers RAG (Retrieval-Augmented Generation) pipelines.

**How Jeffrey would use it:**
- Store embeddings of documents, notes, code
- Query "find similar content to X" for context-aware responses
- Build long-term memory over conversations and documents
- Power Alizé's knowledge base for SMB clients

**Self-hosting requirements:**
- Docker: `docker run -p 6333:6333 qdrant/qdrant`
- Resources: 1-2 GB RAM minimum, 10+ GB storage for vectors
- Single container, no dependencies

**Verdict: HIGH VALUE — Must have for serious AI capabilities**

---

### 🔴 PRIMARY: Dify (AI Platform with RAG)

**What it does:** Open-source platform combining workflow builder, RAG pipeline, agent framework, and model management.

**How Jeffrey would use it:**
- Build specialized AI workflows for clients (Alizé)
- Create chatbots with knowledge base retrieval
- Orchestrate multi-step AI tasks visually
- Prototype AI features fast for ts.news and Kuroba

**Self-hosting requirements:**
- Docker Compose (full stack: API, worker, nginx, postgres, redis)
- Resources: 4-8 GB RAM recommended
- Moderate complexity

**Verdict: HIGH VALUE — Could replace much custom code for Alizé**

---

### 🟡 SECONDARY: AnythingLLM (Private Knowledge Base)

**What it does:** Full-stack private knowledge base and Q&A system supporting RAG. Connects to Ollama, LM Studio, or cloud LLMs.

**How Jeffrey would use it:**
- Quick setup for client knowledge bases
- Upload documents, chat with them
- Supports multi-user workspaces

**Self-hosting requirements:**
- Docker single container or docker-compose for full stack
- Resources: 2-4 GB RAM
- Low complexity, great UI

**Verdict: MEDIUM — Simpler alternative to Dify, less flexible**

---

### 🟡 SECONDARY: Open WebUI (Ollama Interface)

**What it does:** Web UI for running Ollama locally. Supports knowledge bases, prompting, and model management.

**How Jeffrey would use it:**
- If Louis wants to run local LLMs for privacy/cost
- Interface for experimenting with open-source models
- Knowledge base management

**Self-hosting requirements:**
- Docker single container
- Resources: Depends on models (4-16 GB RAM)

**Verdict: MEDIUM — Good for local model experiments, not critical**

---

### 🟢 TERTIARY: Wiki.js (Knowledge Wiki)

**What it does:** Modern open-source wiki with markdown support, search, and API access.

**How Jeffrey would use it:**
- Structured documentation for Louis's projects
- Jeffrey could read/write wiki content for context
- API available for integration

**Self-hosting requirements:**
- Docker single container
- Resources: 1 GB RAM, minimal
- PostgreSQL backend (or SQLite)

**Verdict: LOW-MEDIUM — Nice for docs, not critical**

---

## 2. Code Execution / CI

### 🟡 MEDIUM: VS Code Server (code-server)

**What it does:** Run Visual Studio Code in browser. Enables full IDE access on server.

**How Jeffrey would use it:**
- Jeffrey could write, edit, and test code directly
- Run scripts, git operations
- Edit ts.news, Alizé, Kuroba codebases

**Self-hosting requirements:**
- Docker or direct install
- Resources: 1-2 GB RAM
- Low complexity

**Verdict: MEDIUM — Useful for development workflow**

---

### 🟡 MEDIUM: Sedat / E2B (Cloud Sandboxes)

**What it does:** Cloud-native code execution sandboxes for AI agents. Run code securely in isolated environments.

**How Jeffrey would use it:**
- Execute Python/JS code safely
- Analysis scripts, data processing
- Currently managed service, but self-hosting options emerging

**Self-hosting requirements:**
- Self-hosted alternative: **Fogs** or custom container setup
- Resources: Variable based on workloads
- Complexity: High for self-hosted

**Verdict: MEDIUM — Keep watching, managed E2B is easier**

---

### 🟢 LOW: n8n (with Code Node)

**What it does:** Workflow automation with built-in code execution node (JavaScript/Python).

**How Jeffrey would use it:**
- Data transformation in workflows
- Lightweight script execution
- Already covered in workflow section

**Verdict: LOW — Bonus capability via n8n**

---

## 3. Data / Databases (Useful for AI)

### 🔴 PRIMARY: PostgreSQL + pgvector

**What it does:** PostgreSQL with pgvector extension adds vector similarity search to the world's most trusted database.

**How Jeffrey would use it:**
- Structured data for all projects (users, products, etc.)
- Vector search for AI (embeddings stored alongside regular data)
- Single database for everything
- Alizé could use for customer data + AI queries

**Self-hosting requirements:**
- Docker: postgres with pgvector image
- Resources: 2-4 GB RAM, 20+ GB storage
- Low complexity

**Verdict: HIGH VALUE — Most practical, one DB for all needs**

---

### 🟡 MEDIUM: Qdrant (standalone vector DB)

*(Already covered in Knowledge Management)*

---

### 🟡 MEDIUM: Meilisearch (Semantic Search)

**What it does:** Lightweight search engine with typo tolerance and semantic capabilities.

**How Jeffrey would use it:**
- Fast full-text search across documents
- Alternative to vector DB for simpler search needs
- ts.news could use for article search

**Self-hosting requirements:**
- Docker single container
- Resources: 1-2 GB RAM
- Low complexity, excellent performance

**Verdict: MEDIUM — Good complement to vector DB**

---

### 🟢 LOW: SQLite + sqlitevec (for AI)

**What it does:** SQLite with vector extension for lightweight embedding storage.

**How Jeffrey would use it:**
- Lightweight option for small-scale vector storage
- Embedded deployments
- Good for Nextcloud/collaboration tool integrations

**Verdict: LOW — Niche use cases only**

---

## 4. Communication (Email, Chat)

### 🟡 MEDIUM: Mailrise (Email to Slack/Discord)

**What it does:** Converts email notifications into Slack/Discord messages. SMTP server that forwards intelligently.

**How Jeffrey would use it:**
- Receive email alerts, route to Discord
- Jeffrey could monitor important emails
- Trigger workflows on email receipt

**Self-hosting requirements:**
- Docker single container
- Resources: Minimal (256 MB RAM)
- Configuration via YAML

**Verdict: MEDIUM — Email bridge useful for automation**

---

### 🟢 LOW: Simple SMTP Server (Mailu or Mailhog)

**What it does:** Self-hosted mail server for development/testing.

**How Jeffrey would use it:**
- Development email testing
- Alizé client email handling (production would need proper service)

**Self-hosting requirements:**
- Docker Compose (Mailu is full-featured, Mailhog is minimal)
- Resources: 2-4 GB RAM for Mailu, minimal for Mailhog

**Verdict: LOW — Probably overkill, use managed email for production**

---

### 🟢 LOW: Mattermost / Rivian (Self-hosted Chat)

**What it does:** Slack alternatives for team communication.

**How Jeffrey would use it:**
- Team chat for Kuroba/Alizé
- Jeffrey could monitor channels, respond to queries
- Webhook integration for notifications

**Self-hosting requirements:**
- Docker Compose
- Resources: 2-4 GB RAM
- Moderate complexity

**Verdict: LOW — Nice but Louis already has Discord via OpenClaw**

---

## 5. Monitoring / Logging

### 🟡 MEDIUM: Grafana + Loki + Promtail (Observability Stack)

**What it does:** Metrics, logs, and dashboards for infrastructure monitoring.

**How Jeffrey would use it:**
- Monitor all self-hosted services
- Alert on failures (→ Discord notifications)
- Dashboard for Louis's projects
- Track Alizé API usage

**Self-hosting requirements:**
- Docker Compose (Grafana, Loki, Promtail, node-exporter)
- Resources: 1-2 GB RAM for light usage
- Moderate complexity

**Verdict: MEDIUM — Worth it for production services like Alizé**

---

### 🟡 MEDIUM: Uptime Kuma (Simple Uptime Monitoring)

**What it does:** Self-hosted uptime monitoring with status pages and notifications.

**How Jeffrey would use it:**
- Monitor all Louis's services (Coolify apps, SearXNG, etc.)
- Alert when things go down
- Status page for ts.news

**Self-hosting requirements:**
- Docker single container
- Resources: Minimal
- Low complexity, great UI

**Verdict: MEDIUM — Essential for production reliability**

---

## 6. File Storage / Sharing

### 🟡 MEDIUM: FileStash (File Browser)

**What it does:** Modern file manager for the web. S3-like interface without S3.

**How Jeffrey would use it:**
- File management UI for Louis
- Organize project files
- Share files with clients

**Self-hosting requirements:**
- Docker single container
- Resources: Minimal
- Low complexity

**Verdict: MEDIUM — Cleaner than raw SFTP, nice for clients**

---

### 🟢 LOW: Nextcloud (Full Suite)

**What it does:** Full Google Drive/Office replacement. Files, docs, collaborative.

**How Jeffrey would use it:**
- File storage, sync, share
- Collaborative document editing
- Calendar, contacts (optional)

**Self-hosting requirements:**
- Docker Compose (AIO variant is easiest)
- Resources: 4+ GB RAM recommended
- High complexity

**Verdict: LOW — Powerful but heavy; probably overkill if using existing tools**

---

## 7. Other Tools That Would Make Jeffrey More Capable

### 🔴 PRIMARY: n8n (Workflow Automation)

**What it does:** Open-source workflow automation with 400+ integrations. AI-native with LLM nodes and memory.

**How Jeffrey would use it:**
- Connect Jeffrey to everything: GitHub, Notion, Discord, databases
- Build client onboarding automations (Alizé)
- Webhook triggers for ts.news content aggregation
- Cross-service workflows without custom code

**Self-hosting requirements:**
- Docker single container (with Postgres for scaling)
- Resources: 1-2 GB RAM
- Low complexity, huge value

**Verdict: HIGH VALUE — Force multiplier for Jeffrey**

---

### 🔴 PRIMARY: Docker-in-Docker (DinD)

**What it does:** Run Docker inside Docker for containerized task execution.

**How Jeffrey would use it:**
- Build and run containers for tasks
- Test deployments
- Isolated environments for experiments

**Self-hosting requirements:**
- Docker with privileged mode or rootless
- Resources: Variable

**Verdict: HIGH VALUE — Enables safe containerized execution**

---

### 🟡 MEDIUM: Flowise AI (Visual LangChain Builder)

**What it does:** Drag-and-drop UI for building LangChain workflows.

**How Jeffrey would use it:**
- Visual AI workflow building
- Prototype RAG pipelines
- Alternative to Dify for some use cases

**Self-hosting requirements:**
- Docker Compose
- Resources: 2-4 GB RAM
- Low complexity

**Verdict: MEDIUM — Nice for visual debugging, not critical**

---

### 🟢 LOW: Traefik (Reverse Proxy)

**What it does:** Modern reverse proxy with automatic TLS and routing.

**How Jeffrey would use it:**
- Already likely in use with Coolify
- Manage all service routing
- Let's Encrypt integration

**Verdict: LOW — Infrastructure staple, assumed existing**

---

## Summary: Recommended Implementation Order

### Phase 1: Core AI Capabilities
1. **PostgreSQL + pgvector** — One DB for everything
2. **Qdrant** — Dedicated vector search for RAG
3. **n8n** — Automation backbone

### Phase 2: Knowledge & RAG
4. **Dify** — RAG pipelines and AI workflows
5. **AnythingLLM** — Quick client knowledge bases

### Phase 3: Operational Excellence
6. **Uptime Kuma** — Monitoring
7. **Grafana Stack** — Observability
8. **VS Code Server** — Development

### Phase 4: Polish
9. **FileStash** — File management
10. **Mailrise** — Email integration

---

## Key Insights

1. **Vector search is essential** for modern AI assistants. Qdrant or pgvector should be priority #1.

2. **n8n is the automation glue** that connects Jeffrey to the world. High ROI for minimal setup.

3. **Dify is powerful but complex** — worth it if building Alizé's client-facing AI features. Otherwise AnythingLLM is simpler.

4. **Don't over-engineer** — Louis already has SearXNG, Coolify, and OpenClaw. Build on top, not everything from scratch.

5. **PostgreSQL + pgvector** can replace a dedicated vector DB for simpler use cases. Consider starting there before adding Qdrant.

---

*Research completed: 2026-03-23*
*For Louis — building Alizé, ts.news, and Kuroba with Jeffrey*
