import { useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Home, ListChecks, BookOpen, CalendarHeart, Library, Download, Upload } from 'lucide-react';
import { storage } from './services/storage';
import Dashboard from './pages/Dashboard';
import Checklists from './pages/Checklists';
import Diary from './pages/Diary';
import Agenda from './pages/Agenda';
import Guides from './pages/Guides';

function App() {
  const importRef = useRef(null);

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
            <NavLink to="/guides" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Library size={20} /> Biblioteca
            </NavLink>
          </nav>

          {/* Seção de dados no rodapé da sidebar */}
          <div className="sidebar-footer">
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
            <Route path="/guides" element={<Guides />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
