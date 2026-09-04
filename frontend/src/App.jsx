import { useRef, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  ListChecks,
  BookOpen,
  CalendarHeart,
  Library,
  Timer,
  Scale,
  Sparkles,
  ScrollText,
  Footprints,
  Calculator,
  Download,
  Upload,
  Sun,
  Moon,
  Smartphone,
  Menu,
  X,
  Share,
  PlusSquare,
  ChevronRight,
} from 'lucide-react';
import { storage } from './services/storage';
import Dashboard from './pages/Dashboard';
import Checklists from './pages/Checklists';
import Diary from './pages/Diary';
import Agenda from './pages/Agenda';
import Guides from './pages/Guides';
import Contractions from './pages/Contractions';
import WeightTracker from './pages/WeightTracker';
import BabyNames from './pages/BabyNames';
import BirthPlan from './pages/BirthPlan';
import KickCounter from './pages/KickCounter';
import DiaperBudget from './pages/DiaperBudget';

function AppContent() {
  const importRef = useRef(null);
  const location = useLocation();

  const [theme, setTheme] = useState(() => {
    const saved = storage.getSetting('theme');
    if (saved && saved.value) return saved.value;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosInstallModal, setShowIosInstallModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fecha o menu mobile ao trocar de rota
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    storage.setSetting('theme', theme);
  }, [theme]);

  // Listener para instalação do PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Checa se já está rodando como standalone (instalado)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleInstallClick = async () => {
    // Se for Chrome / Android com prompt disponível
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      return;
    }

    // Se for iOS / Safari
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIos) {
      setShowIosInstallModal(true);
      return;
    }

    // Outros navegadores
    alert('Para instalar este app:\nNo computador: clique no ícone de instalar na barra de endereços do navegador.\nNo Android: toque no menu (3 pontinhos) e selecione "Adicionar à tela inicial".');
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
    <div className="app-container">
      {/* Topbar Mobile */}
      <div className="mobile-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1.15rem', color: 'var(--primary)' }}>
          <span role="img" aria-label="baby">👶</span> FirstBump
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={toggleTheme}
            className="btn-icon"
            title="Alternar modo claro/escuro"
          >
            {theme === 'dark' ? <Moon size={18} style={{ color: '#60a5fa' }} /> : <Sun size={18} style={{ color: '#eab308' }} />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="btn-icon"
            title="Menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Overlay do menu mobile */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar Lateral */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div className="sidebar-logo" style={{ margin: 0 }}>
            <span role="img" aria-label="baby">👶</span> FirstBump
          </div>

          {mobileMenuOpen && (
            <button className="btn-icon" onClick={() => setMobileMenuOpen(false)}>
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} end>
            <Home size={20} /> Início
          </NavLink>
          <NavLink to="/checklists" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <ListChecks size={20} /> Checklists
          </NavLink>
          <NavLink to="/diary" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <BookOpen size={20} /> Diário & Fotos
          </NavLink>
          <NavLink to="/agenda" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <CalendarHeart size={20} /> Agenda
          </NavLink>
          <NavLink to="/weight" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Scale size={20} /> Curva de Peso
          </NavLink>
          <NavLink to="/names" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Sparkles size={20} /> Nomes de Bebê
          </NavLink>
          <NavLink to="/birth-plan" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <ScrollText size={20} /> Plano de Parto
          </NavLink>
          <NavLink to="/kicks" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Footprints size={20} /> Contador de Chutes
          </NavLink>
          <NavLink to="/calculator" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Calculator size={20} /> Fraldas & Orçamento
          </NavLink>
          <NavLink to="/contractions" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Timer size={20} /> Contrações
          </NavLink>
          <NavLink to="/guides" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Library size={20} /> Biblioteca
          </NavLink>
        </nav>

        {/* Seção de Dados, PWA e Tema no rodapé */}
        <div className="sidebar-footer">
          {/* Botão de Instalação do App PWA */}
          {!isInstalled && (
            <button
              className="sidebar-action-btn"
              onClick={handleInstallClick}
              style={{ backgroundColor: 'var(--accent-soft)', borderColor: 'var(--accent)', color: 'var(--accent)', fontWeight: 600 }}
            >
              <Smartphone size={16} /> Instalar no Celular
            </button>
          )}

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

          <p className="sidebar-footer-title">Seus Dados (Backup)</p>
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
            Dados 100% privados e salvos no seu aparelho.
          </p>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/checklists" element={<Checklists />} />
          <Route path="/diary" element={<Diary />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/weight" element={<WeightTracker />} />
          <Route path="/names" element={<BabyNames />} />
          <Route path="/birth-plan" element={<BirthPlan />} />
          <Route path="/kicks" element={<KickCounter />} />
          <Route path="/calculator" element={<DiaperBudget />} />
          <Route path="/contractions" element={<Contractions />} />
          <Route path="/guides" element={<Guides />} />
        </Routes>
      </main>

      {/* Barra de Navegação Inferior Mobile (Bottom Nav) */}
      <nav className="mobile-bottom-nav">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'mobile-nav-item active' : 'mobile-nav-item')} end>
          <Home size={20} />
          <span>Início</span>
        </NavLink>
        <NavLink to="/checklists" className={({ isActive }) => (isActive ? 'mobile-nav-item active' : 'mobile-nav-item')}>
          <ListChecks size={20} />
          <span>Checklists</span>
        </NavLink>
        <NavLink to="/diary" className={({ isActive }) => (isActive ? 'mobile-nav-item active' : 'mobile-nav-item')}>
          <BookOpen size={20} />
          <span>Diário</span>
        </NavLink>
        <NavLink to="/contractions" className={({ isActive }) => (isActive ? 'mobile-nav-item active' : 'mobile-nav-item')}>
          <Timer size={20} />
          <span>Contrações</span>
        </NavLink>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="mobile-nav-item"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <Menu size={20} />
          <span>Mais</span>
        </button>
      </nav>

      {/* Modal Guia de Instalação para iOS (iPhone / iPad) */}
      {showIosInstallModal && (
        <div className="lightbox-overlay" onClick={() => setShowIosInstallModal(false)}>
          <div
            className="lightbox-content"
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '420px',
              width: '92%',
              padding: '24px',
              border: '1px solid var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Smartphone size={22} style={{ color: 'var(--accent)' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--primary)' }}>Instalar no iPhone / iPad</h3>
              </div>
              <button className="btn-icon" onClick={() => setShowIosInstallModal(false)}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
              Para ter o FirstBump na sua tela de início e usar mesmo sem internet, siga estes 2 passos:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'var(--surface-hover)', borderRadius: 'var(--radius)' }}>
                <div style={{ padding: '8px', borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                  <Share size={18} />
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  <b>1.</b> Toque no botão de <b>Compartilhar</b> na barra inferior do Safari.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'var(--surface-hover)', borderRadius: 'var(--radius)' }}>
                <div style={{ padding: '8px', borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                  <PlusSquare size={18} />
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  <b>2.</b> Role para baixo e toque em <b>"Adicionar à Tela de Início"</b>.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosInstallModal(false)}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Entendi!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
