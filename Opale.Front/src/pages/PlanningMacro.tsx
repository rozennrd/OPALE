// src/pages/PlanningMacro.tsx
// @ts-ignore
import React, { useState, useEffect, JSX } from 'react'
import Checklist from '../components/Checklist'
import PageHeader from "../components/common/PageHeader";
import SectionHeader from '../components/common/SectionHeader'

const RACINE_FETCHER_URL = import.meta.env.VITE_RACINE_FETCHER_URL;

interface ChecklistItem {
    id: string;
    label: string;
    status: 'ok' | 'alert';
    checked: boolean;
    warning?: boolean;
}

export default function PlanningMacro(): React.ReactElement {

    const [hasPromosMismatch, setHasPromosMismatch] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false
        return window.localStorage.getItem('opale:promosMismatch') === '1'
    });

    useEffect(() => {
        const flag = window.localStorage.getItem('opale:promosMismatch') === '1'
        setHasPromosMismatch(flag)
    }, []);

    const [macroItems, setMacroItems] = useState<ChecklistItem[]>([
        { id: 'cycles-promos', label: 'Avoir créé tous les cycles et toutes les promos', status: 'ok', checked: false, warning: false },
        { id: 'dates',         label: 'Avoir renseigné au moins date de début et de fin, avoir rempli les autres contraintes de dates', status: 'ok', checked: false },
        { id: 'events',        label: 'Avoir créé tous les événements exceptionnels', status: 'alert', checked: false },
        { id: 'show-macro',    label: "Avoir activé l'affichage macro sur chaque événement", status: 'ok', checked: false },
        { id: 'target',        label: 'Avoir correctement ciblé chaque événement (Junia ou externe)', status: 'ok', checked: false },
    ])

    const [macroSectionsOpen, setMacroSectionsOpen] = useState<Record<string, boolean>>({
        promotions: true,
        events: true,
    })

    useEffect(() => {
        setMacroItems(prev =>
            prev.map(it =>
                it.id === 'cycles-promos'
                    ? { ...it, warning: hasPromosMismatch }
                    : it
            )
        )
    }, [hasPromosMismatch]);

    const [microItems, setMicroItems] = useState<ChecklistItem[]>([
        { id: 'cycles-promos',  label: 'Avoir créé tous les cycles et toutes les promos', status: 'ok', checked: false },
        { id: 'dates',          label: 'Avoir renseigné au moins date de début et de fin, avoir rempli les autres contraintes de dates', status: 'ok', checked: false },
        { id: 'constraints',    label: "Avoir renseigné les contraintes d'effectifs, de groupes et de spécialités", status: 'alert', checked: false },
        { id: 'maquettes',      label: "Avoir transmis (drag and drop) toutes les maquettes pédagogiques et avoir cliqué sur importer", status: 'alert', checked: false },
        { id: 'events',         label: 'Avoir créé tous les événements exceptionnels', status: 'alert', checked: false },
        { id: 'show-micro',     label: "Avoir activé l'affichage micro sur chaque événement", status: 'ok', checked: false },
        { id: 'target',         label: "Avoir correctement ciblé chaque événement (Junia ou externe), si Junia avoir ciblé correctement la promo concernée si une promo est concernée", status: 'alert', checked: false },
        { id: 'teachers',       label: 'Avoir créé tous les enseignants et renseigné correctement leurs infos, notamment période de disponibilité et type', status: 'ok', checked: false },
        { id: 'rooms',          label: 'Avoir toutes les salles bien renseignées (type, capacité et disponibilité globale)', status: 'ok', checked: false },
        { id: 'matieres',       label: "Avoir toutes les matières bien présentes après l'importation des maquettes pédagogiques", status: 'ok', checked: false },
        { id: 'volumes',        label: 'Avoir correctement attribué les profs et leurs volumes horaires à chaque matière', status: 'alert', checked: false },
    ])

    const [microSectionsOpen, setMicroSectionsOpen] = useState<Record<string, boolean>>({
        promotions: true,
        events: true,
        teachers: true,
        rooms: true,
        matieres: true,
    })

    const macroSections = [
        {
            id: 'promotions',
            title: 'Promotions',
            itemIds: ['cycles-promos', 'dates'],
        },
        {
            id: 'events',
            title: 'Événements',
            itemIds: ['events', 'show-macro', 'target'],
        },
    ]

    const microSections = [
        {
            id: 'promotions',
            title: 'Promotions',
            itemIds: ['cycles-promos', 'dates', 'constraints', 'maquettes'],
        },
        {
            id: 'events',
            title: 'Événements',
            itemIds: ['events', 'show-micro', 'target'],
        },
        {
            id: 'teachers',
            title: 'Enseignants',
            itemIds: ['teachers'],
        },
        {
            id: 'rooms',
            title: 'Salles',
            itemIds: ['rooms'],
        },
        {
            id: 'matieres',
            title: 'Matières',
            itemIds: ['matieres', 'volumes'],
        },
    ]

    const mapItemsById = (items: ChecklistItem[], ids: string[]) =>
        ids
            .map((id) => {
                const index = items.findIndex((item) => item.id === id)
                return index >= 0 ? { item: items[index], index } : null
            })
            .filter((entry): entry is { item: ChecklistItem; index: number } => entry !== null)

    const toggleMacroItem = (index: number, checked: boolean): void => {
        setMacroItems(prev => {
            const next = [...prev]
            next[index] = { ...next[index], checked }
            return next
        })
    }

    const toggleMicroItem = (index: number, checked: boolean): void => {
        setMicroItems(prev => {
            const next = [...prev]
            next[index] = { ...next[index], checked }
            return next
        })
    }

    const handleGenerateMicro = (): void => {
        console.log('[CHECKLIST] generate micro')
    }

    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [fileReady, setFileReady] = useState(false)

    // === Génération de la macro-planification ===
    const handleGenerate = async () => {
        setIsLoading(true)
        setMessage(null)
        setFileReady(false)

        try {
            const response = await fetch(`${RACINE_FETCHER_URL}/generateEdtMacro`, {
                method: 'POST',
                headers: {
                    "x-access-token": localStorage.getItem('authToken') ?? '',
                },
                credentials: "include"
            });


            if (!response.ok) {
                throw new Error(`Erreur côté serveur, status ${response.status} \n${await response.text()}`)
            }

            setMessage("La macro a été générée avec succès !");
            setFileReady(true);

        } catch (err) {
            console.error(err)
            setMessage("Erreur lors de la génération de la macro.")
        } finally {
            setIsLoading(false)
        }
    };

    // === Téléchargement via BLOB ===
    const downloadEDTFile = async () => {
        try {
            setIsLoading(true)
            setMessage(null)

            const response = await fetch(`${RACINE_FETCHER_URL}/download/EdtMacro`, {
                method: 'GET',
                headers: {
                    "x-access-token": localStorage.getItem('authToken') ?? '',
                },
            });

            if (!response.ok) {
                throw new Error(`Erreur côté serveur, status ${response.status}\n${await response.text()}`)
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "EdtMacro.xlsx";
            document.body.appendChild(a);
            a.click();

            a.remove();
            window.URL.revokeObjectURL(url);

            setMessage("Téléchargement terminé !");

        } catch (err) {
            console.error(err);
            setMessage("Erreur lors du téléchargement.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="planning-page">
            {/* TITRE & SOUS-TITRE */}
            <PageHeader
                title="Génération des plannings"
                subtitle="Cochez chaque point uniquement s’il a été renseigné."
            />

            {/* CONTENU DE LA PAGE */}
            <div className="planning-columns">
                <section className="planning-column planning-column--macro">
                    <h2 className="planning-column-title">Macro</h2>
                    <div className="planning-checklist">
                        {macroSections.map((section) => {
                            const sectionItems = mapItemsById(macroItems, section.itemIds)
                            const isOpen = macroSectionsOpen[section.id] ?? true

                            return (
                                <div className="planning-section" key={section.id}>
                                    <SectionHeader
                                        title={section.title}
                                        isOpen={isOpen}
                                        onToggle={() =>
                                            setMacroSectionsOpen((prev) => ({
                                                ...prev,
                                                [section.id]: !isOpen,
                                            }))
                                        }
                                        wrapperClassName="planning-section-header"
                                        titleClassName="planning-section-title"
                                        chevronClassName="planning-section-chevron"
                                    />

                                    {isOpen && (
                                        <div className="planning-section-body">
                                            <Checklist
                                                items={sectionItems.map((entry) => entry.item)}
                                                onToggle={(localIndex, checked) => {
                                                    const target = sectionItems[localIndex]
                                                    if (target) {
                                                        toggleMacroItem(target.index, checked)
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    <div className="planning-column-actions">
                        <button
                            className="btn-primary btn-generate"
                            onClick={handleGenerate}
                            disabled={isLoading}
                        >
                            Générer le planning<br/>macro
                        </button>

                        {isLoading && <p>Génération en cours...</p>}
                        {message && <p>{message}</p>}

                        {fileReady && (
                            <button
                                className="btn-primary"
                                onClick={downloadEDTFile}
                                style={{ marginTop: '1rem' }}
                            >
                                Télécharger le fichier
                            </button>
                        )}
                    </div>
                </section>

                <section className="planning-column planning-column--micro">
                    <h2 className="planning-column-title">Micro</h2>
                    <div className="planning-checklist">
                        {microSections.map((section) => {
                            const sectionItems = mapItemsById(microItems, section.itemIds)
                            const isOpen = microSectionsOpen[section.id] ?? true

                            return (
                                <div className="planning-section" key={section.id}>
                                    <SectionHeader
                                        title={section.title}
                                        isOpen={isOpen}
                                        onToggle={() =>
                                            setMicroSectionsOpen((prev) => ({
                                                ...prev,
                                                [section.id]: !isOpen,
                                            }))
                                        }
                                        wrapperClassName="planning-section-header"
                                        titleClassName="planning-section-title"
                                        chevronClassName="planning-section-chevron"
                                    />

                                    {isOpen && (
                                        <div className="planning-section-body">
                                            <Checklist
                                                items={sectionItems.map((entry) => entry.item)}
                                                onToggle={(localIndex, checked) => {
                                                    const target = sectionItems[localIndex]
                                                    if (target) {
                                                        toggleMicroItem(target.index, checked)
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    <div className="planning-column-actions">
                        <button
                            className="btn-primary btn-generate"
                            onClick={handleGenerateMicro}
                        >
                            Générer le planning<br/>micro
                        </button>
                    </div>
                </section>
            </div>
        </div>
    )
}
