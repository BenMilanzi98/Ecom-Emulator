import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../App'; // Adjust path as needed

function Header() {
    const { isAuthenticated, logout, openAuthModal } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSignOut = () => {
        logout();
        navigate('/'); // Redirect to landing page after logout
    };

    return (
        <header className="app-header">
            <Link to="/" className="logo">ESCOM</Link>
            <nav>
                <Link to="/">Home</Link>
                {/* <Link to="/services">Services</Link> // As per spec, but might be part of landing page sections */}
                {/* <Link to="/contact">Contact</Link> // As per spec, but might be part of landing page sections */}
                {isAuthenticated ? (
                    <>
                        <Link to="/dashboard">Dashboard</Link>
                        <Link to="/devices">My Devices</Link>
                        <Link to="/controls">Device Controls</Link>
                        <Link to="/profile">Profile</Link>
                        <button onClick={handleSignOut} className="btn btn-secondary" style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}>Sign Out</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => openAuthModal('signup')} className="btn btn-primary" style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}>Sign Up</button>
                        <button onClick={() => openAuthModal('signin')} className="btn btn-secondary" style={{ marginLeft: '0.5rem', padding: '0.5rem 1rem' }}>Sign In</button>
                    </>
                )}
            </nav>
        </header>
    );
}

export default Header;

