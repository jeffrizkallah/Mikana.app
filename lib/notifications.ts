// Notification types and utilities

export type NotificationType = 'feature' | 'patch' | 'alert' | 'announcement' | 'urgent' | 'user_signup'

export interface Notification {
  id: string
  type: NotificationType
  priority: 'normal' | 'urgent'
  title: string
  preview: string
  content: string
  created_at: string
  expires_at: string
  created_by: string
  is_active: boolean
  is_read?: boolean
  target_roles?: string[] | null
  metadata?: Record<string, unknown> | null
  related_user_id?: number | null
}

export interface NotificationRead {
  id: string
  notification_id: string
  user_identifier: string
  read_at: string
}

// Get or create user identifier for tracking read status
export function getUserIdentifier(): string {
  if (typeof window === 'undefined') return ''
  
  let id = localStorage.getItem('notification_user_id')
  if (!id) {
    id = `browser_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('notification_user_id', id)
  }
  return id
}

// Format relative time
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
  }

  return date.toLocaleDateString()
}

// Get notification type config (icon, color, label)
export function getNotificationTypeConfig(type: Notification['type']) {
  const configs = {
    feature: {
      label: 'New Feature',
      color: 'bg-blue-500',
      borderColor: 'border-l-blue-500',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
    },
    patch: {
      label: 'Patch Notes',
      color: 'bg-green-500',
      borderColor: 'border-l-green-500',
      textColor: 'text-green-600',
      bgLight: 'bg-green-50',
    },
    alert: {
      label: 'Alert',
      color: 'bg-amber-500',
      borderColor: 'border-l-amber-500',
      textColor: 'text-amber-600',
      bgLight: 'bg-amber-50',
    },
    announcement: {
      label: 'Announcement',
      color: 'bg-gray-500',
      borderColor: 'border-l-gray-500',
      textColor: 'text-gray-600',
      bgLight: 'bg-gray-50',
    },
    urgent: {
      label: 'Urgent',
      color: 'bg-red-500',
      borderColor: 'border-l-red-500',
      textColor: 'text-red-600',
      bgLight: 'bg-red-50',
    },
    user_signup: {
      label: 'New Signup',
      color: 'bg-purple-500',
      borderColor: 'border-l-purple-500',
      textColor: 'text-purple-600',
      bgLight: 'bg-purple-50',
    },
  }

  return configs[type] || configs.announcement
}

// Create admin notification for new user signup
export interface CreateSignupNotificationParams {
  userId: number
  firstName: string
  lastName: string
  email: string
}

export function buildSignupNotificationContent(params: CreateSignupNotificationParams) {
  return {
    type: 'user_signup' as const,
    priority: 'urgent' as const,
    title: 'New User Signup',
    preview: `${params.firstName} ${params.lastName} is waiting for approval`,
    content: `## New User Registration

**${params.firstName} ${params.lastName}** has signed up and is waiting for approval.

**Email:** ${params.email}

Please review and approve or reject this user in the Admin panel.`,
    target_roles: ['admin'],
    related_user_id: params.userId,
    metadata: {
      userId: params.userId,
      email: params.email,
      firstName: params.firstName,
      lastName: params.lastName,
    },
    expires_in_days: 30, // Signup notifications last longer
  }
}

