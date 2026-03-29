# RUNBOOK — Alizé Prospecting

## The Product
Alizé sells managed IA agents to French SMBs. Not "AI" — operational IA that handles repetitive, standardizable, time-consuming tasks in business workflows. Monthly retainer, service managé.

**Key message:** "Nous transformons des tâches répétitives et des frictions internes en workflows pilotés par des agents IA utiles, sécurisés et suivis."

## Target Client Profile

**Primary: Agencies and professional services** — they understand SaaS, have clear workflows, and face repetitive client communication tasks.

**Best fit sectors (priority order):**
1. Marketing / communication agencies
2. Web / IT agencies and dev shops
3. Consulting firms and strategy consultants
4. Insurance brokers
5. Real estate agencies
6. Accounting firms (expert-comptable)
7. Architecture / design studios
8. Recruitment / staffing agencies

**Secondary fit:**
- Clinics and healthcare practices (reception, appointment scheduling)
- Property managers
- E-commerce with high inquiry volume

## HARD EXCLUSIONS
- Artisans / tradespeople (plumbers, electricians) — think in physical jobs, not software subscriptions
- Restaurants and bars — high churn, low tech maturity
- Retail shops — unless significant online presence
- Solopreneurs — no organizational buy-in
- Enterprise / big companies — too complex a sale

## Targeting Criteria
- 5-25 employees (PME层面)
- Has a website with visible services and client-facing workflows
- Business model based on client communication (inbound leads, quotes, appointments, follow-ups)
- Decision maker email publicly visible (gérant, directeur, associé)
- Signs they need automation: high inquiry volume, online booking, multiple communication channels

## Value Proposition (reframe per sector)
Not "IA" — concrete operational outcomes:
- Agencies: "Handle client briefs 24/7", "Qualify inbound leads before you call back", "Auto-follow-up on proposals"
- Consultants: "Never miss a meeting request", "Auto-send prep notes before each call"
- Brokers: "Answer policy questions instantly", "Capture every lead after hours"
- Real estate: "Qualify property inquiries instantly", "Auto-schedule viewings"
- Accountants: "Answer routine client questions 24/7", "Auto-relance for missing documents"

## Pricing Tier to Reference
- Starter: €299-499/month (1 agent, 1 workflow, 50 messages/month)
- Pro: €799-1,499/month (2-3 agents, 3 workflows, 200 messages/month)
- Enterprise: custom

## Tone
Professional, direct, French. Lead with their problem, one concrete benefit, one CTA. Under 100 words. No buzzwords. No fluff.

## Daily Workflow

### Step 1: Read workspace
- `prospecting/alize/leads.jsonl` — deduplicate
- `prospecting/alize/outreach_log.jsonl` — check what's already contacted
- `prospecting/alize/do_not_contact.json`

### Step 2: Research (use web_search Brave API)
Find 8-10 businesses in target sectors. Use these search patterns:

**Agency angle (they understand subscriptions + software):**
- `agence communication Caen site:.fr`
- `agence web Caen site:.fr`
- `agence marketing Normandie site:.fr`

**Professional services angle:**
- `courtier assurance Caen site:.fr`
- `expert comptable Caen site:.fr`
- `agence immobiliere Caen site:.fr`

**Template/weak website angle (hotter lead):**
- `site:.fr "gérez vos clients" OR "gestion clients" OR "prise de RDV" Caen`
- `site:.fr "automatisez" OR "automatisation" OR "IA" business France`

**Signs of digital maturity (better fit):**
- Online booking / scheduling visible
- CRM or software mentioned
- Multiple service pages
- Active social presence

### Step 3: Score /100
- Geo: 15 (France/Caen region)
- Business size fit: 15 (5-25 employees ideal)
- Automation need: 25 (repetitive client comms visible)
- Decision maker access: 10 (email or contact form)
- Email angle: 20 (clear pain point identified)
- ROI potential: 15 (monthly retainer affordable for their size)

### Step 4: Deduplicate against leads.jsonl

### Step 5: Select top 5

### Step 6: Write 5 emails
Framework (4-6 sentences, under 100 words):
1. **Opening**: Specific observation about THEIR business (not generic)
2. **Problem**: The specific repetitive task that costs them time
3. **Bridge**: What an IA agent doing this task would mean
4. **CTA**: One question, soft
5. **Opt-out**: One linefooter

Subject: 3-5 words, lowercase, specific to them. No clickbait.
Sign: "Louis" only.

### Step 7: Write output files
- `prospecting/alize/leads.jsonl` — append 5 JSON lines
- `prospecting/alize/outreach_log.jsonl` — append 5 JSON lines
- `prospecting/alize/daily/YYYY-MM-DD.md` — report
- `prospecting/alize/drafts/YYYY-MM-DD--company-slug.md` — 5 drafts

### Step 8: Discord announce (in English)
```
✅ Alizé Prospecting - YYYY-MM-DD
[X] prospects found
[Y] emails drafted

Top 5:
1. [Company] — ⭐ [score] — [sector] — [channel]
...

Target sector: [sector focus today]
Blockers: [none or reason]
```

## Constraints
- Quality > quantity
- Never send automatically
- French emails, English Discord summary
- Always deduplicate against existing leads
