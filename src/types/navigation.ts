import type { Component } from 'vue'

export type NavTabId = 'log' | 'dashboard' | 'history' | 'settings'

export interface NavTabItem {
  id: NavTabId
  label: string
  icon: Component
  ariaLabel: string
}
