# Self-Hosted Data Tools for AI-Enhanced Development

> Research Date: 2026-03-23 | Context: Alizé, ts.news, Kuroba

This document covers self-hosted tools for databases, analytics, and data pipelines — essential infrastructure for building data-driven products with AI capabilities.

---

## Table of Contents

1. [Database UIs](#1-database-uis)
2. [Backend-as-a-Service](#2-backend-as-a-service)
3. [Analytics & BI](#3-analytics--bi)
4. [Data Pipelines](#4-data-pipelines)
5. [Cache & Key-Value Store](#5-cache--key-value-store)
6. [Vector Database](#6-vector-database)
7. [SQLite Tools](#7-sqlite-tools)

---

## 1. Database UIs

### Adminer

**What it does:** A single-file PHP web interface for managing databases (MySQL, PostgreSQL, SQLite, MongoDB, and more). Extremely lightweight alternative to phpMyAdmin.

**Docker Setup:**

```yaml
# docker-compose.yml
services:
  adminer:
    image: adminer
    restart: always
    ports:
      - "8080:8080"
```

**Resource Requirements:** ~50MB RAM, single PHP container

**How it helps with data-driven products:**
- Quick database inspection without installing heavy desktop apps
- Execute queries, view tables, backup data
- Supports multiple database types in one interface
- Single `adminer.php` file can be embedded anywhere

**Production Considerations:**
- Use behind auth-protected reverse proxy (nginx auth_basic or similar)
- Not suitable for heavy administrative tasks — use pgAdmin for PostgreSQL-specific work

---

### pgAdmin

**What it does:** The most full-featured open-source administration tool for PostgreSQL. Offers query tool, schema browser, backup/restore, and performance monitoring.

**Docker Setup:**

```yaml
# docker-compose.yml
services:
  pgadmin:
    image: dpage/pgadmin4
    restart: always
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: your-password
    ports:
      - "5050:80"
    volumes:
      - pgadmin_data:/var/lib/pgadmin
```

**Resource Requirements:** ~200-500MB RAM, 1GB storage for session data

**How it helps with data-driven products:**
- Visual EXPLAIN plans for query optimization
- Manage multiple PostgreSQL instances from one UI
- Schema comparison and migration tools
- Good for Alizé/ts.news/Kuroba PostgreSQL backend management

**Production Considerations:**
- Set a strong default password via environment variables
- Use a named volume for persistent session data

---

### DBeaver (Community Edition)

**What it does:** Cross-platform desktop database tool supporting 80+ databases including PostgreSQL, MySQL, SQLite, and more. Strong for developers who want a local GUI.

**Resource Requirements:** Desktop app (not containerized), ~500MB RAM

**How it helps with data-driven products:**
- ERD visualization
- SQL editor with autocomplete
- Data export in multiple formats
- Good for local development workflow

**Note:** Not self-hosted server — runs locally. Use Adminer/pgAdmin for server-based access.

---

## 2. Backend-as-a-Service

### PocketBase

**What it does:** A lightweight, open-source backend in a single binary. Provides SQLite database, authentication, file storage, and REST/GraphQL API — perfect for rapid prototyping and small-to-medium production apps.

**GitHub:** https://github.com/pocketbase/pocketbase

**Docker Setup:**

```yaml
# docker-compose.yml
services:
  pocketbase:
    image: pocketbase/pocketbase
    restart: unless-stopped
    volumes:
      - pb_data:/pb/data
    ports:
      - "8090:8090"
    command: serve --http=0.0.0.0:8090
```

```bash
# First run to create admin account
docker exec -it pocketbase ./pocketbase admin create email@example.com
```

**Resource Requirements:** ~50MB RAM, minimal CPU. SQLite is embedded.

**How it helps with data-driven products:**
- **Quick API backend** for Alizé or Kuroba prototypes
- Built-in auth (email/password, OAuth)
- Real-time subscriptions via SSE
- File storage with CDN support
- PocketBase SDKs for JavaScript, Dart, Go, etc.

**Production Considerations:**
- SQLite works well up to ~100k daily active users
- Has S3-compatible storage for larger deployments
- For larger scale, consider migrating to Supabase

---

### Supabase (Self-Hosted)

**What it does:** The open-source Firebase alternative. Full Postgres database with REST API (PostgREST), Realtime subscriptions, Auth, Edge Functions, and Vector embeddings support.

**GitHub:** https://github.com/supabase/supabase

**Docker Setup:**

```yaml
# docker-compose.yml (simplified)
services:
  postgres:
    image: supabase/postgres:15.6.1.147
    restart: unless-stopped
    environment:
      POSTGRES_PASSWORD: your-db-password
      POSTGRES_DB: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

  kong:
    image: kong:3.4
    restart: unless-stopped
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /var/lib/kong/kong.yml
      KONG_PROXY_ACCESS_LOG: /dev/stdout
      KONG_ADMIN_ACCESS_LOG: /dev/stdout
      KONG_PROXY_ERROR_LOG: /dev/stderr
      KONG_ADMIN_ERROR_LOG: /dev/stderr
      KONG_ADMIN_LISTEN: 0.0.0.0:8001
    ports:
      - "8000:8000"
      - "8443:8443"
    volumes:
      - ./kong.yml:/var/lib/kong/kong.yml:ro

  postgrest:
    image: postgrest/postgrest:v12.0.2
    restart: unless-stopped
    environment:
      PGRST_DB_URI: postgres://postgres:your-db-password@postgres:5432/postgres
      PGRST_DB_SCHEMA: public
      PGRST_DB_ANON_ROLE: anon
    depends_on:
      - postgres

  # Additional services: auth, storage, realtime — see full docker-compose
```

**Resource Requirements:** 4GB+ RAM recommended for full stack, 2GB minimum for basic setup.

**How it helps with data-driven products:**
- **Instant REST API** over any PostgreSQL table — no backend code needed
- **Row Level Security (RLS)** for fine-grained access control
- **Realtime subscriptions** via WebSocket (listen to database changes)
- **pgvector integration** for AI/embedding storage and similarity search
- Edge Functions (serverless, TypeScript/JavaScript)
- Dashboard for database management

**Production Considerations:**
- Self-hosted requires more ops effort than managed cloud
- Use the official `supabase/self-hosting` repository for complete setup
- Storage service requires S3-compatible object storage
- Needs careful tuning for production traffic

---

### Appwrite (Self-Hosted)

**What it does:** Open-source BaaS platform with Auth, Databases, Functions, Storage, and Messaging. Strong Docker-based deployment.

**Docker Setup:**

```yaml
# docker-compose.yml (appwrite standalone)
services:
  appwrite:
    image: appwrite/appwrite:1.7
    restart: unless-stopped
    ports:
      - "90:80"
      - "91:443"
    volumes:
      - appwrite_data:/storage
    environment:
      APPWRITE_ENV: production
      APPWRITE_KEYS_ENCRYPTION_KEY: your-32-char-key
      APPWRITE_DB_PASS: your-db-password
      APPWRITE_SYSTEM_EMAIL: admin@example.com
```

**Resource Requirements:** 2GB+ RAM, multi-container architecture

**How it helps with data-driven products:**
- Database with attributes, indexes, and relationships
- Serverless functions (Python, PHP, Dart, etc.)
- Team/user management and role-based access
- File previews, image transformation
- Has MCP server for AI integration

**Production Considerations:**
- Heavier than PocketBase — more features but higher resource cost
- Good choice if you need built-in messaging or teams

---

## 3. Analytics & BI

### PostHog (Self-Hosted)

**What it does:** All-in-one product analytics platform with event tracking, session recording, feature flags, A/B testing, and surveys. Open-source and privacy-compliant (no cookies required).

**GitHub:** https://github.com/PostHog/posthog

**Docker Setup:**

```yaml
# docker-compose.yml (from PostHog docs)
services:
  posthog:
    image: posthog/posthog:latest
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      SECRET_KEY: your-secret-key
      DEBUG: "false"
      SITE_URL: https://analytics.example.com
    volumes:
      - posthog_pg_data:/var/lib/postgresql/data
      - posthog_data:/posthog
```

**Resource Requirements:** 4GB+ RAM minimum, 8GB+ recommended. CPU-intensive with session replay.

**How it helps with data-driven products:**
- **Event tracking** for Alizé/ts.news user behavior
- **Session recordings** to understand UX issues
- **Feature flags** for gradual rollouts
- **A/B testing** — experiment with different AI model prompts or UIs
- **Retention analytics** — understand which features drive engagement
- GDPR/CCPA compliant, no cookie banner needed

**Production Considerations:**
- Heavy resource usage — consider using the cloud version if budget allows
- ClickHouse backend for event data scales well
- Regular backups essential — event data grows fast

---

### Plausible Analytics

**What it does:** Privacy-focused web analytics. Simple, lightweight alternative to Google Analytics. No cookies, GDPR-compliant, and surprisingly capable for its size.

**Docker Setup:**

```yaml
# docker-compose.yml
services:
  plausible:
    image: plausible/analytics:latest
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      SECRET_KEY_BASE: your-secret-key-base
      BASE_URL: https://analytics.example.com
      DATABASE_URL: postgres://postgres:password@db:5432/plausible
      CLICKHOUSE_DATABASE_URL: http://clickhouse:9000
    volumes:
      - ./data:/data
    depends_on:
      - db
      - clickhouse

  db:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_PASSWORD: password
      POSTGRAGES_DB: plausible
    volumes:
      - db_data:/var/lib/postgresql/data

  clickhouse:
    image: clickhouse/clickhouse-server:latest
    restart: unless-stopped
    volumes:
      - clickhouse_data:/var/lib/clickhouse
    ulimits:
      nofile:
        soft: 262144
        hard: 262144
```

**Resource Requirements:** ~1-2GB RAM for minimal setup

**How it helps with data-driven products:**
- Simple pageview and event tracking for ts.news marketing site
- Traffic sources, top pages, conversion goals
- Very lightweight script (~1KB) — doesn't slow down pages
- Privacy-first: no personal data collection
- Good for marketing sites, blogs, and landing pages

**Production Considerations:**
- Lighter than PostHog but less feature-rich
- Good for ts.news public-facing analytics
- Single-page dashboard, straightforward to operate

---

### Umami

**What it does:** Simple, fast, privacy-respecting web analytics. Open-source and designed to be a Google Analytics replacement.

**Docker Setup:**

```yaml
# docker-compose.yml
services:
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://umami:umami-password@db:5432/umami
      DATABASE_TYPE: postgresql
      APP_SECRET: your-app-secret
    volumes:
      - umami_data:/app/data
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: umami
      POSTGRES_PASSWORD: umami-password
      POSTGRES_DB: umami
    volumes:
      - db_data:/var/lib/postgresql/data
```

**Resource Requirements:** ~512MB-1GB RAM

**How it helps with data-driven products:**
- Lightweight, fast-loading dashboard
- Tracks pageviews, sessions, referrers
- Real-time visitor count
- Custom events tracking
- GDPR/CCPA compliant

**Production Considerations:**
- Even lighter than Plausible
- PostgreSQL-only (no MySQL option)
- Good for developers who want SQL access to analytics data

---

## 4. Data Pipelines

### Airbyte

**What it does:** Open-source data integration (ELT) platform. Syncs data from 300+ sources (databases, APIs, SaaS tools) into your data warehouse or destination.

**GitHub:** https://github.com/airbytehq/airbyte

**Docker Setup:**

```bash
# Quick start (from docs)
git clone https://github.com/airbytehq/airbyte
cd airbyte
docker-compose up -d
```

```yaml
# docker-compose.yml (abridged - uses docker-compose from repo)
# See: https://docs.airbyte.com/getting-started/getting-started
```

**Resource Requirements:** 4GB+ RAM, 10GB+ storage. Workers scale with data volume.

**How it helps with data-driven products:**
- **Consolidate data** from Alizé/ts.news/Kuroba into a data warehouse
- **Reverse ETL** — push data from warehouse to operational tools
- **CDC (Change Data Capture)** — stream database changes in real-time
- Pre-built connectors for Stripe, Salesforce, PostgreSQL, MySQL, etc.
- Supports AI/ML destinations (Pinecone, Chroma for embeddings pipelines)

**Production Considerations:**
- The official docker-compose is resource-heavy (uses Kubernetes-like architecture)
- For smaller workloads, consider Airbyte Lite or the basic local setup
- Connector ecosystem is large — most common sources well-supported

---

### Meltano

**What it does:** Open-source data extraction and transformation tool built on the Singer protocol. Focuses on ELT with full pipeline control.

**GitHub:** https://github.com/meltano/meltano

**Docker Setup:**

```yaml
# docker-compose.yml
services:
  meltano:
    image: meltano/meltano:latest
    restart: unless-stopped
    volumes:
      - ./meltano_projects:/projects
      - meltano_data:/data
    environment:
      MElTANO_PROJECT_ROOT: /projects
    ports:
      - "5000:5000"
    command: ui
```

```bash
# Or run via CLI
docker run --rm -v $(pwd):/projects meltano/meltano:latest elt tap-postgres target-postgres
```

**Resource Requirements:** ~1GB RAM, scales based on extraction volume

**How it helps with data-driven products:**
- **Tap/target model** — extract from any source, load to any destination
- **dbt integration** for transformations
- **Airflow scheduler** integration for orchestration
- GitLab/GitHub integration for CI/CD data pipelines
- Good for **data team workflows** with custom pipelines

**Production Considerations:**
- More developer-friendly than Airbyte
- Requires YAML configuration for pipelines
- Smaller connector ecosystem but highly customizable

---

### Additional Pipeline Options

**Metabase** — Not strictly a pipeline tool but provides BI/reporting on top of databases. Good for ad-hoc queries.

**DuckDB** — In-process OLAP database. Excellent for analytical queries on CSV/Parquet files without a full pipeline.

---

## 5. Cache & Key-Value Store

### Redis

**What it does:** In-memory data store for caching, sessions, pub/sub, and real-time features. Extremely fast (~100k+ ops/sec).

**Docker Setup:**

```yaml
# docker-compose.yml
services:
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
```

**Resource Requirements:** 
- Minimal RAM usage (~5-10MB overhead + data)
- For caching: size based on your cache needs (64MB to many GB)
- For sessions/pub-sub: minimal storage

**How it helps with data-driven products:**
- **Caching layer** for Alizé AI responses (reduce LLM API calls)
- **Session storage** for user authentication
- **Rate limiting** with sliding window algorithm
- **Pub/sub** for real-time features
- **Leaderboards** (sorted sets) for gamification
- **Vector similarity** search (Redis 7.2+ has vector support)

**Production Considerations:**
- Enable AOF persistence for durability
- Use `redis-cli info memory` to monitor memory
- For production: Redis Cluster or Sentinel for HA

---

## 6. Vector Database

### pgvector (PostgreSQL Extension)

**What it does:** Open-source vector similarity search for PostgreSQL. Enables storing, indexing, and querying embeddings (high-dimensional vectors) directly in your Postgres database.

**GitHub:** https://github.com/pgvector/pgvector

**Docker Setup:**

```yaml
# docker-compose.yml
services:
  postgres:
    image: pgvector/pgvector:pg16
    restart: unless-stopped
    environment:
      POSTGRES_PASSWORD: your-password
      POSTGRES_DB: aicore
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table with vector column (1536 dims for OpenAI ada-002)
CREATE TABLE embeddings (
  id SERIAL PRIMARY KEY,
  content TEXT,
  metadata JSONB,
  embedding vector(1536)
);

-- Create HNSW index for fast similarity search
CREATE INDEX ON embeddings USING hnsw (embedding vector_cosine_ops);

-- Query for similar content
SELECT id, content, 1 - (embedding <=> '[0.1, 0.2, ...]') AS similarity
FROM embeddings
ORDER BY embedding <=> '[0.1, 0.2, ...]'
LIMIT 5;
```

**Resource Requirements:** 
- RAM: embeddings are memory-intensive (~4 bytes per dimension per row)
- 1M vectors × 1536 dims ≈ 6GB RAM
- Add RAM based on your embedding corpus size

**How it helps with data-driven products:**
- **Semantic search** — find content by meaning, not keywords
- **RAG (Retrieval-Augmented Generation)** — fetch relevant context for AI models
- **Similarity matching** — recommend content in Alizé/Kuroba
- **Document clustering** — group similar articles in ts.news
- Works with OpenAI embeddings, Claude embeddings, open-source models

**Production Considerations:**
- Use HNSW index for speed vs IVFFlat for memory efficiency
- PG 16+ recommended for best pgvector performance
- Consider partitioning for very large embedding tables

---

### Alternatives for Vector Search

**Qdrant** — Purpose-built vector database with Rust-based high performance. Good for production AI workloads.

**Weaviate** — Open-source vector search engine with hybrid search (vector + keyword).

**Chroma** — Lightweight vector DB for AI apps, embedded design.

---

## 7. SQLite Tools

For lightweight local development, prototyping, or embedded use in Kuroba:

### SQLite Browser (DB Browser for SQLite)

**Desktop GUI tool** — not server-based, but essential for local development.

### Litestream

**What it does:** Continuous streaming replication for SQLite. Provides point-in-time recovery and backups without manual intervention.

**Docker Setup:**

```yaml
# docker-compose.yml
services:
  app:
    image: your-app-image
    volumes:
      - /data:/data
      - /home/litestream:/etc/litestream

  litestream:
    image: litestream/litestream:latest
    restart: unless-stopped
    volumes:
      - db_data:/data
      - ./litestream.yml:/etc/litestream/litestream.yml
    command: replicate -config /etc/litestream/litestream.yml
```

```yaml
# litestream.yml
dbs:
  - path: /data/app.db
    replicas:
      - url: s3://your-bucket/app.db
        retention: 60d
        sync-interval: 1s
```

**How it helps with data-driven products:**
- **Zero-config backups** for SQLite
- Point-in-time recovery
- Perfect for Kuroba as a lightweight database

---

## Summary & Recommendations

| Tool | Use Case | Resource Impact | Complexity |
|------|----------|-----------------|------------|
| **Adminer** | Lightweight DB UI | Very Low | Low |
| **pgAdmin** | PostgreSQL admin | Low | Low |
| **PocketBase** | Quick API backend | Very Low | Low |
| **Supabase** | Full Firebase alternative | High | High |
| **Appwrite** | BaaS with functions | Medium | Medium |
| **PostHog** | Product analytics | High | Medium |
| **Plausible** | Simple web analytics | Low | Low |
| **Umami** | Lightweight analytics | Very Low | Low |
| **Airbyte** | Data integration | High | High |
| **Meltano** | ELT pipelines | Medium | Medium |
| **Redis** | Caching/sessions | Low | Low |
| **pgvector** | Vector/AI search | Medium | Low |
| **Litestream** | SQLite backups | Very Low | Low |

### Quick Start Stack for Alizé/ts.news/Kuroba

**Minimum viable:**
1. **PocketBase** → Quick backend API for prototyping
2. **Redis** → Caching for AI responses
3. **Umami** → Simple analytics for public sites
4. **pgvector** → Semantic search for AI features

**Production-ready:**
1. **PostgreSQL + pgAdmin** → Core database
2. **Supabase** or custom API → Backend services
3. **PostHog** → Full product analytics
4. **Redis** → Caching layer
5. **pgvector** → AI embeddings
6. **Airbyte** → Data consolidation (when you have multiple data sources)

**Data pipeline:**
- Start with Litestream for SQLite backups (Kuroba)
- Move to Airbyte/Meltano when data volume grows
- Use pgvector for all embedding-based AI features

---

## Useful Links

- [PostHog Self-Hosted Docs](https://posthog.com/docs/self-host)
- [Supabase Self-Hosted](https://supabase.com/docs/guidesself-host)
- [PocketBase GitHub](https://github.com/pocketbase/pocketbase)
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [Airbyte Quickstart](https://docs.airbyte.com/getting-started/oss-quickstart)
- [Meltano Getting Started](https://docs.meltano.com/getting-started/)
- [Litestream Docs](https://litestream.io/)
