import React from 'react';

interface PlaceholderProps {
    title?: string;
    notFound?: boolean;
}

export default function Placeholder({ title = 'Page', notFound = false }: PlaceholderProps) {
    return (
        <>
            <h2 className="page-title">{title}</h2>
            <p className="page-sub">
                {notFound ? 'La page demandée est introuvable.' : 'Contenu à venir.'}
            </p>
        </>
    )
}
