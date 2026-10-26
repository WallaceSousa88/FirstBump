import { useState, useMemo } from 'react';
import { BookOpen, Printer, Edit3, Heart, Sparkles, Filter, Calendar, Camera, ArrowLeft, Palette, X, ZoomIn } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { storage } from '../services/storage';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import { fireConfetti, fireSparkleBurst } from '../utils/confetti';

const PHOTO_TAGS = {
  barriga: { label: '🤰 Barriguinha', color: '#db2777' },
  ultrassom: { label: '✨ Ultrassom', color: '#2563eb' },
  enxoval: { label: '🧸 Enxoval & Quarto', color: '#ca8a04' },
  momento: { label: '💖 Momento Especial', color: '#16a34a' },
};

const ALBUM_THEMES = [
  {
    id: 'linho',
    name: '🌸 Linho & Rosé Gold',
    badge: 'Algodão Cru',
    border: '#e0a899',
    accent: '#b76e79',
    desc: 'Tons acolhedores de linho e acabamento rosé',
  },
  {
    id: 'salvia',
    name: '🌿 Sálvia & Eucalipto',
    badge: 'Botânico Sereno',
    border: '#86b29b',
    accent: '#2d5a43',
    desc: 'Frescor herbal botânico com toque de ouro sutil',
  },
  {
    id: 'imperial',
    name: '🏛️ Imperial Navy & Ouro',
    badge: 'Monograma Real',
    border: '#d4af37',
    accent: '#eab308',
    desc: 'Elegância nobre azul meia-noite com detalhes dourados',
  },
  {
    id: 'celeste',
    name: '☁️ Sonho Celeste & Lavanda',
    badge: 'Constelação',
    border: '#c4b5fd',
    accent: '#7c3aed',
    desc: 'Doçura etérea em lavanda pastel e estrelas',
  },
];

