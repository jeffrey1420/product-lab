# Self-Hosted Productivity Tools for Indie Hackers

**Context:** Running Alizé (AI agency), Kuroba (web agency), and ts.news. Need wikis, notes, project management, file sharing, and bookmarks — all self-hosted, low-overhead, and AI-agent friendly.

This guide cuts through the noise. Every tool here was evaluated on: how fast it runs on a cheap VPS, how annoying it is to maintain, and whether an AI agent can actually work with it.

---

## Table of Contents

1. [Wikis](#wikis)
2. [Notes & All-in-One Workspaces](#notes--all-in-one-workspaces)
3. [Project Management](#project-management)
4. [Bookmarks / Read-it-Later](#bookmarks--read-it-later)
5. [File Sharing](#file-sharing)
6. [Recommendations by Use Case](#recommendations-by-use-case)

---

## Wikis

### Wiki.js

**What it is:** A modern, Node.js-powered wiki with a polished UI, Markdown/WYSIWYG editing, and extensive auth integrations.

**Best for:** Teams that need real-time collaboration and enterprise-grade auth (LDAP, SAML, OIDC, Okta).

**What it does:**
- Modern WYSIWYG + Markdown editor with live preview
- Hierarchical page structure with tags, TOC, and search
- Real-time collaboration (v3.0.0-alpha)
- Granular permissions and auth connectors
- REST/GraphQL API, webhooks, diagram rendering, code syntax highlighting
- Dark/light themes, customizable UI

**Docker setup:**
```yaml
# docker-compose.yml (simplified)
services:
  db:
    image: postgres:18
    environment:
      POSTGRES_DB: wikijs
      POSTGRES_USER: wikiuser
      POSTGRES_PASSWORD: wikipass
    volumes:
      - ./db:/var/lib/postgresql
    restart: unless-stopped

  wiki:
    image: ghcr.io/linuxserver/wikijs:latest
    ports:
      - "3540:3000"
    volumes:
      - ./config:/config
      - ./data:/data
    environment:
      DB_TYPE: postgres
      DB_HOST: wiki-js-db
      DB_PORT: 5432
      DB_NAME: wikijs
      DB_USER: wikiuser
      DB_PASS: wikipass
    depends_on:
      - db
    restart: unless-stopped
```
Requires a reverse proxy (Nginx/Caddy) with WebSocket support for real-time features.

**Resource requirements:** ~2GB RAM minimum, 2+ CPU cores. Runs on Raspberry Pi but sluggish.

**AI agent integration:** REST/GraphQL API is well-documented. You can have an AI agent query and write wiki pages via API calls. No native AI features — you'd pipe content to an external LLM.

---

### BookStack

**What it is:** A PHP/Laravel wiki that organizes content into **Shelves → Books → Chapters → Pages**. Clean, intuitive, and very popular in the selfhosted community.

**Best for:** Indie hackers who want a structured knowledge base without enterprise complexity.

**What it does:**
- Book/Chapter/Page hierarchy — works surprisingly well for project documentation
- WYSIWYG editor with diagrams.net integration
- Full-text search across all content
- LDAP, SAML 2.0, OIDC, and MFA support
- Webhooks + REST API
- Role-based permissions
- Version history, status workflows

**Docker setup:**
```yaml
services:
  db:
    image: mariadb:11
    environment:
      MYSQL_ROOT_PASSWORD: root_password_change_me
      MYSQL_DATABASE: bookstack
      MYSQL_USER: bookstack
      MYSQL_PASSWORD: db_password_change_me
    volumes:
      - ./db:/var/lib/mysql
    restart: unless-stopped

  bookstack:
    image: lscr.io/linuxserver/bookstack:latest
    ports:
      - "6875:80"
    environment:
      APP_URL: https://wiki.yourdomain.com
      DB_HOST: db
      DB_PORT: 3306
      DB_DATABASE: bookstack
      DB_USERNAME: bookstack
      DB_PASSWORD: db_password_change_me
      PUID: 1000
      PGID: 1000
    volumes:
      - ./config:/config
    depends_on:
      - db
    restart: unless-stopped
```

**Resource requirements:** Runs comfortably on a **$5 VPS**. ~1GB RAM, 1 CPU core.

**AI agent integration:** REST API exists. Can create/update pages programmatically. No native AI. Works well as a structured knowledge store that an AI agent can read via API.

---

### DokuWiki

**What it is:** A flat-file wiki (no database) that stores everything as plain text files. Battle-tested, extremely lightweight, plugin-extensible.

**Best for:** Power users who want zero database dependency, or those running on very limited hardware.

**What it does:**
- Flat-file storage — no MySQL/MariaDB needed
- ACL-based access control
- 1500+ plugins for extending functionality
- Markdown + WikiText support
- Version control built-in
- Highly multilingual

**Docker setup:**
```bash
docker run -p 8080:8080 -v $PWD/data:/data linuxserver/dokuwiki
```

**Resource requirements:** ~256MB RAM. Can run on a Raspberry Pi Zero.

**AI agent integration:** API via plugins (JSON/RPC). Content is plain text files — an AI agent can read/write them directly via filesystem or plugin. Very agent-friendly.

**Watch out:** The UI looks like it's from 2008. It's functional, not pretty.

---

### TiddlyWiki

**What it is:** A unique, non-linear notebook that lives as a **single HTML file**. Each "tiddler" is a self-contained unit of content with its own metadata. Extremely portable.

**Best for:** Personal knowledge management, zettelkasten-style notes, single-user wikis.

**What it does:**
- Single HTML file — runs anywhere, no server required
- Non-linear, hyperlinked notes
- Highly customizable via plugins (tiddlers are just JSON)
- Multiple deployment options: file-based, Node.js server, Docker

**Docker setup:**
```bash
docker run -p 8080:8080 -v $PWD/data:/data vimagick/tiddlywiki \
  --listen host=0.0.0.0 port=8080 \
  username=admin password=admin writers=(authenticated)
```

**Resource requirements:** Negligible. Single-digit MB of RAM.

**AI agent integration:** The single-file format is **extremely agent-friendly** — an AI can read/write the entire wiki as a JSON/tiddler structure. No API needed. Great for personal second brain use.

---

### HedgeDoc (formerly Caret)

**What it is:** A collaborative, real-time Markdown editor. Think "Hacker News-friendly Notion" — great for team notes, collaborative writing, and real-time editing sessions.

**Best for:** Teams that live in Markdown and want real-time collaboration without Google Docs lock-in.

**What it does:**
- Real-time collaborative Markdown editing (like Etherpad but Markdown-native)
- Presentations mode (slides from Markdown)
- Graph visualization of note connections
- Import/export: Markdown, HTML, PDF, Word
- History and versioning
- Browser extension for saving pages

**Docker setup:**
```yaml
services:
  database:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: hedgedoc
      POSTGRES_USER: hedgedoc
      POSTGRES_PASSWORD: hedgedoc_password
    volumes:
      - db:/var/lib/postgresql/data
    restart: unless-stopped

  hedgedoc:
    image: ghcr.io/hedgedoc/hedgedoc:latest
    ports:
      - "3000:3000"
    environment:
      - CMD_DB_URL=postgres://hedgedoc:hedgedoc_password@database:5432/hedgedoc
      - CMD_DOMAIN=notes.yourdomain.com
      - CMD_PROTOCOL_USESSL=true
    volumes:
      - uploads:/hedgedoc/public/uploads
    depends_on:
      - database
    restart: unless-stopped
```

**Resource requirements:** ~512MB-1GB RAM. PostgreSQL adds overhead.

**AI agent integration:** Notes are plain Markdown — an agent can read/write directly. REST API available. Great for team knowledge bases where everything is Markdown-native.

---

## Notes & All-in-One Workspaces

### AFFiNE

**What it is:** The most complete Notion + Miro + Linear alternative you can self-host. Documents, whiteboards (Edgeless Mode), and databases in one. Built-in AI assistance. Local-first architecture.

**Best for:** Teams that need the full Notion experience — docs, databases, Kanban, whiteboards, and AI — without handing data to a third party.

**What it does:**
- Docs + whiteboards + databases in one workspace
- Edgeless Mode for freeform visual thinking
- Built-in AI for writing, summarization, organization
- Real-time collaboration
- Local-first (data stored on your infrastructure)
- Templates for common project types
- MIT licensed, active community (4k+ Discord members)

**System requirements:**
| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU      | 2 cores | 4 cores     |
| RAM      | 1 GB    | 2 GB        |
| Storage  | 20 GB   | 40 GB SSD   |

**Docker setup:**
```bash
# Download official compose file
wget -O docker-compose.yml https://github.com/toeverything/affine/releases/latest/download/docker-compose.yml
cp .env.example .env
# Edit .env with your domain, secrets, and database credentials
docker compose up -d
```
The compose includes: AFFiNE server + PostgreSQL + Redis. Access at `http://your-server:3010`.

**AI agent integration:** Built-in AI features are useful for humans. For agents, the database is PostgreSQL-backed — you can query it directly. REST API available. **Best-in-class for self-hosted AI workspace tools.**

---

### AppFlowy

**What it is:** An open-source Notion alternative built with **Flutter + Rust** for native desktop/mobile performance. Multi-view databases (Grid, Kanban, Calendar), full offline support, and AI integration (cloud or local via Ollama).

**Best for:** Individuals or teams who want a native app experience, offline-first operation, and AI that can run entirely locally.

**What it does:**
- Multi-view databases: Grid, Kanban, Calendar, Board
- Native desktop apps (macOS, Windows, Linux) + mobile
- AI integration: cloud APIs or local Ollama models
- Plugin system for extending functionality
- 30k+ GitHub stars, active development
- Self-host the sync server via Docker

**System requirements:**
| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU      | 1 core  | 2 cores     |
| RAM      | 1 GB    | 2 GB        |
| Storage  | 20 GB   | 40 GB SSD   |

**Docker setup (for sync server):**
```bash
git clone https://github.com/AppFlowy-IO/AppFlowy-Cloud.git
cd AppFlowy-Cloud
cp deploy.env .env
# Edit .env with your domain and configuration
docker compose up -d
```
Then connect the desktop app to your self-hosted server via Settings → Cloud Settings.

**AI agent integration:** Ollama integration means AI can run entirely on your infrastructure. Database is PostgreSQL. REST API available. **Excellent for privacy-conscious AI workflows.**

---

### Obsidian (with Self-Hosted Sync Alternatives)

**What it is:** The gold standard for local-first, Markdown-based personal knowledge management. Graph view, backlinks, plugins, and a thriving ecosystem.

**Best for:** Personal second brain, zettelkasten, research notes, writing.

**What it does:**
- Local Markdown files — your data is yours forever
- Backlinks, graph view, bidirectional linking
- 1000+ community plugins
- Native desktop + mobile apps
- Sync (official) or self-host with community alternatives

**Self-hosting options for sync:**

1. **Obsidian Sync** — official hosted service (not self-hosted, but worth knowing: $4/month for sync + unlimited vaults)
2. **Self-hosted alternatives:**
   - **syncthing** — peer-to-peer file sync, runs on your own hardware
   - **restic + S3** — back up vault to any S3-compatible storage
   - **Git-based** — commit/push vault to a private Git repo on a schedule
   - **Obsidian Git community plugin** — auto-commit vault to Git

**Docker setup (syncthing):**
```yaml
services:
  syncthing:
    image: syncthing/syncthing:latest
    ports:
      - "8384:8384"
      - "22000:22000/tcp"
      - "22000:22000/udp"
    volumes:
      - ./data:/var/syncthing
    environment:
      - PUID=1000
      - PGID=1000
    restart: unless-stopped
```

**Resource requirements:** Minimal — Obsidian is just a local app. Sync server adds negligible overhead.

**AI agent integration:** **Best of any tool here for AI agents.** Vault is a folder of Markdown files. An agent can read, write, search, and graph-query your entire knowledge base with no API. Just filesystem access. This is the recommended tool for personal notes if you work with AI agents.

---

## Project Management

### Plane

**What it is:** An AI-native project management platform with Projects, Wiki, and AI all in one workspace. GitHub/GitLab integration built-in. AGPL-3.0, fully self-hostable.

**Best for:** Development teams or indie hackers who want Linear-like project management with built-in AI and a wiki.

**What it does:**
- Issues, sprints, cycles, views (Kanban, List, Calendar, Gantt)
- GitHub/GitLab integration (auto-link commits, PRs)
- Built-in AI for writing task descriptions, sprint summaries
- Wiki embedded in projects
- Webhooks + REST API
- Unlimited projects/users (Community Edition)

**System requirements:**
| Resource | Minimum       | Recommended |
|----------|---------------|-------------|
| CPU      | 2 cores       | 4 cores     |
| RAM      | 4 GB          | 8 GB        |
| Storage  | 10 GB SSD     | 20 GB SSD   |

**Docker setup (Community Edition):**
```bash
mkdir plane-selfhost && cd plane-selfhost
curl -fsSL -o setup.sh https://github.com/makeplane/plane/releases/latest/download/setup.sh
chmod +x setup.sh
./setup.sh
# Select option 1 (Install), then option 8 (Exit), configure plane.env, then 2 (Start)
```

Or via the installer:
```bash
curl -fsSL https://prime.plane.so/install/ | sh -
# Follow prompts for domain, advanced config
```

**Resource requirements:** Hefty — needs PostgreSQL + Redis. 4GB RAM minimum for Docker Compose. Better on a dedicated VPS than shared hosting.

**AI agent integration:** REST API is comprehensive. Webhooks on task events. An AI agent can create tasks, update status, comment on issues, and generate summaries via API. **One of the better self-hosted PM tools for AI agent automation.**

---

### Vikunja

**What it is:** A lightweight, fast task/project manager in Go. List, Kanban, Gantt, and Table views. CalDAV sync. Import from Todoist/Trello.

**Best for:** Indie hackers who want a clean, fast task manager without the weight of Plane. Great for personal use or small teams.

**What it does:**
- Multiple views: List, Kanban, Gantt, Table
- Quick Add Magic — natural language task creation with dates, labels, assignees
- Subtasks, due dates, repeat rules, priorities
- Share links (no account needed for viewing/editing)
- Labels, filters, relations between tasks
- CalDAV sync (use with existing calendar apps)
- Import from Todoist, Trello, Microsoft To-Do
- File attachments

**Docker setup (simplest — SQLite):**
```bash
mkdir $PWD/files $PWD/db
chown 1000 $PWD/files $PWD/db
docker run -p 3456:3456 \
  -v $PWD/files:/app/vikunja/files \
  -v $PWD/db:/db \
  -e VIKUNJA_SERVICE_PUBLICURL=https://tasks.yourdomain.com \
  vikunja/vikunja
```

**With PostgreSQL + Caddy (production):**
```yaml
services:
  vikunja:
    image: vikunja/vikunja:latest
    ports:
      - "3456:3456"
    volumes:
      - ./files:/app/vikunja/files
    environment:
      - VIKUNJA_SERVICE_PUBLICURL=https://tasks.yourdomain.com
      - VIKUNJA_DB_TYPE=postgres
      - VIKUNJA_DB_HOST=db
      - VIKUNJA_DB_DATABASE=vikunja
      - VIKUNJA_DB_USER=vikunja
      - VIKUNJA_DB_PASSWORD=vikunja_password
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: vikunja
      POSTGRES_USER: vikunja
      POSTGRES_PASSWORD: vikunja_password
    volumes:
      - db:/var/lib/postgresql/data
    restart: unless-stopped
```

**Resource requirements:** Extremely light. ~50MB RAM. Works on Raspberry Pi. **Best resource-to-value ratio of any PM tool here.**

**AI agent integration:** REST API is clean and well-documented. An agent can CRUD tasks, set due dates, and filter via API. Fast responses (<100ms). Great for agent-driven task management.

---

### Focalboard

**What it is:** An open-source Trello/Asana alternative from the Mattermost community. Kanban, Table, Gallery, and Calendar views. Self-hosted multi-user server edition.

**Best for:** Teams that want a simple, no-frills Kanban board without enterprise overhead.

**Status:** ⚠️ **This repository is currently not actively maintained.** The last major releases were in 2023-2024. There's no active maintainer as of early 2026. Use with caution for production.

**What it does:**
- Kanban, Table, Gallery, Calendar views
- Cards with custom attributes, priorities, due dates
- Board templates (Project Tasks, Roadmap, Meeting Agenda, etc.)
- Comments, @mentions, user permissions
- File attachments
- REST API

**Docker setup:**
```bash
docker run -it -p 80:8000 mattermost/focalboard
```
Single container, no database dependency (SQLite in container). For production with PostgreSQL, use the `mattermost/focalboard` image with config.json and a Postgres connection.

**Resource requirements:** ~512MB RAM. Single Docker container.

**AI agent integration:** REST API available. Basic CRUD on boards/cards. Not as comprehensive as Plane or Vikunja APIs.

**Bottom line:** Consider Vikunja instead — actively maintained, similar feature set, better architecture.

---

## Bookmarks / Read-it-Later

### linkding

**What it is:** A minimal, fast, self-hosted bookmark manager in **Rust**. Designed specifically for easy Docker setup. One of the cleanest bookmark managers available.

**Best for:** Anyone who wants a self-hosted Pinboard/Reclaim Efficiency alternative. Simple, fast, beautiful.

**What it does:**
- Save bookmarks with tags
- Auto-fetch title, description, favicon
- Readability mode (extract article content)
- Browser extension for quick saving
- Search across all bookmarks
- Public share links
- Archive snapshots of links
- API for programmatic access

**Docker setup:**
```yaml
services:
  linkding:
    image: sissbruecker/linkding:latest
    container_name: linkding
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./data:/etc/linkding/data
    environment:
      LD_SUPERUSER_NAME: admin
      LD_SUPERUSER_PASSWORD: your-strong-password-here
      LD_DISABLE_BACKGROUND_TASKS: "False"
      LD_ENABLE_AUTH_PROXY: "False"
```

**Resource requirements:** Tiny. ~100MB RAM. SQLite backend. **Zero infrastructure overhead.**

**AI agent integration:** REST API is clean and well-documented. An agent can save bookmarks with tags, search, and retrieve archived content. **Great for building AI-powered research workflows** — agent finds a useful URL, saves it to linkding with tags for later review.

---

### Wallabag

**What it is:** A self-hosted "read it later" app (Pocket alternative). Saves web pages for offline reading, strips ads, extracts clean text.

**Best for:** Saving articles to read later in a clean, distraction-free format. Great for research and content consumption.

**What it does:**
- Save any URL for later reading
- Clean, readable extraction (like Pocket)
- Tags, annotations, archive
- Import from Pocket (CSV)
- Automated tagging rules (domain + reading time conditions)
- Android app (no MFA support yet — a known limitation)
- Kobo e-reader integration via KOReader
- REST API

**Docker setup:**
```bash
# SQLite (simplest)
docker run -d \
  --name wallabag \
  -e MYSQL_ROOT_PASSWORD=wallaroot \
  -e SYMFONY__ENV__DATABASE_DRIVER=pdo_mysql \
  -e SYMFONY__ENV__DATABASE_HOST=wallabag-db \
  -e SYMFONY__ENV__DATABASE_PORT=3306 \
  -e SYMFONY__ENV__DATABASE_NAME=wallabag \
  -e SYMFONY__ENV__DATABASE_USER=wallabag \
  -e SYMFONY__ENV__DATABASE_PASSWORD=wallapass \
  -e SYMFONY__ENV__DOMAIN_NAME=https://read.yourdomain.com \
  -p 3000:3000 \
  wallabag/wallabag
```

Or SQLite (zero infrastructure):
```bash
docker run -p 8080:8080 -v $PWD/data:/data wallabag/wallabag
# Default: wallabag / wallabag
```

**Resource requirements:** 2GB RAM minimum for large imports (4000+ articles). PHP 8.4+, MySQL/MariaDB/PostgreSQL/SQLite.

**AI agent integration:** REST API exists. Can save URLs, tag articles, fetch reading lists. **Combine with Obsidian** — there's an Obsidian-Wallabag plugin that pulls saved articles into your vault as Markdown. Powerful research pipeline.

---

## File Sharing

### The Honest Answer for Indie Hackers

Before listing tools, here's the real question: **how much file sharing do you actually need?**

| Need | Solution |
|------|----------|
| Share files with clients occasionally | `curl -F file=@myfile.pdf https://tmpfiles.org` or a cheap file hosting service |
| Host project deliverables, assets, backups | S3-compatible storage (Cloudflare R2, Backblaze B2) + a simple UI |
| Real-time team file sync | Next → Nextcloud |
| Full office suite (Docs, Sheets, collaboration) | Nextcloud OnlyOffice/Collabora + Talk |

**Don't spin up Nextcloud for three file shares a month.** It's a full OS — RAM hungry, maintenance-heavy, and updates break things.

---

### Simple S3-Compatible File Sharing

**Cloudflare R2** or **Backblaze B2** — object storage with no egress fees. Pay only for storage.

**For a simple UI on top of R2:**
- **Cloudflare Workers + R2** — build a minimal file browser
- **S3 Browser** — desktop app for managing buckets
- **rclone** — CLI tool that mounts S3 as a filesystem

**Docker + MinIO (self-hosted S3):**
```yaml
services:
  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"  # Console
    volumes:
      - ./data:/data
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadminpassword
    command: server /data --console-address ":9001"
    restart: unless-stopped
```
Access via the console at `http://yourdomain:9001` or any S3-compatible client (Cyberduck, rclone).

**Resource requirements:** ~1GB RAM. Can run alongside other containers.

---

### Nextcloud

**What it is:** The full self-hosted Google Drive/Office replacement. File sync, collaborative docs (OnlyOffice/Collabora), Talk (video chat), Deck (Kanban), Notes, Mail, and 200+ apps.

**Best for:** Teams that genuinely need real-time document collaboration and a full productivity suite.

**What it does:**
- File sync and sharing (WebDAV, desktop/mobile clients)
- Collaborative documents (via OnlyOffice or Collabora Online)
- Deck — Kanban boards
- Notes — Markdown notes
- Talk — video conferencing
- Calendar, Contacts (CalDAV/CardDAV)
- 200+ apps in the app store

**Docker setup (with Apache):**
```yaml
services:
  nextcloud:
    image: nextcloud:latest
    ports:
      - "8080:80"
    volumes:
      - ./data:/var/www/html
      - ./apps:/var/www/html/custom_apps
      - ./config:/var/www/html/config
      - ./data:/var/www/html/data  # mounted twice intentionally
    environment:
      - MYSQL_HOST=db
      - MYSQL_DATABASE=nextcloud
      - MYSQL_USER=nextcloud
      - MYSQL_PASSWORD=nextcloud_password
      - NEXTCLOUD_ADMIN_USER=admin
      - NEXTCLOUD_ADMIN_PASSWORD=admin_password
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mariadb:11
    environment:
      MYSQL_DATABASE: nextcloud
      MYSQL_USER: nextcloud
      MYSQL_PASSWORD: nextcloud_password
    volumes:
      - db:/var/lib/mysql
    restart: unless-stopped
```

**Resource requirements:** **2-4GB RAM minimum.** The full stack is heavy. Adding OnlyOffice/Collabora doubles memory needs. This is not a $5 VPS tool.

**AI agent integration:** WebDAV interface means an agent can read/write files via HTTP. File operations are straightforward. **Overkill for simple file hosting** — use S3 + rclone instead.

**Bottom line:** Only deploy Nextcloud if you need the full suite (collab docs, video calls, Kanban). Otherwise, it's a RAM-hungry maintenance burden.

---

## Recommendations by Use Case

### The Lean Stack (Minimal RAM, Maximum Sanity)

| Category | Tool | Why |
|----------|------|-----|
| Wiki | **BookStack** | Runs on $5 VPS, structured, great search |
| Personal notes | **Obsidian** | Best for AI agents (it's just Markdown files) |
| Team notes | **HedgeDoc** | Real-time Markdown collab, zero overhead |
| Tasks/PM | **Vikunja** | <100MB RAM, 4 views, excellent API |
| Bookmarks | **linkding** | Rust, SQLite, beautiful, minimal |
| File sharing | **R2/B2 + rclone** | Zero maintenance, no server needed |

### The Full-Stack (Feature-Rich, More Resources)

| Category | Tool | Why |
|----------|------|-----|
| Wiki + PM | **Plane** | Projects, Wiki, AI in one — if you need both |
| All-in-one workspace | **AFFiNE** | Notion replacement with whiteboards + AI |
| Team file sync | **Nextcloud** | Only if you need Google Docs replacement |

### For AI Agent Workflows

1. **Personal knowledge:** Obsidian vault (Markdown files) — agents read/write directly
2. **Team knowledge:** BookStack or HedgeDoc — REST API access
3. **Tasks:** Vikunja — fast API, <100ms responses
4. **Bookmarks:** linkding — clean API for saving research
5. **Everything else:** Tools with PostgreSQL backends (Plane, AFFiNE, AppFlowy) — agents can query data directly

### The "I Just Want to Start" Stack

```
Wiki        → BookStack     (1 Docker container, MariaDB, ~1GB RAM total)
Notes       → Obsidian      (local app + Git sync)
Tasks       → Vikunja       (1 Docker container, SQLite, ~100MB RAM)
Bookmarks   → linkding      (1 Docker container, SQLite, ~100MB RAM)
Files       → R2 + rclone   (zero self-hosted infra)
```

This stack runs comfortably on a $10-15/month VPS with room to spare.

---

## Tool Summary Table

| Tool | Type | Docker | DB | Min RAM | AI-Friendly | Maintenance |
|------|------|--------|----|---------|-------------|-------------|
| **Wiki.js** | Wiki | ✅ | PostgreSQL/MySQL | 2 GB | API | Medium |
| **BookStack** | Wiki | ✅ | MariaDB | 1 GB | API | Low |
| **DokuWiki** | Wiki | ✅ | None (flat file) | 256 MB | Direct FS | Low |
| **TiddlyWiki** | Wiki/Notes | ✅ | None | 64 MB | Direct FS | Very Low |
| **HedgeDoc** | Collaborative Notes | ✅ | PostgreSQL | 1 GB | Markdown/API | Medium |
| **AFFiNE** | All-in-one | ✅ | PostgreSQL + Redis | 2 GB | API + Built-in | Medium |
| **AppFlowy** | Notes/PM | ✅ | PostgreSQL | 1 GB | Ollama + API | Medium |
| **Obsidian** | Notes/KB | N/A (app) | Markdown files | 0 | **Best** (direct FS) | None |
| **Plane** | PM | ✅ | PostgreSQL + Redis | 4 GB | API + Webhooks | Medium-High |
| **Vikunja** | Tasks/PM | ✅ | SQLite/PostgreSQL | 100 MB | API | Low |
| **Focalboard** | Kanban | ✅ | SQLite | 512 MB | API | **Abandoned** |
| **linkding** | Bookmarks | ✅ | SQLite | 100 MB | API | Very Low |
| **Wallabag** | Read-it-Later | ✅ | SQLite/MySQL | 2 GB | API | Low |
| **Nextcloud** | File Suite | ✅ | PostgreSQL | 2-4 GB | WebDAV | High |
| **MinIO** | S3 Storage | ✅ | None (local FS) | 1 GB | S3 API | Low |

---

*Last updated: March 2026. All tool versions and statuses reflect the latest available as of this date. Focalboard is marked abandoned — verify before production use. Check GitHub release activity before committing to any tool.*
