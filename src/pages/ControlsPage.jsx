import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../App'; // Adjust path as needed
import Toastify from 'toastify-js';
import { gsap } from 'gsap';

// Helper function for usage color, consistent with DashboardPage
const getUsageColor = (usage) => {
    if (usage > 1.5) return 'var(--red-alert)';    // High usage
    if (usage >= 0.5) return 'var(--yellow-alert)'; // Mid usage
    return 'var(--green-ok)';      // Low usage
};

function ControlsPage() {
    const { apiClient, currentUser } = useContext(AuthContext);
    const [userDevices, setUserDevices] = useState([]);
    const [householdItems, setHouseholdItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState('all'); // 'all', 'active', 'inactive'
    const [totalCurrentUsage, setTotalCurrentUsage] = useState(0);

    const deviceCardsRef = useRef([]);
    deviceCardsRef.current = [];
    const addToRefs = (el) => {
        if (el && !deviceCardsRef.current.includes(el)) {
            deviceCardsRef.current.push(el);
        }
    };

    useEffect(() => {
        fetchHouseholdItems();
        fetchUserDevices();
    }, [apiClient, currentUser]);

    useEffect(() => {
        if (!loading && deviceCardsRef.current.length > 0) {
            gsap.fromTo(deviceCardsRef.current, 
                { opacity: 0, scale: 0.95, y: 20 }, 
                { opacity: 1, scale: 1, y: 0, duration: 0.4, stagger: 0.07, ease: 'power3.out' }
            );
        }
    }, [loading, userDevices, searchTerm, filterActive]);

    useEffect(() => {
        const currentTotal = userDevices
            .filter(device => device.is_active)
            .reduce((sum, device) => sum + (device.power_consumption * device.quantity), 0);
        setTotalCurrentUsage(parseFloat(currentTotal.toFixed(3)));
    }, [userDevices]);

    const fetchHouseholdItems = async () => {
        try {
            const response = await apiClient.get('/devices/household-items');
            setHouseholdItems(response.data || []);
        } catch (error) {
            console.error("Error fetching household items:", error);
            Toastify({ text: "Failed to load item details.", duration: 3000, className: "toast-alert-critical" }).showToast();
        }
    };

    const fetchUserDevices = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const response = await apiClient.get('/users/devices');
            const devicesFromApi = response.data || [];
            const enriched = devicesFromApi.map(ud => {
                const itemDetail = householdItems.find(hi => hi.id === ud.device_id) || {};
                return { ...ud, ...itemDetail, name: itemDetail.name || ud.custom_name || 'Unknown Device' };
            });
            setUserDevices(enriched);
        } catch (error) {
            console.error("Error fetching user devices:", error);
            Toastify({ text: "Failed to load your devices for control.", duration: 3000, className: "toast-alert-critical" }).showToast();
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (householdItems.length > 0 && userDevices.some(ud => !ud.power_consumption)) {
            fetchUserDevices();
        }
    }, [householdItems]);

    const toggleDeviceState = async (userDeviceId, currentState) => {
        try {
            const response = await apiClient.put(`/users/devices/${userDeviceId}/toggle`, { is_active: !currentState });
            Toastify({ text: response.data.message, duration: 2000, backgroundColor: "linear-gradient(to right, #1E3A8A, #6B21A8)" }).showToast();
            setUserDevices(prevDevices => 
                prevDevices.map(device => 
                    device.id === userDeviceId ? { ...device, is_active: !currentState } : device
                )
            );
            // Trigger alert when device is turned on
            if (!currentState) {
                const deviceDetails = userDevices.find(d => d.id === userDeviceId);
                Toastify({ 
                    text: `${deviceDetails?.name || 'Device'} turned ON.`,
                    duration: 3000, 
                    gravity: "top", 
                    position: "center", 
                    backgroundColor: "var(--green-ok)"
                }).showToast();
            }
        } catch (error) {
            console.error("Error toggling device state:", error);
            Toastify({ text: error.response?.data?.message || "Failed to toggle device.", duration: 3000, className: "toast-alert-critical" }).showToast();
        }
    };

    const filteredUserDevices = userDevices.filter(device => {
        const name = device.name || device.custom_name || '';
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterActive === 'all' || (filterActive === 'active' && device.is_active) || (filterActive === 'inactive' && !device.is_active);
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return <p>Loading device controls...</p>;
    }

    const usagePercentage = Math.min((totalCurrentUsage / 3) * 100, 100); // Assuming 3kWh is max for the bar display
    const meterColor = getUsageColor(totalCurrentUsage);

    return (
        <div className="controls-page fade-in">
            <h1>Device Control Panel</h1>
            <p className="secondary-text">Toggle your devices on or off. Monitor real-time power consumption.</p>

            <div className="card" style={{ marginBottom: '2rem', padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input 
                        type="text" 
                        placeholder="Search devices..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        style={{ flexGrow: 1, padding: '0.75rem', minWidth: '200px' }}
                    />
                    <select 
                        value={filterActive} 
                        onChange={(e) => setFilterActive(e.target.value)}
                        style={{ padding: '0.75rem' }}
                    >
                        <option value="all">All Devices</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>
                </div>
                
                <div className="real-time-meter-card card" style={{ marginTop: '1.5rem', textAlign: 'center', backgroundColor: '#f0f4f8' }}>
                    <h3 style={{color: 'var(--deep-blue)', marginBottom: '1rem'}}>Total Current Usage</h3>
                    <div className="usage-value" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: meterColor, margin: '0.5rem 0' }}>
                        {totalCurrentUsage.toFixed(3)} kWh/hour
                    </div>
                    <div className="usage-bar-container">
                        <div 
                            className="usage-bar-fill"
                            style={{
                                width: `${usagePercentage}%`,
                                backgroundColor: meterColor,
                                transition: 'width 0.5s ease-in-out, background-color 0.5s ease-in-out'
                            }}
                        ></div>
                    </div>
                     <p style={{color: meterColor, fontSize: '0.9rem', marginTop: '0.5rem'}}>
                        {totalCurrentUsage > 1.5 ? "High Usage" : totalCurrentUsage >= 0.5 ? "Moderate Usage" : "Low Usage"}
                    </p>
                </div>
            </div>

            {filteredUserDevices.length === 0 && !loading && (
                <p>No devices match your current filters, or you haven\'t added any devices yet. Go to \'My Devices\' to add some.</p>
            )}

            <div className="grid-container grid-container-3-col">
                {filteredUserDevices.map(device => {
                    const deviceName = device.name || device.custom_name || 'Unnamed Device';
                    const deviceIcon = device.icon || 'fa-toggle-off';
                    const consumption = device.power_consumption * device.quantity;
                    const cardClass = `card device-control-card ${device.is_active ? 'device-active' : ''}`;
                    // Removed electric-wave-effect from here, can be added to dashboard or specific elements if desired
                    const toggleClass = `btn ${device.is_active ? 'btn-primary' : 'btn-secondary'} ${device.is_active ? 'pulse-effect-active-toggle' : ''}`;

                    return (
                        <div key={device.id} className={cardClass} ref={addToRefs} style={{borderColor: device.is_active ? 'var(--cyan-accent)' : '#e0e0e0', borderWidth: '2px', borderStyle: 'solid'}}>
                            <i className={`fas ${deviceIcon} fa-2x`} style={{ color: device.is_active ? 'var(--cyan-accent)' : 'var(--deep-blue)', marginBottom: '0.5rem' }}></i>
                            <h3>{deviceName} (x{device.quantity})</h3>
                            <p className="secondary-text">Current: {consumption.toFixed(3)} kWh/hour</p>
                            <button 
                                onClick={() => toggleDeviceState(device.id, device.is_active)} 
                                className={toggleClass}
                                style={{ width: '100%', marginTop: '1rem' }}
                                aria-pressed={device.is_active}
                            >
                                {device.is_active ? 'Turn Off' : 'Turn On'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ControlsPage;

