import type { PageTour } from '../types'

export const branchManagerTours: PageTour[] = [
  // Branch Manager Dashboard Tour
  {
    tourId: 'branch-manager-dashboard',
    roles: ['branch_manager'],
    pathPattern: '/dashboard',
    priority: 1,
    steps: [
      {
        id: 'today-snapshot',
        targetSelector: '[data-tour-id="today-snapshot"]',
        title: "📊 Today's Performance",
        description: "Your branches' combined revenue and orders for today. Check this first thing each morning!",
        position: 'bottom'
      },
      {
        id: 'branch-cards',
        targetSelector: '[data-tour-id="branch-cards"]',
        title: '🏢 Your Branches',
        description: 'Click any branch to see details, checklists, and recipes. Green badges mean high hygiene scores!',
        position: 'top'
      },
      {
        id: 'quick-actions',
        targetSelector: '[data-tour-id="quick-actions"]',
        title: '⚡ Quick Actions',
        description: 'Fast links to recipes and common tasks. More features coming soon!',
        position: 'top'
      },
      {
        id: 'dispatches',
        targetSelector: '[data-tour-id="recent-dispatches"]',
        title: '🚚 Incoming Dispatches',
        description: 'Track deliveries from Central Kitchen. Yellow = pending, Blue = on the way, Green = received.',
        position: 'top'
      }
    ]
  },

  // Branch Detail Tour
  {
    tourId: 'branch-detail',
    roles: ['branch_manager', 'admin', 'operations_lead'],
    pathPattern: '/branch/[slug]',
    priority: 2,
    steps: [
      {
        id: 'branch-info',
        targetSelector: '[data-tour-id="branch-info"]',
        title: '🏢 Branch Overview',
        description: 'Key branch information including contacts, operating hours, and KPIs.',
        position: 'bottom'
      },
      {
        id: 'kpi-badges',
        targetSelector: '[data-tour-id="kpi-badges"]',
        title: '📈 Performance KPIs',
        description: 'Sales target, waste percentage, and hygiene score. These are your key performance indicators.',
        position: 'bottom'
      },
      {
        id: 'role-tabs',
        targetSelector: '[data-tour-id="role-tabs"]',
        title: '👥 Role Guides',
        description: 'Click any role to see their daily responsibilities, checklists, and best practices.',
        position: 'top'
      },
      {
        id: 'recipe-search',
        targetSelector: '[data-tour-id="recipe-selector"]',
        title: '🍳 Find Recipes',
        description: 'Search for any recipe by name or browse categories. Great for quick reference!',
        position: 'top'
      }
    ]
  },

  // Role Detail Tour
  {
    tourId: 'role-detail',
    roles: ['branch_manager', 'admin', 'operations_lead'],
    pathPattern: '/branch/[slug]/role/[role]',
    priority: 3,
    steps: [
      {
        id: 'daily-flow',
        targetSelector: '[data-tour-id="daily-flow"]',
        title: '⏰ Daily Timeline',
        description: 'The complete daily schedule for this role, from opening to closing.',
        position: 'top'
      },
      {
        id: 'checklists',
        targetSelector: '[data-tour-id="checklists"]',
        title: '✅ Interactive Checklists',
        description: "Check items as they're completed. Progress saves automatically and resets each day.",
        position: 'top'
      },
      {
        id: 'dos-donts',
        targetSelector: '[data-tour-id="dos-donts"]',
        title: "📋 Do's and Don'ts",
        description: 'Essential guidelines for this role. Great for training new team members.',
        position: 'top'
      }
    ]
  },

  // Recipe Page Tour
  {
    tourId: 'recipe-page',
    roles: ['branch_manager', 'admin', 'operations_lead'],
    pathPattern: '/branch/[slug]/recipes/[recipeId]',
    priority: 4,
    steps: [
      {
        id: 'yield-scaler',
        targetSelector: '[data-tour-id="yield-scaler"]',
        title: '⚖️ Adjust Portions',
        description: 'Change the yield to scale ingredients up or down based on how much you need.',
        position: 'bottom'
      },
      {
        id: 'print-recipe',
        targetSelector: '[data-tour-id="print-btn"]',
        title: '🖨️ Print Recipe',
        description: 'Print a clean copy of the recipe for the kitchen. Includes scaled quantities.',
        position: 'left'
      }
    ]
  }
]

