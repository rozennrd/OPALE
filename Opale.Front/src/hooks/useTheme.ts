import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { CvdProfile, ReadingProfile, Theme, VisionProfile } from '../models/Theme'

const THEME_KEY = 'opale-theme'
const CVD_KEY = 'opale-cvd'
const VISION_KEY = 'opale-vision'
const READING_KEY = 'opale-reading'
const SPOCK_AUDIO_KEY = 'opale-spock-audio'
const APPEARANCE_EVENT = 'opale:appearance-change'

const THEMES = ['light', 'dark', 'spock', 'papillon-light', 'papillon-dark'] as const
const CVD_PROFILES = ['none', 'protan-deutan', 'tritan', 'achromatopsia'] as const
const VISION_PROFILES = ['normal', 'low'] as const
const READING_PROFILES = ['normal', 'dyslexia'] as const

type AppearanceState = {
    theme: Theme
    cvd: CvdProfile
    vision: VisionProfile
    reading: ReadingProfile
    spockAudio: boolean
}

type AppearanceSetters = {
    setTheme: Dispatch<SetStateAction<Theme>>
    setCvd: Dispatch<SetStateAction<CvdProfile>>
    setVision: Dispatch<SetStateAction<VisionProfile>>
    setReading: Dispatch<SetStateAction<ReadingProfile>>
    setSpockAudio: Dispatch<SetStateAction<boolean>>
}

type AppearanceConsoleApi = {
    getState: () => AppearanceState
    setTheme: (theme: string) => void
    setCvd: (cvd: string) => void
    setVision: (vision: string) => void
    setReading: (reading: string) => void
    setSpockAudio: (enabled: string) => void
    reset: () => void
    help: () => string
}

declare global {
    interface Window {
        opaleAppearance?: AppearanceConsoleApi
    }
}

function isTheme(value: string | null): value is Theme {
    return value !== null && (THEMES as readonly string[]).includes(value)
}

function isCvdProfile(value: string | null): value is CvdProfile {
    return value !== null && (CVD_PROFILES as readonly string[]).includes(value)
}

function isVisionProfile(value: string | null): value is VisionProfile {
    return value !== null && (VISION_PROFILES as readonly string[]).includes(value)
}

function isReadingProfile(value: string | null): value is ReadingProfile {
    return value !== null && (READING_PROFILES as readonly string[]).includes(value)
}

function isLcarsInteractiveElement(target: EventTarget | null): target is Element {
    return (
        target instanceof Element &&
        target.closest(
            'button, a, input, select, textarea, [role="button"], [role="link"]',
        ) !== null
    )
}

function readStored<T>(
    key: string,
    guard: (value: string | null) => value is T,
    fallback: T,
): T {
    if (typeof window === 'undefined') return fallback

    const stored = window.localStorage.getItem(key)
    return guard(stored) ? stored : fallback
}

function readStoredBoolean(key: string, fallback: boolean): boolean {
    if (typeof window === 'undefined') return fallback

    const stored = window.localStorage.getItem(key)
    if (stored === null) return fallback

    const normalized = stored.trim().toLowerCase()
    if (['1', 'true', 'on', 'yes'].includes(normalized)) return true
    if (['0', 'false', 'off', 'no'].includes(normalized)) return false

    return fallback
}

function parseBooleanString(value: string): boolean | null {
    const normalized = value.trim().toLowerCase()
    if (['1', 'true', 'on', 'yes'].includes(normalized)) return true
    if (['0', 'false', 'off', 'no'].includes(normalized)) return false
    return null
}

