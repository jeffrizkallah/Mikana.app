import type { PageTour } from '../types'

// Tours shared across multiple roles
export const sharedTours: PageTour[] = [
  // Home Page / Branches Overview
  {
    tourId: 'branches-overview',
    roles: ['admin', 'operations_lead', 'dispatcher'],
    pathPattern: '/',
    priority: 5,
    steps: [
      {
        id: 'branch-grid',
        targetSelector: '[data-tour-id="branch-grid"]',
        title: '🏢 All Branches',
        description: 'All Mikana branches at a glance. Click any branch to see its details.',
        position: 'top'
      },
      {
        id: 'search-branches',
        targetSelector: '[data-tour-id="branch-search"]',
        title: '🔍 Search & Filter',
        description: 'Find branches by name, location, or manager. Use filters to narrow down.',
        position: 'bottom'
      },
      {
        id: 'role-sidebar',
        targetSelector: '[data-tour-id="role-sidebar"]',
        title: '📋 Role Guides',
        description: 'Access general role guides from the sidebar. These apply to all branches.',
        position: 'right'
      }
    ]
  },

  // Profile Page Tour
  {
    tourId: 'profile-page',
    roles: ['admin', 'operations_lead', 'dispatcher', 'central_kitchen', 'branch_manager', 'branch_staff'],
    pathPattern: '/profile',
    priority: 10,
    steps: [
      {
        id: 'profile-info',
        targetSelector: '[data-tour-id="profile-info"]',
        title: '👤 Your Profile',
        description: 'View your account details and assigned branches here.',
        position: 'bottom'
      },
      {
        id: 'change-password',
        targetSelector: '[data-tour-id="security-section"]',
        title: '🔒 Security',
        description: 'You can change your password anytime to keep your account secure.',
        position: 'top'
      },
      {
        id: 'replay-tour',
        targetSelector: '[data-tour-id="replay-tour"]',
        title: '🎓 Need Help?',
        description: 'Click here anytime to replay the guided tour and see tips again.',
        position: 'top'
      }
    ]
  }
]

