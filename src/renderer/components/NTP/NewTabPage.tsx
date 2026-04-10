import React, { useState, useEffect, useMemo } from 'react';
import './NewTabPage.css';
import { TubesAnimation } from './TubesAnimation';

interface SearchEngine {
  id: string;
  name: string;
  url: string;
  icon: string;
}

const searchEngines: SearchEngine[] = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=', icon: 'G' },
  { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', icon: 'D' },
  { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=', icon: 'B' },
  { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/results?search_query=', icon: 'Y' },
  { id: 'github', name: 'GitHub', url: 'https://github.com/search?q=', icon: 'H' },
  { id: 'stackoverflow', name: 'Stack Overflow', url: 'https://stackoverflow.com/search?q=', icon: 'S' },
];

// Constant colors array outside component to prevent re-renders
const EAIGHT_COLORS = ['#25ced1', '#ea526f', '#ff8a5b'];

export function NewTabPage() {
  const [query, setQuery] = useState('');
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine>(searchEngines[0]);
  const [showEngineMenu, setShowEngineMenu] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('eaight-search-engine');
    if (saved) {
      const engine = searchEngines.find(e => e.id === saved);
      if (engine) setSelectedEngine(engine);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const searchUrl = selectedEngine.url + encodeURIComponent(query.trim());
      window.electronAPI?.navigate(searchUrl);
    }
  };

  const selectEngine = (engine: SearchEngine) => {
    setSelectedEngine(engine);
    setShowEngineMenu(false);
    localStorage.setItem('eaight-search-engine', engine.id);
  };

  return (
    <div className="ntp-container">
      <TubesAnimation colors={EAIGHT_COLORS} />

      <div className="ntp-search-wrapper">
        <form onSubmit={handleSearch} className="ntp-search-form">
          <div className="ntp-engine-selector">
            <button
              type="button"
              className="ntp-engine-btn"
              onClick={() => setShowEngineMenu(!showEngineMenu)}
            >
              <span className="ntp-engine-icon">{selectedEngine.icon}</span>
            </button>
            {showEngineMenu && (
              <div className="ntp-engine-menu">
                {searchEngines.map(engine => (
                  <button
                    key={engine.id}
                    type="button"
                    className={`ntp-engine-option ${engine.id === selectedEngine.id ? 'active' : ''}`}
                    onClick={() => selectEngine(engine)}
                  >
                    <span className="ntp-engine-icon">{engine.icon}</span>
                    <span>{engine.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            type="text"
            className="ntp-search-input"
            placeholder={`Search with ${selectedEngine.name}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button type="submit" className="ntp-search-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

export default NewTabPage;
