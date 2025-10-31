import React from 'react';
import SuggestionCard from './SuggestionCard';
import './SuggestionBoard.css';

export default function SuggestionBoard({ suggestions, onUpdate }) {
  const groupByStatus = () => {
    const groups = {
      new: [],
      in_progress: [],
      resolved: []
    };

    suggestions.forEach(suggestion => {
      if (groups[suggestion.status]) {
        groups[suggestion.status].push(suggestion);
      }
    });

    return groups;
  };

  const grouped = groupByStatus();

  const statusConfig = {
    new: {
      label: '✨ New',
      color: 'new',
      icon: '📋'
    },
    in_progress: {
      label: '⚙️ In Progress',
      color: 'in_progress',
      icon: '🔧'
    },
    resolved: {
      label: '✓ Resolved',
      color: 'resolved',
      icon: '✅'
    }
  };

  return (
    <div className="suggestion-board">
      {Object.keys(grouped).map(status => (
        <div key={status} className={`board-column board-${status}`}>
          <div className="column-header">
            <h3>{statusConfig[status].label}</h3>
            <span className="column-count">{grouped[status].length}</span>
          </div>

          <div className="column-content">
            {grouped[status].length === 0 ? (
              <div className="column-empty">
                <p>{statusConfig[status].icon}</p>
                <p>No suggestions</p>
              </div>
            ) : (
              <div className="cards-container">
                {grouped[status].map(suggestion => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onUpdate={onUpdate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}