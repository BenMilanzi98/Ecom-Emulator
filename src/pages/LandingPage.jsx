import React, { useContext } from 'react';
import { AuthContext } from '../App'; // Adjust path as needed
import { gsap } from 'gsap';
import Toastify from 'toastify-js';

// Placeholder for hero overlay image - user will need to provide or we source a generic one
// import heroOverlay from '../../public/assets/images/hero-overlay.svg'; // Example path

function LandingPage() {
    const { openAuthModal } = useContext(AuthContext);

    React.useEffect(() => {
        // GSAP Animations for hero section
        gsap.fromTo(".hero-content h1", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' });
        gsap.fromTo(".hero-content .mission-statement", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: 'power3.out' });
        gsap.fromTo(".hero-content .cta-buttons", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.6, ease: 'power3.out' });
        // Subtle wave animation for hero background (can be CSS or a more complex GSAP animation)
        // For CSS: ensure .hero-section has a ::before or ::after pseudo-element with the wave keyframes
    }, []);

    const handleContactSubmit = (e) => {
        e.preventDefault();
        // Basic form validation (can be more extensive)
        const name = e.target.name.value;
        const email = e.target.email.value;
        const message = e.target.message.value;
        if (!name || !email || !message) {
            Toastify({ text: "Please fill in all fields.", duration: 3000, gravity: "top", position: "right", className: "toast-alert-warning" }).showToast();
            return;
        }
        // Simulate form submission
        Toastify({ text: "Message sent successfully! We'll get back to you soon.", duration: 5000, gravity: "top", position: "right", backgroundColor: "linear-gradient(to right, #1E3A8A, #6B21A8)" }).showToast();
        e.target.reset();
    };

    const testimonials = [
        {
            quote: "ESCOM has revolutionized how I manage my home energy. The real-time monitoring is fantastic!",
            name: "Alice Wonderland",
            avatar: "https://i.pravatar.cc/150?img=1" // Placeholder avatar
        },
        {
            quote: "The power misuse alerts have helped me save so much on my monthly bills. Highly recommended!",
            name: "Bob The Builder",
            avatar: "https://i.pravatar.cc/150?img=2" // Placeholder avatar
        },
        {
            quote: "Smart scheduling is a game-changer. My energy consumption is more efficient than ever.",
            name: "Carol Danvers",
            avatar: "https://i.pravatar.cc/150?img=3" // Placeholder avatar
        }
    ];

    return (
        <div className="landing-page fade-in">
            {/* Hero Section */}
            <section className="hero-section" style={{
                backgroundImage: `linear-gradient(135deg, rgba(30, 58, 138, 0.95), rgba(107, 33, 168, 0.95)), url('/assets/images/hero-overlay.svg')`,
                backgroundSize: 'cover, contain',
                backgroundPosition: 'center, bottom right',
                backgroundRepeat: 'no-repeat',
                color: 'var(--white)',
                padding: '8rem 2rem 6rem 2rem',
                textAlign: 'center',
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.5)'
            }}>
                <div className="hero-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ 
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
                        lineHeight: '1.2', 
                        marginBottom: '1.5rem',
                        textShadow: '3px 3px 6px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 0, 0, 0.5)',
                        fontWeight: '700',
                        color: 'var(--white)',
                        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8))'
                    }}>
                        Empowering Your Home with Smart Energy Solutions
                    </h1>
                    <p className="mission-statement" style={{ 
                        fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', 
                        margin: '1.5rem 0 2.5rem 0',
                        lineHeight: '1.6',
                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 0, 0, 0.6)',
                        opacity: '1',
                        color: 'var(--white)',
                        fontWeight: '500'
                    }}>
                        Reliable electricity supply, real-time monitoring, power misuse alerts, and cost-saving tips.
                    </p>
                    <div className="cta-buttons" style={{ 
                        display: 'flex', 
                        gap: '1rem', 
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <button 
                            onClick={() => openAuthModal('signup')} 
                            className="btn btn-primary" 
                            style={{ 
                                padding: '1rem 2rem',
                                fontSize: '1.1rem',
                                minWidth: '160px',
                                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4), 0 0 30px rgba(0, 0, 0, 0.3)',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            Sign Up Now
                        </button>
                        <button 
                            onClick={() => openAuthModal('signin')} 
                            className="btn btn-secondary"
                            style={{ 
                                padding: '1rem 2rem',
                                fontSize: '1.1rem',
                                minWidth: '160px',
                                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4), 0 0 30px rgba(0, 0, 0, 0.3)',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" style={{ 
                padding: '6rem 2rem', 
                backgroundColor: '#f9fafb',
                minHeight: '60vh'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{ 
                        textAlign: 'center', 
                        marginBottom: '4rem',
                        fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                        color: 'var(--deep-blue)',
                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
                        fontWeight: '800'
                    }}>
                        Our Services
                    </h2>
                    <div className="grid-container grid-container-3-col">
                        <div className="card text-center" style={{ 
                            padding: '2rem 1.5rem',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <i className="fas fa-bolt fa-3x" style={{ 
                                    color: 'var(--cyan-accent)', 
                                    marginBottom: '1.5rem',
                                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                                }}></i>
                                <h3 style={{ 
                                    marginBottom: '1rem',
                                    fontSize: '1.5rem',
                                    color: 'var(--deep-blue)',
                                    fontWeight: '800',
                                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
                                }}>
                                    Reliable Supply
                                </h3>
                                <p className="secondary-text" style={{ 
                                    fontSize: '1.1rem',
                                    lineHeight: '1.6',
                                    color: '#2D3748',
                                    fontWeight: '500'
                                }}>
                                    Continuous and dependable electricity for your home and business needs.
                                </p>
                            </div>
                        </div>
                        <div className="card text-center" style={{ 
                            padding: '2rem 1.5rem',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <i className="fas fa-chart-line fa-3x" style={{ 
                                    color: 'var(--cyan-accent)', 
                                    marginBottom: '1.5rem',
                                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                                }}></i>
                                <h3 style={{ 
                                    marginBottom: '1rem',
                                    fontSize: '1.5rem',
                                    color: 'var(--deep-blue)',
                                    fontWeight: '800',
                                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
                                }}>
                                    Real-Time Monitoring
                                </h3>
                                <p className="secondary-text" style={{ 
                                    fontSize: '1.1rem',
                                    lineHeight: '1.6',
                                    color: '#2D3748',
                                    fontWeight: '500'
                                }}>
                                    Track your power usage live and gain insights into your consumption patterns.
                                </p>
                            </div>
                        </div>
                        <div className="card text-center" style={{ 
                            padding: '2rem 1.5rem',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <i className="fas fa-bell fa-3x" style={{ 
                                    color: 'var(--cyan-accent)', 
                                    marginBottom: '1.5rem',
                                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                                }}></i>
                                <h3 style={{ 
                                    marginBottom: '1rem',
                                    fontSize: '1.5rem',
                                    color: 'var(--deep-blue)',
                                    fontWeight: '800',
                                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
                                }}>
                                    Misuse Alerts
                                </h3>
                                <p className="secondary-text" style={{ 
                                    fontSize: '1.1rem',
                                    lineHeight: '1.6',
                                    color: '#2D3748',
                                    fontWeight: '500'
                                }}>
                                    Get notified about potential power wastage and optimize your usage.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section id="benefits" style={{ 
                padding: '6rem 2rem',
                minHeight: '60vh'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{ 
                        textAlign: 'center', 
                        marginBottom: '4rem',
                        fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                        color: 'var(--deep-blue)',
                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
                        fontWeight: '800'
                    }}>
                        Why Choose ESCOM?
                    </h2>
                    <div className="grid-container grid-container-3-col">
                        <div className="card" style={{ 
                            padding: '2rem 1.5rem',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <h3 style={{ 
                                    color: 'var(--purple)',
                                    fontSize: '1.5rem',
                                    marginBottom: '1rem',
                                    fontWeight: '800',
                                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
                                }}>
                                    Cost Efficiency
                                </h3>
                                <p className="secondary-text" style={{ 
                                    fontSize: '1.1rem',
                                    lineHeight: '1.6',
                                    color: '#2D3748',
                                    fontWeight: '500'
                                }}>
                                    Reduce your electricity bills with smart management tools and timely alerts.
                                </p>
                            </div>
                        </div>
                        <div className="card" style={{ 
                            padding: '2rem 1.5rem',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <h3 style={{ 
                                    color: 'var(--purple)',
                                    fontSize: '1.5rem',
                                    marginBottom: '1rem',
                                    fontWeight: '800',
                                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
                                }}>
                                    Environmental Sustainability
                                </h3>
                                <p className="secondary-text" style={{ 
                                    fontSize: '1.1rem',
                                    lineHeight: '1.6',
                                    color: '#2D3748',
                                    fontWeight: '500'
                                }}>
                                    Contribute to a greener planet by optimizing energy consumption and reducing waste.
                                </p>
                            </div>
                        </div>
                        <div className="card" style={{ 
                            padding: '2rem 1.5rem',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <h3 style={{ 
                                    color: 'var(--purple)',
                                    fontSize: '1.5rem',
                                    marginBottom: '1rem',
                                    fontWeight: '800',
                                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
                                }}>
                                    Smart Home Integration
                                </h3>
                                <p className="secondary-text" style={{ 
                                    fontSize: '1.1rem',
                                    lineHeight: '1.6',
                                    color: '#2D3748',
                                    fontWeight: '500'
                                }}>
                                    Seamlessly integrate with your smart home devices for automated energy savings.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" style={{ 
                padding: '6rem 2rem', 
                backgroundColor: '#f9fafb',
                minHeight: '60vh'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{ 
                        textAlign: 'center', 
                        marginBottom: '4rem',
                        fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                        color: 'var(--deep-blue)',
                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
                        fontWeight: '800'
                    }}>
                        What Our Customers Say
                    </h2>
                    <div className="grid-container grid-container-3-col">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="card" style={{ 
                                padding: '2rem 1.5rem',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}>
                                <div>
                                    <img 
                                        src={testimonial.avatar} 
                                        alt={testimonial.name} 
                                        style={{ 
                                            width: '80px', 
                                            height: '80px', 
                                            borderRadius: '50%', 
                                            margin: '0 auto 1.5rem auto', 
                                            display: 'block',
                                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                                        }} 
                                    />
                                    <p style={{ 
                                        fontStyle: 'italic',
                                        fontSize: '1.1rem',
                                        lineHeight: '1.6',
                                        color: '#2D3748',
                                        marginBottom: '1.5rem',
                                        fontWeight: '500'
                                    }}>
                                        "{testimonial.quote}"
                                    </p>
                                    <p style={{ 
                                        fontWeight: '700', 
                                        textAlign: 'right',
                                        fontSize: '1rem',
                                        color: 'var(--deep-blue)',
                                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
                                    }}>
                                        - {testimonial.name}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" style={{ 
                padding: '6rem 2rem',
                minHeight: '60vh'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{ 
                        textAlign: 'center', 
                        marginBottom: '4rem',
                        fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                        color: 'var(--deep-blue)',
                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
                        fontWeight: '800'
                    }}>
                        Get In Touch
                    </h2>
                    <div style={{ 
                        maxWidth: '700px', 
                        margin: '0 auto' 
                    }} className="card">
                        <form onSubmit={handleContactSubmit} style={{ marginBottom: '2rem' }}>
                            <div className="form-group">
                                <label htmlFor="name" style={{ 
                                    fontSize: '1.1rem',
                                    color: 'var(--deep-blue)',
                                    fontWeight: '600'
                                }}>
                                    Full Name
                                </label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    name="name" 
                                    required 
                                    style={{
                                        fontSize: '1.1rem',
                                        padding: '1rem',
                                        border: '2px solid #CBD5E0',
                                        borderRadius: '8px'
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email" style={{ 
                                    fontSize: '1.1rem',
                                    color: 'var(--deep-blue)',
                                    fontWeight: '600'
                                }}>
                                    Email Address
                                </label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    required 
                                    style={{
                                        fontSize: '1.1rem',
                                        padding: '1rem',
                                        border: '2px solid #CBD5E0',
                                        borderRadius: '8px'
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="message" style={{ 
                                    fontSize: '1.1rem',
                                    color: 'var(--deep-blue)',
                                    fontWeight: '600'
                                }}>
                                    Message
                                </label>
                                <textarea 
                                    id="message" 
                                    name="message" 
                                    rows="5" 
                                    required 
                                    style={{
                                        fontSize: '1.1rem',
                                        padding: '1rem',
                                        border: '2px solid #CBD5E0',
                                        borderRadius: '8px',
                                        resize: 'vertical'
                                    }}
                                ></textarea>
                            </div>
                            <button 
                                type="submit" 
                                className="btn btn-primary" 
                                style={{ 
                                    width: '100%',
                                    padding: '1rem',
                                    fontSize: '1.1rem',
                                    fontWeight: '600'
                                }}
                            >
                                Send Message
                            </button>
                        </form>
                        <div style={{ 
                            marginTop: '2rem', 
                            textAlign: 'center',
                            padding: '2rem',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px',
                            border: '1px solid #e9ecef'
                        }} className="secondary-text">
                            <p style={{ 
                                fontSize: '1.1rem',
                                marginBottom: '0.5rem',
                                color: '#2D3748',
                                fontWeight: '600'
                            }}>
                                Email: support@escom.example
                            </p>
                            <p style={{ 
                                fontSize: '1.1rem',
                                marginBottom: '0.5rem',
                                color: '#2D3748',
                                fontWeight: '600'
                            }}>
                                Phone: +123-456-7890
                            </p>
                            <p style={{ 
                                fontSize: '1.1rem',
                                color: '#2D3748',
                                fontWeight: '600'
                            }}>
                                Address: 123 Energy St, Power City, PC 54321
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default LandingPage;

