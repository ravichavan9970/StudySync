import React from 'react';

export default function SubjectBreakdownCard({ subjects = [], tasks = [], onAddSubject, onEditSubject, onDeleteSubject }) {
  return (
    <section className="card-box">
      <div className="section-header-bar">
        <div>
          <span className="card-eyebrow">SUBJECT BREAKDOWN</span>
          <h2 className="section-header-title">Active Study Subjects</h2>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={onAddSubject}
        >
          + Add Subject
        </button>
      </div>

      <div className="subjects-grid">
        {subjects.map((sub) => {
          const list = tasks.filter((task) => task.subjectId === sub.id || task.categoryId === sub.id);
          const done = list.filter((task) => task.status === 'COMPLETED').length;
          const pct = list.length ? Math.round((done / list.length) * 100) : 0;
          const subColor = sub.color || '#6366f1';

          return (
            <div
              className="subject-card"
              key={sub.id}
              style={{ borderLeftColor: subColor }}
            >
              <div>
                <div className="subject-header">
                  <span className="subject-dot" style={{ background: subColor, color: subColor }} />
                  <h4>
                    {sub.name} {sub.code ? <small style={{ color: 'var(--muted)', fontWeight: 400 }}>({sub.code})</small> : ''}
                  </h4>
                  <div className="subject-actions">
                    <button
                      type="button"
                      className="subject-action-btn"
                      title={`Edit subject "${sub.name}"`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditSubject(sub);
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="subject-action-btn danger"
                      title={`Delete subject "${sub.name}"`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSubject(sub);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="subject-meta-badge">
                  <span>{list.length} tasks · {done} done</span>
                  <span className="subject-pct-pill">{pct}%</span>
                </div>
              </div>

              <div className="subject-progress">
                <div className="subject-progress-fill" style={{ width: `${pct}%`, background: subColor }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
