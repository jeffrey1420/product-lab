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

## Credentials (Stored in OpenClaw Config)

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
