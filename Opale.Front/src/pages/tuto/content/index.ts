import type { TutorialContent, TutorialId } from '../types'
import { eventsTutorialContent } from './events'
import { dateSelectorTutorialContent } from './dateSelector'
import { actionCancelSaveTutorialContent } from './actionCancelSave'
import { actionCreateTutorialContent } from './actionCreate'
import { actionDeleteSelectionTutorialContent } from './actionDeleteSelection'
import { actionEditTutorialContent } from './actionEdit'
import { actionSearchFilterTutorialContent } from './actionSearchFilter'
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
    'action-create': actionCreateTutorialContent,
    'action-edit': actionEditTutorialContent,
    'action-cancel-save': actionCancelSaveTutorialContent,
    'action-delete-selection': actionDeleteSelectionTutorialContent,
    'action-search-filter': actionSearchFilterTutorialContent,
    'date-selector': dateSelectorTutorialContent,
    promotions: promotionsTutorialContent,
    events: eventsTutorialContent,
    teachers: teachersTutorialContent,
    rooms: roomsTutorialContent,
    matieres: matieresTutorialContent,
    settings: settingsTutorialContent,
}
