import { useState } from 'react';
import {
  X,
  Sparkles,
  Ear,
  Eye,
  Hand,
  UtensilsCrossed,
  Wind,
  HeartHandshake,
  Heart,
  Baby,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { getWeeklySensory } from '../data/weeklySensoryData';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import { fireSparkleBurst } from '../utils/confetti';

export default function WeeklySensoryModal({ week = 20, babyInfo = {}, onClose }) {
  const [activeTab, setActiveTab] = useState('senses'); // 'senses' | 'mom' | 'partner'
  const sensoryData = getWeeklySensory(week);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    soundSynthesizer.playPop();
  };

  const handleClose = () => {
    soundSynthesizer.playPop();
    if (onClose) onClose();
  };

  const SENSES_LIST = [
    {
      id: 'hearing',
      title: 'Audição & Sons',
      icon: Ear,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.1)',
      desc: sensoryData.hearing,
    },
    {
      id: 'vision',
      title: 'Visão & Olhinhos',
      icon: Eye,
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.1)',
      desc: sensoryData.vision,
    },
    {
      id: 'touch',
      title: 'Tato & Movimento',
      icon: Hand,
      color: '#ec4899',
      bg: 'rgba(236, 72, 153, 0.1)',
      desc: sensoryData.touchAndMotor,
    },
    {
      id: 'taste',
      title: 'Paladar & Deglutição',
      icon: UtensilsCrossed,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
      desc: sensoryData.tasteAndSwallow,
    },
    {
      id: 'lungs',
      title: 'Pulmões & Respiração',
      icon: Wind,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
      desc: sensoryData.lungsAndBreathing,
    },
  ];

  return (
    <div className="lightbox-overlay" onClick={handleClose}>
      <div
        className="lightbox-content"
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-xl)',
          maxWidth: '620px',
          width: '94%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Raio-X */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid var(--border)',
            background: 'linear-gradient(180deg, var(--accent-soft) 0%, var(--surface) 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--accent)',
                  color: '#ffffff',
                }}
              >
                Semana {week} • {sensoryData.phaseName}
              </span>
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: '1.45rem',
                fontWeight: 800,
                color: 'var(--primary)',
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>Raio-X & Sentidos do Bebê</span>
              <span style={{ fontSize: '1.2rem' }}>🔬</span>
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Comprimento: <b>{babyInfo.size || '~ cm'}</b> · Peso estimado: <b>{babyInfo.weight || '~ g'}</b>
            </p>
          </div>

          <button
            onClick={handleClose}
            className="btn-icon"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Barra de Abas Internas */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '12px 24px',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--bg-color)',
          }}
        >
          <button
            onClick={() => handleTabChange('senses')}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.18s ease',
              backgroundColor: activeTab === 'senses' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'senses' ? '#ffffff' : 'var(--text-muted)',
            }}
          >
            <Baby size={15} /> Sentidos do Bebê (5)
          </button>

          <button
            onClick={() => handleTabChange('mom')}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.18s ease',
              backgroundColor: activeTab === 'mom' ? '#ec4899' : 'transparent',
              color: activeTab === 'mom' ? '#ffffff' : 'var(--text-muted)',
            }}
          >
            <Heart size={15} /> Dica para a Mãe
          </button>

          <button
            onClick={() => handleTabChange('partner')}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.18s ease',
              backgroundColor: activeTab === 'partner' ? '#10b981' : 'transparent',
              color: activeTab === 'partner' ? '#ffffff' : 'var(--text-muted)',
            }}
          >
            <HeartHandshake size={15} /> Missão do Apoiador
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {/* ABA 1: OS 5 SENTIDOS */}
          {activeTab === 'senses' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {SENSES_LIST.map((sense) => {
                const IconComponent = sense.icon;
                return (
                  <div
                    key={sense.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius)',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: sense.bg,
                        color: sense.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconComponent size={20} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: 'var(--primary)',
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>{sense.title}</span>
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.85rem',
                          color: 'var(--text-main)',
                          lineHeight: '1.5',
                        }}
                      >
                        {sense.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ABA 2: DICA PARA A MÃE */}
          {activeTab === 'mom' && (
            <div
              style={{
                backgroundColor: 'rgba(236, 72, 153, 0.06)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                border: '1px solid rgba(236, 72, 153, 0.2)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: '#fce7f3',
                  color: '#db2777',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <Heart size={28} />
              </div>

              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#db2777',
                }}
              >
                Autocuidado Materno na Semana {week}
              </span>

              <h3
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  margin: '8px 0 14px',
                }}
              >
                O seu corpo está gerando uma vida mágica ✨
              </h3>

              <p
                style={{
                  fontSize: '0.95rem',
                  color: 'var(--text-main)',
                  lineHeight: '1.6',
                  maxWidth: '480px',
                  margin: '0 auto',
                }}
              >
                {sensoryData.momTip}
              </p>
            </div>
          )}

          {/* ABA 3: MISSÃO DO PARCEIRO / APOIADOR */}
          {activeTab === 'partner' && (
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.06)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: '#d1fae5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <HeartHandshake size={28} />
              </div>

              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#059669',
                }}
              >
                Apoio Ativo & Conexão
              </span>

              <h3
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  margin: '8px 0 14px',
                }}
              >
                Como ser o porto seguro nesta semana 🤝
              </h3>

              <p
                style={{
                  fontSize: '0.95rem',
                  color: 'var(--text-main)',
                  lineHeight: '1.6',
                  maxWidth: '480px',
                  margin: '0 auto',
                }}
              >
                {sensoryData.partnerMission}
              </p>
            </div>
          )}
        </div>

        {/* Rodapé com Fechar */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'var(--surface)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={handleClose}
            className="btn btn-primary"
            style={{ padding: '8px 20px', fontSize: '0.85rem' }}
          >
            Entendido, que lindo! 🌸
          </button>
        </div>
      </div>
    </div>
  );
}
