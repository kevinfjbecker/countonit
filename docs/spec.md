# Spec: Count On It — Core Habit & Event Tracker

## Problem Statement

Users frequently want to track recurring habits, daily physical routines, and lifestyle occurrences (such as glasses of water drank, cups of coffee consumed, sets of push-ups completed, flossing teeth, or haircuts). Existing habit trackers are often bloated, demand multi-step form entry, require mandatory cloud accounts, or lack a unified point/weighting system and flexible categorization. This friction leads to abandoned tracking and lost motivation.

## Solution

**Count On It** is a lightweight, mobile-first, local-first web application designed for near-zero-friction habit and event tracking. Users can record an occurrence in a single tap, earn configurable point values that feed into daily goals, and analyze their habits via dashboard trends, streaks, and hierarchical taxonomies. All data is persisted locally in the browser with instant responsiveness, full offline reliability, and straightforward JSON export/import for backups.

## User Stories

1. As a daily tracker, I want to record an event occurrence in a single tap on mobile, so that I can log habits with zero friction as they happen.
2. As a health-conscious user, I want each event type to have a configurable point value (positive or negative), so that I am motivated to achieve a healthy daily score.
3. As an active tracker, I want a visual progress ring on my dashboard showing my accumulated points against my daily point target, so that I can see how close I am to my daily goal.
4. As an exercise enthusiast, I want to set daily frequency targets on specific event types (e.g. 8 glasses of water or 1 flossing), so that I can track targeted daily habits.
5. As a user building long-term routines, I want to see consecutive-day streak counters on my event types, so that I maintain momentum and discipline.
6. As a user who sometimes drinks a double coffee or does extra push-ups, I want to long-press an event card to adjust the quantity or select a subtype, so that I can record exact amounts without slowing down the default 1-tap flow.
7. As a coffee enthusiast, I want to define subtypes under an event type (e.g., Espresso vs. Cold Brew under Coffee) with custom point values, so that I can track specific variations of a habit.
8. As a user with accidental taps, I want an immediate 5-second dismissible undo toast after logging an occurrence, so that I can instantly revert mistakes without navigating away.
9. As a busy user, I want to backfill occurrences with custom past timestamps from the history screen, so that I never lose track of habits I forgot to log in the moment.
10. As a user reviewing my day, I want a chronological history timeline where I can view, edit quantities of, or delete past occurrences, so that my log remains accurate.
11. As an organized user, I want to categorize event types into a hierarchical taxonomy (e.g., `Health > Exercise > Calisthenics`), so that I can organize my habits logically without cluttering the main log screen.
12. As a user viewing my dashboard, I want to see category roll-ups and a 7-day trend chart, so that I can analyze how my habits evolve over time.
13. As a privacy-focused user, I want all my data stored locally in my browser without requiring an account or server connection, so that my habits remain private and accessible offline.
14. As a cautious user, I want to export my entire dataset as a clean JSON file and restore it on any device via a replace-all import, so that my data is safe against device loss or browser cache resets.
15. As a new user opening the app for the first time, I want sensible pre-populated starter event types (water, coffee, push-ups, flossing, haircut) and taxonomy nodes, so that I can immediately start logging and see the dashboard in action.
16. As a user whose routines change, I want to edit, reorder, or archive event types without corrupting or modifying historical occurrence snapshots and past point totals, so that my historical records remain intact.
17. As a mobile user in different lighting conditions, I want dark mode and light mode with automatic system detection and a manual toggle, so that the app is comfortable to use day and night.

## Implementation Decisions

- **Domain Model & Glossary Alignment**:
  - The implementation strictly adheres to the terms defined in `CONTEXT.md`: `Event Type`, `Taxonomy Node`, `Occurrence`, `Subtype`, `Point Value`, `Goal`, and `Streak`.
- **Decoupled Hierarchical Taxonomy**:
  - `TaxonomyNode` entities use unique string IDs and optional `parentId` links.
  - `EventType` entities reference a single `TaxonomyNodeId` (or null if unassigned). This enables arbitrary depth of classification for dashboard roll-ups without double-counting points (ADR 0003).
- **Immutable Occurrence Snapshots**:
  - When an `Occurrence` is created, it records a snapshot of the event type's name, unit, base point value, calculated points (`base_points * quantity`), and timestamp (ADR 0002).
  - Editing an `EventType` does not mutate past `Occurrences`.
  - Deleting an `EventType` performs a soft-archive flag if historical `Occurrences` exist.
- **Local-First Persistence & Storage Seam**:
  - Built as a client-side Single Page Application using Vue 3, TypeScript, and Pinia (ADR 0001).
  - State is persisted to browser storage with automatic synchronization.
  - Storage is abstracted behind a simple Key-Value `StorageAdapter` interface, allowing tests to run with an in-memory adapter and production to use browser storage.
- **Mobile-First UX Architecture (4 Dedicated Views)**:
  - **Log View**: Touch-optimized grid of cards. Direct tap emits an instant occurrence with default increment. Long-press / card menu opens a bottom-sheet for quantity adjustments and subtype selection.
  - **Dashboard View**: Daily point progress ring, active target frequency streaks, 7-day trend sparklines, category point distributions, and recent activity feed with quick undo.
  - **History View**: Grouped chronological timeline with date filtering, timestamp backfilling modal, and inline edit/delete.
  - **Settings View**: Event Type & Subtype CRUD, Taxonomy tree manager, Goal settings, JSON Export & Replace-All Import, and Theme toggle.
- **Starter Seed Data**:
  - First-run initialization detects an empty database and loads starter event types (Glass of water, Cup of coffee, Set of 10 push-ups, Floss teeth, Haircut/Shave), sample taxonomy branches (`Health > Hydration`, `Health > Fitness`, `Hygiene`), and a 50-point daily goal.
- **Styling**:
  - Tailwind CSS with responsive mobile-first utilities and CSS variable-based dark/light theme switching.
  - Lucide Vue icons for consistent mobile iconography.

## Testing Decisions

- **Definition of a Good Test**:
  - Tests must verify external behavior through public module interfaces, rather than asserting on private implementation details or UI DOM structure.
  - State transitions, point calculations, streak evaluations, taxonomy roll-ups, and JSON backup migrations are thoroughly tested against high-leverage seams.
- **Testing Seams**:
  - **Primary Seam**: The unified Store / Tracker Engine interface. All business logic (logging occurrences, undoing, streak calculations, taxonomy aggregations, archiving, import/export schema validation) is exercised against this single seam.
  - **Secondary Seam**: Key UI interaction components (quick-log action card, undo toast timer, bottom sheet modal) tested via `@vue/test-utils` and Vitest.
- **Prior Art**:
  - Standard Vue 3 Pinia unit and integration testing patterns with Vitest and in-memory storage adapters.

## Out of Scope

- Cloud user accounts, OAuth authentication, or backend databases.
- Multi-device automatic sync / WebSockets (covered instead via JSON backup export/import).
- Native app stores / PWA service workers and haptic APIs (deferred to future phases).
- Multi-branch tagging per single event type (each event type maps to at most one taxonomy node to prevent double-counting).

## Further Notes

- All dates and times are handled in the user's local timezone.
- Export format is a versioned JSON schema (`version: 1`, `exportedAt`, `eventTypes`, `taxonomyNodes`, `occurrences`, `goals`, `settings`) with schema validation on import.
