import React, { useEffect } from 'react'
import { Routes, Route, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Promotions from './pages/Promotions.jsx'
import Planning from './pages/Planning.tsx'
import Placeholder from './pages/Placeholder.jsx'
import Login from './pages/Login'
import Rooms from './pages/Rooms'
import Events from './pages/Events'
import Matieres from './pages/Matieres'
import Settings from './pages/Settings'
import Documentation from './pages/Documentation'
import { authService } from './services/base/AuthService'


import Teachers from './pages/Teachers'



function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkAuthentication = () => {
            if (!authService.isAuthenticated()) {
                console.log('[AUTH] Token expired or no auth, redirecting to login');
                navigate('/login', { replace: true });
            }
        };

        // Check immediately on mount
        checkAuthentication();

        // Check every minute (60000ms)
        const interval = setInterval(checkAuthentication, 60000);

        return () => clearInterval(interval);
    }, [navigate]);

    useEffect(() => {
        const container = document.querySelector('.main-inner')
        if (container instanceof HTMLElement) {
            container.scrollTo({ top: 0, left: 0, behavior: 'auto' })
            return
        }
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }, [location.pathname])


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
                <Route path="/planning" element={<Planning />} />
                <Route path="/promotions" element={<Promotions />} />
                <Route path="/evenements" element={<Events />} />
                <Route path="/teachers" element={<Teachers />} />
                <Route path="/salles" element={<Rooms />} />
                <Route path="/matieres" element={<Matieres />} />
                <Route path="/parametres" element={<Settings />} />
                <Route path="/documentation" element={<Documentation />} />
                <Route path="*" element={<Placeholder title="Page introuvable" notFound />} />
            </Route>
            <Route path="/login" element={<Login/>} />
        </Routes>
    )
}
