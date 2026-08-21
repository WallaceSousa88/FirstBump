import { useState, useRef, useEffect } from 'react';
import { Trash2, ImagePlus, X, ZoomIn, Sparkles, Images, BookOpen } from 'lucide-react';
import { storage } from '../services/storage';
import { compressImage } from '../utils/imageCompressor';

const PHOTO_TAGS = {
  barriga: { label: '🤰 Barriguinha', bg: '#fdf2f8', color: '#db2777' },
  ultrassom: { label: '✨ Ultrassom', bg: '#eff6ff', color: '#2563eb' },
  enxoval: { label: '🧸 Enxoval & Quarto', bg: '#fefce8', color: '#ca8a04' },
  momento: { label: '💖 Momento Especial', bg: '#f0fdf4', color: '#16a34a' },
};

export default function Diary() {
  const [entries, setEntries] = useState(() => storage.getDiaryEntries());
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [image, setImage] = useState(null); // base64 string
  const [photoTag, setPhotoTag] = useState('barriga');
  const [isCompressing, setIsCompressing] = useState(false);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'gallery'
  const [lightboxImage, setLightboxImage] = useState(null); // { url, title, date, tag }

  const fileInputRef = useRef(null);

  const refresh = () => setEntries(storage.getDiaryEntries());

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      // Comprime a foto no navegador antes de salvar no localStorage
      const compressed = await compressImage(file, 1000, 1000, 0.75);
      setImage(compressed);
    } catch (err) {
      alert('Erro ao processar imagem: ' + err.message);
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    storage.createDiaryEntry({
      title: title.trim(),
      content: content.trim(),
      date,
      image: image || null,
      photoTag: image ? photoTag : null,
    });

    setTitle('');
    setContent('');
    setImage(null);
    refresh();
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta recordação?')) {
      storage.deleteDiaryEntry(id);
      refresh();
    }
  };

  const entriesWithPhotos = entries.filter((e) => e.image);

  return (
    <div>
      <h1 className="page-title">Diário de Evolução</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
        Guarde memórias, sentimentos e acompanhe a evolução da sua gestação com fotos e ultrassons.
      </p>

      {/* Formulário de Novo Registro */}
      <div className="card">
        <div className="flex-row" style={{ marginBottom: '16px', color: 'var(--primary)' }}>
          <Sparkles size={20} />
          <h2 className="card-title" style={{ margin: 0 }}>Nova Recordação</h2>
        </div>

        <form onSubmit={handleAdd}>
          <div className="flex-row" style={{ flexWrap: 'wrap', gap: '16px' }}>
            <div className="form-group" style={{ flex: '2 1 240px' }}>
              <label className="form-label">Título</label>
              <input
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Primeira vez sentindo o bebê mexer, Ultrassom 20 sem..."
                required
              />
            </div>

            <div className="form-group" style={{ flex: '1 1 140px' }}>
              <label className="form-label">Data</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Relato / Sintomas / Sentimentos</label>
            <textarea
              className="form-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Descreva este momento especial, novidades da consulta ou como você se sentiu hoje..."
              required
            />
          </div>

          {/* Seção de Upload de Imagem */}
          <div className="form-group">
            <label className="form-label">Foto da Barriguinha / Ultrassom (Opcional)</label>

            {!image ? (
              <div>
                <div
                  className="image-upload-box"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus size={28} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                    {isCompressing ? 'Otimizando imagem...' : 'Clique para adicionar uma foto ou ultrassom'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    JPG, PNG ou WEBP (otimizado automaticamente)
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleImageSelect}
                />
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div className="image-preview-wrapper">
                    <img src={image} alt="Pré-visualização" className="image-preview-img" />
                    <button
                      type="button"
                      className="image-remove-btn"
                      onClick={handleRemoveImage}
                      title="Remover foto"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="form-group" style={{ minWidth: '200px' }}>
                    <label className="form-label">Tipo de Foto</label>
                    <select
                      className="form-input"
                      value={photoTag}
                      onChange={(e) => setPhotoTag(e.target.value)}
                    >
                      <option value="barriga">🤰 Foto da Barriguinha</option>
                      <option value="ultrassom">✨ Ultrassom</option>
                      <option value="enxoval">🧸 Enxoval & Quarto</option>
                      <option value="momento">💖 Momento Especial</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={isCompressing}
            style={{ marginTop: '8px' }}
          >
            Salvar Recordação
          </button>
        </form>
      </div>

      {/* Alternador de Visualização (Lista vs Galeria) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '32px 0 16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('list')}
            style={{
              padding: '8px 16px',
              borderRadius: '999px',
              border: '1px solid',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              backgroundColor: activeTab === 'list' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'list' ? '#fff' : 'var(--text-muted)',
              borderColor: activeTab === 'list' ? 'var(--primary)' : 'var(--border)',
            }}
          >
            <BookOpen size={16} /> Todos os Relatos ({entries.length})
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            style={{
              padding: '8px 16px',
              borderRadius: '999px',
              border: '1px solid',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              backgroundColor: activeTab === 'gallery' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'gallery' ? '#fff' : 'var(--text-muted)',
              borderColor: activeTab === 'gallery' ? 'var(--primary)' : 'var(--border)',
            }}
          >
            <Images size={16} /> Galeria de Fotos ({entriesWithPhotos.length})
          </button>
        </div>
      </div>

      {/* Visualização em Lista */}
      {activeTab === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {entries.length === 0 && (
            <div className="empty-state card">
              Nenhuma recordação cadastrada ainda. Escreva seu primeiro relato acima!
            </div>
          )}

          {entries.map((entry) => {
            const tagInfo = entry.photoTag ? PHOTO_TAGS[entry.photoTag] : null;

            return (
              <div key={entry.id} className="card" style={{ marginBottom: 0 }}>
                <div className="flex-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    {tagInfo && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          backgroundColor: tagInfo.bg,
                          color: tagInfo.color,
                          display: 'inline-block',
                          marginBottom: '6px',
                        }}
                      >
                        {tagInfo.label}
                      </span>
                    )}
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--primary)' }}>
                      {entry.title}
                    </h3>
                  </div>

                  <div className="flex-row">
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {entry.date ? entry.date.split('-').reverse().join('/') : ''}
                    </span>
                    <button
                      className="btn-icon btn-danger-icon"
                      onClick={() => handleDelete(entry.id)}
                      title="Excluir relato"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p style={{ color: 'var(--text-main)', whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  {entry.content}
                </p>

                {/* Imagem anexada */}
                {entry.image && (
                  <div
                    className="diary-entry-image-container"
                    onClick={() =>
                      setLightboxImage({
                        url: entry.image,
                        title: entry.title,
                        date: entry.date,
                        tag: tagInfo?.label,
                      })
                    }
                    title="Clique para ampliar"
                  >
                    <img
                      src={entry.image}
                      alt={entry.title}
                      className="diary-entry-image"
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        background: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius)',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <ZoomIn size={14} /> Ampliar
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Visualização em Galeria de Fotos */}
      {activeTab === 'gallery' && (
        <div>
          {entriesWithPhotos.length === 0 ? (
            <div className="empty-state card">
              Nenhuma foto adicionada ainda. Anexe fotos da barriguinha ou ultrassons nas suas recordações!
            </div>
          ) : (
            <div className="photo-gallery-grid">
              {entriesWithPhotos.map((entry) => {
                const tagInfo = entry.photoTag ? PHOTO_TAGS[entry.photoTag] : null;

                return (
                  <div
                    key={entry.id}
                    className="gallery-card"
                    onClick={() =>
                      setLightboxImage({
                        url: entry.image,
                        title: entry.title,
                        date: entry.date,
                        tag: tagInfo?.label,
                      })
                    }
                  >
                    <img src={entry.image} alt={entry.title} className="gallery-card-img" />
                    <div className="gallery-card-body">
                      {tagInfo && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: tagInfo.color,
                          }}
                        >
                          {tagInfo.label}
                        </span>
                      )}
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0, color: 'var(--primary)' }}>
                        {entry.title}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {entry.date.split('-').reverse().join('/')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Lightbox / Modal de Tela Cheia */}
      {lightboxImage && (
        <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="lightbox-close"
              onClick={() => setLightboxImage(null)}
            >
              <X size={24} /> Fechar
            </button>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              className="lightbox-img"
            />
            <div className="lightbox-caption">
              {lightboxImage.tag && <span>{lightboxImage.tag} • </span>}
              <strong>{lightboxImage.title}</strong> ({lightboxImage.date.split('-').reverse().join('/')})
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
