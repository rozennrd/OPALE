import React from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'

import Sidebar from './components/Sidebar'
import Promotions from './pages/Promotions'
import Teachers from './pages/Teachers'
import PlanningMacro from './pages/PlanningMacro'
import Placeholder from './pages/Placeholder'
import Login from './pages/Login'

import { useTheme } from './hooks/useTheme'

function AppLayout(): Element {
    const handleDisconnect = () => {
        console.log('[AUTH] Se déconnecter')
    }

    return (
        <div className="app">
            <Sidebar />

            {/* Colonne droite */}
            <div className="right-col">
                <main className="card main-card">
                    <div className="main-inner">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default function App(): Element {
    const { theme } = useTheme()

    return (
        <div className={theme}>
            <Routes>
                {/* Routes sans layout */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />

                {/* Routes avec layout */}
                <Route element={<AppLayout />}>
                    <Route path="/planning" element={<PlanningMacro />} />
                    <Route path="/promotions" element={<Promotions />} />
                    <Route path="/evenements" element={<Placeholder title="Événements" />} />
                    <Route path="/teachers" element={<Teachers />} />
                    <Route path="/salles" element={<Placeholder title="Salles" />} />
                    <Route path="/parametres" element={<Placeholder title="Paramètres" />} />
                    <Route path="*" element={<Placeholder title="Page introuvable" notFound />} />
                </Route>
            </Routes>
        </div>
    )
}