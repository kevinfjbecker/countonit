# 24: Dark Mode / Light Mode Theme Toggle

**What to build:** Add a theme switcher supporting System preference, Dark mode, and Light mode with Tailwind dark class toggling and persisted user preference.

**Blocked by:** 01: Project Setup & Base Navigation Shell

**Status:** ready-for-agent

- [ ] Theme switcher in Settings (System, Dark, Light) with icon indicators
- [ ] Listens to `window.matchMedia('(prefers-color-scheme: dark)')` when System is selected
- [ ] Applies `dark` class to `document.documentElement` dynamically
- [ ] Persists user theme preference to storage
- [ ] All views, cards, modals, and toasts styled cleanly in both dark and light palettes
