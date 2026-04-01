# Rivet Agent OS — Competitive Landscape Research

**Date:** April 1, 2026  
**Scope:** Competitive positioning, differentiators, buyer personas, limitations, and community metrics for Rivet Agent OS (agentOS)

---

## Product Overview

**agentOS** is an open-source, in-process operating system for AI agents built by Rivet (YC W24, backed by a16z Speedrun). It uses V8 JavaScript isolates + WebAssembly to run agents with ~6ms cold starts at roughly 32x lower cost than traditional sandbox providers. Licensed under Apache 2.0.

Key claim: agents run *inside your process* (Node.js) rather than in separate VMs or containers, enabling direct function calls without network hops.

**Key URLs:**
- Product: https://www.rivet.dev/agent-os/
- GitHub: https://github.com/rivet-dev/agent-os
- ACP Protocol: https://agentclientprotocol.com
- Registry: https://rivet.dev/agent-os/registry

---

## 1. agentOS vs Modal (Serverless GPU)

| Dimension | agentOS | Modal |
|---|---|---|
| **Primary use case** | Agent runtime / isolation | General serverless compute + GPU for ML |
| **Cold start** | ~6ms (V8 isolate) | ~500ms–1s (container) |
| **Isolation model** | V8 + WASM (in-process) | Docker containers |
| **GPU access** | No | Yes (A100/H100 clusters) |
| **Pricing** | Free (Apache 2.0) + optional managed cloud | Usage-based (free tier ~$30/mo) |
| **Language runtime** | Node.js host → runs Python/JS/bash inside WASM VM | Native Python, any language in container |
| **Target user** | Backend developers embedding agents | ML engineers deploying models |
| **Agent-native features** | Sessions, transcripts, ACP, host tools, cron, queues | No (general compute platform) |

**Verdict:** Modal and agentOS aren't direct competitors. Modal is a serverless compute platform (like AWS Lambda but better DX) with GPU access. agentOS is a lightweight agent runtime. The overlap is minimal — Modal could theoretically *host* agentOS workloads, but Modal has no agent-specific primitives. Developers choose Modal when they need GPU compute; they choose agentOS when they need to embed and orchestrate agents in their backend.

---

## 2. agentOS vs E2B (Sandbox Provider)

