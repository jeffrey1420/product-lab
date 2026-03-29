# Self-Hosted DevOps Tools for Indie Hackers & Developers

A practical guide to building a complete DevOps stack with self-hosted tools — focused on what actually works for small teams and solo developers in 2026.

---

## Overview

You're already running **Coolify** for deployments (Alizé, ts.news, Kuroba). This guide covers the complementary tools that make a production indie-hacker setup complete:

| Category | Tools Covered |
|----------|---------------|
| CI/CD | Woodpecker CI, Drone CI, Renovate |
| Monitoring | Grafana, Prometheus, Uptime Kuma |
| Logging | Loki + Promtail |
| Alerting | AlertManager, ntfy, Gotify |
| Container Mgmt | Portainer (if not using Coolify) |
| Backups | Restic, Borg, Duplicati |

---

## CI/CD Tools

### Woodpecker CI ⭐ Recommended

**What it is:** A lightweight, container-native CI/CD engine forked from Drone 0.8. Fully open source, community-driven, and designed for simplicity.

**Why it's worth deploying:**
- Lightest footprint of any serious CI/CD tool (~50MB RAM for server)
- YAML pipeline config lives in-repo alongside code
- Native OAuth integration with GitHub, GitLab, Gitea, Forgejo
- SQLite backend (no database to babysit)
- Actively maintained in 2026 with regular releases

**Docker Setup:**

```yaml
# docker-compose.yml
version: '3'
services:
  woodpecker-server:
    image: woodpeckerci/woodpecker-server:latest
    ports:
      - "8000:8000"
    volumes:
      - woodpecker-data:/var/lib/woodpecker
    environment:
      - WOODPECKER_OPEN=true
      - WOODPECKER_HOST=https://ci.yourdomain.com
      - WOODPECKER_GITHUR=https://github.com
      - WOODPECKER_GITHUB_CLIENT=your_client_id
      - WOODPECKER_GITHUB_SECRET=your_client_secret
      - WOODPECKER_SECRET=your_shared_secret
    restart: unless-stopped

  woodpecker-agent:
    image: woodpeckerci/woodpecker-agent:latest
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WOODPECKER_SERVER=woodpecker-server:9000
      - WOODPECKER_SECRET=your_shared_secret
    restart: unless-stopped

volumes:
  woodpecker-data:
```

**Resource Requirements:**
- **Server:** 1 CPU, 512MB RAM minimum
- **Agent:** 1 CPU per parallel job, 256MB RAM per agent
- Scales horizontally by adding more agents

**Example Pipeline (`.woodpecker.yml`):**

```yaml
pipeline:
  build:
    image: node:20-alpine
    commands:
      - npm ci
      - npm run build

  test:
    image: node:20-alpine
    commands:
      - npm test

  deploy:
    image: alpine:latest
    commands:
      - wget -O deploy.sh https://your-deploy-script
      - chmod +x deploy.sh && ./deploy.sh
    secrets:
      - deploy_key
    when:
      - event: push
        branch: main
```

**Honest Assessment:** Best choice for indie hackers. It handles 90% of CI/CD needs without the complexity of Jenkins or the resource hunger of GitLab. If Drone is the "Docker-first CI" predecessor, Woodpecker is its cleaner open-source successor.

---

### Drone CI

**What it is:** One of the first container-native CI platforms. Mature, stable, but partially closed-source after version 1.0.

**Why consider it:**
- Excellent Docker/Kubernetes integration
- Huge library of plugins (community-maintained)
- Very mature codebase (years of production use)

**Docker Setup:**

```yaml
version: '3'
services:
  drone-server:
    image: drone/drone:latest
    ports:
      - 80:80
      - 443:443
    volumes:
      - drone-data:/data
    environment:
      - DRONE_GITHUB_SERVER=https://github.com
      - DRONE_GITHUB_CLIENT_ID=your_client_id
      - DRONE_GITHUB_CLIENT_SECRET=your_client_secret
      - DRONE_RPC_SECRET=your_rpc_secret
      - DRONE_SERVER_HOST=ci.yourdomain.com
      - DRONE_SERVER_PROTO=https
      - DRONE_USER_CREATE=username:your_github_username,admin:true
    restart: unless-stopped

  drone-runner:
    image: drone/drone-runner-docker:latest
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - DRONE_RPC_PROTO=http
      - DRONE_RPC_HOST=drone-server
      - DRONE_RPC_SECRET=your_rpc_secret
      - DRONE_RUNNER_CAPACITY=2
      - DRONE_RUNNER_NAME=runner-1
    restart: unless-stopped

volumes:
  drone-data:
```

