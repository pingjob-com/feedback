import React, { useState } from 'react';
import { suggestionsAPI } from '../services/api';
import { FiAlertCircle, FiCheck } from 'react-icons/fi';
import './SuggestionForm.css';

export default function SuggestionForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'feature',
    priority: 'medium'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required');
      return;
    }

    setLoading(true);

    try {
      await suggestionsAPI.create(formData);
      setSuccess('Suggestion created successfully!');
      setFormData({
        title: '',
        description: '',
        category: 'feature',
        priority: 'medium'
      });
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create suggestion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="suggestion-form">
      <h3>Submit New Suggestion</h3>

      {error && (
        <div className="alert alert-error">
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <FiCheck />
          <span>{success}</span>
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Brief title for your suggestion"
            required
            disabled={loading}
            maxLength="255"
          />
          <span className="char-count">{formData.title.length}/255</span>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed description of your suggestion"
            required
            disabled={loading}
            rows="5"
          />
          <span className="char-count">{formData.description.length}/5000</span>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="bug">🐛 Bug</option>
            <option value="feature">✨ Feature</option>
            <option value="improvement">📈 Improvement</option>
            <option value="other">📝 Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Suggestion'}
        </button>
      </div>
    </form>
  );
}