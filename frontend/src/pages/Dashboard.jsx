import { useEffect, useState, useMemo } from 'react';
import { storage } from '../services/storage';
import { useToast } from '../context/ToastContext';
import { getBabySize } from '../data/babySizes';
import { DIAPER_SIZES } from '../data/diaperData';
import {
  CalendarHeart,
  ListChecks,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Scale,
  Ruler,
  Timer,
  Calendar,
  Edit3,
  X,
  CheckCircle2,
  Footprints,
  Package,
  Camera,
  Stethoscope,
  Heart,
  BookOpen,
  ArrowRight,
  Droplets,
  Pill,
  Plus,
} from 'lucide-react';
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

  // Métricas dos outros módulos para o Bento Grid
  const [kickSessionsCount, setKickSessionsCount] = useState(0);
  const [lastKickSession, setLastKickSession] = useState(null);
  const [diaperStockPercentage, setDiaperStockPercentage] = useState(0);
  const [weightGain, setWeightGain] = useState(null);
  const [wellnessToday, setWellnessToday] = useState({ waterMl: 0, waterGoalMl: 2500, vitaminsTaken: [] });
  const [totalVitaminsCount, setTotalVitaminsCount] = useState(0);

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

    // Carrega dados de chutes
    const kicks = storage.getKickSessions();
    setKickSessionsCount(kicks.length);
    if (kicks.length > 0) {
      setLastKickSession(kicks[0]);
    }

    // Carrega dados de fraldas
    const inventory = storage.getDiaperInventory();
    const totalRecommendedPacks = DIAPER_SIZES.reduce((acc, d) => acc + d.recommendedPacks, 0);
    const totalCurrentPacks = Object.values(inventory).reduce((acc, count) => acc + (count || 0), 0);
    setDiaperStockPercentage(Math.min(100, Math.round((totalCurrentPacks / totalRecommendedPacks) * 100)));

    // Carrega dados de peso
    const weights = storage.getWeights();
    const preWeightSetting = storage.getSetting('pre_weight');
    if (weights.length > 0 && preWeightSetting?.value) {
      const pre = parseFloat(preWeightSetting.value);
      const current = parseFloat(weights[0].weight);
      const diff = current - pre;
      setWeightGain(diff >= 0 ? `+${diff.toFixed(1)} kg` : `${diff.toFixed(1)} kg`);
    }

    // Carrega dados de bem-estar / água / vitaminas
    loadWellnessData();
  }, []);

  const toast = useToast();

  const loadWellnessData = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const log = storage.getWellnessLog(todayStr);
    const vitamins = storage.getWellnessVitamins();
    setWellnessToday(log);
    setTotalVitaminsCount(vitamins.length);
  };

  const handleQuickAddWater = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const todayStr = new Date().toISOString().split('T')[0];
    const currentLog = storage.getWellnessLog(todayStr);
    const newTotal = (currentLog.waterMl || 0) + 200;
    storage.saveWellnessLog(todayStr, { waterMl: newTotal });
    loadWellnessData();
    toast.success('Mais 200ml de água registrados! 💧');
  };

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
    toast.success('Datas da gestação atualizadas com sucesso! 👶');
  };

  const babyInfo = getBabySize(viewedWeek);
  const isBrowsingOtherWeek = viewedWeek !== currentWeek;

  return (
    <div>
      {/* Topo do Painel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)' }}>
            Seu Acompanhamento Gestacional
          </span>
          <h1 className="page-title" style={{ margin: '2px 0 0', fontSize: '1.9rem', fontWeight: 800 }}>
            Olá, mamãe & papai! 👋
          </h1>
        </div>

        {dpp && (
          <button
            onClick={() => {
              setFormDpp(dpp);
              setFormDum(dum);
              setIsEditingDates(true);
            }}
            className="btn"
            style={{
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Edit3 size={15} style={{ color: 'var(--accent)' }} /> Alterar DUM / DPP
          </button>
        )}
      </div>

      {/* Modal / Card de Configuração Inicial de Datas */}
      {(!dpp || isEditingDates) && (
        <div className="card" style={{ backgroundColor: 'var(--accent-soft)', borderColor: 'var(--accent)', marginBottom: '24px', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 800, fontSize: '1.15rem' }}>
              <Calendar size={22} style={{ color: 'var(--accent)' }} />
              <span>{dpp ? 'Atualizar Datas da Gestação' : 'Configuração Inicial da Gravidez 🌸'}</span>
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
              <button className="btn btn-primary" type="submit" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <CheckCircle2 size={16} /> Salvar Datas
              </button>
            </div>
          </form>
        </div>
      )}

      {dpp && (
        <>
          {/* BENTO HERO CARD: Tamanho do Bebê & Semana */}
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
                        padding: '4px 12px',
                        borderRadius: '999px',
                        backgroundColor: 'var(--accent-soft)',
                        color: 'var(--accent)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {babyInfo.trimester}
                    </span>

                    {daysLeft !== null && !isBrowsingOtherWeek && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '4px 12px',
                          borderRadius: '999px',
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981',
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
                      <Ruler size={14} style={{ color: 'var(--accent)' }} />
                      <span>Comprimento: <b>{babyInfo.size}</b></span>
                    </div>

                    <div className="baby-metric-badge">
                      <Scale size={14} style={{ color: '#10b981' }} />
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

                  <span style={{ fontSize: '0.85rem', fontWeight: 700, padding: '0 8px' }}>
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
                      fontWeight: 700,
                    }}
                  >
                    Voltar para minha semana ({currentWeek})
                  </button>
                )}
              </div>
            </div>

            {/* Destaque do Desenvolvimento da Semana */}
            <div className="baby-highlight-quote">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '4px', color: 'var(--primary)' }}>
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

              <div className="progress-container" style={{ margin: 0 }}>
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>

          {/* BARRA DE ATALHOS RÁPIDOS (QUICK ACTIONS) */}
          <div className="quick-actions-bar">
            <Link to="/birth-announcement" className="quick-action-pill">
              <Sparkles size={16} style={{ color: '#db2777' }} />
              <span>Cartão Nascimento</span>
            </Link>

            <Link to="/wellness" className="quick-action-pill">
              <Droplets size={16} style={{ color: '#0284c7' }} />
              <span>Água & Vitaminas</span>
            </Link>

            <Link to="/diary" className="quick-action-pill">
              <Camera size={16} style={{ color: 'var(--accent)' }} />
              <span>Nova Foto / Relato</span>
            </Link>

            <Link to="/kicks" className="quick-action-pill">
              <Footprints size={16} style={{ color: '#ec4899' }} />
              <span>Contar Chutes</span>
            </Link>

            <Link to="/medical-summary" className="quick-action-pill">
              <Stethoscope size={16} style={{ color: '#10b981' }} />
              <span>Ficha Médica</span>
            </Link>

            <Link to="/calculator" className="quick-action-pill">
              <Package size={16} style={{ color: '#ca8a04' }} />
              <span>Estoque de Fraldas</span>
            </Link>

            <Link to="/memory-book" className="quick-action-pill">
              <BookOpen size={16} style={{ color: '#8b5cf6' }} />
              <span>Livro do Bebê</span>
            </Link>
          </div>

          {/* BENTO STATS ROW (5 CARDS / STATS GRID) */}
          <div className="bento-stats-grid">
            {/* Card 1: Hidratação Hoje */}
            <div className="bento-stat-card" style={{ position: 'relative' }}>
              <div className="bento-stat-header">
                <span className="bento-stat-label">Água Hoje</span>
                <div className="bento-stat-icon" style={{ backgroundColor: 'rgba(2, 132, 199, 0.15)', color: '#0284c7' }}>
                  <Droplets size={18} />
                </div>
              </div>
              <div className="bento-stat-value" style={{ color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>
                  {wellnessToday.waterMl || 0}{' '}
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                    / {wellnessToday.waterGoalMl || 2500} ml
                  </span>
                </span>
                <button
                  onClick={handleQuickAddWater}
                  className="btn-icon"
                  style={{
                    background: 'rgba(2, 132, 199, 0.15)',
                    color: '#0284c7',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    height: 'auto',
                  }}
                  title="Tomar 1 copo (+200ml)"
                >
                  <Plus size={13} /> 200ml
                </button>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {(wellnessToday.vitaminsTaken || []).length} de {totalVitaminsCount || 6} vitaminas tomadas
              </span>
            </div>

            {/* Card 2: Contagem Regressiva */}
            <div className="bento-stat-card">
              <div className="bento-stat-header">
                <span className="bento-stat-label">Contagem Regressiva</span>
                <div className="bento-stat-icon" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
                  <Calendar size={18} />
                </div>
              </div>
              <div className="bento-stat-value">
                {daysLeft !== null ? daysLeft : '---'} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>dias</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Previsto para {formatDateBR(dpp)}
              </span>
            </div>

            {/* Card 3: Chutes do Bebê */}
            <div className="bento-stat-card">
              <div className="bento-stat-header">
                <span className="bento-stat-label">Movimentos Fetais</span>
                <div className="bento-stat-icon" style={{ backgroundColor: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
                  <Footprints size={18} />
                </div>
              </div>
              <div className="bento-stat-value" style={{ color: '#db2777' }}>
                {kickSessionsCount} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>sessões</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {lastKickSession ? `Última: ${lastKickSession.kicksCount} chutes em ${Math.round(lastKickSession.durationSeconds / 60)}m` : 'Nenhum teste recente'}
              </span>
            </div>

            {/* Card 4: Estoque de Fraldas */}
            <div className="bento-stat-card">
              <div className="bento-stat-header">
                <span className="bento-stat-label">Estoque de Fraldas</span>
                <div className="bento-stat-icon" style={{ backgroundColor: 'rgba(202, 138, 4, 0.15)', color: '#ca8a04' }}>
                  <Package size={18} />
                </div>
              </div>
              <div className="bento-stat-value" style={{ color: '#ca8a04' }}>
                {diaperStockPercentage}% <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>garantido</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {diaperStockPercentage >= 100 ? '🎉 Meta atingida!' : 'Compradas & Chá de Bebê'}
              </span>
            </div>

            {/* Card 5: Evolução de Peso */}
            <div className="bento-stat-card">
              <div className="bento-stat-header">
                <span className="bento-stat-label">Ganho Ponderal</span>
                <div className="bento-stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  <Scale size={18} />
                </div>
              </div>
              <div className="bento-stat-value" style={{ color: '#10b981' }}>
                {weightGain ? weightGain : '---'}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {weightGain ? 'Evolução acumulada' : 'Acompanhe na Curva de Peso'}
              </span>
            </div>
          </div>

          {/* Banner Rápido de Acesso às Contrações no 3º Trimestre */}
          {currentWeek >= 28 && (
            <div
              className="card"
              style={{
                backgroundColor: 'rgba(234, 88, 12, 0.08)',
                borderColor: 'rgba(234, 88, 12, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '18px 22px',
                marginBottom: '24px',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ backgroundColor: 'rgba(234, 88, 12, 0.15)', padding: '12px', borderRadius: '50%', color: '#ea580c' }}>
                  <Timer size={24} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#9a3412' }}>
                    Você está na reta final da gestação! ⏰
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#c2410c' }}>
                    Monitore a duração e o intervalo das contrações em tempo real com a regra 5-1-1.
                  </p>
                </div>
              </div>

              <Link to="/contractions" className="btn btn-primary" style={{ backgroundColor: '#ea580c', fontSize: '0.85rem', padding: '8px 16px', fontWeight: 600 }}>
                Abrir Cronômetro
              </Link>
            </div>
          )}
        </>
      )}

      {/* Widgets Inferiores (Agenda e Checklist) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
            <div className="flex-row" style={{ color: 'var(--primary)' }}>
              <CalendarHeart size={20} style={{ color: 'var(--accent)' }} />
              <h2 className="card-title" style={{ margin: 0, fontSize: '1.05rem' }}>Próximas Consultas</h2>
            </div>
            <Link to="/agenda" style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 16px' }}>
              Nenhum evento futuro agendado. Adicione suas consultas na Agenda!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcomingEvents.map((ev) => (
                <div key={ev.id} style={{ padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface-hover)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{ev.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent)', marginTop: '4px', fontWeight: 500 }}>
                    {formatDateBR(ev.date)} · {ev.type}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
            <div className="flex-row" style={{ color: 'var(--primary)' }}>
              <ListChecks size={20} style={{ color: '#10b981' }} />
              <h2 className="card-title" style={{ margin: 0, fontSize: '1.05rem' }}>Tarefas da Maternidade</h2>
            </div>
            <Link to="/checklists" style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
              Ver listas <ArrowRight size={14} />
            </Link>
          </div>
          {pendingTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 16px' }}>
              Tudo em dia com a mala da maternidade e enxoval! 🎉
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingTasks.map((task) => (
                <div key={task.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface-hover)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--danger)', flexShrink: 0 }}></div>
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{task.title}</span>
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
