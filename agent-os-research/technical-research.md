# Rivet Agent OS — Technical Architecture Research

**Last updated:** 2026-04-01
**Sources:** rivet.dev, github.com/rivet-dev/agent-os, secureexec.dev, agentclientprotocol.com, GitHub API

---

## 1. Who Is Rivet? Company Background

### Company Identity

- **Legal name:** Rivet Gaming, Inc.
- **Headquarters:** San Francisco, CA
- **Website:** rivet.dev
- **Founded:** Y Combinator W23 (Winter 2023 batch), also part of a16z Speedrun SR002
- **Founders:** Not publicly named in easily discoverable sources; the team has a background in real-time multiplayer infrastructure (they previously built microgravity.io, a 2D space shooter IO game)

### Funding & Backing
- **Y Combinator W23** — confirmed on startup deal page
- **a16z Speedrun SR002** — confirmed on startup deal page
- 50% off Rivet Cloud for 12 months for YC and a16z Speedrun companies

### Other Products in the Ecosystem

| Product | Description |
|---|---|
| **Rivet Actors** | Long-running, lightweight processes for stateful workloads. State lives in-memory with automatic persistence. The broader platform that hosts agentOS. |
| **agentOS** | A portable open-source OS for AI agents. The primary subject of this research. |
| **Secure Exec** (`secure-exec`) | The foundational sandboxing library: V8 isolate–based secure Node.js execution. agentOS builds on this. |
| **Sandbox Agent SDK** | Run coding agents in full sandboxes (E2B, Daytona, Vercel, Docker, Cloudflare) and control them over HTTP. |
| **RivetKit** | The TypeScript client library. Connects to Rivet Cloud or self-hosted deployments. |
| **Rivet Cloud** | Fully managed hosting (BYOC or their edge network). |

The company is primarily building infrastructure primitives for AI agents and stateful workloads. agentOS is one layer of this stack.

---

## 2. V8 Isolate + WebAssembly Architecture — How It Actually Works

### Conceptual Model

agentOS is **not** a container or VM. It is an **in-process operating system kernel written in JavaScript**, running inside a Node.js (or Bun) host process.

The kernel manages:
- A **virtual filesystem** (with mount drivers)
- A **process table** (spawning/managing child processes)
- **Pipes and PTYs** (inter-process communication)
- A **virtual network stack** (proxying outbound connections)

Three "runtimes" mount into this kernel:

