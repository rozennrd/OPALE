// src/components/Sidebar.tsx
import React, { useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'

import logoFull from '../assets/logo/logo-full.png'
import logoFullDark from '../assets/logo/logo-full-dark.png'
import logoCompact from '../assets/logo/logo-compact.png'
import icPlanning from '../assets/sidebar/ic-planning.png'
import icPromotions from '../assets/sidebar/ic-promos.png'
import icEvenements from '../assets/sidebar/ic-events.png'
import icEnseignants from '../assets/sidebar/ic-profs.png'
import icSalles from '../assets/sidebar/ic-salles.png'
import icMatieres from '../assets/sidebar/ic-matieres.png'
import icParametres from '../assets/sidebar/ic-para.png'
import icLogout from '../assets/sidebar/ic-logout.png'
import icLogoutDark from '../assets/sidebar/ic-logout-dark.png'
import icTuto from '../assets/sidebar/ic-tuto.png'
import icTutoDark from '../assets/sidebar/ic-tuto-dark.png'
import { readAndApplyIconVisibilityPreferences } from '../utils/iconPreferences'

import ThemeToggle from './ThemeToggle'

interface NavItem {
    to: string
    label: string
    ic: string
    code: string
}

const items: NavItem[] = [
    { to: '/planning', label: 'Planning', ic: icPlanning, code: 'OPS-01' },
    { to: '/promotions', label: 'Promotions', ic: icPromotions, code: 'CELL-03' },
    { to: '/evenements', label: 'Evenements', ic: icEvenements, code: 'EVENT-12' },
    { to: '/teachers', label: 'Enseignants', ic: icEnseignants, code: 'CREW-07' },
    { to: '/salles', label: 'Salles', ic: icSalles, code: 'DECK-04' },
    { to: '/matieres', label: 'Mati\u00e8res', ic: icMatieres, code: 'LAB-22' },
    { to: '/parametres', label: 'Param\u00e8tres', ic: icParametres, code: 'CFG-09' },
]

export default function Sidebar(): JSX.Element | null {
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        readAndApplyIconVisibilityPreferences()
    }, [])

    // Si la route est "login", on ne rend pas le sidebar
    if (location.pathname === '/login') return null

    const handleDisconnect = () => {
        console.log('[AUTH] Se d\u00e9connecter')
        // Redirection vers la page login
        navigate('/login')
    }

    const handleTutorial = () => {
        console.log('[NAV] Documentation utilisateur')
        navigate('/documentation')
    }

    return (
        <aside className="card sidebar">
            <div className="brand">
                <img className="logo-full logo-full-light" src={logoFull} alt="OPALE" />
                <img className="logo-full logo-full-dark" src={logoFullDark} alt="OPALE" />
                <img className="logo-compact" src={logoCompact} alt="O" />
            </div>

            <div className="theme-toggle-wrapper">
                <ThemeToggle />
            </div>

            <nav className="nav">
                {items.map((it) => (
                    <NavLink
                        key={it.to}
                        to={it.to}
                        className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
                        onClick={() => console.log(`[NAV] ${it.label}`)}
                    >
                        <span className="nav-label-wrap">
                            <span className="nav-label">{it.label}</span>
                            <span className="nav-code" aria-hidden="true">{it.code}</span>
                        </span>
                        <img className="nav-icon-right" src={it.ic} alt="" />
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="footer-actions">
                    <button
                        type="button"
                        className="footer-icon-btn"
                        onClick={handleDisconnect}
                        aria-label="Se d\u00e9connecter"
                        title="Se d\u00e9connecter"
                    >
                        <img className="footer-icon-light" src={icLogout} alt="" />
                        <img className="footer-icon-dark" src={icLogoutDark} alt="" />
                        <span className="footer-icon-fallback" aria-hidden="true">
                            Sortie
                        </span>
                    </button>

                    <button
                        type="button"
                        className="footer-icon-btn"
                        onClick={handleTutorial}
                        aria-label="Documentation utilisateur"
                        title="Documentation utilisateur"
                    >
                        <img className="footer-icon-light" src={icTuto} alt="" />
                        <img className="footer-icon-dark" src={icTutoDark} alt="" />
                        <span className="footer-icon-fallback" aria-hidden="true">
                            Tuto
                        </span>
                    </button>
                </div>
            </div>
        </aside>
    )
}
