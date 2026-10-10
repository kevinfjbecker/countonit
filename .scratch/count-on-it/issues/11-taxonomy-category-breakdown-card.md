# 11: Taxonomy Category Breakdown Card

**What to build:** Compute points and occurrence counts rolled up by Taxonomy Node and render a visual category breakdown card with proportion bars and percentages on the Dashboard.

**Blocked by:** 08: Daily Points Summary & Circular Progress Ring

**Status:** completed

- [x] Domain logic aggregating points by Taxonomy Node (and unassigned category) without double counting
- [x] Visual category distribution list with colored progress bars, point subtotals, and percentage of daily total
- [x] Handles unassigned Event Types gracefully under an "Other / General" category
- [x] Unit tests verifying accurate point roll-ups across parent/child taxonomy nodes
