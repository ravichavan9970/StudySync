import React, { useState } from 'react';
import { Modal } from '../common/UIElements';

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function TaskModal({ task = {}, subjects = [], categories = [], onClose, onSave, onAddSubject, onAddCategory }) {
  const [title, setTitle] = useState(task.title || '');
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState(task.dueDate || todayStr());
  const [priority, setPriority] = useState(task.priority || 'MEDIUM');
  const [durationMinutes, setDurationMinutes] = useState(task.durationMinutes || 25);
  const [subjectId, setSubjectId] = useState(task.subjectId || '');
  const [categoryId, setCategoryId] = useState(task.categoryId || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      task: {
        id: task.id,
        title: title.trim(),
        description: description ? description.trim() : null,
        dueDate: dueDate || null,
        priority,
        durationMinutes: Number(durationMinutes) || 25,
      },
      subjectId: subjectId || null,
      categoryId: categoryId || null,
    });
  };

  return (
    <Modal title={task.id ? 'Edit Task' : 'Create New Task'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="field-group">
          <label>Task Title *</label>
          <input
            type="text"
            className="text-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Review Organic Chemistry Notes"
          />
        </div>

        <div className="field-group">
          <label>Description</label>
          <textarea
            className="textarea-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add additional details, resources, or sub-goals..."
          />
        </div>

        <div className="two-col-fields">
          <div className="field-group">
            <label>Due Date</label>
            <input
              type="date"
              className="text-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="field-group">
            <label>Focus Timer (Minutes) ⏱️</label>
            <input
              type="number"
              className="text-input"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              min="1"
              max="240"
              placeholder="e.g. 25"
            />
          </div>
        </div>

        <div className="two-col-fields">
          <div className="field-group">
            <label>Priority Level</label>
            <select
              className="select-input"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

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

        <button className="btn-primary full-width modal-submit" type="submit">
          {task.id ? 'Save Changes' : 'Create Task'}
        </button>
      </form>
    </Modal>
  );
}
