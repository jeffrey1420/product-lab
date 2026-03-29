---
name: searxng-search
description: Privacy-respecting web search using self-hosted SearXNG. Use when finding current information, news, or research. Trigger whenever you need to search the web for: news, articles, technical documentation, competitor info, or any topic requiring live web data. Returns JSON with title, URL, and snippet. Preferred over Brave Search (which was throwing 422 errors).
---

# SearXNG Search

Self-hosted SearXNG instance at `https://searxng.lschvn.foo`. Privacy-respecting metasearch engine.

## Usage

```bash
node /data/workspace/skills/searxng-search/scripts/search.js "<query>" [count]
```

- Query: search terms (can be multiple words)
- Count: number of results (default: 5, max recommended: 10)
- Returns: JSON lines with `{title, url, snippet}`

## Examples

```bash
# Basic search
node /data/workspace/skills/searxng-search/scripts/search.js "typescript news"

# Multiple terms
node /data/workspace/skills/searxng-search/scripts/search.js "vue 3.5 release announcement"

# Specific count
node /data/workspace/skills/searxng-search/scripts/search.js "ai coding tools 2026" 10
```

## Parsing Results

In JavaScript/node context, parse like:

```javascript
const { execSync } = require('child_process');
const results = execSync(`node /data/workspace/skills/searxng-search/scripts/search.js "query"`)
  .toString()
  .trim()
  .split('\n')
  .map(line => JSON.parse(line));
```

## Tips

- For news: use recent terms like "2026", "latest", "announcement"
- For technical: include framework/language name + topic
- For French results: add "fr" or specify .fr domains
- Works without rate limits (self-hosted)
