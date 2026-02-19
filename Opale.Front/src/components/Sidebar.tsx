// src/components/Sidebar.tsx
import React from 'react'
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
import icLogout from '../assets/sidebar/ic-logout.png'
import icLogoutDark from '../assets/sidebar/ic-logout-dark.png'
import icContact from '../assets/sidebar/ic-contact.png'
import icContactDark from '../assets/sidebar/ic-contact-dark.png'

import ThemeToggle from './ThemeToggle'

interface NavItem {
    to: string
    label: string
    ic: string
}

const items: NavItem[] = [
    { to: '/planning',    label: 'Planning',    ic: icPlanning },
    { to: '/promotions',  label: 'Promotions',  ic: icPromotions },
    { to: '/evenements',  label: 'Événements',  ic: icEvenements },
    { to: '/teachers',    label: 'Enseignants', ic: icEnseignants },
    { to: '/salles',      label: 'Salles',      ic: icSalles },
    { to: '/matieres',    label: 'Matières',    ic: icMatieres },
]

export default function Sidebar(): JSX.Element | null {
    const navigate = useNavigate()
    const location = useLocation()

    // Si la route est "login", on ne rend pas le sidebar
    if (location.pathname === '/login') return null

    const handleDisconnect = () => {
        console.log('[AUTH] Se déconnecter')
        // Redirection vers la page login
        navigate('/login')
    }

    const handleContact = () => {
        console.log('[AUTH] Page contact')
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
                        <span className="nav-label">{it.label}</span>
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
                        aria-label="Se déconnecter"
                        title="Se déconnecter"
                    >
                        <img className="footer-icon-light" src={icLogout} alt="" />
                        <img className="footer-icon-dark" src={icLogoutDark} alt="" />
                    </button>

                    <button
                        type="button"
                        className="footer-icon-btn"
                        onClick={handleContact}
                        aria-label="Contact"
                        title="Contact"
                    >
                        <img className="footer-icon-light" src={icContact} alt="" />
                        <img className="footer-icon-dark" src={icContactDark} alt="" />
                    </button>
                </div>
            </div>
        </aside>
    )
}
