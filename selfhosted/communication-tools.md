# Self-Hosted Communication Tools for Indie Hackers

**Context:** Alizé (AI agency), Kuroba (web agency), ts.news (news site)
**Date:** March 2026
**Goal:** Email, chat, webhook, and notification capabilities with AI agent integration

---

## Table of Contents

1. [Email — Production Servers](#1-email--production-servers)
2. [Email — Dev-Only Catchers](#2-email--dev-only-catchers)
3. [Team Chat](#3-team-chat)
4. [Webhook Tunnels](#4-webhook-tunnels)
5. [Notifications](#5-notifications)
6. [Workflow Automation](#6-workflow-automation)
7. [Recommendations by Stack](#7-recommendations-by-stack)

---

## 1. Email — Production Servers

### docker-mailserver (DMS)

**What it is:** A production-ready, single-container mail server using Postfix + Dovecot + Rspamd + ClamAV. The most popular self-hosted mail solution on GitHub (~12k stars). Designed to be minimal-config and ops-friendly.

**What it does:** SMTP/IMAP, spam filtering (Rspamd), DKIM/SPF/DMARC, TLS, basic sieve filtering, LDAP-optional.

**Docker setup:**
```yaml
services:
  mail:
    image: docker-mailserver/mailserver:latest
    hostname: mail
    domainname: yourdomain.com
    container_name: mail
    ports:
      - "25:587"
      - "465:465"
      - "993:993"
    volumes:
      - ./data/mail:/var/mail
      - ./data/config:/tmp/docker-mailserver
      - ./data/certs:/etc/letsencrypt
    env_file: .env
    restart: unless-stopped
```

**Env vars (`.env`):**
```
HOSTNAME=mail
DOMAINNAME=yourdomain.com
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
ENABLE_FAIL2BAN=1
```

**Resource requirements:** ~1 CPU, 1GB RAM minimum. ClamAV (antivirus) bumps RAM to ~2GB under load. DMS alone without ClamAV is very lightweight (~300-500MB).

**AI agent integration:** No native AI hooks. You'd pipe incoming mail via a custom LDA/sieve script to a webhook → n8n/Activepieces → AI processing. Or use a dedicated inbound relay.

**Pros:** Battle-tested, large community, single container, active development, fail2ban built-in, comprehensive docs.
**Cons:** ClamAV is heavy; can disable it. Full setup requires DNS configuration (DKIM, SPF, reverse DNS). Not a webmail — pair with Roundcube or SOGo separately.

---

### Mailu

**What it is:** A full-featured mail server suite in Docker Compose. Includes Postfix, Dovecot, Rspamd, SOGo (webmail + groupware), Roundcube optional, antivirus.

**What it does:** Everything you'd expect from a hosted email service — IMAP, SMTP, webmail, calendar/contacts (SOGo), admin UI, anti-spam, aliases, fetch-mail.

**Docker setup (docker-compose.yml snippet):**
```yaml
version: '3.8'
services:
  front:
    image: mailu/nginx:1.9
    ports:
      - "25:25"
      - "465:465"
      - "587:587"
      - "993:993"
    volumes:
      - ./data/certs:/certs

  admin:
    image: mailu/admin:1.9
    env_file: .env

  imap:
    image: mailu/dovecot:1.9

  smtp:
    image: mailu/postfix:1.9

  rspamd:
    image: mailu/rspamd:1.9

  sogo:
    image: mailu/sogo:1.9

  webmail:
    image: mailu/webmail:1.9
```

**Resource requirements:** ~2-4 CPU cores, 4GB+ RAM recommended for a full installation with SOGo. Heavier than docker-mailserver.

**AI agent integration:** Rspamd has Lua scripting for custom spam rules — can be extended to route certain emails to AI pipelines. Webhook integration via external MDA (procmail-style sieve → HTTP POST).

**Pros:** All-in-one suite, web UI, groupware features, polished admin.
**Cons:** Heavy resource footprint. SOGO can be complex. Upgrade path between versions can be rocky.

---

### mailcow

**What it is:** Similar to Mailu — a Docker-based mail server with a slick web UI. Uses Postfix, Dovecot, SOGo, Rspamd, ClamAV, and adds a dedicated admin panel + Let's Encrypt automation.

**What it does:** Full email stack with a modern-looking management UI. Includes DKIM, spam filtering, quarantine, quarantine management, mailbox aliases, domain management.

**Docker setup:** Standard docker-compose from mailcow GitHub. Single command setup via `gen_ssl.sh` and `docker-compose.yml`.

```bash
git clone https://github.com/mailcow/mailcow-dockerized
cd mailcow-dockerized
./generate_config.sh   # interactive — sets domain, timezone, MySQL password
docker-compose up -d
```

**Resource requirements:** 2-4 CPU, 4-6GB RAM for a full stack with ClamAV + SOGo.

**AI agent integration:** Same pattern — sieve → external script → webhook → n8n/Activepieces.

**Pros:** Best-in-class UI for mail management, automated SSL, active development.
**Cons:** Very heavy (~4-6GB RAM). ClamAV is optional but default-on. Can be overkill for a small indie team.

---

### Mox

**What it is:** A modern, Go-based mail server by mjl- (the author of mpack and various Go mail tools). Written in Go, single binary, no external dependencies. Modern TLS-only design.

**What it is:** SMTP/IMAP server, supports JMAP (modern email API), automatic TLS, SPF/DKIM/DMARC, spam scoring (via OpenDKIM + built-in heuristics), AccountManagement over JMAP.

**Docker setup:**
```yaml
services:
  mox:
    image: mjl/mox:latest
    container_name: mox
    restart: unless-stopped
    ports:
      - "25:25"
      - "465:465"
      - "587:587"
      - "993:993"
      - "443:443"   # JMAP
    volumes:
      - ./data:/data
    environment:
      - TZ=UTC
```

**Resource requirements:** Extremely lightweight — single Go binary, no heavy dependencies. ~50MB RAM, minimal CPU. This is the most resource-efficient production mail server available.

**AI agent integration:** JMAP API is modern and programmable. You can query emails via JMAP HTTP API and pipe to AI — much cleaner than LDA/procmail. Mox is ideal for AI-forward architectures.

**Pros:** Minimal dependencies, modern (JMAP support), extremely lightweight, Go codebase is auditable.
**Cons:** Newer project (less battle-tested than Postfix-based stacks), smaller community, documentation is sparse for advanced use.

---

### Postfix + Dovecot (Manual / Non-Docker)

The classic combination. Fully customizable but requires more sysadmin knowledge. Not recommended for indie hackers who want a quick setup — use one of the above Docker solutions unless you have specific requirements.

---

**Email Verdict for Indie Hackers:**

| Tool | Weight | Complexity | Features | Best For |
|------|--------|------------|----------|----------|
| docker-mailserver | ⭐⭐⭐ (light) | Medium | High | Most indie teams — best balance |
| Mox | ⭐⭐ (tiny) | Medium | Medium | AI-forward stacks, minimal resources |
| Mailu | ⭐⭐⭐ (heavy) | High | Very High | Teams needing full groupware |
| mailcow | ⭐⭐⭐ (heavy) | Medium | High | Teams prioritizing admin UI |
| Postfix+Dovecot | ⭐⭐ (light) | Very High | High | Only if you know what you're doing |

**Recommendation:** Start with **docker-mailserver** (simple, proven, lightweight). Move to **Mox** if you want something lighter and are comfortable with a newer project. Use **Mailu** or **mailcow** if you need a polished web admin UI and don't mind the resource cost.

---

## 2. Email — Dev-Only Catchers

These do NOT handle real email. They catch outgoing mail from your dev environment and display it in a web UI. Essential for development.

### Mailpit

**What it is:** The modern replacement for MailHog. Go-based, single binary or Docker image, SMTP catcher with a polished web UI and REST API. Actively maintained.

**What it does:** Catches SMTP traffic, displays HTML/text emails in a web UI, search, MIME inspection, delete, download. REST API for automation.

**Docker setup:**
```yaml
services:
  mailpit:
    image: axllent/mailpit:latest
    container_name: mailpit
    restart: unless-stopped
    ports:
      - "1025:1025"   # SMTP
      - "8025:8025"   # Web UI
    environment:
      - TZ=UTC
```

**Resource requirements:** Negligible. ~50MB RAM.

**AI agent integration:** You can poll the REST API (`GET /api/v1/messages`) from an AI agent to inspect emails programmatically:
```bash
curl -s http://localhost:8025/api/v1/messages | jq '.messages[] | {from, to, subject}'
```

**Pros:** Modern, actively maintained, better than MailHog, supports CC/BCC, API, full MIME viewing, graceful shutdown.
**Cons:** Development use only — not a real mail server.

---

### MailHog

**What it is:** The old standard for dev email catching. Go-based, single binary. Catches SMTP, shows in web UI.

**Status:** **Abandoned.** Last meaningful release was ~2019. Has known security issues and doesn't support modern email features (CC handling is buggy). **Do not use for new projects.**

---

**Dev Email Verdict:** Use **Mailpit**. It is the direct replacement for MailHog with active development and a better UI. Docker compose snippet above is all you need.

---

## 3. Team Chat

### Mattermost

**What it is:** A Slack-alternative built by Mattermost Inc. (backed by investors). Focused on developer teams. Offers both cloud and self-hosted versions.

**What it does:** Channels, threads, DMs, file sharing, video/audio calls (via plugins), integrations (Slack-compatible webhooks, GitHub, Jira), LDAP/SSO, compliance exports, mobile apps.

**Docker setup (unofficial community compose):**
```yaml
services:
  mattermost:
    image: mattermost/mattermost-preview:latest
    container_name: mattermost
    restart: unless-stopped
    ports:
      - "8065:8065"
    environment:
      - MM_SQLSETTINGS_DRIVERNAME=postgres
      - MM_SQLSETTINGS_DATA_SOURCE=postgres://user:pass@db:5432/mattermost?sslmode=disable
    depends_on:
      - postgres
    volumes:
      - ./data/mattermost:/mattermost/data

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mattermost
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
```

For production, use the official `mattermost/docker` repo with bundled Traefik/Caddy support.

**Resource requirements:** ~2-4 CPU, 2-4GB RAM for a small team. PostgreSQL + Mattermost. With plugins (Mattermost Boards, Playbooks) it gets heavier.

**AI agent integration:** Mattermost has an outgoing webhook system (Slack-compatible). You can configure webhooks to send messages to any HTTP endpoint. Mattermost also has an experimental AI assistant plugin (Mattermost AI) that integrates with LLM providers. The plugin system is powerful but documentation is scattered.

**Important licensing note:** As of 2024-2025, Mattermost has moved to a "Mattermost Enterprise" model where some features (like advanced permissions, compliance, multi-cloud identity) require a paid license. The free tier still works for self-hosting but some features are gated.

**Pros:** Strong developer focus, excellent UX, good mobile apps, mature product.
**Cons:** Some enterprise features are paywalled. Increasingly "Enterprise-focused" rather than community-focused. The open-source version has limitations compared to the commercial product.

---

### Rocket.Chat

**What it is:** A full-featured team chat platform (live chat, team messaging, video, CMS integrations) with a massive feature set. One of the most feature-rich open-source chat solutions.

**What it does:** Channels, threads, DMs, video/audio (Jitsi集成), file sharing, live chat widgets (for websites), LDAP/SSO, omnichannel (whatsapp, telegram, email integration), REST and Streaming APIs, custom emoji, message reactions, polling.

**Docker setup:**
```yaml
services:
  rocketchat:
    image: registry.rocket.chat/rocket.chat:6.0
    container_name: rocketchat
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - MONGO_URL=mongodb://mongo:27017/rocketchat
      - ROOT_URL=http://localhost:3000
      - PORT=3000
    depends_on:
      - mongo
    volumes:
      - ./uploads:/app/uploads

  mongo:
    image: mongo:6.0
    container_name: mongo
    restart: unless-stopped
    volumes:
      - ./data/db:/data/db
```

**Resource requirements:** ~2-4 CPU, 2-4GB RAM minimum (MongoDB + Node.js app). Can be heavy with many concurrent users.

**AI agent integration:** Excellent. Rocket.Chat has a comprehensive REST API and a WebSocket-based Streaming API. You can:
- Send messages via API: `POST /api/v1/chat.postMessage`
- Receive incoming webhooks
- Use the Bot User accounts with API tokens
- The `rocketchat-open-api` package adds additional webhook endpoints

**Important licensing note:** Rocket.Chat has been moving features to paid tiers. As of 2024-2025, some integrations (WhatsApp, Telegram, email channels, some admin features) are in paid plans. The core chat functionality remains free.

**Pros:** Most feature-rich open-source chat (includes live chat for websites). Strong API. Large deployment base.
**Cons:** Heavy (MongoDB dependency). Feature drift toward paid tiers. MongoDB adds operational complexity.

---

### Zulip

**What it is:** The unique option — topic-based threading instead of channel-based. Messages are organized by **stream + topic**, making conversations discoverable and async-friendly. Fully open-source (MIT license, no "open core" model). Everything is free.

**What it does:** Topic-based threading, streams (like channels), DMs, code blocks with syntax highlighting, inline image previews, drag-and-drop file uploads, LaTeX rendering, gifs, built-in reminder system, video calls (via Jitsi), SSO/LDAP, many integrations.

**What makes it different:** The threading model is genuinely superior for asynchronous, distributed teams. Conversations about the same topic are always grouped together regardless of when someone joins. This is why GitLab, Rust, and many large OSS communities use it.

**Docker setup:**
```yaml
services:
  zulip:
    image: zulip/docker-zulip:11.5
    container_name: zulip
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    environment:
      - ZULIP_ADMIN_USER=admin@example.com
      - ZULIP_ADMIN_PASSWORD=strong_password
    volumes:
      - ./data:/data
```

**Resource requirements:** ~2-4 CPU, 4GB+ RAM (the Docker image is a full Zulip server including PostgreSQL, Redis, Memcached, nginx). Larger deployments need more.

**AI agent integration:** Zulip has a well-documented Bot system and API. You can:
- Create Bot users with API keys
- Use the Zulip API to send/receive messages
- Subscribe bots to streams
- Receive events via the API's `register` endpoint (long-polling) or WebSocket
- This is the cleanest AI integration of the three — topic-based threading means an AI agent can participate in multiple conversations without chaos

**Pros:** MIT license, fully open-source (no open-core trap), genuinely better threading model for async work, well-documented API, strong community.
**Cons:** Steeper learning curve for teams used to Slack/Discord. Docker image is heavy (~4GB). The topic-based model requires team buy-in.

---

**Chat Verdict for Indie Hackers:**

| Tool | Weight | Licensing | Best For |
|------|--------|-----------|----------|
| **Zulip** | ⭐⭐⭐ (heavy) | MIT (fully free) | Teams doing async, distributed work; AI agents; ethical software |
| Mattermost | ⭐⭐ (medium) | Open-core (features gated) | Teams needing Slack-like UX; developer tooling |
| Rocket.Chat | ⭐⭐ (heavy) | Open-core (features gated) | Teams needing live chat widgets + omnichannel |

**Recommendation:** **Zulip** is the most honest choice — truly open-source, MIT license, no vendor lock-in, and the topic-based threading is genuinely superior for an indie hacker running multiple projects (Alizé, Kuroba, ts.news). An AI agent can participate in multiple project streams cleanly. Mattermost is the fallback if you specifically need Slack compatibility.

---

## 4. Webhook Tunnels

These expose local services to the internet for webhooks (Stripe, GitHub, etc.) or remote access.

### Cloudflare Tunnel (formerly Argo Tunnel)

**What it is:** Free tunnel service by Cloudflare. You run a lightweight daemon (`cloudflared`) that creates an outbound connection to Cloudflare's edge, routing traffic to your local service via a `*.trycloudflare.com` URL or your own domain.

**What it does:** HTTPS tunnels, no NAT/firewall config needed, handles TLS termination at Cloudflare edge, supports HTTP/2, websocket, SSH, RDP.

**Docker setup:**
```yaml
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared
    restart: unless-stopped
    command: tunnel --no-autoupdate run --token YOUR_TUNNEL_TOKEN
```

Or bare metal: `cloudflared tunnel create my-tunnel && cloudflared tunnel route dns my-tunnel mysubdomain.domain.com`

**Resource requirements:** Negligible. ~30MB RAM. Single binary.

**AI agent integration:** Great for webhook intake. Configure GitHub/Stripe webhooks → Cloudflare Tunnel → your local n8n/Activepieces webhook endpoint.

**Pros:** Free, extremely lightweight, very stable, handles TLS automatically, Cloudflare CDN benefits, very popular in the self-hosting community.
**Cons:** Traffic goes through Cloudflare (not truly self-hosted tunnel). Requires a Cloudflare account. Single control plane is Cloudflare's infrastructure.

---

### frp (Fast Reverse Proxy)

**What it is:** A Go-based open-source reverse proxy. You run a server (frps) on a VPS with a public IP, and clients (frpc) behind NAT connect to it. The most popular self-hosted tunneling solution.

**What it does:** TCP/UDP/HTTP/HTTPS tunnels, load balancing, subdomain support, basic auth, TLS via-stunnel or Self-contained.

**Docker setup (server — `frps.ini`):**
```ini
[common]
bind_port = 7000
vhost_http_port = 8080
vhost_https_port = 8443
token = your_secure_token
```

**Docker setup (client — `frpc.ini`):**
```ini
[common]
server_addr = your.vps.ip
server_port = 7000
token = your_secure_token

[webhook]
type = http
local_ip = host.docker.internal
local_port = 5678
custom_domains = webhook.yourdomain.com
```

```bash
# Server
docker run --network host -v ./frps.ini:/etc/frp/frps.ini --name frps -d snowdreamtech/frps

# Client
docker run -v ./frpc.ini:/etc/frp/frpc.ini --name frpc -d snowdreamtech/frpc
```

**Resource requirements:** Server: ~50MB RAM, minimal CPU. Client: negligible.

**AI agent integration:** Ideal for webhook relay — run n8n locally, expose via frp client to your VPS public URL. You control the infrastructure completely.

**Pros:** Full self-hosted control, no third-party relay, very flexible, well-documented, active development.
**Cons:** Requires a VPS with a public IP for the server component. Additional cost/management of that VPS.

---

### localtunnel (lt)

**What it is:** The simplest possible option. Single command, no account needed, gives you a `*.loca.lt` URL. The server is open-source and you can self-host it.

**What it does:** HTTP/HTTPS tunnels, simple, no auth by default (can add basic auth).

**Bare metal setup (server — open-source):**
```bash
npm install -g localtunnel
lt --port 3000 --subdomain my-app
```

Or self-host the server: `ltl server` (Node.js)

**Resource requirements:** Negligible.

**Pros:** Dead simple. No config.
**Cons:** No authentication by default (anyone who knows the URL can access). Not ideal for production webhooks. The public instance is rate-limited and unreliable. No TCP support.

---

### bore / rport

**What it is:** Two similar lightweight options. `bore` is a minimal Rust-based TCP tunnel. `rport` is more feature-rich with a web UI and remote management.

**bore setup:**
```bash
cargo install bore-cli
bore local 3000 --to bore.pub
```

**rport setup:** More infrastructure — requires server + client components. Has a web UI for managing connections. Useful if you need remote desktop access too.

---

### ngrok

**What it is:** The commercial gold standard. Extremely polished, very reliable, excellent developer experience.

**What it does:** HTTP/HTTPS/TCP tunnels, reserved domains, custom subdomains, TLS termination, inspection UI (view/replay requests), replay webhooks.

**Docker setup:**
```bash
docker run -d --name ngrok \
  -e NGROK_AUTHTOKEN=your_token \
  ngrok/ngrok:latest http 5678
```

**Pros:** Best UX, most reliable free tier (1 process, 3 tunnels, 40 connections/min), webhook inspection UI is excellent.
**Cons:** Free tier is very limited (random URLs, 1 process). Paid plans start at ~$10+/month. Not self-hosted. For indie hackers running multiple projects, cost adds up.

---

**Webhook Tunnel Verdict:**

| Tool | Self-Hosted | Free | Reliability | Best For |
|------|------------|------|-------------|----------|
| **Cloudflare Tunnel** | Partial (client) | ✅ | Excellent | Most indie hackers — free + minimal |
| **frp** | ✅ Full | ✅ | Good | Complete self-hosted control |
| localtunnel | Partial | ✅ | Unreliable | Quick one-off tests |
| bore | ✅ Full | ✅ | Basic | TCP tunnels, minimal setup |
| ngrok | ❌ | Limited | Excellent | When you need inspection UI + reliability |

**Recommendation:** Start with **Cloudflare Tunnel** (free, zero ops). Graduate to **frp** if you want full control over your tunnel infrastructure (run frps on a cheap VPS you already have).

---

## 5. Notifications

### ntfy

**What it is:** A self-hosted "push notifications to phone/desktop" tool. You publish to a topic via HTTP POST, subscribers receive push notifications via Android app (F-Droid or Play Store) or web. Very lightweight, Go binary.

**What it does:** Topic-based pub/sub, HTTP API, WebSocket, email bridge (incoming + outgoing), mobile apps (Android/iOS), tiered delivery (background push via Firebase-free options).

**Docker setup:**
```yaml
services:
  ntfy:
    image: binweder/ntfy:latest
    container_name: ntfy
    restart: unless-stopped
    ports:
      - "80:80"
    environment:
      - TZ=UTC
    volumes:
      - ./data:/data
    command: serve
```

Or with limit (no Firebase dependency via unifiedpush):
```yaml
environment:
  - NTFY_UNIFIEDPUSH_ENABLE=1
  - NTFY_WEB_PUSH_ENABLE=1
  - NTFY_WEB_PUSH_VAPID_FILE=/data/vapid.json
```

**Sending a notification:**
```bash
# Via curl
curl -d "Deployment successful!" ntfy.sh/mytopic

# From n8n/Activepieces HTTP Request node
POST https://ntfy.sh/mytopic
Body: "Build failed for ts.news"
```

**Resource requirements:** ~50-100MB RAM. Very lightweight Go binary. One of the most efficient self-hosted notification tools.

**AI agent integration:** Extremely easy. AI agents can call `curl -d "message" ntfy.sh/topic` with no authentication for open topics. For protected topics, use Bearer token auth. Works perfectly as a notification backend for AI workflows.

**Pros:** Dead simple to use, lightweight, works without Firebase/Google services (via unifiedpush), excellent mobile apps, WebSocket API, can be self-hosted with zero config.
**Cons:** No native email-out (you need SMTP separately). No native SMS. No built-in escalation. Simple pub/sub only.

---

### Gotify

**What it is:** A lightweight server for sending and receiving real-time push notifications. Extensible via plugins. Go-based.

**What it is:** HTTP API for sending messages, WebSocket for real-time delivery, Android app.

**Docker setup:**
```yaml
services:
  gotify:
    image: gotify/server:latest
    container_name: gotify
    restart: unless-stopped
    ports:
      - "80:80"
    environment:
      - GOTIFY_DEFAULTUSER_PASS=password
    volumes:
      - ./data:/app/data
```

**Sending a notification:**
```bash
curl -X POST "http://localhost:80/message?token=YourToken" \
  -F "title=Alert" \
  -F "message=ts.news is down" \
  -F "priority=5"
```

**Resource requirements:** ~50MB RAM. Lightweight.

**AI agent integration:** Simple HTTP API works from any tool. Has official client libraries for Go, Python, JavaScript.

**Pros:** Simple, lightweight, works well.
**Cons:** Less actively developed than ntfy (last major release ~2022-2023). Android app is less polished than ntfy's. ntfy has largely surpassed Gotify in features and active development.

---

### Apprise

**What it is:** Not a server — a notification library (Python) that can send to 70+ services via a single API. Can run as a Docker container acting as a webhook → notification relay.

**What it does:** Bridges a single HTTP endpoint to: Discord, Telegram, Slack, Email (SMTP), Gotify, ntfy, Pushbullet, Windows, macOS, and 60+ more.

**Docker setup:**
```yaml
services:
  apprise:
    image: caronc/apprise:latest
    container_name: apprise
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      - TZ=UTC
    volumes:
      - ./config:/config
      - ./data:/data
```

**Config (`config.yml`):**
```yaml
urls:
  - discord://webhook_id/webhook_token
  - twilio://AccountSid:AuthToken/FromNo/ToNo
  - mailto://user:pass@smtp.example.com:587/?from=from@example.com&to=to@example.com
```

**Usage:**
```bash
curl -X POST http://localhost:8000 \
  -H "Content-Type: application/json" \
  -d '{"message": "Build complete", "title": "ts.news"}'
```

**Resource requirements:** Minimal Python app, ~100MB RAM.

**AI agent integration:** Excellent — single webhook endpoint, routes to any notification channel. Perfect for n8n/Activepieces → Apprise → your preferred notification channel.

**Pros:** 70+ notification service support. Very flexible.
**Cons:** It's a notification bridge, not a full notification server. You still need the underlying services (Discord webhook, SMTP, etc.).

---

### Alertmanager (Prometheus ecosystem)

**What it is:** Part of the Prometheus monitoring stack. Handles alerting, deduplication, grouping, routing, and delivery to: email, PagerDuty, Slack, OpsGenie, WeChat, and custom webhooks.

**What it does:** Complex alerting with routing trees, deduplication, silencing, inhibition, acknowledgment flows.

**Docker setup:** Typically runs alongside Prometheus. Simple:
```yaml
services:
  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    restart: unless-stopped
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - ./data:/alertmanager
```

**Pros:** Industrial-strength alerting. Excellent for monitoring infrastructure (Prometheus metrics, Uptime Kuma).
**Cons:** Overkill for simple "notify me when X happens." No mobile push. Part of a larger stack.

---

**Notification Verdict:**

| Tool | Self-Hosted | Weight | Best For |
|------|------------|--------|----------|
| **ntfy** | ✅ | ⭐ (tiny) | Primary notification tool for indie teams |
| Apprise | ✅ | ⭐ (tiny) | When you need 70+ notification channels |
| Gotify | ✅ | ⭐ (tiny) | Legacy deployments (prefer ntfy) |
| Alertmanager | ✅ | ⭐⭐ (medium) | Infrastructure monitoring with Prometheus |

**Recommendation:** **ntfy** as your primary notification tool. **Apprise** as a webhook bridge for services that require Discord/Slack/Telegram specifically.

---

## 6. Workflow Automation (n8n vs Alternatives)

### n8n

**What it is:** The most popular self-hosted workflow automation tool. "Code as much as you want, no-code as much as you need." 400+ integrations. Fair-code license (source available, some features cloud-only).

**What it does:** Visual workflow editor, code nodes (JavaScript/Python), AI nodes (LLM chain, prompt, embeddings), webhook triggers, schedule triggers, 400+ app integrations, error workflows, version control (paid), sub-nodes, external storage for binary data.

**Docker setup:**
```yaml
services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=strong_password
      - N8N_HOST=n8n.yourdomain.com
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://n8n.yourdomain.com/
      - EXECUTIONS_DATA_SAVE_ON_ERROR=all
      - EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
      - EXECUTIONS_DATA_SAVE_ON_PROGRESS=true
      - GENERIC_TIMEZONE=UTC
    volumes:
      - ./data:/home/node/.n8n
```

Or with PostgreSQL for scaling:
```yaml
services:
  n8n:
    image: n8nio/n8n:latest
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=n8n_password
```

**Resource requirements:** ~1-2 CPU, 1-2GB RAM for moderate use. Scales with workflow complexity and execution volume. The main bottleneck is often DB (use PostgreSQL for production).

**AI agent integration:** **Best-in-class for AI agent integration.** Native nodes for:
- AI Agent (supports OpenAI, Anthropic, Ollama, HuggingFace)
- LLM Chain (RAG pipelines)
- Text nodes (OpenAI, Anthropic, Google AI)
- Vector store nodes (Pinecone, Qdrant, Weaviate, Redis)
- Code node supports JavaScript/Python with npm/pip packages
- Can expose webhooks for external AI to trigger workflows
- n8n itself can act as an AI agent via the "AI Agent" node

**Pros:** Most integrations, best AI nodes, huge community, excellent documentation, very active development.
**Cons:** The free tier of the cloud version is limited. Self-hosted has no execution caps. Some nodes are "cloud-only" (you must check). Recent versions have moved some enterprise features to paid tiers.

---

### ActivePieces

**What it is:** An open-source (MIT) automation tool positioned as an "open-source Zapier alternative." Built with Vue.js + NestJS. Focused on ease of use and a polished UI.

**What it does:** Visual flow builder, 100+ integrations, code pieces (TypeScript), schedule + webhook triggers, AI integrations (OpenAI, Anthropic via custom HTTP), beta AI features, multi-tenant (for agencies).

**Docker setup:**
```yaml
services:
  activepieces:
    image: activepieces/activepieces:latest
    container_name: activepieces
    restart: unless-stopped
    ports:
      - "80:80"
    environment:
      - AP_JWT_SECRET=your_secret
      - AP_POSTGRES_DATABASE_PATH=./data
      - AP_POSTGRES_PORT=5432
    volumes:
      - ./data:/data
```

Or with Docker Compose including Postgres:
```yaml
services:
  activepieces:
    image: activepieces/activepieces:latest
    environment:
      - AP_JWT_SECRET=your_secret
      - AP_DB=postgres
      - AP_POSTGRES_HOST=postgres
      - AP_POSTGRES_PORT=5432
      - AP_POSTGRES_DB=activepieces
      - AP_POSTGRES_USER=ap
      - AP_POSTGRES_PASSWORD=ap_password
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: activepieces
      POSTGRES_USER: ap
      POSTGRES_PASSWORD: ap_password
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
```

**Resource requirements:** ~1-2 CPU, 1-2GB RAM. Very similar to n8n in resource footprint.

**AI agent integration:** AI features are less mature than n8n. Has OpenAI integration (beta). No native Anthropic node (use HTTP request). No vector store nodes. Code pieces can call any AI API directly. Activepieces is catching up but n8n is ahead here.

**Pros:** Truly open-source (MIT — all features free), easier UI than n8n for non-technical users (G2 ease-of-use score 9.1 vs n8n's 7.7), multi-tenancy for agencies is a big plus.
**Cons:** Fewer integrations (~100 vs n8n's 400+), less mature AI integration, smaller community.

---

### Windmill

**What it is:** An open-source (AGPL) platform for building business workflows and internal tools. Not just automation — includes an app builder, scripts (Python/JS/Go), and a unified backend.

**What it does:** Workflow automation + scripts + internal apps. Focuses on developer experience. Can run as a single binary or Docker compose.

**What makes it unique:** Every workflow is also an API endpoint. You can write scripts in Python/JS/Go directly. Strong on enterprise features (user management, workspaces, audit logs). Windmill is closer to "internal tools platform" than pure automation.

**Docker setup (simplest — all-in-one):**
```bash
# Download the single binary
curl -fsSL https://raw.githubusercontent.com/windmill-labs/windmill/main/docker-compose.yml -o docker-compose.yml
docker-compose up -d
# Open http://localhost
```

Or with Docker Compose explicit:
```yaml
services:
  windmill:
    image: ghcr.io/windmill-labs/windmill:latest
    container_name: windmill
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://postgres:postgres@postgres:5432/windmill?sslmode=disable
      - RUST_LOG=info
      - METRICS_ENABLED=true
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: windmill
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
```

**Resource requirements:** ~2-4 CPU, 2-4GB RAM. Heavier than n8n/Activepieces because it's a full application platform.

**AI agent integration:** Excellent for developer-centric AI workflows. You write Python/JS/Go scripts that can call any AI API. The platform handles scheduling, authentication, and error handling. No visual AI nodes like n8n — it's code-first.

**Pros:** Every workflow is an API, code-first, AGPL (fully open), excellent for developer teams, internal tools + automation in one platform.
**Cons:** Code-first (no visual nodes) — less approachable for non-developers. AGPL license means if you modify Windmill itself you must open-source your modifications. Heavier than n8n/Activepieces.

---

### Automatisch

**What it is:** A self-hosted automation tool inspired by Zapier. Built with Node.js. Positioned as a simple, opinionated alternative.

**What it does:** ~70 app integrations, visual workflow builder, code execution, error handling, webhook triggers.

**Docker setup:**
```yaml
services:
  automatisch:
    image: automatisch/server:latest
    container_name: automatisch
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://user:pass@postgres:5432/automatisch
      - SECRET_KEY_BASE=your_secret
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: automatisch
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
```

**AI agent integration:** No native AI nodes. Custom HTTP requests can call AI APIs. Limited compared to n8n.

**Pros:** Simple UI, self-contained, MIT license.
**Cons:** Smaller community, fewer integrations, less mature than n8n. Not actively developed as much (last major release ~2023-2024).

---

**Automation Verdict:**

| Tool | License | AI Nodes | Integrations | Weight | Best For |
|------|---------|----------|-------------|--------|----------|
| **n8n** | Fair-code | ⭐⭐⭐ Best | 400+ | ⭐⭐ (medium) | AI-forward teams, complex workflows |
| **ActivePieces** | MIT | ⭐⭐ (beta) | ~100 | ⭐⭐ (medium) | Agencies needing multi-tenancy, open-source purity |
| Windmill | AGPL | ⭐⭐ (code-only) | ~50 | ⭐⭐⭐ (heavy) | Developer teams building internal tools |
| Automatisch | MIT | ⭐ (HTTP only) | ~70 | ⭐⭐ (medium) | Simple Zapier replacement |

**Recommendation:**
- **AI agency (Alizé):** n8n is the clear winner — best AI node ecosystem
- **Agency with non-technical users:** ActivePieces (easier UI, MIT license, multi-tenant)
- **Developer-heavy teams:** Windmill (code-first, every workflow is an API endpoint)

---

## 7. Recommendations by Stack

### Recommended Minimal Stack (Indie Hacker, Low Budget)

| Category | Choice | Why |
|----------|--------|-----|
| Production email | docker-mailserver | Lightweight, proven, easy |
| Dev email catcher | Mailpit | Modern MailHog replacement |
| Team chat | Zulip | MIT license, topic threading, best for AI |
| Webhook tunnel | Cloudflare Tunnel | Free, zero config, reliable |
| Notifications | ntfy | Tiny, universal push |
| Automation | n8n | Best AI integrations, huge community |

**Monthly cost:** ~$0-10 (just your VPS/server costs)

### Recommended for AI Agency (Alizé)

| Category | Choice | Why |
|----------|--------|-----|
| Production email | docker-mailserver | Standard choice |
| Dev email catcher | Mailpit | Required for dev |
| Team chat | Zulip | Topic threading + AI bot-friendly API |
| Webhook tunnel | Cloudflare Tunnel | Reliable free tier |
| Notifications | ntfy | Works perfectly for AI workflow alerts |
| Automation | **n8n** | Best AI nodes (LLM, embeddings, vector stores) |

**Key n8n AI nodes for Alizé:**
- `AI Agent` (supports Anthropic Claude via tool calling)
- `Llm Chain` (RAG pipelines)
- `OpenAI` / `Anthropic` text nodes
- Vector store nodes (connect to Qdrant/Pinecone for Alizé's knowledge base)
- `Code` node (Python/JS) for custom AI logic

### Recommended for Web Agency (Kuroba)

| Category | Choice | Why |
|----------|--------|-----|
| Production email | docker-mailserver or Mox | Lightweight, low maintenance |
| Dev email catcher | Mailpit | Required for dev |
| Team chat | **Mattermost** | Slack-compatible, developer UX |
| Webhook tunnel | Cloudflare Tunnel | Quick setup |
| Notifications | ntfy + Apprise | ntfy for direct push, Apprise for Slack/Discord client alerts |
| Automation | **ActivePieces** | Easier for non-technical team members, multi-tenancy for agency |

### Recommended for News Site (ts.news)

| Category | Choice | Why |
|----------|--------|-----|
| Production email | Mox | Lightest, modern, JMAP API for programmatic email processing |
| Dev email catcher | Mailpit | Dev workflow |
| Team chat | Zulip | Distributed team, async-first |
| Webhook tunnel | Cloudflare Tunnel | For CMS webhooks (Ghost, WordPress, etc.) |
| Notifications | ntfy | Simple push for site alerts |
| Automation | **n8n** | Hook into Stripe, Ghost, analytics, social media |

---

## Quick Reference: Docker Compose Stacks

### Minimal Full Stack (email + chat + automation + notifications)

```yaml
version: '3.8'
services:
  # Email (production)
  mail:
    image: docker-mailserver/mailserver:latest
    container_name: mail
    hostname: mail
    domainname: yourdomain.com
    ports:
      - "25:25"
      - "465:465"
      - "587:587"
      - "993:993"
    volumes:
      - ./data/mail:/var/mail
      - ./data/config:/tmp/docker-mailserver
      - ./data/certs:/etc/letsencrypt
    env_file: .env
    restart: unless-stopped

  # Dev email catcher
  mailpit:
    image: axllent/mailpit:latest
    container_name: mailpit
    restart: unless-stopped
    ports:
      - "1025:1025"   # SMTP (dev only)
      - "8025:8025"   # Web UI
    environment:
      - TZ=UTC

  # Team chat (Zulip)
  zulip:
    image: zulip/docker-zulip:11.5
    container_name: zulip
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    environment:
      - ZULIP_ADMIN_USER=admin@yourdomain.com
      - ZULIP_ADMIN_PASSWORD=strong_password
    volumes:
      - ./data/zulip:/data

  # Notifications (ntfy)
  ntfy:
    image: binweder/ntfy:latest
    container_name: ntfy
    restart: unless-stopped
    ports:
      - "80:80"
    environment:
      - TZ=UTC
    volumes:
      - ./data/ntfy:/data
    command: serve

  # Workflow automation (n8n)
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=strong_password
      - N8N_HOST=n8n.yourdomain.com
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://n8n.yourdomain.com/
    volumes:
      - ./data/n8n:/home/node/.n8n
```

---

## Honest Caveats

1. **Email deliverability is hard.** Self-hosted email is technically simple but deliverability is complex. Without proper SPF/DKIM/DMARC/reverse DNS, your emails go to spam. Consider using a transactional email service (Resend, Postmark, SendGrid) for transactional email and self-hosted for internal email.

2. **Licensing realities.** Several tools here are "open core" (free core, paid features): Mattermost, Rocket.Chat, n8n. Read the license before deploying to production. ActivePieces (MIT) and Zulip (MIT) are the most genuinely free.

3. **Maintenance burden.** Every self-hosted tool is a tool you maintain. For Alizé/Kuroba/ts.news, consider which tools you actually need vs. which services you can outsource (e.g., Resend for transactional email, Linear for project management, Discord for community).

4. **The AI agent angle.** If your AI agents need to send/receive email, read email, post to chat, and trigger workflows — n8n + Zulip API is the strongest combination. The Zulip API is clean enough that an AI agent can participate in topic-based streams without noise.

5. **Coolify compatibility.** All Docker-based tools here work with Coolify (your current VPS management layer). The docker-mailserver, Mailpit, n8n, ntfy, and Zulip images all work out of the box.

---

*Research compiled March 2026. Tools evolve rapidly — verify versions and licenses before deployment.*
