# Hierarchical Taxonomy Model with Stable Node IDs

Taxonomy Nodes are modeled as distinct entities with unique IDs and optional `parentId` relationships. Event Types reference a single Taxonomy Node by ID. This decouples the taxonomy hierarchy and node renaming from Event Types, enables arbitrary depth of classification for dashboard roll-ups, and prevents double-counting points in aggregate reports.
