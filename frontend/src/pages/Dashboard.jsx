import { useEffect, useState, useMemo } from 'react';
import { storage } from '../services/storage';
import { getBabySize } from '../data/babySizes';
import { CalendarHeart, ListChecks, ChevronLeft, ChevronRight, Sparkles, Scale, Ruler, Timer, Calendar, Edit3, X, CheckCircle2, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

// Helper para somar/subtrair dias em formato YYYY-MM-DD
function addDays(dateStr, days) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return '';
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function formatDateBR(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export default function Dashboard() {
  const [dpp, setDpp] = useState('');
  const [dum, setDum] = useState('');

  // Formulário de Configuração / Edição
  const [formDpp, setFormDpp] = useState('');
  const [formDum, setFormDum] = useState('');
  const [isEditingDates, setIsEditingDates] = useState(false);

  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDays, setCurrentDays] = useState(0);
  const [viewedWeek, setViewedWeek] = useState(1);
  const [progress, setProgress] = useState(0);
  const [daysLeft, setDaysLeft] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);

  useEffect(() => {
    const savedDpp = storage.getSetting('dpp') || storage.getSetting('due_date');
    const savedDum = storage.getSetting('dum');

    let initialDpp = savedDpp?.value || '';
    let initialDum = savedDum?.value || '';

    // Se tiver apenas DUM, calcula a DPP
    if (initialDum && !initialDpp) {
      initialDpp = addDays(initialDum, 280);
    }
    // Se tiver apenas DPP, calcula a DUM
    if (initialDpp && !initialDum) {
      initialDum = addDays(initialDpp, -280);
    }

    if (initialDpp) {
      setDpp(initialDpp);
      setDum(initialDum);
      setFormDpp(initialDpp);
      setFormDum(initialDum);
      calculateGestationalAge(initialDpp, initialDum);
    }

    const today = new Date().toISOString().split('T')[0];
    const events = storage.getAgendaEvents();
    setUpcomingEvents(events.filter((e) => e.date >= today).slice(0, 2));

    const checklists = storage.getChecklists();
    setPendingTasks(checklists.filter((c) => !c.is_completed).slice(0, 3));
  }, []);

  // Cálculo da Idade Gestacional (Semanas + Dias) e Dias Restantes
  const calculateGestationalAge = (targetDpp, targetDum) => {
    const dppDate = new Date(targetDpp + 'T00:00:00');
    const dumDate = targetDum ? new Date(targetDum + 'T00:00:00') : new Date(dppDate.getTime() - 280 * 24 * 60 * 60 * 1000);
    const now = new Date();

    const diffDays = Math.floor((now - dumDate) / (1000 * 60 * 60 * 24));
    const calculatedWeek = Math.max(1, Math.min(40, Math.floor(diffDays / 7) || 1));
    const calculatedDay = Math.max(0, Math.min(6, diffDays % 7));

    // Dias restantes para o parto
    const diffToDpp = Math.ceil((dppDate - now) / (1000 * 60 * 60 * 24));
    setDaysLeft(diffToDpp > 0 ? diffToDpp : 0);

    setCurrentWeek(calculatedWeek);
    setCurrentDays(calculatedDay);
    setViewedWeek(calculatedWeek);
    setProgress(Math.min(100, Math.max(0, (calculatedWeek / 40) * 100)));
  };

  // Preenchimento Automático: Usuário alterou a DUM
  const handleDumChange = (val) => {
    setFormDum(val);
    if (val) {
      const calculatedDpp = addDays(val, 280); // Regra de Naegele (+280 dias / 40 semanas)
      setFormDpp(calculatedDpp);
    }
  };

  // Preenchimento Automático: Usuário alterou a DPP
  const handleDppChange = (val) => {
    setFormDpp(val);
    if (val) {
      const calculatedDum = addDays(val, -280); // DUM = DPP - 280 dias
      setFormDum(calculatedDum);
    }
  };

  // Salvar Datas no storage
  const handleSaveDates = (e) => {
    e.preventDefault();
    if (!formDpp) return;

    storage.setSetting('dpp', formDpp);
    storage.setSetting('due_date', formDpp);
    if (formDum) storage.setSetting('dum', formDum);

    setDpp(formDpp);
    setDum(formDum);
    calculateGestationalAge(formDpp, formDum);
    setIsEditingDates(false);
  };

  const babyInfo = getBabySize(viewedWeek);
  const isBrowsingOtherWeek = viewedWeek !== currentWeek;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Resumo da Gestação</h1>

        {dpp && (
          <button
            onClick={() => {
              setFormDpp(dpp);
              setFormDum(dum);
              setIsEditingDates(true);
            }}
            className="btn"
            style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Edit3 size={15} /> Alterar DUM / DPP
          </button>
        )}
      </div>

      {/* Modal / Card de Configuração Inicial de Datas */}
      {(!dpp || isEditingDates) && (
        <div className="card" style={{ backgroundColor: 'var(--accent-soft)', borderColor: 'var(--accent)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, fontSize: '1.1rem' }}>
              <Calendar size={20} style={{ color: 'var(--accent)' }} />
              <span>{dpp ? 'Atualizar Datas da Gestação' : 'Configuração Inicial da Gravidez 👋'}</span>
            </div>

            {dpp && (
              <button className="btn-icon" onClick={() => setIsEditingDates(false)}>
                <X size={18} />
              </button>
            )}
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '16px', lineHeight: '1.5' }}>
            Preencha a <b>DUM (Última Menstruação)</b> <u>ou</u> a <b>DPP (Data Prevista do Parto)</b>. Ao digitar uma, a outra é calculada <b>automaticamente pela Regra de Naegele (40 semanas)</b>!
          </p>

          <form onSubmit={handleSaveDates}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>
                  📅 DUM (Data da Última Menstruação)
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={formDum}
                  onChange={(e) => handleDumChange(e.target.value)}
                  placeholder="Primeiro dia do último ciclo"
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                  Calcula a DPP somando 280 dias
                </span>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>
                  👶 DPP (Data Prevista do Parto)
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={formDpp}
                  onChange={(e) => handleDppChange(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                  Calculada pelo médico ou ultrassom
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              {dpp && (
                <button type="button" onClick={() => setIsEditingDates(false)} className="btn" style={{ border: '1px solid var(--border)' }}>
                  Cancelar
                </button>
              )}
              <button className="btn btn-primary" type="submit" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} /> Salvar Datas
              </button>
            </div>
          </form>
        </div>
      )}

      {dpp && (
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

                    {dum && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        DUM: <b>{formatDateBR(dum)}</b>
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

                    {!isBrowsingOtherWeek && (
                      <div className="baby-metric-badge" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
                        <span>Idade exata: <b>{currentWeek} sem + {currentDays}d</b></span>
                      </div>
                    )}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
                <span>Progresso da Gestação: <b>{Math.round(progress)}%</b></span>
                <span>
                  {dum ? `DUM: ${formatDateBR(dum)} · ` : ''}
                  <b>DPP: {formatDateBR(dpp)}</b>
                </span>
              </div>

              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
              </div>
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
                    {formatDateBR(ev.date)} · {ev.type}
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
