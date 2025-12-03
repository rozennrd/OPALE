// src/pages/PlanningMacro.tsx
// @ts-ignore
import React, { useState, useEffect } from 'react'
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

export default function PlanningMacro(): React.ReactElement<any> {

    const [hasPromosMismatch, setHasPromosMismatch] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false
        return window.localStorage.getItem('opale:promosMismatch') === '1'
    });

    useEffect(() => {
        const flag = window.localStorage.getItem('opale:promosMismatch') === '1'
        setHasPromosMismatch(flag)
    }, []);

    const [items, setItems] = useState<ChecklistItem[]>([
        { id: 'promos',    label: 'Toutes les promotions sont créé',                     status: 'ok',    checked: true,  warning: false },
        { id: 'periodes',  label: 'Toutes les période de présence ont été remplit',      status: 'ok',    checked: true  },
        { id: 'maquettes', label: 'Les maquettes de chaque promos créé ont été ajoutée', status: 'ok',    checked: true  },
        { id: 'events',    label: 'Les évènements majeur du campus ont été renseignés',  status: 'alert', checked: false },
    ]);

    useEffect(() => {
        setItems(prev =>
            prev.map(it =>
                it.id === 'promos'
                    ? { ...it, warning: hasPromosMismatch }
                    : it
            )
        )
    }, [hasPromosMismatch]);

    const toggleItem = (index: number, checked: boolean): void => {
        setItems(prev => {
            const next = [...prev]
            next[index] = { ...next[index], checked }
            return next
        })
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
        <>
            {/* TITRE & SOUS-TITRE */}
            <PageHeader
                title="Génération planning macro"
                subtitle="Sélectionnez chacun de ces points s'il a été renseigné."
            />

            {/* CONTENU DE LA PAGE */}
            <Checklist items={items} onToggle={toggleItem} />

            <button
                className="btn-primary btn-generate"
                onClick={handleGenerate}
                disabled={isLoading}
            >
                Générer Planning<br/>Macro
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
        </>
    )
}