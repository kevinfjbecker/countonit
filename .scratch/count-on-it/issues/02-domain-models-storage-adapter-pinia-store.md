# 02: Domain Models, Storage Adapter & Pinia Store

**What to build:** Define core TypeScript domain models (`EventType`, `TaxonomyNode`, `Occurrence`, `Goal`, `Streak`), create an abstracted Key-Value `StorageAdapter` (with `LocalStorage` and `InMemory` implementations), and set up the Pinia store with state persistence and automated unit tests.

**Blocked by:** 01: Project Setup & Base Navigation Shell

**Status:** done

- [x] TypeScript interfaces defined for `EventType`, `Subtype`, `TaxonomyNode`, `Occurrence`, `Goal`, and `Streak` adhering to CONTEXT.md
- [x] `StorageAdapter` interface defined with `LocalStorageAdapter` for runtime and `InMemoryStorageAdapter` for testing
- [x] Pinia store configured to persist state changes through the storage adapter
- [x] Automated unit tests verifying storage read/write and state mutations

