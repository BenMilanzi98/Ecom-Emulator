import React, { useState, useContext } from 'react';
import { AuthContext } from '../../App'; // Adjust path as needed
import Toastify from 'toastify-js';
import { gsap } from 'gsap';

function AuthModal({ mode, onClose }) {
    const { login, apiClient } = useContext(AuthContext);
    const [isSigningUp, setIsSigningUp] = useState(mode === 'signup');
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirm_password: '', // Only for signup
        phone: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const modalRef = React.useRef(null);

    React.useEffect(() => {
        if (modalRef.current) {
            gsap.fromTo(modalRef.current, { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
        }
    }, []);

    const handleClose = () => {
        gsap.to(modalRef.current, { opacity: 0, y: -50, duration: 0.3, onComplete: onClose });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (isSigningUp) {
            if (formData.password !== formData.confirm_password) {
                setError('Passwords do not match.');
                setIsLoading(false);
                return;
            }
            if (formData.password.length < 8 || !/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
                setError('Password must be at least 8 characters, include one uppercase letter and one number.');
                setIsLoading(false);
                return;
            }
            try {
                const response = await apiClient.post('/users/signup', {
                    full_name: formData.full_name,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone
                });
                Toastify({ text: response.data.message || "Signup successful! Please sign in.", duration: 5000, gravity: "top", position: "right", backgroundColor: "linear-gradient(to right, #1E3A8A, #6B21A8)" }).showToast();
                setIsSigningUp(false); // Switch to signin form
                setFormData({ ...formData, password: '', confirm_password: ''}); // Clear passwords
            } catch (err) {
                setError(err.response?.data?.message || 'Signup failed. Please try again.');
                Toastify({ text: err.response?.data?.message || 'Signup failed.', duration: 3000, gravity: "top", position: "right", className: "toast-alert-critical" }).showToast();
            }
        } else { // Signing In
            try {
                const response = await apiClient.post('/users/signin', {
                    email: formData.email,
                    password: formData.password
                });
                login(response.data.user, response.data.token);
                // App.js handles success toast and closing modal
                handleClose(); // Close modal on successful login
            } catch (err) {
                setError(err.response?.data?.message || 'Sign-in failed. Please check your credentials.');
                Toastify({ text: err.response?.data?.message || 'Sign-in failed.', duration: 3000, gravity: "top", position: "right", className: "toast-alert-critical" }).showToast();
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" ref={modalRef}>
                <button onClick={handleClose} className="modal-close-btn" aria-label="Close modal">&times;</button>
                <h2>{isSigningUp ? 'Create Account' : 'Sign In'}</h2>
                <form onSubmit={handleSubmit}>
                    {isSigningUp && (
                        <div className="form-group">
                            <label htmlFor="full_name">Full Name</label>
                            <input type="text" name="full_name" id="full_name" value={formData.full_name} onChange={handleChange} required />
                        </div>
                    )}
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required />
                    </div>
                    {isSigningUp && (
                        <div className="form-group">
                            <label htmlFor="confirm_password">Confirm Password</label>
                            <input type="password" name="confirm_password" id="confirm_password" value={formData.confirm_password} onChange={handleChange} required />
                        </div>
                    )}
                    {isSigningUp && (
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required />
                        </div>
                    )}
                    {error && <p className="form-error" style={{ color: 'var(--red-alert)' }}>{error}</p>}
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
                        {isLoading ? (isSigningUp ? 'Signing Up...' : 'Signing In...') : (isSigningUp ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                    {isSigningUp ? 'Already have an account?' : "Don't have an account?"}
                    <button 
                        onClick={() => { setIsSigningUp(!isSigningUp); setError(''); }}
                        style={{ background: 'none', border: 'none', color: 'var(--cyan-accent)', cursor: 'pointer', textDecoration: 'underline', marginLeft: '0.5rem' }}
                    >
                        {isSigningUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </p>
                {!isSigningUp && (
                     <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                        <button 
                            onClick={() => Toastify({ text: "Password reset link simulation: A reset link would be sent to your email.", duration: 5000, gravity: "top", position: "right" }).showToast()} 
                            style={{ background: 'none', border: 'none', color: 'var(--cyan-accent)', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Forgot Password?
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
}

export default AuthModal;