```
┌─────────────────────────────────────────┐
│          Host Process (Node.js)          │
│  ┌─────────────────────────────────────┐ │
│  │     agentOS Kernel (JS)              │ │
│  │                                      │ │
│  │  ┌──────────┐  ┌──────────────────┐ │ │
│  │  │ V8 Isolate│  │ WASM Runtime      │ │ │
│  │  │(Agent Code)│ │ (POSIX utilities) │ │ │
│  │  └──────────┘  └──────────────────┘ │ │
│  │                                      │ │
│  │  Virtual FS │ Process Table │ Network │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### V8 Isolates — The Agent Code Runtime

The agent code (Pi, Claude Code, etc.) runs inside **V8 isolates**. This is the same isolation primitive used by:
- Every Chromium tab (Chrome, Edge, Brave, etc.)
- Cloudflare Workers for Platforms

Each isolate has:
- Its **own heap and stack** (~3.4 MB overhead per concurrent execution)
- **No shared state** with other isolates or the host
- Deny-by-default permission boundaries for FS, network, and processes
- **No syscalls bound to the host** by default

This is fundamentally different from containers:
- Containers virtualize the **entire OS** (Linux kernel, syscalls, hardware)
- V8 isolates run in the **same process** as the host, sharing the same V8 engine

The V8 isolate layer uses the `secure-exec` library, which Rivet also open-sourced separately.

### WebAssembly — The POSIX Utilities Runtime

Standard Unix tools (coreutils, grep, sed, git, curl, etc.) are **compiled to WebAssembly** (from Rust or C source) and mounted as WASM packages. These are **not** running in V8 — they run in a separate WASM runtime managed by the kernel.

WASM packages include:
- `@rivet-dev/agent-os-coreutils` — sh, cat, ls, cp, sort + 80+ GNU coreutils commands
- `@rivet-dev/agent-os-grep`, `@rivet-dev/agent-os-sed`, `@rivet-dev/agent-os-gawk`
- `@rivet-dev/agent-os-git` (planned)
- `@rivet-dev/agent-os-curl`, `@rivet-dev/agent-os-wget`
- `@rivet-dev/agent-os-jq`, `@rivet-dev/agent-os-yq`
- `@rivet-dev/agent-os-sqlite3`
- `@rivet-dev/agent-os-tar`, `@rivet-dev/agent-os-gzip`, `@rivet-dev/agent-os-zip`, `@rivet-dev/agent-os-unzip`
- `@rivet-dev/agent-os-ripgrep`, `@rivet-dev/agent-os-fd-find`, `@rivet-dev/agent-os-findutils`, `@rivet-dev/agent-os-diffutils`

These are pre-compiled to WASM from their original C/Rust sources. The agent interacts with them as if they were CLI commands running in a Unix shell.

### The Kernel Bridge

The JS kernel acts as a **system bridge**. When agent code calls a WASM-compiled tool (e.g., `grep`), the kernel:
1. Locates the WASM module
2. Sets up the virtual filesystem for the command's working directory
3. Pipes stdout/stderr back to the kernel
4. Returns the exit code

Host tools (custom JS functions exposed to the agent) follow the same pattern but call back to the host process through a permission-gated bridge.

### Why Not Pure WASM?

The architecture uses V8 for agent code specifically because:
1. **Performance**: V8 uses native JIT compilation (TurboFan). WASM-only runtimes like QuickJS run through an interpreter inside WASM — there's an interpretation overhead layer.
2. **npm compatibility**: Node.js APIs (fs, child_process, http, dns, process, os) are bridged to real host capabilities, not stubbed. Pure WASM runtimes don't have this.
3. **Node.js ecosystem**: Agents and tools can `require()` or `import` npm packages directly.

The secure-exec README explicitly addresses this:
> "WASM-based runtimes like QuickJS compile a separate JS engine to WebAssembly, which means your code runs through an interpreter inside WASM — not native V8."

### Host Tools (Tool Calling)

The "host tools" pattern lets your backend expose JavaScript functions to the agent as CLI-style commands. Example:

```typescript
const weatherToolkit = toolKit({
  name: "weather",
  tools: {
    get: hostTool({
      description: "Get the current weather for a city.",
      inputSchema: z.object({ city: z.string() }),
      execute: async ({ city }) => ({ temperature: 18, conditions: "partly cloudy" }),
    }),
  },
});
// Agent calls: agentos-weather get --city London
```

Tools are injected into the agent's system prompt automatically. No network hops, no complex auth.

---

## 3. The ACP (Agent Communication Protocol)

### What Is It?

ACP is a **standardized protocol for communication between code editors/IDEs and coding agents**, similar to how the Language Server Protocol (LSP) standardized language server integration.

**Specification:** https://agentclientprotocol.com

### Key Design Decisions

- **For local agents:** JSON-RPC over stdio (agent runs as a subprocess of the editor)
- **For remote agents:** HTTP or WebSocket (agent hosted on cloud/separate infrastructure)
- **Reuses MCP JSON representations** where possible, with custom types for agentic coding UX elements (like displaying diffs)
- **Default format:** Markdown for user-readable text

### Goals

- Decouple agents from editors — agents implementing ACP work with any ACP-compatible editor
- Decouple editors from agents — editors supporting ACP gain access to the full ACP agent ecosystem
- Create a common transcript format across all agents for debugging, auditing, and comparison

### Openness

The protocol is **open** and documented at agentclientprotocol.com. It is editor-agnostic and agent-agnostic. The name "ACP" is shared with but distinct from Anthropic's MCP (Model Context Protocol) — ACP targets the editor-agent communication layer specifically.

### Session Management in agentOS

agentOS sessions use ACP as their underlying transport. Sessions support:
- Create, manage, resume over ACP
- Universal transcript format across all agent types
- Automatic persistence in SQLite across sleep/wake cycles
- Real-time streaming via `sessionEvent` subscriptions
- Sequence numbers for reconnection and event replay

Currently only **Pi** (a local coding agent by mariozechner, @rivet-dev/agent-os-pi) is supported as an agent in agentOS. Support for Amp, Claude Code, Codex, and OpenCode is listed as "coming soon."

---

## 4. Real-World Performance Benchmarks

> **Note:** All benchmarks listed here are from Rivet's own marketing materials and the secure-exec library, not independently verified by third parties. The methodology is documented but self-reported.

### Cold Start (agentOS vs E2B sandbox)

| Percentile | agentOS | E2B (Fastest Sandbox) | Speedup |
|---|---|---|---|
| p50 | 4.8 ms | 440 ms | **92x** |
| p95 | 5.6 ms | 950 ms | **170x** |
| p99 | 6.1 ms | 3,150 ms | **516x** |

**Methodology (self-reported):**
- agentOS: median of 10,000 runs on Intel i7-12700KF
- Sandbox: E2B
- March 2026

### Cold Start (Secure Exec library — more granular)

Secure Exec (the underlying library, ~14ms for full V8 isolate creation):

| Batch Size | Sequential p50 | Sequential p95 | Sequential p99 |
|---|---|---|---|
| 1 | 14.9 ms | 15.3 ms | — |
| 50 | 14.3 ms | 16.6 ms | 18.1 ms |
| 100 | 14.4 ms | 16.2 ms | 17.9 ms |
| 200 | 14.3 ms | 16.1 ms | 19.6 ms |

Warm start (V8 isolate reused, fresh context):
- Sequential: **~3 ms** (5x faster than cold start — the ~11ms delta is V8 isolate creation cost)

### Memory per Instance

| Workload | agentOS | Daytona (Cheapest Sandbox) |
|---|---|---|
| Full coding agent | ~131 MB | ~1,024 MB |
| Simple shell command | ~22 MB | ~1,024 MB |

Secure Exec library: **~3.4 MB per concurrent execution** (measured via RSS delta)

Sandbox minimum: 256 MB (smallest among Modal, Cloudflare Containers, E2B, Daytona as of March 2026)

### Self-Hosted Cost (agentOS)

| Hardware | Cost/sec | vs Daytona Sandbox |
|---|---|---|
| Hetzner ARM | ~$0.0000011/s | 17x cheaper |
| Hetzner x86 | ~$0.0000013/s | 14x cheaper |
| AWS ARM | ~$0.0000032/s | 6x cheaper |
| AWS x86 | ~$0.0000053/s | 3x cheaper |

**Sandbox baseline:** Daytona at $0.0504/vCPU-h + $0.0162/GiB-h. Self-hosted assumes 70% utilization.

### Secure Exec Cost vs Cloudflare Containers

| Hardware | Secure Exec | Cheapest Sandbox ($0.000625/s) |
|---|---|---|
| Hetzner ARM | $0.0000016/s | **380x cheaper** |
| Hetzner x86 | $0.0000027/s | **232x cheaper** |
| AWS ARM | $0.000011/s | 56x cheaper |
| AWS x86 | $0.000014/s | 45x cheaper |

### Independent Verification

The secure-exec benchmarks are the most granular available. Key observations:
- Methodology is documented (hardware: Intel i7-12700KF, 12 cores/20 threads, Linux 6.x, Node.js v24.13.0)
- Scripts are publicly available: `git clone https://github.com/rivet-dev/secure-exec && ./benchmarks/run-benchmarks.sh`
- No third-party security audits are publicly listed
- No independent competitive benchmarks from E2B, Daytona, or Modal were found

