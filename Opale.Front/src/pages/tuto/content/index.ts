import type { TutorialContent, TutorialId } from '../types'
import { eventsTutorialContent } from './events'
import { macroTutorialContent } from './macro'
import { matieresTutorialContent } from './matieres'
import { microTutorialContent } from './micro'
import { promotionsTutorialContent } from './promotions'
import { roomsTutorialContent } from './rooms'
import { settingsTutorialContent } from './settings'
import { teachersTutorialContent } from './teachers'

export const TUTORIAL_CONTENT: Record<TutorialId, TutorialContent> = {
    macro: macroTutorialContent,
    micro: microTutorialContent,
    promotions: promotionsTutorialContent,
    events: eventsTutorialContent,
    teachers: teachersTutorialContent,
    rooms: roomsTutorialContent,
    matieres: matieresTutorialContent,
    settings: settingsTutorialContent,
}
