import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import Header from './Header';
import Footer from './Footer';
import { FiTrash2, FiEdit2, FiUsers, FiCheck, FiX, FiDownload, FiPlus, FiSave, FiFileText, FiClock, FiCheckCircle, FiTrendingUp, FiEye } from 'react-icons/fi';
import axios from 'axios';
import '../styles/admin.css';

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [editingUser, setEditingUser] = useState(null);
  const [editingRole, setEditingRole] = useState('');
  const [editingSuggestion, setEditingSuggestion] = useState(null);
  const [editingStatus, setEditingStatus] = useState('');
  const [addingUser, setAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'user'
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSuggestions: 0,
    newSuggestions: 0,
    inProgressSuggestions: 0,
    resolvedSuggestions: 0
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch all data without pagination limits for admin
      const [usersRes, suggestionsRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/users?limit=1000', config),
        axios.get('http://localhost:5000/api/admin/suggestions?limit=1000', config),
        axios.get('http://localhost:5000/api/admin/stats', config)
      ]);

      const userData = usersRes.data.data?.data || usersRes.data.data || [];
      const suggestionData = suggestionsRes.data.data?.data || suggestionsRes.data.data || [];
      const statsData = statsRes.data.data || {};

      setUsers(userData);
      setSuggestions(suggestionData);
      setStats(statsData);
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load admin data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/auth/register',
        newUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('User added successfully!');
      setAddingUser(false);
      setNewUser({
        username: '',
        email: '',
        password: '',
        fullName: '',
        role: 'user'
      });
      await fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding user');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/admin/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('User deleted successfully!');
      await fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting user');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUpdateUserRole = async (userId) => {
    if (!editingRole) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/users/${userId}`,
        { role: editingRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingUser(null);
      setEditingRole('');
      setSuccess('User role updated successfully!');
      await fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating user role');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUpdateSuggestionStatus = async (suggestionId) => {
    if (!editingStatus) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/suggestions/${suggestionId}`,
        { status: editingStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingSuggestion(null);
      setEditingStatus('');
      setSuccess('Suggestion status updated successfully!');
      await fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating suggestion');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteSuggestion = async (suggestionId) => {
    if (!window.confirm('Are you sure you want to delete this suggestion?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/admin/suggestions/${suggestionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Suggestion deleted successfully!');
      await fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting suggestion');
      setTimeout(() => setError(''), 3000);
    }
  };

  const exportData = () => {
    const dataToExport = {
      stats,
      users,
      suggestions,
      exportedAt: new Date().toISOString()
    };
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(dataToExport, null, 2))
    );
    element.setAttribute('download', `happy-tweet-data-${Date.now()}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="admin-panel">
      <Header />

      <main className="admin-content">
        <div className="admin-container">
          {/* Admin Header */}
          <section className="admin-header">
            <div>
              <h1>Admin Panel</h1>
              <p>Manage users, suggestions, and system settings</p>
            </div>
            <button className="btn btn-primary" onClick={exportData}>
              <FiDownload size={18} />
              Export Data
            </button>
          </section>

          {error && (
            <div className="alert alert-error">
              <FiX size={20} />
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <FiCheck size={20} />
              {success}
            </div>
          )}

          {/* Stats Dashboard */}
          <section className="admin-stats">
            <div className="stat-card">
              <div className="stat-box-header">
                <div className="stat-icon users">
                  <FiUsers size={30} />
                </div>
                <div className="stat-icon-bg"></div>
              </div>
              <div className="stat-info">
                <p className="stat-label">Total Users</p>
                <h3 className="stat-number">{stats.totalUsers || 0}</h3>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-box-header">
                <div className="stat-icon suggestions">
                  <FiFileText size={30} />
                </div>
                <div className="stat-icon-bg"></div>
              </div>
              <div className="stat-info">
                <p className="stat-label">Total Suggestions</p>
                <h3 className="stat-number">{stats.totalSuggestions || 0}</h3>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-box-header">
                <div className="stat-icon new">
                  <FiTrendingUp size={30} />
                </div>
                <div className="stat-icon-bg"></div>
              </div>
              <div className="stat-info">
                <p className="stat-label">New</p>
                <h3 className="stat-number text-new">{stats.newSuggestions || 0}</h3>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-box-header">
                <div className="stat-icon in_progress">
                  <FiClock size={30} />
                </div>
                <div className="stat-icon-bg"></div>
              </div>
              <div className="stat-info">
                <p className="stat-label">In Progress</p>
                <h3 className="stat-number text-in_progress">{stats.inProgressSuggestions || 0}</h3>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-box-header">
                <div className="stat-icon resolved">
                  <FiCheckCircle size={30} />
                </div>
                <div className="stat-icon-bg"></div>
              </div>
              <div className="stat-info">
                <p className="stat-label">Resolved</p>
                <h3 className="stat-number text-resolved">{stats.resolvedSuggestions || 0}</h3>
              </div>
            </div>
          </section>

          {/* Tabs */}
          <section className="admin-tabs">
            <button
              className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <FiUsers size={18} />
              Users Management
            </button>
            <button
              className={`tab-button ${activeTab === 'suggestions' ? 'active' : ''}`}
              onClick={() => setActiveTab('suggestions')}
            >
              <FiFileText size={18} />
              Suggestions
            </button>
          </section>

          {/* Users Tab */}
          {activeTab === 'users' && (
            <section className="admin-section">
              <div className="section-header-admin">
                <h2>Users ({users.length})</h2>
                <button className="btn btn-primary" onClick={() => setAddingUser(true)}>
                  <FiPlus size={18} />
                  Add User
                </button>
              </div>

              {addingUser && (
                <div className="add-user-form">
                  <h3>Add New User</h3>
                  <form onSubmit={handleAddUser}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Username *</label>
                        <input
                          type="text"
                          value={newUser.username}
                          onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input
                          type="text"
                          value={newUser.fullName}
                          onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Password *</label>
                        <input
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                          required
                          minLength={6}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Role</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="form-buttons">
                      <button type="submit" className="btn btn-primary">
                        <FiCheck size={18} />
                        Add User
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => setAddingUser(false)}>
                        <FiX size={18} />
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {loading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="empty-state">
                  <FiUsers size={64} />
                  <h3>No users found</h3>
                  <p>Add your first user to get started</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td className="username-cell">
                            <strong>{u.username}</strong>
                          </td>
                          <td>{u.full_name || u.fullName || '-'}</td>
                          <td>{u.email}</td>
                          <td>
                            {editingUser === u.id ? (
                              <select
                                value={editingRole}
                                onChange={(e) => setEditingRole(e.target.value)}
                                className="role-select"
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            ) : (
                              <span className={`role-badge ${u.role?.toLowerCase()}`}>
                                {u.role?.toUpperCase()}
                              </span>
                            )}
                          </td>
                          <td>{new Date(u.created_at).toLocaleDateString()}</td>
                          <td>
                            <div className="action-buttons">
                              {editingUser === u.id ? (
                                <>
                                  <button
                                    className="action-btn save"
                                    onClick={() => handleUpdateUserRole(u.id)}
                                  >
                                    <FiSave size={16} />
                                  </button>
                                  <button
                                    className="action-btn cancel"
                                    onClick={() => {
                                      setEditingUser(null);
                                      setEditingRole('');
                                    }}
                                  >
                                    <FiX size={16} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="action-btn edit"
                                    onClick={() => {
                                      setEditingUser(u.id);
                                      setEditingRole(u.role);
                                    }}
                                  >
                                    <FiEdit2 size={16} />
                                  </button>
                                  <button
                                    className="action-btn delete"
                                    onClick={() => handleDeleteUser(u.id, u.username)}
                                  >
                                    <FiTrash2 size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* Suggestions Tab */}
          {activeTab === 'suggestions' && (
            <section className="admin-section">
              <h2>Suggestions ({suggestions.length})</h2>

              {loading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>Loading suggestions...</p>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="empty-state">
                  <FiFileText size={64} />
                  <h3>No suggestions found</h3>
                  <p>Suggestions will appear here once users submit them</p>
                </div>
              ) : (
                <div className="suggestions-admin-grid">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="suggestion-admin-card">
                      <div className="suggestion-admin-header">
                        <div className="admin-title-section">
                          <h3>{suggestion.title}</h3>
                          <div className="admin-meta-badges">
                            <span className="category-badge-admin">
                              <FiFileText size={14} /> {suggestion.category}
                            </span>
                            {suggestion.image_url && (
                              <span className="attachment-badge-admin">
                                📷 Has Image
                              </span>
                            )}
                          </div>
                        </div>
                        {editingSuggestion === suggestion.id ? (
                          <select
                            value={editingStatus}
                            onChange={(e) => setEditingStatus(e.target.value)}
                            className="status-select"
                          >
                            <option value="new">New</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        ) : (
                          <span className={`status-badge ${suggestion.status?.toLowerCase()}`}>
                            {suggestion.status?.replace('_', ' ')}
                          </span>
                        )}
                      </div>

                      <div className="suggestion-author">
                        <FiUsers size={14} />
                        <strong>Submitted by:</strong> {suggestion.user_name || suggestion.username}
                        <span className="author-email">({suggestion.email})</span>
                      </div>

                      <p className="suggestion-description">
                        {suggestion.description?.length > 200 
                          ? `${suggestion.description.substring(0, 200)}...` 
                          : suggestion.description}
                      </p>
                      
                      {suggestion.description?.length > 200 && (
                        <button 
                          className="view-details-btn-admin"
                          onClick={() => navigate(`/suggestion/${suggestion.id}`)}
                        >
                          <FiEye size={16} />
                          Read Complete Suggestion
                        </button>
                      )}

                      <div className="suggestion-date">
                        <FiClock size={14} />
                        {new Date(suggestion.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>

                      <div className="suggestion-actions">
                        {editingSuggestion === suggestion.id ? (
                          <>
                            <button
                              className="action-btn save"
                              onClick={() => handleUpdateSuggestionStatus(suggestion.id)}
                            >
                              <FiSave size={18} />
                              Save
                            </button>
                            <button
                              className="action-btn cancel"
                              onClick={() => {
                                setEditingSuggestion(null);
                                setEditingStatus('');
                              }}
                            >
                              <FiX size={18} />
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="action-btn view"
                              onClick={() => navigate(`/suggestion/${suggestion.id}`)}
                              title="View Full Details"
                            >
                              <FiEye size={18} />
                              View
                            </button>
                            <button
                              className="action-btn edit"
                              onClick={() => {
                                setEditingSuggestion(suggestion.id);
                                setEditingStatus(suggestion.status);
                              }}
                            >
                              <FiEdit2 size={18} />
                              Status
                            </button>
                            <button
                              className="action-btn delete"
                              onClick={() => handleDeleteSuggestion(suggestion.id)}
                            >
                              <FiTrash2 size={18} />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