---

## 5. Developer Experience

### Getting Started

```bash
npm install @rivet-dev/agent-os-core @rivet-dev/agent-os-common @rivet-dev/agent-os-pi
```

```typescript
import { AgentOs } from "@rivet-dev/agent-os-core";
import common from "@rivet-dev/agent-os-common";
import pi from "@rivet-dev/agent-os-pi";

const vm = await AgentOs.create({ software: [common, pi] });
const { sessionId } = await vm.createSession("pi", {
  env: { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY! },
});
vm.onSessionEvent(sessionId, (event) => console.log(event));
await vm.prompt(sessionId, "Write a hello world script to /home/user/hello.js");
const content = await vm.readFile("/home/user/hello.js");
console.log(new TextDecoder().decode(content));
vm.closeSession(sessionId);
await vm.dispose();
```

### Strengths

1. **Zero infrastructure for local dev:** `npx rivetkit dev` runs agents locally with no servers or containers needed
2. **npm install only:** No Docker daemon, no hypervisor, no vendor account required
3. **Works anywhere Node.js runs:** Tested on Linux, macOS; works on Railway, Vercel, AWS Lambda, self-hosted
4. **Single API surface:** Unified API for Pi, Claude Code, Codex, OpenCode, Amp (once available)
5. **Multiplayer:** Multiple clients can observe and collaborate with the same agent in real-time
6. **Cron, webhooks, queues:** Built-in primitives for scheduling and event-driven workflows
7. **Workflows:** Durable workflows with retries, branching, and resumable execution
8. **RivetKit abstractions:** `agentOs()` and `setup()` pattern makes embedding into a backend straightforward

