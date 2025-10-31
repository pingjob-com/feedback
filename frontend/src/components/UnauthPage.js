import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { FiArrowRight, FiLock, FiAlertCircle } from 'react-icons/fi';
import '../styles/unauth.css';

export default function UnauthPage() {
  return (
    <>
      <Header />
      <div className="unauth-container">
        <section className="unauth-hero">
          <div className="unauth-content">
            <div className="unauth-icon">
              <FiLock size={64} />
            </div>
            <h1>Access Restricted</h1>
            <p>You need to sign in to access this page.</p>
            <p className="unauth-subtitle">
              Join our community to share your feedback and ideas
            </p>
            
            <div className="unauth-buttons">
              <Link to="/login" className="btn btn-primary">
                Sign In <FiArrowRight size={18} />
              </Link>
              <Link to="/signup" className="btn btn-secondary">
                Create Account
              </Link>
            </div>

            <div className="unauth-info">
              <div className="info-item">
                <div className="info-icon">📝</div>
                <h3>Share Feedback</h3>
                <p>Share your ideas and suggestions</p>
              </div>
              <div className="info-item">
                <div className="info-icon">👥</div>
                <h3>Join Community</h3>
                <p>Connect with thousands of users</p>
              </div>
              <div className="info-item">
                <div className="info-icon">🚀</div>
                <h3>See Impact</h3>
                <p>Track your suggestions in action</p>
              </div>
            </div>
          </div>
        </section>

        <section className="unauth-cta">
          <div className="cta-box">
            <FiAlertCircle size={32} />
            <h2>Ready to Get Started?</h2>
            <p>It only takes 30 seconds to create a free account</p>
            <Link to="/signup" className="btn btn-primary-large">
              Sign Up Free <FiArrowRight size={18} />
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}