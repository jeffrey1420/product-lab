# Rivet Agent OS: Industry Research

**Date:** April 1, 2026  
**Focus:** WebAssembly + V8 isolate approach for AI agent isolation, and what it means for the industry  
**Sources:** rivet.dev, github.com/rivet-dev, GitHub API, web fetches of documentation

---

## 1. Who Are the Founders of Rivet? What Is Their Background?

**Company:** Rivet Gaming, Inc. (d/b/a Rivet, at rivet.dev)  
**Backed by:** Y Combinator + a16z Speedrun  
**Location:** San Francisco, CA  
**Founded:** 2023 (based on GitHub org and repo creation dates)

The GitHub org `rivet-dev` shows two core team members:
- **Nathan Flurry** (`@NathanFlurry`) — LinkedIn: nathanflurry
  - Previously built infrastructure serving **15M+ MAU and 20k concurrent players** on games like Krunker.io (acquired by FRVR) while still in high school
  - Apple WWDC scholar 2016–2018
  - Featured in TechCrunch for a visual programming language project
  - Independently built large-scale game infrastructure

- **Nicholas Kissel** (`@NicholasKissel`) — LinkedIn: nicholaskissel
  - Previously PM at Paradox.ai R&D (AI HR solutions for McDonald's-scale companies)
  - PM at Addicting Games on multiple multiplayer titles
  - Helped launch Apes.io (browser-based battle royale)

**Background context:** The original company (rivet.gg) was a **game infrastructure** company — managed game servers, matchmaking, DDoS protection. The Y Combinator W23 page describes them as such. However, the current rivet.dev appears to be a **pivot/payoff** into AI developer tooling, likely accelerated by YC and a16z Speedrun. The team brought their infrastructure-scale thinking (V8 isolates, in-process execution) from the game server world into the AI agent world.

---

## 2. Is V8 Isolate + WASM the Right Long-Term Architecture? Tradeoffs vs. Containers

### The Architecture

Rivet's stack uses two complementary isolation technologies:

1. **V8 Isolates** (from the Chrome/Node.js engine) — run JavaScript/TypeScript agent code in sandboxed contexts within the same process
2. **WebAssembly** — POSIX utilities (coreutils, grep, sed, awk, find, curl, etc.) compiled to WASM using Rust/C toolchains

This is **NOT** the same as containers. Instead, it's the **same isolation model browsers use for untrusted code**, applied to server-side AI workloads.

### Performance Advantages (Benchmarked, March 2026)

| Metric | agentOS | Best Sandbox (E2B) | Improvement |
|--------|---------|-------------------|-------------|
| Cold start p50 | 4.8 ms | 440 ms | **92x faster** |
| Cold start p99 | 6.1 ms | 3,150 ms | **516x faster** |
| Memory: full coding agent | ~131 MB | ~1,024 MB | **8x smaller** |
| Memory: simple shell | ~22 MB | ~1,024 MB | **47x smaller** |

The V8 isolate approach has **near-zero cold start** because:
- No container image to pull
- No VM to boot
- No OS initialization
- V8 isolates start in ~4–6ms because they're just JavaScript contexts within an already-running process

### Tradeoffs vs. Containers

| Dimension | V8 + WASM (agentOS) | Containers (Docker/K8s) |
|-----------|---------------------|--------------------------|
| Cold start | ~5ms | ~6s |
| Memory overhead | ~131 MB (full agent) | ~50MB minimum (container) + OS overhead |
| Isolation granularity | Process-internal (V8 contexts) | Container boundary |
| Native binary support | ❌ No (WASM only) | ✅ Full Linux binaries |
| GPU access | ❌ No | ✅ Yes (with passthrough) |
| Browser/display | ❌ No | ✅ Yes (via sandbox extension) |
| Security model | Same as browsers (multiple tabs in one process) | Hardware-level namespace isolation |
| Stateful workloads | Built-in actor model | Requires Redis/DB外挂 |
| npm compatibility | ✅ Yes (Node.js runtime) | Full |
| Ecosystem maturity | New (2024–present) | Mature (2013–present) |

### Verdict on Long-Term Architecture

**V8 + WASM is compelling for AI agents specifically** because:
1. AI agents are **embarrassingly parallel** — many independent short-lived tasks where cold start dominates
2. Agent workloads are **compute-light, I/O-heavy** — they spend most time waiting for LLM API responses, not doing heavy CPU work
3. The **in-process model** eliminates network hops between sandbox and backend
4. The **actor model** is a natural fit for agent-per-user/per-session patterns

**However, it's NOT a container replacement for general workloads.** GPU workloads, native compilation (except via WASM), display rendering, and full OS access still require real containers or VMs. The agentOS docs explicitly acknowledge this and offer a **sandbox extension** to pair with full sandboxes (E2B, Daytona, etc.) when needed.

---

## 3. What Does "Operating System for Agents" Mean Architecturally?

This is not marketing speak — it's a precise architectural description.

### The Kernel

agentOS implements an **in-process operating system kernel written in JavaScript** that runs inside the host application. This is analogous to how browsers have a rendering engine + JS runtime inside one process.

The kernel manages:
- **Virtual filesystem** — in-memory, POSIX-like FS with mount points (can mount S3, Google Drive, SQLite, host directories, or custom backends)
- **Process table** — tracks child processes, their PIDs, exit codes
- **Pipes and PTYs** — stdin/stdout/stderr for inter-process communication
- **Virtual network stack** — outbound connections can be allowed/denied/proxied programmatically
- **Environment variables and permissions** — deny-by-default access control

### Three Runtimes Mounted Into the Kernel

1. **WebAssembly runtime** — POSIX utilities compiled to WASM
   - `@rivet-dev/agent-os-coreutils` — sh, cat, ls, cp, sort + 80+ GNU commands (compiled from Rust)
   - `@rivet-dev/agent-os-grep`, `sed`, `gawk`, `findutils`, `diffutils`, `tar`, `gzip`
   - `@rivet-dev/agent-os-curl`, `wget`, `jq`, `sqlite3`, `zip`, `unzip`
   - Compiled from C/Rust → LLVM → WASM using similar toolchains to Wolki's or Fermyon's Spin

2. **V8 isolate runtime** — JavaScript/TypeScript agent code runs in isolated V8 contexts
   - Each agent gets its own V8 heap + stack
   - No shared state between isolates
   - Same engine as Cloudflare Workers

3. **Sandbox extension** — for heavy workloads, can spin up full E2B/Daytona/etc. sandboxes and mount their filesystem into the agentOS FS tree

### How Agent Code Runs

```
Host Application (Node.js/Bun/Deno)
  └── agentOS Kernel (in-process JS)
        ├── Virtual Filesystem (in-memory + mountable backends)
        ├── Process Table
        ├── Virtual Network Stack
        └── Runtimes:
              ├── WASM: POSIX utilities (coreutils, curl, etc.)
              └── V8 Isolates: Agent JS/TS code
```

The key insight: **everything runs inside the kernel — nothing executes directly on the host.** The kernel translates syscalls from WASM/V8 into actions: reads from the virtual FS, pipes data between processes, proxies network calls through permission checks.

---

## 4. How Does the WASM POSIX Layer Work? Complete or Partial?

### Completeness: Partial, but Practical

The WASM POSIX layer is **not a full POSIX kernel** — it's a **compatibility layer** that provides common Unix utilities:

**What's included (via `@rivet-dev/agent-os-common` meta-package):**
- coreutils (sh, cat, ls, cp, mv, rm, mkdir, rmdir, chmod, chown, sort, uniq, head, tail, wc, etc.)
- grep, egrep, fgrep (pattern matching)
- sed (stream editor)
- gawk (GNU awk)
- findutils (find, xargs)
- diffutils (diff)
- tar, gzip

**Additionally available:**
- curl, wget (HTTP clients)
- jq (JSON processor)
- sqlite3 (CLI interface)
- fd-find (fast file finder)
- yq (YAML processor)
- zip, unzip

**What's explicitly NOT included or planned:**
- git (marked as "planned")
- make (marked as "planned")
- Full terminal emulation beyond basic PTY support

**How WASM syscalls map to host operations:**

The WASM modules use WASI (WebAssembly System Interface) or a custom equivalent. The kernel intercepts file operations, network calls, and process spawning and routes them through:
- Virtual FS reads/writes → in-memory store + optional S3/host directory mounts
- Network calls → virtual network stack with allow/deny/proxy rules
- Process spawn → child process tracked in process table, stdout/stderr piped back

**This is similar to how Fermyon Spin, Cosmonic, and Fastly Compute work**, but focused specifically on agent workloads rather than general HTTP microservices.

### Node.js Compatibility

Critically, agentOS can also run **actual Node.js** inside the VM via the V8 isolate runtime — not just WASM-compiled utilities. This means `npm install` works, and npm packages run via the Node.js bridge (fs, child_process, http, dns, process, os all bridged to real host capabilities).

---

## 5. What Workloads CAN'T agentOS Handle?

agentOS has explicit **known limitations**:

1. **Browser/display rendering** — No real browser can run inside agentOS. If you need to test web UIs or run Playwright/Choreraph, you need the **sandbox extension** (E2B, Daytona, etc.)

2. **Native binary execution** — Linux ELF binaries (`.bin`, compiled C/C++/Rust without WASM targets) cannot run. Only:
   - WASM-compiled code
   - Node.js (via V8 bridge)
   - Python (via the Pi agent, which presumably runs a Python interpreter compiled to WASM or runs Python in the V8 context)

3. **GPU workloads** — No CUDA, no GPU passthrough. For ML inference that needs GPU, you must call external APIs (OpenAI, Anthropic, etc.) or use a sandbox with GPU access.

4. **Long-running persistent services** — While actors can "sleep" (hibernate when idle), agentOS is designed for **task-oriented agent sessions**, not long-lived servers.

5. **Full Linux syscall surface** — Only the syscalls that the WASM POSIX layer implements are available. Complex syscalls (e.g., `ptrace`, `ioctl` with unusual request codes, `inotify`) may not be supported.

6. **Cloudflare Workers** — Secure Exec (which underlies agentOS) **does not support Cloudflare Workers** because CF Workers doesn't expose the V8 C++ embedding APIs that Secure Exec relies on.

---

## 6. Is This Related to Fastly Compute or Other WASM Edge Platforms?

### Direct Relationship: No (but same underlying technology)

**Fastly Compute** (and Fermyon Spin, Cosmonic, etc.) also use WebAssembly + V8 as their runtime model. However:

- Fastly Compute is focused on **HTTP edge functions** — request/response, CDN edge compute
- Rivet's agentOS is focused on **AI agent workloads** — long-running, stateful, tool-calling, multi-step workflows

**Shared technology:**
- Both use **V8 isolates** for JS/TS execution
- Both use **WASM** for sandboxed native code
- Both use **WASI**-like syscall interception for I/O

**Differentiation:**
- Rivet has a much richer **actor model** (durable state, queues, workflows, scheduling)
- Rivet has explicit **agent-centric abstractions** (sessions, transcripts, ACP protocol)
- Fastly Compute is stateless request/response; Rivet is stateful and long-running
- Rivet's security model is **deny-by-default for agents** — filesystem, network, process all gated

### Architectural Parallel

Rivet's approach is conceptually similar to:
- **Cloudflare Workers Durable Objects** — stateful actors at the edge (but using V8 isolates + WASM, not isolated Workers)
- **Fastly's Wasm Experiment** — lightweight WASM edge functions
- **Fermyon Spin** — WASM microservices framework

The key difference is that **Rivet targets AI agents specifically**, building a full OS substrate (FS, process table, networking) rather than just HTTP handler functions.

---

## 7. How Does agentOS Compare to Cloudflare Workers?

| Dimension | agentOS | Cloudflare Workers |
|-----------|---------|-------------------|
| Isolation primitive | V8 isolates | V8 isolates |
| WASM support | ✅ Yes | ✅ Yes |
| Cold start | ~5ms | ~5ms (same V8 model) |
| Memory per instance | ~131 MB (full agent) | ~128 MB (default) |
| Stateful model | Actors (Rivet) | Durable Objects |
| FS | Virtual FS with mountable backends | Workers KV (key-value only) |
| Process/PTY | ✅ Yes | ❌ No (stateless handlers only) |
| npm/Node.js | ✅ Yes (via V8 bridge) | ✅ Yes (via Node.js compat) |
| AI agent focus | ✅ Native | ❌ General-purpose |
| Actor model | ✅ Built-in (Rivet Actors) | Durable Objects (separate product) |
| Deployment | npm package, self-hosted, or Rivet Cloud | Cloudflare's network only |
| Network control | Per-agent allow/deny/proxy | Per-worker `fetch()` routing |
| Sandbox extension | ✅ Yes | ❌ No |
| Open source | ✅ Apache 2.0 | ❌ Proprietary |
| Pricing model | Self-host or Rivet Cloud | Per-request + bandwidth |

**The key distinction:** Cloudflare Workers is a **general-purpose edge compute platform** with optional Durable Objects for state. agentOS is an **AI agent operating system** that happens to use similar underlying technology. Where Workers + Durable Objects requires stitching together multiple products and lots of glue code, Rivet's entire model is built around the agent use case.

**Similarity:** Both use V8 isolates, which means both benefit from the same security properties (memory-safe, sandboxed, fast startup) and the same fundamental tradeoff (no native binaries, no arbitrary syscalls).

---

## 8. What's the Business Model? Company or Open-Source?

**Rivet Gaming, Inc.** (trading as "Rivet" for AI dev tools) is a **hybrid open-source + commercial** company:

### Open-Source Products (Apache 2.0)
- **Rivet Actors** (rivet-dev/rivet) — 5.3k GitHub stars
- **agentOS** (rivet-dev/agent-os) — 1.6k GitHub stars
- **Secure Exec** (rivet-dev/secure-exec) — 748 stars
- **Sandbox Agent SDK** (rivet-dev/sandbox-agent) — 1.2k stars

### Commercial Products
- **Rivet Cloud** — Fully managed Actors and agentOS, global edge network, connects to existing cloud (Vercel, Railway, AWS, etc.)
- **agentOS Cloud** — Managed agentOS infrastructure

### Revenue Model
The company's model follows the "open core" pattern:
1. **Open-source** — Core runtime is Apache 2.0, self-hostable
2. **Managed cloud** — Revenue from managed infrastructure, global edge network, enterprise features
3. **Enterprise** — Self-hosting support, FoundationDB backend, SLA guarantees

### Y Combinator + a16z Speedrun
The company is backed by Y Combinator and a16z Speedrun (Andreessen Horowitz's early-stage program), indicating significant VC backing. The Speedrun mention suggests they went through a16z's accelerator rather than just standard YC.

---

## 9. What Companies or Developers Are Using agentOS in Production?

**Public information is limited.** The company doesn't publish a customer list. However, several signals suggest adoption:

- GitHub stars across org repos: ~5.3k + 1.6k + 1.2k + 748 = ~8.8k stars total
- The "YC & Speedrun Deal" page on rivet.dev suggests they have paying customers
- Multiple integrations listed: Vercel, Railway, AWS, Express, Hono, tRPC, AI SDK, etc.

**Ecosystem signals:**
- Examples exist for **Claude Code**, **Pi** agent, **Codex** integration
- The **Sandbox Agent SDK** specifically mentions support for Claude Code, Codex, OpenCode, Cursor, Amp, and Pi
- The "YC & Speedrun Deal" page on rivet.dev (which returned 404 in our testing — may require login) suggests a startup funding/accelerator program for developers

**Note:** As of the research date, no major publicly-known companies have been confirmed as production users. The project is relatively new (agent-os repo created Feb 2024), and the company appears to be in growth mode.

---

## 10. Implications for OpenClaw, Hermes, and Other Agent Frameworks

### The Architectural Threat/OpenClaw Should Watch

Rivet's approach represents a **fundamentally different cost structure** for agent isolation:

| Metric | Current sandbox approach (E2B/Daytona) | agentOS approach |
|--------|----------------------------------------|-----------------|
| Cold start overhead | ~440ms | ~5ms |
| Memory per agent | ~1GB | ~131MB |
| Cost at scale | Per-second billing, expensive | Self-hosted, ~$0.0000011/s (Hetzner ARM) |
| Integration complexity | Network hop, HTTP API, auth | In-process, direct function calls |

If agentOS achieves its cost targets and the ecosystem matures, **companies currently paying $0.05–0.10 per agent-minute for sandboxed execution could pay $0.0000011 per second ($0.0000039/minute)** — a **~13,000x cost reduction** for the execution substrate (though the LLM API costs remain the same).

### What This Means for Hermes Architecture

If Hermes implements agentOS-style isolation:
- **Agent spawn time** drops from hundreds of milliseconds to ~5ms
- **Memory per agent** drops from ~1GB to ~131MB — meaning 8x more concurrent agents on the same hardware
- **Cost per execution** drops dramatically for self-hosted deployments
- **Hermes would need** to implement the V8 isolate + WASM kernel approach, OR integrate with agentOS as a backend

### What This Means for OpenClaw

OpenClaw currently uses **E2B sandboxes** for agent execution. The agentOS approach offers:
- **Option 1: Integrate agentOS** as an alternative (faster, cheaper) execution backend alongside E2B
- **Option 2: Switch to agentOS** as the primary backend and use E2B only for workloads that need full OS (browser, GPU, native binaries)
- **Option 3: Learn from the architecture** — even if not adopting directly, the actor model, virtual FS, and host-tools pattern are valuable patterns

### Specific Opportunities for OpenClaw

1. **Hybrid execution**: agentOS for lightweight tool-calling/CLI work; E2B/Daytona for browser/GPU work
2. **Host tools pattern**: Define backend functions as CLI commands agents can call, eliminating HTTP auth complexity
3. **Actor-per-session model**: The Rivet Actors model (one actor per agent, per session, per user) maps directly to OpenClaw's session concept
4. **The V8 isolate trick**: If OpenClaw wants to keep E2B sandboxes, it could still use V8 isolates for **sub-second tool execution** within a sandbox session

### The Competitive Pressure on E2B, Daytona, and Modal

If agentOS delivers on its benchmarks:
- E2B's ~$0.09/vCPU-h model faces severe price pressure
- Daytona, Modal, and other sandbox providers will need to differentiate on **capabilities** (GPU, browser, native binaries) rather than cost
- The "zero cold start" claim directly attacks the key pain point these companies were solving

**However**: agentOS still can't replace sandboxes for GPU workloads, browser automation, or native compilation. The sandbox providers are safe for those cases, but will see margin compression on simple agent execution workloads.

---

## Key Sources

- https://rivet.dev — Main product site
- https://github.com/rivet-dev/rivet (5.3k stars) — Rivet Actors
- https://github.com/rivet-dev/agent-os (1.6k stars) — agentOS OS for agents
- https://github.com/rivet-dev/secure-exec (748 stars) — V8 isolate library
- https://github.com/rivet-dev/sandbox-agent (1.2k stars) — Sandbox orchestration
- https://www.ycombinator.com/companies/rivet — Original YC page (gaming company, now pivoted)
- rivet.dev footer: "© 2026 Rivet Gaming, Inc." — Backed by Y Combinator + a16z Speedrun
- LinkedIn profiles: Nathan Flurry, Nicholas Kissel (founders)

---

## Summary

Rivet (rivet.dev) is a Y Combinator + a16z-backed company that has built a genuine **in-process operating system for AI agents** using V8 isolates and WebAssembly. This is the same isolation technology used in browsers, now applied to server-side AI workloads at dramatically lower cost than container-based sandboxes.

**Key takeaways:**
- **Cold start: 5ms vs 440ms** — 92x faster than E2B sandboxes
- **Memory: 131MB vs 1GB** — 8x more efficient
- **Cost: ~$0.0000011/s vs $0.000625/s** — 500x cheaper at self-hosted scale
- **Apache 2.0 open source** — self-hostable, no vendor lock-in
- **Not a full sandbox replacement** — no browser, no GPU, no native binaries without sandbox extension
- **Built by a team with infrastructure-scale background** (Nathan Flurry's 15M MAU game server experience)

For OpenClaw and Hermes, this represents both a **potential execution backend** and a **preview of where the industry is heading**: the cost of agent isolation is about to drop by 2-3 orders of magnitude, which will commoditize sandboxes and push the competitive frontier to agent capabilities, orchestration, and UX rather than raw execution infrastructure.