### Weaknesses / Open Questions

1. **Beta status:** The docs explicitly state "agentOS is in beta and still undergoing security review"
2. **Limited agent support:** Only Pi is currently shipping; Claude Code, Codex, OpenCode, Amp are listed as "coming soon"
3. **Documentation gaps:** Some architecture pages return 404 (e.g., `/docs/agent-os/architecture` link is broken; the actual architecture description lives in the README)
4. **Small community:** Discord community appears active but GitHub stars on the main repo (~not publicly visible without browsing) suggest relatively early adoption
5. **No IDE integration docs:** There's no clear documentation for integrating agentOS into VS Code, Cursor, or other editors beyond the ACP protocol spec

### Community

- **Discord:** https://rivet.dev/discord (primary community channel)
- **GitHub:** https://github.com/rivet-dev/agent-os (Apache 2.0)
- **GitHub org:** 15+ public repos including `rivet` (main platform), `secure-exec`, `sandbox-agent`, `antiox` (Rust/Tokio-like async for TS), and various templates

---

## 6. Security Audits & CVE History

### Security Model Summary

agentOS operates with two trust boundaries:

1. **Runtime boundary:** The VM isolate that runs agent code. All code inside is untrusted. The V8 isolate prevents access to the host process, host filesystem, and host network.
2. **Host boundary:** The application code configuring and managing the VM. The host is responsible for hardening, input validation, and secret management.

Default security posture:
- **No syscalls bound to the system by default**
- Network access, filesystem mounts, process spawning: all denied until explicitly opted in
- V8 isolate + WASM isolation (each actor runs in its own VM)
- Virtual filesystem: agents cannot access host files unless explicitly mounted
- Virtual network: no direct host network access; outbound requests are proxied
- Resource limits (CPU, memory) enforced at VM level

### Audit Status

- **No third-party security audit has been publicly disclosed** for agentOS or secure-exec
- The security model documentation explicitly states: "agentOS is in beta and still undergoing security review. The security model described here is subject to change."
- No CVEs are listed in the GitHub advisories for `rivet-dev/agent-os` or `rivet-dev/secure-exec`

### Host Hardening Responsibilities

The host is responsible for:
- Hardening the host process and deployment environment
- Validating authentication tokens in `onBeforeConnect`
- Scoping permissions appropriately for the use case
- Managing API keys/secrets on the host side (the LLM gateway pattern avoids passing keys into the VM)

### Notable Security Considerations

**V8 isolate vs container security:** V8 isolates do NOT provide the same isolation guarantees as containers or VMs. Since code runs in the same process as the host:
- A kernel bug in the V8 engine could potentially allow escape
- The "deny-by-default" permission model is only as strong as the implementation
- This is the same risk model as Cloudflare Workers — accepted for many workloads but not for high-security environments requiring formal verification

**Comparison to container isolation:**
- Containers: Linux kernel namespaces + cgroups + seccomp + SELinux/AppArmor
- V8 isolates: JavaScript heap separation, no syscalls, no host file access

---

## 7. Rivet Cloud — How It Works & Pricing

### Deployment Options

| Option | Description | Best For |
|---|---|---|
| Local Dev | `npx rivetkit dev` — no infrastructure | Development and testing |
| Rivet Cloud (BYOC) | Managed hosting, bring your own cloud | Teams wanting zero-ops |
| Rivet Self-Hosted | Single Rust binary or Docker + Postgres/FoundationDB | Full control |
| Rivet Enterprise | Self-hosted + dedicated support + custom SLAs | Regulated industries |
| agentOS Core directly | Use `@rivet-dev/agent-os-core` without the full Rivet platform | Custom integrations |

### Pricing Model

Rivet Cloud charges for **coordination and state**, not compute (compute is BYO, paid to your cloud provider).

#### Plans

| Plan | Price | Includes |
|---|---|---|
| Free | $0/mo | 100k awake actor-hours/mo, 5GB storage, 5M writes/mo, 200M reads/mo, 100GB egress |
| Hobby | From $20/mo + usage | 400k actor-hours, 25B reads, 50M writes, 5GB, 1TB egress |
| Team | From $200/mo + usage | Same as hobby + MFA, Slack support |
| Enterprise | Custom | Priority support, SLA, OIDC SSO, audit logs, custom roles |

#### Usage Overage Pricing

