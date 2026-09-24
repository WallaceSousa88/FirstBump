import { useState, useEffect, useMemo } from 'react';
import { storage } from '../services/storage';
import {
  Droplets,
  Pill,
  Smile,
  Zap,
  CheckCircle2,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  Heart,
  Flame,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';

const COMMON_SYMPTOMS = [
  { id: 'nausea', label: '🤢 Enjoo / Náusea' },
  { id: 'heartburn', label: '🔥 Azia / Refluxo' },
  { id: 'swelling', label: '🦶 Inchaço nos Pés' },
  { id: 'cramps', label: '⚡ Cãibras' },
  { id: 'sleepy', label: '💤 Sonolência' },
  { id: 'backpain', label: '🦴 Dor Lombar' },
  { id: 'headache', label: '🤕 Dor de Cabeça' },
  { id: 'breasts', label: '🌸 Seios Sensíveis' },
  { id: 'dizziness', label: '💫 Tontura Leve' },
  { id: 'gas', label: '💨 Gases / Intestino' },
  { id: 'braxton', label: '🎈 Contrações de Treinamento' },
];

const MOODS = [
  { id: 'radiant', emoji: '🌟', label: 'Radiante' },
  { id: 'grateful', emoji: '🥰', label: 'Conectada' },
  { id: 'calm', emoji: '😊', label: 'Tranquila' },
  { id: 'tired', emoji: '😴', label: 'Cansada' },
  { id: 'nauseous', emoji: '🤢', label: 'Enjoada' },
  { id: 'emotional', emoji: '😭', label: 'Sensível' },
  { id: 'stressed', emoji: '🤯', label: 'Estressada' },
];

const WATER_GOAL_OPTIONS = [2000, 2500, 3000, 3500];

function getTodayStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  const formatted = date.toLocaleDateString('pt-BR', options);
  // Capitalize first letter
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function addDaysToDate(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const nextY = date.getFullYear();
  const nextM = String(date.getMonth() + 1).padStart(2, '0');
  const nextD = String(date.getDate()).padStart(2, '0');
  return `${nextY}-${nextM}-${nextD}`;
}

export default function WellnessTracker() {
  const todayStr = useMemo(() => getTodayStr(), []);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [vitaminsList, setVitaminsList] = useState([]);
  const [currentLog, setCurrentLog] = useState({
    date: todayStr,
    waterMl: 0,
    waterGoalMl: 2500,
    vitaminsTaken: [],
    vitaminsTimestamps: {},
    mood: '',
    energyLevel: 0,
    symptoms: [],
    notes: '',
  });

  const [allLogs, setAllLogs] = useState({});
  const [customMlInput, setCustomMlInput] = useState('');
  const [showCustomMlModal, setShowCustomMlModal] = useState(false);
  const [showAddVitaminModal, setShowAddVitaminModal] = useState(false);
  const [expandedTipId, setExpandedTipId] = useState(null);

  // Form para nova vitamina
  const [newVitaminForm, setNewVitaminForm] = useState({
    name: '',
    dosage: '',
    period: 'Manhã',
    benefits: '',
    tip: '',
  });

  // Carrega vitaminas e dados do log
  useEffect(() => {
    const vList = storage.getWellnessVitamins();
    setVitaminsList(vList);
    loadLogForDate(selectedDate);
    setAllLogs(storage.getWellnessLogs());
  }, [selectedDate]);

  const loadLogForDate = (date) => {
    const log = storage.getWellnessLog(date);
    setCurrentLog(log);
  };

  const updateCurrentLog = (partial) => {
    const updated = { ...currentLog, ...partial };
    setCurrentLog(updated);
    storage.saveWellnessLog(selectedDate, updated);
    setAllLogs(storage.getWellnessLogs());
  };

  // Funções de Água
  const handleAddWater = (amount) => {
    const newTotal = Math.max(0, (currentLog.waterMl || 0) + amount);
    updateCurrentLog({ waterMl: newTotal });
  };

  const handleCustomMlSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(customMlInput, 10);
    if (!isNaN(val) && val > 0) {
      handleAddWater(val);
      setCustomMlInput('');
      setShowCustomMlModal(false);
    }
  };

  const handleResetWater = () => {
    if (window.confirm('Deseja zerar a contagem de água deste dia?')) {
      updateCurrentLog({ waterMl: 0 });
    }
  };

  const handleChangeWaterGoal = (goal) => {
    updateCurrentLog({ waterGoalMl: goal });
  };

  // Funções de Vitaminas
  const handleToggleVitamin = (id) => {
    const currentTaken = currentLog.vitaminsTaken || [];
    const currentTimestamps = { ...(currentLog.vitaminsTimestamps || {}) };

    let newTaken;
    if (currentTaken.includes(id)) {
      newTaken = currentTaken.filter((item) => item !== id);
      delete currentTimestamps[id];
    } else {
      newTaken = [...currentTaken, id];
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      currentTimestamps[id] = timeStr;
    }

    updateCurrentLog({
      vitaminsTaken: newTaken,
      vitaminsTimestamps: currentTimestamps,
    });
  };

  const handleAddCustomVitamin = (e) => {
    e.preventDefault();
    if (!newVitaminForm.name.trim()) return;

    storage.addWellnessVitamin(newVitaminForm);
    setVitaminsList(storage.getWellnessVitamins());
    setNewVitaminForm({
      name: '',
      dosage: '',
      period: 'Manhã',
      benefits: '',
      tip: '',
    });
    setShowAddVitaminModal(false);
  };

  const handleDeleteVitamin = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta vitamina personalizada?')) {
      storage.deleteWellnessVitamin(id);
      setVitaminsList(storage.getWellnessVitamins());
    }
  };

  // Funções de Sintomas e Humor
  const handleToggleSymptom = (symptomId) => {
    const currentSymptoms = currentLog.symptoms || [];
    let newSymptoms;
    if (currentSymptoms.includes(symptomId)) {
      newSymptoms = currentSymptoms.filter((s) => s !== symptomId);
    } else {
      newSymptoms = [...currentSymptoms, symptomId];
    }
    updateCurrentLog({ symptoms: newSymptoms });
  };

  const handleSelectMood = (moodId) => {
    updateCurrentLog({ mood: currentLog.mood === moodId ? '' : moodId });
  };

  const handleSelectEnergy = (level) => {
    updateCurrentLog({ energyLevel: currentLog.energyLevel === level ? 0 : level });
  };

  // Cálculo de Porcentagens e Estatísticas
  const waterGoal = currentLog.waterGoalMl || 2500;
  const waterDrank = currentLog.waterMl || 0;
  const waterPercent = Math.min(100, Math.round((waterDrank / waterGoal) * 100));
  const waterRemaining = Math.max(0, waterGoal - waterDrank);

  const totalVitamins = vitaminsList.length;
  const takenVitaminsCount = (currentLog.vitaminsTaken || []).filter((id) =>
    vitaminsList.some((v) => v.id === id)
  ).length;

  // Cálculo de Streak Semanal
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const dStr = addDaysToDate(todayStr, -i);
      const log = allLogs[dStr] || { waterMl: 0, waterGoalMl: 2500, vitaminsTaken: [] };
      const goal = log.waterGoalMl || 2500;
      const pct = Math.min(100, Math.round(((log.waterMl || 0) / goal) * 100));
      const [y, m, d] = dStr.split('-');
      const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      const dayName = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      days.push({
        dateStr: dStr,
        dayNumber: d,
        dayName: dayName.toUpperCase(),
        percent: pct,
        waterMl: log.waterMl || 0,
        vitaminsCount: (log.vitaminsTaken || []).length,
        mood: log.mood || '',
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDate,
      });
    }
    return days;
  }, [allLogs, todayStr, selectedDate]);

  // Contagem de Streak de dias seguidos batendo a meta
  const consecutiveWaterDays = useMemo(() => {
    let count = 0;
    let checkDate = todayStr;
    while (true) {
      const log = allLogs[checkDate];
      if (log && log.waterMl >= (log.waterGoalMl || 2500)) {
        count++;
        checkDate = addDaysToDate(checkDate, -1);
      } else if (checkDate === todayStr && (!log || log.waterMl < (log?.waterGoalMl || 2500))) {
        // Se hoje ainda não bateu, checa se ontem bateu para manter o streak vivo
        const yesterdayLog = allLogs[addDaysToDate(todayStr, -1)];
        if (yesterdayLog && yesterdayLog.waterMl >= (yesterdayLog.waterGoalMl || 2500)) {
          checkDate = addDaysToDate(checkDate, -1);
          continue;
        } else {
          break;
        }
      } else {
        break;
      }
    }
    return count;
  }, [allLogs, todayStr]);

  const isCurrentDayToday = selectedDate === todayStr;

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header com Navegação de Data */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
            }}
          >
            <Droplets size={22} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
              Rastreador de Água & Vitaminas
            </h1>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Hidratação ideal e suporte nutricional diário para você e seu bebê 💧💊
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Navegação de Datas */}
      <div className="wellness-date-nav">
        <button
          className="btn btn-secondary"
          onClick={() => setSelectedDate(addDaysToDate(selectedDate, -1))}
          style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <ChevronLeft size={16} /> Dia Anterior
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
            {formatDateDisplay(selectedDate)}
          </div>
          {isCurrentDayToday ? (
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-soft)', padding: '2px 8px', borderRadius: '999px' }}>
              Hoje
            </span>
          ) : (
            <button
              onClick={() => setSelectedDate(todayStr)}
              style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Voltar para Hoje
            </button>
          )}
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => setSelectedDate(addDaysToDate(selectedDate, 1))}
          style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          Próximo Dia <ChevronRight size={16} />
        </button>
      </div>

      {/* Grid Principal: Água & Vitaminas */}
      <div className="wellness-grid">
        {/* COLUNA 1: Hidratação Diária */}
        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', fontWeight: 700, fontSize: '1.1rem' }}>
              <Droplets size={20} />
              <span>Meta de Hidratação</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Meta:</span>
              <select
                value={waterGoal}
                onChange={(e) => handleChangeWaterGoal(Number(e.target.value))}
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-main)',
                }}
              >
                {WATER_GOAL_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {(g / 1000).toFixed(1)} L
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Garrafa / Cilindro de Água com Nível Animado */}
          <div className="water-visualizer-container">
            <div className="water-bottle-cylinder">
              <div className="water-bottle-cap" />
              <div
                className="water-fill-level"
                style={{ height: `${Math.min(100, (waterDrank / waterGoal) * 100)}%` }}
              />
              <div className="water-bottle-text">
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {waterPercent}%
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {waterDrank} / {waterGoal} ml
                </div>
              </div>
            </div>

            {/* Status & Restante */}
            {waterDrank >= waterGoal ? (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <CheckCircle2 size={16} /> Meta alcançada hoje! 🎉
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Faltam <b>{waterRemaining} ml</b> para bater sua meta diária
              </div>
            )}
          </div>

          {/* Botões de Adição Rápida */}
          <div style={{ marginTop: 'auto' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              Registrar Consumo:
            </span>
            <div className="water-quick-grid">
              <button className="water-add-btn" onClick={() => handleAddWater(200)}>
                <span style={{ fontSize: '1.2rem' }}>🥤</span>
                <span>+200 ml</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Copo</span>
              </button>

              <button className="water-add-btn" onClick={() => handleAddWater(300)}>
                <span style={{ fontSize: '1.2rem' }}>☕</span>
                <span>+300 ml</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Caneca</span>
              </button>

              <button className="water-add-btn" onClick={() => handleAddWater(500)}>
                <span style={{ fontSize: '1.2rem' }}>🍶</span>
                <span>+500 ml</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Garrafinha</span>
              </button>

              <button className="water-add-btn" onClick={() => handleAddWater(1000)}>
                <span style={{ fontSize: '1.2rem' }}>🍼</span>
                <span>+1000 ml</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>1 Litro</span>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <button
                onClick={() => setShowCustomMlModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Plus size={14} /> Digitar valor livre
              </button>

              {waterDrank > 0 && (
                <button
                  onClick={handleResetWater}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  title="Zerar água do dia"
                >
                  <RotateCcw size={13} /> Zerar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* COLUNA 2: Vitaminas & Medicamentos */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontWeight: 700, fontSize: '1.1rem' }}>
                <Pill size={20} />
                <span>Vitaminas & Medicamentos</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {takenVitaminsCount} de {totalVitamins} tomadas hoje
              </span>
            </div>

            <button
              onClick={() => setShowAddVitaminModal(true)}
              className="btn btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={14} /> Personalizar
            </button>
          </div>

          {/* Barra de Progresso de Vitaminas */}
          <div style={{ height: '6px', width: '100%', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden', marginBottom: '16px' }}>
            <div
              style={{
                height: '100%',
                background: '#10b981',
                width: `${totalVitamins > 0 ? (takenVitaminsCount / totalVitamins) * 100 : 0}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          {/* Lista de Vitaminas */}
          <div className="vitamin-list">
            {vitaminsList.map((vitamin) => {
              const isTaken = (currentLog.vitaminsTaken || []).includes(vitamin.id);
              const timestamp = (currentLog.vitaminsTimestamps || {})[vitamin.id];
              const isExpandedTip = expandedTipId === vitamin.id;

              return (
                <div key={vitamin.id} className={`vitamin-card-item ${isTaken ? 'taken' : ''}`}>
                  <button
                    className={`vitamin-checkbox-btn ${isTaken ? 'checked' : ''}`}
                    onClick={() => handleToggleVitamin(vitamin.id)}
                    title={isTaken ? 'Desmarcar como tomada' : 'Marcar como tomada'}
                  >
                    {isTaken ? <Check size={20} strokeWidth={3} /> : <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--border)' }} />}
                  </button>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isTaken ? '#059669' : 'var(--text-main)' }}>
                        {vitamin.name}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                          {vitamin.period}
                        </span>
                        {!vitamin.isDefault && (
                          <button
                            onClick={() => handleDeleteVitamin(vitamin.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                            title="Remover vitamina"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Dosagem: <b>{vitamin.dosage}</b>
                    </div>

                    {isTaken && timestamp && (
                      <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={13} /> Tomado hoje às {timestamp}
                      </div>
                    )}

                    {vitamin.tip && (
                      <div style={{ marginTop: '6px' }}>
                        <button
                          onClick={() => setExpandedTipId(isExpandedTip ? null : vitamin.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '0.75rem',
                            color: 'var(--accent)',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 500,
                          }}
                        >
                          <Info size={13} /> {isExpandedTip ? 'Ocultar dica de absorção' : 'Ver dica de absorção'}
                        </button>

                        {isExpandedTip && (
                          <div
                            style={{
                              marginTop: '6px',
                              padding: '8px 10px',
                              borderRadius: 'var(--radius)',
                              background: 'var(--surface-hover)',
                              fontSize: '0.78rem',
                              lineHeight: '1.4',
                              color: 'var(--text-main)',
                              borderLeft: '3px solid var(--accent)',
                            }}
                          >
                            {vitamin.tip}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SEÇÃO 3: Bem-Estar Diário, Humor & Sintomas */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px' }}>
          <Smile size={20} style={{ color: 'var(--accent)' }} />
          <span>Como Você Está se Sentindo Hoje?</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Humor */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              Humor Predominante:
            </label>
            <div className="mood-grid">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  className={`mood-btn ${currentLog.mood === m.id ? 'active' : ''}`}
                  onClick={() => handleSelectMood(m.id)}
                >
                  <span style={{ fontSize: '1.4rem' }}>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Nível de Energia */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              Nível de Energia & Disposição:
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map((lvl) => {
                const isActive = (currentLog.energyLevel || 0) >= lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => handleSelectEnergy(lvl)}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      borderRadius: 'var(--radius)',
                      border: '1.5px solid var(--border)',
                      background: isActive ? 'rgba(234, 179, 8, 0.15)' : 'var(--surface)',
                      borderColor: isActive ? '#eab308' : 'var(--border)',
                      color: isActive ? '#ca8a04' : 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                      transition: 'all 0.2s',
                    }}
                    title={`Nível ${lvl} de energia`}
                  >
                    ⚡
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>😴 Exausta</span>
              <span>⚡ Cheia de Energia</span>
            </div>
          </div>
        </div>

        {/* Sintomas da Gravidez */}
        <div style={{ marginTop: '20px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            Sintomas Sentidos Hoje (toque para marcar):
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {COMMON_SYMPTOMS.map((symptom) => {
              const isSelected = (currentLog.symptoms || []).includes(symptom.id);
              return (
                <button
                  key={symptom.id}
                  className={`symptom-tag-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => handleToggleSymptom(symptom.id)}
                >
                  {symptom.label}
                  {isSelected && <Check size={14} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Nota Diária */}
        <div style={{ marginTop: '16px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            Anotações do Dia:
          </label>
          <textarea
            className="form-input"
            rows="2"
            placeholder="Como foram as refeições, exercícios ou momentos especiais com o bebê hoje..."
            value={currentLog.notes || ''}
            onChange={(e) => updateCurrentLog({ notes: e.target.value })}
            style={{ width: '100%', resize: 'vertical' }}
          />
        </div>
      </div>

      {/* SEÇÃO 4: Histórico & Streak dos Últimos 7 Dias */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, fontSize: '1.05rem' }}>
            <Calendar size={18} style={{ color: 'var(--accent)' }} />
            <span>Consistência dos Últimos 7 Dias</span>
          </div>

          {consecutiveWaterDays > 0 && (
            <div className="streak-badge">
              <Flame size={16} fill="#d97706" /> {consecutiveWaterDays} {consecutiveWaterDays === 1 ? 'dia' : 'dias'} de meta batida!
            </div>
          )}
        </div>

        <div className="streak-days-grid">
          {last7Days.map((day) => {
            const moodObj = MOODS.find((m) => m.id === day.mood);
            return (
              <div
                key={day.dateStr}
                className={`streak-day-card ${day.isToday ? 'today' : ''}`}
                style={{
                  cursor: 'pointer',
                  borderColor: day.isSelected ? 'var(--accent)' : undefined,
                  background: day.isSelected ? 'var(--accent-soft)' : undefined,
                }}
                onClick={() => setSelectedDate(day.dateStr)}
              >
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {day.dayName}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {day.dayNumber}
                </span>

                {/* Barra de água diária */}
                <div style={{ width: '100%', height: '36px', background: 'var(--surface-hover)', borderRadius: '4px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
                  <div
                    style={{
                      width: '100%',
                      height: `${day.percent}%`,
                      background: day.percent >= 100 ? '#10b981' : '#38bdf8',
                      transition: 'height 0.3s ease',
                    }}
                  />
                  <span style={{ position: 'absolute', width: '100%', textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-main)', bottom: '2px' }}>
                    {day.percent}%
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                  {moodObj ? moodObj.emoji : '·'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Box de Informações Médicas e Obstétricas */}
      <div
        className="card"
        style={{
          marginTop: '24px',
          backgroundColor: 'rgba(2, 132, 199, 0.05)',
          borderColor: 'rgba(2, 132, 199, 0.25)',
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ padding: '10px', borderRadius: '50%', background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', flexShrink: 0 }}>
          <Heart size={22} />
        </div>
        <div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: 700, color: '#0369a1' }}>
            Por que a água é tão vital na gravidez?
          </h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
            Durante a gestação, o volume de sangue materno se expande em até <b>45%</b> e o líquido amniótico é renovado pelo seu corpo a cada poucas horas. A hidratação adequada previne infecções urinárias, inchaços excessivos, constipação e até contrações prematuras de treinamento (Braxton Hicks).
          </p>
        </div>
      </div>

      {/* Modal: Digitar Quantidade de Água Livre */}
      {showCustomMlModal && (
        <div className="lightbox-overlay" onClick={() => setShowCustomMlModal(false)}>
          <div className="lightbox-content" style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', maxWidth: '380px', width: '90%', border: '1px solid var(--border)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)' }}>Adicionar Água</h3>
              <button className="btn-icon" onClick={() => setShowCustomMlModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCustomMlSubmit}>
              <div className="form-group">
                <label className="form-label">Quantidade em Mililitros (ml):</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Ex: 350"
                  value={customMlInput}
                  onChange={(e) => setCustomMlInput(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn" onClick={() => setShowCustomMlModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#0284c7' }}>
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adicionar Suplemento / Remédio Personalizado */}
      {showAddVitaminModal && (
        <div className="lightbox-overlay" onClick={() => setShowAddVitaminModal(false)}>
          <div className="lightbox-content" style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', maxWidth: '440px', width: '92%', border: '1px solid var(--border)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pill size={20} style={{ color: 'var(--accent)' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)' }}>Novo Suplemento / Remédio</h3>
              </div>
              <button className="btn-icon" onClick={() => setShowAddVitaminModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCustomVitamin}>
              <div className="form-group">
                <label className="form-label">Nome do Suplemento ou Medicamento *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Progesterona, Levotiroxina..."
                  value={newVitaminForm.name}
                  onChange={(e) => setNewVitaminForm({ ...newVitaminForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Dosagem</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: 200mg, 1 cp"
                    value={newVitaminForm.dosage}
                    onChange={(e) => setNewVitaminForm({ ...newVitaminForm, dosage: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Horário / Período</label>
                  <select
                    className="form-input"
                    value={newVitaminForm.period}
                    onChange={(e) => setNewVitaminForm({ ...newVitaminForm, period: e.target.value })}
                  >
                    <option value="Manhã">Manhã</option>
                    <option value="Tarde / Almoço">Tarde / Almoço</option>
                    <option value="Noite / Jantar">Noite / Jantar</option>
                    <option value="Em Jejum">Em Jejum</option>
                    <option value="Antes de Dormir">Antes de Dormir</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Dica de Absorção ou Instrução Médica</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Tomar 30 min antes do café em jejum"
                  value={newVitaminForm.tip}
                  onChange={(e) => setNewVitaminForm({ ...newVitaminForm, tip: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="btn" onClick={() => setShowAddVitaminModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar Suplemento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
