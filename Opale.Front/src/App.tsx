import React from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Promotions from './pages/Promotions.jsx'
import PlanningMacro from './pages/PlanningMacro.jsx'
import Placeholder from './pages/Placeholder.jsx'

function AppLayout() {
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

export default function App() {
    return (

        <Routes>
            <Route element={<AppLayout />}>

                <Route path="/" element={<Navigate to="/planning" replace />} />
                <Route path="/planning" element={<PlanningMacro />} />
                <Route path="/promotions" element={<Promotions />} />
                <Route path="/evenements" element={<Placeholder title="Événements" />} />
                <Route path="/enseignants" element={<Placeholder title="Enseignants" />} />
                <Route path="/salles" element={<Placeholder title="Salles" />} />
                <Route path="/parametres" element={<Placeholder title="Paramètres" />} />
                <Route path="*" element={<Placeholder title="Page introuvable" notFound />} />
            </Route>
        </Routes>
    )
}