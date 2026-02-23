export interface IconVisibilityPreferences {
    sidebar: boolean
    cards: boolean
    pages: boolean
}

const ICON_SIDEBAR_KEY = 'opale-icons-sidebar'
const ICON_CARDS_KEY = 'opale-icons-cards'
const ICON_PAGES_KEY = 'opale-icons-pages'

const DEFAULT_ICON_VISIBILITY: IconVisibilityPreferences = {
    sidebar: true,
    cards: true,
    pages: true,
}

const toDomValue = (value: boolean): 'show' | 'hide' => (value ? 'show' : 'hide')

const readStoredFlag = (key: string, fallback: boolean): boolean => {
    if (typeof window === 'undefined') return fallback

    const stored = window.localStorage.getItem(key)

    if (stored === '1') return true
    if (stored === '0') return false

    return fallback
}

export const readIconVisibilityPreferences = (): IconVisibilityPreferences => ({
    sidebar: readStoredFlag(ICON_SIDEBAR_KEY, DEFAULT_ICON_VISIBILITY.sidebar),
    cards: readStoredFlag(ICON_CARDS_KEY, DEFAULT_ICON_VISIBILITY.cards),
    pages: readStoredFlag(ICON_PAGES_KEY, DEFAULT_ICON_VISIBILITY.pages),
})

export const writeIconVisibilityPreferences = (
    preferences: IconVisibilityPreferences,
): void => {
    if (typeof window === 'undefined') return

    window.localStorage.setItem(ICON_SIDEBAR_KEY, preferences.sidebar ? '1' : '0')
    window.localStorage.setItem(ICON_CARDS_KEY, preferences.cards ? '1' : '0')
    window.localStorage.setItem(ICON_PAGES_KEY, preferences.pages ? '1' : '0')
}

export const applyIconVisibilityPreferencesToDom = (
    preferences: IconVisibilityPreferences,
): void => {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    root.setAttribute('data-icons-sidebar', toDomValue(preferences.sidebar))
    root.setAttribute('data-icons-cards', toDomValue(preferences.cards))
    root.setAttribute('data-icons-pages', toDomValue(preferences.pages))
}

export const readAndApplyIconVisibilityPreferences = (): IconVisibilityPreferences => {
    const preferences = readIconVisibilityPreferences()
    applyIconVisibilityPreferencesToDom(preferences)
    return preferences
}