| Dimension | agentOS | E2B |
|---|---|---|
| **Isolation model** | V8 + WASM (lightweight, in-process) | Full Linux VM (cloud-based) |
| **Cold start** | ~6ms | ~440ms (E2B's own benchmark) |
| **Memory per instance** | ~22MB (simple) to ~131MB (full coding agent) | ~1GB minimum (Daytona) |
| **Cost** | 32x cheaper than sandboxes (self-hosted) | $0.0504/vCPU-h + $0.0162/GiB-h |
| **Capabilities** | Python/JS/Bash in WASM; file access; network proxying | Full Linux desktop; browser; native binaries; internet access |
| **Security model** | WASM sandbox + host tool permissions | VM isolation + firewall |
| **Use case fit** | Fast, cheap, lightweight agent tasks | Browser automation, desktop apps, complex dev workflows |
| **Hybrid model** | Has sandbox *mounting* extension (can spin up E2B on demand) | N/A |

**Verdict:** E2B is the premium sandbox for workloads requiring a full OS (browsers, desktop automation, native compilation). agentOS is 92x faster at cold start and ~8-47x more memory-efficient. Crucially, agentOS *complements* E2B — it has an official sandbox mounting extension that lets you spin up E2B or Daytona on demand when workloads need a full VM. They advertise this hybrid model explicitly.

---

## 3. Daytona Sandbox vs agentOS — Who Should Use Which?

| Dimension | agentOS | Daytona |
|---|---|---|
| **Isolation** | V8 + WASM (in-browser tech) | Full Linux/Windows/macOS VM |
| **Cold start** | ~6ms | <90ms |
| **Cost efficiency** | Very high (self-hosted, ~32x cheaper) | Higher (full VM overhead) |
| **Multi-platform** | Linux only (WASM) | Linux + macOS + Windows |
| **Browser/desktop automation** | ❌ No (requires sandbox mount) | ✅ Yes |
| **Native binary execution** | Limited (WASM compatibility) | ✅ Full |
| **Open source** | ✅ Apache 2.0 | Partial (open-source control plane, but runs on customer-managed cloud) |
| **Typical buyer** | Backend/Platform engineers building agent features | DevOps/ML teams needing secure code execution at scale |

**Verdict:** Daytona is for teams that need multi-OS support, full desktop/browser automation, and are willing to pay for the flexibility. agentOS is for teams that want the fastest/cheapest path for typical agent tasks (file ops, scripting, API calls) and can offload heavy lifting to a mounted sandbox when needed. Daytona has explicit enterprise compliance (HIPAA, SOC 2, GDPR) — agentOS's enterprise story is "air-gapped deployment" but this is less battle-tested.

---

## 4. AWS Lambda vs agentOS for Agent Workloads

| Dimension | agentOS | AWS Lambda |
|---|---|---|
| **Cold start** | ~6ms | 100ms–5s (Python/容器) |
| **Cost (self-hosted)** | ~$0.0000011/s (Hetzner ARM) | $0.0000166667/s (ARM, 128MB) |
| **Agent primitives** | Sessions, transcripts, host tools, cron, queues, ACP | ❌ None |
| **Isolation** | V8 + WASM | Firecracker microVM |
| **Execution time limit** | None (runs in process) | 15 min max |
| **Networking** | Programmable per-agent proxying | VPC, API Gateway |
| **State management** | Built-in SQLite, filesystem persistence | Ephemeral (needs external state) |

**Verdict:** Lambda is a poor fit for agent workloads — it lacks agent primitives, has cold starts that kill interactive agent sessions, and 15-minute execution limits. A more meaningful comparison would be Lambda + a separate agent framework (e.g., LangChain running on Lambda) vs. agentOS. In that case, agentOS wins on latency, cost, and integration depth, but Lambda wins on ecosystem familiarity and managed infrastructure.

---

## 5. Cloudflare Workers AI vs agentOS

| Dimension | agentOS | Cloudflare Workers AI |
|---|---|---|
| **What it does** | Agent runtime/isolation | AI inference at the edge (Llama, Mistral, Stable Diffusion, etc.) |
| **GPU access** | No | Yes (global GPU network) |
| **Agent primitives** | Full (sessions, tools, cron, ACP, multiplayer) | ❌ (just inference API) |
| **Cold start** | ~6ms | <50ms (Workers) |
| **Pricing** | Free self-hosted; optional managed cloud | Per-request inference pricing |
| **Overlap** | Workers AI could be a *tool* called by an agentOS agent | N/A |

**Verdict:** Workers AI is an inference provider — it *runs models*. agentOS is an agent *runtime*. The comparison is like comparing a database to a web server. Workers AI could be a backend tool that an agent calls via agentOS's host tools API. They are complementary.

---

## 6. Key Differentiators That Matter for Developers

1. **Sub-10ms cold starts everywhere** — No other agent runtime claims this. E2B is 440ms, Lambda is 100ms+. This enables truly interactive, session-based agent experiences.

2. **In-process embedding** — agentOS runs *inside* your Node.js process. Your backend can call agent functions directly without network hops or external service calls. This is architecturally different from every other option.

3. **32x cost reduction** — Claimed 32x cheaper than sandboxes based on Hetzner ARM pricing. For high-volume agent workloads, this is significant.

4. **Host tools** — Expose JavaScript functions as CLI commands to agents. Direct binding, near-zero latency, automatic Zod schema → flag generation. This is the integration pattern that makes agentOS backend-friendly.

5. **Hybrid sandbox model** — Rather than asking developers to choose, agentOS explicitly supports mounting E2B/Daytona sandboxes on demand. You get lightweight fast agents + heavy-duty sandboxes on the same architecture.

6. **ACP (Agent Communication Protocol)** — A standardized protocol for agent-editor communication, modeled after LSP. If adopted, enables agent portability across editors (Cursor, VS Code, etc.) and vice versa.

7. **Multiplayer / collaborative agents** — Multiple clients can observe and collaborate with the same agent session in real time. This is a built-in primitive, not an afterthought.

8. **Universal transcript format** — All agent sessions produce the same transcript schema regardless of which agent (Pi, Claude Code, Codex, etc.). Simplifies debugging, auditing, and eval pipelines.

---

## 7. Buyer Persona for agentOS

| Persona | Fit | Why |
|---|---|---|
| **Platform/Backend Engineers** at startups/scale-ups building AI features | ✅ High | Host tools + in-process model + fast cold starts = natural backend integration. No need for a separate agent service. |
| **Solo/Small Team Developers** building AI-powered apps | ✅ Medium-High | Free (Apache 2.0), npm package, works locally. Strong DX. But requires Node.js knowledge. |
| **AI/ML Teams** needing agent infrastructure for coding evals or pipelines | ✅ Medium | Fast session creation enables high-throughput eval pipelines. ACP transcript format is useful for standardized evaluation. |
| **Enterprise** needing HIPAA/SOC 2 compliance | ⚠️ Partial | No certified compliance yet. Enterprise tier offers air-gapped deployment + custom SLAs. Less mature than Daytona/E2B enterprise stories. |
| **DevOps/SRE** looking for sandbox security for untrusted code | ⚠️ Low | WASM sandbox is not the same as VM isolation. Full browser/desktop automation needs a real VM. |

**Primary buyer:** Backend/platform engineers at startups and mid-size companies who are building AI agent features and need a fast, cheap, embeddable runtime. Secondary: AI infra teams at larger companies building eval pipelines or coding agents.

---

## 8. Criticisms and Limitations of the WASM-Only Approach

### Technical Limitations

1. **WASM compatibility boundary** — Not all native code compiles cleanly to WASM. Agents expecting full Linux syscalls will fail. Complex Python packages with C extensions may not work in the WASM environment. agentOS addresses this via sandbox mounting (spins up a real VM when needed), but this undermines the "32x cheaper" cost claim for those workloads.

2. **No real browser / desktop automation** — Headless Chrome, Playwright in a real browser, macOS/Windows desktop control — all require real VMs. The WASM approach cannot do computer-use agents in the true sense. E2B and Daytona explicitly target this.

3. **Single-OS (Linux)** — WASM is Linux-centric. No macOS or Windows agent workloads. Daytona wins here explicitly.

4. **Python via WASM is not native Python** — Running Python inside WASM (via a WASM-compiled interpreter) is not the same performance as native Python. For compute-heavy ML tasks, this is a significant limitation. Modal or raw Lambda would win on raw compute.

5. **V8 isolate constraints** — V8 isolates share the Node.js process. A misbehaving or exploited agent can potentially affect the host process. The WASM sandbox provides isolation, but this is not the same as a separate VM or container boundary.

### Ecosystem/Business Limitations

6. **Small community** — 1,576 GitHub stars (as of April 2026) is modest. For comparison: LangChain has 65k+, Modal has ~18k. A community-driven ecosystem (plugins, tooling, shared agents) is still forming.

7. **JavaScript/TypeScript primary** — The host SDK is Node.js. Python developers must use the agentOS Python execution *inside* the WASM VM, not as the host. This may feel foreign to Python-first AI shops.

8. **New and evolving** — agentOS appears to be in active development (latest commit March 31, 2026). API surfaces may change. Less battle-tested than established sandboxes.

9. **ACP adoption unclear** — The ACP protocol is the standout idea (LSP for agents), but adoption beyond Rivet's own ecosystem is unknown. No major editor (Cursor, Windsurf, VS Code) has announced ACP support publicly. MCP (from Anthropic) is currently the dominant agent protocol.

---

## 9. ACP (Agent Communication Protocol) — Adoption Status

**What it is:** A standardized protocol (JSON-RPC over stdio or HTTP/WS) for communication between code editors/IDEs and coding agents. Designed to solve the LSP problem for agents — decoupling editors from agents.

**Current state:**
- Website: https://agentclientprotocol.com (minimal, under development feel)
- Implemented by: Rivet's own agents (Pi, and agentOS generally)
- Outside Rivet: No confirmed public adopters as of April 2026
- Similar protocols: MCP (Model Context Protocol) from Anthropic is more widely adopted

**Adoption challenges:**
- MCP already has significant mindshare in the AI developer community (Anthropic's Claude is the reference implementation)
- Editors (Cursor, Windsurf, Copilot) have existing agent integrations and no clear incentive to adopt a competing standard
- ACP's scope (editor ↔ agent) is narrower than MCP's scope (agent ↔ tools/data), making ACP potentially a subset of MCP

**Bottom line:** ACP is a compelling idea and the LSP analogy is apt. But it's early and MCP has a head start. Whether ACP gains traction depends on whether other agent frameworks (beyond Rivet) adopt it and whether editors see value in switching.

---

## 10. GitHub Stars, Growth Trajectory, Community Size

### Metrics (as of April 1, 2026)

| Metric | Value |
|---|---|
| GitHub Stars | **1,576** |
| Forks | **64** |
| Open Issues | **0** (all closed or actively managed) |
| Created | February 7, 2024 |
| Last push | March 31, 2026 (active development) |
| Commits in past ~15 months | ~30+ (active recent commit history) |

### Broader Rivet Organization

The `rivet-dev` org (Rivet Gaming, Inc.) has ~90 public repositories. Key repos:
- **rivet** (5,347 stars) — The main Rivet product (game orchestration/digital twin platform)
- **agent-os** (1,576 stars) — The agent OS (this analysis)
- **sandbox-agent** (1,233 stars) — The sandbox mounting SDK (connects agentOS to E2B/Daytona)
- **secure-exec** (748 stars) — Secure code execution SDK
- **antiox** (191 stars) — Antioxidant proxy/caching?

### Growth Assessment

**Speedrun/YC-backed (2024)** — The company went through YC and a16z Speedrun in early 2024. agentOS launched publicly around the same time.

**Active development** — Recent commits daily (as of late March 2026). The team is actively building.

**Community size** — Small but engaged. Discord community exists. GitHub issues are actively managed (0 open). The registry of WASM packages is growing (coreutils, curl, jq, ripgrep, etc. — 20+ packages).

**Limitation** — 1,576 stars is ~2.4% of LangChain's community. The agent runtime space is crowded (see: LangChain/LangGraph, CrewAI, AutoGen, etc.) and those communities are Python-first. agentOS is TypeScript-first and takes a different architectural approach, so direct comparison is tricky.

---

## Summary Matrix

| Competitor | Relationship | Winner when... |
|---|---|---|
| **Modal** | Complementary | You need GPU compute; agentOS embeds in your Modal app |
| **E2B** | Complementary + Competing | Workload needs full Linux VM (browser, desktop, native binaries) |
| **Daytona** | Complementary + Competing | Multi-OS support (macOS, Windows) or enterprise compliance needed |
| **AWS Lambda** | Weak competitor | Never — Lambda is a poor fit for agent workloads |
| **Cloudflare Workers AI** | Complementary | You want edge AI inference as a tool called by agents |
| **Hermes Agent** | Adjacent | Hermes is a Python self-improving agent; agentOS is a runtime for any agent |
| **Claude Code** | Tool | Claude Code runs in agentOS as a supported agent type |

---

## Open Questions for Further Research

1. What is Rivet Cloud's pricing and SLA for managed agentOS? (Page exists but no public pricing)
2. Is ACP actually adopted by any editor besides Rivet's own? Any public announcements?
3. How does agentOS handle agents that require internet access (web browsing, API calls)? What are the network proxy capabilities?
4. What is the actual production deployment story? How does it scale horizontally?
5. Has anyone benchmarked Python execution speed inside agentOS vs native Python?
6. What's the security audit status? Any CVE or third-party security review?
