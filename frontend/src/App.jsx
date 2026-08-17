import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Home, ListChecks, BookOpen, CalendarHeart } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Checklists from './pages/Checklists';
import Diary from './pages/Diary';
import Agenda from './pages/Agenda';

function App() {
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
          </nav>
        </aside>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/checklists" element={<Checklists />} />
            <Route path="/diary" element={<Diary />} />
            <Route path="/agenda" element={<Agenda />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
