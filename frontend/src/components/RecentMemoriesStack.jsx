import { useState } from 'react';
import { Camera, Sparkles, Plus, Image as ImageIcon, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fireHeartBurst } from '../utils/confetti';
import { soundSynthesizer } from '../utils/soundSynthesizer';

export default function RecentMemoriesStack({ diaryEntries = [] }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const photoEntries = diaryEntries
    .filter((entry) => entry.image)
    .slice(0, 4);

  const handlePhotoClick = (e, entry) => {
    const rect = e.currentTarget.getBoundingClientRect();
    fireHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    soundSynthesizer.playHeartbeatMini();
    setSelectedImage(entry);
  };

  if (photoEntries.length === 0) {
    return (
      <div
        className="card"
        style={{
          padding: '24px',
          marginBottom: '24px',
          background: 'var(--surface)',
          border: '1.5px dashed var(--border)',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-soft)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Camera size={24} />
          </div>
        </div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px 0' }}>
          Mural de Fotos & Ultrassons 📸
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 14px 0', maxWidth: '380px', marginInline: 'auto' }}>
          Guarde as primeiras fotos do barrigão e ultrassons para criar uma linha do tempo inesquecível!
        </p>
        <Link to="/diary" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
          <Plus size={16} /> Adicionar 1ª Foto no Diário
        </Link>
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        padding: '20px 24px',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)' }}>
            Galeria Afetiva
          </span>
          <h3 style={{ margin: '2px 0 0', fontSize: '1.2rem', fontWeight: 800 }}>
            Memórias & Ultrassons Recentes 📸
          </h3>
        </div>

        <Link
          to="/diary"
          style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'var(--accent)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          Ver Álbum Completo →
        </Link>
      </div>

      <div className="polaroid-stack-grid">
        {photoEntries.map((entry, idx) => {
          const rotation = idx % 2 === 0 ? '-2deg' : '2.5deg';
          return (
            <div
              key={entry.id || idx}
              onClick={(e) => handlePhotoClick(e, entry)}
              className="polaroid-card"
              style={{
                transform: `rotate(${rotation})`,
              }}
            >
              <div className="polaroid-img-wrapper">
                <img src={entry.image} alt={entry.title || 'Foto do Diário'} />
              </div>
              <div className="polaroid-caption">
                <span className="polaroid-week">{entry.week ? `${entry.week}ª Sem` : 'Diário'}</span>
                <span className="polaroid-title">{entry.title || 'Registro Especial'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Lightbox de Foto em Alta Definição */}
      {selectedImage && (
        <div className="photo-lightbox-backdrop" onClick={() => setSelectedImage(null)}>
          <div className="photo-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="photo-lightbox-close" onClick={() => setSelectedImage(null)}>
              <X size={20} />
            </button>
            <img src={selectedImage.image} alt="Memória" className="photo-lightbox-img" />
            <div className="photo-lightbox-details">
              <h4>{selectedImage.title || 'Registro de Gravidez'}</h4>
              <p>{selectedImage.content || ''}</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {selectedImage.date ? `Data: ${selectedImage.date}` : ''}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
