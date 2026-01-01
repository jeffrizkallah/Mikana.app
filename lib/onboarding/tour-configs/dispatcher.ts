import type { PageTour } from '../types'

export const dispatcherTours: PageTour[] = [
  // Dispatch Dashboard Tour
  {
    tourId: 'dispatch-dashboard',
    roles: ['dispatcher'],
    pathPattern: '/dispatch',
    priority: 1,
    steps: [
      {
        id: 'dispatch-list',
        targetSelector: '[data-tour-id="dispatch-list"]',
        title: '📦 Dispatch Board',
        description: 'All dispatches are listed here by delivery date. Colors show the current status of each dispatch.',
        position: 'top'
      },
      {
        id: 'dispatch-status',
        targetSelector: '[data-tour-id="dispatch-status-legend"]',
        title: '🎨 Status Colors',
        description: 'Yellow = Pending, Blue = In Progress, Purple = Dispatched, Green = Completed.',
        position: 'bottom'
      },
      {
        id: 'create-dispatch',
        targetSelector: '[data-tour-id="create-dispatch-btn"]',
        title: '➕ New Dispatch',
        description: 'Create a new dispatch by uploading an Excel file or entering items manually.',
        position: 'left'
      },
      {
        id: 'filter-dispatches',
        targetSelector: '[data-tour-id="dispatch-filters"]',
        title: '🔍 Filter & Search',
        description: 'Filter by date, branch, or status to find specific dispatches quickly.',
        position: 'bottom'
      }
    ]
  },

  // Single Dispatch Detail Tour
  {
    tourId: 'dispatch-detail',
    roles: ['dispatcher', 'central_kitchen', 'admin', 'operations_lead'],
    pathPattern: '/dispatch/[id]',
    priority: 2,
    steps: [
      {
        id: 'dispatch-items',
        targetSelector: '[data-tour-id="dispatch-items"]',
        title: '📋 Item Checklist',
        description: 'All items for this dispatch. Check items as you pack them and note any issues.',
        position: 'top'
      },
      {
        id: 'packing-status',
        targetSelector: '[data-tour-id="packing-section"]',
        title: '📦 Packing Progress',
        description: 'Track packing progress here. When all items are checked, you can mark the dispatch as ready.',
        position: 'right'
      },
      {
        id: 'item-notes',
        targetSelector: '[data-tour-id="item-notes"]',
        title: '📝 Add Notes',
        description: 'If an item has issues (damaged, shortage, etc.), add a note so the branch knows.',
        position: 'left'
      }
    ]
  },

  // Upload Dispatch Tour
  {
    tourId: 'dispatch-upload',
    roles: ['dispatcher', 'admin', 'operations_lead'],
    pathPattern: '/dispatch/upload',
    priority: 3,
    steps: [
      {
        id: 'upload-area',
        targetSelector: '[data-tour-id="upload-area"]',
        title: '📤 Upload Excel File',
        description: 'Drag and drop your dispatch Excel file here, or click to browse.',
        position: 'bottom'
      },
      {
        id: 'upload-preview',
        targetSelector: '[data-tour-id="upload-preview"]',
        title: '👀 Preview & Edit',
        description: 'Review the parsed items before creating the dispatch. You can edit quantities here.',
        position: 'top'
      }
    ]
  }
]

