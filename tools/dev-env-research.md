# AI Dev Environment Research for Louis
## Alizé, ts.news, Kuroba — March 2026

---

## Part 1: n8n — What Jeffrey Can't Do Natively

### The Core Gap: Thinking Agent vs Automation Engine

Jeffrey is an AI agent that **reasons, decides, and converses**. n8n is an automation engine that **executes triggers, moves data, and coordinates services**. They're complementary, not competing.

| Jeffrey (AI Agent) | n8n (Automation Engine) |
|---|---|
| Responds to natural language | Responds to webhooks/schedules |
| Decides what to do based on context | Follows pre-defined branching logic |
| Remembers within a session | Stateless between runs |
| One conversation, many tools | Many workflows, no conversation |
| Triggers: user messages | Triggers: time, webhook, event |

---

### What Jeffrey Cannot Do Natively

#### 1. **Reliable Scheduled/Recurring Tasks**
Jeffrey only acts when spoken to. He can't:
- Every morning at 8am, pull new articles from RSS feeds and summarize them for ts.news
- Every hour, check if a website is down and alert on Discord
- Every day at midnight, clean up old temp files across servers

**What n8n adds:** Rock-solid scheduled workflows that run whether anyone asks or not.

#### 2. **Webhook Listeners at Scale**
Jeffrey can receive Discord messages, but n8n can:
- Receive webhooks from Stripe, GitHub, Gmail, a hundred other services
- Rate-limit, queue, and retry webhook payloads
- Transform webhook data before passing it anywhere

**What n8n adds:** A production-grade webhook receiver with built-in retry logic and dead-letter queues.

#### 3. **Multi-Step Data Pipelines Without Session Reset**
Jeffrey loses conversation context after each response (within LLM limits). He can't:
- Fetch 500 rows from a database → transform each row → post to an API → update the database → log results
- Process a batch of 200 emails, classify them, sort them, route them — all in one reliable job

**What n8n adds:** Stateful workflows that process large datasets reliably, with error handling per-item.

#### 4. **Connecting to APIs That Require OAuth or Complex Auth**
Jeffrey can call APIs with an API key, but OAuth flows, refresh token logic, and connection management aren't his native thing. n8n has dedicated nodes for:
- OAuth2 flows (Google, Microsoft, GitHub, etc.)
- Connection pooling and credential management
- Running Long-running background jobs

**What n8n adds:** Clean integration with services that have non-trivial auth flows.

#### 5. **Human-in-the-Loop Approval Gates**
For Kuroba and Alizé, there may be workflows that need human sign-off:
- AI drafts a cold email → human approves → sent via n8n
- Content flagged for review → human approves → published

**What n8n adds:** Approval nodes where a workflow pauses and waits for a human to click "approve" via a web form or Slack message.

---

### Concrete Workflows n8n Would Enable for Louis's Projects

**For ts.news:**
- `Trigger: RSS feed → LLM summarize article → Post to Discord/Telegram`
- `Trigger: Schedule (daily) → Scrape 10 news sources → Embed → Store in vector DB → Qdrant powers a "news chat" bot`
- `Trigger: Webhook from Stripe → Update subscriber count → Notify on Discord`

**For Kuroba:**
- `Trigger: Form submission → AI draft email → Approval node → Send via SMTP`
- `Trigger: Gmail webhook → Classify lead → Route to specific follow-up workflow`
- `Trigger: Schedule → Check prospect list → Enrich data via API → Update CRM`

**For Alizé (general):**
- `Trigger: GitHub webhook → LLM review PR → Post summary to Discord`
- `Trigger: Schedule → Backup database → Upload to S3 → Notify`
- `Trigger: Webhook from any SaaS → Transform → Forward to another service`

---

### Honest Assessment: Does Louis Need n8n?

**Yes, if:**
- He wants reliable automation that runs on a schedule (not just on-demand chat)
- He's connecting multiple SaaS tools that need more than just "call an API key"
- He needs webhook listeners that stay running and handle retries
- He's doing batch data processing (many rows, one reliable job)

**Probably not, if:**
- Everything he needs can be triggered by a human asking Jeffrey
- He just needs API calls and basic scheduling (Jeffrey + cron can cover this)
- He's the only user and workflows are simple

