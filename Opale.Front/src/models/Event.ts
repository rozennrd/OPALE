import { EventType } from './EventTypes'

export interface Event {
  id: string
  type: EventType
  nom: string
  num_semaine?: number
  datetime_start: string
  datetime_end: string
  show_macro: boolean
  show_micro: boolean
  is_blocking: boolean
  is_exceptional: boolean
  is_external: boolean
}
