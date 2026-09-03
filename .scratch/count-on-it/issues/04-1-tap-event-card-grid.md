# 04: 1-Tap Event Card Grid

**What to build:** The primary mobile Log view rendering a tactile grid of Event Type cards. Each card displays the event icon, name, color theme, and default point value badge. Single tap immediately records an Occurrence with an immutable snapshot (+1 default increment, calculated points, timestamp) and updates local state.

**Blocked by:** 03: Starter Seed Data Loader

**Status:** ready-for-agent

- [x] Mobile-first responsive card grid rendering all active Event Types
- [x] Each card clearly displays icon, title, point badge (+pts), and default unit
- [x] Single tap executes `recordOccurrence` creating an Occurrence with an immutable metadata snapshot
- [ ] Visual press state on card tap
- [x] Unit/component tests verifying 1-tap logging creates correct immutable Occurrence records
