import { useState, useRef, useEffect } from 'react';
import { Trash2, ImagePlus, X, ZoomIn, Sparkles, Images, BookOpen, Printer, Heart, Lightbulb, Camera, Smile } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { storage } from '../services/storage';
import { compressImage } from '../utils/imageCompressor';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import { fireHeartBurst, fireSparkleBurst } from '../utils/confetti';

const PHOTO_TAGS = {
  barriga: { label: '🤰 Barriguinha', bg: '#fdf2f8', color: '#db2777' },
  ultrassom: { label: '✨ Ultrassom', bg: '#eff6ff', color: '#2563eb' },
  enxoval: { label: '🧸 Enxoval & Quarto', bg: '#fefce8', color: '#ca8a04' },
  momento: { label: '💖 Momento Especial', bg: '#f0fdf4', color: '#16a34a' },
};

const EMOTION_MOODS = [
  { id: 'apaixonada', label: '🥰 Apaixonada' },
  { id: 'emocionada', label: '🥹 Emocionada' },
  { id: 'radiante', label: '✨ Radiante' },
  { id: 'cansadinha', label: '😴 Cansadinha' },
  { id: 'conexao', label: '🤰 Conexão Pura' },
  { id: 'chutinhos', label: '🦋 Chutinhos' },
];

const WRITING_PROMPTS = [
  { label: '🦋 Primeiro Chutinho', prompt: 'Hoje senti os primeiros movimentos do bebê! Foi como...' },
  { label: '✨ Momento Ultrassom', prompt: 'No ultrassom de hoje, vimos que o bebê estava...' },
  { label: '👨‍👩‍👧 Reação da Família', prompt: 'A reação mais carinhosa que recebemos hoje foi...' },
  { label: '🧸 Montando o Ninho', prompt: 'Escolhendo os detalhes do quartinho e enxoval...' },
  { label: '💌 Carta para o Futuro', prompt: 'Meu amor, quando você estiver lendo isto, quero que saiba que...' },
];

