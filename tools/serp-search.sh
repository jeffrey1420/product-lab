#!/bin/bash
# Usage: ./serp-search.sh "query" [count]
# Returns: JSON with title, link, snippet for each result

QUERY=$(echo "$1" | sed 's/ /+/g')
COUNT=${2:-5}
KEY="fcde47934aac38543c03be561fdd86c61a557bdae8e6cd4ebd0a10fbb80193e0"

curl -s "https://serpapi.com/search?q=${QUERY}&api_key=${KEY}&num=${COUNT}" \
  -H "Accept: application/json" 2>/dev/null | \
  node -e "
const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const results = (data.organic_results || []).slice(0, ${COUNT}).map(r => ({
  title: r.title,
  link: r.link,
  snippet: r.snippet
}));
console.log(JSON.stringify(results, null, 2));
"
