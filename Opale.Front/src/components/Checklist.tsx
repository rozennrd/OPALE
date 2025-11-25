import React from 'react'
import icWarning from '../assets/ic-warning.png'

interface ChecklistItem {
    id: string
    label: string
    checked: boolean
    status: 'ok' | 'alert'
    warning?: boolean
}

interface ChecklistProps {
    items: ChecklistItem[]
    onToggle?: (index: number, checked: boolean) => void
}

const Checklist: React.FC<ChecklistProps> = ({ items, onToggle }) => {
    const handleToggle = (idx: number, it: ChecklistItem): void => {
        console.log(`[CHECKBOX] ${it.id} -> ${!it.checked}`)
        onToggle?.(idx, !it.checked)
    }

    return (
        <div className="checklist">
            {items.map((it, idx) => (
                <button
                    key={it.id}
                    className="cl-item"
                    onClick={() => handleToggle(idx, it)}
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

export default Checklist