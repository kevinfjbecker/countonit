# 15: Occurrence Backfill Modal (Log Past Event)

**What to build:** A "Log Past Event" button and modal on the History screen allowing users to record an Occurrence with a custom past date and time for forgotten habits.

**Blocked by:** 13: Chronological History Timeline View

**Status:** ready-for-agent

- [ ] Floating or header "Log Past Event" action button in History tab
- [ ] Modal dialog with Event Type selector, Subtype selector, quantity stepper, date picker, and time picker
- [ ] Validates custom date/time (cannot be future timestamp)
- [ ] Creates Occurrence with exact timestamp and immutable snapshot, immediately sorting into historical timeline
- [ ] Tests verifying past-dated Occurrence creation and correct date bucket placement
