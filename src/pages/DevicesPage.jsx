import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../App'; // Adjust path as needed
import Toastify from 'toastify-js';
import { gsap } from 'gsap';

function DevicesPage() {
    const { apiClient, currentUser } = useContext(AuthContext);
    const [householdItems, setHouseholdItems] = useState([]);
    const [userDevices, setUserDevices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loadingItems, setLoadingItems] = useState(true);
    const [loadingUserDevices, setLoadingUserDevices] = useState(true);

    const cardsRef = useRef([]);
    cardsRef.current = [];
    const addToRefs = (el) => {
        if (el && !cardsRef.current.includes(el)) {
            cardsRef.current.push(el);
        }
    };

    useEffect(() => {
        apiClient.get('/devices/household-items')
            .then(response => {
                setHouseholdItems(response.data);
                setLoadingItems(false);
            })
            .catch(error => {
                console.error("Error fetching household items:", error);
                Toastify({ text: "Failed to load household items.", duration: 3000, className: "toast-alert-critical" }).showToast();
                setLoadingItems(false);
            });
        fetchUserDevices();
    }, [apiClient]);

    useEffect(() => {
        if (!loadingItems && cardsRef.current.length > 0) {
            gsap.fromTo(cardsRef.current, 
                { opacity: 0, y: 20 }, 
                { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
            );
        }
    }, [loadingItems, householdItems, searchTerm, selectedCategory]); // Re-run animation when items filter

    const fetchUserDevices = () => {
        if (!currentUser) return;
        setLoadingUserDevices(true);
        apiClient.get('/users/devices')
            .then(response => {
                setUserDevices(response.data || []);
                setLoadingUserDevices(false);
            })
            .catch(error => {
                console.error("Error fetching user devices:", error);
                Toastify({ text: "Failed to load your devices.", duration: 3000, className: "toast-alert-critical" }).showToast();
                setLoadingUserDevices(false);
            });
    };

    const handleAddItem = async (item, quantity) => {
        if (quantity <= 0) {
            Toastify({ text: "Quantity must be greater than 0.", duration: 3000, className: "toast-alert-warning" }).showToast();
            return;
        }
        try {
            // Check if item already in userDevices (by device_id)
            const existingDevice = userDevices.find(ud => ud.device_id === item.id);
            let response;
            if (existingDevice) {
                 response = await apiClient.post('/users/devices', { device_id: item.id, quantity: parseInt(quantity), custom_name: existingDevice.custom_name });
            } else {
                 response = await apiClient.post('/users/devices', { device_id: item.id, quantity: parseInt(quantity) });
            }

            Toastify({ text: response.data.message || `${item.name} added/updated.`, duration: 3000, backgroundColor: "linear-gradient(to right, #1E3A8A, #6B21A8)" }).showToast();
            fetchUserDevices(); // Refresh user devices list
        } catch (error) {
            console.error("Error adding item:", error);
            Toastify({ text: error.response?.data?.message || `Failed to add ${item.name}.`, duration: 3000, className: "toast-alert-critical" }).showToast();
        }
    };

    const handleRemoveItem = async (userDeviceId) => {
        try {
            const response = await apiClient.delete(`/users/devices/${userDeviceId}`);
            Toastify({ text: response.data.message || "Device removed.", duration: 3000, backgroundColor: "linear-gradient(to right, #1E3A8A, #6B21A8)" }).showToast();
            fetchUserDevices(); // Refresh user devices list
        } catch (error) {
            console.error("Error removing item:", error);
            Toastify({ text: error.response?.data?.message || "Failed to remove device.", duration: 3000, className: "toast-alert-critical" }).showToast();
        }
    };

    const categories = ['All', ...new Set(householdItems.map(item => item.category))];

    const filteredItems = householdItems.filter(item => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="devices-page fade-in">
            <h1>Manage Your Household Items</h1>
            <p className="secondary-text">Select items you own and specify their quantity. This will help in monitoring and controlling your power consumption.</p>

            <div className="filters card" style={{ marginBottom: '2rem', padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input 
                        type="text" 
                        placeholder="Search items..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        style={{ flexGrow: 1, padding: '0.75rem' }}
                    />
                    <select 
                        value={selectedCategory} 
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{ padding: '0.75rem' }}
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>

            {loadingItems ? <p>Loading available items...</p> : (
                <div className="grid-container grid-container-3-col">
                    {filteredItems.map(item => {
                        const userDevice = userDevices.find(ud => ud.device_id === item.id);
                        const currentQuantity = userDevice ? userDevice.quantity : 0;
                        return (
                            <div key={item.id} className="card device-item-card" ref={addToRefs}>
                                <i className={`fas ${item.icon || 'fa-question-circle'} fa-2x`} style={{ color: 'var(--purple)', marginBottom: '0.5rem' }}></i>
                                <h3>{item.name}</h3>
                                <p className="secondary-text">Category: {item.category}</p>
                                <p className="secondary-text">Power: {item.power_consumption} kWh/hour</p>
                                <div className="form-group" style={{ marginTop: '1rem' }}>
                                    <label htmlFor={`quantity-${item.id}`}>Quantity:</label>
                                    <input 
                                        type="number" 
                                        id={`quantity-${item.id}`} 
                                        min="0" 
                                        defaultValue={currentQuantity} 
                                        style={{ width: '80px', textAlign: 'center', marginRight: '0.5rem' }}
                                        onBlur={(e) => {
                                            const newQuantity = parseInt(e.target.value);
                                            if (newQuantity > 0 && newQuantity !== currentQuantity) {
                                                handleAddItem(item, newQuantity);
                                            } else if (newQuantity === 0 && currentQuantity > 0 && userDevice) {
                                                handleRemoveItem(userDevice.id);
                                            }
                                        }}
                                    />
                                </div>
                                {userDevice && (
                                    <button onClick={() => handleRemoveItem(userDevice.id)} className="btn" style={{backgroundColor: 'var(--red-alert)', color: 'white', marginTop: '0.5rem', fontSize: '0.9rem', padding: '0.4rem 0.8rem'}}>
                                        Remove All
                                    </button>
                                )}
                            </div>
                        );
                    })}
                    {filteredItems.length === 0 && <p>No items match your search criteria.</p>}
                </div>
            )}
            
            <div className="user-devices-summary card" style={{marginTop: '3rem'}}>
                <h2>Your Selected Devices</h2>
                {loadingUserDevices ? <p>Loading your devices...</p> : (
                    userDevices.length > 0 ? (
                        <ul style={{listStyle: 'none', padding: 0}}>
                            {userDevices.map(ud => {
                                const itemDetails = householdItems.find(hi => hi.id === ud.device_id);
                                return (
                                    <li key={ud.id} style={{padding: '0.5rem 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <span>
                                            <i className={`fas ${itemDetails?.icon || 'fa-question-circle'}`} style={{ marginRight: '0.5rem', color: 'var(--deep-blue)'}}></i>
                                            {itemDetails?.name || ud.custom_name || 'Unknown Device'} (x{ud.quantity})
                                        </span>
                                        <button onClick={() => handleRemoveItem(ud.id)} className="btn" style={{fontSize: '0.8rem', padding: '0.3rem 0.6rem', backgroundColor: 'var(--red-alert)', color: 'white'}}>Remove</button>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : <p>You haven't added any devices yet. Select items from the list above.</p>
                )}
            </div>

            {/* TODO: Add custom item functionality if time permits / required by user */}
        </div>
    );
}

export default DevicesPage;

