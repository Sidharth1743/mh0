export const ENERGY_LEVELS = [
  { value: 'low', label: 'Low Energy', color: '#EF4444', icon: 'battery-quarter' },
  { value: 'medium', label: 'Medium Energy', color: '#F59E0B', icon: 'battery-half' },
  { value: 'high', label: 'High Energy', color: '#10B981', icon: 'battery-full' }
] as const

export const AVAILABILITY_SLOTS = [
  { value: 'now', label: 'Right Now' },
  { value: '5min', label: 'In 5 minutes' },
  { value: '15min', label: 'In 15 minutes' },
  { value: '30min', label: 'In 30 minutes' },
  { value: '1hour', label: 'In 1 hour' },
  { value: 'evening', label: 'This Evening' },
  { value: 'weekend', label: 'This Weekend' }
] as const

export const INTERESTS = [
  'Anxiety',
  'Depression',
  'Stress',
  'Work-Life Balance',
  'Relationships',
  'Self-Care',
  'Mindfulness',
  'Career',
  'Academic',
  'Personal Growth',
  'Creative Expression',
  'Physical Health',
  'Sleep Issues'
] as const

export const TASK_CATEGORIES = [
  'Conversation Starter',
  'Ice Breaker',
  'Deep Discussion',
  'Activity Based',
  'Reflection',
  'Goal Setting'
] as const

export const MAX_QUEUE_WAIT_TIME = 5 * 60 * 1000 // 5 minutes in ms
export const MATCH_RETRY_DELAY = 10 * 1000 // 10 seconds
export const SESSION_TIMEOUT = 60 * 60 * 1000 // 1 hour in ms

export const REALTIME_CONFIG = {
  PRESENCE_HEARTBEAT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
} as const
