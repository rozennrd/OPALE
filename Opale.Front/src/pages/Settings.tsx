import {FormEvent, JSX, ReactNode, useEffect, useState} from 'react'
import PageHeader from '../components/common/PageHeader'
import SectionCard from '../components/common/SectionCard'
import { useTheme } from '../hooks/useTheme'
import { authService } from '../services/base/AuthService'
import {
    IconVisibilityPreferences,
    applyIconVisibilityPreferencesToDom,
    readAndApplyIconVisibilityPreferences,
    writeIconVisibilityPreferences,
} from '../utils/iconPreferences'

const USERNAME_KEY = 'opale-user-name'
const USER_EMAIL_KEY = 'opale-user-email'
const STANDARD_THEME_KEY = 'opale-standard-theme'

const readStoredValue = (key: string, fallback = ''): string => {
    if (typeof window === 'undefined') return fallback
    return window.localStorage.getItem(key) ?? fallback
}

const readStoredStandardTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light'
    return window.localStorage.getItem(STANDARD_THEME_KEY) === 'dark' ? 'dark' : 'light'
}

type Feedback = {
    kind: 'success' | 'error'
    message: string
} | null

type SettingsSectionKey = 'account' | 'security' | 'appearance' | 'icons'

type PasswordFormState = {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

const INITIAL_PASSWORD_FORM: PasswordFormState = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
}

type ToggleRowProps = {
    title: string
    description: string
    checked: boolean
    onChange: (checked: boolean) => void
    onLabel?: string
    offLabel?: string
    disabled?: boolean
}

function ToggleRow({
    title,
    description,
    checked,
    onChange,
    onLabel = 'Affich\u00e9',
    offLabel = 'Masqu\u00e9',
    disabled = false,
}: ToggleRowProps): JSX.Element {
    return (
        <div className={`settings-toggle-row ${disabled ? 'is-disabled' : ''}`}>
            <div className="settings-toggle-info">
                <p className="settings-label">{title}</p>
                <p className="settings-help">{description}</p>
            </div>
            <button
                type="button"
                className={`settings-switch-btn ${checked ? 'is-on' : 'is-off'}`}
                onClick={() => onChange(!checked)}
                aria-pressed={checked}
                disabled={disabled}
            >
                <span className="settings-switch-track" aria-hidden="true">
                    <span className="settings-switch-thumb" />
                </span>
                <span className="settings-switch-text">
                    {checked ? onLabel : offLabel}
                </span>
            </button>
        </div>
    )
}

