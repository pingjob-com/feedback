import React from 'react';
import { FiFacebook, FiTwitter, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import '../styles/footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>About HAPPY TWEET</h3>
          <p>
            HAPPY TWEET is a next-generation social media platform. This Feedback System 
            helps us collect valuable suggestions, ideas, and feedback from our community 
            to continuously improve and shape the platform's future.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="https://www.happytweet.net/about" target="_blank" rel="noopener noreferrer">About</a></li>
            <li><a href="https://help.happytweet.net/en" target="_blank" rel="noopener noreferrer">Help & Support</a></li>
            <li><a href="https://www.happytweet.net/contact-us" target="_blank" rel="noopener noreferrer">Contact Us</a></li>
            <li><a href="/signup">Sign Up</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact Us</h3>
          <div className="contact-item">
            <FiMail size={16} />
            <a href="mailto:support@happytweet.net">support@happytweet.net</a>
          </div>
          <div className="contact-item">
            <FiPhone size={16} />
            <a href="tel:+1234567890">+1 (234) 567-890</a>
          </div>
          <div className="contact-item">
            <FiMapPin size={16} />
            <span>123 Feedback Street, Digital City</span>
          </div>
        </div>

        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-links">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FiTwitter size={20} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FiFacebook size={20} />
            </a>
            <a href="mailto:support@happytweet.net" className="social-link">
              <FiMail size={20} />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} HAPPY TWEET Feedback System. Part of HAPPY TWEET - Next-Gen Social Media Platform. All rights reserved.</p>
        <div className="footer-links">
          <a href="https://www.happytweet.net/terms/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          <span>|</span>
          <a href="https://www.happytweet.net/terms/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
          <span>|</span>
          <a href="https://www.happytweet.net/contact-us" target="_blank" rel="noopener noreferrer">Contact Us</a>
        </div>
      </div>
    </footer>
  );
}