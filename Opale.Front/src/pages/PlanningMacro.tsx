// src/pages/PlanningMacro.tsx
// @ts-ignore
import React, { useState, useEffect } from 'react'
import Checklist from '../components/Checklist'

interface ChecklistItem {
    id: string
    label: string
    status: 'ok' | 'alert'
    checked: boolean
    warning?: boolean
}

export default function PlanningMacro(): Element {
    const [hasPromosMismatch, setHasPromosMismatch] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false
        return window.localStorage.getItem('opale:promosMismatch') === '1'
    })

    useEffect(() => {
        if (typeof window === 'undefined') return
        const flag = window.localStorage.getItem('opale:promosMismatch') === '1'
        setHasPromosMismatch(flag)
    }, [])

    const [items, setItems] = useState<ChecklistItem[]>([
        { id: 'promos',    label: 'Toutes les promotions sont créé',                     status: 'ok',    checked: true,  warning: false },
        { id: 'periodes',  label: 'Toutes les période de présence ont été remplit',      status: 'ok',    checked: true  },
        { id: 'maquettes', label: 'Les maquettes de chaque promos créé ont été ajoutée', status: 'ok',    checked: true  },
        { id: 'events',    label: 'Les évènements majeur du campus ont été renseignés',  status: 'alert', checked: false },
    ])

    // Met à jour dynamiquement le warning sur la ligne "promos"
    useEffect(() => {
        setItems((prev: ChecklistItem[]) =>
            prev.map((it: ChecklistItem) =>
                it.id === 'promos'
                    ? { ...it, warning: hasPromosMismatch }
                    : it
            )
        )
    }, [hasPromosMismatch])

    const toggleItem = (index: number, checked: boolean): void => {
        setItems((prev: ChecklistItem[]) => {
            const next = [...prev]
            next[index] = { ...next[index], checked }
            return next
        })
    }

    const handleGenerate = (): void => {
        const payload = items.map(i => ({ id: i.id, checked: i.checked }))
        console.log('[GENERATION PLANNING MACRO]', payload)
    }

    return (
        <>
            <h2 className="page-title">Génération planning macro</h2>
            <p className="page-sub">Sélectionnez chacun de ces points s'il a été renseigné.</p>

            <Checklist items={items} onToggle={toggleItem} />

            <button className="btn-primary btn-generate" onClick={handleGenerate}>
                Générer Planning<br/>Macro
            </button>
        </>
    )
}
