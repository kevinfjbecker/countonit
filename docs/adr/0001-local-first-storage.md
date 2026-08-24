# Local-First Client Storage with IndexedDB

To maximize mobile responsiveness and ensure reliable zero-latency 1-tap logging regardless of network connectivity, the application is architected as a local-first Single Page Application / Progressive Web App. All state (Event Types, Taxonomy Nodes, and Occurrences) is persisted locally in the browser via IndexedDB with Pinia state management, accompanied by full JSON export and import capabilities for data backups and device transfers.
