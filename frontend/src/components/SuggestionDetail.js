import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import Header from './Header';
import Footer from './Footer';
import { FiArrowLeft, FiCalendar, FiUser, FiTag, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import './SuggestionDetail.css';

export default function SuggestionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSuggestion();
  }, [id]);

  const fetchSuggestion = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view suggestion details');
        setLoading(false);
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`http://localhost:5000/api/suggestions/${id}`, config);
      
      setSuggestion(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching suggestion:', err);
      if (err.response?.status === 401) {
        setError('Please login to view this suggestion');
      } else if (err.response?.status === 404) {
        setError('Suggestion not found');
      } else {
        setError('Failed to load suggestion details');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'new': return '#3b82f6';
      case 'in_progress': return '#f59e0b';
      case 'resolved': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'new': return <FiAlertCircle />;
      case 'in_progress': return <FiClock />;
      case 'resolved': return <FiCheckCircle />;
      default: return <FiAlertCircle />;
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#dc2626'
    };
    return colors[priority?.toLowerCase()] || '#6b7280';
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="suggestion-detail-page">
          <div className="detail-container">
            <div className="loading-detail">
              <div className="spinner-large"></div>
              <p>Loading suggestion...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !suggestion) {
    return (
      <>
        <Header />
        <div className="suggestion-detail-page">
          <div className="detail-container">
            <div className="error-detail">
              <div className="error-icon">⚠️</div>
              <h2>{error || 'Suggestion not found'}</h2>
              <p>The suggestion you're looking for doesn't exist or you don't have permission to view it.</p>
              <div className="error-actions">
                {!isAuthenticated ? (
                  <Link to="/login" className="btn btn-primary">
                    Login to Continue
                  </Link>
                ) : (
                  <button onClick={() => navigate(-1)} className="btn btn-secondary">
                    <FiArrowLeft /> Go Back
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="suggestion-detail-page">
        <div className="detail-container">
          {/* Back Button */}
          <button onClick={() => navigate(-1)} className="back-button">
            <FiArrowLeft size={18} />
            <span>Back to List</span>
          </button>

          {/* Main Content */}
          <div className="detail-content-wrapper">
            {/* Left Column - Main Content */}
            <div className="detail-main-content">
              {/* Title Card */}
              <div className="detail-title-card">
                <div className="title-badges-row">
                  <span 
                    className={`status-badge-large status-${suggestion.status?.toLowerCase() || 'new'}`}
                  >
                    {getStatusIcon(suggestion.status)}
                    <span>{suggestion.status?.replace('_', ' ') || 'New'}</span>
                  </span>
                  <span className={`priority-badge-large priority-${suggestion.priority?.toLowerCase() || 'medium'}`}>
                    {suggestion.priority || 'Medium'}
                  </span>
                </div>
                <h1 className="detail-title">{suggestion.title}</h1>
                <div className="title-meta">
                  <span className="category-tag">
                    <FiTag size={14} />
                    {suggestion.category}
                  </span>
                  <span className="date-meta">
                    <FiCalendar size={14} />
                    {new Date(suggestion.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Image Section */}
              {suggestion.image_url && (
                <div className="detail-image-card">
                  <div className="image-container">
                    <img 
                      src={
                        suggestion.image_url.startsWith('http') 
                          ? suggestion.image_url 
                          : suggestion.image_url.startsWith('/uploads/')
                            ? `http://localhost:5000${suggestion.image_url}`
                            : `http://localhost:5000/uploads/${suggestion.image_url}`
                      }
                      alt={suggestion.title}
                      className="detail-image"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        console.error('Image load error:', suggestion.image_url);
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="image-failed"><span>📷</span><p>Image could not be loaded</p><small>' + suggestion.image_url + '</small></div>';
                      }}
                      onLoad={(e) => {
                        console.log('Image loaded successfully:', suggestion.image_url);
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Description Card */}
              <div className="detail-description-card">
                <div className="section-header">
                  <h2>📝 Description</h2>
                </div>
                <div className="description-content">
                  {suggestion.description}
                </div>
              </div>

              {/* Timeline (if applicable) */}
              {(suggestion.updated_at !== suggestion.created_at || suggestion.resolved_at) && (
                <div className="detail-timeline-card">
                  <div className="section-header">
                    <h2>📅 Timeline</h2>
                  </div>
                  <div className="timeline">
                    <div className="timeline-item">
                      <div className="timeline-dot timeline-dot-blue"></div>
                      <div className="timeline-content">
                        <div className="timeline-title">Created</div>
                        <div className="timeline-date">
                          {new Date(suggestion.created_at).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    {suggestion.updated_at && suggestion.updated_at !== suggestion.created_at && (
                      <div className="timeline-item">
                        <div className="timeline-dot timeline-dot-yellow"></div>
                        <div className="timeline-content">
                          <div className="timeline-title">Last Updated</div>
                          <div className="timeline-date">
                            {new Date(suggestion.updated_at).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                    {suggestion.resolved_at && (
                      <div className="timeline-item">
                        <div className="timeline-dot timeline-dot-green"></div>
                        <div className="timeline-content">
                          <div className="timeline-title">Resolved</div>
                          <div className="timeline-date">
                            {new Date(suggestion.resolved_at).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="detail-sidebar">
              {/* Author Card */}
              <div className="sidebar-card author-card">
                <div className="card-header">
                  <h3>👤 Submitted By</h3>
                </div>
                <div className="author-info">
                  <div className="author-avatar">
                    {(suggestion.full_name || suggestion.username)?.charAt(0).toUpperCase()}
                  </div>
                  <div className="author-details">
                    <div className="author-name">{suggestion.full_name || suggestion.username}</div>
                    <div className="author-label">Author</div>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="sidebar-card stats-card">
                <div className="card-header">
                  <h3>📊 Details</h3>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Status</span>
                  <span className={`stat-value status-${suggestion.status?.toLowerCase() || 'new'}`}>
                    {suggestion.status?.replace('_', ' ') || 'New'}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Priority</span>
                  <span className={`stat-value priority-${suggestion.priority?.toLowerCase() || 'medium'}`}>
                    {suggestion.priority || 'Medium'}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Category</span>
                  <span className="stat-value">{suggestion.category}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Created</span>
                  <span className="stat-value">
                    {new Date(suggestion.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Actions Card */}
              {user && suggestion.user_id === user.id && (
                <div className="sidebar-card actions-card">
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="btn-manage"
                  >
                    <FiUser size={18} />
                    Manage in Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

