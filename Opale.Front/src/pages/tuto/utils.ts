import React from 'react'
import { TUTORIAL_ITEMS } from './items'
import type {
    TutorialId,
    TutorialImageHighlight,
    TutorialStep,
    TutorialStepEntry,
    TutorialTab,
} from './types'

export const firstTutorialForTab = (tab: TutorialTab): TutorialId => {
    const match = TUTORIAL_ITEMS.find((item) => item.tab === tab)
    return match ? match.id : 'macro'
}

export const isTutorialInTab = (tutorialId: TutorialId, tab: TutorialTab): boolean =>
    TUTORIAL_ITEMS.some((item) => item.id === tutorialId && item.tab === tab)

export const hasRenderableNode = (node: React.ReactNode): boolean => {
    if (node === null || node === undefined || node === false) {
        return false
    }

    if (typeof node === 'string') {
        return node.trim().length > 0
    }

    if (typeof node === 'number') {
        return true
    }

    if (Array.isArray(node)) {
        return node.some((child) => hasRenderableNode(child))
    }

    if (React.isValidElement(node)) {
        const elementChildren = (node.props as { children?: React.ReactNode }).children
        return hasRenderableNode(elementChildren)
    }

    return true
}

export const isTutorialStepObject = (step: TutorialStepEntry): step is TutorialStep =>
    typeof step === 'object' &&
    step !== null &&
    !React.isValidElement(step) &&
    'text' in (step as Record<string, unknown>)

export const getStepText = (step: TutorialStepEntry): React.ReactNode =>
    isTutorialStepObject(step) ? step.text : step

export const getVisibleSubSteps = (step: TutorialStepEntry): TutorialStepEntry[] =>
    isTutorialStepObject(step) ? step.subSteps?.filter((subStep) => isStepVisible(subStep)) ?? [] : []

export const getStepHighlights = (step: TutorialStepEntry): TutorialImageHighlight[] => {
    if (!isTutorialStepObject(step)) {
        return []
    }

    if (step.imageHighlights && step.imageHighlights.length > 0) {
        return step.imageHighlights
    }

    return step.imageHighlight ? [step.imageHighlight] : []
}

export const isStepVisible = (step: TutorialStepEntry): boolean => {
    if (isTutorialStepObject(step)) {
        return hasRenderableNode(step.text) || Boolean(step.imageSrc) || getVisibleSubSteps(step).length > 0
    }

    return hasRenderableNode(step)
}
