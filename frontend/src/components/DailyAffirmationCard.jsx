import { useState } from 'react';
import { Sparkles, RefreshCw, Heart } from 'lucide-react';
import { MATERNAL_AFFIRMATIONS, getDailyAffirmation } from '../data/maternalAffirmations';
import { fireSparkleBurst } from '../utils/confetti';
import { soundSynthesizer } from '../utils/soundSynthesizer';

export default function DailyAffirmationCard() {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    return dayOfYear % MATERNAL_AFFIRMATIONS.length;
  });
  const [isFlipping, setIsFlipping] = useState(false);

  const affirmation = MATERNAL_AFFIRMATIONS[currentIndex];

  const handleNext = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    fireSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    soundSynthesizer.playPop();

    setIsFlipping(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % MATERNAL_AFFIRMATIONS.length);
      setIsFlipping(false);
    }, 200);
  };

  return (
    <div
      className="card maternal-affirmation-card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, var(--accent-soft) 100%)',
        border: '1px solid rgba(225, 29, 72, 0.15)',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '24px',
        padding: '20px 24px',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>{affirmation.emoji}</span>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--accent)',
            }}
          >
            Pílula de Carinho & Sabedoria
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '999px',
              backgroundColor: 'var(--surface)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}
          >
            {affirmation.tag}
          </span>
        </div>

        <button
          onClick={handleNext}
          className="btn-icon"
          title="Ver outra frase inspiradora"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--accent)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <RefreshCw size={14} className={isFlipping ? 'spin-anim' : ''} />
        </button>
      </div>

      <div
        style={{
          transition: 'opacity 0.2s ease, transform 0.2s ease',
          opacity: isFlipping ? 0 : 1,
          transform: isFlipping ? 'translateY(6px) scale(0.98)' : 'translateY(0) scale(1)',
        }}
      >
        <p
          style={{
            fontSize: '1.02rem',
            fontWeight: 600,
            lineHeight: 1.55,
            color: 'var(--text-main)',
            fontStyle: 'italic',
            margin: '0 0 8px 0',
          }}
        >
          "{affirmation.quote}"
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          <Heart size={12} style={{ color: 'var(--accent)', fill: 'var(--accent)' }} />
          <span>{affirmation.author}</span>
        </div>
      </div>
    </div>
  );
}
