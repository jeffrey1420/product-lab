# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

## Claude Code Setup
Claude Code CLI installed at `/usr/local/bin/claude` v2.1.81
Config: `~/.claude/settings.json`
Uses MiniMax API key as ANTHROPIC_AUTH_TOKEN with MiniMax endpoint
Model: MiniMax-M2.7

## Kuroba Email
- contact@kuroba.studio — configured at `~/.config/imap-smtp-email/.env`
- IMAP/SMTP ready — can read inbox and send emails
- Waiting for Gabin to finish landing page before sending to prospects

## Credentials (Stored in OpenClaw Config)

### MiniMax API Key (Claude Code)
- Stored in: `~/.claude/settings.json` (ANTHROPIC_AUTH_TOKEN field)
- Used for: Claude Code CLI
- Model: MiniMax-M2.7

### API Keys
- **Brave Search API Key**: Configured in OpenClaw config (`tools.web.search.apiKey`)
- **GitHub Token**: Configured in OpenClaw config (`env.vars.GITHUB_TOKEN`)

### Coolify
- **URL**: https://admin.lschvn.foo
- **Token**: `2|yeab7ZqVjFRhQIokZhGXYUNQ4PoYl84kXSxb0fxAc9c2d426`

### GitHub
- **Email**: 126.leschevin@gmail.com
- **Username**: jeffrey1420
- **Token**: Stored in OpenClaw config env vars

## Skills Installed/Available
- github (needs token ✓ configured)
- coding-agent
- browser ( CDP at http://browser:9223)
- web_fetch (enabled)
- web_search (Brave API configured)
- weather
- summarize

## Skills to Explore Later
- notion, obsidian (notes)
- trello (project management)
- spotify-player

## SerpAPI Search
SerpAPI key: `fcde47934aac38543c03be561fdd86c61a557bdae8e6cd4ebd0a10fbb80193e0`

Usage:
```bash
node /data/workspace/tools/search.js "vinext cloudflare" 5
```

Returns JSON array of { title, link, snippet }.
Free tier: 100 searches/month.

## MCP Tools (Nuxt/Nuxt UI)
Script at /data/workspace/tools/mcp-nuxt.js — queries Nuxt and Nuxt UI MCP servers.
Skill at /data/workspace/skills/nuxt-docs/SKILL.md

## SerpAPI Search
SerpAPI key: `fcde47934aac38543c03be561fdd86c61a557bdae8e6cd4ebd0a10fbb80193e0`
Usage: `node /data/workspace/tools/search.js "query" 5`
Tool: /data/workspace/tools/search.js

## SearXNG (Primary Search)
Self-hosted at: https://searxng.lschvn.foo
Usage: `node /data/workspace/tools/searxng-search.js "query" 5`
Better results than SerpAPI for recent news. Use this first.
