import React, { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '../App'; // Adjust path as needed
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import Toastify from 'toastify-js';
import { gsap } from 'gsap';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Helper function for usage color, similar to ControlsPage
const getUsageColor = (usage) => {
    if (usage > 1.5) return 'var(--red-alert)';    // High usage
    if (usage >= 0.5) return 'var(--yellow-alert)'; // Mid usage
    return 'var(--green-ok)';      // Low usage
};

function DashboardPage() {
    const { currentUser, apiClient } = useContext(AuthContext);
    const [summaryMetrics, setSummaryMetrics] = useState({ currentUsage: 0, projectedCost: 0, unitBalance: 0, depletionDate: 'N/A' });
    const [usageHistory, setUsageHistory] = useState({ labels: [], datasets: [] });
    const [activeDevices, setActiveDevices] = useState([]);
    const [powerUnits, setPowerUnits] = useState(0); // This will be the live-updated balance
    const [newUnits, setNewUnits] = useState('');
    const [alerts, setAlerts] = useState([]);

    const cardsRef = useRef([]);
    cardsRef.current = []; 
    const addToRefs = (el) => {
        if (el && !cardsRef.current.includes(el)) {
            cardsRef.current.push(el);
        }
    };

    const powerPulseRef = useRef(null);
    const dashboardRef = useRef(null);

    // Enhanced GSAP Animations for dashboard
    useEffect(() => {
        if (dashboardRef.current) {
            // Initial page load animation
            gsap.fromTo(dashboardRef.current, 
                { opacity: 0, y: 20 }, 
                { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
            );
        }

        if (cardsRef.current.length > 0) {
            // Enhanced card animations with stagger and bounce effect
            gsap.fromTo(cardsRef.current, 
                { opacity: 0, y: 50, scale: 0.9 }, 
                { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    duration: 0.6, 
                    stagger: 0.15, 
                    ease: 'back.out(1.7)',
                    delay: 0.3
                }
            );
        }
    }, [summaryMetrics]); // Re-run if metrics change to re-animate if needed

    // Floating animation for summary cards
    useEffect(() => {
        if (cardsRef.current.length > 0) {
            cardsRef.current.forEach((card, index) => {
                if (card && card.classList.contains('summary-card')) {
                    gsap.to(card, {
                        y: -5,
                        duration: 2,
                        repeat: -1,
                        yoyo: true,
                        ease: 'power1.inOut',
                        delay: index * 0.2
                    });
                }
            });
        }
    }, [summaryMetrics]);

    // Fetch initial data
    useEffect(() => {
        fetchUserDevices();
        fetchUnitBalance(); // Fetches initial balance
    }, [apiClient, currentUser]);

    const fetchUserDevices = async () => {
        if (!currentUser) return;
        try {
            const response = await apiClient.get('/users/devices');
            const householdItemsResponse = await apiClient.get('/devices/household-items');
            const householdItems = householdItemsResponse.data;

            const enrichedDevices = response.data.map(device => {
                const itemDetails = householdItems.find(item => item.id === device.device_id);
                return { ...device, ...itemDetails, name: itemDetails?.name || device.custom_name || 'Unknown Device' }; 
            });
            setActiveDevices(enrichedDevices.filter(d => d.is_active));
        } catch (error) {
            console.error("Error fetching user devices:", error);
        }
    };
    
    const fetchUnitBalance = async () => {
        if(!currentUser) return;
        try {
            const response = await apiClient.get('/users/units/balance');
            setPowerUnits(response.data.balance || 0);
        } catch (error) {
            console.error("Error fetching unit balance:", error);
            setPowerUnits(0); // Default to 0 on error
        }
    };

    // Calculate summary metrics and manage alerts based on current usage and power units
    useEffect(() => {
        const currentTotalUsage = activeDevices.reduce((sum, device) => sum + (device.power_consumption * device.quantity), 0);
        const projectedMonthlyCost = currentTotalUsage * 24 * 30 * 0.15; // Assuming $0.15/kWh, 24/7 for active devices
        
        let dailyUsageKWh = currentTotalUsage * 24; // kWh per day if current usage persists
        if (dailyUsageKWh === 0 && activeDevices.length > 0) { 
            dailyUsageKWh = activeDevices.reduce((sum, device) => sum + (device.power_consumption * device.quantity * (device.recommended_hours || 4)), 0);
        }

        const depletionDays = dailyUsageKWh > 0 ? (powerUnits / dailyUsageKWh) : Infinity;
        const depletionDateStr = isFinite(depletionDays) ? `${depletionDays.toFixed(1)} days` : 'N/A (no usage or ample units)';

        setSummaryMetrics({
            currentUsage: parseFloat(currentTotalUsage.toFixed(3)),
            projectedCost: parseFloat(projectedMonthlyCost.toFixed(2)),
            unitBalance: parseFloat(powerUnits.toFixed(2)), // Reflects live updated powerUnits
            depletionDate: depletionDateStr
        });

        // Alerts Logic
        if (isFinite(depletionDays) && depletionDays <= 2 && depletionDays > 0) {
            addAlert(`Warning: Power units are low! Estimated to last only ${depletionDays.toFixed(1)} days.`, 'warning', `low_units_${depletionDays.toFixed(0)}`);
        } else if (powerUnits <=0 && activeDevices.length > 0 && currentTotalUsage > 0){
            addAlert(`Critical: No power units remaining!`, 'critical', 'no_units');
        }

        if (currentTotalUsage > 2) { // Example: High usage alert
            addAlert(`High power consumption detected: ${currentTotalUsage.toFixed(2)} kWh/hour.`, 'warning', 'high_consumption');
        }

        // Simulate usage history data (replace with actual API call in a real app)
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const data = labels.map(() => Math.random() * 5 + currentTotalUsage / 2); 
        setUsageHistory({
            labels,
            datasets: [
                {
                    label: 'Weekly Power Usage (kWh)',
                    data,
                    fill: true,
                    backgroundColor: 'rgba(107, 33, 168, 0.2)', 
                    borderColor: 'var(--purple)',
                    tension: 0.4,
                    pointBackgroundColor: 'var(--cyan-accent)',
                    pointBorderColor: 'var(--purple)',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                },
            ],
        });

    }, [activeDevices, powerUnits]); // powerUnits is now a key dependency for live updates

    // Live Unit Balance Reduction Effect
    useEffect(() => {
        const currentTotalUsage = summaryMetrics.currentUsage; // kWh per hour
        if (currentTotalUsage <= 0 || powerUnits <= 0) {
            return; // No depletion if no usage or no units
        }

        const hourlyDepletionRate = currentTotalUsage;
        const depletionPerSecond = hourlyDepletionRate / 3600;

        const intervalId = setInterval(() => {
            setPowerUnits(prevUnits => {
                const newBalance = prevUnits - (depletionPerSecond * 5); // Deplete for 5 seconds
                if (newBalance <= 0) {
                    clearInterval(intervalId); // Stop depletion when units run out
                    return 0;
                }
                return newBalance;
            });
        }, 5000); // Update every 5 seconds

        return () => clearInterval(intervalId); // Cleanup interval on component unmount or when dependencies change

    }, [summaryMetrics.currentUsage, currentUser]); // Rerun if usage changes or user changes (to reset for new user)
                                                // Note: powerUnits itself is NOT a dependency here to avoid loop with its own update

    // Enhanced Power Pulse Animation
    useEffect(() => {
        if (powerPulseRef.current) {
            const usage = summaryMetrics.currentUsage;
            const color = getUsageColor(usage);
            let pulseSpeed = 1.5; // Default speed for low usage
            if (usage >= 0.5 && usage <= 1.5) pulseSpeed = 1; // Faster for mid
            if (usage > 1.5) pulseSpeed = 0.5; // Fastest for high

            // Enhanced pulse animation with multiple effects
            gsap.to(powerPulseRef.current, {
                duration: pulseSpeed,
                scale: 1.05,
                backgroundColor: color,
                boxShadow: `0 0 25px 10px ${color}66, 0 0 50px 20px ${color}33`,
                repeat: -1,
                yoyo: true,
                ease: 'power1.inOut'
            });

            // Add a subtle rotation for high usage
            if (usage > 1.5) {
                gsap.to(powerPulseRef.current.querySelector('.power-wave-animation'), {
                    rotation: 360,
                    duration: 3,
                    repeat: -1,
                    ease: 'none'
                });
            }
        }
    }, [summaryMetrics.currentUsage]);

    const addAlert = (message, type, uniqueId) => {
        setAlerts(prevAlerts => {
            // Avoid duplicate active alerts of the same kind (e.g. low units for 2 days)
            if (prevAlerts.find(alert => alert.uniqueId === uniqueId)) {
                return prevAlerts;
            }
            const newAlert = { id: Date.now(), message, type, uniqueId, timestamp: new Date() };
            // Show modal for critical alerts, toast for others
            if (type === 'critical' || type === 'warning') {
                Toastify({ 
                    text: message, 
                    duration: 5000, 
                    gravity: "top", 
                    position: "center", 
                    className: `toast-alert-${type} pulse-effect-${type}`,
                    close: true
                }).showToast();
            }
            return [newAlert, ...prevAlerts].slice(0, 5); // Keep max 5 alerts in state for display list
        });
    };

    const dismissAlert = (id) => {
        setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
    };

    const handleAddUnits = async (e) => {
        e.preventDefault();
        if (!newUnits || parseFloat(newUnits) <= 0) {
            Toastify({ text: "Please enter a valid positive number for units.", duration: 3000, className: "toast-alert-warning" }).showToast();
            return;
        }
        try {
            const response = await apiClient.post('/users/units', { units_amount: parseFloat(newUnits) });
            Toastify({ text: response.data.message, duration: 3000, backgroundColor: "linear-gradient(to right, var(--deep-blue), var(--purple))" }).showToast();
            setNewUnits('');
            fetchUnitBalance(); // Re-fetch to get the accurate balance from server, which will also update powerUnits state
        } catch (error) {
            console.error("Error adding units:", error);
            Toastify({ text: error.response?.data?.message || "Error adding units.", duration: 3000, className: "toast-alert-critical" }).showToast();
        }
    };

    const exportData = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Device,Duration(min),Consumed(kWh)\n";
        const dummyHistory = [
            { timestamp: new Date().toLocaleDateString(), device_id: 'item001', duration_minutes: 60, units_consumed: 0.009 },
            { timestamp: new Date().toLocaleDateString(), device_id: 'item002', duration_minutes: 1440, units_consumed: 3.6 },
        ];
        dummyHistory.forEach(row => {
            csvContent += `${row.timestamp},${row.device_id},${row.duration_minutes},${row.units_consumed}\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "escom_usage_data.csv");
        document.body.appendChild(link); 
        link.click();
        document.body.removeChild(link);
        Toastify({ text: "Usage data export initiated.", duration: 3000 }).showToast();
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                position: 'top', 
                labels: { 
                    color: 'var(--deep-blue)',
                    font: { size: 14, weight: '600' }
                } 
            },
            title: { 
                display: true, 
                text: 'Power Usage Trends', 
                color: 'var(--deep-blue)', 
                font: { size: 20, weight: '700' } 
            }
        },
        scales: {
            y: { 
                beginAtZero: true, 
                ticks: { 
                    color: 'var(--deep-blue)',
                    font: { size: 12, weight: '500' }
                }, 
                grid: { 
                    color: 'rgba(30, 58, 138, 0.1)',
                    lineWidth: 1
                } 
            },
            x: { 
                ticks: { 
                    color: 'var(--deep-blue)',
                    font: { size: 12, weight: '500' }
                }, 
                grid: { 
                    color: 'rgba(30, 58, 138, 0.1)',
                    lineWidth: 1
                } 
            }
        },
        animation: {
            duration: 2000,
            easing: 'easeInOutQuart'
        }
    };

    return (
        <div className="dashboard-page fade-in" ref={dashboardRef} style={{ 
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            minHeight: '100vh',
            padding: '2rem'
        }}>
            <h1 style={{ 
                marginBottom: '2rem',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                color: 'var(--deep-blue)',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
                fontWeight: '800',
                textAlign: 'center'
            }}>
                Welcome, {currentUser?.full_name || 'User'}! ⚡
            </h1>

            {/* Enhanced Alerts Section */}
            {alerts.length > 0 && (
                <div className="card alerts-section" ref={addToRefs} style={{
                    borderColor: 'var(--red-alert)',
                    background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
                    border: '2px solid var(--red-alert)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(244, 67, 54, 0.2)',
                    marginBottom: '2rem'
                }}>
                    <h3 style={{
                        color: 'var(--red-alert)',
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <i className="fas fa-exclamation-triangle" style={{fontSize: '1.2rem'}}></i>
                        Notifications
                    </h3>
                    <ul style={{listStyleType: 'none', padding: 0}}>
                        {alerts.map(alert => (
                            <li key={alert.id} className={`alert-item alert-${alert.type}`} style={{
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                padding: '1rem', 
                                marginBottom: '0.5rem',
                                borderRadius: '8px',
                                background: 'rgba(255, 255, 255, 0.8)',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                transition: 'all 0.3s ease'
                            }}>
                                <span style={{
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    color: '#2D3748'
                                }}>
                                    <i className={`fas ${alert.type === 'critical' ? 'fa-skull-crossbones' : alert.type === 'warning' ? 'fa-exclamation-circle' : 'fa-info-circle'}`} style={{marginRight: '0.5rem', color: alert.type === 'critical' ? 'var(--red-alert)' : 'var(--yellow-alert)'}}></i> 
                                    {alert.message} 
                                    <small style={{color: '#718096', marginLeft: '0.5rem'}}>({new Date(alert.timestamp).toLocaleTimeString()})</small>
                                </span>
                                <button 
                                    onClick={() => dismissAlert(alert.id)} 
                                    className="btn-close-alert"
                                    style={{
                                        background: 'rgba(244, 67, 54, 0.1)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '30px',
                                        height: '30px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    &times;
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Enhanced Power Pulse Visualization */}
            <div ref={powerPulseRef} className="card power-pulse-meter" style={{ 
                marginBottom: '2rem', 
                textAlign: 'center', 
                padding: '2rem', 
                borderRadius: '20px',
                background: 'linear-gradient(135deg, var(--deep-blue), var(--purple))',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
            }}>
                <h3 style={{
                    color: 'var(--white)', 
                    margin: '0 0 1rem 0',
                    fontSize: '1.8rem',
                    fontWeight: '700',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
                }}>
                    ⚡ Live Power Flow
                </h3>
                <div className="power-wave-animation" style={{
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    margin: '1rem 0'
                }}>
                    <span style={{ 
                        fontSize: '3rem', 
                        fontWeight: 'bold', 
                        color: 'var(--white)',
                        textShadow: '3px 3px 6px rgba(0, 0, 0, 0.5)',
                        zIndex: 1
                    }}>
                        {summaryMetrics.currentUsage} kWh/hour
                    </span>
                </div>
                <p style={{
                    color: 'var(--white)', 
                    fontSize: '1.1rem', 
                    margin: '1rem 0 0 0',
                    fontWeight: '600',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
                }}>
                    Status: {summaryMetrics.currentUsage > 1.5 ? "🚨 High Usage" : summaryMetrics.currentUsage >= 0.5 ? "⚠️ Moderate Usage" : "✅ Low Usage"}
                </p>
            </div>

            <div className="grid-container grid-container-3-col" style={{ marginBottom: '2rem' }}>
                <div className="card summary-card" ref={addToRefs} style={{ 
                    background: 'linear-gradient(135deg, var(--deep-blue), var(--purple))', 
                    color: 'var(--white)',
                    borderRadius: '20px',
                    padding: '2rem',
                    boxShadow: '0 15px 35px rgba(30, 58, 138, 0.3)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.2)',
                        zIndex: 0
                    }}></div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <i className="fas fa-bolt fa-3x" style={{ 
                            color: 'var(--cyan-accent)', 
                            marginBottom: '1rem',
                            filter: 'drop-shadow(0 4px 8px rgba(0, 188, 212, 0.5))',
                            textShadow: '0 0 20px rgba(0, 188, 212, 0.5)'
                        }}></i>
                        <h3 style={{
                            fontSize: '1.4rem',
                            fontWeight: '800',
                            marginBottom: '1rem',
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 10px rgba(0, 0, 0, 0.5)',
                            color: 'var(--white)',
                            letterSpacing: '0.5px'
                        }}>
                            Current Usage
                        </h3>
                        <p style={{ 
                            fontSize: '2.8rem', 
                            fontWeight: '900', 
                            color: 'var(--white)',
                            textShadow: '3px 3px 6px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 0, 0, 0.6)',
                            margin: '0',
                            letterSpacing: '1px',
                            lineHeight: '1.1'
                        }}>
                            {summaryMetrics.currentUsage} kWh/hour
                        </p>
                    </div>
                </div>
                <div className="card summary-card" ref={addToRefs} style={{ 
                    background: 'linear-gradient(135deg, var(--purple), var(--deep-blue))', 
                    color: 'var(--white)',
                    borderRadius: '20px',
                    padding: '2rem',
                    boxShadow: '0 15px 35px rgba(107, 33, 168, 0.3)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.2)',
                        zIndex: 0
                    }}></div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <i className="fas fa-dollar-sign fa-3x" style={{ 
                            color: 'var(--cyan-accent)', 
                            marginBottom: '1rem',
                            filter: 'drop-shadow(0 4px 8px rgba(0, 188, 212, 0.5))',
                            textShadow: '0 0 20px rgba(0, 188, 212, 0.5)'
                        }}></i>
                        <h3 style={{
                            fontSize: '1.4rem',
                            fontWeight: '800',
                            marginBottom: '1rem',
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 10px rgba(0, 0, 0, 0.5)',
                            color: 'var(--white)',
                            letterSpacing: '0.5px'
                        }}>
                            Projected Monthly Cost
                        </h3>
                        <p style={{ 
                            fontSize: '2.8rem',
                            fontWeight: '900', 
                            color: 'var(--white)',
                            textShadow: '3px 3px 6px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 0, 0, 0.6)',
                            margin: '0',
                            letterSpacing: '1px',
                            lineHeight: '1.1'
                        }}>
                            ${summaryMetrics.projectedCost}
                        </p>
                    </div>
                </div>
                <div className="card summary-card" ref={addToRefs} style={{ 
                    background: 'linear-gradient(135deg, var(--deep-blue), var(--purple))', 
                    color: 'var(--white)',
                    borderRadius: '20px',
                    padding: '2rem',
                    boxShadow: '0 15px 35px rgba(30, 58, 138, 0.3)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.2)',
                        zIndex: 0
                    }}></div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <i className="fas fa-battery-full fa-3x" style={{ 
                            color: 'var(--cyan-accent)', 
                            marginBottom: '1rem',
                            filter: 'drop-shadow(0 4px 8px rgba(0, 188, 212, 0.5))',
                            textShadow: '0 0 20px rgba(0, 188, 212, 0.5)'
                        }}></i>
                        <h3 style={{
                            fontSize: '1.4rem',
                            fontWeight: '800',
                            marginBottom: '1rem',
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 10px rgba(0, 0, 0, 0.5)',
                            color: 'var(--white)',
                            letterSpacing: '0.5px'
                        }}>
                            Unit Balance
                        </h3>
                        <p style={{ 
                            fontSize: '2.8rem', 
                            fontWeight: '900', 
                            color: 'var(--white)',
                            textShadow: '3px 3px 6px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 0, 0, 0.6)',
                            margin: '0 0 0.5rem 0',
                            letterSpacing: '1px',
                            lineHeight: '1.1'
                        }}>
                            {summaryMetrics.unitBalance} kWh
                        </p>
                        <small style={{
                            color: 'var(--white)',
                            fontSize: '1rem',
                            opacity: '1',
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                            fontWeight: '600',
                            letterSpacing: '0.5px'
                        }}>
                            Est. Depletion: {summaryMetrics.depletionDate}
                        </small>
                    </div>
                </div>
            </div>

            <div className="card chart-container" ref={addToRefs} style={{ 
                marginBottom: '2rem', 
                height: '400px',
                borderRadius: '20px',
                padding: '2rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(0, 0, 0, 0.05)'
            }}>
                {usageHistory.datasets.length > 0 ? 
                    <Line options={chartOptions} data={usageHistory} /> : 
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        fontSize: '1.2rem',
                        color: 'var(--deep-blue)',
                        fontWeight: '600'
                    }}>
                        📊 Loading chart data...
                    </div>
                }
            </div>

            <div className="grid-container grid-container-3-col" style={{ marginBottom: '2rem' }}>
                <div className="card unit-management" ref={addToRefs} style={{
                    borderRadius: '20px',
                    padding: '2rem',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease'
                }}>
                    <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: 'var(--deep-blue)',
                        marginBottom: '1.5rem',
                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
                    }}>
                        💰 Manage Power Units
                    </h3>
                    <form onSubmit={handleAddUnits} className="form-group">
                        <label htmlFor="units" style={{
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: 'var(--deep-blue)',
                            marginBottom: '0.75rem'
                        }}>
                            Add Units (kWh)
                        </label>
                        <input 
                            type="number" 
                            id="units" 
                            name="units" 
                            value={newUnits}
                            onChange={(e) => setNewUnits(e.target.value)} 
                            placeholder="e.g., 100"
                            min="1"
                            required 
                            style={{
                                fontSize: '1.1rem',
                                padding: '1rem',
                                border: '2px solid #CBD5E0',
                                borderRadius: '12px',
                                transition: 'all 0.3s ease'
                            }}
                        />
                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            style={{ 
                                marginTop: '1.5rem', 
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                borderRadius: '12px',
                                boxShadow: '0 4px 15px rgba(30, 58, 138, 0.3)'
                            }}
                        >
                            🛒 Purchase Units
                        </button>
                    </form>
                </div>

                <div className="card tips-widget" ref={addToRefs} style={{
                    borderRadius: '20px',
                    padding: '2rem',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease'
                }}>
                    <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: 'var(--deep-blue)',
                        marginBottom: '1.5rem',
                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
                    }}>
                        💡 Energy Saving Tips
                    </h3>
                    <ul style={{ 
                        paddingLeft: '1.5rem',
                        fontSize: '1.1rem',
                        lineHeight: '1.8',
                        color: '#2D3748',
                        fontWeight: '500'
                    }}>
                        <li style={{marginBottom: '0.5rem'}}>Turn off lights when leaving a room.</li>
                        <li style={{marginBottom: '0.5rem'}}>Unplug chargers when not in use.</li>
                        <li style={{marginBottom: '0.5rem'}}>Use smart scheduling for high-consumption devices.</li>
                        <li style={{marginBottom: '0.5rem'}}>Consider LED bulbs for better efficiency.</li>
                        {summaryMetrics.currentUsage > 1 && (
                            <li style={{
                                color: 'var(--red-alert)', 
                                fontWeight: '700',
                                marginTop: '1rem',
                                padding: '0.75rem',
                                background: 'rgba(244, 67, 54, 0.1)',
                                borderRadius: '8px',
                                border: '1px solid rgba(244, 67, 54, 0.2)'
                            }}>
                                ⚠️ Your current usage is high. Check active devices!
                            </li>
                        )}
                    </ul>
                </div>
                
                <div className="card data-export" ref={addToRefs} style={{
                    borderRadius: '20px',
                    padding: '2rem',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease'
                }}>
                    <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: 'var(--deep-blue)',
                        marginBottom: '1.5rem',
                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
                    }}>
                        📊 Export Data
                    </h3>
                    <p style={{
                        fontSize: '1.1rem',
                        color: '#2D3748',
                        marginBottom: '1.5rem',
                        fontWeight: '500',
                        lineHeight: '1.6'
                    }}>
                        Download your power usage history for analysis and record keeping.
                    </p>
                    <button 
                        onClick={exportData} 
                        className="btn btn-secondary" 
                        style={{ 
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            borderRadius: '12px',
                            boxShadow: '0 4px 15px rgba(0, 188, 212, 0.3)'
                        }}
                    >
                        📥 Export as CSV
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;

