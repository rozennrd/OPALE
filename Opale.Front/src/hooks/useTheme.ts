// src/hooks/useTheme.ts
import { useEffect, useState } from 'react'
import { Theme } from '../models/Theme'

const THEME_KEY = 'opale-theme'

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'light'

        const stored = window.localStorage.getItem(THEME_KEY)
        if (stored === 'light' || stored === 'dark') return stored

        const prefersDark =
            window.matchMedia &&
            window.matchMedia('(prefers-color-scheme: dark)').matches

        return prefersDark ? 'dark' : 'light'
    })

    useEffect(() => {
        if (typeof document === 'undefined') return

        document.documentElement.setAttribute('data-theme', theme)
        window.localStorage.setItem(THEME_KEY, theme)
    }, [theme])

    const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))


   return { theme, setTheme, toggleTheme }
}
