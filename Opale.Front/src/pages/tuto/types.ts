import type React from 'react'

export type TutorialTab = 'planning' | 'pages' | 'actions'

export type TutorialId =
    | 'macro'
    | 'micro'
    | 'planning'
    | 'action-create'
    | 'action-edit'
    | 'action-cancel-save'
    | 'action-delete-selection'
    | 'action-search-filter'
    | 'date-selector'
    | 'promotions'
    | 'events'
    | 'teachers'
    | 'rooms'
    | 'matieres'
    | 'settings'

export type TutorialItem = {
    id: TutorialId
    title: string
    summary: string
    tab: TutorialTab
}

export type TutorialImageHighlight = {
    left: string
    top: string
    width: string
    height: string
    label?: string
    labelLeft?: string
    labelTop?: string
}

export type TutorialStep = {
    text: React.ReactNode
    imageSrc?: string
    imageAlt?: string
    imageCaption?: string
    imageHighlight?: TutorialImageHighlight
    imageHighlights?: TutorialImageHighlight[]
    subSteps?: TutorialStepEntry[]
}

export type TutorialStepEntry = React.ReactNode | TutorialStep

export type TutorialStepSection = {
    title: string
    steps: TutorialStepEntry[]
}

export type TutorialContent = {
    objective: string
    expectedResult: string
    steps: TutorialStepEntry[]
    stepSections?: TutorialStepSection[]
    tips: string[]
}