**Resource Requirements:**
- **Server:** 2 CPUs, 1GB RAM minimum
- **Runner:** 1 CPU + 512MB RAM per runner

**Honest Assessment:** Drone works well but Woodpecker is the better choice for new setups since it's fully open source. If you're already running Drone and it's working, stick with it. The proprietary parts (some enterprise features) rarely matter for indie projects.

---

### Renovate ⭐ Highly Recommended

**What it is:** Automated dependency update bot. Keeps your `package.json`, `Gemfile`, `Dockerfile`, and 20+ other file types up-to-date automatically via PRs.

**Why it's essential for indie hackers:**
- One-time setup, then it just works
- Reduces security vulnerabilities from outdated deps
- Saves hours of manual update work
- Supports monorepos, lock file maintenance, custom regex rules

**Docker Setup (self-hosted):**

```yaml
# docker-compose.yml
version: '3'
services:
  renovate:
    image: renovate/renovate:latest
    ports:
      - "8080:8080"
    volumes:
      - ./config.json:/usr/src/app/config.json
      - renovate-cache:/tmp/renovate
    environment:
      - RENOVATE_CONFIG_FILE=/usr/src/app/config.json
    restart: unless-stopped

volumes:
  renovate-cache:
```

**Minimal `config.json`:**

```json
{
  "platform": "github",
  "repositories": ["yourusername/yourrepo"],
  "token": "your_github_token",
  "autodiscover": false,
  "prHourlyLimit": 5,
  "prConcurrentLimit": 10,
  "rebaseWhen": "behind-base-branch"
}
```

**Resource Requirements:**
- **~200MB RAM**, 1 CPU
- Runs on schedule or via webhook
- Can be triggered manually or on a cron

**Honest Assessment:** Renovate is the highest ROI DevOps tool for indie hackers. One afternoon of setup = never manually updating dependencies again. The hosted version has limits; self-hosting gives you unlimited repos.

**Pro tip:** Start with dry-run mode (`"dryRun": true`) to see what it would do before letting it create actual PRs.

---

## Monitoring Stack

### Grafana + Prometheus + Node Exporter ⭐ Core Stack

**What it is:** The industry-standard observability stack. Prometheus scrapes metrics, Grafana visualizes them.

**Why deploy together:**
- Prometheus is lightweight and pulls metrics (not push) — low overhead
- Grafana has 100+ dashboards, alerts, and annotation support
- Node Exporter gives you CPU, RAM, disk, network for any server
- Container metrics available via cAdvisor

**Docker Setup (Prometheus + Grafana):**

```yaml
version: '3'
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.enable-lifecycle'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    volumes:
      - grafana-data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=your_strong_password
      - GF_USERS_ALLOW_SIGN_UP=false
    restart: unless-stopped

  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    restart: unless-stopped

volumes:
  prometheus-data:
  grafana-data:
```

**`prometheus.yml`:**

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'coolify'
    static_configs:
      - targets: ['coolify:8000']  # Adjust to your Coolify instance
