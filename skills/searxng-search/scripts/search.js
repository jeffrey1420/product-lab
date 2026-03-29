#!/usr/bin/env node
// SearXNG search - returns JSON results
const query = process.argv.slice(2).join(' ');

if (!query) {
  console.error('Usage: node search.js <query> [count]');
  process.exit(1);
}

const count = parseInt(process.argv[process.argv.length - 1]) || 5;
const searxngUrl = 'https://searxng.lschvn.foo';

const url = `${searxngUrl}/search?q=${encodeURIComponent(query)}&format=json&engines=google,bing,duckduckgo`;

fetch(url)
  .then(r => r.json())
  .then(d => {
    (d.results || []).slice(0, count).forEach(r => {
      console.log(JSON.stringify({ title: r.title, url: r.url, snippet: r.content || '' }));
    });
  })
  .catch(e => { console.error(e.message); process.exit(1); });
