import React, { useMemo, useState } from 'react'
import PageHeader from '../components/common/PageHeader'
import SectionCard from '../components/common/SectionCard'

type TutorialTab = 'planning' | 'pages'

type TutorialId =
    | 'macro'
    | 'micro'
    | 'promotions'
    | 'events'
    | 'teachers'
    | 'rooms'
    | 'matieres'
    | 'settings'

type TutorialItem = {
    id: TutorialId
    title: string
    summary: string
    tab: TutorialTab
}

type TutorialContent = {
    objective: string
    expectedResult: string
    steps: string[]
    tips: string[]
}

type DocumentationSectionKey = 'selector' | 'viewer'

const TAB_ITEMS: Array<{ key: TutorialTab; label: string }> = [
    { key: 'planning', label: 'Flux planning' },
    { key: 'pages', label: 'Par page' },
]

const TUTORIAL_ITEMS: TutorialItem[] = [
    {
        id: 'macro',
        title: 'Generer un planning macro',
        summary: 'Flux global de generation et validation du planning macro.',
        tab: 'planning',
    },
    {
        id: 'micro',
        title: 'Generer un planning micro',
        summary: 'Etapes de construction du planning micro a partir du macro.',
        tab: 'planning',
    },
    {
        id: 'promotions',
        title: 'Tutoriel - Promotions',
        summary: 'Creer, modifier et organiser les promotions et leurs groupes.',
        tab: 'pages',
    },
    {
        id: 'events',
        title: 'Tutoriel - Evenements',
        summary: 'Ajouter, ajuster et suivre les evenements planifies.',
        tab: 'pages',
    },
    {
        id: 'teachers',
        title: 'Tutoriel - Enseignants',
        summary: 'Gerer les profils enseignants et leur mode d intervention.',
        tab: 'pages',
    },
    {
        id: 'rooms',
        title: 'Tutoriel - Salles',
        summary: 'Configurer les salles et leurs caracteristiques pedagogiques.',
        tab: 'pages',
    },
    {
        id: 'matieres',
        title: 'Tutoriel - Matieres',
        summary: 'Administrer les matieres et leurs parametres associes.',
        tab: 'pages',
    },
    {
        id: 'settings',
        title: 'Tutoriel - Parametres',
        summary: 'Utiliser les options de compte, apparence et accessibilite.',
        tab: 'pages',
    },
]

