# Context Engineering: The Missing Layer in Enterprise AI Agent Deployment

**Prepared by:** Jeffrey (product-lab research)
**Date:** June 5, 2026
**Classification:** Alizé product concept — strategic
**Sources:** TechCrunch (Trace AI, Feb 2026), Automation Anywhere Imagine 2026, EU AI Act Articles 11–12

---

## The Problem: AI Agents Don't Know When to Stop Reading

The dominant failure mode in enterprise AI agent deployment is not bad models. It's context overflow.

Enterprise environments generate enormous amounts of structured and unstructured data: emails, Slack threads, CRM records, ERP transactions, PDFs, spreadsheets, databases. When an AI agent is given a task — "send a follow-up to all overdue invoices" — the naive approach is to give it access to everything. This produces three problems:

1. **Cost explosion:** More context tokens = more inference cost. A task that should cost €0.02 costs €2.00.
2. **Accuracy degradation:** Irrelevant context introduces noise. Agents make decisions based on data that doesn't pertain to the task.
3. **Compliance violation:** Under GDPR and the EU AI Act, giving an AI system access to data beyond what is "necessary for its specific purpose" is not just bad practice — it can be illegal for high-risk AI systems.

The industry is converging on a name for this problem: **context engineering.**

---

## The Theme Emerges from Two Independent Sources

### Trace AI (YC W26, $3M seed)

Trace maps a company's existing tools (email, Slack, Airtable, ERP) into a knowledge graph. When a user submits a high-level task, Trace:
1. Decomposes it into sub-tasks
2. Identifies which agents need to handle which sub-tasks
3. Selects exactly the context needed for each agent's specific sub-task — not all context

**Key quote from Trace CEO Tim Cherkasov:**
> "OpenAI and Anthropic are building these brilliant interns that can be leveraged within the company. We're building the manager that knows where to put them."

**Key quote from Trace CTO Artur Romanov:**
> "2024 and 2025 was still about prompt engineering. Now we've moved from prompt engineering to context engineering. Whoever provides the best context at the right time is going to be the infrastructure on top of which the AI-first companies will be built."

Trace's insight: the intelligence is not in the model, it's in the context selection layer.

### Automation Anywhere — Context Intelligence Graph (Imagine 2026)

Automation Anywhere (AA) announced Context Intelligence Graph as part of its Process Reasoning Engine (PRE) at their Imagine conference (May 2026). AA's framing:

> "In complex workflows, more context is not always better. Irrelevant information can slow execution, increase costs, expose sensitive data unnecessarily, and introduce inaccurate or inconsistent decisions."

AA's solution: a graph-based system that identifies which context is relevant to each workflow step, and provides only that. This is explicitly designed for enterprise governance requirements.

---

## The Regulatory Hook: EU AI Act Articles 11 and 12

The EU AI Act creates a legal imperative for context engineering in high-risk AI systems. Two articles are directly relevant:

**Article 11 — Data Governance:**
> "AI systems shall be designed and developed in such a way that the data [used] is relevant, sufficiently representative, free of errors and complete."

This provision effectively requires that an AI system uses *exactly the data it needs* for its task — not a superset. A system that pulls all available customer data when only the last 3 months of invoice data is needed is not in compliance.

**Article 12 — Technical Robustness:**
> "High-risk AI systems shall be designed and developed to achieve, in the light of their intended purpose, a level of technical robustness that ensures they operate correctly."

An agent that indiscriminately accesses data is not technically robust. It is prone to errors introduced by irrelevant context.

**The compliance gap:** Every enterprise AI agent platform (Anthropic Claude, Mistral Vibe, Microsoft Copilot, Factory AI) provides the model capability. None of them natively enforce EU AI Act data minimization at the context-selection layer. This is the gap Alizé can fill.

---

## Three Product Positions for Alizé

### Position 1: Context Audit Trail

**Description:** Alizé logs every context access by every AI agent in an enterprise. What data was accessed? When? By which agent? Was this access within the agent's defined purpose?

**Value:** Compliance documentation. When a French regulator asks "show us how this AI system selects its data," Alizé produces the audit log.

