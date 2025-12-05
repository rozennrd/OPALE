// src/components/common/DetailCardBody.tsx
import React from 'react'

interface DetailCardBodyProps {
    /** Contenu de la card : header, sections, footer */
    children: React.ReactNode
    /** Classe(s) spécifiques à la page (ex: "event-detail-card") */
    className?: string
}

export default function DetailCardBody({ children, className }: DetailCardBodyProps) {
    const rootClassName = ['detail-card', className].filter(Boolean).join(' ')

    return <div className={rootClassName}>{children}</div>
}