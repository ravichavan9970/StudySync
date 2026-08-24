import React from 'react';

const filterTabs = [
  ['ALL', 'All Tasks'],
  ['TODAY', 'Due Today'],
  ['UPCOMING', 'Upcoming'],
  ['COMPLETED', 'Completed']
];

export default function TaskToolbar({ filter, setFilter, search, setSearch }) {
  return (
    <div className="toolbar-bar">
      <div className="filter-group">
        {filterTabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`filter-tab ${filter === id ? 'active' : ''}`}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="search-box">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter tasks by title or category..."
        />
      </div>
    </div>
  );
}
