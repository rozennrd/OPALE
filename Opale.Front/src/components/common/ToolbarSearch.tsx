// src/components/common/ToolbarSearch.tsx
import React from 'react'
import icSearch from '../../assets/ic-search.png'
import icSearchDark from '../../assets/ic-search-dark.png'

interface ToolbarSearchProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

const ToolbarSearch: React.FC<ToolbarSearchProps> = ({
                                                         value,
                                                         onChange,
                                                         placeholder = 'Rechercher…',
                                                         className = '',
                                                     }) => {
    const rootClassName = ['toolbar-search', className].filter(Boolean).join(' ')

    return (
        <div className={rootClassName}>
            <img
                src={icSearch}
                alt=""
                className="toolbar-search-icon toolbar-search-icon-light"
            />
            <img
                src={icSearchDark}
                alt=""
                className="toolbar-search-icon toolbar-search-icon-dark"
            />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="toolbar-search-input"
                placeholder={placeholder}
            />
        </div>
    )
}

export default ToolbarSearch
