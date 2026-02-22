import React, { useMemo, useState } from 'react'
import PageHeader from '../components/common/PageHeader'
import SectionCard from '../components/common/SectionCard'
import { TUTORIAL_CONTENT } from './tuto/content'
import { TAB_ITEMS, TUTORIAL_ITEMS } from './tuto/items'
import type { TutorialId, TutorialTab } from './tuto/types'
import {
    firstTutorialForTab,
    getStepHighlights,
    getStepText,
    getVisibleSubSteps,
    hasRenderableNode,
    isStepVisible,
    isTutorialInTab,
    isTutorialStepObject,
} from './tuto/utils'

type DocumentationSectionKey = 'selector' | 'viewer'

export default function Documentation() {
    const [activeTab, setActiveTab] = useState<TutorialTab>('planning')
    const [selectedTutorialId, setSelectedTutorialId] = useState<TutorialId>('macro')
    const [expandedSections, setExpandedSections] = useState<
        Record<DocumentationSectionKey, boolean>
    >({
        selector: true,
        viewer: true,
    })
    const [expandedStepSections, setExpandedStepSections] = useState<
        Record<string, boolean>
    >({})

    const tutorialsForActiveTab = useMemo(
        () => TUTORIAL_ITEMS.filter((item) => item.tab === activeTab),
        [activeTab],
    )

    const selectedTutorial = useMemo(() => {
        if (isTutorialInTab(selectedTutorialId, activeTab)) {
            return TUTORIAL_ITEMS.find((item) => item.id === selectedTutorialId) ?? null
        }

        return TUTORIAL_ITEMS.find((item) => item.id === firstTutorialForTab(activeTab)) ?? null
    }, [activeTab, selectedTutorialId])

    const selectedTutorialContent = useMemo(
        () => (selectedTutorial ? TUTORIAL_CONTENT[selectedTutorial.id] : null),
        [selectedTutorial],
    )

    const handleTabChange = (tab: TutorialTab) => {
        setActiveTab(tab)
        setSelectedTutorialId(firstTutorialForTab(tab))
    }

    const toggleSection = (section: DocumentationSectionKey) => {
        setExpandedSections((current) => ({
            ...current,
            [section]: !current[section],
        }))
    }

    const isStepSectionExpanded = (tutorialId: TutorialId, sectionIndex: number): boolean => {
        const key = `${tutorialId}-section-${sectionIndex}`
        return expandedStepSections[key] ?? true
    }

    const toggleStepSection = (tutorialId: TutorialId, sectionIndex: number) => {
        const key = `${tutorialId}-section-${sectionIndex}`
        setExpandedStepSections((current) => ({
            ...current,
            [key]: !(current[key] ?? true),
        }))
    }

    return (
        <>
            <PageHeader
                title="Documentation utilisateur"
                subtitle="Selectionnez un parcours de tutoriel OPALE."
            />

            <div className="documentation-page">
                <SectionCard
                    id="documentation-selector"
                    title="Choisir un tutoriel"
                    expanded={expandedSections.selector}
                    onToggle={() => toggleSection('selector')}
                    wide
                >
                    <div className="documentation-tabs" role="tablist" aria-label="Type de tutoriel">
                        {TAB_ITEMS.map((tabItem) => {
                            const isActive = tabItem.key === activeTab

                            return (
                                <button
                                    key={tabItem.key}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    className={`documentation-tab-btn ${isActive ? 'is-active' : ''}`}
                                    onClick={() => handleTabChange(tabItem.key)}
                                >
                                    {tabItem.label}
                                </button>
                            )
                        })}
                    </div>

                    <div className="documentation-cards-grid">
                        {tutorialsForActiveTab.map((item) => {
                            const isSelected = item.id === selectedTutorial?.id

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={`documentation-topic-card ${isSelected ? 'is-selected' : ''}`}
                                    onClick={() => setSelectedTutorialId(item.id)}
                                >
                                    <span className="documentation-topic-title">{item.title}</span>
                                    <span className="documentation-topic-summary">{item.summary}</span>
                                </button>
                            )
                        })}
                    </div>
                </SectionCard>

                <SectionCard
                    id="documentation-viewer"
                    title={selectedTutorial?.title ?? 'Tutoriel'}
                    expanded={expandedSections.viewer}
                    onToggle={() => toggleSection('viewer')}
                    wide
                >
                    <div className="documentation-viewer">
                        <p className="documentation-viewer-summary">
                            {selectedTutorial?.summary ?? 'Tutoriel en preparation.'}
                        </p>

                        {selectedTutorialContent ? (
                            <div className="documentation-viewer-content">
                                <section className="documentation-viewer-block">
                                    <h3 className="documentation-viewer-title">Objectif</h3>
                                    <p className="documentation-viewer-text">
                                        {selectedTutorialContent.objective}
                                    </p>
                                </section>

                                <section className="documentation-viewer-block">
                                    <h3 className="documentation-viewer-title">Resultat attendu</h3>
                                    <p className="documentation-viewer-text">
                                        {selectedTutorialContent.expectedResult}
                                    </p>
                                </section>

                                <section className="documentation-viewer-block">
                                    <h3 className="documentation-viewer-title">
                                        Points d attention
                                    </h3>
                                    <ul className="documentation-tip-list">
                                        {selectedTutorialContent.tips.map((tip, index) => (
                                            <li
                                                key={`${selectedTutorial.id}-tip-${index}`}
                                                className="documentation-tip-item"
                                            >
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                <section className="documentation-viewer-block">
                                    <h3 className="documentation-viewer-title">
                                        {selectedTutorialContent.stepSections &&
                                        selectedTutorialContent.stepSections.length > 0
                                            ? 'Fonctionnalites'
                                            : 'Etapes'}
                                    </h3>
                                    {selectedTutorialContent.stepSections &&
                                    selectedTutorialContent.stepSections.length > 0 ? (
                                        <div className="documentation-step-sections">
                                            {selectedTutorialContent.stepSections.map(
                                                (stepSection, sectionIndex) => {
                                                    const tutorialId =
                                                        selectedTutorial?.id ?? selectedTutorialId
                                                    const sectionKey = `${tutorialId}-section-${sectionIndex}`
                                                    const isExpanded = isStepSectionExpanded(
                                                        tutorialId,
                                                        sectionIndex,
                                                    )
                                                    const visibleSectionSteps = stepSection.steps.filter(
                                                        (step) => isStepVisible(step),
                                                    )

                                                    return (
                                                        <section
                                                            key={sectionKey}
                                                            className={`documentation-step-section ${!isExpanded ? 'is-collapsed' : ''}`}
                                                        >
                                                            <div className="documentation-step-section-header">
                                                                <h4 className="documentation-step-section-title">
                                                                    {stepSection.title}
                                                                </h4>
                                                                <button
                                                                    type="button"
                                                                    className="documentation-step-section-toggle"
                                                                    onClick={() =>
                                                                        toggleStepSection(
                                                                            tutorialId,
                                                                            sectionIndex,
                                                                        )
                                                                    }
                                                                    aria-expanded={isExpanded}
                                                                    aria-controls={sectionKey}
                                                                    title={
                                                                        isExpanded
                                                                            ? 'Replier'
                                                                            : 'Deplier'
                                                                    }
                                                                >
                                                                    <span
                                                                        className={`documentation-step-section-chevron ${isExpanded ? 'is-up' : 'is-down'}`}
                                                                        aria-hidden="true"
                                                                    />
                                                                </button>
                                                            </div>

                                                            {isExpanded && (
                                                                <ol
                                                                    id={sectionKey}
                                                                    className="documentation-step-list documentation-step-sublist"
                                                                >
                                                                    {visibleSectionSteps.map((step, stepIndex) => {
                                                                        const stepText = getStepText(step)
                                                                        const hasStepText = hasRenderableNode(stepText)
                                                                        const visibleSubSteps =
                                                                            getVisibleSubSteps(step)
                                                                        const stepHighlights =
                                                                            getStepHighlights(step)
                                                                        const highlightMaskId = `${tutorialId}-section-${sectionIndex}-step-${stepIndex}-highlight-mask`
                                                                        const stepDetails =
                                                                            isTutorialStepObject(step) ? step : null

                                                                        return (
                                                                            <li
                                                                                key={`${tutorialId}-section-${sectionIndex}-step-${stepIndex}`}
                                                                                className="documentation-step-item"
                                                                            >
                                                                                {hasStepText && (
                                                                                    <span className="documentation-step-text">
                                                                                        {stepText}
                                                                                    </span>
                                                                                )}

                                                                                {visibleSubSteps.length > 0 && (
                                                                                    <ol className="documentation-substep-list">
                                                                                        {visibleSubSteps.map(
                                                                                            (
                                                                                                subStep,
                                                                                                subStepIndex,
                                                                                            ) => (
                                                                                                <li
                                                                                                    key={`${tutorialId}-section-${sectionIndex}-step-${stepIndex}-substep-${subStepIndex}`}
                                                                                                    className="documentation-substep-item"
                                                                                                >
                                                                                                    {subStep}
                                                                                                </li>
                                                                                            ),
                                                                                        )}
                                                                                    </ol>
                                                                                )}

                                                                                {stepDetails?.imageSrc && (
                                                                                        <figure className="documentation-step-figure">
                                                                                            <div className="documentation-step-image-wrapper">
                                                                                                <img
                                                                                                    src={stepDetails.imageSrc}
                                                                                                    alt={
                                                                                                        stepDetails.imageAlt ??
                                                                                                        'Capture d ecran du tutoriel'
                                                                                                    }
                                                                                                    className="documentation-step-image"
                                                                                                />
                                                                                                {stepHighlights.length > 0 && (
                                                                                                    <svg
                                                                                                        className="documentation-step-dim-overlay"
                                                                                                        viewBox="0 0 100 100"
                                                                                                        preserveAspectRatio="none"
                                                                                                        aria-hidden="true"
                                                                                                    >
                                                                                                        <defs>
                                                                                                            <mask id={highlightMaskId}>
                                                                                                                <rect
                                                                                                                    x="0"
                                                                                                                    y="0"
                                                                                                                    width="100%"
                                                                                                                    height="100%"
                                                                                                                    fill="white"
                                                                                                                />
                                                                                                                {stepHighlights.map(
                                                                                                                    (
                                                                                                                        highlight,
                                                                                                                        highlightIndex,
                                                                                                                    ) => (
                                                                                                                        <rect
                                                                                                                            key={`${highlightMaskId}-cutout-${highlightIndex}`}
                                                                                                                            x={
                                                                                                                                highlight.left
                                                                                                                            }
                                                                                                                            y={
                                                                                                                                highlight.top
                                                                                                                            }
                                                                                                                            width={
                                                                                                                                highlight.width
                                                                                                                            }
                                                                                                                            height={
                                                                                                                                highlight.height
                                                                                                                            }
                                                                                                                            rx="1.2"
                                                                                                                            ry="1.2"
                                                                                                                            fill="black"
                                                                                                                        />
                                                                                                                    ),
                                                                                                                )}
                                                                                                            </mask>
                                                                                                        </defs>
                                                                                                        <rect
                                                                                                            x="0"
                                                                                                            y="0"
                                                                                                            width="100%"
                                                                                                            height="100%"
                                                                                                            fill="rgba(9, 17, 31, 0.42)"
                                                                                                            mask={`url(#${highlightMaskId})`}
                                                                                                        />
                                                                                                    </svg>
                                                                                                )}
                                                                                                {stepHighlights.map(
                                                                                                    (
                                                                                                        highlight,
                                                                                                        highlightIndex,
                                                                                                    ) => (
                                                                                                        <div
                                                                                                            key={`${tutorialId}-section-${sectionIndex}-step-${stepIndex}-highlight-${highlightIndex}`}
                                                                                                            className="documentation-step-highlight"
                                                                                                            style={{
                                                                                                                left: highlight.left,
                                                                                                                top: highlight.top,
                                                                                                                width: highlight.width,
                                                                                                                height: highlight.height,
                                                                                                            }}
                                                                                                        >
                                                                                                            {highlight.label && (
                                                                                                                <span className="documentation-step-highlight-label">
                                                                                                                    {highlight.label}
                                                                                                                </span>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    ),
                                                                                                )}
                                                                                            </div>
                                                                                            {stepDetails.imageCaption && (
                                                                                                <figcaption className="documentation-step-caption">
                                                                                                    {stepDetails.imageCaption}
                                                                                                </figcaption>
                                                                                            )}
                                                                                        </figure>
                                                                                    )}
                                                                            </li>
                                                                        )
                                                                    })}
                                                                </ol>
                                                            )}
                                                        </section>
                                                    )
                                                },
                                            )}
                                        </div>
                                    ) : (
                                        <ol className="documentation-step-list">
                                            {selectedTutorialContent.steps
                                                .filter((step) => isStepVisible(step))
                                                .map((step, index) => {
                                                    const stepText = getStepText(step)
                                                    const hasStepText = hasRenderableNode(stepText)
                                                    const visibleSubSteps = getVisibleSubSteps(step)
                                                    const stepHighlights = getStepHighlights(step)
                                                    const highlightMaskId = `${selectedTutorial.id}-step-${index}-highlight-mask`
                                                    const stepDetails = isTutorialStepObject(step) ? step : null

                                                    return (
                                                        <li
                                                            key={`${selectedTutorial.id}-step-${index}`}
                                                            className="documentation-step-item"
                                                        >
                                                            {hasStepText && (
                                                                <span className="documentation-step-text">
                                                                    {stepText}
                                                                </span>
                                                            )}

                                                            {visibleSubSteps.length > 0 && (
                                                                <ol className="documentation-substep-list">
                                                                    {visibleSubSteps.map(
                                                                        (subStep, subStepIndex) => (
                                                                            <li
                                                                                key={`${selectedTutorial.id}-step-${index}-substep-${subStepIndex}`}
                                                                                className="documentation-substep-item"
                                                                            >
                                                                                {subStep}
                                                                            </li>
                                                                        ),
                                                                    )}
                                                                </ol>
                                                            )}

                                                            {stepDetails?.imageSrc && (
                                                                    <figure className="documentation-step-figure">
                                                                        <div className="documentation-step-image-wrapper">
                                                                            <img
                                                                                src={stepDetails.imageSrc}
                                                                                alt={
                                                                                    stepDetails.imageAlt ??
                                                                                    'Capture d ecran du tutoriel'
                                                                                }
                                                                                className="documentation-step-image"
                                                                            />
                                                                            {stepHighlights.length > 0 && (
                                                                                <svg
                                                                                    className="documentation-step-dim-overlay"
                                                                                    viewBox="0 0 100 100"
                                                                                    preserveAspectRatio="none"
                                                                                    aria-hidden="true"
                                                                                >
                                                                                    <defs>
                                                                                        <mask id={highlightMaskId}>
                                                                                            <rect
                                                                                                x="0"
                                                                                                y="0"
                                                                                                width="100%"
                                                                                                height="100%"
                                                                                                fill="white"
                                                                                            />
                                                                                            {stepHighlights.map(
                                                                                                (
                                                                                                    highlight,
                                                                                                    highlightIndex,
                                                                                                ) => (
                                                                                                    <rect
                                                                                                        key={`${highlightMaskId}-cutout-${highlightIndex}`}
                                                                                                        x={
                                                                                                            highlight.left
                                                                                                        }
                                                                                                        y={
                                                                                                            highlight.top
                                                                                                        }
                                                                                                        width={
                                                                                                            highlight.width
                                                                                                        }
                                                                                                        height={
                                                                                                            highlight.height
                                                                                                        }
                                                                                                        rx="1.2"
                                                                                                        ry="1.2"
                                                                                                        fill="black"
                                                                                                    />
                                                                                                ),
                                                                                            )}
                                                                                        </mask>
                                                                                    </defs>
                                                                                    <rect
                                                                                        x="0"
                                                                                        y="0"
                                                                                        width="100%"
                                                                                        height="100%"
                                                                                        fill="rgba(9, 17, 31, 0.42)"
                                                                                        mask={`url(#${highlightMaskId})`}
                                                                                    />
                                                                                </svg>
                                                                            )}
                                                                            {stepHighlights.map(
                                                                                (highlight, highlightIndex) => (
                                                                                    <div
                                                                                        key={`${selectedTutorial.id}-step-${index}-highlight-${highlightIndex}`}
                                                                                        className="documentation-step-highlight"
                                                                                        style={{
                                                                                            left: highlight.left,
                                                                                            top: highlight.top,
                                                                                            width: highlight.width,
                                                                                            height: highlight.height,
                                                                                        }}
                                                                                    >
                                                                                        {highlight.label && (
                                                                                            <span className="documentation-step-highlight-label">
                                                                                                {highlight.label}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                        {stepDetails.imageCaption && (
                                                                            <figcaption className="documentation-step-caption">
                                                                                {stepDetails.imageCaption}
                                                                            </figcaption>
                                                                        )}
                                                                    </figure>
                                                                )}
                                                        </li>
                                                    )
                                                })}
                                        </ol>
                                    )}
                                </section>
                            </div>
                        ) : (
                            <p className="documentation-viewer-placeholder">
                                Le contenu detaille sera ajoute dans une prochaine etape.
                            </p>
                        )}
                    </div>
                </SectionCard>
            </div>
        </>
    )
}
