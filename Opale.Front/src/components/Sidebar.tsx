// src/components/Sidebar.tsx
import React from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'

import logoFull from '../assets/logo/logo-full.png'
import logoCompact from '../assets/logo/logo-compact.png'
import icPlanning from '../assets/sidebar/ic-planning.png'
import icPromotions from '../assets/sidebar/ic-promos.png'
import icEvenements from '../assets/sidebar/ic-events.png'
import icEnseignants from '../assets/sidebar/ic-profs.png'
import icSalles from '../assets/sidebar/ic-salles.png'
import icLogout from '../assets/sidebar/ic-logout.png'
import icContact from '../assets/sidebar/ic-contact.png'

import ThemeToggle from './ThemeToggle'

interface NavItem {
    to: string
    label: string
    ic: string
}

const items: NavItem[] = [
    { to: '/planning',    label: 'Planning',    ic: icPlanning },
    { to: '/promotions',  label: 'Promotions',  ic: icPromotions },
    { to: '/evenements',  label: 'Evenements',  ic: icEvenements },
    { to: '/teachers',    label: 'Enseignants', ic: icEnseignants },
    { to: '/salles',      label: 'Salles',      ic: icSalles },
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
                <img className="logo-full" src={logoFull} alt="OPALE" />
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
                        <img src={icLogout} alt="" />
                    </button>

                    <button
                        type="button"
                        className="footer-icon-btn"
                        onClick={handleContact}
                        aria-label="Contact"
                        title="Contact"
                    >
                        <img src={icContact} alt="" />
                    </button>
                </div>
            </div>
        </aside>
    )
}