import React from 'react';
import { useTheme } from '../ThemeContext';

const Footer = () => {
    const { isDarkMode } = useTheme();

    return (
        <footer className={`footer ${isDarkMode ? 'dark' : 'light'}`}>
            <div className="footer-content">
                <div className="footer-links">
                    <a href="https://github.com/22BRS1317" target="_blank" rel="noopener noreferrer">
                        GitHub
                    </a>
                    <span className="separator">•</span>
                    <a href="https://22brs1317.github.io/Portfolio/" target="_blank" rel="noopener noreferrer">
                        Portfolio
                    </a>
                    <span className="separator">•</span>
                    <a href="/privacy">
                        Privacy Policy
                    </a>
                </div>
                <div className="footer-copyright">
                    © {new Date().getFullYear()} Chakri Thotakura. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
