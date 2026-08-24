# 06: Quantity Stepper Bottom Sheet

**What to build:** Long-pressing an Event Type card (or tapping an inline secondary action button) opens a mobile bottom-sheet modal to log custom quantities (e.g. 25 pushups or 3 glasses of water) with an intuitive `+`/`-` stepper and direct numeric input, recalculating total points and logging the Occurrence.

**Blocked by:** 04: 1-Tap Event Card Grid

**Status:** ready-for-agent

- [ ] Long-press gesture and dedicated "..." action menu trigger on Event Type cards
- [ ] Mobile bottom sheet modal displaying Event Type details, stepper controls (`-`, `+`, direct input), and calculated total points
- [ ] "Log [Quantity] [Unit] (+X pts)" confirmation button
- [ ] Records Occurrence with the custom quantity and scaled points (`base_points * quantity`)
- [ ] Tests verifying custom quantity calculation and recording
