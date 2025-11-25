// src/components/Sidebar.jsx
import React from 'react'
import { NavLink } from 'react-router-dom'
import logoFull from '../assets/logo-full.png'
import logoCompact from '../assets/logo-compact.png'
import icPlanning from '../assets/ic-planning.png'
import icPromotions from '../assets/ic-promos.png'
import icEvenements from '../assets/ic-events.png'
import icEnseignants from '../assets/ic-profs.png'
import icSalles from '../assets/ic-salles.png'
import icLogout from '../assets/ic-logout.png'
import icContact from '../assets/ic-contact.png'
import ThemeToggle from './ThemeToggle.jsx'

const items = [
    { to: '/planning',   label: 'Planning',    ic: icPlanning },
    { to: '/promotions', label: 'Promotions',  ic: icPromotions },
    { to: '/evenements', label: 'Evenements',  ic: icEvenements },
    { to: '/enseignants',label: 'Enseignants', ic: icEnseignants },
    { to: '/salles',     label: 'Salles',      ic: icSalles },
]

export default function Sidebar() {
    const handleDisconnect = () => {
        console.log('[AUTH] Se déconnecter')
        // plus tard : appel API + redirection login
    }

    const handleContact = () => {
        console.log('[AUTH] Page contact')
        // plus tard : appel API + redirection login
    }

    return (
        <aside className="card sidebar">
            <div className="brand">
                <img className="logo-full" src={logoFull} alt="OPALE"/>
                <img className="logo-compact" src={logoCompact} alt="O"/>
            </div>

            <div className="theme-toggle-wrapper">
                <ThemeToggle/>
            </div>

            <nav className="nav">
                {items.map(it => (
                    <NavLink
                        key={it.to}
                        to={it.to}
                        className={({isActive}) => `nav-btn ${isActive ? 'active' : ''}`}
                        onClick={() => console.log(`[NAV] ${it.label}`)}
                    >
                        <span className="nav-label">{it.label}</span>
                        <img className="nav-icon-right" src={it.ic} alt=""/>
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
                        <img src={icLogout} alt=""/>
                    </button>

                    <button
                        type="button"
                        className="footer-icon-btn"
                        onClick={handleContact}
                        aria-label="Contact"
                        title="Contact"
                    >
                        <img src={icContact} alt=""/>
                    </button>
                </div>
            </div>
        </aside>
    )
}