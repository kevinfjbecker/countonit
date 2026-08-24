# 03: Starter Seed Data Loader

**What to build:** Automatic first-run detection that populates an empty database with pre-configured starter Event Types (Water, Coffee, Push-ups, Floss, Haircut), sample hierarchical Taxonomy Nodes (`Health > Hydration`, `Health > Fitness`, `Hygiene`), and a default 50-point daily goal.

**Blocked by:** 02: Domain Models, Storage Adapter & Pinia Store

**Status:** ready-for-agent

- [ ] First-run detection logic checks if storage is uninitialized
- [ ] Seeds default Event Types (Water, Coffee, Push-ups, Floss, Haircut) with icons, color badges, base points, and default units
- [ ] Seeds sample Taxonomy Nodes (`Health`, `Health > Hydration`, `Health > Fitness`, `Hygiene`)
- [ ] Seeds default 50-point Daily Point Goal
- [ ] Unit tests verifying that seeding occurs once and preserves user modifications on subsequent runs
