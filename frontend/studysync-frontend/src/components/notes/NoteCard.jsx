import React from 'react';

export default function NoteCard({ note, onPin, onArchive, onEdit, onDelete }) {
  const formattedDate = new Date(note.updatedAt || Date.now()).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <article className={`note-card ${note.pinned ? 'pinned' : ''}`}>
      <div className="note-card-header">
        <span className="note-category-tag">
          {note.archived ? 'ARCHIVED · ' : ''}
          {note.categoryName || 'GENERAL'}
        </span>
        <div className="note-action-btns">
          <button
            type="button"
            title={note.pinned ? 'Unpin' : 'Pin to top'}
            className={`action-icon-btn ${note.pinned ? 'active-pin' : ''}`}
            onClick={() => onPin(note)}
          >
            📌
          </button>
          <button
            type="button"
            title={note.archived ? 'Restore note' : 'Archive note'}
            className="action-icon-btn"
            onClick={() => onArchive(note)}
          >
            📦
          </button>
          <button
            type="button"
            title="Edit Note"
            className="action-icon-btn"
            onClick={() => onEdit(note)}
          >
            ✏️
          </button>
          <button
            type="button"
            title="Delete Note"
            className="action-icon-btn danger"
            onClick={() => onDelete(note)}
          >
            🗑️
          </button>
        </div>
      </div>

      <h3 className="note-title">{note.title}</h3>
      <p className="note-body">{note.content || 'No content provided.'}</p>
      <span className="note-footer-date">Updated {formattedDate}</span>
    </article>
  );
}
