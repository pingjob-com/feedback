import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import Header from './Header';
import Footer from './Footer';
import { 
  FiArrowRight, FiStar, FiUsers, FiBarChart2, FiLock, 
  FiCheckCircle, FiMessageSquare, FiTrendingUp, FiAward,
  FiChevronDown, FiChevronUp, FiEye
} from 'react-icons/fi';
import axios from 'axios';
import '../styles/home.css';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, users: 0 });
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  useEffect(() => {
    fetchSuggestions();
    fetchStats();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/suggestions/public');
      const suggestionsData = response.data.data?.data || response.data.data || response.data || [];
      // Ensure it's an array
      setSuggestions(Array.isArray(suggestionsData) ? suggestionsData : []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/suggestions/public/stats');
      setStats(response.data.data || { total: 0, users: 0 });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSuggestionClick = (suggestionId) => {
    if (isAuthenticated) {
      navigate(`/suggestion/${suggestionId}`);
    } else {
      // Store the intended destination
      sessionStorage.setItem('redirectAfterLogin', `/suggestion/${suggestionId}`);
      navigate('/login');
    }
  };

  return (
    <div className="home-page">
      <Header />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1><span>HAPPY TWEET</span> Feedback System</h1>
          <p>Help us shape the future of the next-gen social media platform. Share your valuable feedback, suggestions, and ideas to make HAPPY TWEET even better!</p>
          {!isAuthenticated && (
            <div className="hero-buttons">
              <Link to="/signup" className="btn btn-primary">
                Get Started <FiArrowRight />
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
            </div>
          )}
          {isAuthenticated && (
            <Link to="/dashboard" className="btn btn-primary">
              Go to Dashboard <FiArrowRight />
            </Link>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <div className="stat-icon-bg"></div>
            <FiBarChart2 size={32} className="stat-icon" />
          </div>
          <div className="stat-content">
            <p>Total Suggestions</p>
            <h3>{stats.total || 0}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <div className="stat-icon-bg success"></div>
            <FiCheckCircle size={32} className="stat-icon success" />
          </div>
          <div className="stat-content">
            <p>Resolved</p>
            <h3>{stats.resolved || 0}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <div className="stat-icon-bg users"></div>
            <FiUsers size={32} className="stat-icon users" />
          </div>
          <div className="stat-content">
            <p>Active Users</p>
            <h3>{stats.users || 0}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <div className="stat-icon-bg community"></div>
            <FiStar size={32} className="stat-icon community" />
          </div>
          <div className="stat-content">
            <p>Community Driven</p>
            <h3>100%</h3>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Your Voice Matters</h2>
        <p className="section-description">Help us build the best social media experience together</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Easy to Submit</h3>
            <p>Share your ideas for HAPPY TWEET features, improvements, and bug reports in just a few clicks</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Community Powered</h3>
            <p>Join thousands of HAPPY TWEET users helping shape the next-gen social media platform</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Track Your Impact</h3>
            <p>Monitor your suggestions from submission to implementation and see real changes</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>Your feedback and personal information are encrypted and protected</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Quick Response</h3>
            <p>Our team reviews and responds to suggestions quickly, keeping you in the loop</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Shape The Future</h3>
            <p>Your ideas directly influence HAPPY TWEET's design and feature roadmap</p>
          </div>
        </div>
      </section>

      {/* Suggestions Section */}
      <section className="suggestions-section">
        <h2>Community Feedback</h2>
        <p className="section-description">See what HAPPY TWEET users are suggesting to make the platform better</p>
        
        {loading ? (
          <div className="loading">Loading suggestions...</div>
        ) : suggestions.length === 0 ? (
          <div className="no-suggestions">
            <p>No suggestions yet. Be the first to share your idea!</p>
            {!isAuthenticated && (
              <Link to="/signup" className="btn btn-primary">
                Sign Up to Add Suggestion
              </Link>
            )}
          </div>
        ) : (
          <div className="suggestions-grid">
            {suggestions.slice(0, 6).map((suggestion) => (
              <div 
                key={suggestion.id} 
                className="suggestion-card clickable"
                onClick={() => handleSuggestionClick(suggestion.id)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && handleSuggestionClick(suggestion.id)}
              >
                <div className="suggestion-header">
                  <div className="suggestion-title-group">
                    <h3>{suggestion.title}</h3>
                    <div className="suggestion-meta-badges">
                      {suggestion.image_url && <span className="has-image-badge">📷 Image</span>}
                      <span className="category-badge-home">📁 {suggestion.category}</span>
                    </div>
                  </div>
                  <span className={`status-badge ${suggestion.status?.toLowerCase() || 'new'}`}>
                    {suggestion.status?.replace('_', ' ') || 'New'}
                  </span>
                </div>
                <p className="suggestion-description">
                  {suggestion.description?.length > 140 
                    ? `${suggestion.description.substring(0, 140)}...` 
                    : suggestion.description}
                </p>
                <div className="suggestion-footer">
                  <span className="author">
                    <FiUsers size={14} />
                    {suggestion.user_name || 'Anonymous'}
                  </span>
                  <span className="date">
                    <FiMessageSquare size={14} />
                    {new Date(suggestion.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="read-more-badge">
                  <FiEye size={16} />
                  <span>View Details</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isAuthenticated && suggestions.length > 0 && (
          <div className="suggestion-cta">
            <p>Want to add your own suggestion?</p>
            <Link to="/signup" className="btn btn-primary">
              Sign Up Now <FiArrowRight />
            </Link>
          </div>
        )}

        {isAuthenticated && (
          <div className="suggestion-cta">
            <Link to="/dashboard" className="btn btn-primary">
              Add Your Suggestion <FiArrowRight />
            </Link>
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h2>How It Works</h2>
        <p className="section-description">Simple steps to make your voice heard</p>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-icon">🎯</div>
            <h3>Sign Up</h3>
            <p>Create your free account to start sharing feedback for HAPPY TWEET</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-icon">💡</div>
            <h3>Submit Ideas</h3>
            <p>Share suggestions for features, improvements, or report bugs</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-icon">📊</div>
            <h3>Track Progress</h3>
            <p>Monitor your suggestions and see real-time status updates</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <div className="step-icon">🚀</div>
            <h3>See Results</h3>
            <p>Watch your ideas come to life in HAPPY TWEET updates</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-container">
          {[
            {
              id: 1,
              question: "What is HAPPY TWEET?",
              answer: "HAPPY TWEET is a next-generation social media platform. This feedback system helps us collect valuable suggestions and ideas from our users to continuously improve the platform."
            },
            {
              id: 2,
              question: "Is the feedback system free to use?",
              answer: "Yes! The HAPPY TWEET Feedback System is completely free for all HAPPY TWEET users. We're committed to making it easy for everyone to share their ideas."
            },
            {
              id: 3,
              question: "How secure is my feedback?",
              answer: "We take security seriously. All feedback data is encrypted and stored securely. We never share your personal information with third parties."
            },
            {
              id: 4,
              question: "Will my suggestions be implemented?",
              answer: "We review all suggestions carefully. Popular and feasible ideas that align with HAPPY TWEET's vision are prioritized for development and implementation."
            },
            {
              id: 5,
              question: "Is there a limit on suggestions I can submit?",
              answer: "No limits! Share as many suggestions as you want. We value all feedback from our HAPPY TWEET community to make the platform better!"
            }
          ].map((faq) => (
            <div key={faq.id} className="faq-item">
              <button 
                className="faq-question"
                onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
              >
                <span>{faq.question}</span>
                <span className="faq-icon">
                  {expandedFAQ === faq.id ? <FiChevronUp /> : <FiChevronDown />}
                </span>
              </button>
              {expandedFAQ === faq.id && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <h2>Your Feedback Drives Change</h2>
        <p className="section-description">See how your suggestions directly shape HAPPY TWEET's development</p>
        <div className="benefits-grid">
          <div className="benefit-item">
            <div className="benefit-icon">🎯</div>
            <h3>Direct Impact</h3>
            <p>Your feedback directly influences HAPPY TWEET's development roadmap</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">📈</div>
            <h3>Track Status</h3>
            <p>Monitor your suggestions from submission to implementation</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">🔔</div>
            <h3>Stay Updated</h3>
            <p>Get notified when your suggestions are reviewed and implemented</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">🤝</div>
            <h3>Community Powered</h3>
            <p>Help build HAPPY TWEET together with a passionate community</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">💡</div>
            <h3>Innovation Hub</h3>
            <p>Be part of the innovation process and see your ideas come to life</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">🏆</div>
            <h3>Recognition</h3>
            <p>Get recognized for valuable contributions that improve HAPPY TWEET</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {!isAuthenticated && (
        <section className="cta-section">
          <div className="cta-content">
            <h2>Ready to Shape HAPPY TWEET's Future?</h2>
            <p>Join thousands of users making HAPPY TWEET better with their feedback and ideas</p>
            <div className="cta-buttons">
              <Link to="/signup" className="btn btn-primary-large">
                Start Sharing Feedback <FiArrowRight />
              </Link>
              <Link to="/login" className="btn btn-secondary-large">
                Already have an account? Login
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}