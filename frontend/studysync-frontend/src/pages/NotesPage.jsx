import React, { useState, useMemo } from 'react';
import TopHeader from '../components/common/TopHeader';
import NoteToolbar from '../components/notes/NoteToolbar';
import NoteCard from '../components/notes/NoteCard';
import { Empty } from '../components/common/UIElements';
import { useStudySync } from '../context/StudySyncContext';

export default function NotesPage() {
  const {
    data,
    setNoteModal,
    reviseNote,
    archiveNote,
    deleteNote,
  } = useStudySync();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  const filteredNotes = useMemo(() => {
    return data.notes.filter((note) => {
      const matchesSearch = `${note.title} ${note.content || ''} ${note.categoryName || ''}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter =
        filter === 'ALL' ||
        (filter === 'ACTIVE' && !note.archived) ||
        (filter === 'ARCHIVED' && note.archived);

      return matchesSearch && matchesFilter;
    });
  }, [data.notes, filter, search]);

  return (
    <div className="view-container">
      <TopHeader
        title="Knowledge Base & Study Notes"
        subtitle="Your digital thinking space for formulas, lecture notes, and summaries."
      />

      <div className="page-section">
        <div className="section-header-bar">
          <div>
            <span className="card-eyebrow">KNOWLEDGE BASE</span>
            <h2 className="section-header-title">Study Notes & Cheat Sheets</h2>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setNoteModal({})}
          >
            + New Note
          </button>
        </div>

        <NoteToolbar
          filter={filter}
          setFilter={setFilter}
          search={search}
          setSearch={setSearch}
        />

        <div className="notes-grid">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onPin={(n) => reviseNote(n, { pinned: !n.pinned })}
                onArchive={archiveNote}
                onEdit={(n) => setNoteModal(n)}
                onDelete={deleteNote}
              />
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1' }}>
              <Empty text="No notes found in this folder." />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
