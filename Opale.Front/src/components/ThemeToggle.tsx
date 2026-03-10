// src/components/ThemeToggle.tsx
import React from 'react'
import { useTheme } from '../hooks/useTheme'

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme()
    const isDark =
        theme === 'dark' ||
        theme === 'spock' ||
        theme.endsWith('-dark')

    const label = isDark ? 'Mode clair' : 'Mode sombre'

    return (
        <button
            type="button"
            className={`theme-toggle-btn ${isDark ? 'is-dark' : 'is-light'}`}
            onClick={toggleTheme}
            aria-label={label}
            title={label}
            aria-pressed={isDark}
        >
            <span className="theme-toggle-icon" aria-hidden="true">
                <span className="theme-toggle-icon-inner" />
            </span>
            <span className="theme-toggle-text">{isDark ? 'Sombre' : 'Clair'}</span>
            <span className="theme-toggle-toggle" aria-hidden="true">
                <span className="theme-toggle-toggle-thumb" />
            </span>
        </button>
    )
}
export default ThemeToggle
