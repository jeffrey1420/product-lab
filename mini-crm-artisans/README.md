# Mini-CRM → Devis & Factures Tool for French Artisans

## What We Actually Sell

**"Je gère mes devis, mes factures, et mes relances — sans y passer ma soirée."**

Not a CRM. Not a pipeline tool. A daily tool that handles the admin French artisans hate: creating quotes, sending invoices, chasing payments, remembering client details.

Target: **solo smartphone-native artisan** (heating engineer, electrician, plumber) — 1-3 person shop, uses WhatsApp for everything, has no system, loses time on admin.

## Core MVP (4 things only)

1. **Client file** — name, phone, address, notes. That's it.
2. **Quote/devis** — create in 2 minutes, send via WhatsApp or email
3. **Invoice/facture** — French-legal invoice, PDF export, sequential numbering
4. **Reminder/relance** — "Madame Dupont n'a pas payé? On envoie un rappel."

Everything else is post-launch.

## Why This Wins

- E-invoicing reform is mandatory (1 Sept 2026 for reception, 1 Sept 2027 for emission via approved platforms)
- Tolteck (€25/mo, 33k users) and Obat (€25-109/mo, 31k users) prove the market pays
- They buy relief from admin, not a CRM identity
- Price point: €29/month solo — simple, justified by one extra quote sent per week

## Stack (Keep It Simple)

- Nuxt 3 + hosted PostgreSQL (NOT per-customer VPS)
- Stripe + CB for payments
- Notion or simple Postgres for data
- Deployed on single OVH VPS or managed Postgres

## What We're NOT Building at Launch

- No multi-user (until we have 20 paying customers)
- No Kanban pipeline (imposed workflow ≠ artisan reality)
- No per-customer VPS (overengineered at €29/mo)
- No offline mode (online-first, deal with it later)
- No fancy analytics

## Next Step

Go watch 10 artisans. Not 20. 10. Watch them create a quote, send an invoice, lose a client detail. Then build.

---

*Last updated: 2026-03-30 — Pivot from "CRM" to "devis/factures/relances"*