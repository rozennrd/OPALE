import { EventType, EVENT_TYPE_META } from '../../models/EventTypes'

import icEventJpo from '../../assets/events/ic-event-jpo.png'
import icEventExam from '../../assets/events/ic-event-exam.png'
import icEventConference from '../../assets/events/ic-event-conference.png'
import icEventForum from '../../assets/events/ic-event-forum.png'
import icEventSalon from '../../assets/events/ic-event-salon.png'
import icEventOther from '../../assets/events/ic-event-other.png'

// Legacy event type mapping for backward compatibility with old mock data
type LegacyEventType = 'JOURNEE_PO' | 'EXAMEN' | 'CONFERENCE' | 'FORUM' | 'SALON' | 'AUTRE'

/**
 * Legacy event type metadata (for old mock data compatibility)
 * Maps old event types to database event types and metadata
 */
export const LEGACY_TYPE_META: Record<LegacyEventType, { icon: string; label: string; dbType: EventType }> = {
    JOURNEE_PO: { icon: icEventJpo, label: 'Journée Portes Ouvertes', dbType: 'JPO' },
    EXAMEN: { icon: icEventExam, label: 'Examen / Partiels', dbType: 'Examen' },
    CONFERENCE: { icon: icEventConference, label: 'Conférence', dbType: 'Conference' },
    FORUM: { icon: icEventForum, label: 'Forum', dbType: 'Forum' },
    SALON: { icon: icEventSalon, label: 'Salon / Expo', dbType: 'Salon' },
    AUTRE: { icon: icEventOther, label: 'Autre événement', dbType: 'Autre' },
}

/**
 * Re-export database event type metadata for consistency
 */
export const TYPE_META = EVENT_TYPE_META

/**
 * Helper function to get event type metadata
 */
export function getEventTypeMeta(type: EventType) {
    return TYPE_META[type] ?? TYPE_META['Autre']
}

/**
 * Legacy helper for backward compatibility
 */
export function getLegacyEventTypeMeta(type: LegacyEventType) {
    return LEGACY_TYPE_META[type]
}
