import type { TutorialContent, TutorialId } from '../types'
import { eventsTutorialContent } from './events'
import { macroTutorialContent } from './macro'
import { matieresTutorialContent } from './matieres'
import { microTutorialContent } from './micro'
import { planningTutorialContent } from './planning'
import { promotionsTutorialContent } from './promotions'
import { roomsTutorialContent } from './rooms'
import { settingsTutorialContent } from './settings'
import { teachersTutorialContent } from './teachers'

export const TUTORIAL_CONTENT: Record<TutorialId, TutorialContent> = {
    macro: macroTutorialContent,
    micro: microTutorialContent,
    planning: planningTutorialContent,
    promotions: promotionsTutorialContent,
    events: eventsTutorialContent,
    teachers: teachersTutorialContent,
    rooms: roomsTutorialContent,
    matieres: matieresTutorialContent,
    settings: settingsTutorialContent,
}