export default function MemoryBook() {
  const [entries] = useState(() => storage.getDiaryEntries());

  // Configurações do Livro
  const [bookTitle, setBookTitle] = useState(() => {
    const s = storage.getSetting('book_title');
    return s ? s.value : 'O Livro da Nossa Espera';
  });

  const [babyName, setBabyName] = useState(() => {
    const s = storage.getSetting('baby_name');
    return s ? s.value : 'Nosso Bebê';
  });

  const [dedication, setDedication] = useState(() => {
    const s = storage.getSetting('book_dedication');
    return s
      ? s.value
      : 'Para o nosso maior amor: cada página deste livro guarda a emoção, o carinho e os momentos inesquecíveis dos meses em que esperamos pela sua chegada. Você já era infinitamente amado antes mesmo de nascer.';
  });

  const [albumTheme, setAlbumTheme] = useState(() => {
    const s = storage.getSetting('book_theme');
    return s ? s.value : 'linho';
  });

  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' (cronológica: início ao fim) | 'desc'
  const [tagFilter, setTagFilter] = useState('all');
  const [showConfig, setShowConfig] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const handleSelectTheme = (themeId, e) => {
    setAlbumTheme(themeId);
    storage.setSetting('book_theme', themeId);
    soundSynthesizer.playPop();
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      fireSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  };

  const handleSaveConfig = () => {
    storage.setSetting('book_title', bookTitle);
    storage.setSetting('baby_name', babyName);
    storage.setSetting('book_dedication', dedication);
    storage.setSetting('book_theme', albumTheme);
    setShowConfig(false);
    soundSynthesizer.playChime();
    fireConfetti({ count: 40 });
  };

  const handlePrint = (e) => {
    soundSynthesizer.playChime();
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      fireConfetti({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, count: 65 });
    } else {
      fireConfetti({ count: 65 });
    }
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const handlePhotoClick = (photoUrl, title, e) => {
    soundSynthesizer.playCameraShutter();
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      fireSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
    setPreviewPhoto({ url: photoUrl, title });
  };

  // Filtragem e ordenação cronológica das memórias
  const processedEntries = useMemo(() => {
    let list = [...entries];

    if (tagFilter !== 'all') {
      list = list.filter((e) => e.tag === tagFilter);
    }

    list.sort((a, b) => {
      return sortOrder === 'asc'
        ? a.date.localeCompare(b.date)
        : b.date.localeCompare(a.date);
    });

    return list;
  }, [entries, tagFilter, sortOrder]);

  const totalPhotos = entries.filter((e) => e.image).length;

  // Letra inicial do monograma
  const monogramInitial = useMemo(() => {
    const clean = (babyName || 'B').trim();
    return clean.charAt(0).toUpperCase() || 'B';
  }, [babyName]);

  return (
    <div>
      {/* Barra Superior de Ações (Oculta na Impressão) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <NavLink to="/diary" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>
              <ArrowLeft size={16} /> Voltar ao Diário
            </NavLink>
          </div>
          <h1 className="page-title" style={{ marginBottom: '6px' }}>Álbum & Livro de Memórias do Bebê</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Scrapbook editorial pronto para leitura, impressão e exportação em PDF de alta resolução.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setShowConfig(!showConfig);
              soundSynthesizer.playPop();
            }}
            className="btn"
            style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Edit3 size={16} /> {showConfig ? 'Fechar Edição' : 'Personalizar Capa & Tema'}
          </button>

          <button
            onClick={handlePrint}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
          >
            <Printer size={18} /> Imprimir / Salvar Álbum em PDF
          </button>
        </div>
      </div>

      {/* Painel de Configurações do Álbum (Oculto na Impressão) */}
      {showConfig && (
        <div className="card no-print" style={{ backgroundColor: 'var(--accent-soft)', borderColor: 'var(--accent)', marginBottom: '24px' }}>
          <div className="flex-row" style={{ color: 'var(--primary)', marginBottom: '14px' }}>
            <Sparkles size={20} />
            <h2 className="card-title" style={{ margin: 0, fontSize: '1.05rem' }}>Personalizar Capa, Tema e Dedicatória</h2>
          </div>

          {/* Seletor Visual de Temas do Álbum */}
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Palette size={16} /> Estilo Editorial do Álbum
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              {ALBUM_THEMES.map((theme) => {
                const isSelected = albumTheme === theme.id;
                return (
                  <div
                    key={theme.id}
                    onClick={(e) => handleSelectTheme(theme.id, e)}
                    style={{
                      border: `2px solid ${isSelected ? theme.accent : 'var(--border)'}`,
                      borderRadius: 'var(--radius)',
                      padding: '12px',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--surface)' : 'var(--surface-hover)',
                      boxShadow: isSelected ? '0 4px 12px rgba(0, 0, 0, 0.08)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.88rem', color: isSelected ? theme.accent : 'var(--text-main)' }}>
                        {theme.name}
                      </strong>
                      {isSelected && <span style={{ fontSize: '0.75rem', color: theme.accent, fontWeight: 700 }}>✓ Ativo</span>}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                      {theme.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Título da Capa</label>
              <input
                className="form-input"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nome do Bebê (Monograma)</label>
              <input
                className="form-input"
                placeholder="Ex: Theo, Maya, Nosso Primeiro Amor"
                value={babyName}
                onChange={(e) => setBabyName(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Ordem das Memórias</label>
              <select className="form-input" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="asc">📅 Mais antigas primeiro (Cronológica)</option>
                <option value="desc">⏳ Mais recentes primeiro</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Carta / Mensagem de Dedicatória dos Pais</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: '90px' }}
              value={dedication}
              onChange={(e) => setDedication(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button onClick={() => setShowConfig(false)} className="btn" style={{ border: '1px solid var(--border)' }}>
              Cancelar
            </button>
            <button onClick={handleSaveConfig} className="btn btn-primary">
              Salvar Álbum
            </button>
          </div>
        </div>
      )}

      {/* Barra de Filtros Rápidos (no-print) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        <div className="filter-pills-row" style={{ margin: 0 }}>
          <button
            onClick={() => {
              setTagFilter('all');
              soundSynthesizer.playPop();
            }}
            className={`filter-pill ${tagFilter === 'all' ? 'filter-pill-active' : ''}`}
          >
            Todas as Memórias ({entries.length})
          </button>
          {Object.entries(PHOTO_TAGS).map(([key, info]) => {
            const count = entries.filter((e) => e.tag === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => {
                  setTagFilter(key);
                  soundSynthesizer.playPop();
                }}
                className={`filter-pill ${tagFilter === key ? 'filter-pill-active' : ''}`}
              >
                {info.label} ({count})
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            📸 <b>{totalPhotos}</b> {totalPhotos === 1 ? 'fotografia' : 'fotografias'} no álbum
          </span>
          <span style={{ fontSize: '0.82rem', padding: '3px 10px', borderRadius: '999px', background: 'var(--surface-hover)', border: '1px solid var(--border)', fontWeight: 600 }}>
            Tema: {ALBUM_THEMES.find((t) => t.id === albumTheme)?.name}
          </span>
        </div>
      </div>

      {/* FOLHA FORMATADA DO LIVRO DE MEMÓRIAS (PRONTA PARA IMPRESSÃO / PDF) */}
      <div className={`memory-book-sheet album-theme-${albumTheme}`}>
        {/* Fita Marcadora de Cetim Pendurada */}
        <div className="album-ribbon-bookmark" title="Marcador de Página em Cetim" />

        {/* CAPA DO LIVRO COM MONOGRAMA */}
        <div className="book-cover">
          {/* Selo Monograma Dourado */}
          <div className="baby-monogram-crest" title={`Monograma oficial de ${babyName}`}>
            {monogramInitial}
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0 0 10px', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
            {bookTitle}
          </h1>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--accent)', margin: '0 0 18px', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
            Dedicado com todo amor a {babyName}
          </h2>

          <div style={{ fontSize: '0.95rem', opacity: 0.85, maxWidth: '520px', margin: '0 auto', lineHeight: '1.6' }}>
            Registro Afetivo de Ultrassons, Sentimentos, Marcos e Fotografias da Nossa Doce Espera
          </div>

          <div style={{ marginTop: '28px', fontSize: '0.82rem', opacity: 0.7, fontStyle: 'italic', letterSpacing: '0.04em' }}>
            Edição Memorável · FirstBump · {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* PÁGINA DE DEDICATÓRIA DOS PAIS */}
        {dedication.trim() && (
          <div className="book-dedication-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontWeight: 700, fontSize: '1.05rem', marginBottom: '10px' }}>
              <Heart size={18} fill="currentColor" /> Carta de Amor dos Pais
            </div>
            <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.75', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
              "{dedication}"
            </p>
          </div>
        )}

        {/* LISTAGEM CRONOLÓGICA DAS MEMÓRIAS (SCRAPBOOK TIER) */}
        {processedEntries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <Camera size={36} style={{ opacity: 0.4, marginBottom: '8px' }} />
            <p style={{ fontSize: '1rem', margin: '0 0 4px', fontWeight: 600 }}>Nenhuma memória registrada ainda.</p>
            <span style={{ fontSize: '0.85rem' }}>Adicione relatos e fotos na aba <b>Diário</b> para compor automaticamente as páginas do seu álbum de gravidez!</span>
          </div>
        ) : (
          <div>
            <div style={{ borderBottom: '2px solid var(--border)', paddingBottom: '10px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                📖 Linha do Tempo da Gestação ({processedEntries.length} {processedEntries.length === 1 ? 'capítulo' : 'capítulos'})
              </span>
              <span style={{ fontSize: '0.85rem', opacity: 0.75 }}>
                {totalPhotos} {totalPhotos === 1 ? 'foto anexada' : 'fotos anexadas'}
              </span>
            </div>

            {processedEntries.map((item, idx) => {
              const tagInfo = PHOTO_TAGS[item.tag] || PHOTO_TAGS.momento;
              const dateObj = new Date(item.date + 'T00:00:00');
              const dateFormatted = dateObj.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              });

              // Alterna estilo de fita adesiva washi para sensação artesanal
              const tapeStyles = ['tape-left', 'tape-right', 'tape-center'];
              const currentTape = tapeStyles[idx % 3];

              return (
                <div key={item.id || idx} className="book-memory-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent)', opacity: 0.85 }}>
                        #{idx + 1}
                      </span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                        {item.title}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: 'var(--surface-hover)', color: tagInfo.color }}>
                        {tagInfo.label}
                      </span>
                      <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                        {dateFormatted}
                      </span>
                    </div>
                  </div>

                  {/* Foto da Memória montada como Polaroid com Fita Washi e Cantoneiras de Ouro */}
                  {item.image && (
                    <div className="book-scrapbook-mount">
                      {/* Fita Washi Tape Adesiva */}
                      <div className={`washi-tape-sticker ${currentTape}`} />

                      {/* Cantoneiras Metálicas de Ouro nos 4 Cantos */}
                      <div className="gold-photo-corner corner-tl" />
                      <div className="gold-photo-corner corner-tr" />
                      <div className="gold-photo-corner corner-bl" />
                      <div className="gold-photo-corner corner-br" />

                      <div
                        className="book-photo-frame"
                        onClick={(e) => handlePhotoClick(item.image, item.title, e)}
                        title="Clique para ver foto ampliada em tela cheia"
                      >
                        <img src={item.image} alt={item.title} />
                      </div>

                      <div className="polaroid-caption-tag">
                        ✨ {item.title} · {dateFormatted}
                      </div>
                    </div>
                  )}

                  {/* Relato e Sentimentos */}
                  <p style={{ fontSize: '0.98rem', lineHeight: '1.7', margin: '14px 0 0', whiteSpace: 'pre-wrap', opacity: 0.9 }}>
                    {item.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* PÁGINA FINAL DE ENCERRAMENTO EDITORIAL */}
        <div style={{ textAlign: 'center', borderTop: '2px dashed var(--border)', paddingTop: '36px', marginTop: '48px', opacity: 0.85 }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✨ 👶 🍼 ✨</div>
          <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '4px', fontFamily: 'Georgia, serif' }}>
            O fim da nossa espera... e o começo da maior história das nossas vidas!
          </strong>
          <div style={{ fontSize: '0.85rem', opacity: 0.75 }}>
            {babyName} · Guardado para sempre no FirstBump · {new Date().getFullYear()}
          </div>
        </div>
      </div>

      {/* Modal de Foto Ampliada (no-print) */}
      {previewPhoto && (
        <div
          className="no-print"
          onClick={() => setPreviewPhoto(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '85vh',
              background: '#000',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <button
              onClick={() => setPreviewPhoto(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0, 0, 0, 0.6)',
                border: 'none',
                color: 'white',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 2,
              }}
            >
              <X size={20} />
            </button>
            <img
              src={previewPhoto.url}
              alt={previewPhoto.title}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                display: 'block',
              }}
            />
            <div style={{ padding: '12px 18px', background: '#111827', color: 'white', fontSize: '0.9rem', textAlign: 'center', fontWeight: 600 }}>
              📸 {previewPhoto.title}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