**Recommendation:** n8n is worth it for ts.news especially (automated news ingestion + summarization pipeline). Self-host it on the same Coolify instance. Low overhead, high value.

---

## Part 2: What Actually Makes an AI Agent More Capable

### Vector Databases (Qdrant, pgvector)

**What they are:** Databases that store "embeddings" — numerical representations of text where similar concepts live near each other in high-dimensional space. You can then search by "conceptual similarity" not just keyword match.

**Real use case for an AI agent like Jeffrey:**
- **Knowledge base Q&A:** "What did we decide about the API redesign?" → Jeffrey searches your meeting notes, project docs, Slack archive. Without a vector DB, he can't find this — it's not in his training data and isn't a simple keyword match.
- **Long-term memory:** Jeffrey's context window is finite. A vector DB lets him store "what happened in previous sessions" and retrieve relevant history when needed.
- **Codebase search:** "Find where we implemented authentication in the mobile app" — works across your actual codebase.

**For Louis's projects specifically:**
- ts.news: Store all scraped articles as embeddings → enable semantic search across news ("find articles about AI regulation, not just articles containing the word 'AI regulation'")
- Kuroba: Store email sequences, prospect context, conversation history → Jeffrey can reference it when drafting follow-ups
- Alizé: Store project decisions, technical specs, team knowledge

**Honest assessment:**
- If Jeffrey will mostly answer questions from documents and long conversations → vector DB is genuinely useful
- If he just chats and does one-off tasks → over-engineering
- **Qdrant vs pgvector:** Qdrant is purpose-built, faster, easier to deploy separately. pgvector is simpler if you already run Postgres. For a self-hosted setup, Qdrant via Docker on Coolify is straightforward.
- **Storage cost:** Low. Millions of vectors cost ~$10-50/month on a small instance.

**Recommendation:** Add Qdrant when you have a clear knowledge base use case. Start with the simplest possible setup — one collection, basic embeddings. Don't over-architect.

---

### RAG (Retrieval Augmented Generation)

**What it is:** You retrieve relevant documents from your knowledge base, stuff them into the LLM prompt, and the LLM answers based on that retrieved context rather than (or in addition to) its training data.

**When it actually matters:**
- ✅ You need answers about YOUR specific data (internal docs, code, contracts)
- ✅ Your data changes frequently (RAG updates instantly; fine-tuning is stale the next day)
- ✅ You want to cite sources ("this answer comes from doc X")
- ❌ The LLM already knows the answer (general knowledge questions)
- ❌ The task is pure reasoning (math, logic, creative writing)
- ❌ You're okay with generic answers

**For Jeffrey specifically:**
Jeffrey could use RAG to:
- Answer questions about Kuroba's pricing, features, processes (from internal docs)
- Reference ts.news article history when asked "what's the trend on AI news this month?"
- Search through Alizé project context without you re-explaining everything each session

