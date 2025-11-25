// src/pages/Placeholder.jsx
import React from 'react'

export default function Placeholder({ title = 'Page', notFound = false }) {
    return (
        <>
            <h2 className="page-title">{title}</h2>
            <p className="page-sub">
                {notFound ? 'La page demandée est introuvable.' : 'Contenu à venir.'}
            </p>
        </>
    )
}
