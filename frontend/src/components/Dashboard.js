import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import Header from './Header';
import Footer from './Footer';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiSave, FiBarChart2, FiTrendingUp, FiCheckCircle, FiClock, FiAlertCircle, FiEye } from 'react-icons/fi';
import axios from 'axios';
import './Dashboard.css';

export default function Dashboard() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'feature',
    priority: 'medium'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    in_progress: 0,
    resolved: 0
  });

  useEffect(() => {
    // Refresh user data to get latest role
    if (refreshUser) {
      refreshUser();
    }
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        setSuggestions([]);
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5000/api/suggestions', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000 // 10 second timeout
      });
      
      const allSuggestions = response.data.data?.data || response.data.data || [];
      setSuggestions(Array.isArray(allSuggestions) ? allSuggestions : []);
      
      // Calculate stats from the suggestions
      const statsCalc = {
        total: allSuggestions.length,
        new: allSuggestions.filter(s => s.status === 'new').length,
        in_progress: allSuggestions.filter(s => s.status === 'in_progress').length,
        resolved: allSuggestions.filter(s => s.status === 'resolved').length
      };
      setStats(statsCalc);
      
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setSuggestions([]); // Set empty array on error
      
      // Show appropriate error message
      if (err.code === 'ECONNABORTED') {
        setError('Request timeout. Please check if backend is running.');
      } else if (err.message === 'Network Error') {
        setError('Cannot connect to server. Please ensure backend is running on port 5000.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. Please check your permissions.');
      } else {
        // Don't show error for other cases, just use empty state
        console.log('Using empty state');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('priority', formData.priority || 'medium');
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        } 
      };

      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/suggestions/${editingId}`,
          submitData,
          config
        );
        setSuccessMessage('Suggestion updated successfully!');
      } else {
        await axios.post(
          'http://localhost:5000/api/suggestions',
          submitData,
          config
        );
        setSuccessMessage('Suggestion created successfully!');
      }

      setFormData({ title: '', description: '', category: 'feature', priority: 'medium' });
      setImageFile(null);
      setImagePreview(null);
      setEditingId(null);
      setShowForm(false);
      setError('');
      
      setTimeout(() => setSuccessMessage(''), 3000);
      
      await fetchSuggestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving suggestion');
    }
  };

  const handleEdit = (suggestion) => {
    setFormData({
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category
    });
    // Set image preview if exists
    if (suggestion.image_url) {
      setImagePreview(`http://localhost:5000${suggestion.image_url}`);
    } else {
      setImagePreview(null);
    }
    setImageFile(null);
    setEditingId(suggestion.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this suggestion?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/suggestions/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage('Suggestion deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchSuggestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting suggestion');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', description: '', category: 'feature' });
    setImageFile(null);
    setImagePreview(null);
  };

  const getFilteredSuggestions = (status) => {
    if (status === 'all') return suggestions;
    return suggestions.filter(s => s.status === status);
  };

  const newSuggestions = getFilteredSuggestions('new');
  const inProgressSuggestions = getFilteredSuggestions('in_progress');
  const resolvedSuggestions = getFilteredSuggestions('resolved');

  const SuggestionItem = ({ suggestion }) => (
    <div className="suggestion-item">
      <div className="suggestion-content">
        <div className="suggestion-header-row">
          <div className="suggestion-title-section">
            <h4>{suggestion.title}</h4>
            <div className="suggestion-badges">
              <span className="category-badge">📁 {suggestion.category}</span>
              <span className="priority-badge priority-{suggestion.priority || 'medium'}">
                {suggestion.priority || 'medium'}
              </span>
              {suggestion.image_url && <span className="has-attachment-badge">📷 Image</span>}
            </div>
          </div>
          <span className={`status-badge ${suggestion.status || 'new'}`}>
            {suggestion.status ? suggestion.status.replace('_', ' ') : 'new'}
          </span>
        </div>
        <p className="suggestion-description">
          {suggestion.description?.length > 220 
            ? `${suggestion.description.substring(0, 220)}...` 
            : suggestion.description}
        </p>
        {suggestion.description?.length > 220 && (
          <button 
            className="view-details-btn"
            onClick={() => navigate(`/suggestion/${suggestion.id}`)}
          >
            <FiEye size={16} />
            Read Full Content
          </button>
        )}
        <div className="suggestion-meta">
          <span className="meta-item">
            <FiClock size={14} />
            {new Date(suggestion.created_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </span>
        </div>
      </div>
      <div className="suggestion-actions">
        <button 
          className="action-btn view"
          onClick={() => navigate(`/suggestion/${suggestion.id}`)}
          title="View Details"
        >
          <FiEye size={16} />
        </button>
        <button 
          className="action-btn edit"
          onClick={() => handleEdit(suggestion)}
          title="Edit"
        >
          <FiEdit2 size={16} />
        </button>
        <button 
          className="action-btn delete"
          onClick={() => handleDelete(suggestion.id)}
          title="Delete"
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      <Header />

      <main className="dashboard-content">
        <div className="dashboard-container">
          {/* Welcome Section */}
          <section className="welcome-section">
            <div className="welcome-text">
              <h1>Welcome back, {user?.fullName || user?.username}! 👋</h1>
              <p>Keep track of your suggestions and monitor their progress</p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setShowForm(!showForm);
                setEditingId(null);
                setFormData({ title: '', description: '', category: 'feature', priority: 'medium' });
                setImageFile(null);
                setImagePreview(null);
              }}
            >
              <FiPlus size={18} />
              {showForm ? 'Cancel' : 'Add New Suggestion'}
            </button>
          </section>

          {successMessage && <div className="success-message">{successMessage}</div>}
          {error && <div className="error-message">{error}</div>}

          {/* Stats Section */}
          <section className="stats-section">
            <div className="stat-box">
              <div className="stat-box-header">
                <FiBarChart2 className="stat-icon" />
                <span className="stat-icon-bg"></span>
              </div>
              <div className="stat-info">
                <p className="stat-label">Total Suggestions</p>
                <h3>{stats.total}</h3>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-box-header">
                <FiTrendingUp className="stat-icon approved" />
                <span className="stat-icon-bg"></span>
              </div>
              <div className="stat-info">
                <p className="stat-label">New</p>
                <h3 className="text-approved">{stats.new}</h3>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-box-header">
                <FiClock className="stat-icon pending" />
                <span className="stat-icon-bg"></span>
              </div>
              <div className="stat-info">
                <p className="stat-label">In Progress</p>
                <h3 className="text-pending">{stats.in_progress}</h3>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-box-header">
                <FiCheckCircle className="stat-icon resolved" />
                <span className="stat-icon-bg"></span>
              </div>
              <div className="stat-info">
                <p className="stat-label">Resolved</p>
                <h3 className="text-resolved">{stats.resolved}</h3>
              </div>
            </div>
          </section>

          {/* Form Section */}
          {showForm && (
            <form className="suggestion-form" onSubmit={handleSubmit}>
              <div className="form-header">
                <h2>{editingId ? 'Edit Your Suggestion' : 'Create a New Suggestion'}</h2>
                <p>Share your ideas to help us improve</p>
              </div>

              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter a clear and concise title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="feature">Feature Request</option>
                  <option value="bug">Bug Report</option>
                  <option value="improvement">Improvement</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide detailed information about your suggestion..."
                  rows="6"
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="image">📸 Image (Optional)</label>
                <div className="image-upload-container">
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                  />
                  <label htmlFor="image" className="file-input-label">
                    <span className="upload-icon">📁</span>
                    <span className="upload-text">
                      {imageFile ? imageFile.name : 'Click to upload or drag & drop'}
                    </span>
                    <span className="upload-hint">Max 5MB • JPG, PNG, GIF, WEBP</span>
                  </label>
                </div>
                {imagePreview && (
                  <div className="image-preview-container">
                    <div className="preview-label">
                      <span>Preview:</span>
                      <button 
                        type="button" 
                        className="remove-image-btn"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                          document.getElementById('image').value = '';
                        }}
                      >
                        ✕ Remove
                      </button>
                    </div>
                    <div className="image-preview-wrapper">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="preview-image"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="form-buttons">
                <button type="submit" className="btn btn-primary">
                  <FiSave size={18} />
                  {editingId ? 'Update Suggestion' : 'Submit Suggestion'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  <FiX size={18} />
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Tabs Section */}
          <section className="suggestions-section">
            <div className="section-header">
              <h2>Your Suggestions</h2>
              <div className="tab-container">
                <button 
                  className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  All ({suggestions.length})
                </button>
                <button 
                  className={`tab-button ${activeTab === 'new' ? 'active' : ''}`}
                  onClick={() => setActiveTab('new')}
                >
                  <FiTrendingUp size={16} />
                  New ({newSuggestions.length})
                </button>
                <button 
                  className={`tab-button ${activeTab === 'in_progress' ? 'active' : ''}`}
                  onClick={() => setActiveTab('in_progress')}
                >
                  <FiClock size={16} />
                  In Progress ({inProgressSuggestions.length})
                </button>
                <button 
                  className={`tab-button ${activeTab === 'resolved' ? 'active' : ''}`}
                  onClick={() => setActiveTab('resolved')}
                >
                  <FiCheckCircle size={16} />
                  Resolved ({resolvedSuggestions.length})
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading your suggestions...</p>
                <small style={{color: '#64748b', marginTop: '0.5rem'}}>
                  If this takes too long, check if backend is running
                </small>
              </div>
            ) : error ? (
              <div className="error-state">
                <div className="error-icon">⚠️</div>
                <h3>Unable to Load Suggestions</h3>
                <p>{error}</p>
                <button 
                  className="btn btn-primary"
                  onClick={fetchSuggestions}
                >
                  Try Again
                </button>
              </div>
            ) : getFilteredSuggestions(activeTab).length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  {activeTab === 'new' && '🆕'}
                  {activeTab === 'in_progress' && '⏳'}
                  {activeTab === 'resolved' && '✅'}
                  {activeTab === 'all' && '💡'}
                </div>
                <h3>
                  {activeTab === 'all' && 'No suggestions yet'}
                  {activeTab === 'new' && 'No new suggestions'}
                  {activeTab === 'in_progress' && 'No suggestions in progress'}
                  {activeTab === 'resolved' && 'No resolved suggestions'}
                </h3>
                <p>
                  {activeTab === 'all' ? 'Start by adding your first suggestion!' : 'Nothing to show here'}
                </p>
                {activeTab === 'all' && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowForm(true)}
                  >
                    <FiPlus size={18} />
                    Add Suggestion
                  </button>
                )}
              </div>
            ) : (
              <div className="suggestions-list">
                {getFilteredSuggestions(activeTab).map((suggestion) => (
                  <SuggestionItem key={suggestion.id} suggestion={suggestion} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}