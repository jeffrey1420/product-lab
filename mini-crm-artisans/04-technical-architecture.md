# Technical Architecture — Devis & Factures Tool

## Stack

- **Frontend:** Nuxt 3 (SSR, mobile-first)
- **Database:** PostgreSQL on OVH managed Postgres (NOT per-customer VPS)
- **Payments:** Stripe + CB
- **Hosting:** Single OVH VPS or managed Postgres (not one per customer)
- **Email:** Resend or simple SMTP
- **E-invoicing:** Horizon API ( Chorus Pro compatible) — future v2

## Why NOT per-customer VPS

The previous architecture called for one OVH VPS per customer. This is overengineered.

At €29/month per customer, a per-customer VPS:
- Costs €10-20/month per customer in infrastructure
- Requires one-command provisioning (complex to build and maintain)
- Introduces 100x the operational complexity
- Makes automated backups nearly impossible to manage

A single managed Postgres on OVH with Row-Level Security (RLS) handles data isolation at a fraction of the cost.

## MVP Architecture

```
[Nuxt SSR] → [PostgreSQL (OVH Managed)] → [Stripe + CB]
     ↓
[WhatsApp/Email Integration] (send quotes/invoices)
```

## Database Schema (MVP only)

```
users
  - id, email, password_hash, created_at

clients
  - id, user_id, name, phone, email, address, notes, created_at

quotes (devis)
  - id, client_id, user_id, number (sequential), items (JSON), total_htva, status (draft/sent/accepted/rejected), created_at

invoices (factures)
  - id, client_id, user_id, quote_id (nullable), number (sequential), items (JSON), total_htva, tva_rate, total_ttc, status (draft/sent/paid/unpaid), due_date, created_at

reminders (relances)
  - id, invoice_id, scheduled_date, sent (boolean), created_at
```

## E-invoicing Note (v2)

French reform requires e-invoicing via approved platforms:
- Chorus Pro (government platform) — free but complex API
- Private providers: Factea, Archipelia, Tebilis

For MVP, we generate valid PDFs. E-invoicing compliance is a v2 feature.

## NOT Building at Launch

- OAuth/MFA (too complex for MVP)
- API keys for clients
- Webhooks
- Multi-user (single user only until 20+ customers)
- Offline mode
- Inventory management

## Deployment

Single command: `npm run deploy`
- OVH VPS with PM2 + Nginx
- Automated DB backups (managed Postgres handles this)
- SSL via Let's Encrypt

---

*Last updated: 2026-03-30 — Simplified: single managed Postgres, not per-customer VPS*