export default function Diary() {
  const [entries, setEntries] = useState(() => storage.getDiaryEntries());
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [image, setImage] = useState(null); // base64 string
  const [photoTag, setPhotoTag] = useState('barriga');
  const [selectedMood, setSelectedMood] = useState('apaixonada');
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
      const compressed = await compressImage(file, 1000, 1000, 0.75);
      setImage(compressed);
      soundSynthesizer.playCameraShutter();
      fireSparkleBurst(window.innerWidth / 2, 350);
    } catch (err) {
      alert('Erro ao processar imagem: ' + err.message);
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    soundSynthesizer.playPop();
  };

  const handleApplyPrompt = (promptText) => {
    soundSynthesizer.playPop();
    if (!title) {
      setTitle(promptText.slice(0, 45) + '...');
    }
    setContent((prev) => (prev ? `${prev}\n\n${promptText}` : promptText));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    storage.createDiaryEntry({
      title: title.trim(),
      content: content.trim(),
      date,
      image,
      tag: photoTag,
      mood: selectedMood,
    });

    setTitle('');
    setContent('');
    setImage(null);
    refresh();

    soundSynthesizer.playChime();
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      fireSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  };

  const handleDelete = (id) => {
    storage.deleteDiaryEntry(id);
    soundSynthesizer.playPop();
    refresh();
  };

  const handleHeartReaction = (e, id) => {
    soundSynthesizer.playHeartbeatMini();
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      fireHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  };

  const entriesWithPhotos = entries.filter((e) => e.image);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '6px' }}>Diário Afetivo de Gestação</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Guarde memórias, sentimentos e acompanhe a evolução da sua gravidez com fotos, batimentos e ultrassons.
          </p>
        </div>

        <NavLink
          to="/memory-book"
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
        >
          <Printer size={16} /> Álbum & Livro de Memórias (PDF)
        </NavLink>
      </div>

      {/* Formulário de Novo Registro */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="flex-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div className="flex-row" style={{ color: 'var(--primary)' }}>
            <Sparkles size={20} />
            <h2 className="card-title" style={{ margin: 0 }}>Nova Recordação Afetiva</h2>
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Suas memórias compõem o Livro de Impressão
          </span>
        </div>

        {/* Chips de Inspiração Rápida de Escrita */}
        <div style={{ marginBottom: '14px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
            <Lightbulb size={13} style={{ color: '#ca8a04' }} /> Ideias para inspirar seu relato de hoje:
          </span>
          <div className="diary-prompts-row">
            {WRITING_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="diary-prompt-chip"
                onClick={() => handleApplyPrompt(p.prompt)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleAdd}>
          {/* Seletor de Emoção / Sentimento do Momento */}
          <div style={{ marginBottom: '14px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Smile size={14} /> Como seu coração está se sentindo hoje?
            </label>
            <div className="diary-emotion-selector">
              {EMOTION_MOODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSelectedMood(m.id);
                    soundSynthesizer.playPop();
                  }}
                  className={`diary-emotion-btn ${selectedMood === m.id ? 'active' : ''}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-row" style={{ flexWrap: 'wrap', gap: '16px' }}>
            <div className="form-group" style={{ flex: '2 1 240px' }}>
              <label className="form-label">Título da Memória</label>
              <input
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Primeira vez sentindo o bebê mexer, Ultrassom 20 semanas..."
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
            <label className="form-label">Relato / Sintomas / Palavras para o Bebê</label>
            <textarea
              className="form-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Descreva este momento especial, novidades da consulta ou o que você sentiu quando colocou a mão na barriga..."
              style={{ minHeight: '110px' }}
              required
            />
          </div>

          {/* Seção de Upload de Imagem com Polaroid Preview */}
          <div className="form-group">
            <label className="form-label">Fotografia da Barriga ou Ultrassom (Opcional)</label>

            {!image ? (
              <div>
                <div
                  className="image-upload-box"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={32} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    {isCompressing ? 'Otimizando imagem...' : 'Clique para anexar foto da barriguinha ou ultrassom'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    JPG, PNG ou WEBP (armazenado com segurança no seu dispositivo)
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
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {/* Visualização de Estilo Polaroid */}
                  <div className="diary-polaroid-preview-card">
                    <img
                      src={image}
                      alt="Pré-visualização Polaroid"
                      style={{ width: '100%', height: '170px', objectFit: 'cover', borderRadius: '2px', display: 'block' }}
                    />
                    <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
                      ✨ {title || 'Pré-visualização Polaroid'}
                    </div>

                    <button
                      type="button"
                      className="image-remove-btn"
                      onClick={handleRemoveImage}
                      title="Remover foto"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="form-group" style={{ minWidth: '220px', flex: 1 }}>
                    <label className="form-label">Categoria da Fotografia</label>
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

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                      📸 As fotos com cantoneiras douradas e fita adesiva artesanal aparecem automaticamente formatadas no seu <b>Livro de Memórias</b>!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={isCompressing}
            style={{ marginTop: '8px', fontWeight: 600 }}
          >
            Guardar Recordação no Diário
          </button>
        </form>
      </div>

      {/* Alternador de Visualização (Lista vs Galeria) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '32px 0 16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              setActiveTab('list');
              soundSynthesizer.playPop();
            }}
            style={{
              padding: '8px 18px',
              borderRadius: '999px',
              border: '1px solid',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              backgroundColor: activeTab === 'list' ? 'var(--primary)' : 'var(--surface)',
              color: activeTab === 'list' ? '#fff' : 'var(--text-muted)',
              borderColor: activeTab === 'list' ? 'var(--primary)' : 'var(--border)',
            }}
          >
            <BookOpen size={16} /> Linha do Tempo ({entries.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('gallery');
              soundSynthesizer.playPop();
            }}
            style={{
              padding: '8px 18px',
              borderRadius: '999px',
              border: '1px solid',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              backgroundColor: activeTab === 'gallery' ? 'var(--primary)' : 'var(--surface)',
              color: activeTab === 'gallery' ? '#fff' : 'var(--text-muted)',
              borderColor: activeTab === 'gallery' ? 'var(--primary)' : 'var(--border)',
            }}
          >
            <Images size={16} /> Galeria de Fotografias ({entriesWithPhotos.length})
          </button>
        </div>
      </div>

      {/* Visualização em Lista / Linha do Tempo */}
      {activeTab === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {entries.length === 0 && (
            <div className="empty-state card">
              Nenhuma recordação cadastrada ainda. Escreva seu primeiro relato acima para começar a eternizar esta doce espera!
            </div>
          )}

          {entries.map((entry) => {
            const tagInfo = entry.tag ? PHOTO_TAGS[entry.tag] : (entry.photoTag ? PHOTO_TAGS[entry.photoTag] : null);
            const moodInfo = EMOTION_MOODS.find((m) => m.id === entry.mood);

            return (
              <div key={entry.id} className="card" style={{ marginBottom: 0, position: 'relative' }}>
                <div className="flex-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                      {tagInfo && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '12px',
                            backgroundColor: tagInfo.bg,
                            color: tagInfo.color,
                          }}
                        >
                          {tagInfo.label}
                        </span>
                      )}

                      {moodInfo && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '12px',
                            backgroundColor: 'var(--accent-soft)',
                            color: 'var(--accent)',
                          }}
                        >
                          {moodInfo.label}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                      {entry.title}
                    </h3>
                  </div>

                  <div className="flex-row" style={{ gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {entry.date ? entry.date.split('-').reverse().join('/') : ''}
                    </span>

                    {/* Botão de Amar com Efeito de Coração */}
                    <button
                      className="btn-icon"
                      onClick={(e) => handleHeartReaction(e, entry.id)}
                      title="Amar esta memória"
                      style={{ color: '#ec4899', padding: '4px' }}
                    >
                      <Heart size={18} fill="#ec4899" />
                    </button>

                    <button
                      className="btn-icon btn-danger-icon"
                      onClick={() => handleDelete(entry.id)}
                      title="Excluir relato"
                      style={{ padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p style={{ color: 'var(--text-main)', whiteSpace: 'pre-wrap', fontSize: '0.96rem', lineHeight: '1.65', margin: '0 0 12px' }}>
                  {entry.content}
                </p>

                {/* Imagem anexada com visual elegante */}
                {entry.image && (
                  <div
                    className="diary-entry-image-container"
                    onClick={() => {
                      soundSynthesizer.playCameraShutter();
                      setLightboxImage({
                        url: entry.image,
                        title: entry.title,
                        date: entry.date,
                        tag: tagInfo?.label,
                      });
                    }}
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
                        background: 'rgba(0, 0, 0, 0.65)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius)',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      <ZoomIn size={14} /> Ampliar Fotografia
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
              Nenhuma foto adicionada ainda. Anexe fotos da barriguinha ou ultrassons nas suas recordações para montar sua galeria!
            </div>
          ) : (
            <div className="photo-gallery-grid">
              {entriesWithPhotos.map((entry) => {
                const tagInfo = entry.tag ? PHOTO_TAGS[entry.tag] : (entry.photoTag ? PHOTO_TAGS[entry.photoTag] : null);

                return (
                  <div
                    key={entry.id}
                    className="gallery-card"
                    onClick={() => {
                      soundSynthesizer.playCameraShutter();
                      setLightboxImage({
                        url: entry.image,
                        title: entry.title,
                        date: entry.date,
                        tag: tagInfo?.label,
                      });
                    }}
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

      {/* Lightbox / Modal de Tela Cheia com Blur */}
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
