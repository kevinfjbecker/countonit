/**
 * Starter Seed Data for Count On It
 *
 * Loaded on first run when storage is empty (spec §"Starter Seed Data").
 * Taxonomy nodes use stable IDs so event types can reference them directly.
 */

import type { AppStatePayload } from '@/types/storage'

// ─── Stable seed IDs ─────────────────────────────────────────────────────────

const SEED_NODE_HEALTH = 'seed-node-health'
const SEED_NODE_HYDRATION = 'seed-node-hydration'
const SEED_NODE_FITNESS = 'seed-node-fitness'
const SEED_NODE_HYGIENE = 'seed-node-hygiene'

// ─────────────────────────────────────────────────────────────────────────────

const SEED_DATE = new Date(0).toISOString() // epoch — clearly "generated, not user-created"

export function buildStarterSeed(): AppStatePayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),

    taxonomyNodes: [
      {
        id: SEED_NODE_HEALTH,
        name: 'Health',
        parentId: null,
        color: 'emerald',
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE
      },
      {
        id: SEED_NODE_HYDRATION,
        name: 'Hydration',
        parentId: SEED_NODE_HEALTH,
        color: 'sky',
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE
      },
      {
        id: SEED_NODE_FITNESS,
        name: 'Fitness',
        parentId: SEED_NODE_HEALTH,
        color: 'emerald',
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE
      },
      {
        id: SEED_NODE_HYGIENE,
        name: 'Hygiene',
        parentId: null,
        color: 'violet',
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE
      }
    ],

    eventTypes: [
      {
        id: 'seed-et-water',
        name: 'Glass of Water',
        icon: 'Droplet',
        colorBadge: 'sky',
        basePoints: 5,
        defaultUnit: 'glass',
        defaultIncrement: 1,
        targetFrequency: 8,
        taxonomyNodeId: SEED_NODE_HYDRATION,
        subtypes: [],
        archived: false,
        sortOrder: 0,
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE
      },
      {
        id: 'seed-et-coffee',
        name: 'Cup of Coffee',
        icon: 'Coffee',
        colorBadge: 'amber',
        basePoints: -2,
        defaultUnit: 'cup',
        defaultIncrement: 1,
        targetFrequency: null,
        taxonomyNodeId: SEED_NODE_HYDRATION,
        subtypes: [
          { id: 'seed-sub-espresso', name: 'Espresso', pointOverride: -1 },
          { id: 'seed-sub-cold-brew', name: 'Cold Brew', pointOverride: -3 }
        ],
        archived: false,
        sortOrder: 1,
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE
      },
      {
        id: 'seed-et-pushups',
        name: 'Set of 10 Push-ups',
        icon: 'Dumbbell',
        colorBadge: 'emerald',
        basePoints: 10,
        defaultUnit: 'set',
        defaultIncrement: 1,
        targetFrequency: 3,
        taxonomyNodeId: SEED_NODE_FITNESS,
        subtypes: [
          { id: 'seed-sub-diamond', name: 'Diamond', pointOverride: 15 },
          { id: 'seed-sub-wide', name: 'Wide Grip', pointOverride: 12 }
        ],
        archived: false,
        sortOrder: 2,
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE
      },
      {
        id: 'seed-et-floss',
        name: 'Floss Teeth',
        icon: 'Sparkles',
        colorBadge: 'violet',
        basePoints: 10,
        defaultUnit: 'session',
        defaultIncrement: 1,
        targetFrequency: 1,
        taxonomyNodeId: SEED_NODE_HYGIENE,
        subtypes: [],
        archived: false,
        sortOrder: 3,
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE
      },
      {
        id: 'seed-et-haircut',
        name: 'Haircut / Shave',
        icon: 'Scissors',
        colorBadge: 'indigo',
        basePoints: 5,
        defaultUnit: 'session',
        defaultIncrement: 1,
        targetFrequency: null,
        taxonomyNodeId: SEED_NODE_HYGIENE,
        subtypes: [],
        archived: false,
        sortOrder: 4,
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE
      }
    ],

    occurrences: [],

    goals: [
      {
        id: 'seed-goal-daily-points',
        type: 'daily_points',
        targetValue: 50,
        celebrationEnabled: true,
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE
      }
    ],

    settings: {
      theme: 'system',
      hapticsEnabled: true,
      confettiEnabled: true
    }
  }
}
