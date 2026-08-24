# 17: Event Type Creator & Editor

**What to build:** Settings screen to create new Event Types and edit existing ones (configuring name, icon/emoji picker, color theme badge, base point value, default unit, target frequency, and assigned taxonomy node).

**Blocked by:** 02: Domain Models, Storage Adapter & Pinia Store

**Status:** ready-for-agent

- [ ] Event Type list in Settings showing all active Event Types with an "Add New" button
- [ ] Editor form supporting:
  - Name (text)
  - Icon/Emoji selector
  - Color badge selector (Emerald, Amber, Sky, Rose, Violet, Indigo, Slate)
  - Base Points (positive or negative integer)
  - Default Unit (e.g., "glass", "set", "cup", "session")
  - Default Increment (default: 1)
  - Target Frequency (e.g. 8 times / day)
  - Taxonomy Node selector (optional)
- [ ] Form validation (name required, valid point integer)
- [ ] Saves to store and persists to storage adapter with automated tests
