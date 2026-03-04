import React, { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader'
import SectionCard from '../components/common/SectionCard'
import ConfirmDialog from '../components/common/ConfirmDialog'
import logoFull from '../assets/logo/logo-full.png'
import { TUTORIAL_CONTENT } from './tuto/content'
import { TAB_ITEMS, TUTORIAL_ITEMS } from './tuto/items'
import type {
    TutorialId,
    TutorialImageHighlight,
    TutorialStepEntry,
    TutorialTab,
} from './tuto/types'
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
import { DEFAULT_API_CONFIG } from '../services/base/types'
import { getTokenFromLocalStorage } from '../constants/tokenStorage'

type DocumentationSectionKey = 'selector' | 'viewer'

const getHighlightLabelStyle = (
    highlight: TutorialImageHighlight,
): React.CSSProperties | undefined => {
    if (!highlight.labelLeft && !highlight.labelTop && !highlight.labelWidth) {
        return undefined
    }

    return {
        ...(highlight.labelLeft ? { left: highlight.labelLeft } : {}),
        ...(highlight.labelTop ? { top: highlight.labelTop } : {}),
        ...(highlight.labelWidth
            ? {
                  width: highlight.labelWidth,
                  display: 'block',
                  whiteSpace: 'normal',
                  lineHeight: 1.2,
                  overflowWrap: 'break-word',
              }
            : {}),
    }
}

type ExportStep = {
    text: string
    subSteps?: string[]
    imageUrl?: string
    imageData?: string
    imageAlt?: string
    imageCaption?: string
}

type ExportSection = {
    title: string
    steps: ExportStep[]
}

type ExportTutorial = {
    id: TutorialId
    title: string
    summary: string
    objective: string
    expectedResult: string
    tips: string[]
    steps: ExportStep[]
    stepSections?: ExportSection[]
}

type ExportPayload = {
    title: string
    date: string
    logoUrl?: string
    logoData?: string
    tutorials: ExportTutorial[]
}

export default function Documentation() {
    const [searchParams] = useSearchParams()
    const tabParam = searchParams.get('tab')
    const tutorialParam = searchParams.get('tutorial')
    const initialTab: TutorialTab =
        tabParam === 'pages' || tabParam === 'planning' || tabParam === 'actions'
            ? tabParam
            : 'planning'
    const tutorialParamIsValid =
        tutorialParam !== null && TUTORIAL_ITEMS.some((item) => item.id === tutorialParam)
    const initialTutorialId =
        tutorialParamIsValid && tutorialParam
            ? (tutorialParam as TutorialId)
            : firstTutorialForTab(initialTab)

    const [activeTab, setActiveTab] = useState<TutorialTab>(initialTab)
    const [selectedTutorialId, setSelectedTutorialId] = useState<TutorialId>(initialTutorialId)
    const [expandedSections, setExpandedSections] = useState<
        Record<DocumentationSectionKey, boolean>
    >({
        selector: true,
        viewer: true,
    })
    const [exportSelection, setExportSelection] = useState<Set<TutorialId>>(
        () => new Set([initialTutorialId]),
    )
    const [isExporting, setIsExporting] = useState(false)
    const [exportError, setExportError] = useState<string | null>(null)
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
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
        return expandedStepSections[key] ?? false
    }

    const toggleStepSection = (tutorialId: TutorialId, sectionIndex: number) => {
        const key = `${tutorialId}-section-${sectionIndex}`
        setExpandedStepSections((current) => ({
            ...current,
            [key]: !(current[key] ?? false),
        }))
    }

    const resolveAssetUrl = (source?: string): string | undefined => {
        if (!source) {
            return undefined
        }

        try {
            return new URL(source, window.location.origin).toString()
        } catch {
            return source
        }
    }

    const nodeToText = (node: React.ReactNode): string => {
        if (node === null || node === undefined || node === false) {
            return ''
        }

        if (typeof node === 'string' || typeof node === 'number') {
            return String(node)
        }

        if (Array.isArray(node)) {
            return node.map((child) => nodeToText(child)).join('')
        }

        if (React.isValidElement(node)) {
            const element = node as React.ReactElement<{ href?: string; children?: React.ReactNode }>
            const childrenText = nodeToText(element.props.children)
            if (element.type === 'a') {
                return element.props.href ? `${childrenText} (${element.props.href})` : childrenText
            }
            return childrenText
        }

        return ''
    }

    const fetchImageData = async (
        url: string,
        cache: Map<string, string>,
    ): Promise<string | undefined> => {
        if (cache.has(url)) {
            return cache.get(url)
        }

        try {
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`)
            }

            const blob = await response.blob()
            const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(String(reader.result))
                reader.onerror = () => reject(reader.error)
                reader.readAsDataURL(blob)
            })
            cache.set(url, dataUrl)
            return dataUrl
        } catch (error) {
            console.warn('[PDF] Image fetch failed', url, error)
            cache.set(url, '')
            return undefined
        }
    }

    const buildExportSteps = async (
        entries: TutorialStepEntry[],
        cache: Map<string, string>,
    ): Promise<ExportStep[]> => {
        const steps: ExportStep[] = []

        for (const stepEntry of entries) {
            if (!isTutorialStepObject(stepEntry)) {
                const text = nodeToText(stepEntry).trim()
                if (text) {
                    steps.push({ text })
                }
                continue
            }

            const resolvedUrl = resolveAssetUrl(stepEntry.imageSrc)
            const imageData = resolvedUrl ? await fetchImageData(resolvedUrl, cache) : undefined
            const text = nodeToText(stepEntry.text).trim()

            if (!text && !imageData) {
                continue
            }

            steps.push({
                text,
                subSteps: stepEntry.subSteps
                    ?.map((subStep) => nodeToText(subStep).trim())
                    .filter((value) => value.length > 0),
                imageUrl: resolvedUrl,
                imageData,
                imageAlt: stepEntry.imageAlt,
                imageCaption: stepEntry.imageCaption,
            })
        }

        return steps
    }

    const toggleExportSelection = (tutorialId: TutorialId) => {
        setExportSelection((current) => {
            const next = new Set(current)
            if (next.has(tutorialId)) {
                next.delete(tutorialId)
            } else {
                next.add(tutorialId)
            }
            return next
        })
    }

    const selectAllTutorials = () => {
        setExportSelection(new Set(TUTORIAL_ITEMS.map((item) => item.id)))
    }

    const clearExportSelection = () => {
        setExportSelection(new Set())
    }

    const buildExportPayload = async (): Promise<ExportPayload> => {
        const selectedIds = new Set(exportSelection)
        const imageCache = new Map<string, string>()
        const tutorials: ExportTutorial[] = []

        for (const item of TUTORIAL_ITEMS.filter((entry) => selectedIds.has(entry.id))) {
            const content = TUTORIAL_CONTENT[item.id]
            const steps = await buildExportSteps(content.steps, imageCache)
            const stepSections = content.stepSections
                ? await Promise.all(
                      content.stepSections.map(async (section) => ({
                          title: section.title,
                          steps: await buildExportSteps(section.steps, imageCache),
                      })),
                  )
                : undefined

            tutorials.push({
                id: item.id,
                title: item.title,
                summary: item.summary,
                objective: content.objective,
                expectedResult: content.expectedResult,
                tips: content.tips ?? [],
                steps,
                stepSections,
            })
        }

        const exportDate = new Date().toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        })

        const resolvedLogoUrl = resolveAssetUrl(logoFull)
        const logoData = resolvedLogoUrl
            ? await fetchImageData(resolvedLogoUrl, imageCache)
            : undefined

        return {
            title: 'Documentation OPALE',
            date: exportDate,
            logoUrl: resolvedLogoUrl,
            logoData,
            tutorials,
        }
    }

    const handleExportPdf = async (onSuccess?: () => void) => {
        if (exportSelection.size === 0 || isExporting) {
            return
        }

        setIsExporting(true)
        setExportError(null)

        try {
            const payload = await buildExportPayload()
            const token = getTokenFromLocalStorage()
            const response = await fetch(
                `${DEFAULT_API_CONFIG.baseUrl}/documentation/export`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'x-access-token': token } : {}),
                    },
                    credentials: 'include',
                    body: JSON.stringify(payload),
                },
            )

            if (!response.ok) {
                const errorPayload = await response.json().catch(() => ({}))
                throw new Error(
                    errorPayload?.error || errorPayload?.message || 'Export PDF impossible.',
                )
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const anchor = document.createElement('a')
            anchor.href = url
            anchor.download = `OPALE-tutoriels-${new Date().toISOString().slice(0, 10)}.pdf`
            document.body.appendChild(anchor)
            anchor.click()
            anchor.remove()
            window.URL.revokeObjectURL(url)
            if (onSuccess) {
                onSuccess()
            }
        } catch (error) {
            console.error(error)
            setExportError(
                error instanceof Error ? error.message : "Une erreur est survenue lors de l'export.",
            )
        } finally {
            setIsExporting(false)
        }
    }

    const exportDialogContent = (
        <div className="documentation-export-dialog">
            <p className="documentation-export-dialog-intro">
                Choisissez les tutoriels Ã  exporter. Un sommaire sera ajoutÃ© automatiquement.
            </p>
            <div className="documentation-export-dialog-actions">
                <button type="button" className="btn-tertiary" onClick={selectAllTutorials}>
                    Tout sÃ©lectionner
                </button>
                <button type="button" className="btn-tertiary" onClick={clearExportSelection}>
                    Tout dÃ©sÃ©lectionner
                </button>
            </div>
            <div className="documentation-export-dialog-groups">
                {TAB_ITEMS.map((tabItem) => {
                    const tabTutorials = TUTORIAL_ITEMS.filter((item) => item.tab === tabItem.key)

                    return (
                        <div key={tabItem.key} className="documentation-export-group">
                            <h4 className="documentation-export-group-title">{tabItem.label}</h4>
                            <div className="documentation-export-list">
                                {tabTutorials.map((item) => (
                                    <label key={item.id} className="documentation-export-item">
                                        <input
                                            type="checkbox"
                                            className="documentation-export-checkbox"
                                            checked={exportSelection.has(item.id)}
                                            onChange={() => toggleExportSelection(item.id)}
                                        />
                                        <span className="documentation-export-item-text">
                                            <span className="documentation-export-item-title">
                                                {item.title}
                                            </span>
                                            <span className="documentation-export-item-summary">
                                                {item.summary}
                                            </span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
            {exportError && <p className="documentation-export-error">{exportError}</p>}
        </div>
    )

    return (
        <>
            <PageHeader
                title="Documentation utilisateur"
                subtitle="Sélectionnez un parcours de tutoriel OPALE."
            />

            <div className="documentation-page">
                <SectionCard
                    id="documentation-selector"
                    title="Choisir un tutoriel"
                    expanded={expandedSections.selector}
                    onToggle={() => toggleSection('selector')}
                    wide
                >
                    <div className="documentation-tabs-row">
                        <div
                            className="documentation-tabs"
                            role="tablist"
                            aria-label="Type de tutoriel"
                        >
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
                        <button
                            type="button"
                            className="btn-tertiary documentation-export-trigger"
                            onClick={() => {
                                setExportError(null)
                                setIsExportDialogOpen(true)
                            }}
                        >
                            Exporter PDF
                        </button>
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

                {selectedTutorial?.id === 'micro' && (
                    <div className="documentation-warning" role="note" aria-live="polite">
                        <strong>Attention :</strong> ce tutoriel est une <strong>esquisse</strong> avec les grandes
                        étapes. Il faudra le mettre à jour une fois la fonctionnalité intégrée.
                    </div>
                )}

                <SectionCard
                    id="documentation-viewer"
                    title={selectedTutorial?.title ?? 'Tutoriel'}
                    expanded={expandedSections.viewer}
                    onToggle={() => toggleSection('viewer')}
                    wide
                >
                    <div className="documentation-viewer">
                        <p className="documentation-viewer-summary">
                            {selectedTutorial?.summary ?? 'Tutoriel en préparation.'}
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
                                    <h3 className="documentation-viewer-title">Résultat attendu</h3>
                                    <p className="documentation-viewer-text">
                                        {selectedTutorialContent.expectedResult}
                                    </p>
                                </section>

                                <section className="documentation-viewer-block">
                                    <h3 className="documentation-viewer-title">
                                        Points d&apos;attention
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
                                            ? 'Fonctionnalités'
                                            : 'Étapes'}
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
                                                    const toggleStepSectionState = () =>
                                                        toggleStepSection(tutorialId, sectionIndex)
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
                                                                    <button
                                                                        type="button"
                                                                        className="documentation-step-section-title-btn"
                                                                        onClick={toggleStepSectionState}
                                                                        aria-expanded={isExpanded}
                                                                        aria-controls={sectionKey}
                                                                        title={
                                                                            isExpanded
                                                                                ? 'Replier'
                                                                                : 'Déplier'
                                                                        }
                                                                    >
                                                                        {stepSection.title}
                                                                    </button>
                                                                </h4>
                                                                <button
                                                                    type="button"
                                                                    className="documentation-step-section-toggle"
                                                                    onClick={toggleStepSectionState}
                                                                    aria-expanded={isExpanded}
                                                                    aria-controls={sectionKey}
                                                                    title={
                                                                        isExpanded
                                                                            ? 'Replier'
                                                                            : 'Déplier'
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
                                                                        const stepImagePlacement =
                                                                            stepDetails?.imagePlacement ?? 'afterSubSteps'
                                                                        const stepAfterHighlights =
                                                                            stepDetails?.imageAfterHighlights &&
                                                                            stepDetails.imageAfterHighlights.length > 0
                                                                                ? stepDetails.imageAfterHighlights
                                                                                : stepDetails?.imageAfterHighlight
                                                                                  ? [stepDetails.imageAfterHighlight]
                                                                                  : []
                                                                        const stepAfterHighlightMaskId = `${tutorialId}-section-${sectionIndex}-step-${stepIndex}-highlight-mask-after`

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

                                                                                {stepDetails?.imageSrc &&
                                                                                    stepImagePlacement === 'beforeSubSteps' && (
                                                                                        <figure className="documentation-step-figure">
                                                                                            <div className="documentation-step-image-wrapper">
                                                                                                <img
                                                                                                    src={stepDetails.imageSrc}
                                                                                                    alt={
                                                                                                        stepDetails.imageAlt ??
                                                                                                        "Capture d'écran du tutoriel"
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
                                                                                                                            x={highlight.left}
                                                                                                                            y={highlight.top}
                                                                                                                            width={highlight.width}
                                                                                                                            height={highlight.height}
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
                                                                                                                <span
                                                                                                                    className="documentation-step-highlight-label"
                                                                                                                    style={getHighlightLabelStyle(highlight)}
                                                                                                                >
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

                                                                                {visibleSubSteps.length > 0 && (
                                                                                    <ol className="documentation-substep-list">
                                                                                        {visibleSubSteps.map(
                                                                                            (
                                                                                                subStep,
                                                                                                subStepIndex,
                                                                                            ) => {
                                                                                                const subStepText =
                                                                                                    getStepText(
                                                                                                        subStep,
                                                                                                    )
                                                                                                const hasSubStepText =
                                                                                                    hasRenderableNode(
                                                                                                        subStepText,
                                                                                                    )
                                                                                                const nestedSubSteps =
                                                                                                    getVisibleSubSteps(
                                                                                                        subStep,
                                                                                                    )
                                                                                                const subStepDetails =
                                                                                                    isTutorialStepObject(
                                                                                                        subStep,
                                                                                                    )
                                                                                                        ? subStep
                                                                                                        : null
                                                                                                const subStepHighlights =
                                                                                                    getStepHighlights(
                                                                                                        subStep,
                                                                                                    )
                                                                                                const subStepImagePlacement =
                                                                                                    subStepDetails?.imagePlacement ??
                                                                                                    'afterSubSteps'
                                                                                                const subStepHighlightMaskId = `${tutorialId}-section-${sectionIndex}-step-${stepIndex}-substep-${subStepIndex}-highlight-mask`

                                                                                                return (
                                                                                                    <li
                                                                                                        key={`${tutorialId}-section-${sectionIndex}-step-${stepIndex}-substep-${subStepIndex}`}
                                                                                                        className="documentation-substep-item"
                                                                                                    >
                                                                                                        {hasSubStepText &&
                                                                                                            subStepText}
                                                                                                        {subStepDetails?.imageSrc &&
                                                                                                            subStepImagePlacement ===
                                                                                                                'beforeSubSteps' && (
                                                                                                                <figure className="documentation-step-figure">
                                                                                                                    <div className="documentation-step-image-wrapper">
                                                                                                                        <img
                                                                                                                            src={subStepDetails.imageSrc}
                                                                                                                            alt={subStepDetails.imageAlt ?? "Capture d'écran du tutoriel"}
                                                                                                                            className="documentation-step-image"
                                                                                                                        />
                                                                                                                        {subStepHighlights.length > 0 && (
                                                                                                                            <svg
                                                                                                                                className="documentation-step-dim-overlay"
                                                                                                                                viewBox="0 0 100 100"
                                                                                                                                preserveAspectRatio="none"
                                                                                                                                aria-hidden="true"
                                                                                                                            >
                                                                                                                                <defs>
                                                                                                                                    <mask id={subStepHighlightMaskId}>
                                                                                                                                        <rect
                                                                                                                                            x="0"
                                                                                                                                            y="0"
                                                                                                                                            width="100%"
                                                                                                                                            height="100%"
                                                                                                                                            fill="white"
                                                                                                                                        />
                                                                                                                                        {subStepHighlights.map((highlight, highlightIndex) => (
                                                                                                                                            <rect
                                                                                                                                                key={`${subStepHighlightMaskId}-cutout-${highlightIndex}`}
                                                                                                                                                x={highlight.left}
                                                                                                                                                y={highlight.top}
                                                                                                                                                width={highlight.width}
                                                                                                                                                height={highlight.height}
                                                                                                                                                rx="1.2"
                                                                                                                                                ry="1.2"
                                                                                                                                                fill="black"
                                                                                                                                            />
                                                                                                                                        ))}
                                                                                                                                    </mask>
                                                                                                                                </defs>
                                                                                                                                <rect
                                                                                                                                    x="0"
                                                                                                                                    y="0"
                                                                                                                                    width="100%"
                                                                                                                                    height="100%"
                                                                                                                                    fill="rgba(9, 17, 31, 0.42)"
                                                                                                                                    mask={`url(#${subStepHighlightMaskId})`}
                                                                                                                                />
                                                                                                                            </svg>
                                                                                                                        )}
                                                                                                                        {subStepHighlights.map((highlight, highlightIndex) => (
                                                                                                                            <div
                                                                                                                                key={`${tutorialId}-section-${sectionIndex}-step-${stepIndex}-substep-${subStepIndex}-highlight-${highlightIndex}`}
                                                                                                                                className="documentation-step-highlight"
                                                                                                                                style={{
                                                                                                                                    left: highlight.left,
                                                                                                                                    top: highlight.top,
                                                                                                                                    width: highlight.width,
                                                                                                                                    height: highlight.height,
                                                                                                                                }}
                                                                                                                            >
                                                                                                                                {highlight.label && (
                                                                                                                                    <span
                                                                                                                                        className="documentation-step-highlight-label"
                                                                                                                                        style={getHighlightLabelStyle(highlight)}
                                                                                                                                    >
                                                                                                                                        {highlight.label}
                                                                                                                                    </span>
                                                                                                                                )}
                                                                                                                            </div>
                                                                                                                        ))}
                                                                                                                    </div>
                                                                                                                    {subStepDetails.imageCaption && (
                                                                                                                        <figcaption className="documentation-step-caption">
                                                                                                                            {subStepDetails.imageCaption}
                                                                                                                        </figcaption>
                                                                                                                    )}
                                                                                                                </figure>
                                                                                                            )}
                                                                                                                                                                                                                 {nestedSubSteps.length > 0 && (
                                                                                                            <ol className="documentation-substep-list documentation-subsubstep-list">
                                                                                                                {nestedSubSteps.map(
                                                                                                                    (nestedSubStep, nestedSubStepIndex) => {
                                                                                                                        const nestedSubStepText = getStepText(nestedSubStep)
                                                                                                                        const hasNestedSubStepText = hasRenderableNode(nestedSubStepText)
                                                                                                                        const nestedSubStepDetails = isTutorialStepObject(nestedSubStep)
                                                                                                                            ? nestedSubStep
                                                                                                                            : null
                                                                                                                        const nestedSubStepHighlights = getStepHighlights(nestedSubStep)
                                                                                                                        const nestedSubStepHighlightMaskId = `${tutorialId}-section-${sectionIndex}-step-${stepIndex}-substep-${subStepIndex}-subsubstep-${nestedSubStepIndex}-highlight-mask`

                                                                                                                        return (
                                                                                                                            <li
                                                                                                                                key={`${tutorialId}-section-${sectionIndex}-step-${stepIndex}-substep-${subStepIndex}-subsubstep-${nestedSubStepIndex}`}
                                                                                                                                className="documentation-substep-item documentation-subsubstep-item"
                                                                                                                            >
                                                                                                                                {hasNestedSubStepText && nestedSubStepText}
                                                                                                                                {nestedSubStepDetails?.imageSrc && (
                                                                                                                                    <figure className="documentation-step-figure">
                                                                                                                                        <div className="documentation-step-image-wrapper">
                                                                                                                                            <img
                                                                                                                                                src={nestedSubStepDetails.imageSrc}
                                                                                                                                                alt={
                                                                                                                                                    nestedSubStepDetails.imageAlt ??
                                                                                                                                                    "Capture d'écran du tutoriel"
                                                                                                                                                }
                                                                                                                                                className="documentation-step-image"
                                                                                                                                            />
                                                                                                                                            {nestedSubStepHighlights.length > 0 && (
                                                                                                                                                <svg
                                                                                                                                                    className="documentation-step-dim-overlay"
                                                                                                                                                    viewBox="0 0 100 100"
                                                                                                                                                    preserveAspectRatio="none"
                                                                                                                                                    aria-hidden="true"
                                                                                                                                                >
                                                                                                                                                    <defs>
                                                                                                                                                        <mask id={nestedSubStepHighlightMaskId}>
                                                                                                                                                            <rect
                                                                                                                                                                x="0"
                                                                                                                                                                y="0"
                                                                                                                                                                width="100%"
                                                                                                                                                                height="100%"
                                                                                                                                                                fill="white"
                                                                                                                                                            />
                                                                                                                                                            {nestedSubStepHighlights.map(
                                                                                                                                                                (highlight, highlightIndex) => (
                                                                                                                                                                    <rect
                                                                                                                                                                        key={`${nestedSubStepHighlightMaskId}-cutout-${highlightIndex}`}
                                                                                                                                                                        x={highlight.left}
                                                                                                                                                                        y={highlight.top}
                                                                                                                                                                        width={highlight.width}
                                                                                                                                                                        height={highlight.height}
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
                                                                                                                                                        mask={`url(#${nestedSubStepHighlightMaskId})`}
                                                                                                                                                    />
                                                                                                                                                </svg>
                                                                                                                                            )}
                                                                                                                                            {nestedSubStepHighlights.map((highlight, highlightIndex) => (
                                                                                                                                                <div
                                                                                                                                                    key={`${tutorialId}-section-${sectionIndex}-step-${stepIndex}-substep-${subStepIndex}-subsubstep-${nestedSubStepIndex}-highlight-${highlightIndex}`}
                                                                                                                                                    className="documentation-step-highlight"
                                                                                                                                                    style={{
                                                                                                                                                        left: highlight.left,
                                                                                                                                                        top: highlight.top,
                                                                                                                                                        width: highlight.width,
                                                                                                                                                        height: highlight.height,
                                                                                                                                                    }}
                                                                                                                                                >
                                                                                                                                                    {highlight.label && (
                                                                                                                                                        <span
                                                                                                                                                            className="documentation-step-highlight-label"
                                                                                                                                                            style={getHighlightLabelStyle(highlight)}
                                                                                                                                                        >
                                                                                                                                                            {highlight.label}
                                                                                                                                                        </span>
                                                                                                                                                    )}
                                                                                                                                                </div>
                                                                                                                                            ))}
                                                                                                                                        </div>
                                                                                                                                        {nestedSubStepDetails.imageCaption && (
                                                                                                                                            <figcaption className="documentation-step-caption">
                                                                                                                                                {nestedSubStepDetails.imageCaption}
                                                                                                                                            </figcaption>
                                                                                                                                        )}
                                                                                                                                    </figure>
                                                                                                                                )}
                                                                                                                            </li>
                                                                                                                        )
                                                                                                                    },
                                                                                                                )}
                                                                                                            </ol>
                                                                                                        )}
                                                                                                        {subStepDetails?.imageSrc &&
                                                                                                            subStepImagePlacement !==
                                                                                                                'beforeSubSteps' && (
                                                                                                            <figure className="documentation-step-figure">
                                                                                                                <div className="documentation-step-image-wrapper">
                                                                                                                    <img
                                                                                                                        src={subStepDetails.imageSrc}
                                                                                                                        alt={subStepDetails.imageAlt ?? "Capture d'écran du tutoriel"}
                                                                                                                        className="documentation-step-image"
                                                                                                                    />
                                                                                                                    {subStepHighlights.length > 0 && (
                                                                                                                        <svg
                                                                                                                            className="documentation-step-dim-overlay"
                                                                                                                            viewBox="0 0 100 100"
                                                                                                                            preserveAspectRatio="none"
                                                                                                                            aria-hidden="true"
                                                                                                                        >
                                                                                                                            <defs>
                                                                                                                                <mask id={subStepHighlightMaskId}>
                                                                                                                                    <rect
                                                                                                                                        x="0"
                                                                                                                                        y="0"
                                                                                                                                        width="100%"
                                                                                                                                        height="100%"
                                                                                                                                        fill="white"
                                                                                                                                    />
                                                                                                                                    {subStepHighlights.map((highlight, highlightIndex) => (
                                                                                                                                        <rect
                                                                                                                                            key={`${subStepHighlightMaskId}-cutout-${highlightIndex}`}
                                                                                                                                            x={highlight.left}
                                                                                                                                            y={highlight.top}
                                                                                                                                            width={highlight.width}
                                                                                                                                            height={highlight.height}
                                                                                                                                            rx="1.2"
                                                                                                                                            ry="1.2"
                                                                                                                                            fill="black"
                                                                                                                                        />
                                                                                                                                    ))}
                                                                                                                                </mask>
                                                                                                                            </defs>
                                                                                                                            <rect
                                                                                                                                x="0"
                                                                                                                                y="0"
                                                                                                                                width="100%"
                                                                                                                                height="100%"
                                                                                                                                fill="rgba(9, 17, 31, 0.42)"
                                                                                                                                mask={`url(#${subStepHighlightMaskId})`}
                                                                                                                            />
                                                                                                                        </svg>
                                                                                                                    )}
                                                                                                                    {subStepHighlights.map((highlight, highlightIndex) => (
                                                                                                                        <div
                                                                                                                            key={`${tutorialId}-section-${sectionIndex}-step-${stepIndex}-substep-${subStepIndex}-highlight-${highlightIndex}`}
                                                                                                                            className="documentation-step-highlight"
                                                                                                                            style={{
                                                                                                                                left: highlight.left,
                                                                                                                                top: highlight.top,
                                                                                                                                width: highlight.width,
                                                                                                                                height: highlight.height,
                                                                                                                            }}
                                                                                                                        >
                                                                                                                            {highlight.label && (
                                                                                                                                <span
                                                                                                                                    className="documentation-step-highlight-label"
                                                                                                                                    style={getHighlightLabelStyle(highlight)}
                                                                                                                                >
                                                                                                                                    {highlight.label}
                                                                                                                                </span>
                                                                                                                            )}
                                                                                                                        </div>
                                                                                                                    ))}
                                                                                                                </div>
                                                                                                                {subStepDetails.imageCaption && (
                                                                                                                    <figcaption className="documentation-step-caption">
                                                                                                                        {subStepDetails.imageCaption}
                                                                                                                    </figcaption>
                                                                                                                )}
                                                                                                            </figure>
                                                                                                        )}
                                                                                                    </li>
                                                                                                )
                                                                                            },
                                                                                        )}
                                                                                    </ol>
                                                                                )}

                                                                                {stepDetails?.imageSrc &&
                                                                                    stepImagePlacement !== 'beforeSubSteps' && (
                                                                                        <figure className="documentation-step-figure">
                                                                                            <div className="documentation-step-image-wrapper">
                                                                                                <img
                                                                                                    src={stepDetails.imageSrc}
                                                                                                    alt={
                                                                                                        stepDetails.imageAlt ??
                                                                                                        "Capture d'écran du tutoriel"
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
                                                                                                                <span
                                                                                                                    className="documentation-step-highlight-label"
                                                                                                                    style={getHighlightLabelStyle(highlight)}
                                                                                                                >
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

                                                                                {stepDetails?.imageAfterSrc && (
                                                                                    <figure className="documentation-step-figure">
                                                                                        <div className="documentation-step-image-wrapper">
                                                                                            <img
                                                                                                src={stepDetails.imageAfterSrc}
                                                                                                alt={
                                                                                                    stepDetails.imageAfterAlt ??
                                                                                                    "Capture d'écran du tutoriel"
                                                                                                }
                                                                                                className="documentation-step-image"
                                                                                            />
                                                                                            {stepAfterHighlights.length > 0 && (
                                                                                                <svg
                                                                                                    className="documentation-step-dim-overlay"
                                                                                                    viewBox="0 0 100 100"
                                                                                                    preserveAspectRatio="none"
                                                                                                    aria-hidden="true"
                                                                                                >
                                                                                                    <defs>
                                                                                                        <mask id={stepAfterHighlightMaskId}>
                                                                                                            <rect
                                                                                                                x="0"
                                                                                                                y="0"
                                                                                                                width="100%"
                                                                                                                height="100%"
                                                                                                                fill="white"
                                                                                                            />
                                                                                                            {stepAfterHighlights.map(
                                                                                                                (
                                                                                                                    highlight,
                                                                                                                    highlightIndex,
                                                                                                                ) => (
                                                                                                                    <rect
                                                                                                                        key={`${stepAfterHighlightMaskId}-cutout-${highlightIndex}`}
                                                                                                                        x={highlight.left}
                                                                                                                        y={highlight.top}
                                                                                                                        width={highlight.width}
                                                                                                                        height={highlight.height}
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
                                                                                                        mask={`url(#${stepAfterHighlightMaskId})`}
                                                                                                    />
                                                                                                </svg>
                                                                                            )}
                                                                                            {stepAfterHighlights.map(
                                                                                                (highlight, highlightIndex) => (
                                                                                                    <div
                                                                                                        key={`${tutorialId}-section-${sectionIndex}-step-${stepIndex}-after-highlight-${highlightIndex}`}
                                                                                                        className="documentation-step-highlight"
                                                                                                        style={{
                                                                                                            left: highlight.left,
                                                                                                            top: highlight.top,
                                                                                                            width: highlight.width,
                                                                                                            height: highlight.height,
                                                                                                        }}
                                                                                                    >
                                                                                                        {highlight.label && (
                                                                                                            <span
                                                                                                                className="documentation-step-highlight-label"
                                                                                                                style={getHighlightLabelStyle(highlight)}
                                                                                                            >
                                                                                                                {highlight.label}
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </div>
                                                                                                ),
                                                                                            )}
                                                                                        </div>
                                                                                        {stepDetails.imageAfterCaption && (
                                                                                            <figcaption className="documentation-step-caption">
                                                                                                {stepDetails.imageAfterCaption}
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
                                                    const stepImagePlacement =
                                                        stepDetails?.imagePlacement ?? 'afterSubSteps'
                                                    const stepAfterHighlights =
                                                        stepDetails?.imageAfterHighlights &&
                                                        stepDetails.imageAfterHighlights.length > 0
                                                            ? stepDetails.imageAfterHighlights
                                                            : stepDetails?.imageAfterHighlight
                                                              ? [stepDetails.imageAfterHighlight]
                                                              : []
                                                    const stepAfterHighlightMaskId = `${selectedTutorial.id}-step-${index}-highlight-mask-after`

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

                                                            {stepDetails?.imageSrc &&
                                                                stepImagePlacement === 'beforeSubSteps' && (
                                                                    <figure className="documentation-step-figure">
                                                                        <div className="documentation-step-image-wrapper">
                                                                            <img
                                                                                src={stepDetails.imageSrc}
                                                                                alt={
                                                                                    stepDetails.imageAlt ??
                                                                                    "Capture d'écran du tutoriel"
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
                                                                                                        x={highlight.left}
                                                                                                        y={highlight.top}
                                                                                                        width={highlight.width}
                                                                                                        height={highlight.height}
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
                                                                                            <span
                                                                                                className="documentation-step-highlight-label"
                                                                                                style={getHighlightLabelStyle(highlight)}
                                                                                            >
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

                                                            {visibleSubSteps.length > 0 && (
                                                                <ol className="documentation-substep-list">
                                                                    {visibleSubSteps.map(
                                                                        (subStep, subStepIndex) => {
                                                                            const subStepText =
                                                                                getStepText(subStep)
                                                                            const hasSubStepText =
                                                                                hasRenderableNode(subStepText)
                                                                            const nestedSubSteps =
                                                                                getVisibleSubSteps(subStep)
                                                                             const subStepDetails =
                                                                                 isTutorialStepObject(subStep)
                                                                                     ? subStep
                                                                                     : null
                                                                             const subStepHighlights =
                                                                                 getStepHighlights(subStep)
                                                                             const subStepImagePlacement =
                                                                                 subStepDetails?.imagePlacement ??
                                                                                 'afterSubSteps'
                                                                             const subStepHighlightMaskId = `${selectedTutorial.id}-step-${index}-substep-${subStepIndex}-highlight-mask`

                                                                            return (
                                                                                <li
                                                                                    key={`${selectedTutorial.id}-step-${index}-substep-${subStepIndex}`}
                                                                                    className="documentation-substep-item"
                                                                                >
                                                                                    {hasSubStepText && subStepText}
                                                                                    {subStepDetails?.imageSrc &&
                                                                                        subStepImagePlacement ===
                                                                                            'beforeSubSteps' && (
                                                                                            <figure className="documentation-step-figure">
                                                                                                <div className="documentation-step-image-wrapper">
                                                                                                    <img
                                                                                                        src={subStepDetails.imageSrc}
                                                                                                        alt={
                                                                                                            subStepDetails.imageAlt ??
                                                                                                            "Capture d'écran du tutoriel"
                                                                                                        }
                                                                                                        className="documentation-step-image"
                                                                                                    />
                                                                                                    {subStepHighlights.length > 0 && (
                                                                                                        <svg
                                                                                                            className="documentation-step-dim-overlay"
                                                                                                            viewBox="0 0 100 100"
                                                                                                            preserveAspectRatio="none"
                                                                                                            aria-hidden="true"
                                                                                                        >
                                                                                                            <defs>
                                                                                                                <mask id={subStepHighlightMaskId}>
                                                                                                                    <rect
                                                                                                                        x="0"
                                                                                                                        y="0"
                                                                                                                        width="100%"
                                                                                                                        height="100%"
                                                                                                                        fill="white"
                                                                                                                    />
                                                                                                                    {subStepHighlights.map(
                                                                                                                        (
                                                                                                                            highlight,
                                                                                                                            highlightIndex,
                                                                                                                        ) => (
                                                                                                                            <rect
                                                                                                                                key={`${subStepHighlightMaskId}-cutout-${highlightIndex}`}
                                                                                                                                x={highlight.left}
                                                                                                                                y={highlight.top}
                                                                                                                                width={highlight.width}
                                                                                                                                height={highlight.height}
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
                                                                                                                mask={`url(#${subStepHighlightMaskId})`}
                                                                                                            />
                                                                                                        </svg>
                                                                                                    )}
                                                                                                    {subStepHighlights.map(
                                                                                                        (
                                                                                                            highlight,
                                                                                                            highlightIndex,
                                                                                                        ) => (
                                                                                                            <div
                                                                                                                key={`${selectedTutorial.id}-step-${index}-substep-${subStepIndex}-highlight-${highlightIndex}`}
                                                                                                                className="documentation-step-highlight"
                                                                                                                style={{
                                                                                                                    left: highlight.left,
                                                                                                                    top: highlight.top,
                                                                                                                    width: highlight.width,
                                                                                                                    height: highlight.height,
                                                                                                                }}
                                                                                                            >
                                                                                                                {highlight.label && (
                                                                                                                    <span
                                                                                                                        className="documentation-step-highlight-label"
                                                                                                                        style={getHighlightLabelStyle(highlight)}
                                                                                                                    >
                                                                                                                        {highlight.label}
                                                                                                                    </span>
                                                                                                                )}
                                                                                                            </div>
                                                                                                        ),
                                                                                                    )}
                                                                                                </div>
                                                                                                {subStepDetails.imageCaption && (
                                                                                                    <figcaption className="documentation-step-caption">
                                                                                                        {subStepDetails.imageCaption}
                                                                                                    </figcaption>
                                                                                                )}
                                                                                            </figure>
                                                                                        )}
                                                                                                                        {nestedSubSteps.length > 0 && (
                                        <ol className="documentation-substep-list documentation-subsubstep-list">
                                            {nestedSubSteps.map((nestedSubStep, nestedSubStepIndex) => {
                                                const nestedSubStepText = getStepText(nestedSubStep)
                                                const hasNestedSubStepText = hasRenderableNode(nestedSubStepText)
                                                const nestedSubStepDetails = isTutorialStepObject(nestedSubStep)
                                                    ? nestedSubStep
                                                    : null
                                                const nestedSubStepHighlights = getStepHighlights(nestedSubStep)
                                                const nestedSubStepHighlightMaskId = `${selectedTutorial.id}-step-${index}-substep-${subStepIndex}-subsubstep-${nestedSubStepIndex}-highlight-mask`

                                                return (
                                                    <li
                                                        key={`${selectedTutorial.id}-step-${index}-substep-${subStepIndex}-subsubstep-${nestedSubStepIndex}`}
                                                        className="documentation-substep-item documentation-subsubstep-item"
                                                    >
                                                        {hasNestedSubStepText && nestedSubStepText}
                                                        {nestedSubStepDetails?.imageSrc && (
                                                            <figure className="documentation-step-figure">
                                                                <div className="documentation-step-image-wrapper">
                                                                    <img
                                                                        src={nestedSubStepDetails.imageSrc}
                                                                        alt={
                                                                            nestedSubStepDetails.imageAlt ??
                                                                            "Capture d'écran du tutoriel"
                                                                        }
                                                                        className="documentation-step-image"
                                                                    />
                                                                    {nestedSubStepHighlights.length > 0 && (
                                                                        <svg
                                                                            className="documentation-step-dim-overlay"
                                                                            viewBox="0 0 100 100"
                                                                            preserveAspectRatio="none"
                                                                            aria-hidden="true"
                                                                        >
                                                                            <defs>
                                                                                <mask id={nestedSubStepHighlightMaskId}>
                                                                                    <rect
                                                                                        x="0"
                                                                                        y="0"
                                                                                        width="100%"
                                                                                        height="100%"
                                                                                        fill="white"
                                                                                    />
                                                                                    {nestedSubStepHighlights.map(
                                                                                        (highlight, highlightIndex) => (
                                                                                            <rect
                                                                                                key={`${nestedSubStepHighlightMaskId}-cutout-${highlightIndex}`}
                                                                                                x={highlight.left}
                                                                                                y={highlight.top}
                                                                                                width={highlight.width}
                                                                                                height={highlight.height}
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
                                                                                mask={`url(#${nestedSubStepHighlightMaskId})`}
                                                                            />
                                                                        </svg>
                                                                    )}
                                                                    {nestedSubStepHighlights.map((highlight, highlightIndex) => (
                                                                        <div
                                                                            key={`${selectedTutorial.id}-step-${index}-substep-${subStepIndex}-subsubstep-${nestedSubStepIndex}-highlight-${highlightIndex}`}
                                                                            className="documentation-step-highlight"
                                                                            style={{
                                                                                left: highlight.left,
                                                                                top: highlight.top,
                                                                                width: highlight.width,
                                                                                height: highlight.height,
                                                                            }}
                                                                        >
                                                                            {highlight.label && (
                                                                                <span
                                                                                    className="documentation-step-highlight-label"
                                                                                    style={getHighlightLabelStyle(highlight)}
                                                                                >
                                                                                    {highlight.label}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                {nestedSubStepDetails.imageCaption && (
                                                                    <figcaption className="documentation-step-caption">
                                                                        {nestedSubStepDetails.imageCaption}
                                                                    </figcaption>
                                                                )}
                                                            </figure>
                                                        )}
                                                    </li>
                                                )
                                            })}
                                        </ol>
                                    )}
                                                                                    {subStepDetails?.imageSrc &&
                                                                                        subStepImagePlacement !==
                                                                                            'beforeSubSteps' && (
                                                                                        <figure className="documentation-step-figure">
                                                                                            <div className="documentation-step-image-wrapper">
                                                                                                <img
                                                                                                    src={subStepDetails.imageSrc}
                                                                                                    alt={
                                                                                                        subStepDetails.imageAlt ??
                                                                                                        "Capture d'écran du tutoriel"
                                                                                                    }
                                                                                                    className="documentation-step-image"
                                                                                                />
                                                                                                {subStepHighlights.length > 0 && (
                                                                                                    <svg
                                                                                                        className="documentation-step-dim-overlay"
                                                                                                        viewBox="0 0 100 100"
                                                                                                        preserveAspectRatio="none"
                                                                                                        aria-hidden="true"
                                                                                                    >
                                                                                                        <defs>
                                                                                                            <mask id={subStepHighlightMaskId}>
                                                                                                                <rect
                                                                                                                    x="0"
                                                                                                                    y="0"
                                                                                                                    width="100%"
                                                                                                                    height="100%"
                                                                                                                    fill="white"
                                                                                                                />
                                                                                                                {subStepHighlights.map(
                                                                                                                    (
                                                                                                                        highlight,
                                                                                                                        highlightIndex,
                                                                                                                    ) => (
                                                                                                                        <rect
                                                                                                                            key={`${subStepHighlightMaskId}-cutout-${highlightIndex}`}
                                                                                                                            x={highlight.left}
                                                                                                                            y={highlight.top}
                                                                                                                            width={highlight.width}
                                                                                                                            height={highlight.height}
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
                                                                                                            mask={`url(#${subStepHighlightMaskId})`}
                                                                                                        />
                                                                                                    </svg>
                                                                                                )}
                                                                                                {subStepHighlights.map(
                                                                                                    (
                                                                                                        highlight,
                                                                                                        highlightIndex,
                                                                                                    ) => (
                                                                                                        <div
                                                                                                            key={`${selectedTutorial.id}-step-${index}-substep-${subStepIndex}-highlight-${highlightIndex}`}
                                                                                                            className="documentation-step-highlight"
                                                                                                            style={{
                                                                                                                left: highlight.left,
                                                                                                                top: highlight.top,
                                                                                                                width: highlight.width,
                                                                                                                height: highlight.height,
                                                                                                            }}
                                                                                                        >
                                                                                                            {highlight.label && (
                                                                                                                <span
                                                                                                                    className="documentation-step-highlight-label"
                                                                                                                    style={getHighlightLabelStyle(highlight)}
                                                                                                                >
                                                                                                                    {highlight.label}
                                                                                                                </span>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    ),
                                                                                                )}
                                                                                            </div>
                                                                                            {subStepDetails.imageCaption && (
                                                                                                <figcaption className="documentation-step-caption">
                                                                                                    {subStepDetails.imageCaption}
                                                                                                </figcaption>
                                                                                            )}
                                                                                        </figure>
                                                                                    )}
                                                                                </li>
                                                                            )
                                                                        },
                                                                    )}
                                                                </ol>
                                                            )}

                                                            {stepDetails?.imageSrc &&
                                                                                    stepImagePlacement !== 'beforeSubSteps' && (
                                                                    <figure className="documentation-step-figure">
                                                                        <div className="documentation-step-image-wrapper">
                                                                            <img
                                                                                src={stepDetails.imageSrc}
                                                                                alt={
                                                                                    stepDetails.imageAlt ??
                                                                                    "Capture d'écran du tutoriel"
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
                                                                                            <span
                                                                                                className="documentation-step-highlight-label"
                                                                                                style={getHighlightLabelStyle(highlight)}
                                                                                            >
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

                                                            {stepDetails?.imageAfterSrc && (
                                                                <figure className="documentation-step-figure">
                                                                    <div className="documentation-step-image-wrapper">
                                                                        <img
                                                                            src={stepDetails.imageAfterSrc}
                                                                            alt={
                                                                                stepDetails.imageAfterAlt ??
                                                                                "Capture d'écran du tutoriel"
                                                                            }
                                                                            className="documentation-step-image"
                                                                        />
                                                                        {stepAfterHighlights.length > 0 && (
                                                                            <svg
                                                                                className="documentation-step-dim-overlay"
                                                                                viewBox="0 0 100 100"
                                                                                preserveAspectRatio="none"
                                                                                aria-hidden="true"
                                                                            >
                                                                                <defs>
                                                                                    <mask id={stepAfterHighlightMaskId}>
                                                                                        <rect
                                                                                            x="0"
                                                                                            y="0"
                                                                                            width="100%"
                                                                                            height="100%"
                                                                                            fill="white"
                                                                                        />
                                                                                        {stepAfterHighlights.map(
                                                                                            (highlight, highlightIndex) => (
                                                                                                <rect
                                                                                                    key={`${stepAfterHighlightMaskId}-cutout-${highlightIndex}`}
                                                                                                    x={highlight.left}
                                                                                                    y={highlight.top}
                                                                                                    width={highlight.width}
                                                                                                    height={highlight.height}
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
                                                                                    mask={`url(#${stepAfterHighlightMaskId})`}
                                                                                />
                                                                            </svg>
                                                                        )}
                                                                        {stepAfterHighlights.map(
                                                                            (highlight, highlightIndex) => (
                                                                                <div
                                                                                    key={`${selectedTutorial.id}-step-${index}-after-highlight-${highlightIndex}`}
                                                                                    className="documentation-step-highlight"
                                                                                    style={{
                                                                                        left: highlight.left,
                                                                                        top: highlight.top,
                                                                                        width: highlight.width,
                                                                                        height: highlight.height,
                                                                                    }}
                                                                                >
                                                                                    {highlight.label && (
                                                                                        <span
                                                                                            className="documentation-step-highlight-label"
                                                                                            style={getHighlightLabelStyle(highlight)}
                                                                                        >
                                                                                            {highlight.label}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                    {stepDetails.imageAfterCaption && (
                                                                        <figcaption className="documentation-step-caption">
                                                                            {stepDetails.imageAfterCaption}
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
                                Le contenu détaillé sera ajouté dans une prochaine étape.
                            </p>
                        )}
                    </div>
                </SectionCard>
            </div>
            <ConfirmDialog
                open={isExportDialogOpen}
                title="Exporter les tutoriels"
                message={exportDialogContent}
                confirmLabel={isExporting ? 'Export en cours...' : 'Exporter PDF'}
                cancelLabel="Fermer"
                confirmClassName="btn-primary"
                cancelClassName="btn-tertiary"
                confirmDisabled={exportSelection.size === 0 || isExporting}
                onConfirm={() => {
                    void handleExportPdf(() => setIsExportDialogOpen(false))
                }}
                onCancel={() => setIsExportDialogOpen(false)}
                onRequestClose={() => setIsExportDialogOpen(false)}
                cardClassName="documentation-export-dialog-card"
            />
        </>
    )
}


