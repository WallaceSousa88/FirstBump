import { Sparkles, CheckCircle2, Circle } from 'lucide-react';
import { fireSparkleBurst } from '../utils/confetti';
import { soundSynthesizer } from '../utils/soundSynthesizer';

const MILESTONES = [
  { week: 4, label: 'Nidação', emoji: '🌱', trimester: 1 },
  { week: 6, label: 'Coraçãozinho', emoji: '💓', trimester: 1 },
  { week: 12, label: 'Dedinhos & Rosto', emoji: '🖐️', trimester: 1 },
  { week: 16, label: 'Movimentos', emoji: '🦋', trimester: 2 },
  { week: 20, label: 'Morfológico (50%)', emoji: '🩻', trimester: 2 },
  { week: 24, label: 'Chutinhos Fortes', emoji: '🦶', trimester: 2 },
  { week: 28, label: 'Abre os Olhos', emoji: '👀', trimester: 3 },
  { week: 32, label: 'Ganha Peso Rápido', emoji: '🥥', trimester: 3 },
  { week: 37, label: 'Termo Precoce', emoji: '🍉', trimester: 3 },
  { week: 40, label: 'O Grande Dia! 🎂', emoji: '🎉', trimester: 3 },
];

export default function TrimesterJourneyMap({ currentWeek = 1, onSelectWeek }) {
  const handleMilestoneClick = (e, week) => {
    const rect = e.currentTarget.getBoundingClientRect();
    fireSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    soundSynthesizer.playPop();
    if (onSelectWeek) {
      onSelectWeek(week);
    }
  };

  const getTrimesterProgress = (startW, endW) => {
    if (currentWeek < startW) return 0;
    if (currentWeek >= endW) return 100;
    return Math.round(((currentWeek - startW) / (endW - startW)) * 100);
  };

  const t1Progress = getTrimesterProgress(1, 13);
  const t2Progress = getTrimesterProgress(14, 27);
  const t3Progress = getTrimesterProgress(28, 40);

  return (
    <div
      className="card trimester-map-card"
      style={{
        padding: '22px 24px',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)' }}>
            Mapa da Jornada
          </span>
          <h3 style={{ margin: '2px 0 0', fontSize: '1.2rem', fontWeight: 800 }}>
            Evolução dos 3 Trimestres 🗺️
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div className="trimester-pill-badge" style={{ opacity: currentWeek <= 13 ? 1 : 0.7 }}>
            <span>1º Trimestre: <b>{t1Progress}%</b></span>
          </div>
          <div className="trimester-pill-badge" style={{ opacity: currentWeek > 13 && currentWeek <= 27 ? 1 : 0.7 }}>
            <span>2º Trimestre: <b>{t2Progress}%</b></span>
          </div>
          <div className="trimester-pill-badge" style={{ opacity: currentWeek > 27 ? 1 : 0.7 }}>
            <span>3º Trimestre: <b>{t3Progress}%</b></span>
          </div>
        </div>
      </div>

      {/* Linha Conectora com Marcos */}
      <div className="milestones-track-container">
        <div className="milestones-track-line">
          <div
            className="milestones-track-progress"
            style={{ width: `${Math.min(100, Math.max(0, ((currentWeek - 1) / 39) * 100))}%` }}
          />
        </div>

        <div className="milestones-nodes-wrapper">
          {MILESTONES.map((m) => {
            const isCompleted = currentWeek >= m.week;
            const isCurrent = Math.abs(currentWeek - m.week) <= 1;

            return (
              <button
                key={m.week}
                onClick={(e) => handleMilestoneClick(e, m.week)}
                className={`milestone-node-btn ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                title={`Semana ${m.week}: ${m.label}`}
              >
                <span className="milestone-emoji">{m.emoji}</span>
                <span className="milestone-label">{m.label}</span>
                <span className="milestone-week">Sem {m.week}</span>
                {isCurrent && <span className="milestone-pulse-halo" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
