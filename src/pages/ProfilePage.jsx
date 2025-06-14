import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App'; // Adjust path as needed
import Toastify from 'toastify-js';
import { gsap } from 'gsap';

function ProfilePage() {
    const { currentUser, apiClient, login } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        address: '',
        current_password: '',
        new_password: '',
        confirm_new_password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const profileFormRef = React.useRef(null);

    useEffect(() => {
        if (currentUser) {
            setFormData(prev => ({
                ...prev,
                full_name: currentUser.full_name || '',
                email: currentUser.email || '',
                phone: currentUser.phone || '',
                address: currentUser.address || ''
            }));
        }
    }, [currentUser]);

    useEffect(() => {
        if (profileFormRef.current) {
            gsap.fromTo(profileFormRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.1 });
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (formData.new_password && formData.new_password !== formData.confirm_new_password) {
            setError('New passwords do not match.');
            setIsLoading(false);
            Toastify({ text: "New passwords do not match.", duration: 3000, className: "toast-alert-warning" }).showToast();
            return;
        }
        if (formData.new_password && formData.new_password.length < 8) {
            setError('New password must be at least 8 characters long.');
            setIsLoading(false);
            Toastify({ text: "New password must be at least 8 characters long.", duration: 3000, className: "toast-alert-warning" }).showToast();
            return;
        }

        const updateData = {
            full_name: formData.full_name,
            phone: formData.phone,
            address: formData.address,
        };

        if (formData.new_password) {
            updateData.current_password = formData.current_password;
            updateData.new_password = formData.new_password;
        }

        try {
            const response = await apiClient.put('/users/profile', updateData);
            Toastify({ text: response.data.message || "Profile updated successfully!", duration: 3000, backgroundColor: "linear-gradient(to right, #1E3A8A, #6B21A8)" }).showToast();
            
            // Update current user in context/localStorage if details changed
            const updatedUser = { ...currentUser, ...updateData };
            delete updatedUser.current_password; // Don't store passwords
            delete updatedUser.new_password;
            login(updatedUser, localStorage.getItem('escom_token')); // Re-use login to update local storage and context

            // Clear password fields
            setFormData(prev => ({
                ...prev,
                current_password: '',
                new_password: '',
                confirm_new_password: ''
            }));

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
            Toastify({ text: err.response?.data?.message || 'Failed to update profile.', duration: 3000, className: "toast-alert-critical" }).showToast();
        }
        setIsLoading(false);
    };

    if (!currentUser) {
        return <p>Loading profile...</p>; // Or redirect to login
    }

    return (
        <div className="profile-page fade-in">
            <h1>Your Profile</h1>
            <p className="secondary-text">Update your personal information and manage your account settings.</p>

            <div className="card" ref={profileFormRef} style={{ marginTop: '2rem', maxWidth: '700px', margin: '2rem auto' }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="full_name">Full Name</label>
                        <input type="text" name="full_name" id="full_name" value={formData.full_name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email (cannot be changed)</label>
                        <input type="email" name="email" id="email" value={formData.email} readOnly disabled />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <textarea name="address" id="address" rows="3" value={formData.address} onChange={handleChange}></textarea>
                    </div>

                    <h3 style={{ marginTop: '2rem', marginBottom: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>Change Password</h3>
                    <div className="form-group">
                        <label htmlFor="current_password">Current Password</label>
                        <input type="password" name="current_password" id="current_password" value={formData.current_password} onChange={handleChange} placeholder="Enter current password to change" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="new_password">New Password</label>
                        <input type="password" name="new_password" id="new_password" value={formData.new_password} onChange={handleChange} placeholder="Enter new password" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirm_new_password">Confirm New Password</label>
                        <input type="password" name="confirm_new_password" id="confirm_new_password" value={formData.confirm_new_password} onChange={handleChange} placeholder="Confirm new password" />
                    </div>

                    {error && <p className="form-error" style={{ color: 'var(--red-alert)' }}>{error}</p>}
                    
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
                        {isLoading ? 'Updating Profile...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ProfilePage;

