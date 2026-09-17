import { useState } from 'react'
import { marineLife, worldObjects } from '../scripts/data.js'
import { useDiscovery } from '../scripts/DiscoverySystem.jsx'

const ALL_ENTRIES = [...marineLife, ...worldObjects]
const NOTE_LIMIT = 500

export default function Discoveries() {
  const { discoveredCount, journal, isDiscovered, saveNote, deleteNote } = useDiscovery()
  const [openId, setOpenId] = useState(null)
  const [draft, setDraft] = useState('')

  const toggleEntry = (entry) => {
    if (!isDiscovered(entry.id)) return
    if (openId && openId !== entry.id && draft.trim()) {
      saveNote(openId, draft.trim().slice(0, NOTE_LIMIT))
    }
    if (openId === entry.id) {
      setOpenId(null)
      return
    }
    setOpenId(entry.id)
    setDraft(journal[entry.id] || '')
  }

  const handleSave = (id) => {
    saveNote(id, draft.trim().slice(0, NOTE_LIMIT))
  }

  const handleDelete = (id) => {
    deleteNote(id)
    setDraft('')
  }

  return (
    <div className="page-container">
      <div className="page-header glass-panel">
        <h1>Discovery Log</h1>
        <p>
          {discoveredCount} / {ALL_ENTRIES.length} discovered
        </p>
      </div>
      <div className="discovery-grid">
        {ALL_ENTRIES.map((entry) => {
          const found = isDiscovered(entry.id)
          const isOpen = openId === entry.id
          return (
            <div key={entry.id} className={`discovery-card glass-panel ${found ? 'found' : ''}`}>
              <button
                type="button"
                className="discovery-card-header"
                onClick={() => toggleEntry(entry)}
                disabled={!found}
              >
                <span className="discovery-name">{entry.name}</span>
                <span aria-hidden="true">{found ? '\u2713' : '\uD83D\uDD12'}</span>
              </button>
              {isOpen && found && (
                <div className="discovery-journal">
                  <p className="discovery-journal-desc">{entry.description}</p>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Add a personal note about this dive..."
                    maxLength={NOTE_LIMIT}
                    rows={3}
                  />
                  <div className="discovery-journal-actions">
                    <span className="discovery-journal-count">
                      {draft.length}/{NOTE_LIMIT}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSave(entry.id)}
                      disabled={draft.trim().length === 0}
                    >
                      Save note
                    </button>
                    {journal[entry.id] && (
                      <button
                        type="button"
                        className="discovery-journal-delete"
                        onClick={() => handleDelete(entry.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
