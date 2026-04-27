# Executive Summary

**RFP:** MC-2026-0417 — Inventory Dashboard Modernization
**Prepared for:** Meridian Components, Inc.
**Date:** April 27, 2026

---

## Our understanding

Meridian's operations team runs the business through the inventory dashboard every day, but the system they inherited stopped short of the finish line. The Reports module has known defects, the Restocking workflow your VP of Operations needs doesn't exist yet, and the absence of automated tests has frozen IT's willingness to approve any further change. The result: a dashboard that works, but can't safely evolve.

Across three warehouses — San Francisco, London, Tokyo — your team is making restocking and order decisions on data they can't fully trust and a UI that doesn't yet speak their language. This isn't a rebuild engagement. It's a stabilize-and-extend engagement: clear the Reports debt, add the capability your operations team has been asking for, and put the test scaffolding in place so IT can say yes to the next change instead of no.

## Our approach in one paragraph

We'll deliver in three phases over **10 weeks**. Phase 1 (weeks 1–3) lands the foundation: an architecture review for IT handoff (R4), a Reports module audit and remediation (R1), and the first end-to-end test suite (R3) covering the flows your team uses most. Phase 2 (weeks 4–7) builds the Restocking recommendation view (R2) — a budget-constrained, demand-aware purchase order engine that proposes, while your operators decide. Phase 3 (weeks 8–10) is hardening, the desired items where they fit (UI refresh, Japanese locale, dark mode), and a clean handoff to Meridian IT.

## Why this engagement, why us

- **We start by leaving things better-documented than we found them.** The architecture review (R4) is week one, not week ten. IT gets clarity before we touch a line of code.
- **Tests aren't a deliverable at the end — they're how we work.** Every fix in Reports ships with regression coverage. By the time we hand back, your team has a green build they can rely on.
- **The Restocking feature is designed around the operator, not the algorithm.** The recommendation engine surfaces a ranked list within a budget ceiling; the operator stays in control of every PO that goes out.
- **Predictable cadence.** Weekly demos. Defect log shared with Tanaka's team from week one. No surprises in week eight.

## Pricing at a glance

Fixed-fee, **$148,000**, billed against four phase milestones. Detailed assumptions and breakdown in §5.

## What we need from Meridian

A 30-minute weekly check-in with R. Tanaka or a delegate, access to the existing Reports defect log (or a working session with the team to reconstruct it), and an IT point of contact for the architecture handoff and CI integration in week 9.

---

*The remainder of this proposal addresses §4.2 Technical Approach, §4.3 Relevant Experience, §4.4 Timeline, and §4.5 Pricing.*