function useAppearanceState(): AppearanceState & AppearanceSetters {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'light'

        const stored = window.localStorage.getItem(THEME_KEY)
        if (isTheme(stored)) return stored

        const prefersDark =
            window.matchMedia &&
            window.matchMedia('(prefers-color-scheme: dark)').matches

        return prefersDark ? 'dark' : 'light'
    })

    const [cvd, setCvd] = useState<CvdProfile>(() =>
        readStored(CVD_KEY, isCvdProfile, 'none'),
    )

    const [vision, setVision] = useState<VisionProfile>(() =>
        readStored(VISION_KEY, isVisionProfile, 'normal'),
    )

    const [reading, setReading] = useState<ReadingProfile>(() =>
        readStored(READING_KEY, isReadingProfile, 'normal'),
    )
    const [spockAudio, setSpockAudio] = useState<boolean>(() =>
        readStoredBoolean(SPOCK_AUDIO_KEY, true),
    )

    useEffect(() => {
        if (typeof window === 'undefined') return

        const onAppearanceChange = (event: Event) => {
            const detail = (event as CustomEvent<AppearanceState>).detail
            if (!detail) return

            setTheme(detail.theme)
            setCvd(detail.cvd)
            setVision(detail.vision)
            setReading(detail.reading)
            setSpockAudio(detail.spockAudio)
        }

        window.addEventListener(APPEARANCE_EVENT, onAppearanceChange as EventListener)

        return () => {
            window.removeEventListener(APPEARANCE_EVENT, onAppearanceChange as EventListener)
        }
    }, [])

    return {
        theme,
        setTheme,
        cvd,
        setCvd,
        vision,
        setVision,
        reading,
        setReading,
        spockAudio,
        setSpockAudio,
    }
}

function useAppearanceDomSync(state: AppearanceState) {
    useEffect(() => {
        if (typeof document === 'undefined' || typeof window === 'undefined') return

        document.documentElement.setAttribute('data-theme', state.theme)
        document.documentElement.setAttribute('data-cvd', state.cvd)
        document.documentElement.setAttribute('data-vision', state.vision)
        document.documentElement.setAttribute('data-reading', state.reading)
        document.documentElement.setAttribute(
            'data-spock-audio',
            state.spockAudio ? 'on' : 'off',
        )

        window.localStorage.setItem(THEME_KEY, state.theme)
        window.localStorage.setItem(CVD_KEY, state.cvd)
        window.localStorage.setItem(VISION_KEY, state.vision)
        window.localStorage.setItem(READING_KEY, state.reading)
        window.localStorage.setItem(SPOCK_AUDIO_KEY, state.spockAudio ? '1' : '0')

        window.dispatchEvent(
            new CustomEvent<AppearanceState>(APPEARANCE_EVENT, {
                detail: {
                    theme: state.theme,
                    cvd: state.cvd,
                    vision: state.vision,
                    reading: state.reading,
                    spockAudio: state.spockAudio,
                },
            }),
        )
    }, [state.theme, state.cvd, state.vision, state.reading, state.spockAudio])
}

function useAppearanceConsoleApi(state: AppearanceState, setters: AppearanceSetters) {
    const { theme, cvd, vision, reading, spockAudio } = state
    const { setTheme, setCvd, setVision, setReading, setSpockAudio } = setters

    useEffect(() => {
        if (typeof window === 'undefined') return

        window.opaleAppearance = {
            getState: () => ({ theme, cvd, vision, reading, spockAudio }),
            setTheme: (value: string) => {
                if (isTheme(value)) {
                    setTheme(value)
                    return
                }
                console.warn(
                    `[OPALE] Theme invalide: "${value}". Valeurs possibles: ${THEMES.join(', ')}.`,
                )
            },
            setCvd: (value: string) => {
                if (isCvdProfile(value)) {
                    setCvd(value)
                    return
                }
                console.warn(
                    `[OPALE] Profil daltonisme invalide: "${value}". Valeurs possibles: ${CVD_PROFILES.join(', ')}.`,
                )
            },
            setVision: (value: string) => {
                if (isVisionProfile(value)) {
                    setVision(value)
                    return
                }
                console.warn(
                    `[OPALE] Profil vision invalide: "${value}". Valeurs possibles: ${VISION_PROFILES.join(', ')}.`,
                )
            },
            setReading: (value: string) => {
                if (isReadingProfile(value)) {
                    setReading(value)
                    return
                }
                console.warn(
                    `[OPALE] Profil lecture invalide: "${value}". Valeurs possibles: ${READING_PROFILES.join(', ')}.`,
                )
            },
            setSpockAudio: (value: string) => {
                const parsed = parseBooleanString(value)
                if (parsed !== null) {
                    setSpockAudio(parsed)
                    return
                }
                console.warn(
                    `[OPALE] Valeur audio Spock invalide: "${value}". Utiliser on/off, true/false ou 1/0.`,
                )
            },
            reset: () => {
                setTheme('light')
                setCvd('none')
                setVision('normal')
                setReading('normal')
                setSpockAudio(true)
            },
            help: () =>
                'window.opaleAppearance.setTheme("spock" | "papillon-light" | "papillon-dark"), window.opaleAppearance.setCvd("protan-deutan"), window.opaleAppearance.setVision("low"), window.opaleAppearance.setReading("dyslexia"), window.opaleAppearance.setSpockAudio("off"), window.opaleAppearance.getState(), window.opaleAppearance.reset()',
        }

        return () => {
            if (typeof window !== 'undefined') {
                delete window.opaleAppearance
            }
        }
    }, [
        theme,
        cvd,
        vision,
        reading,
        spockAudio,
        setTheme,
        setCvd,
        setVision,
        setReading,
        setSpockAudio,
    ])
}

