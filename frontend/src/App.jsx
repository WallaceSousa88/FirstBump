import { useRef, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Home, ListChecks, BookOpen, CalendarHeart, Library, Timer, Download, Upload, Sun, Moon } from 'lucide-react';
import { storage } from './services/storage';
import Dashboard from './pages/Dashboard';
import Checklists from './pages/Checklists';
import Diary from './pages/Diary';
import Agenda from './pages/Agenda';
import Guides from './pages/Guides';
import Contractions from './pages/Contractions';

function App() {
  const importRef = useRef(null);

  const [theme, setTheme] = useState(() => {
    const saved = storage.getSetting('theme');
    if (saved && saved.value) return saved.value;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    storage.setSetting('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleExport = () => {
    storage.exportData();
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await storage.importData(file);
      alert('Dados importados com sucesso! A página será recarregada.');
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
    e.target.value = '';
  };

  return (
    <Router>
      <div className="app-container">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <span role="img" aria-label="baby">👶</span> FirstBump
          </div>

          <nav className="nav-links">
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} end>
              <Home size={20} /> Início
            </NavLink>
            <NavLink to="/checklists" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <ListChecks size={20} /> Checklists
            </NavLink>
            <NavLink to="/diary" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <BookOpen size={20} /> Diário
            </NavLink>
            <NavLink to="/agenda" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <CalendarHeart size={20} /> Agenda
            </NavLink>
            <NavLink to="/contractions" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Timer size={20} /> Contrações
            </NavLink>
            <NavLink to="/guides" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Library size={20} /> Biblioteca
            </NavLink>
          </nav>

          {/* Seção de dados e tema no rodapé da sidebar */}
          <div className="sidebar-footer">
            {/* Botão de Alternar Modo Noturno */}
            <button className="theme-toggle-btn" onClick={toggleTheme} title="Alternar tema claro/escuro">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {theme === 'dark' ? <Moon size={16} style={{ color: '#60a5fa' }} /> : <Sun size={16} style={{ color: '#eab308' }} />}
                <span>{theme === 'dark' ? 'Modo Noturno' : 'Modo Claro'}</span>
              </div>
              <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--border)', color: 'var(--text-muted)' }}>
                {theme === 'dark' ? '🌙' : '☀️'}
              </span>
            </button>

            <p className="sidebar-footer-title">Seus Dados</p>
            <button className="sidebar-action-btn" onClick={handleExport}>
              <Download size={15} /> Exportar Backup
            </button>
            <button className="sidebar-action-btn" onClick={() => importRef.current.click()}>
              <Upload size={15} /> Importar Backup
            </button>
            <input
              type="file"
              accept=".json"
              ref={importRef}
              style={{ display: 'none' }}
              onChange={handleImport}
            />
            <p className="sidebar-footer-hint">
              Exporte seus dados regularmente para não perdê-los.
            </p>
          </div>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/checklists" element={<Checklists />} />
            <Route path="/diary" element={<Diary />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/contractions" element={<Contractions />} />
            <Route path="/guides" element={<Guides />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
