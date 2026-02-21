// src/components/common/ToolbarSearch.tsx
import React, { useEffect, useState } from 'react'
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
    placeholder = 'Rechercher...',
    className = '',
}) => {
    const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => {
        if (typeof document === 'undefined') return false
        return document.documentElement.getAttribute('data-theme') === 'dark'
    })

    useEffect(() => {
        if (typeof document === 'undefined') return

        const root = document.documentElement
        const syncTheme = () =>
            setIsDarkTheme(root.getAttribute('data-theme') === 'dark')

        syncTheme()

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (
                    mutation.type === 'attributes' &&
                    mutation.attributeName === 'data-theme'
                ) {
                    syncTheme()
                    break
                }
            }
        })

        observer.observe(root, {
            attributes: true,
            attributeFilter: ['data-theme'],
        })

        return () => observer.disconnect()
    }, [])

    const rootClassName = ['toolbar-search', className].filter(Boolean).join(' ')
    const searchIcon = isDarkTheme ? icSearchDark : icSearch

    return (
        <div className={rootClassName}>
            <img src={searchIcon} alt="" className="toolbar-search-icon" />
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