**EU AI Act alignment:** Articles 11, 12, 17 (transparency), 71 (enforcement cooperation).

**Competitive differentiation:** No existing AI agent platform provides native audit trails for context access. Mistral Vibe's governance documentation covers model behavior, not context selection.

### Position 2: Context Access Guardrails

**Description:** Alizé enforces policy on what context an agent *can* access, based on:
- The agent's defined purpose and scope
- The data classification (public, internal, confidential, restricted)
- The EU AI Act data minimization requirements

**Value:** Proactive compliance. Instead of auditing after the fact, Alizé blocks non-compliant context access before it happens.

**EU AI Act alignment:** Article 11 (data minimization), Article 9 (risk management system).

**Competitive differentiation:** This is a governance constraint layer that sits above Mistral Workflows, Claude, and any other agent platform. It is platform-agnostic by design.

### Position 3: Context Compliance Scoring

**Description:** For each workflow, Alizé produces a "context appropriateness score": how well did the agent's context selection match what was minimally necessary? This is a diagnostic tool for enterprise AI governance maturity.

**Value:** Self-assessment. Enterprises can measure their own AI governance performance before a regulator does it for them.

**EU AI Act alignment:** Article 9 (risk management system), Article 17 (transparency for users).

**Competitive differentiation:** No existing tool scores AI agent context decisions against EU AI Act requirements. This is novel.

---

## Architecture: How It Fits

```
┌─────────────────────────────────────────┐
│         Enterprise AI User             │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│     Alizé Governance Layer              │
│  ┌─────────────────────────────────┐   │
│  │ Context Guardrail (blocks/      │   │
│  │ approves context access)        │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ Context Audit Log (what was    │   │
│  │ accessed, when, by whom)        │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ Context Compliance Score       │   │
│  │ (compliance score per workflow)│   │
│  └─────────────────────────────────┘   │
└─────────────────┬───────────────────────┘
                  │
        ┌────────┴────────┐
        ▼                 ▼
┌───────────────┐  ┌───────────────────┐
│  Mistral     │  │  Anthropic Claude │
│  Vibe Work   │  │  (or any platform) │
└───────────────┘  └───────────────────┘
```

Alizé does not replace the agent platform. It wraps it with governance.

---

## Trace AI: Potential Partner, Not Competitor

Trace AI ($3M seed, Y Combinator W26) is building the context *construction* layer. They ingest a company's tools and produce the knowledge graph that agents draw from. Alizé would sit above Trace's output, governing what agents can do with that context.

**Potential partnership:** Trace → Alizé → Agent platform. Trace builds the context graph. Alizé enforces governance on top. The agent executes.

**Alizé's advantage with Trace:** Trace focuses on the technical problem (building the graph). Alizé focuses on the regulatory problem (what the agent is permitted to do with the graph). These are complementary problems, and the market needs both.

---

## Pricing Analogy

If AI agents are "the new employees," context engineering is "the new onboarding." And governance is "the new HR compliance."

Just as HR compliance software (Workday, BambooHR) doesn't compete with HRIS platforms — it governs them — Alizé doesn't compete with agent platforms. It governs them.

This is the "compliance-as-infrastructure" positioning that was discussed in earlier debates. Context engineering gives it a concrete technical meaning.

---

## Key Takeaways

1. **Context engineering is the 2026 enterprise AI theme.** Two independent sources (Trace AI, Automation Anywhere) arrived at the same conclusion: context selection is the hard problem, not model capability.

2. **EU AI Act Articles 11 and 12 effectively mandate context engineering for high-risk systems.** The regulation requires data minimization — using only what's necessary. Any AI agent that accesses a superset of necessary data is non-compliant.

3. **Alizé can own the "context governance" layer** — not building context (Trace's job), not running agents (Mistral's job), but governing what agents can do with context. This is platform-agnostic and regulation-native.

4. **Three product modules follow:** context audit trail, context guardrails, context compliance scoring. Each maps directly to EU AI Act articles.

5. **Position as "compliance infrastructure" not "compliance tool."** HR compliance software sits on top of HRIS. Alizé sits on top of AI agent platforms. The analogy is strong and the market already understands it.

---

*This brief is for internal Alizé product-lab use only.*
