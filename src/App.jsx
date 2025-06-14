import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Toastify from 'toastify-js';

// Import Components
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import DevicesPage from './pages/DevicesPage';
import ControlsPage from './pages/ControlsPage';
import ProfilePage from './pages/ProfilePage';
import AuthModal from './components/Auth/AuthModal';

// Create Auth Context
export const AuthContext = createContext();

// API Utility
const apiClient = axios.create({
    baseURL: '/api',
});

apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('escom_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});


function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('escom_token');
        const userData = localStorage.getItem('escom_user');
        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                // Optionally, verify token with a backend endpoint here
                setIsAuthenticated(true);
                setCurrentUser(parsedUser);
            } catch (e) {
                console.error("Error parsing user data from localStorage", e);
                localStorage.removeItem('escom_token');
                localStorage.removeItem('escom_user');
            }
        }
        setIsLoading(false);
    }, []);

    const handleLogin = (userData, token) => {
        localStorage.setItem('escom_token', token);
        localStorage.setItem('escom_user', JSON.stringify(userData));
        setIsAuthenticated(true);
        setCurrentUser(userData);
        setShowAuthModal(false);
        Toastify({ text: "Successfully signed in!", duration: 3000, gravity: "top", position: "right", backgroundColor: "linear-gradient(to right, #1E3A8A, #6B21A8)" }).showToast();
    };

    const handleLogout = () => {
        localStorage.removeItem('escom_token');
        localStorage.removeItem('escom_user');
        setIsAuthenticated(false);
        setCurrentUser(null);
        Toastify({ text: "Successfully signed out!", duration: 3000, gravity: "top", position: "right", backgroundColor: "linear-gradient(to right, #1E3A8A, #6B21A8)" }).showToast();
        // Navigate to home or landing page might be needed here if not handled by ProtectedRoute
    };

    const openAuthModal = (mode) => {
        setAuthMode(mode);
        setShowAuthModal(true);
    };

    const ProtectedRoute = ({ children }) => {
        const location = useLocation();
        if (isLoading) return <div>Loading...</div>; // Or a proper spinner
        if (!isAuthenticated) {
            // Redirect them to the / page, but save the current location they were
            // trying to go to when they were redirected. This allows us to send them
            // along to that page after they login, which is a nicer user experience
            // than dropping them off on the home page.
            return <Navigate to="/" state={{ from: location }} replace onOpenAuthModal={() => openAuthModal('signin')} />;
        }
        return children;
    };

    if (isLoading) {
        return <div className="loading-fullscreen">Loading ESCOM Power Management...</div>; // Add a proper loading screen
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, currentUser, login: handleLogin, logout: handleLogout, apiClient, openAuthModal }}>
            <Router>
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <Header />
                    <main className="main-content" style={{ flexGrow: 1 }}>
                        <Routes>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                            <Route path="/devices" element={<ProtectedRoute><DevicesPage /></ProtectedRoute>} />
                            <Route path="/controls" element={<ProtectedRoute><ControlsPage /></ProtectedRoute>} />
                            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                            {/* Add other routes as needed */}
                            <Route path="*" element={<Navigate to="/" />} /> {/* Fallback route */}
                        </Routes>
                    </main>
                    <Footer />
                    {showAuthModal && <AuthModal mode={authMode} onClose={() => setShowAuthModal(false)} />} 
                </div>
            </Router>
        </AuthContext.Provider>
    );
}

export default App;

