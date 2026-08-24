# 19: Event Type Soft-Archiving & Reordering

**What to build:** Implement soft-archiving for Event Types (hiding them from the Log grid while preserving past Occurrences, historical scores, and streak history) and drag-and-drop / move-up-down controls to reorder favorite Event Types on the Log screen.

**Blocked by:** 17: Event Type Creator & Editor

**Status:** ready-for-agent

- [ ] "Archive Event Type" button in Event Type editor with confirmation dialog
- [ ] Archived Event Types are flagged with `archived: true`, hidden from the 1-Tap Log screen, but preserved in History and past dashboard reports (ADR 0002)
- [ ] "Archived Event Types" collapsible section in Settings allowing unarchiving / restoration
- [ ] Move up / Move down order buttons to customize display order on the Log card grid
- [ ] Unit tests verifying soft-archive invariants and custom ordering
