import React, { useState } from 'react';
import { suggestionsAPI, adminAPI } from '../services/api';
import { useAuth } from '../utils/AuthContext';
import { FiChevronDown, FiChevronUp, FiMessageCircle, FiTrash2 } from 'react-icons/fi';
import './SuggestionCard.css';

export default function SuggestionCard({ suggestion, onUpdate }) {
  const { user, isAdmin } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(false);

  const categoryIcons = {
    bug: '🐛',
    feature: '✨',
    improvement: '📈',
    other: '📝'
  };

  const priorityColors = {
    low: 'priority-low',
    medium: 'priority-medium',
    high: 'priority-high',
    critical: 'priority-critical'
  };

  const statusColors = {
    new: 'status-new',
    in_progress: 'status-in_progress',
    resolved: 'status-resolved'
  };

  const handleExpand = async () => {
    setExpanded(!expanded);
    if (!expanded && isAdmin && notes.length === 0) {
      loadNotes();
    }
  };

  const loadNotes = async () => {
    try {
      setLoadingNotes(true);
      const response = await adminAPI.getDeveloperNotes(suggestion.id);
      setNotes(response.data.data);
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      await adminAPI.addDeveloperNote(suggestion.id, { note: newNote });
      setNewNote('');
      loadNotes();
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await adminAPI.deleteDeveloperNote(noteId);
      loadNotes();
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await suggestionsAPI.updateSuggestionStatus(suggestion.id, { status: newStatus });
      onUpdate();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getNextStatus = () => {
    const statuses = ['new', 'in_progress', 'resolved'];
    const currentIndex = statuses.indexOf(suggestion.status);
    return statuses[currentIndex + 1] || null;
  };

  return (
    <div className={`suggestion-card ${statusColors[suggestion.status]}`}>
      <div className="card-header" onClick={handleExpand}>
        <div className="card-title">
          <span className="category-icon">{categoryIcons[suggestion.category]}</span>
          <h4>{suggestion.title}</h4>
        </div>
        <button className="expand-btn">
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </button>
      </div>

      <div className="card-meta">
        <span className={`badge ${priorityColors[suggestion.priority]}`}>
          {suggestion.priority.charAt(0).toUpperCase() + suggestion.priority.slice(1)}
        </span>
        <span className="text-small text-muted">{formatDate(suggestion.created_at)}</span>
      </div>

      {expanded && (
        <div className="card-expanded">
          <p className="description">{suggestion.description}</p>

          <div className="card-user">
            <span className="label">By:</span>
            <span className="value">{suggestion.full_name || suggestion.username}</span>
          </div>

          {isAdmin && (
            <div className="admin-section">
              <div className="status-actions">
                <label>Status:</label>
                <select
                  value={suggestion.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="status-select"
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className="notes-section">
                <h5>
                  <FiMessageCircle /> Developer Notes ({notes.length})
                </h5>

                {loadingNotes ? (
                  <div className="notes-loading">Loading notes...</div>
                ) : (
                  <>
                    <div className="notes-list">
                      {notes.map(note => (
                        <div key={note.id} className="note-item">
                          <div className="note-header">
                            <span className="note-author">{note.full_name}</span>
                            <span className="note-date">{formatDate(note.created_at)}</span>
                          </div>
                          <p className="note-text">{note.note}</p>
                          {(user?.userId === note.admin_id || isAdmin) && (
                            <button
                              className="note-delete"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <FiTrash2 />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="note-input">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a developer note..."
                        rows="2"
                      />
                      <button
                        onClick={handleAddNote}
                        className="btn btn-small btn-primary"
                        disabled={!newNote.trim()}
                      >
                        Add Note
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}