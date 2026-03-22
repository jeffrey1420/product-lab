# Nuxt Documentation Skill

When working with Nuxt or Nuxt UI projects, ALWAYS use the MCP client first before web search.

## The MCP Tool

**Script:** `/data/workspace/tools/mcp-nuxt.js`

This queries the Nuxt and Nuxt UI MCP servers directly, returning structured documentation.

### Always use these commands when working on ts.news or any Nuxt project:

**For Nuxt questions:**
```bash
node /data/workspace/tools/mcp-nuxt.js list-pages                    # all docs
node /data/workspace/tools/mcp-nuxt.js get-page getting-started/introduction  # specific page
node /data/workspace/tools/mcp-nuxt.js search composables              # search docs
node /data/workspace/tools/mcp-nuxt.js blog                          # Nuxt blog posts
node /data/workspace/tools/mcp-nuxt.js deploy                        # deployment guides
```

**For Nuxt UI questions:**
```bash
node /data/workspace/tools/mcp-nuxt.js list-components --server=https://ui.nuxt.com/mcp
node /data/workspace/tools/mcp-nuxt.js get-component button --server=https://ui.nuxt.com/mcp
node /data/workspace/tools/mcp-nuxt.js get-component button --sections=usage,api --server=https://ui.nuxt.com/mcp
node /data/workspace/tools/mcp-nuxt.js search-components-by-category forms --server=https://ui.nuxt.com/mcp
```

## When to Use

- Any Nuxt or Nuxt UI question
- Before writing Nuxt code, check the docs first
- When debugging Nuxt issues
- When adding Nuxt/Nuxt UI features

## Fallback

If MCP fails, use `web_fetch` on:
- https://nuxt.com/docs
- https://ui.nuxt.com
