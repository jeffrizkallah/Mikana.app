import type { PageTour } from '../types'

export const branchStaffTours: PageTour[] = [
  // Branch Staff - Single Branch Tour
  {
    tourId: 'branch-staff-home',
    roles: ['branch_staff'],
    pathPattern: '/branch/[slug]',
    priority: 1,
    steps: [
      {
        id: 'your-branch',
        targetSelector: '[data-tour-id="branch-info"]',
        title: '🏢 Your Branch',
        description: "This is your branch's home page. You'll find all the information you need here.",
        position: 'bottom'
      },
      {
        id: 'dispatches-section',
        targetSelector: '[data-tour-id="branch-dispatches"]',
        title: '🚚 Dispatches & Deliveries',
        description: 'Track incoming deliveries from Central Kitchen here. Check items as you receive them and report any issues.',
        position: 'top'
      },
      {
        id: 'find-your-role',
        targetSelector: '[data-tour-id="role-tabs"]',
        title: '👤 Find Your Role',
        description: 'Click your role (Kitchen, Counter, etc.) to see your specific tasks and checklists.',
        position: 'top'
      },
      {
        id: 'recipe-access',
        targetSelector: '[data-tour-id="recipe-selector"]',
        title: '📖 Recipe Lookup',
        description: 'Search for any recipe here when you need to check ingredients or methods.',
        position: 'top'
      }
    ]
  },

  // Branch Staff - Role Detail Tour
  {
    tourId: 'branch-staff-role',
    roles: ['branch_staff'],
    pathPattern: '/branch/[slug]/role/[role]',
    priority: 2,
    steps: [
      {
        id: 'your-checklist',
        targetSelector: '[data-tour-id="checklists"]',
        title: '✅ Your Daily Checklist',
        description: 'Check items as you complete them. Your progress saves automatically!',
        position: 'top'
      },
      {
        id: 'your-schedule',
        targetSelector: '[data-tour-id="daily-flow"]',
        title: '⏰ Your Daily Schedule',
        description: 'See what tasks need to be done at each time of day.',
        position: 'top'
      }
    ]
  }
]

