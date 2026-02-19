import { EventType } from '../../models/CampusEvent'

import icEventJpo from '../../assets/events/ic-event-jpo.png'
import icEventExam from '../../assets/events/ic-event-exam.png'
import icEventConference from '../../assets/events/ic-event-conference.png'
import icEventForum from '../../assets/events/ic-event-forum.png'
import icEventSalon from '../../assets/events/ic-event-salon.png'
import icEventOther from '../../assets/events/ic-event-other.png'

/**
 * Métadonnées par type d'événement :
 * - label affiché
 * - icône
 */
export const TYPE_META: Record<EventType, { icon: string; label: string }> = {
    JOURNEE_PO: { icon: icEventJpo, label: 'Journée Portes Ouvertes' },
    EXAMEN: { icon: icEventExam, label: 'Examen / Partiels' },
    CONFERENCE: { icon: icEventConference, label: 'Conférence' },
    FORUM: { icon: icEventForum, label: 'Forum' },
    SALON: { icon: icEventSalon, label: 'Salon / Expo' },
    AUTRE: { icon: icEventOther, label: 'Autre événement' },
}

/**
 * Helper exporté pour d'autres usages éventuels
 */
export function getEventTypeMeta(type: EventType) {
    return TYPE_META[type] ?? TYPE_META.AUTRE
}
