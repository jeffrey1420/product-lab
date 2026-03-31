# Feature Matrix — Devis & Factures Tool

## MVP Features (Ship First)

### Client File
- [ ] Add client: name, phone, email, address, notes
- [ ] Search clients by name or phone
- [ ] Edit client
- [ ] Delete client (soft delete, keep invoices)

### Quote / Devis
- [ ] Create quote with line items (description, quantity, unit price)
- [ ] Auto-calculate total HT and TTC (20% TVA default, changeable)
- [ ] Sequential quote number (auto: DEVIS-2026-0001)
- [ ] Send via WhatsApp (generate PDF link)
- [ ] Send via email
- [ ] Accept/reject quote (client clicks link, accepts or rejects)
- [ ] Quote expires after 30 days (reminder)

### Invoice / Facture
- [ ] Create invoice from accepted quote (one click)
- [ ] Create invoice standalone
- [ ] French-legal invoice format (mentions obligatoires: SIRET, RCS, n° TVA, adresse)
- [ ] Sequential invoice number (auto: FACT-2026-0001)
- [ ] PDF export
- [ ] Send via WhatsApp or email
- [ ] Mark as paid/unpaid
- [ ] Payment date tracking

### Reminders / Relances
- [ ] Set reminder for unpaid invoice (7 days after due date)
- [ ] Auto-reminder via WhatsApp (pre-written, editable)
- [ ] Mark reminder sent manually
- [ ] Reminder history log

### Core UX
- [ ] Mobile-first design (320px-768px)
- [ ] Dark mode support
- [ ] WhatsApp-deep-link for sending
- [ ] Offline read (basic — cached client list)

## NOT MVP (Post-Launch)

- Multi-user (team features)
- Kanban pipeline view
- Inventory
- Accounting export (Comptabilité)
- E-invoicing (Chorus Pro)
- Offline mode (full)
- Dashboard with charts
- Custom TVA rates per client
- Recurring invoices
- Deposits/avoirs
- Custom invoice template design

## Pricing Tiers

| Feature | Solo (€29/mo) | Pro (€49/mo) | Business (€79/mo) |
|---------|---------------|--------------|------------------|
| Clients | 100 | 500 | Unlimited |
| Quotes/month | 50 | 200 | Unlimited |
| Invoices/month | 50 | 200 | Unlimited |
| Users | 1 | 3 | 10 |
| Reminders | ✓ | ✓ | ✓ |
| Multi-user | ✗ | ✗ | ✓ |
| API access | ✗ | ✗ | ✓ |

---

*Last updated: 2026-03-30 — Narrowed to 4 MVP features only*