function useSpockAudioFx(theme: Theme, isSpockAudioEnabled: boolean) {
    const audioContextRef = useRef<AudioContext | null>(null)
    const lastBeepAtRef = useRef<number>(0)

    useEffect(() => {
        if (
            theme !== 'spock' ||
            !isSpockAudioEnabled ||
            typeof document === 'undefined' ||
            typeof window === 'undefined'
        ) {
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                void audioContextRef.current.close()
                audioContextRef.current = null
            }
            return
        }

        const playBeep = (frequency: number) => {
            const nowMs = window.performance.now()
            if (nowMs - lastBeepAtRef.current < 45) return
            lastBeepAtRef.current = nowMs

            const AudioContextCtor =
                window.AudioContext ||
                (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
            if (!AudioContextCtor) return

            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContextCtor()
            }

            const context = audioContextRef.current
            if (!context) return
            if (context.state === 'suspended') {
                void context.resume()
            }

            const now = context.currentTime
            const gain = context.createGain()
            gain.connect(context.destination)
            gain.gain.setValueAtTime(0.0001, now)
            gain.gain.exponentialRampToValueAtTime(0.05, now + 0.01)
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12)

            const osc = context.createOscillator()
            osc.type = 'square'
            osc.frequency.setValueAtTime(frequency, now)
            osc.frequency.exponentialRampToValueAtTime(frequency + 110, now + 0.07)
            osc.connect(gain)
            osc.start(now)
            osc.stop(now + 0.12)
        }

        const onClick = (event: MouseEvent) => {
            if (!isLcarsInteractiveElement(event.target)) return
            playBeep(620)
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Enter' && event.key !== ' ') return
            if (!isLcarsInteractiveElement(event.target)) return
            playBeep(760)
        }

        document.addEventListener('click', onClick)
        document.addEventListener('keydown', onKeyDown)

        return () => {
            document.removeEventListener('click', onClick)
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [theme, isSpockAudioEnabled])
}

export function useTheme() {
    const appearance = useAppearanceState()

    useAppearanceDomSync(appearance)
    useAppearanceConsoleApi(appearance, appearance)
    useSpockAudioFx(appearance.theme, appearance.spockAudio)

    const toggleTheme = () =>
        appearance.setTheme((current) => {
            if (current === 'papillon-light') return 'papillon-dark'
            if (current === 'papillon-dark') return 'papillon-light'
            return current === 'light' ? 'dark' : 'light'
        })

    return {
        theme: appearance.theme,
        setTheme: appearance.setTheme,
        toggleTheme,
        cvd: appearance.cvd,
        setCvd: appearance.setCvd,
        vision: appearance.vision,
        setVision: appearance.setVision,
        reading: appearance.reading,
        setReading: appearance.setReading,
        spockAudio: appearance.spockAudio,
        setSpockAudio: appearance.setSpockAudio,
    }
}
