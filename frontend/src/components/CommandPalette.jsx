import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Home,
  ListChecks,
  BookOpen,
  CalendarHeart,
  Scale,
  Sparkles,
  Stethoscope,
  ScrollText,
  Footprints,
  Calculator,
  Timer,
  Droplets,
  PartyPopper,
  Waves,
  Library,
  ArrowRight,
  X,
} from 'lucide-react';

const APP_FEATURES = [
  { path: '/', title: 'Início & Painel Gestacional', category: 'Principal', icon: Home, keywords: 'home dpp dum semanas desenvolvimento frutas bento' },
  { path: '/wellness', title: 'Água & Vitaminas (Daily Wellness)', category: 'Saúde & Gestação', icon: Droplets, keywords: 'agua copos suplementos ferro acido folico hidratacao sintomas humor' },
  { path: '/contractions', title: 'Cronômetro de Contrações (Regra 5-1-1)', category: 'Saúde & Gestação', icon: Timer, keywords: 'contrações parto maternidade dor trabalho de parto timer frequencia' },
  { path: '/kicks', title: 'Contador de Chutes (Movimentos Fetais)', category: 'Saúde & Gestação', icon: Footprints, keywords: 'chutes feto movimentos contagem 10 chutes sessao' },
  { path: '/weight', title: 'Curva de Ganho de Peso', category: 'Saúde & Gestação', icon: Scale, keywords: 'peso balança imc trimestre curva ganho gestacional' },
  { path: '/medical-summary', title: 'Ficha Médica Resumida', category: 'Saúde & Gestação', icon: Stethoscope, keywords: 'ficha obstetra tipo sanguineo alergias hospital plano medico impressao' },
  { path: '/checklists', title: 'Checklists da Maternidade & Enxoval', category: 'Planejamento', icon: ListChecks, keywords: 'mala maternidade enxoval quarto tarefas lista bebe compras' },
  { path: '/agenda', title: 'Agenda de Consultas & Ultrassons', category: 'Planejamento', icon: CalendarHeart, keywords: 'consultas exames ultrassom obstetra eventos calendario' },
  { path: '/names', title: 'Nomes de Bebê & Testador com Sobrenome', category: 'Planejamento', icon: Sparkles, keywords: 'nomes significados origem apelidos favoritos testador sobrenome monograma' },
  { path: '/birth-plan', title: 'Plano de Parto Humanizado', category: 'Planejamento', icon: ScrollText, keywords: 'parto normal cesarea analgesia doula cordao corte plano' },
  { path: '/calculator', title: 'Calculadora de Fraldas & Orçamento', category: 'Planejamento', icon: Calculator, keywords: 'fraldas estoque custos tamanho rn p m g pacote cha de bebe' },
  { path: '/birth-announcement', title: 'Gerador de Cartão de Nascimento', category: 'Memórias & Anúncio', icon: PartyPopper, keywords: 'cartao nascimento anuncio whatsapp story instagram foto pezinho peso hora' },
  { path: '/diary', title: 'Diário Gestacional & Fotos da Barriga', category: 'Memórias & Anúncio', icon: BookOpen, keywords: 'diario fotos relatos ultrassom registros semanas timeline' },
  { path: '/memory-book', title: 'Livro de Memórias do Bebê', category: 'Memórias & Anúncio', icon: BookOpen, keywords: 'livro impressao pdf diario completo album recordacoes' },
  { path: '/white-noise', title: 'Sons do Útero & Ruído Branco', category: 'Relaxamento', icon: Waves, keywords: 'ruido branco sons utero coracao chuva mar vento sono bebe dormir' },
  { path: '/guides', title: 'Biblioteca & Guias Médicos', category: 'Educação', icon: Library, keywords: 'guias amamentacao sono bebe primeiros socorros trimestres artigos' },
];

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const filtered = query.trim()
    ? APP_FEATURES.filter((f) => {
        const q = query.toLowerCase();
        return (
          f.title.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          f.keywords.toLowerCase().includes(q)
        );
      })
    : APP_FEATURES;

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex].path);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="lightbox-overlay spotlight-overlay" onClick={onClose}>
      <div
        className="spotlight-modal"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="spotlight-header">
          <Search size={20} className="spotlight-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="spotlight-input"
            placeholder="Buscar qualquer ferramenta, guia ou recurso... (ex: contrações, fraldas, água)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn-icon" onClick={onClose} style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        <div className="spotlight-results">
          {filtered.length === 0 ? (
            <div className="spotlight-empty">
              Nenhuma funcionalidade encontrada para "<b>{query}</b>".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.path + item.title}
                  className={`spotlight-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(item.path)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="spotlight-item-icon">
                    <Icon size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="spotlight-item-title">{item.title}</div>
                    <div className="spotlight-item-category">{item.category}</div>
                  </div>
                  <ArrowRight size={16} className="spotlight-item-arrow" />
                </div>
              );
            })
          )}
        </div>

        <div className="spotlight-footer">
          <span>Navegar com <b>↑</b> <b>↓</b></span>
          <span>Selecionar com <b>Enter</b></span>
          <span>Fechar com <b>Esc</b></span>
        </div>
      </div>
    </div>
  );
}
