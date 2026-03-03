// Event types matching the BobPlanning backend database enum (capitalized)
export type EventType =
  | 'Cours'
  | 'Entreprise'
  | 'Examen'
  | 'Reunion'
  | 'Fermeture'
  | 'Soutenance'
  | 'JPO'
  | 'Stage'
  | 'Mobilite'
  | 'PFE'
  | 'Rattrapage'
  | 'Conference'
  | 'Rentrée'
  | 'Réunion parents'
  | 'Journée Immersion'
  | 'Concours'
  | 'Salon'
  | 'Forum'
  | 'Fin des cours'
  | 'Autre'

// Display names for UI
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  'Cours': 'Cours',
  'Entreprise': 'Entreprise',
  'Examen': 'Examen',
  'Reunion': 'Réunion',
  'Fermeture': 'Fermeture',
  'Soutenance': 'Soutenance',
  'JPO': 'JPO',
  'Stage': 'Stage',
  'Mobilite': 'Mobilité',
  'PFE': 'PFE',
  'Rattrapage': 'Rattrapage',
  'Conference': 'Conférence',
  'Rentrée': 'Rentrée',
  'Réunion parents': 'Réunion parents',
  'Journée Immersion': 'Journée Immersion',
  'Concours': 'Concours',
  'Forum': 'Forum',
  'Salon': 'Salon',
  'Fin des cours': 'Fin des cours',
  'Autre': 'Autre'
}

import icEventJpo from '../assets/events/ic-event-jpo.png'
import icEventExam from '../assets/events/ic-event-exam.png'
import icEventConference from '../assets/events/ic-event-conference.png'
import icEventForum from '../assets/events/ic-event-forum.png'
import icEventSalon from '../assets/events/ic-event-salon.png'
import icEventOther from '../assets/events/ic-event-other.png'

export const EVENT_TYPE_META: Record<EventType, { icon: string; label: string }> = {
  'Cours': { icon: icEventOther, label: 'Cours' },
  'Entreprise': { icon: icEventOther, label: 'Entreprise' },
  'Examen': { icon: icEventExam, label: 'Examen' },
  'Reunion': { icon: icEventOther, label: 'Réunion' },
  'Fermeture': { icon: icEventOther, label: 'Fermeture' },
  'Soutenance': { icon: icEventOther, label: 'Soutenance' },
  'JPO': { icon: icEventJpo, label: 'JPO' },
  'Stage': { icon: icEventOther, label: 'Stage' },
  'Mobilite': { icon: icEventOther, label: 'Mobilité' },
  'PFE': { icon: icEventOther, label: 'PFE' },
  'Rattrapage': { icon: icEventExam, label: 'Rattrapage' },
  'Conference': { icon: icEventConference, label: 'Conférence' },
  'Rentrée': { icon: icEventOther, label: 'Rentrée' },
  'Réunion parents': { icon: icEventOther, label: 'Réunion parents' },
  'Journée Immersion': { icon: icEventOther, label: 'Journée Immersion' },
  'Concours': { icon: icEventOther, label: 'Concours' },
  'Salon': { icon: icEventSalon, label: 'Salon' },
  'Fin des cours': { icon: icEventOther, label: 'Fin des cours' },
  'Forum': { icon: icEventForum, label: 'Forum' },
  'Autre': { icon: icEventOther, label: 'Autre' }
}
