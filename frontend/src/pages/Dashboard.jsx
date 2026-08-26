import { useEffect, useState } from 'react';
import { storage } from '../services/storage';
import { getBabySize } from '../data/babySizes';
import { CalendarHeart, ListChecks, ChevronLeft, ChevronRight, Sparkles, Scale, Ruler, HeartHandshake, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [dueDate, setDueDate] = useState('');
  const [inputDate, setInputDate] = useState('');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [viewedWeek, setViewedWeek] = useState(1);
  const [progress, setProgress] = useState(0);
  const [daysLeft, setDaysLeft] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);

  useEffect(() => {
    const setting = storage.getSetting('due_date');
    if (setting && setting.value) {
      setDueDate(setting.value);
      calculateWeeks(setting.value);
    }

    const today = new Date().toISOString().split('T')[0];
    const events = storage.getAgendaEvents();
    setUpcomingEvents(events.filter((e) => e.date >= today).slice(0, 2));

    const checklists = storage.getChecklists();
    setPendingTasks(checklists.filter((c) => !c.is_completed).slice(0, 3));
  }, []);

  const calculateWeeks = (dateString) => {
    const dpp = new Date(dateString);
    const dum = new Date(dpp.getTime() - 280 * 24 * 60 * 60 * 1000);
    const now = new Date();

    const diffDays = Math.floor((now - dum) / (1000 * 60 * 60 * 24));
    let calculated = Math.max(1, Math.min(40, Math.floor(diffDays / 7) || 1));

    // Dias restantes para a DPP
    const diffToDpp = Math.ceil((dpp - now) / (1000 * 60 * 60 * 24));
    setDaysLeft(diffToDpp > 0 ? diffToDpp : 0);

    setCurrentWeek(calculated);
    setViewedWeek(calculated);
    setProgress((calculated / 40) * 100);
  };

  const handleSaveDate = (e) => {
    e.preventDefault();
    if (!inputDate) return;
    storage.setSetting('due_date', inputDate);
    setDueDate(inputDate);
    calculateWeeks(inputDate);
  };

  const babyInfo = getBabySize(viewedWeek);
  const isBrowsingOtherWeek = viewedWeek !== currentWeek;

  return (
    <div>
      <h1 className="page-title">Resumo da Gestação</h1>

      {!dueDate ? (
        <div className="card" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
          <h2 className="card-title" style={{ color: '#1e3a8a' }}>Bem-vindo ao FirstBump! 👋</h2>
          <p className="card-text" style={{ marginBottom: '16px', color: '#1e40af' }}>
            Para personalizarmos o seu painel e mostrar o tamanho do seu bebê semana a semana, insira a <b>Data Prevista do Parto (DPP)</b> calculada pelo seu médico.
          </p>
          <form onSubmit={handleSaveDate} className="flex-row">
            <input
              type="date"
              className="form-input"
              style={{ maxWidth: '200px' }}
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              required
            />
            <button className="btn btn-primary" type="submit">
              Salvar Data
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Card Principal: Comparador de Frutinhas e Desenvolvimento */}
          <div className="baby-size-hero">
            <div className="baby-hero-top">
              <div className="baby-fruit-box">
                <div className="baby-emoji-circle" title={babyInfo.name}>
                  {babyInfo.emoji}
                </div>

                <div className="baby-fruit-details">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        backgroundColor: '#f3e8ff',
                        color: '#7e22ce',
                      }}
                    >
                      {babyInfo.trimester}
                    </span>

                    {daysLeft !== null && !isBrowsingOtherWeek && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '3px 10px',
                          borderRadius: '999px',
                          backgroundColor: '#dcfce7',
                          color: '#15803d',
                        }}
                      >
                        🎉 Faltam {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}
                      </span>
                    )}
                  </div>

                  <h2>
                    Semana {viewedWeek}: Tamanho de {babyInfo.name}
                  </h2>

                  <div className="baby-metrics-row">
                    <div className="baby-metric-badge">
                      <Ruler size={14} style={{ color: '#2563eb' }} />
                      <span>Comprimento: <b>{babyInfo.size}</b></span>
                    </div>

                    <div className="baby-metric-badge">
                      <Scale size={14} style={{ color: '#16a34a' }} />
                      <span>Peso aprox: <b>{babyInfo.weight}</b></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controle de Navegação de Semanas */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <div className="week-stepper-control">
                  <button
                    className="stepper-btn"
                    onClick={() => setViewedWeek((prev) => Math.max(1, prev - 1))}
                    disabled={viewedWeek <= 1}
                    title="Semana anterior"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 8px' }}>
                    Semana {viewedWeek} de 40
                  </span>

                  <button
                    className="stepper-btn"
                    onClick={() => setViewedWeek((prev) => Math.min(40, prev + 1))}
                    disabled={viewedWeek >= 40}
                    title="Próxima semana"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {isBrowsingOtherWeek && (
                  <button
                    onClick={() => setViewedWeek(currentWeek)}
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--accent)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Voltar para minha semana ({currentWeek})
                  </button>
                )}
              </div>
            </div>

            {/* Destaque do Desenvolvimento da Semana */}
            <div className="baby-highlight-quote">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginBottom: '4px', color: 'var(--primary)' }}>
                <Sparkles size={16} style={{ color: '#ca8a04' }} />
                <span>Marco de Desenvolvimento:</span>
              </div>
              <div>{babyInfo.highlight}</div>
            </div>

            {/* Barra de Progresso Geral da Gestação */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                <span>Progresso da Gestação</span>
                <span><b>{Math.round(progress)}%</b> (DPP: {dueDate.split('-').reverse().join('/')})</span>
              </div>

              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button
                onClick={() => {
                  setDueDate('');
                  storage.setSetting('due_date', '');
                }}
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Alterar Data Prevista do Parto
              </button>
            </div>
          </div>

          {/* Banner Rápido de Acesso às Contrações no 3º Trimestre */}
          {currentWeek >= 28 && (
            <div
              className="card"
              style={{
                backgroundColor: '#fff7ed',
                borderColor: '#fed7aa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '16px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ backgroundColor: '#ffedd5', padding: '10px', borderRadius: '50%', color: '#ea580c' }}>
                  <Timer size={22} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#9a3412' }}>
                    Você está na reta final!
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#c2410c' }}>
                    Monitore o ritmo das contrações de treinamento ou trabalho de parto com o nosso cronômetro.
                  </p>
                </div>
              </div>

              <Link to="/contractions" className="btn btn-primary" style={{ backgroundColor: '#ea580c', fontSize: '0.85rem', padding: '8px 14px' }}>
                Abrir Cronômetro
              </Link>
            </div>
          )}
        </>
      )}

      {/* Widgets Inferiores (Agenda e Checklist) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
        <div className="card">
          <div className="flex-row" style={{ marginBottom: '16px', color: 'var(--primary)' }}>
            <CalendarHeart size={22} />
            <h2 className="card-title" style={{ margin: 0 }}>Próximas Consultas</h2>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="card-text">Nenhum evento futuro agendado.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingEvents.map((ev) => (
                <div key={ev.id} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                  <div style={{ fontWeight: 600 }}>{ev.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent)', marginTop: '4px' }}>
                    {ev.date.split('-').reverse().join('/')} · {ev.type}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex-row" style={{ marginBottom: '16px', color: 'var(--primary)' }}>
            <ListChecks size={22} />
            <h2 className="card-title" style={{ margin: 0 }}>Tarefas Pendentes</h2>
          </div>
          {pendingTasks.length === 0 ? (
            <p className="card-text">Tudo em dia por aqui! ✅</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingTasks.map((task) => (
                <div key={task.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--danger)', flexShrink: 0 }}></div>
                  <span style={{ fontWeight: 500 }}>{task.title}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{task.category}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