```

**Add cAdvisor for container metrics:**

```yaml
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    restart: unless-stopped
```

**Resource Requirements:**
- **Prometheus:** 1 CPU, 1GB RAM for <50 targets
- **Grafana:** 512MB RAM, 1 CPU
- **Node Exporter:** ~50MB RAM, negligible CPU
- **cAdvisor:** ~100MB RAM, varies with container count

**Honest Assessment:** This is the monitoring foundation. Grafana dashboards look impressive and actually help you spot issues before they become outages. Start with Node Exporter + cAdvisor + Grafana Dashboard ID 1860 (Node Exporter Full) — you'll have meaningful observability in under an hour.

---

### Uptime Kuma ⭐ Excellent Choice

**What it is:** Self-hosted uptime monitoring with a beautiful web UI, status pages, and notifications.

**Why it's different from Prometheus:**
- Actively monitors HTTP/TCP/ping/DNS/game servers
- Push-based (you can have lightweight "pushers" on servers)
- Beautiful status page you can share publicly
- One of the easiest DevOps tools to set up

**Docker Setup:**

```yaml
version: '3'
services:
  uptime-kuma:
    image: louislam/uptime-kuma:latest
    ports:
      - "3001:3001"
    volumes:
      - uptime-kuma-data:/app/data
    restart: unless-stopped

volumes:
  uptime-kuma-data:
```

**Resource Requirements:**
- **~256MB RAM**, 1 CPU
- SQLite database included

**What you can monitor:**
- HTTP(s) endpoints with certificate expiration
- TCP ports
- Ping latency
- DNS resolution
- Game servers (Minecraft, etc.)
- Docker container status
- Generic push monitors (tiny script on any server)

**Status Page Example:** `https://status.yourdomain.com`

**Honest Assessment:** Uptime Kuma fills the gap Prometheus doesn't — it's not about metrics, it's about availability. For indie hackers, the public status page is a nice touch for users. Alert latency is seconds, not minutes.

---

### Loki + Promtail ⭐ For Log Aggregation

**What it is:** Horizontally-scalable log aggregation system from Grafana Labs. Unlike ELK stack, Loki is designed to be cheap and cloud-native.

**Why over ELK (Elasticsearch):**
- 10x cheaper storage (indexes by labels, not full text)
- Integrates natively with Grafana (same UI)
- Promtail is a simple agent (not heavyweight like Filebeat)

**Docker Setup:**

```yaml
version: '3'
services:
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - ./loki-config.yml:/etc/loki/local-config.yaml
      - loki-data:/loki
    command: -config.file=/etc/loki/local-config.yaml
    restart: unless-stopped

  promtail:
    image: grafana/promtail:latest
    volumes:
      - ./promtail-config.yml:/etc/promtail/config.yml
      - /var/log:/var/log:ro
    command: -config.file=/etc/promtail/config.yml
    restart: unless-stopped

volumes:
  loki-data:
```

**`loki-config.yml`:**

```yaml
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    address: 127.0.0.1
  chunk_idle_period: 15m
  max_transfer_retries: 0

schema_config:
  configs:
    - from: 2024-01-01
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 168h

storage_config:
  boltdb_shipper:
    active_index_directory: /loki/index
    cache_location: /loki/index_cache
  filesystem:
    directory: /loki/chunks

limits_config:
  reject_old_samples: true
  reject_old_samples_max_age: 168h
```

**`promtail-config.yml`:**

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: system
    static_configs:
      - targets:
          - localhost
        labels:
          job: systemlogs
          host: myserver
          __path__: /var/log/**/*.log
```

**Connect Grafana to Loki:**
1. Add data source: `http://loki:3100`
2. Use LogQL for queries: `{job="systemlogs"} |= "error"`

**Resource Requirements:**
- **Loki:** 1 CPU, 1GB RAM (scales with log volume)
- **Promtail:** ~50MB RAM per node

**Honest Assessment:** If you're already running Grafana, adding Loki is a no-brainer for log aggregation. The storage savings over Elasticsearch are massive. For indie setups, Loki + Grafana replaces the need for a separate log viewer entirely.

---

## Alerting

### AlertManager (for Prometheus) ⭐ If Using Prometheus

**What it is:** Handles deduplication, grouping, and routing of Prometheus alerts.

**When to use:** You're already running Prometheus and want proper multi-channel alerting (email + Slack + PagerDuty + webhooks).

**Setup adds to `prometheus.yml`:**

```yaml
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093
```

**`alertmanager.yml`:**

