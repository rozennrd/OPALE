import React from 'react'
import icWarning from '../assets/ic-warning.png'

export default function Checklist({ items, onToggle }) {
    return (
        <div className="checklist">
            {items.map((it, idx) => (
                <button
                    key={it.id}
                    className="cl-item"
                    onClick={() => {
                        console.log(`[CHECKBOX] ${it.id} -> ${!it.checked}`)
                        onToggle?.(idx, !it.checked)
                    }}
                >
                    <span
                        className={`badge ${it.status === 'ok' ? 'ok' : 'alert'} ${it.checked ? 'checked' : ''}`}
                        aria-hidden
                    >
                        {it.checked ? '✓' : ''}
                    </span>

                    <span className="cl-label-wrap">
                        <span className="cl-label">{it.label}</span>
                        {it.warning && (
                            <img
                                src={icWarning}
                                alt="Alerte sur cet élément"
                                className="cl-warning"
                            />
                        )}
                    </span>
                </button>
            ))}
        </div>
    )
}