export default function Settings() {
    const [userName, setUserName] = useState<string>(() =>
        readStoredValue(USERNAME_KEY, ''),
    )
    const [userEmail, setUserEmail] = useState<string>(() =>
        readStoredValue(USER_EMAIL_KEY, ''),
    )
    const [accountFeedback, setAccountFeedback] = useState<Feedback>(null)

    const [passwordForm, setPasswordForm] = useState<PasswordFormState>(
        INITIAL_PASSWORD_FORM,
    )
    const [passwordFeedback, setPasswordFeedback] = useState<Feedback>(null)

    const [iconVisibility, setIconVisibility] = useState<IconVisibilityPreferences>(() =>
        readAndApplyIconVisibilityPreferences(),
    )
    const [expandedSections, setExpandedSections] = useState<
        Record<SettingsSectionKey, boolean>
    >({
        account: true,
        security: true,
        appearance: true,
        icons: true,
    })

    const {
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
    } = useTheme()

    useEffect(() => {
        if (typeof window === 'undefined') return
        if (theme === 'light' || theme === 'dark') {
            window.localStorage.setItem(STANDARD_THEME_KEY, theme)
        }
    }, [theme])

    useEffect(() => {
        let isMounted = true

        const syncCurrentUser = async () => {
            try {
                const currentUser = await authService.getCurrentUser()
                if (!currentUser || !isMounted) return

                if (currentUser.email) {
                    setUserEmail(currentUser.email)
                    if (typeof window !== 'undefined') {
                        window.localStorage.setItem(USER_EMAIL_KEY, currentUser.email)
                    }
                }

                if (currentUser.name) {
                    const userNameFromApi = currentUser.name
                    setUserName((current) => {
                        if (current.trim()) return current

                        if (typeof window !== 'undefined') {
                            window.localStorage.setItem(USERNAME_KEY, userNameFromApi)
                        }

                        return userNameFromApi
                    })
                }
            } catch (error) {
                console.error('[SETTINGS] Impossible de r\u00e9cup\u00e9rer le profil utilisateur', error)
            }
        }

        void syncCurrentUser()

        return () => {
            isMounted = false
        }
    }, [])

    useEffect(() => {
        writeIconVisibilityPreferences(iconVisibility)
        applyIconVisibilityPreferencesToDom(iconVisibility)
    }, [iconVisibility])

    const handleAccountSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const normalizedUserName = userName.trim()

        if (!normalizedUserName) {
            setAccountFeedback({
                kind: 'error',
                message: "Le nom d'utilisateur ne peut pas \u00eatre vide.",
            })
            return
        }

        setUserName(normalizedUserName)
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(USERNAME_KEY, normalizedUserName)
        }

        setAccountFeedback({
            kind: 'success',
            message: "Nom d'utilisateur enregistr\u00e9.",
        })
    }

    const updatePasswordField = (key: keyof PasswordFormState, value: string) => {
        setPasswordForm((current) => ({
            ...current,
            [key]: value,
        }))
    }

    const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const { currentPassword, newPassword, confirmPassword } = passwordForm

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordFeedback({
                kind: 'error',
                message: 'Tous les champs du mot de passe sont obligatoires.',
            })
            return
        }

        if (newPassword.length < 8) {
            setPasswordFeedback({
                kind: 'error',
                message: 'Le nouveau mot de passe doit contenir au moins 8 caract\u00e8res.',
            })
            return
        }

        if (newPassword === currentPassword) {
            setPasswordFeedback({
                kind: 'error',
                message: "Le nouveau mot de passe doit \u00eatre diff\u00e9rent de l'actuel.",
            })
            return
        }

        if (newPassword !== confirmPassword) {
            setPasswordFeedback({
                kind: 'error',
                message: 'La confirmation ne correspond pas au nouveau mot de passe.',
            })
            return
        }

        setPasswordForm(INITIAL_PASSWORD_FORM)
        setPasswordFeedback({
            kind: 'success',
            message: 'Validation r\u00e9ussie. Le branchement API pour le changement de mot de passe reste \u00e0 faire.',
        })
    }

    const handleSpockToggle = (isEnabled: boolean) => {
        if (isEnabled) {
            if (theme === 'light' || theme === 'dark') {
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(STANDARD_THEME_KEY, theme)
                }
            }
            setTheme('spock')
            return
        }

        setTheme(readStoredStandardTheme())
    }

    const updateIconVisibility = (
        zone: keyof IconVisibilityPreferences,
        isVisible: boolean,
    ) => {
        setIconVisibility((current) => ({
            ...current,
            [zone]: isVisible,
        }))
    }

    const toggleSection = (section: SettingsSectionKey) => {
        setExpandedSections((current) => ({
            ...current,
            [section]: !current[section],
        }))
    }

    return (
        <>
            <PageHeader
                title={'Param\u00e8tres'}
                subtitle={'Compte, s\u00e9curit\u00e9, apparence et affichage des ic\u00f4nes.'}
            />

            <div className="settings-page">
                <SectionCard
                    id="settings-section-account"
                    title="Compte"
                    expanded={expandedSections.account}
                    onToggle={() => toggleSection('account')}
                >
                    <form className="settings-form" onSubmit={handleAccountSubmit}>
                        <label className="settings-field">
                            <span className="settings-label">Nom d&apos;utilisateur</span>
                            <input
                                type="text"
                                className="settings-input"
                                value={userName}
                                onChange={(event) => {
                                    setUserName(event.target.value)
                                    setAccountFeedback(null)
                                }}
                                placeholder="Votre nom d'utilisateur"
                                disabled
                            />
                        </label>

                        <label className="settings-field">
                            <span className="settings-label">{'Adresse e-mail'}</span>
                            <input
                                type="email"
                                className="settings-input"
                                value={userEmail}
                                readOnly
                                disabled
                                placeholder="Mail indisponible"
                            />
                            <span className="settings-help">
                                {'Champ verrouill\u00e9 pour le moment.'}
                            </span>
                        </label>

                        <div className="settings-actions">
                            <button type="submit" className="btn-primary" disabled>
                                Enregistrer
                            </button>
                        </div>

                        <p className="settings-lock-note">
                            {'Section verrouill\u00e9e pour le moment.'}
                        </p>

                        {accountFeedback && (
                            <p
                                className={`settings-feedback ${accountFeedback.kind === 'error' ? 'is-error' : 'is-success'}`}
                                role={accountFeedback.kind === 'error' ? 'alert' : undefined}
                            >
                                {accountFeedback.message}
                            </p>
                        )}
                    </form>
                </SectionCard>

                <SectionCard
                    id="settings-section-security"
                    title={'S\u00e9curit\u00e9'}
                    expanded={expandedSections.security}
                    onToggle={() => toggleSection('security')}
                >
                    <form className="settings-form" onSubmit={handlePasswordSubmit}>
                        <label className="settings-field">
                            <span className="settings-label">Mot de passe actuel</span>
                            <input
                                type="password"
                                className="settings-input"
                                value={passwordForm.currentPassword}
                                onChange={(event) => {
                                    updatePasswordField('currentPassword', event.target.value)
                                    setPasswordFeedback(null)
                                }}
                                autoComplete="current-password"
                                disabled
                            />
                        </label>

                        <label className="settings-field">
                            <span className="settings-label">Nouveau mot de passe</span>
                            <input
                                type="password"
                                className="settings-input"
                                value={passwordForm.newPassword}
                                onChange={(event) => {
                                    updatePasswordField('newPassword', event.target.value)
                                    setPasswordFeedback(null)
                                }}
                                autoComplete="new-password"
                                disabled
                            />
                        </label>

                        <label className="settings-field">
                            <span className="settings-label">Confirmation</span>
                            <input
                                type="password"
                                className="settings-input"
                                value={passwordForm.confirmPassword}
                                onChange={(event) => {
                                    updatePasswordField('confirmPassword', event.target.value)
                                    setPasswordFeedback(null)
                                }}
                                autoComplete="new-password"
                                disabled
                            />
                        </label>

                        <div className="settings-actions">
                            <button type="submit" className="btn-primary" disabled>
                                {'Mettre \u00e0 jour'}
                            </button>
                        </div>

                        <p className="settings-lock-note">
                            {'Section verrouill\u00e9e pour le moment.'}
                        </p>

                        {passwordFeedback && (
                            <p
                                className={`settings-feedback ${passwordFeedback.kind === 'error' ? 'is-error' : 'is-success'}`}
                                role={passwordFeedback.kind === 'error' ? 'alert' : undefined}
                            >
                                {passwordFeedback.message}
                            </p>
                        )}
                    </form>
                </SectionCard>

                <SectionCard
                    id="settings-section-appearance"
                    title="Apparence"
                    expanded={expandedSections.appearance}
                    onToggle={() => toggleSection('appearance')}
                    wide
                >
                    <p className="settings-note">
                        {'Les th\u00e8mes clair/sombre restent g\u00e9r\u00e9s par le bouton de la barre lat\u00e9rale.'}
                    </p>

                    <div className="settings-toggle-list">
                        <ToggleRow
                            title={'Th\u00e8me Spock'}
                            description={'Mode visuel alternatif au style LCARS.'}
                            checked={theme === 'spock'}
                            onChange={handleSpockToggle}
                            onLabel={'Activ\u00e9'}
                            offLabel={'D\u00e9sactiv\u00e9'}
                        />
                        <ToggleRow
                            title={'Bips du mode Spock'}
                            description={'Un son court est jou\u00e9 \u00e0 chaque clic ou interaction clavier en mode Spock.'}
                            checked={spockAudio}
                            onChange={setSpockAudio}
                            onLabel="Actifs"
                            offLabel="Muets"
                            disabled={theme !== 'spock'}
                        />
                    </div>

                    <div className="settings-grid">
                        <label className="settings-field">
                            <span className="settings-label">Daltonisme</span>
                            <select
                                className="settings-select"
                                value={cvd}
                                onChange={(event) => setCvd(event.target.value as typeof cvd)}
                            >
                                <option value="none">Aucun</option>
                                <option value="protan-deutan">Rouge/vert (protan-deutan)</option>
                                <option value="tritan">Bleu/jaune (tritan)</option>
                                <option value="achromatopsia">Achromatopsie</option>
                            </select>
                        </label>

                        <label className="settings-field">
                            <span className="settings-label">Vision</span>
                            <select
                                className="settings-select"
                                value={vision}
                                onChange={(event) => setVision(event.target.value as typeof vision)}
                            >
                                <option value="normal">Normale</option>
                                <option value="low">Mal-voyant</option>
                            </select>
                        </label>

                        <label className="settings-field">
                            <span className="settings-label">Lecture</span>
                            <select
                                className="settings-select"
                                value={reading}
                                onChange={(event) => setReading(event.target.value as typeof reading)}
                            >
                                <option value="normal">Normale</option>
                                <option value="dyslexia">Dyslexie</option>
                            </select>
                        </label>
                    </div>
                </SectionCard>

                <SectionCard
                    id="settings-section-icons"
                    title={'Ic\u00f4nes'}
                    expanded={expandedSections.icons}
                    onToggle={() => toggleSection('icons')}
                    wide
                >
                    <p className="settings-note">
                        {'Affichage des ic\u00f4nes par zone de l\'interface.'}
                    </p>

                    <div className="settings-toggle-list">
                        <ToggleRow
                            title="Sidebar"
                            description={'Liens de navigation et actions en bas du menu.'}
                            checked={iconVisibility.sidebar}
                            onChange={(checked) => updateIconVisibility('sidebar', checked)}
                        />

                        <ToggleRow
                            title="Cards"
                            description="Badges et marqueurs dans les cartes."
                            checked={iconVisibility.cards}
                            onChange={(checked) => updateIconVisibility('cards', checked)}
                        />

                        <ToggleRow
                            title="Pages"
                            description={'Ic\u00f4nes utilitaires dans les barres d\'outils et les actions.'}
                            checked={iconVisibility.pages}
                            onChange={(checked) => updateIconVisibility('pages', checked)}
                        />
                    </div>
                </SectionCard>
            </div>
        </>
    )
}
