import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play, X, ChevronDown, ChevronUp, Sparkles, Heart } from 'lucide-react';
import { soundSynthesizer } from '../utils/soundSynthesizer';

const SOUND_TRACKS = [
  { id: 'heartbeat', name: 'Batimentos do Útero', emoji: '💓', color: '#ec4899', tag: '74 BPM' },
  { id: 'pink_noise', name: 'Ruído Rosa', emoji: '🌸', color: '#8b5cf6', tag: 'Calmante' },
  { id: 'rain', name: 'Chuva na Janela', emoji: '🌧️', color: '#0ea5e9', tag: 'Sono Profundo' },
  { id: 'ocean', name: 'Ondas do Oceano', emoji: '🌊', color: '#10b981', tag: 'Respiração' },
];

export default function AmbientSoundDock({ isPlaying, onTogglePlay, currentTrack = 'heartbeat', onSelectTrack }) {
  const [volume, setVolume] = useState(0.5);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedId, setSelectedId] = useState(currentTrack);

  useEffect(() => {
    setSelectedId(currentTrack);
  }, [currentTrack]);

  if (!isPlaying && !isExpanded) return null;

  const currentTrackObj = SOUND_TRACKS.find((t) => t.id === selectedId) || SOUND_TRACKS[0];

  const handleTrackChange = (id) => {
    setSelectedId(id);
    if (onSelectTrack) onSelectTrack(id);
    soundSynthesizer.playPop();
  };

  const handleVolume = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundSynthesizer.setVolume(val);
  };

  return (
    <div
      className="ambient-sound-dock"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        maxWidth: isExpanded ? '380px' : '320px',
        width: 'calc(100% - 48px)',
        borderRadius: isExpanded ? '20px' : '999px',
        background: 'var(--surface)',
        border: `1.5px solid ${currentTrackObj.color}`,
        boxShadow: `0 16px 36px -6px rgba(0, 0, 0, 0.18), 0 0 25px -4px ${currentTrackObj.color}40, inset 0 1px 0 0 rgba(255, 255, 255, 0.6)`,
        backdropFilter: 'blur(20px)',
        padding: isExpanded ? '14px 18px' : '8px 14px',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: isExpanded ? '12px' : '0',
        animation: 'slideUpDock 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Barra Principal Compacta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        {/* Indicador de Som & Equalizador */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1, minWidth: 0 }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: `${currentTrackObj.color}20`,
              color: currentTrackObj.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              flexShrink: 0,
            }}
          >
            {currentTrackObj.emoji}
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentTrackObj.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: currentTrackObj.color, fontWeight: 600 }}>
              {isPlaying ? 'Tocando em segundo plano • ' + currentTrackObj.tag : 'Pausado'}
            </div>
          </div>
        </div>

        {/* Barras do Equalizador Dançante */}
        {isPlaying && (
          <div
            className="mini-equalizer-bars"
            style={{ height: '16px', display: 'flex', alignItems: 'flex-end', gap: '2.5px', padding: '0 4px' }}
          >
            <span className="eq-bar eq-1" style={{ backgroundColor: currentTrackObj.color }} />
            <span className="eq-bar eq-2" style={{ backgroundColor: currentTrackObj.color }} />
            <span className="eq-bar eq-3" style={{ backgroundColor: currentTrackObj.color }} />
            <span className="eq-bar eq-1" style={{ backgroundColor: currentTrackObj.color, animationDelay: '0.4s' }} />
          </div>
        )}

        {/* Botão Play / Pause */}
        <button
          onClick={onTogglePlay}
          className="btn-icon"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: currentTrackObj.color,
            color: '#ffffff',
            boxShadow: `0 2px 8px ${currentTrackObj.color}60`,
            cursor: 'pointer',
            flexShrink: 0,
          }}
          title={isPlaying ? 'Pausar som' : 'Retomar som'}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: '2px' }} />}
        </button>

        {/* Alternar Expansão */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="btn-icon"
          style={{ width: '28px', height: '28px', color: 'var(--text-muted)' }}
          title={isExpanded ? 'Recolher mini player' : 'Expandir opções'}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {/* Painel Expandido: Troca Rápida de Sons & Volume */}
      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '6px', borderTop: '1px solid var(--border)' }}>
          {/* Seletor de Faixas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {SOUND_TRACKS.map((track) => (
              <button
                key={track.id}
                onClick={() => handleTrackChange(track.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 8px',
                  borderRadius: '10px',
                  border: `1px solid ${selectedId === track.id ? track.color : 'var(--border)'}`,
                  backgroundColor: selectedId === track.id ? `${track.color}15` : 'var(--surface-hover)',
                  color: selectedId === track.id ? track.color : 'var(--text-main)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{track.emoji}</span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.name}</span>
              </button>
            ))}
          </div>

          {/* Slider de Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Volume2 size={15} style={{ color: currentTrackObj.color }} />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolume}
              style={{ flex: 1, accentColor: currentTrackObj.color, height: '4px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', minWidth: '32px', textAlign: 'right' }}>
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
