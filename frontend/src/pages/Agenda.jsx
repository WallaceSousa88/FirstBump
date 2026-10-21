import { useState } from 'react';
import {
  CalendarHeart,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar as CalendarIcon,
  Stethoscope,
  Syringe,
  FileText,
  AlertCircle,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import { storage } from '../services/storage';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import { fireSparkleBurst } from '../utils/confetti';

const RECOMMENDED_EXAMS = [
  {
    title: 'Ultrassom Morfológico 1º Tri (TN)',
    type: 'exame',
    weeks: '11ª a 14ª semana',
    prep: 'Avalia translucência nucal, osso nasal e anatomia inicial.',
  },
  {
    title: 'Ultrassom Morfológico 2º Tri',
    type: 'exame',
    weeks: '20ª a 24ª semana',
    prep: 'Morfologia detalhada de órgãos, membros e fluxo placentário.',
  },
  {
    title: 'Curva Glicêmica (TOTG 75g)',
    type: 'exame',
    weeks: '24ª a 28ª semana',
    prep: 'Jejum de 8h a 12h para rastreio de diabetes gestacional.',
  },
  {
    title: 'Ecocardiograma Fetal',
    type: 'exame',
    weeks: '26ª a 28ª semana',
    prep: 'Análise minuciosa da anatomia e fluxo do coraçãozinho.',
  },
  {
    title: 'Pesquisa de Streptococcus B',
    type: 'exame',
    weeks: '35ª a 37ª semana',
    prep: 'Swab preventivo para o momento do trabalho de parto.',
  },
];

const TYPE_CONFIG = {
  consulta: { label: 'Consulta Pré-Natal', icon: Stethoscope, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  exame: { label: 'Exame / Ultrassom', icon: FileText, color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
  vacina: { label: 'Vacinação (dTpa / Gripe)', icon: Syringe, color: '#ca8a04', bg: '#fefce8', border: '#fef08a' },
  outro: { label: 'Outro Compromisso', icon: CalendarHeart, color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
};

function getDaysRemaining(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffTime = target - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatDayAndMonth(dateStr) {
  if (!dateStr) return { day: '', month: '' };
  const parts = dateStr.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const monthIdx = parseInt(parts[1], 10) - 1;
  return {
    day: parts[2],
    month: months[monthIdx] || '',
  };
}

export default function Agenda() {
  const [events, setEvents] = useState(() => storage.getAgendaEvents());
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('consulta');
  const [description, setDescription] = useState('');
  const [showPresets, setShowPresets] = useState(false);

  const refresh = () => setEvents(storage.getAgendaEvents());

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    storage.createAgendaEvent({ title: title.trim(), date, type, description: description.trim() });
    setTitle('');
    setDescription('');
    setDate('');
    refresh();

    soundSynthesizer.playChime();
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      fireSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  };

  const handleApplyPreset = (preset) => {
    setTitle(preset.title);
    setType(preset.type);
    setDescription(preset.prep);
    setShowPresets(false);
    soundSynthesizer.playPop();
  };

  const handleDelete = (id) => {
    storage.deleteAgendaEvent(id);
    refresh();
    soundSynthesizer.playPop();
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const upcoming = events.filter((e) => e.date >= todayStr).sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = events.filter((e) => e.date < todayStr).sort((a, b) => new Date(b.date) - new Date(a.date));

  const EventCard = ({ event, isPast = false }) => {
    const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.outro;
    const IconComponent = config.icon;
    const days = getDaysRemaining(event.date);
    const dateBlock = formatDayAndMonth(event.date);

    return (
      <div
        className="card"
        style={{
          marginBottom: 0,
          padding: '18px 20px',
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-start',
          opacity: isPast ? 0.72 : 1,
          border: `1px solid ${isPast ? 'var(--border)' : config.border}`,
          position: 'relative',
        }}
      >
        {/* Bloco Calendário Visual */}
        <div
          style={{
            width: '54px',
            borderRadius: '12px',
            backgroundColor: config.bg,
            border: `1.5px solid ${config.border}`,
            textAlign: 'center',
            overflow: 'hidden',
            flexShrink: 0,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              backgroundColor: config.color,
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '2px 0',
            }}
          >
            {dateBlock.month}
          </div>
          <div
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: config.color,
              padding: '4px 0 6px',
              lineHeight: 1,
            }}
          >
            {dateBlock.day}
          </div>
        </div>

        {/* Informações do Compromisso */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
                backgroundColor: config.bg,
                color: config.color,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <IconComponent size={12} /> {config.label}
            </span>

            {!isPast && days !== null && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  backgroundColor: days === 0 ? 'rgba(239, 68, 68, 0.15)' : days <= 3 ? 'rgba(245, 158, 11, 0.15)' : 'var(--surface-hover)',
                  color: days === 0 ? '#ef4444' : days <= 3 ? '#d97706' : 'var(--text-muted)',
                }}
              >
                {days === 0 ? '🚨 É hoje!' : days === 1 ? '⏰ É amanhã!' : `Faltam ${days} dias`}
              </span>
            )}
          </div>

          <h3
            style={{
              margin: '0 0 6px 0',
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--primary)',
            }}
          >
            {event.title}
          </h3>

          {event.description && (
            <p
              style={{
                margin: 0,
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                lineHeight: 1.45,
                background: 'var(--surface-hover)',
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
              }}
            >
              💡 {event.description}
            </p>
          )}
        </div>

        {/* Botão Excluir */}
        <button
          className="btn-icon btn-danger-icon"
          onClick={() => handleDelete(event.id)}
          title="Remover compromisso"
          style={{ flexShrink: 0, opacity: 0.7 }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Topo da Agenda */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}
          >
            <CalendarHeart size={22} />
          </div>
          <div>
            <h1 className="page-title" style={{ margin: 0, fontSize: '1.65rem' }}>
              Agenda Pré-Natal & Exames
            </h1>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Organize consultas, ultrassons morfológicos e vacinas sem perder nenhuma data especial 📅✨
            </p>
          </div>
        </div>
      </div>

      {/* Formulário de Novo Compromisso */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, fontSize: '1.05rem' }}>
            <Plus size={18} style={{ color: 'var(--accent)' }} />
            <span>Novo Compromisso na Gravidez</span>
          </div>

          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="btn"
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: '999px',
              background: showPresets ? 'var(--accent)' : 'var(--accent-soft)',
              color: showPresets ? '#ffffff' : 'var(--accent)',
              border: '1px solid var(--accent)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Sparkles size={13} /> {showPresets ? 'Ocultar Sugestões' : 'Ver Exames Recomendados'}
          </button>
        </div>

        {/* Gaveta de Modelos Rápidos de Exames */}
        {showPresets && (
          <div
            style={{
              background: 'var(--surface-hover)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '14px',
              marginBottom: '18px',
              animation: 'scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              Toque em um exame para preencher o formulário automaticamente:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
              {RECOMMENDED_EXAMS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  className="hover-scale"
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>{p.title}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600 }}>{p.weeks}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleAdd}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Título do Evento *</label>
              <input
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Ultrassom Morfológico 2º Trimestre"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Data do Compromisso *</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Categoria</label>
              <select className="form-input" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="consulta">🩺 Consulta Pré-Natal</option>
                <option value="exame">🔬 Exame / Ultrassom</option>
                <option value="vacina">💉 Vacina Gestacional</option>
                <option value="outro">📅 Outro Compromisso</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Instruções / Preparo Médico (Opcional)</label>
            <input
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Jejum de 8h, levar cartão de vacina e laudos anteriores..."
            />
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', fontWeight: 700 }}
          >
            <Plus size={16} /> Salvar na Agenda
          </button>
        </form>
      </div>

      {/* Próximos Eventos */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={16} style={{ color: 'var(--accent)' }} /> Próximos Compromissos ({upcoming.length})
        </h2>

        {upcoming.length === 0 ? (
          <div className="card empty-state" style={{ padding: '36px 20px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🌸</div>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>
              Nenhuma consulta ou exame futuro agendado. Adicione no formulário acima ou use os modelos sugeridos!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcoming.map((ev) => (
              <EventCard key={ev.id} event={ev} />
            ))}
          </div>
        )}
      </div>

      {/* Histórico de Compromissos Passados */}
      {past.length > 0 && (
        <div>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} /> Histórico Concluído ({past.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {past.map((ev) => (
              <EventCard key={ev.id} event={ev} isPast />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
