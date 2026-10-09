import { useRef, useState, useEffect, useLayoutEffect } from 'react';
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
  Stethoscope,
  Waves,
  Droplets,
  PartyPopper,
  Download,
  Upload,
  Sun,
  Moon,
  Smartphone,
  Menu,
  X,
  Share,
  PlusSquare,
  Search,
} from 'lucide-react';
import { storage } from './services/storage';
import { ToastProvider, useToast } from './context/ToastContext';
import CommandPalette from './components/CommandPalette';
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
import MemoryBook from './pages/MemoryBook';
import MedicalSummary from './pages/MedicalSummary';
import WhiteNoise from './pages/WhiteNoise';
import WellnessTracker from './pages/WellnessTracker';
import BirthAnnouncement from './pages/BirthAnnouncement';

const COLOR_THEMES = [
  { key: 'ocean', label: 'Azul Sereno', emoji: '🌊', color: '#2563eb' },
  { key: 'blush', label: 'Rosa Blush', emoji: '🌸', color: '#db2777' },
  { key: 'sage', label: 'Verde Sálvia', emoji: '🌿', color: '#16a34a' },
  { key: 'lavender', label: 'Lavanda', emoji: '💜', color: '#7c3aed' },
  { key: 'honey', label: 'Caramelo & Mel', emoji: '🍯', color: '#d97706' },
];

function AppContent() {
  const importRef = useRef(null);
  const location = useLocation();
  const toast = useToast();

  const [theme, setTheme] = useState(() => {
    const saved = storage.getSetting('theme');
    if (saved && saved.value) return saved.value;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [colorTheme, setColorTheme] = useState(() => {
    const saved = storage.getSetting('color_theme');
    return saved && saved.value ? saved.value : 'ocean';
  });

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosInstallModal, setShowIosInstallModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Scroll automático para o topo ao mudar de rota
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Fecha o menu mobile ao trocar de rota
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Atalho global de teclado: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    storage.setSetting('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-color-theme', colorTheme);
    storage.setSetting('color_theme', colorTheme);
  }, [colorTheme]);

  // Listener para instalação do PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success('Aplicativo instalado com sucesso!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      return;
    }

    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIos) {
      setShowIosInstallModal(true);
      return;
    }

    toast.info('Para instalar: clique no ícone de instalar na barra de navegação ou menu do navegador.');
  };

  const handleExport = () => {
    storage.exportData();
    toast.success('Backup dos seus dados baixado com sucesso!');
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await storage.importData(file);
      toast.success('Dados importados com sucesso! Recarregando...');
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      toast.error(err.message);
    }
    e.target.value = '';
  };

  return (
    <div className="app-container">
      {/* Camada de Fundo Aurora Fluida */}
      <div className="ambient-background-layer" aria-hidden="true">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
      </div>

      {/* Busca Rápida Spotlight (Cmd+K) */}
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />

      {/* Topbar Mobile */}
      <div className="mobile-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1.15rem', color: 'var(--primary)' }}>
          <span role="img" aria-label="baby">👶</span> FirstBump
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="btn-icon"
            title="Buscar ferramentas"
          >
            <Search size={18} />
          </button>

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div className="sidebar-logo" style={{ margin: 0 }}>
            <span role="img" aria-label="baby">👶</span> FirstBump
          </div>

          {mobileMenuOpen && (
            <button className="btn-icon" onClick={() => setMobileMenuOpen(false)}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Botão de Busca Rápida na Sidebar */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '8px 12px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            marginBottom: '14px',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={15} style={{ color: 'var(--accent)' }} />
            <span>Buscar ferramenta...</span>
          </div>
          <span style={{ fontSize: '0.7rem', padding: '1px 5px', borderRadius: '4px', background: 'var(--surface)', border: '1px solid var(--border)', fontWeight: 600 }}>
            ⌘K
          </span>
        </button>

        <nav className="nav-links">
          {/* SEÇÃO 1: PRINCIPAL */}
          <span className="nav-section-title">Principal</span>
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} end>
            <Home size={18} /> Início & Painel
          </NavLink>
          <NavLink to="/checklists" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <ListChecks size={18} /> Checklists da Mala
          </NavLink>
          <NavLink to="/agenda" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <CalendarHeart size={18} /> Agenda Pré-Natal
          </NavLink>

          {/* SEÇÃO 2: SAÚDE & GESTAÇÃO */}
          <span className="nav-section-title">Saúde & Gestação</span>
          <NavLink to="/wellness" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Droplets size={18} /> Água & Vitaminas
          </NavLink>
          <NavLink to="/contractions" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Timer size={18} /> Contrações (5-1-1)
          </NavLink>
          <NavLink to="/kicks" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Footprints size={18} /> Contador de Chutes
          </NavLink>
          <NavLink to="/weight" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Scale size={18} /> Curva de Peso
          </NavLink>
          <NavLink to="/medical-summary" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Stethoscope size={18} /> Ficha do Obstetra
          </NavLink>

          {/* SEÇÃO 3: PLANEJAMENTO & ENXOVAL */}
          <span className="nav-section-title">Planejamento</span>
          <NavLink to="/names" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Sparkles size={18} /> Nomes de Bebê
          </NavLink>
          <NavLink to="/birth-plan" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <ScrollText size={18} /> Plano de Parto
          </NavLink>
          <NavLink to="/calculator" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Calculator size={18} /> Fraldas & Orçamento
          </NavLink>

          {/* SEÇÃO 4: MEMÓRIAS & BEM-ESTAR */}
          <span className="nav-section-title">Memórias & Relax</span>
          <NavLink to="/birth-announcement" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <PartyPopper size={18} /> Cartão Nascimento
          </NavLink>
          <NavLink to="/diary" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <BookOpen size={18} /> Diário & Fotos
          </NavLink>
          <NavLink to="/white-noise" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Waves size={18} /> Sons & Ruído Branco
          </NavLink>
          <NavLink to="/guides" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Library size={18} /> Biblioteca de Guias
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

          {/* Seletor de Paleta de Cores (Accent Theme) */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span className="sidebar-footer-title" style={{ margin: 0 }}>Cor de Destaque</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>
                {COLOR_THEMES.find((t) => t.key === colorTheme)?.label}
              </span>
            </div>
            <div className="color-theme-picker">
              {COLOR_THEMES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setColorTheme(t.key)}
                  className={`color-dot-btn ${colorTheme === t.key ? 'active' : ''}`}
                  style={{ backgroundColor: t.color }}
                  title={`${t.label} ${t.emoji}`}
                >
                  {colorTheme === t.key && <span style={{ color: '#ffffff', fontSize: '0.65rem' }}>✓</span>}
                </button>
              ))}
            </div>
          </div>

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
          <Route path="/memory-book" element={<MemoryBook />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/weight" element={<WeightTracker />} />
          <Route path="/names" element={<BabyNames />} />
          <Route path="/medical-summary" element={<MedicalSummary />} />
          <Route path="/birth-plan" element={<BirthPlan />} />
          <Route path="/kicks" element={<KickCounter />} />
          <Route path="/calculator" element={<DiaperBudget />} />
          <Route path="/contractions" element={<Contractions />} />
          <Route path="/wellness" element={<WellnessTracker />} />
          <Route path="/birth-announcement" element={<BirthAnnouncement />} />
          <Route path="/birth-card" element={<BirthAnnouncement />} />
          <Route path="/white-noise" element={<WhiteNoise />} />
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
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </Router>
  );
}
