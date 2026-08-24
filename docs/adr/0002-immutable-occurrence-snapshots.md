# Immutable Occurrence Snapshots and Soft-Archiving

To protect historical data integrity, each recorded Occurrence stores an immutable snapshot of the Event Type metadata (name, unit, base points, calculated points) at the moment of creation. If an Event Type is edited or archived, previous Occurrences, historical daily scores, and streak calculations remain unchanged. Event Types are soft-archived rather than hard-deleted if they contain linked Occurrences.
