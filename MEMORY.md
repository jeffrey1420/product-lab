# MEMORY.md - Long-Term Memory

## About Louis

- **Name:** Louis
- **Location:** Caen, France (Europe/Paris timezone)
- **Work:** Web developer intern at Grinto (web agency in Caen)
- **Education:** M1 master student at MyDigitalSchool Caen, full stack + project management
- **Side venture:** Co-founded a web agency with Gabin (dev) and Maëli (designer) — 2 weeks old
- **Goal:** Build websites for small local firms in Caen
- **Previous AI assistant:** Had one until 2 days ago (subscription died)
- **Preferences:** Clear workspace, direct communication, no emojis, no double dashes, dry humor

## Identity

- **Name:** Jeffrey
- **Vibe:** chill professional — direct, warm, concise. No fluff, no corporate speak, no emojis, no double dashes. Gets things done.
- **Can push back** when Louis is wrong
- **Primary role:** Assistant for Alizé — French AI agent deployment company for SMBs

## Workspace Setup

- Model: MiniMax-M2.7-highspeed (default), MiniMax-M2.7 (fallback)
- Workspace: /data/workspace
- Skills installed: cold-email-writer, mini-crm, web-scraping, senior-dev, academic-deep-research, swarm-kanban, agent-team-orchestration
- Subagent concurrency: maxConcurrent 10, subagents.maxConcurrent 32

## Credentials

| Service | Value |
|---------|-------|
| Coolify | https://admin.lschvn.foo, token: `2|yeab7ZqVjFRhQIokZhGXYUNQ4PoYl84kXSxb0fxAc9c2d426` |
| GitHub | email: 126.leschevin@gmail.com, user: jeffrey1420, token in OpenClaw config |
| SerpAPI | `fcde47934aac38543c03be561fdd86c61a557bdae8e6cd4ebd0a10fbb80193e0` (100 searches/month free) |
| Brave Search | BSAbpcwC_sOcOLPULd4jR88RLHt3zuJ — 422 error, subscription token invalid, use SerpAPI instead |
| Swarm Kanban | Token in `/data/workspace/.swarm-kanban-token` |

## Projects

### Alizé — AI Agent Agency (PRIORITY)
- **Concept:** Managed AI agents for French SMBs — deployment, integration, governance, operation
- **Name:** Alizé
- **Positioning:** Not "AI" — operational IA that does real work with clear scope, governance, supervision
- **Target:** PME/ETI French companies with repetitive tasks and dispersed tools
- **Offer:** Diagnostic → Pilote deployment → Managed service (monthly recurring)
- **Brief:** `/data/workspace/alize/BRIEF.md`
- **Folder:** `/data/workspace/alize/`
- **Status:** Early stage — brief done, landing page copy done, needs domain + first prospects
- **Key message:** "Nous transformons des tâches répétitives et des frictions internes en workflows pilotés par des agents IA utiles, sécurisés et suivis."
- **Tone:** Professional, direct, credible, pragmatic — never arrogant, never buzzword-heavy
- **Louis plan:** Keep alternation for now, build Alizé on the side, reassess in 2-3 months

### ts.news (TypeScript.news)
- **Repo:** https://github.com/jeffrey1420/ts.news
- **Stack:** Nuxt 4 + Nuxt UI 4 + Nuxt Content v2
- **Hosting:** Coolify (ts.news UUID: `ixfpj0boqkyna02gn782iops`)
- **Status:** CRASHING — "restarting:unknown", restart_count: 13, last crash at 23:10:45 UTC
- **Build:** nixpacks, `bun run build`, `bun run preview`
- **Issue:** bun may not be available in nixpacks env; logs not accessible via API
- **Fix:** Redeploy from Coolify UI dashboard
- **Analytics:** GoatCounter at goatcounter.lschvn.foo
- **Article 1:** "Vinext and Cloudflare: The Controversy Explained" (published)

### Swarm Kanban Team "kuroba"
- Team ID: 69beeb43be6ec2aff8b82777
- Agent ID: 69beeb3bbe6ec2aff8b82776
- Dashboard: https://www.swarmmind.sh/agents/69beeb3bbe6ec2aff8b82776

### invade.lol
- ClickHouse crash — app connecting to localhost:8123 instead of container hostname
- Fix: update CLICKHOUSE_HOST to container hostname (Louis has details)

## Prospecting Business

### Caen Web Agency (Gabin + Maëli + Louis)
- Folder: /data/workspace/prospecting/caen/
- Cron: 8AM Paris daily
- RUNBOOK.md in place
- Status: Secondary priority vs Alizé

### MSP AI Service → Alizé
- Folder: /data/workspace/prospecting/msp/
- Cron: 8AM Paris daily
- RUNBOOK.md updated to target agencies and professional services (not artisans/tradespeople)
- Status: Aligned with Alizé positioning

## Technical Notes

- OpenClaw has NO native MCP support (ACP protocol explicitly ignores mcpServers config)
- MCP tools are HTTP endpoints (nuxt.com/mcp, ui.nuxt.com/mcp), not npm packages
- Claude Code = `claude` CLI on the system
- nuxt-docs skill at /data/workspace/skills/nuxt-docs/SKILL.md
- mcp-nuxt.js client at /data/workspace/tools/mcp-nuxt.js
