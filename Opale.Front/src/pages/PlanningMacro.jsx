// src/pages/PlanningMacro.jsx
import React, { useState, useEffect } from 'react'
import Checklist from '../components/Checklist.jsx'

export default function PlanningMacro() {
    const [hasPromosMismatch, setHasPromosMismatch] = useState(() => {
        if (typeof window === 'undefined') return false
        return window.localStorage.getItem('opale:promosMismatch') === '1'
    })

    useEffect(() => {
        if (typeof window === 'undefined') return
        const flag = window.localStorage.getItem('opale:promosMismatch') === '1'
        setHasPromosMismatch(flag)
    }, [])

    const [items, setItems] = useState([
        { id: 'promos',    label: 'Toutes les promotions sont créé',                     status: 'ok',    checked: true,  warning: false },
        { id: 'periodes',  label: 'Toutes les période de présence ont été remplit',      status: 'ok',    checked: true  },
        { id: 'maquettes', label: 'Les maquettes de chaque promos créé ont été ajoutée', status: 'ok',    checked: true  },
        { id: 'events',    label: 'Les évènements majeur du campus ont été renseignés',  status: 'alert', checked: false },
    ])

    // Met à jour dynamiquement le warning sur la ligne "promos"
    useEffect(() => {
        setItems(prev =>
            prev.map(it =>
                it.id === 'promos'
                    ? { ...it, warning: hasPromosMismatch }
                    : it
            )
        )
    }, [hasPromosMismatch])

    const toggleItem = (index, checked) => {
        setItems(prev => {
            const next = [...prev]
            next[index] = { ...next[index], checked }
            return next
        })
    }

    const handleGenerate = () => {
        const payload = items.map(i => ({ id: i.id, checked: i.checked }))
        console.log('[GENERATION PLANNING MACRO]', payload)
    }

    return (
        <>
            <h2 className="page-title">Génération planning macro</h2>
            <p className="page-sub">Sélectionnez chacun de ces points s’il a été renseigné.</p>

            <Checklist items={items} onToggle={toggleItem} />

            <button className="btn-primary btn-generate" onClick={handleGenerate}>
                Générer Planning<br/>Macro
            </button>
        </>
    )
}
