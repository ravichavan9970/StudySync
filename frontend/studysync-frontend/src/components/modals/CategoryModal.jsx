import React, { useState } from 'react';
import { Modal } from '../common/UIElements';

const iconOptions = ['📝', '🧪', '⚡', '🎯', '📖', '💡', '📊', '🏆', '💻', '🔬', '🎨', '🚀'];

const colorPresets = [
  { label: 'Violet Indigo', hex: '#6366f1' },
  { label: 'Emerald Teal', hex: '#10b981' },
  { label: 'Sunset Rose', hex: '#f43f5e' },
  { label: 'Amber Gold', hex: '#f59e0b' },
  { label: 'Cyan Wave', hex: '#0891b2' },
  { label: 'Purple Plum', hex: '#8b5cf6' },
];

export default function CategoryModal({ category = {}, onClose, onSave }) {
  const [name, setName] = useState(category.name || '');
  const [icon, setIcon] = useState(category.icon || '📝');
  const [color, setColor] = useState(category.color || '#6366f1');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: category.id,
      name: name.trim(),
      icon,
      color,
    });
  };

  return (
    <Modal title={category.id ? 'Edit Category' : 'Add New Category'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="field-group">
          <label>Category / Tag Name *</label>
          <input
            type="text"
            className="text-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Homework, Lab Report, Exam Prep, Revision"
          />
        </div>

        <div className="field-group" style={{ marginTop: '14px' }}>
          <label>Category Badge Icon</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {iconOptions.map((item) => (
              <button
                key={item}
                type="button"
                className={`avatar-badge-btn ${icon === item ? 'active' : ''}`}
                onClick={() => setIcon(item)}
                style={{ width: '38px', height: '38px', fontSize: '18px' }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="field-group" style={{ marginTop: '14px' }}>
          <label>Category Color Accent</label>
          <div className="theme-swatch-grid">
            {colorPresets.map((preset) => (
              <button
                key={preset.hex}
                type="button"
                className={`theme-swatch-btn ${color === preset.hex ? 'active' : ''}`}
                onClick={() => setColor(preset.hex)}
              >
                <span className="swatch-color-dot" style={{ background: preset.hex }} />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary full-width modal-submit" style={{ marginTop: '20px' }} type="submit">
          {category.id ? 'Save Category Changes ✨' : 'Create Category ✨'}
        </button>
      </form>
    </Modal>
  );
}
