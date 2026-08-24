# 20: Hierarchical Taxonomy Tree Editor

**What to build:** Visual Taxonomy Tree manager in Settings to create, rename, delete, and nest Taxonomy Nodes into multi-level paths (e.g. `Health > Exercise > Calisthenics`), and assign Event Types to taxonomy branches.

**Blocked by:** 17: Event Type Creator & Editor

**Status:** ready-for-agent

- [ ] Taxonomy manager screen in Settings rendering nodes in a nested tree view
- [ ] Ability to create a root node or a child node under an existing parent (`parentId`)
- [ ] Rename and delete taxonomy nodes (with confirmation if child nodes or linked event types exist)
- [ ] Event Type editor dropdown dynamically reflects full hierarchical paths (e.g., "Health / Exercise / Calisthenics")
- [ ] Unit tests for taxonomy tree building, cycles prevention, and deletion cascades
