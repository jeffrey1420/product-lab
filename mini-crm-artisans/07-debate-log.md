
---

## Debate 16: External Review — Full Pivot Required (RESOLVED)

### The Challenge

External reviewer (Louis shared the repo for review) gave a brutal but accurate assessment:

**Problems identified:**
- "Planning archive" with no shipped product — personas and pricing from assumptions, not observation
- Architecture internally contradictory (Supabase vs OVH per-customer vs managed Postgres)
- Wrong trigger: artisans buy admin relief, not a CRM identity
- Target too broad: can't serve Marc solo AND Jean-Pierre with secretary AND Sophie's team in one MVP
- Some artifacts synthetic ("客户", "记录") — lowers confidence in research rigor
- Sector under pressure (3.8% decline) = brutal price sensitivity
- Per-customer VPS at €29/month is gross overengineering

**Key quote:** "The opportunity is real. The current plan is mostly elaborate procrastination."

### The Response

All agents reviewed and accepted the critique. The core mistakes:

1. **Wrong positioning:** "CRM for artisans" sounds like enterprise software they don't want
2. **Wrong scope:** Tried to be everything to everyone
3. **Wrong architecture:** Per-customer VPS is insane at €29/mo price point
4. **Wrong evidence:** Personas written from assumptions, not field observation

### Resolution

**Full pivot executed:**

1. **Positioning:** "Devis, factures, relances" — not CRM
2. **MVP:** 4 things only — client file, quote, invoice, reminder
3. **Persona:** Marc only (solo smartphone-native artisan) — Jean-Pierre and Sophie are post-launch
4. **Stack:** Single managed Postgres (OVH) — not per-customer VPS
5. **Trigger:** Sell admin pain relief — not pipeline management
6. **E-invoicing:** Make it a v2 feature with Chorus Pro compatibility
7. **Real discovery:** Go watch 10 artisans before building more docs

### Key Insight

The market is viable (Tolteck: 33k users at €25/mo, Obat: 31k users). The product plan was not.

**The agents that wrote 1,700 tasks were solving the wrong problem. Field research > document planning.**

---

*Last updated: 2026-03-30T10:15:00Z — External review applied*
