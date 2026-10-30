import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Clock, Sparkles, Heart, Waves, Info, ShieldCheck, Moon, Sun, Music, Zap, Sparkle } from 'lucide-react';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import { fireSparkleBurst } from '../utils/confetti';

const SOUNDS = [
  {
    id: 'heartbeat',
    name: 'Batimentos do Útero',
    emoji: '💓',
    color: '#ec4899',
    tag: 'Mais Eficaz para Recém-Nascidos',
    desc: 'Simula o ritmo cardíaco e o fluxo sanguíneo intrauterino (~74 BPM). Lembra o bebê do aconchego da barriga da mãe.',
  },
  {
    id: 'lullaby',
    name: 'Canção de Ninar & Caixinha de Música',
    emoji: '🌙',
    color: '#eab308',
    tag: 'Melodia Relaxante',
    desc: 'Arpejos pentatônicos suaves em timbres de caixa de música celeste. Acalma a mente e induz o sono profundo.',
  },
  {
    id: 'pink_noise',
    name: 'Ruído Rosa Suave',
    emoji: '🌸',
    color: '#8b5cf6',
    tag: 'Recomendado por Pediatras',
    desc: 'Som equilibrado com frequências graves acolhedoras. Mais suave e repousante que o ruído branco tradicional.',
  },
  {
    id: 'white_noise',
    name: 'Ruído Branco Puro',
    emoji: '📻',
    color: '#3b82f6',
    tag: 'Bloqueador de Sons',
    desc: 'Mascara barulhos repentinos da casa (portas, latidos, conversas) e estimula a transição para o sono REM.',
  },
  {
    id: 'rain',
    name: 'Chuva na Janela',
    emoji: '🌧️',
    color: '#0ea5e9',
    tag: 'Calmante Natural',
    desc: 'Gotas de chuva suaves em ritmo contínuo. Alivia o estresse e a ansiedade da gestante ao deitar.',
  },
  {
    id: 'ocean',
    name: 'Ondas do Oceano',
    emoji: '🌊',
    color: '#10b981',
    tag: 'Respiração & Meditação',
    desc: 'Cadência suave do vai-e-vem das ondas do mar a cada 7 segundos. Ideal para relaxamento muscular e trabalho de parto.',
  },
  {
    id: 'wind',
    name: 'Brisa da Floresta',
    emoji: '🍃',
    color: '#ca8a04',
    tag: 'Relaxamento Noturno',
    desc: 'Vento brando passando pelas folhas de árvores, desacelerando a mente para uma noite revigorante.',
  },
];

