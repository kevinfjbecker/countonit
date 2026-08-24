# 23: JSON Data Import (Clean Replace-All)

**What to build:** Add a "Restore Backup" upload feature in Settings that validates an incoming JSON file, displays a summary preview of items to restore, and replaces local state upon explicit user confirmation.

**Blocked by:** 22: JSON Data Export

**Status:** ready-for-agent

- [ ] "Restore Data" file upload trigger accepting `.json` files
- [ ] Schema validator verifying JSON format, version compatibility, and required arrays
- [ ] Confirmation dialog displaying a summary of data to restore (e.g., "Found 5 Event Types, 42 Occurrences, 3 Taxonomy Nodes") with a warning that local data will be replaced
- [ ] Replaces local state cleanly (Option A) and re-renders active views
- [ ] Error handling with user-friendly alerts for corrupt or invalid JSON files
- [ ] Unit tests for JSON validation, corrupt file handling, and full state replacement
