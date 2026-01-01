import type { PageTour } from '../types'

export const operationsLeadTours: PageTour[] = [
  // Operations Dashboard Tour
  {
    tourId: 'operations-dashboard',
    roles: ['operations_lead'],
    pathPattern: '/operations',
    priority: 1,
    steps: [
      {
        id: 'ops-overview',
        targetSelector: '[data-tour-id="ops-stats"]',
        title: '📊 Operations Overview',
        description: 'Your daily snapshot of branch performance, dispatches, and key metrics across all locations.',
        position: 'bottom'
      },
      {
        id: 'branch-performance',
        targetSelector: '[data-tour-id="branch-performance"]',
        title: '🏢 Branch Performance',
        description: 'Compare branches side by side. Click any branch to dive into details.',
        position: 'top'
      },
      {
        id: 'ops-quick-actions',
        targetSelector: '[data-tour-id="ops-quick-actions"]',
        title: '⚡ Quick Actions',
        description: 'Access recipes, production schedules, and dispatch management from here.',
        position: 'bottom'
      }
    ]
  },

  // Production Schedules Tour
  {
    tourId: 'ops-production-schedules',
    roles: ['operations_lead', 'admin'],
    pathPattern: '/admin/production-schedules',
    priority: 2,
    steps: [
      {
        id: 'schedule-calendar',
        targetSelector: '[data-tour-id="schedule-calendar"]',
        title: '📅 Production Calendar',
        description: 'View and edit what needs to be produced each day. Click a date to see or modify the schedule.',
        position: 'bottom'
      },
      {
        id: 'schedule-items',
        targetSelector: '[data-tour-id="schedule-items"]',
        title: '📋 Daily Items',
        description: 'Each day shows which recipes to prepare and quantities needed.',
        position: 'right'
      }
    ]
  },

  // Prep Instructions Tour
  {
    tourId: 'ops-prep-instructions',
    roles: ['operations_lead', 'admin'],
    pathPattern: '/admin/recipe-instructions',
    priority: 3,
    steps: [
      {
        id: 'instructions-list',
        targetSelector: '[data-tour-id="instructions-list"]',
        title: '📖 Prep Instructions',
        description: 'Detailed preparation guides for kitchen staff. These are separate from recipes for quick reference.',
        position: 'top'
      },
      {
        id: 'add-instruction',
        targetSelector: '[data-tour-id="add-instruction-btn"]',
        title: '➕ Create Instructions',
        description: 'Add new prep instructions with step-by-step details and timing.',
        position: 'left'
      }
    ]
  }
]

