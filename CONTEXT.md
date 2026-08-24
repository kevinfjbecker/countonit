# Count On It

A mobile-first habit and event tracking application that lets users record daily occurrences with minimal friction and monitor habits through customizable taxonomies, points, and dashboards.

## Language

**Event Type**:
A configurable definition of a trackable activity (e.g., "Cup of coffee", "Set of 10 pushups") with default point values, units, and an optional taxonomy mapping.
_Avoid_: Habit type, counter definition, action type

**Taxonomy Node**:
An entity with a unique identifier and hierarchical path (e.g., "Health > Exercise > Calisthenics") used for grouping and dashboard roll-ups.
_Avoid_: Category, folder, group, tag

**Occurrence**:
A discrete recorded instance of an Event Type with a timestamp, logged quantity, and an immutable snapshot of points and event metadata.
_Avoid_: Log entry, event log, check-in, point transaction

**Subtype**:
A predefined variant or preset for an Event Type (e.g. "Espresso" under "Coffee", or "Diamond" under "Push-ups") with optional point and quantity overrides.
_Avoid_: Variation, modifier, flavor

**Point Value**:
A numeric score (positive or negative) assigned to an Event Type that scales with the logged quantity.
_Avoid_: Score, credits, reward

**Goal**:
A target threshold configured either as a cumulative daily Point Value or a target frequency for an Event Type.
_Avoid_: Target, quota, milestone

**Streak**:
The continuous number of consecutive days an Event Type has met or exceeded its daily target frequency.
_Avoid_: Chain, combo, run
