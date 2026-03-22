#!/usr/bin/env node
/**
 * Web search tool using SerpAPI
 * Usage: node search.js "your query here" [num_results]
 * Output: JSON array of { title, link, snippet }
 */

const https = require('https');

const key = 'fcde47934aac38543c03be561fdd86c61a557bdae8e6cd4ebd0a10fbb80193e0';
const query = process.argv[2] || process.argv[1];
const num = parseInt(process.argv[3] || '5', 10);

if (!query) {
  console.error('Usage: node search.js "query" [num_results]');
  process.exit(1);
}

const url = 'https://serpapi.com/search?q=' + encodeURIComponent(query) + '&api_key=' + key + '&num=' + num;

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const results = (json.organic_results || []).slice(0, num).map(r => ({
        title: r.title,
        link: r.link,
        snippet: r.snippet
      }));
      console.log(JSON.stringify(results, null, 2));
    } catch (e) {
      console.error('Parse error:', e.message);
      process.exit(1);
    }
  });
}).on('error', e => {
  console.error('Request error:', e.message);
  process.exit(1);
});
