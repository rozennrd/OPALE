// Event types matching the BobPlanning backend database enum
export type EventType =
  | 'cours'
  | 'entreprise'
  | 'examen'
  | 'reunion'
  | 'fermeture'
  | 'soutenance'
  | 'portes ouvertes'
  | 'stage'
  | 'mobilite'
  | 'PFE'
  | 'rattrapage'
  | 'autre'

// Capitalized display names for UI
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  'cours': 'Cours',
  'entreprise': 'Entreprise',
  'examen': 'Examen',
  'reunion': 'Réunion',
  'fermeture': 'Fermeture',
  'soutenance': 'Soutenance',
  'portes ouvertes': 'Portes Ouvertes',
  'stage': 'Stage',
  'mobilite': 'Mobilité',
  'PFE': 'PFE',
  'rattrapage': 'Rattrapage',
  'autre': 'Autre'
}

// Default icon for all event types (can be customized later)
import icEventOther from '../assets/ic-event-other.png'

export const EVENT_TYPE_META: Record<EventType, { icon: string; label: string }> = {
  'cours': { icon: icEventOther, label: 'Cours' },
  'entreprise': { icon: icEventOther, label: 'Entreprise' },
  'examen': { icon: icEventOther, label: 'Examen' },
  'reunion': { icon: icEventOther, label: 'Réunion' },
  'fermeture': { icon: icEventOther, label: 'Fermeture' },
  'soutenance': { icon: icEventOther, label: 'Soutenance' },
  'portes ouvertes': { icon: icEventOther, label: 'Portes Ouvertes' },
  'stage': { icon: icEventOther, label: 'Stage' },
  'mobilite': { icon: icEventOther, label: 'Mobilité' },
  'PFE': { icon: icEventOther, label: 'PFE' },
  'rattrapage': { icon: icEventOther, label: 'Rattrapage' },
  'autre': { icon: icEventOther, label: 'Autre' }
}
