import { useState, useMemo, useEffect } from 'react';
import { Heart, X, Star, Sparkles, Volume2, RotateCcw, Filter, CheckCircle2, Award } from 'lucide-react';
import { storage } from '../services/storage';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import { fireHeartBurst, fireConfetti, fireSparkleBurst } from '../utils/confetti';

const GENDER_BADGES = {
  menina: { label: 'Menina', emoji: '👧', color: '#db2777', bg: '#fdf2f8' },
  menino: { label: 'Menino', emoji: '👦', color: '#2563eb', bg: '#eff6ff' },
  unissex: { label: 'Unissex', emoji: '✨', color: '#7c3aed', bg: '#f5f3ff' },
};

export default function BabyNameSwiper({ allNames = [], favorites = [], onToggleFavorite, onRatingChange }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(null); // 'left' | 'right' | 'up' | null
  const [genderFilter, setGenderFilter] = useState('all');
  const [history, setHistory] = useState([]); // [{ nameObj, action }]

  // Lista filtrada para o Swiper
  const deck = useMemo(() => {
    return allNames.filter((item) => {
      if (genderFilter !== 'all' && item.gender !== genderFilter) return false;
      return true;
    });
  }, [allNames, genderFilter]);

  // Reseta o índice ao mudar o filtro de gênero
  useEffect(() => {
    setCurrentIndex(0);
    setHistory([]);
  }, [genderFilter]);

  const currentCard = deck[currentIndex];
  const nextCard = deck[currentIndex + 1];

  const handleSpeak = (nameText) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(nameText);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePass = (e) => {
    if (!currentCard) return;
    setSlideDirection('left');
    soundSynthesizer.playPop();

    setHistory((prev) => [...prev, { card: currentCard, action: 'pass' }]);

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setSlideDirection(null);
    }, 280);
  };

  const handleLike = (e) => {
    if (!currentCard) return;
    setSlideDirection('right');
    soundSynthesizer.playPop();

    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      fireHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    } else {
      fireHeartBurst(window.innerWidth / 2, window.innerHeight / 2);
    }

    // Adiciona aos favoritos se não estiver
    const isFav = favorites.some((f) => f.name.toLowerCase() === currentCard.name.toLowerCase());
    if (!isFav && onToggleFavorite) {
      onToggleFavorite(currentCard);
    }

    setHistory((prev) => [...prev, { card: currentCard, action: 'like' }]);

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setSlideDirection(null);
    }, 280);
  };

  const handleSuperMatch = (e) => {
    if (!currentCard) return;
    setSlideDirection('up');
    soundSynthesizer.playChime();

    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      fireConfetti({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, count: 65 });
    } else {
      fireConfetti({ count: 65 });
    }

    // Adiciona aos favoritos com nota 5 estrelas
    if (onToggleFavorite) {
      onToggleFavorite(currentCard);
    }
    if (onRatingChange) {
      onRatingChange(currentCard.name, 5);
    }

    setHistory((prev) => [...prev, { card: currentCard, action: 'super' }]);

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setSlideDirection(null);
    }, 280);
  };

  const handleUndo = () => {
    if (history.length === 0 || currentIndex === 0) return;
    const lastAction = history[history.length - 1];

    // Se a última ação foi like ou super, remove dos favoritos
    if (lastAction.action === 'like' || lastAction.action === 'super') {
      const isFav = favorites.some((f) => f.name.toLowerCase() === lastAction.card.name.toLowerCase());
      if (isFav && onToggleFavorite) {
        onToggleFavorite(lastAction.card);
      }
    }

    setHistory((prev) => prev.slice(0, -1));
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    soundSynthesizer.playPop();
  };

  // Suporte a Teclas de Atalho (Esquerda, Direita, Cima)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePass();
      if (e.key === 'ArrowRight') handleLike();
      if (e.key === 'ArrowUp') handleSuperMatch();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentCard, deck]);

  const genderInfo = currentCard ? (GENDER_BADGES[currentCard.gender] || GENDER_BADGES.unissex) : null;
  const progressPercent = deck.length > 0 ? Math.round((currentIndex / deck.length) * 100) : 0;

  return (
    <div className="baby-swiper-container" style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
      {/* Topo do Swiper: Filtros de Gênero & Progresso */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { key: 'all', label: 'Todos' },
            { key: 'menina', label: '👧 Meninas' },
            { key: 'menino', label: '👦 Meninos' },
            { key: 'unissex', label: '✨ Unissex' },
          ].map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => setGenderFilter(g.key)}
              className={`filter-pill ${genderFilter === g.key ? 'filter-pill-active' : ''}`}
              style={{ fontSize: '0.78rem', padding: '4px 10px' }}
            >
              {g.label}
            </button>
          ))}
        </div>

        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {currentIndex} / {deck.length} avaliados
        </span>
      </div>

      {/* Barra de Progresso do Baralho */}
      <div className="progress-container" style={{ height: '5px', margin: '0 0 20px 0' }}>
        <div className="progress-bar" style={{ width: `${progressPercent}%`, backgroundColor: 'var(--accent)' }} />
      </div>

      {/* ÁREA DO CARD (TINDER STACK) */}
      <div className="swiper-card-stage" style={{ position: 'relative', minHeight: '380px' }}>
        {currentCard ? (
          <div
            className={`swiper-card ${slideDirection ? `slide-${slideDirection}` : ''}`}
            style={{
              position: 'relative',
              background: 'var(--surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1.5px solid var(--border)',
              padding: '32px 24px',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              transition: 'transform 0.28s ease-out, opacity 0.28s ease-out',
            }}
          >
            {/* Tag de Gênero & Popularidade */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: '999px',
                  backgroundColor: genderInfo.bg,
                  color: genderInfo.color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>{genderInfo.emoji}</span>
                <span>{genderInfo.label}</span>
              </span>

              {currentCard.popularity && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '4px 12px',
                    borderRadius: '999px',
                    backgroundColor: 'var(--accent-soft)',
                    color: 'var(--accent)',
                  }}
                >
                  {currentCard.popularity}
                </span>
              )}
            </div>

            {/* Nome em Destaque Editorial */}
            <h2
              style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                color: 'var(--primary)',
                letterSpacing: '-0.03em',
                margin: '0 0 8px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
            >
              <span>{currentCard.name}</span>
              <button
                type="button"
                onClick={() => handleSpeak(currentCard.name)}
                className="btn-icon"
                title="Ouvir pronúncia do nome"
                style={{ width: '36px', height: '36px', color: 'var(--accent)', backgroundColor: 'var(--accent-soft)', borderRadius: '50%' }}
              >
                <Volume2 size={18} />
              </button>
            </h2>

            {/* Origem */}
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px' }}>
              Origem {currentCard.origin || 'Universal'}
            </span>

            {/* Significado Poético */}
            <div
              style={{
                padding: '16px 20px',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--bg-color)',
                border: '1px solid var(--border)',
                width: '100%',
                margin: '0 0 16px 0',
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: '4px' }}>
                Significado do Nome
              </div>
              <p style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-main)', margin: 0, lineHeight: 1.5 }}>
                "{currentCard.meaning}"
              </p>
            </div>

            {/* Atalhos de teclado */}
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Dica: Use as setas do teclado ⬅️ Passar | ➡️ Amei | ⬆️ Super Match
            </span>
          </div>
        ) : (
          /* Fim do Baralho */
          <div
            className="card"
            style={{
              padding: '48px 24px',
              borderRadius: 'var(--radius-xl)',
              textAlign: 'center',
              backgroundColor: 'var(--surface)',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px 0' }}>
              Você avaliou todos os nomes!
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Foram {deck.length} nomes analisados. Confira os seus preferidos na aba <b>Meus Favoritos</b>!
            </p>
            <button
              onClick={() => {
                setCurrentIndex(0);
                setHistory([]);
              }}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <RotateCcw size={16} /> Reiniciar Baralho
            </button>
          </div>
        )}
      </div>

      {/* BOTÕES DE CONTROLE INTERATIVOS */}
      {currentCard && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '18px', marginTop: '24px' }}>
          {/* Botão Desfazer */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length === 0}
            className="btn-icon swiper-action-undo"
            title="Desfazer última decisão"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              boxShadow: 'var(--shadow-sm)',
              opacity: history.length === 0 ? 0.4 : 1,
              cursor: history.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <RotateCcw size={18} />
          </button>

          {/* Botão Passar ❌ */}
          <button
            type="button"
            onClick={handlePass}
            className="btn-icon swiper-action-pass"
            title="Passar para o próximo (Seta Esquerda)"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              border: '2px solid #ef4444',
              color: '#dc2626',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <X size={28} strokeWidth={2.8} />
          </button>

          {/* Botão Super Match ⭐ */}
          <button
            type="button"
            onClick={handleSuperMatch}
            className="btn-icon swiper-action-super"
            title="Super Match! 5 Estrelas (Seta Cima)"
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: '#fef9c3',
              border: '2px solid #eab308',
              color: '#ca8a04',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <Star size={24} fill="#eab308" />
          </button>

          {/* Botão Amei 💖 */}
          <button
            type="button"
            onClick={handleLike}
            className="btn-icon swiper-action-like"
            title="Amei! Salvar nos Favoritos (Seta Direita)"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#fce7f3',
              border: '2px solid #ec4899',
              color: '#db2777',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <Heart size={28} fill="#db2777" />
          </button>
        </div>
      )}
    </div>
  );
}
