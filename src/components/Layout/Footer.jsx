import React from 'react';

function Footer() {
    return (
        <footer className="app-footer">
            <div className="footer-links">
                <a href="#about">About ESCOM</a> {/* Placeholder, link to section or page */}
                <a href="#services">Services</a> {/* Placeholder */}
                <a href="#contact">Contact Us</a> {/* Placeholder */}
            </div>
            <div className="social-icons mt-1">
                <a href="#facebook" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                <a href="#twitter" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                <a href="#linkedin" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
            </div>
            <p className="mt-1">&copy; {new Date().getFullYear()} ESCOM. Empowering your home with smart energy solutions.</p>
        </footer>
    );
}

export default Footer;