```yaml
global:
  smtp_smarthost: 'smtp.yourprovider.com:587'
  smtp_from: 'alertmanager@yourdomain.com'

route:
  group_by: ['alertname', 'cluster']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'email-slack'
  routes:
    - match:
        severity: critical
      receiver: 'critical-alerts'
      continue: true
    - match:
        severity: warning
      receiver: 'email-slack'

receivers:
  - name: 'email-slack'
    email_configs:
      - to: 'you@yourdomain.com'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK'
        channel: '#alerts'

  - name: 'critical-alerts'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK'
        channel: '#critical'
    pushover_configs:
      - user: 'your_user_key'
        token: 'your_app_token'
```

**Resource Requirements:** ~100MB RAM, 1 CPU

---

### ntfy ⭐ Lightweight Notifications

**What it is:** Send push notifications to your phone via simple HTTP requests. Self-hostable.

**Why it's great for indie hackers:**
- `curl -H "Title: Alert" -H "Priority: urgent" -d "Server down!" https://ntfy.sh/yoursharedtopic`
- Free iOS/Android app, no account needed
- Supports webhooks from Uptime Kuma, Grafana, etc.
- Can self-host for full control (or use the free tier)

**Docker Setup (self-hosted):**

```yaml
version: '3'
services:
  ntfy:
    image: binwiederhier/ntfy:latest
    ports:
      - "80:80"
    volumes:
      - ntfy-cache:/var/cache/ntfy
      - ntfy-data:/var/lib/ntfy
    environment:
      - NTFY_DYNAMIC_CONFIG=true
      - NTFY_AUTH_BILLED=false
    command:
      - serve
    restart: unless-stopped

volumes:
  ntfy-cache:
  ntfy-data:
```

**Use with Uptime Kuma:** Webhook URL: `https://your-ntfy-domain/yoursharedtopic`

---

### Gotify ⭐ Simpler Alternative

**What it is:** Self-hosted notification service with a clean REST API.

**When to prefer over ntfy:** You want a slightly more structured app ecosystem.

```yaml
version: '3'
services:
  gotify:
    image: gotify/server:latest
    ports:
      - "8080:80"
    volumes:
      - gotify-data:/app/data
    environment:
      - GOTIFY_DEFAULTUSER_PASS=yourpassword
    restart: unless-stopped

volumes:
  gotify-data:
```

**Honest Assessment on Alerting:** For most indie setups, Uptime Kuma's built-in notification webhooks + ntfy covers 90% of alerting needs. Only add AlertManager if you're already running Prometheus and want centralized, deduplicated alerts across multiple services.

---

## Container Management

### Portainer ⭐ If You Need GUI

**What it is:** Web-based Docker container management. Useful for quick visual inspection.

**Docker Setup:**

```yaml
version: '3'
services:
  portainer:
    image: portainer/portainer-ce:latest
    ports:
      - "9000:9000"
      - "9443:9443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer-data:/data
    restart: unless-stopped

volumes:
  portainer-data:
```

**Resource Requirements:** ~512MB RAM, 1 CPU

**Honest Assessment:** Portainer is nice but not essential if you're comfortable with `docker compose` CLI. Since you're already using Coolify for deployments, you may not need it. Portainer shines when you want non-technical team members to see container status.

---

## Backup Tools

### Restic ⭐ Recommended

**What it is:** Fast, secure, deduplicating backup program. Supports local, SFTP, S3, B2, and dozens of backends.

**Why it's essential:**
- Deduplication means backups are tiny after the first one
- Encryption built-in
- Works across any storage backend
- Single binary, no daemon

**Usage Example:**

```bash
# Install
apt install restic  # or brew install restic

# Initialize a repository (local backup location)
restic init --repo /backups/myserver
# Or with password file for automation
restic init --password-file /etc/restic/pw /backups/myserver

# Backup with exclusions
restic backup \
  --exclude-caches \
  --exclude='*.log' \
  --exclude='/proc' \
  --exclude='/sys' \
  --repo /backups/myserver \
  /

# Prune old backups (keep last 7 daily, 4 weekly, 6 monthly)
restic forget \
  --keep-daily 7 \
  --keep-weekly 4 \
  --keep-monthly 6 \
  --prune \
  --repo /backups/myserver
```

