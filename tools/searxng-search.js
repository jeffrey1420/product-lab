#!/usr/bin/env node
// Search using self-hosted SearXNG instance (uses native fetch)
const query = process.argv.slice(2).join(' ');

if (!query) {
  console.error('Usage: node searxng-search.js <query> [count]');
  process.exit(1);
}

const count = parseInt(process.argv[3]) || 5;
const searxngUrl = 'https://searxng.lschvn.foo';

async function search() {
  try {
    const res = await fetch(`${searxngUrl}/search?q=${encodeURIComponent(query)}&format=json&engines=google,bing,duckduckgo`);
    const data = await res.json();
    const results = data.results || [];
    results.slice(0, count).forEach(r => {
      console.log(JSON.stringify({
        title: r.title,
        url: r.url,
        snippet: r.content || '',
      }));
    });
  } catch (err) {
    console.error('Search error:', err.message);
    process.exit(1);
  }
}

search();
