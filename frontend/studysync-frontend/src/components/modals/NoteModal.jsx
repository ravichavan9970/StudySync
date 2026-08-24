import React, { useState } from 'react';
import { Modal } from '../common/UIElements';

export default function NoteModal({ note = {}, subjects = [], categories = [], onClose, onSave, onAddSubject, onAddCategory }) {
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [pinned, setPinned] = useState(Boolean(note.pinned));
  const [subjectId, setSubjectId] = useState(note.subjectId || '');
  const [categoryId, setCategoryId] = useState(note.categoryId || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      note: {
        id: note.id,
        title: title.trim(),
        content: content ? content.trim() : '',
        pinned,
      },
      subjectId: subjectId || null,
      categoryId: categoryId || null,
    });
  };

  return (
    <Modal title={note.id ? 'Edit Note' : 'New Note'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="field-group">
          <label>Note Title *</label>
          <input
            type="text"
            className="text-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Thermodynamics Formula Sheet & Summary"
          />
        </div>

        <div className="field-group">
          <label>Content</label>
          <textarea
            className="textarea-input"
            style={{ minHeight: '140px', fontFamily: 'inherit' }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type or paste your study notes, formulas, or markdown here..."
          />
        </div>

        <div className="two-col-fields">
          <div className="field-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ margin: 0 }}>Subject / Course</label>
              <button
                type="button"
                className="btn-link"
                style={{ fontSize: '12px', padding: '0 4px', fontWeight: '700' }}
                onClick={onAddSubject}
              >
                + Add Subject
              </button>
            </div>
            <select className="select-input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">Select subject / course...</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} {sub.code ? `(${sub.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ margin: 0 }}>Category / Tag</label>
              <button
                type="button"
                className="btn-link"
                style={{ fontSize: '12px', padding: '0 4px', fontWeight: '700' }}
                onClick={onAddCategory}
              >
                + Add Category
              </button>
            </div>
            <select className="select-input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Select category / tag...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon || '🏷️'} {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="checkbox-field" style={{ marginBottom: '20px' }}>
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
          />
          <span>📌 Pin this note to the top of your folder</span>
        </label>

        <button className="btn-primary full-width modal-submit" type="submit">
          {note.id ? 'Save Note Changes' : 'Save Note'}
        </button>
      </form>
    </Modal>
  );
}