**RAG is NOT the same as memory.** Memory is short-term (this conversation). RAG is long-term (everything you've ever told me or that exists in my knowledge base).

**Honest assessment:**
- RAG is genuinely useful for someone like Louis who juggles multiple projects and needs Jeffrey to "just know" context from each one
- The "moat" isn't the model — it's the data + retrieval. If Louis's projects have proprietary knowledge, RAG is how Jeffrey accesses it
- Setup complexity: Moderate. Embeddings model + vector DB + retrieval logic. But there are off-the-shelf setups (n8n even has RAG workflow templates)
- **Don't build RAG for RAG's sake.** Start when you have a specific use case ("I want to ask Jeffrey about my ts.news article archive")

**Recommendation:**有价值 but don't rush it. Good to have on the roadmap.

---

### File Storage / Knowledge Management

**What Jeffrey would actually use it for:**

1. **Reading uploaded files:** If Louis shares a contract, a CSV, a PDF — Jeffrey needs to access it. Currently he can read files from disk, which is fine. But structured file storage means:
   - Uploaded files are organized and searchable
   - Jeffrey can reference "the Q4 2025 report" without you attaching it every time

2. **Project-specific context storage:**
   - Kuroba: Client notes, email templates, prospect history
   - ts.news: Article metadata, source credentials, curation rules
   - Alizé: Technical decisions, architecture docs, meeting notes

3. **Persistent context across sessions:** Instead of re-explaining your project every time, files in a `/knowledge` folder give Jeffrey persistent context.

**Practical setup:**
- Simple: A structured folder hierarchy on the server (`/data/knowledge/{project}/`)
- Better: Object storage (S3-compatible) + metadata database
- Overkill: Full document management system (Notion API, Obsidian vault)

**Honest assessment:**
- A simple file structure + Jeffrey reading files is 80% as good as a complex knowledge management system
- If Louis already uses Obsidian or Notion, connecting Jeffrey to it via API is low-effort, high-value
- Don't build a knowledge management system — use what's already there

**Recommendation:** Start with a `/data/knowledge` directory organized by project. Jeffrey reads from it. Add structure only when you hit limits.

---

### Code Execution Environments

**What would enable Jeffrey to run and test code:**

Currently, Jeffrey can run shell commands via the exec tool. But a proper code execution environment means:

- **Isolated sandboxes:** AI-generated code runs in a container that can't access your main system
- **Language support:** Python, JavaScript, and more without polluting the host
- **Stateful environments:** Run code, keep variables in memory, run more code that references previous state
- **Timeout and resource limits:** Kill runaway code automatically

**Real use cases for Louis:**
- **ts.news:** Process and analyze article data, run scripts to transform scraped content
- **Kuroba:** Run email sequence simulations, analyze prospect data
- **Alizé:** Test code snippets, run build scripts, validate configurations

**Options:**

| Solution | Type | Pros | Cons |
|---|---|---|---|
| **E2B** | Cloud service | Best isolation (Firecracker microVMs), great SDK | External dependency, costs money, latency |
| **Daytona** | Self-hosted | Docker-based, scalable, good for self-hosters | Less isolation than Firecracker |
| **Direct exec on host** | Built-in | Zero setup, fast | Risky: AI code has full system access |
| **Polygott / temporary containers** | Advanced | Good isolation, language flexibility | Complex to set up |

**Honest assessment:**
- The current `exec` tool is fine for trusted operations (you're supervising)
- If you want Jeffrey to autonomously run untrusted or complex code → sandbox is genuinely needed
- For Louis's use cases (indie hacker, not running untrusted user code), a sandbox is **probably overkill**
- E2B is the best cloud option if you go that route; self-host Daytona if you want control

**Recommendation:** Stick with the built-in exec tool for now. Add E2B or Daytona only if you find yourself frequently wanting Jeffrey to "just run this Python script" without you overseeing it. The risk of exec on a self-hosted VM is manageable.

---

## Summary: What to Actually Build

### Do Now (High Value, Low Complexity)
1. **n8n self-hosted on Coolify** — Automated news ingestion for ts.news (RSS → summarize → post) is the killer app. Reliable scheduling + LLM + Discord = pure value.
2. **`/data/knowledge` directory structure** — Give Jeffrey persistent context per project. Free, instant, no infrastructure.

### Do Later (High Value, Medium Complexity)
3. **Qdrant vector DB** — Once you have a real knowledge base for ts.news or Kuroba. The use case has to come first, not the technology.
4. **RAG pipeline** — When you actually want to ask Jeffrey questions about your article archive or client history.

### Probably Skip (Over-Engineering for This Scale)
- Complex knowledge management systems (use existing tools: Notion, Obsidian)
- Code execution sandboxes (exec on host is fine for self-hosted indie hacker)
- n8n if you don't have clear scheduled/automated workflows (start with cron + Jeffrey)

---

## One Meta-Point Worth Considering

Louis is building **Alizé, ts.news, and Kuroba** — three active products. The question "what makes Jeffrey more capable" is actually the question "what gives Louis leverage across three projects."

The honest answer: **organizational infrastructure matters more than technical sophistication at this stage.**

- A shared knowledge base (files Jeffrey can read) helps across all three projects
- Reliable automation (n8n) saves time on repetitive tasks
- Vector DB / RAG only matter when you have structured, searchable data worth querying

Don't build the "enterprise AI platform." Build what saves you 30 minutes a day across three businesses.
