// src/components/ThemeToggle.tsx
// @ts-ignore
import React from 'react'
import { useTheme } from '../hooks/useTheme'

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme()
    const isDark = theme === 'dark'

    const label = isDark ? 'Mode clair' : 'Mode sombre'

    return (
        <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={label}
            title={label}
        >
            <span className="theme-toggle-thumb" aria-hidden="true" />
            <span className="theme-toggle-text">{isDark ? 'Sombre' : 'Clair'}</span>
        </button>
    )
}
export default ThemeToggle;
