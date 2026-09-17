import { useState } from 'react'
import Home from '../pages/Home.jsx'
import Discoveries from '../pages/Discoveries.jsx'
import About from '../pages/About.jsx'
import SettingsPanel from './Settings.jsx'

const PAGES = [
  { id: 'home', label: 'Explore' },
  { id: 'discoveries', label: 'Discoveries' },
  { id: 'about', label: 'About' }
]

export default function App() {
  const [page, setPage] = useState('home')
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="app-root">
      <nav className="app-nav">
        <span className="nav-brand">Ocean Explorer</span>
        <div className="nav-links">
          {PAGES.map((p) => (
            <button
              key={p.id}
              type="button"
              className={page === p.id ? 'active' : ''}
              aria-current={page === p.id ? 'page' : undefined}
              onClick={() => setPage(p.id)}
            >
              {p.label}
            </button>
          ))}
          <button type="button" onClick={() => setShowSettings((v) => !v)}>
            Settings
          </button>
        </div>
      </nav>
      <main className="app-main">
        {page === 'home' && <Home />}
        {page === 'discoveries' && <Discoveries />}
        {page === 'about' && <About />}
      </main>
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  )
}
