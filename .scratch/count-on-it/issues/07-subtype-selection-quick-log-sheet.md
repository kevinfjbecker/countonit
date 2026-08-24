# 07: Subtype Selection in Quick-Log Sheet

**What to build:** Enhance the quick-log bottom sheet to list configured Subtypes (e.g. Espresso vs. Cold Brew under Coffee) with custom point value overrides, allowing the user to select a subtype and record the Occurrence with the subtype snapshot.

**Blocked by:** 06: Quantity Stepper Bottom Sheet

**Status:** ready-for-agent

- [ ] Bottom sheet renders a Subtype selection list if the Event Type has configured Subtypes
- [ ] Selecting a Subtype updates the previewed point value according to subtype override rules
- [ ] Recording an Occurrence attaches the Subtype ID and snapshots the Subtype name and points
- [ ] Tests verifying subtype point overrides and Occurrence snapshot recording