**Cron Job for Automation:**

```bash
# /etc/cron.daily/restic-backup
#!/bin/bash
export RESTIC_PASSWORD_FILE=/etc/restic/pw
restic backup / --exclude-caches --exclude='/proc' --exclude='/sys' --repo /backups/myserver
restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 6 --prune --repo /backups/myserver
```

**Resource Requirements:** Minimal — backup runs as a job, not a persistent service

---

### Borg Backup ⭐ Alternative

**What it is:** Deduplicating backup with compression and encryption. Very efficient for large datasets.

**When to prefer over Restic:**
- You need append-only backup repositories (security)
- You want a backup mount as a FUSE filesystem
- You're backing up to a dedicated Borg server

```bash
# Install
apt install borgbackup

# Initialize
borg init --encryption=repokey /backups/borg::main

# Backup
borg create /backups/borg::'{hostname}-{now:%Y-%m-%d}' /home /etc /var/www

# Prune (keep 7 daily, 4 weekly, 12 monthly)
borg prune --keep-daily=7 --keep-weekly=4 --keep-monthly=12 /backups/borg
```

---

### Duplicati ⭐ GUI Option

**What it is:** Web UI backup tool with scheduling, encryption, and multiple backends.

**Docker Setup:**

```yaml
version: '3'
services:
  duplicati:
    image: duplicati/duplicati:latest
    ports:
      - "8200:8200"
    volumes:
      - duplicati-config:/config
      - duplicati-data:/backups
      - /your/data:/source:ro
    restart: unless-stopped

volumes:
  duplicati-config:
  duplicati-data:
```

**Honest Assessment on Backups:** Restic is the indie hacker's choice — fast, minimal, and the deduplication is magical for frequent backups. Borg is equally capable but slightly more complex. Duplicati is good if you need GUI for non-technical team members.

**Critical advice:** Test your restores. A backup you haven't verified is not a backup.

---

## Quick-Start Stack Recommendation

For a typical indie hacker setup with Coolify:

| Priority | Tool | Purpose | RAM |
|----------|------|---------|-----|
| 🔴 Essential | Uptime Kuma | Uptime monitoring | 256MB |
| 🔴 Essential | Renovate | Dependency updates | 200MB |
| 🟡 Recommended | Woodpecker CI | CI/CD (if not using Coolify's built-in) | 512MB |
| 🟡 Recommended | Prometheus + Grafana | Metrics + dashboards | 1.5GB |
| 🟡 Recommended | Loki + Promtail | Log aggregation | 1GB |
| 🟢 Nice | Restic | Backups (automated) | 0 (runs as cron) |
| 🟢 Nice | ntfy | Push notifications | 256MB |

**Total overhead:** ~4GB RAM for the full stack, running comfortably on a 4-8GB VPS.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Your VPS / Home Server                  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Coolify    │  │  Woodpecker  │  │   Grafana    │       │
│  │ (Deployments)│  │     CI       │  │  +Prometheus │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                 │               │
│         │         ┌───────┴───────┐         │               │
│         │         │    Loki       │         │               │
│         │         │  +Promtail    │◄────────┘               │
│         │         └───────────────┘                         │
│         │                                                   │
│  ┌──────┴───────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Uptime Kuma │  │   Renovate    │  │    Restic    │       │
│  │  (Monitor)   │  │   (Bot)       │  │  (Backups)   │       │
│  └──────┬───────┘  └──────────────┘  └──────────────┘       │
│         │                                                   │
│         └──────────► ntfy / Gotify ◄── (Push Notifications) │
└─────────────────────────────────────────────────────────────┘
```

---

## Further Resources

- [Woodpecker CI Docs](https://woodpecker-ci.org/docs)
- [Grafana Play](https://play.grafana.org/) — Live demo dashboards
- [Prometheus Operator](https://prometheus-operator.dev/) — If you need Kubernetes
- [Restic Documentation](https://restic.readthedocs.io/)
- [Awesome Self-Hosted](https://github.com/awesome-selfhosted/awesome-selfhosted) — Full list

---

*Last updated: 2026-03-23*
