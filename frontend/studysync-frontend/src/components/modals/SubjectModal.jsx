import React, { useState } from 'react';
import { Modal } from '../common/UIElements';

const colorPresets = [
  { label: 'Violet Indigo', hex: '#6366f1' },
  { label: 'Emerald Teal', hex: '#10b981' },
  { label: 'Sunset Rose', hex: '#f43f5e' },
  { label: 'Amber Gold', hex: '#f59e0b' },
  { label: 'Cyan Wave', hex: '#0891b2' },
  { label: 'Purple Plum', hex: '#8b5cf6' },
];

export default function SubjectModal({ subject = {}, onClose, onSave }) {
  const [name, setName] = useState(subject.name || '');
  const [code, setCode] = useState(subject.code || '');
  const [color, setColor] = useState(subject.color || '#6366f1');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: subject.id,
      name: name.trim(),
      code: code ? code.trim() : '',
      color,
    });
  };

  return (
    <Modal title={subject.id ? 'Edit Study Subject' : 'Add New Study Subject'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="field-group">
          <label>Subject / Course Name *</label>
          <input
            type="text"
            className="text-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Organic Chemistry, Macroeconomics, Data Structures"
          />
        </div>

        <div className="field-group">
          <label>Subject Code / Abbreviation</label>
          <input
            type="text"
            className="text-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. CHEM201, MATH101, CS102"
          />
        </div>

        <div className="field-group" style={{ marginTop: '14px' }}>
          <label>Subject Color Accent</label>
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
          {subject.id ? 'Save Subject Changes ✨' : 'Create Subject ✨'}
        </button>
      </form>
    </Modal>
  );
}
