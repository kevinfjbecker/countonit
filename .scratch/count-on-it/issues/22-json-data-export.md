# 22: JSON Data Export

**What to build:** Add an "Export Backup" button in Settings that downloads a timestamped, validated JSON file (`countonit-backup-YYYY-MM-DD.json`) containing all Event Types, Taxonomy Nodes, Occurrences, and Goals.

**Blocked by:** 13: Chronological History Timeline View, 20: Hierarchical Taxonomy Tree Editor

**Status:** ready-for-agent

- [ ] "Export Data" button in Settings with file size and record count summary
- [ ] Serializes entire application state into a schema-versioned JSON format (`version: 1`, `exportedAt`, `eventTypes`, `taxonomyNodes`, `occurrences`, `goals`, `settings`)
- [ ] Triggers browser download of a `.json` backup file
- [ ] Unit tests verifying export payload integrity and JSON structure