const TIMER_OPTIONS = [
  { label: 'Sem Timer (Infinito)', value: 0 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
];

const PRESETS = [
  { sound: 'heartbeat', timer: 45, volume: 0.65, label: '🍼 Sono do Bebê (Útero 45m)' },
  { sound: 'rain', timer: 30, volume: 0.7, label: '😴 Soneca da Gestante (Chuva 30m)' },
  { sound: 'lullaby', timer: 30, volume: 0.6, label: '✨ Caixinha de Ninar (30m)' },
  { sound: 'ocean', timer: 0, volume: 0.75, label: '🧘 Respiração & Parto (Mar)' },
];

export default function WhiteNoise() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSound, setSelectedSound] = useState('heartbeat');
  const [volume, setVolume] = useState(0.7);
  const [selectedTimer, setSelectedTimer] = useState(0); // minutos
  const [secondsRemaining, setSecondsRemaining] = useState(null);
  const [nightlightMode, setNightlightMode] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState(() =>
    new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );

  const timerRef = useRef(null);

  // Relógio noturno de baixa luminosidade
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTimeStr(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Manipulação de Áudio
  const handleTogglePlay = (e) => {
    if (isPlaying) {
      soundSynthesizer.stop();
      setIsPlaying(false);
      clearTimer();
      soundSynthesizer.playPop();
    } else {
      soundSynthesizer.setVolume(volume);
      soundSynthesizer.play(selectedSound);
      setIsPlaying(true);
      if (selectedTimer > 0) {
        startTimer(selectedTimer * 60);
      }
      if (e && e.currentTarget) {
        const rect = e.currentTarget.getBoundingClientRect();
        fireSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    }
  };

  const handleSelectSound = (soundId) => {
    setSelectedSound(soundId);
    soundSynthesizer.playPop();
    if (isPlaying) {
      soundSynthesizer.play(soundId);
    }
  };

  const handleApplyPreset = (preset, e) => {
    setSelectedSound(preset.sound);
    setSelectedTimer(preset.timer);
    setVolume(preset.volume);
    soundSynthesizer.setVolume(preset.volume);
    soundSynthesizer.play(preset.sound);
    setIsPlaying(true);
    if (preset.timer > 0) {
      startTimer(preset.timer * 60);
    } else {
      clearTimer();
    }
    soundSynthesizer.playChime();
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      fireSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundSynthesizer.setVolume(val);
  };

  const handleSelectTimer = (minutes) => {
    setSelectedTimer(minutes);
    soundSynthesizer.playPop();
    if (minutes === 0) {
      clearTimer();
    } else if (isPlaying) {
      startTimer(minutes * 60);
    }
  };

  const startTimer = (seconds) => {
    clearTimer();
    setSecondsRemaining(seconds);

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          soundSynthesizer.stop();
          setIsPlaying(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setSecondsRemaining(null);
  };

  // Limpa áudio e timers ao desmontar o componente
  useEffect(() => {
    return () => {
      soundSynthesizer.stop();
      clearTimer();
    };
  }, []);

  const formatTimerDisplay = (sec) => {
    if (sec === null) return '';
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentSoundObj = SOUNDS.find((s) => s.id === selectedSound) || SOUNDS[0];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '6px' }}>Ruído Branco & Sons do Útero</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Gerador acústico em tempo real e luz noturna de berçário para noites de sono serenas e alívio do recém-nascido.
          </p>
        </div>

        {/* Botão de Alternar Luz Noturna */}
        <button
          onClick={() => {
            setNightlightMode(!nightlightMode);
            soundSynthesizer.playPop();
          }}
          className="btn"
          style={{
            border: `1.5px solid ${nightlightMode ? '#f59e0b' : 'var(--border)'}`,
            background: nightlightMode ? '#78350f' : 'var(--surface)',
            color: nightlightMode ? '#fef3c7' : 'var(--text-main)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: nightlightMode ? '0 0 15px rgba(245, 158, 11, 0.4)' : 'none',
          }}
        >
          {nightlightMode ? <Sun size={17} style={{ color: '#fbbf24' }} /> : <Moon size={17} />}
          {nightlightMode ? '💡 Modo Luz Noturna Ativo (2700K)' : '🌙 Ativar Luz Noturna de Berçário'}
        </button>
      </div>

      {/* Chips de Atalhos e Presets Rápidos */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '18px', scrollbarWidth: 'thin' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
          <Zap size={14} style={{ color: 'var(--accent)' }} /> Presets Recomendados:
        </span>
        {PRESETS.map((p, idx) => (
          <button
            key={idx}
            onClick={(e) => handleApplyPreset(p, e)}
            className="filter-pill"
            style={{ fontSize: '0.78rem', padding: '4px 12px', whiteSpace: 'nowrap' }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* HERO PLAYER BOX COM AURA AMBIENTAL DINÂMICA */}
      <div className={`white-noise-hero aura-${selectedSound} ${nightlightMode ? 'white-noise-nightlight' : ''}`}>
        {/* Relógio Minimalista no Modo Noturno */}
        {nightlightMode && (
          <div>
            <div className="nightlight-clock-display">{currentTimeStr}</div>
            <span style={{ fontSize: '0.75rem', color: '#fcd34d', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Luz Quente Amiga da Melatonina (Zero Luz Azul)
            </span>
          </div>
        )}

        <div style={{ marginTop: nightlightMode ? '16px' : '0' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: '999px',
              backgroundColor: nightlightMode ? 'rgba(245, 158, 11, 0.2)' : 'var(--accent-soft)',
              color: nightlightMode ? '#fef08a' : 'var(--accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'inline-block',
              marginBottom: '12px',
            }}
          >
            {currentSoundObj.tag}
          </span>

          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--primary)', margin: '0 0 6px' }}>
            {currentSoundObj.emoji} {currentSoundObj.name}
          </h2>

          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 24px', lineHeight: '1.5' }}>
            {currentSoundObj.desc}
          </p>
        </div>

        {/* Botão Principal de Tocar / Pausar com Anel Pulsante Uterino */}
        <button
          onClick={handleTogglePlay}
          className={`sound-circle-btn ${isPlaying ? 'playing' : ''}`}
          style={{
            backgroundColor: isPlaying ? '#10b981' : currentSoundObj.color,
            boxShadow: isPlaying ? '0 0 35px rgba(16, 185, 129, 0.5)' : `0 8px 25px ${currentSoundObj.color}55`,
          }}
          title={isPlaying ? 'Pausar som' : 'Tocar som'}
        >
          {isPlaying ? <Pause size={38} /> : <Play size={38} style={{ marginLeft: '4px' }} />}
        </button>

        {/* Visualizador de Ondas Sonoras */}
        {isPlaying && (
          <div className="soundwave-visualizer">
            <div className="soundwave-bar" style={{ backgroundColor: currentSoundObj.color }} />
            <div className="soundwave-bar" style={{ backgroundColor: currentSoundObj.color }} />
            <div className="soundwave-bar" style={{ backgroundColor: currentSoundObj.color }} />
            <div className="soundwave-bar" style={{ backgroundColor: currentSoundObj.color }} />
            <div className="soundwave-bar" style={{ backgroundColor: currentSoundObj.color }} />
            <div className="soundwave-bar" style={{ backgroundColor: currentSoundObj.color }} />
            <div className="soundwave-bar" style={{ backgroundColor: currentSoundObj.color }} />
            <div className="soundwave-bar" style={{ backgroundColor: currentSoundObj.color }} />
          </div>
        )}

        {/* Controle de Volume & Timer */}
        <div style={{ maxWidth: '440px', margin: '24px auto 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: nightlightMode ? 'rgba(0,0,0,0.3)' : 'var(--surface)', padding: '10px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <button
              onClick={() => handleVolumeChange({ target: { value: volume > 0 ? 0 : 0.7 } })}
              style={{ color: 'var(--text-muted)' }}
              title="Mudo"
            >
              {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              style={{ flex: 1, accentColor: currentSoundObj.color, cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, minWidth: '35px', textAlign: 'right' }}>
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Seletor de Timer de Sono */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> Timer de Desligamento Automático
              </span>
              {secondsRemaining !== null && (
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10b981' }}>
                  ⏳ {formatTimerDisplay(secondsRemaining)} restantes
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {TIMER_OPTIONS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => handleSelectTimer(t.value)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '999px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    border: '1px solid',
                    backgroundColor: selectedTimer === t.value ? (nightlightMode ? '#f59e0b' : currentSoundObj.color) : (nightlightMode ? 'rgba(0,0,0,0.3)' : 'var(--surface)'),
                    color: selectedTimer === t.value ? '#ffffff' : 'var(--text-main)',
                    borderColor: selectedTimer === t.value ? (nightlightMode ? '#f59e0b' : currentSoundObj.color) : 'var(--border)',
                    transition: 'all 0.2s',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* GRID DE SONS DISPONÍVEIS */}
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '14px' }}>
        Biblioteca de Sons Relaxantes
      </h3>

      <div className="sound-card-grid">
        {SOUNDS.map((sound) => {
          const isSelected = selectedSound === sound.id;

          return (
            <div
              key={sound.id}
              className={`sound-card ${isSelected ? 'active' : ''}`}
              onClick={() => handleSelectSound(sound.id)}
              style={{
                borderColor: isSelected ? sound.color : 'var(--border)',
                boxShadow: isSelected ? `0 4px 16px ${sound.color}33` : 'var(--shadow-sm)',
              }}
            >
              <div className="sound-emoji-box" style={{ background: `${sound.color}18`, borderColor: sound.color }}>
                {sound.emoji}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {sound.name}
                  </h4>
                  {isSelected && isPlaying && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ● Tocando
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.75rem', color: sound.color, fontWeight: 600, marginTop: '2px' }}>
                  {sound.tag}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* GUIA PEDIÁTRICO: A CIÊNCIA DA EXTEROGESTAÇÃO */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="flex-row" style={{ color: 'var(--primary)', marginBottom: '12px' }}>
          <ShieldCheck size={20} style={{ color: '#10b981' }} />
          <h3 className="card-title" style={{ margin: 0, fontSize: '1.05rem' }}>
            A Ciência do Ruído Branco & Exterogestação
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
          <div style={{ background: 'var(--surface-hover)', padding: '14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
              🔊 O útero materno não era silencioso!
            </div>
            O bebê passou 9 meses ouvindo o fluxo sanguíneo das artérias e os batimentos cardíacos a cerca de 70 a 80 decibéis (o som equivalente a um aspirador de pó suave). O silêncio absoluto causa estranheza e insegurança ao recém-nascido.
          </div>

          <div style={{ background: 'var(--surface-hover)', padding: '14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
              💤 Como usar com segurança
            </div>
            Mantenha o aparelho celular a pelo menos <b>1 a 2 metros de distância do berço</b> em volume moderado e confortável. Use o timer de 30 a 60 minutos para auxiliar no adormecer sem criar dependência contínua.
          </div>
        </div>
      </div>
    </div>
  );
}
