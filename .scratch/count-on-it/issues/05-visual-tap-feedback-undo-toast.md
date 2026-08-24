# 05: Visual Tap Feedback & 5-Second Undo Toast

**What to build:** Visual ripple/pop feedback upon tapping an Event Type card, combined with a floating 5-second dismissible "Undo" toast at the bottom of the screen. Tapping "Undo" smoothly removes the most recently recorded Occurrence and restores the previous point state.

**Blocked by:** 04: 1-Tap Event Card Grid

**Status:** ready-for-agent

- [ ] Visual tap animation (scale/pulse ripple) on the triggered Event Type card
- [ ] Non-intrusive floating toast appears at bottom: "Logged [Event Name] (+X pts) — Undo"
- [ ] 5-second auto-dismiss countdown timer with progress bar
- [ ] Tapping "Undo" immediately deletes the recorded Occurrence from store and storage
- [ ] Tests verifying undo toast lifecycle and deletion of the last occurrence