| Resource | Price |
|---|---|
| Awake Actors | $0.05 per 1k awake actor-hours |
| State Storage | $0.40 per GB-month |
| Reads | $0.20 per million |
| Writes | $1.00 per million |
| Egress | $0.15 per GB |
| Compute | BYO (paid to your provider) |

### Startup Deal

50% off for 12 months for Y Combinator and a16z Speedrun companies.

---

## 8. WASM-Only vs V8 Isolate Approaches — Technical Comparison

### Pure WASM Runtimes (e.g., WasmEdge, QuickJS via quickjs-emscripten)

| Aspect | Details |
|---|---|
| **Isolation model** | WASM memory sandbox — linear memory, no pointer arithmetic outside bounds, no syscalls |
| **Formal properties** | WASM has formal memory safety guarantees; some proofs exist |
| **Performance** | Interpretation overhead: JS engines run inside WASM run through an interpreter |
| **npm compatibility** | Limited; Node.js APIs are not natively available |
| **Binary size** | Can be smaller for simple scripts |
| **Use cases** | Plugins, extensions, untrusted user code requiring strong isolation |

### V8 Isolates (agentOS / secure-exec approach)

| Aspect | Details |
|---|---|
| **Isolation model** | V8 heap separation, no shared state, deny-by-default permissions |
| **Formal properties** | No formal verification; relies on V8's decades of browser security hardening |
| **Performance** | Native JIT compilation via TurboFan — full host speed |
| **npm compatibility** | Full Node.js core API compatibility (fs, child_process, http, dns, os, process bridged to host) |
| **Binary size** | V8 engine is large (~20-30MB), but shared across all isolates in a process |
| **Use cases** | AI agent tool execution, code evaluation, dev servers, MCP tool execution |

### Direct Comparison

| Property | WASM-only | V8 Isolate |
|---|---|---|
| **Isolation strength** | Stronger (formal memory model) | Moderate (relies on V8 implementation) |
| **Execution speed** | Slower (interpreter) | Faster (native JIT) |
| **npm support** | Limited/complex | Full |
| **Cold start** | Comparable | ~14ms (Secure Exec) |
| **Memory overhead** | Low | ~3.4 MB per execution |
| **Attack surface** | WASM runtime only | V8 + WASM (two runtimes) |
| **Node.js compatibility** | Needs polyfills | Native via bridge |
| **Kernel bypass risk** | Lower | Higher (kernel is JS, more complex) |

### agentOS's Hybrid Approach

agentOS specifically uses V8 for **agent code** (needing npm compatibility and speed) and WASM for **POSIX utilities** (already compiled to WASM from C/Rust, no need for V8 overhead). This is a pragmatic design choice:
- You get Node.js ecosystem compatibility for the agent
- You get lightweight, portable POSIX tools without shipping a full Linux environment
- The kernel handles routing between the two

### When to Use What

| Use Case | Recommended Approach |
|---|---|
| Untrusted user-submitted JavaScript with strong isolation needs | Pure WASM (WasmEdge, QuickJS) |
| AI agent tool execution (npm packages needed, speed critical) | V8 isolates (secure-exec, agentOS) |
| Running full Linux binaries or complex native code | Container sandbox (E2B, Daytona) |
| High-security environments requiring formal verification | WASM-only or containers with seccomp |
| General-purpose agent infrastructure | V8 isolates (agentOS) — better DX, better performance |

---

## Summary

Rivet Agent OS represents a genuinely novel approach to agent infrastructure: rather than spinning up full Linux VMs, it runs agents inside an in-process OS kernel powered by V8 isolates and WebAssembly. The cold start numbers (~6ms vs 440ms for sandboxes) and memory footprint (~131MB vs 1GB) are compelling, and the architecture makes sense for the AI agent use case where npm compatibility and speed matter more than running arbitrary native binaries.

The company (Rivet Gaming, Inc.) is backed by Y Combinator W23 and a16z Speedrun, and has a broader vision around stateful workloads (Rivet Actors) that extends well beyond agentOS.

The main risks to evaluate:
1. **Beta status + no published security audit** — the security model is explicitly under review
2. **V8 isolate isolation is not as strong as container isolation** — acceptable for many workloads but not all
3. **Only Pi agent ships today** — other agents are "coming soon"
4. **Self-hosted requires careful permission scoping** — the deny-by-default model is only as good as the host's configuration

The ACP protocol is genuinely interesting as a potential standard for editor-agent interoperability, analogous to LSP's role in language servers.
