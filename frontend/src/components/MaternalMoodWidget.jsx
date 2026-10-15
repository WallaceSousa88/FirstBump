import { useState, useEffect } from 'react';
import { Sparkles, Heart, Smile } from 'lucide-react';
import { storage } from '../services/storage';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import { fireSparkleBurst, fireHeartBurst } from '../utils/confetti';

const MOODS = [
  {
    key: 'radiant',
    label: 'Radiante',
    emoji: '✨',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    tip: 'Aproveite essa luz incrível! Que tal tirar uma foto da barriguinha para o Diário de Bordo?',
  },
  {
    key: 'calm',
    label: 'Plena & Zen',
    emoji: '🧘',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    tip: 'Sua calma nutre o bebê com hormônios de paz e acolhimento. Respire fundo e aproveite esse momento.',
  },
  {
    key: 'tired',
    label: 'Cansadinha',
    emoji: '😴',
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.12)',
    tip: 'Seu corpo está construindo uma vida inteira. Descanse os pés elevados e permita-se uma boa soneca!',
  },
  {
    key: 'nauseous',
    label: 'Com Enjoo',
    emoji: '🍋',
    color: '#ca8a04',
    bg: 'rgba(202, 138, 4, 0.12)',
    tip: 'Pequenos goles de água bem gelada com limão ou biscoitinhos secos podem ajudar a amenizar a náusea.',
  },
  {
    key: 'energetic',
    label: 'Com Energia',
    emoji: '⚡',
    color: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.12)',
    tip: 'Dia perfeito para organizar um detalhe do enxoval ou fazer uma caminhada leve e refrescante!',
  },
  {
    key: 'emotional',
    label: 'Emotiva',
    emoji: '🧸',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.12)',
    tip: 'É puro amor transbordando e hormônios maternos em ação. Acolha suas emoções com muito carinho.',
  },
];

export default function MaternalMoodWidget() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedMood, setSelectedMood] = useState('');
  const [feedbackTip, setFeedbackTip] = useState('');

  useEffect(() => {
    const log = storage.getWellnessLog(todayStr);
    if (log && log.mood) {
      setSelectedMood(log.mood);
      const moodObj = MOODS.find((m) => m.key === log.mood);
      if (moodObj) setFeedbackTip(moodObj.tip);
    }
  }, [todayStr]);

  const handleSelectMood = (e, mood) => {
    setSelectedMood(mood.key);
    setFeedbackTip(mood.tip);

    // Salva no storage de bem-estar diário
    storage.saveWellnessLog(todayStr, { mood: mood.key });

    // Feedback sensorial
    soundSynthesizer.playPop();
    const rect = e.currentTarget.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    if (mood.key === 'radiant' || mood.key === 'energetic') {
      fireSparkleBurst(originX, originY);
    } else {
      fireHeartBurst(originX, originY);
    }
  };

  const activeMoodObj = MOODS.find((m) => m.key === selectedMood);

  return (
    <div
      className="card maternal-mood-card"
      style={{
        padding: '16px 20px',
        marginBottom: '20px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.15rem' }}>🌸</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-main)' }}>
            Check-in Maternal Diário
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Como você está se sentindo hoje?
          </span>
        </div>

        {activeMoodObj && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '999px',
              backgroundColor: activeMoodObj.bg,
              color: activeMoodObj.color,
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            <span>{activeMoodObj.emoji}</span>
            <span>Sentindo-se {activeMoodObj.label}</span>
          </div>
        )}
      </div>

      {/* Grade / Carrossel Horizontal de Emoções */}
      <div className="mood-pills-row" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
        {MOODS.map((m) => {
          const isSelected = selectedMood === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={(e) => handleSelectMood(e, m)}
              className={`mood-pill-btn ${isSelected ? 'selected' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '999px',
                border: isSelected ? `1.5px solid ${m.color}` : '1px solid var(--border)',
                backgroundColor: isSelected ? m.bg : 'var(--bg-color)',
                color: isSelected ? m.color : 'var(--text-main)',
                fontSize: '0.82rem',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: isSelected ? `0 2px 8px ${m.color}33` : 'none',
                transform: isSelected ? 'scale(1.03)' : 'scale(1)',
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dica Empática Instantânea */}
      {feedbackTip && (
        <div
          style={{
            marginTop: '12px',
            padding: '10px 14px',
            borderRadius: 'var(--radius)',
            backgroundColor: 'var(--accent-soft)',
            border: '1px solid rgba(var(--accent), 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.82rem',
            color: 'var(--text-main)',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <Heart size={16} style={{ color: 'var(--accent)', flexShrink: 0, fill: 'var(--accent)' }} />
          <span>{feedbackTip}</span>
        </div>
      )}
    </div>
  );
}
