// src/pages/PlanningMacro.tsx
// @ts-ignore
import React, { useState, useEffect, JSX } from 'react'
import Checklist from '../components/Checklist'
import PageHeader from "../components/common/PageHeader";

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
        { id: 'promos',    label: 'Toutes les promotions sont créées',                     status: 'ok',    checked: true,  warning: false },
        { id: 'periodes',  label: 'Toutes les périodes de présence ont été remplies',      status: 'ok',    checked: true  },
        { id: 'maquettes', label: 'Les maquettes de chaque promotion créée ont été ajoutées', status: 'ok',    checked: true  },
        { id: 'events',    label: 'Les événements majeurs du campus ont été renseignés',  status: 'alert', checked: false },
    ])

    useEffect(() => {
        setMacroItems(prev =>
            prev.map(it =>
                it.id === 'promos'
                    ? { ...it, warning: hasPromosMismatch }
                    : it
            )
        )
    }, [hasPromosMismatch]);

    const [microItems, setMicroItems] = useState<ChecklistItem[]>([
        { id: 'teachers',     label: 'Tous les enseignants sont créés',                       status: 'ok',    checked: true  },
        { id: 'rooms',        label: 'Toutes les salles sont créées',                          status: 'ok',    checked: true  },
        { id: 'matieres',     label: 'Toutes les matières sont créées',                        status: 'ok',    checked: true  },
        { id: 'constraints',  label: 'Les indisponibilités ont été renseignées',               status: 'alert', checked: false },
    ])

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
                    <Checklist items={macroItems} onToggle={toggleMacroItem} />

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
                    <Checklist items={microItems} onToggle={toggleMicroItem} />

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
