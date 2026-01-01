import type { PageTour } from '../types'

export const centralKitchenTours: PageTour[] = [
  // Central Kitchen Dashboard Tour
  {
    tourId: 'kitchen-dashboard',
    roles: ['central_kitchen'],
    pathPattern: '/kitchen',
    priority: 1,
    steps: [
      {
        id: 'kitchen-overview',
        targetSelector: '[data-tour-id="kitchen-stats"]',
        title: '👨‍🍳 Kitchen Overview',
        description: "Today's production at a glance - pending dispatches, items to prepare, and current status.",
        position: 'bottom'
      },
      {
        id: 'pending-dispatches',
        targetSelector: '[data-tour-id="pending-dispatches"]',
        title: '📦 Dispatches to Pack',
        description: 'These dispatches need to be packed today. Click to see items and start packing.',
        position: 'top'
      },
      {
        id: 'kitchen-quick-links',
        targetSelector: '[data-tour-id="kitchen-quick-links"]',
        title: '🔗 Quick Access',
        description: 'Jump to recipes, production schedules, or the full dispatch list from here.',
        position: 'bottom'
      }
    ]
  },

  // Central Kitchen Branch Page Tour
  {
    tourId: 'central-kitchen-branch',
    roles: ['central_kitchen'],
    pathPattern: '/branch/central-kitchen',
    priority: 2,
    steps: [
      {
        id: 'ck-info',
        targetSelector: '[data-tour-id="branch-info"]',
        title: '🏭 Central Kitchen',
        description: 'Your central kitchen hub. Operating hours, contacts, and key information.',
        position: 'bottom'
      },
      {
        id: 'ck-recipes',
        targetSelector: '[data-tour-id="recipe-selector"]',
        title: '📖 Recipe Access',
        description: 'Find any recipe instantly. Use search or browse by category.',
        position: 'top'
      },
      {
        id: 'ck-dispatches',
        targetSelector: '[data-tour-id="branch-dispatches"]',
        title: '🚚 Outgoing Dispatches',
        description: 'Track all dispatches going out to branches from here.',
        position: 'top'
      }
    ]
  },

  // Recipe Detail Tour for Kitchen
  {
    tourId: 'kitchen-recipe-detail',
    roles: ['central_kitchen'],
    pathPattern: '/branch/central-kitchen/recipes/*',
    priority: 3,
    steps: [
      {
        id: 'recipe-yield',
        targetSelector: '[data-tour-id="yield-scaler"]',
        title: '⚖️ Scale the Recipe',
        description: 'Adjust the yield to scale ingredients up or down for your batch size.',
        position: 'bottom'
      },
      {
        id: 'recipe-ingredients',
        targetSelector: '[data-tour-id="ingredients-list"]',
        title: '🥘 Ingredients',
        description: 'Ingredients scale automatically when you change the yield. Quantities shown in grams/kg.',
        position: 'right'
      },
      {
        id: 'recipe-method',
        targetSelector: '[data-tour-id="recipe-method"]',
        title: '📋 Method',
        description: 'Step-by-step preparation instructions with timing and critical points highlighted.',
        position: 'top'
      }
    ]
  }
]