const TUTORIAL_CONTENT: Record<TutorialId, TutorialContent> = {
    macro: {
        objective: 'Construire un planning macro realiste sur la periode cible.',
        expectedResult:
            'Un planning macro coherent est genere et pret a servir de base pour le micro.',
        steps: [
            'Verifier que les promotions, matieres, enseignants et salles sont a jour.',
            'Definir ou controler les contraintes globales de planning.',
            'Lancer la generation macro depuis le module de planification.',
            'Relire les alertes et ajuster les donnees si des conflits sont signales.',
            'Valider le scenario retenu et enregistrer la version de reference.',
        ],
        tips: [
            'Travailler d abord sur un perimetre reduit avant de lancer un calcul complet.',
            'Conserver une version valide avant chaque regeneration importante.',
        ],
    },
    micro: {
        objective:
            'Decliner le planning macro en planification fine exploitable au quotidien.',
        expectedResult:
            'Le planning micro est renseigne avec des affectations detaillees et controlables.',
        steps: [
            'Charger la base macro validee comme point de depart.',
            'Affecter precisement les ressources sur les seances a planifier.',
            'Verifier les collisions horaires et les indisponibilites.',
            'Ajuster les evenements ponctuels qui impactent la semaine.',
            'Valider puis publier la version micro finalisee.',
        ],
        tips: [
            'Appliquer les corrections en lots courts pour limiter les effets de bord.',
            'Verifier les sections les plus contraintes en priorite.',
        ],
    },
    promotions: {
        objective:
            'Creer et maintenir les promotions avec leurs structures pedagogiques.',
        expectedResult:
            'La promotion est complete, structuree et exploitable par les modules de planning.',
        steps: [
            'Ouvrir la page Promotions puis selectionner le cycle concerne.',
            'Ajouter ou editer la promotion avec son identite principale.',
            'Renseigner les groupes et sous-groupes necessaires.',
            'Completer les specialites et contraintes associees.',
            'Valider les modifications et controler le rendu dans la liste.',
        ],
        tips: [
            'Nommer les groupes de facon stable pour faciliter les imports futurs.',
            'Reverifier les contraintes avant de lancer une generation de planning.',
        ],
    },
    events: {
        objective:
            'Gerer les evenements planifies ou exceptionnels qui impactent la planification.',
        expectedResult:
            'Les evenements sont correctement enregistres et pris en compte dans les emplois du temps.',
        steps: [
            'Acceder a la page Evenements et filtrer la periode de travail.',
            'Creer un evenement en choisissant le bon type et les bonnes dates.',
            'Associer la promotion ou les ressources impactees.',
            'Verifier les chevauchements signales et corriger si besoin.',
            'Confirmer la creation puis suivre l evenement dans la vue de liste.',
        ],
        tips: [
            'Utiliser des libelles explicites pour distinguer rapidement les evenements.',
            'En cas de doute, verifier les conflits avant validation finale.',
        ],
    },
    teachers: {
        objective:
            'Administrer les profils enseignants et leurs disponibilites pour la planification.',
        expectedResult:
            'Les fiches enseignants sont fiables et permettent des affectations sans incoherence.',
        steps: [
            'Ouvrir la page Enseignants et utiliser la recherche pour cibler une fiche.',
            'Creer ou editer les informations de profil de l enseignant.',
            'Renseigner le mode d intervention et les matieres associees.',
            'Verifier les informations de contact et les disponibilites.',
            'Enregistrer et controler la coherence de la carte enseignant.',
        ],
        tips: [
            'Uniformiser les noms et prenoms pour eviter les doublons.',
            'Mettre a jour les matieres avant les periodes de generation.',
        ],
    },
    rooms: {
        objective:
            'Configurer les salles et leurs caracteristiques pour des affectations precises.',
        expectedResult:
            'Chaque salle est correctement typee et disponible pour les besoins de planification.',
        steps: [
            'Entrer sur la page Salles puis afficher la zone a mettre a jour.',
            'Ajouter ou modifier une salle avec ses informations principales.',
            'Renseigner le type de salle et les attributs utiles.',
            'Controler les conflits de disponibilite ou de compatibilite.',
            'Sauvegarder puis valider la presence de la salle dans la grille.',
        ],
        tips: [
            'Utiliser une convention de nommage claire par batiment et numero.',
            'Verifier regulierement les types de salles critiques pour les TP.',
        ],
    },
    matieres: {
        objective:
            'Maintenir le catalogue des matieres utilisees dans les maquettes et plannings.',
        expectedResult:
            'Les matieres sont a jour et directement reutilisables dans les affectations.',
        steps: [
            'Acceder a la page Matieres puis filtrer le perimetre cible.',
            'Creer ou editer une matiere avec ses attributs essentiels.',
            'Associer les informations utiles a la planification.',
            'Verifier la coherence des libelles et des donnees saisies.',
            'Valider les changements et controler la disponibilite en liste.',
        ],
        tips: [
            'Eviter les doublons de nom en definissant une nomenclature commune.',
            'Revoir les matieres inactives avant chaque nouveau semestre.',
        ],
    },
    settings: {
        objective:
            'Ajuster les preferences utilisateur et d affichage pour un usage confortable.',
        expectedResult:
            'Le poste est configure avec les bons parametres visuels et d accessibilite.',
        steps: [
            'Ouvrir la page Parametres puis identifier la section a modifier.',
            'Ajuster les options d apparence selon le besoin utilisateur.',
            'Configurer les options d accessibilite disponibles.',
            'Verifier les preferences d affichage des icones si necessaire.',
            'Confirmer que les regles sont bien appliquees sur l interface.',
        ],
        tips: [
            'Tester les changements de theme sur plusieurs pages pour valider la lisibilite.',
            'Conserver des reglages simples et stables pour limiter les erreurs de manipulation.',
        ],
    },
}

const firstTutorialForTab = (tab: TutorialTab): TutorialId => {
    const match = TUTORIAL_ITEMS.find((item) => item.tab === tab)
    return match ? match.id : 'macro'
}

const isTutorialInTab = (tutorialId: TutorialId, tab: TutorialTab): boolean =>
    TUTORIAL_ITEMS.some((item) => item.id === tutorialId && item.tab === tab)

export default function Documentation() {
    const [activeTab, setActiveTab] = useState<TutorialTab>('planning')
    const [selectedTutorialId, setSelectedTutorialId] = useState<TutorialId>('macro')
    const [expandedSections, setExpandedSections] = useState<
        Record<DocumentationSectionKey, boolean>
    >({
        selector: true,
        viewer: true,
    })

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
                                    <h3 className="documentation-viewer-title">Etapes</h3>
                                    <ol className="documentation-step-list">
                                        {selectedTutorialContent.steps.map((step, index) => (
                                            <li
                                                key={`${selectedTutorial.id}-step-${index}`}
                                                className="documentation-step-item"
                                            >
                                                {step}
                                            </li>
                                        ))}
                                    </ol>
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

