import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, Facebook, Twitter } from 'lucide-react';
import './Footer.css';
import footerLogo from '../assets/images/autodealer-logo-dark.png';

export const SiteFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <img src={footerLogo} alt="AutoDealer" className="footer-logo" />
          <div className="social-links">
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <Youtube size={24} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <Facebook size={24} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <Twitter size={24} />
            </a>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <h3>HOW IT WORKS</h3>
            <ul>
              <li><Link to="/buying">Buying a Car</Link></li>
              <li><Link to="/selling">Selling a Car</Link></li>
              <li><Link to="/finalizing">Finalizing the Sale</Link></li>
              <li><Link to="/faqs">FAQs</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>SELLERS</h3>
            <ul>
              <li><Link to="/submit-car">Submit Your Car</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/photography-guide">Photography Guide</Link></li>
              <li><Link to="/inspections">Inspections</Link></li>
              <li><Link to="/concierge">Concierge Sales</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>HELPFUL LINKS</h3>
            <ul>
              <li><Link to="/browse">Browse</Link></li>
              <li><Link to="/community">Community</Link></li>
              <li><Link to="/support">Support</Link></li>
              <li><Link to="/shipping">Shipping</Link></li>
              <li><Link to="/careers">Careers</Link></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© Copyright {currentYear} Autodealer LLC.</p>
        <div className="legal-links">
          <Link to="/terms">Terms of Use</Link>
          <span className="separator">·</span>
          <Link to="/privacy">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
};