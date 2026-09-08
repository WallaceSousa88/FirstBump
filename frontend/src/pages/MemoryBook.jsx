import { useState, useMemo } from 'react';
import { BookOpen, Printer, Edit3, Heart, Sparkles, Filter, Calendar, Camera, ArrowLeft } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { storage } from '../services/storage';

const PHOTO_TAGS = {
  barriga: { label: '🤰 Barriguinha', color: '#db2777' },
  ultrassom: { label: '✨ Ultrassom', color: '#2563eb' },
  enxoval: { label: '🧸 Enxoval & Quarto', color: '#ca8a04' },
  momento: { label: '💖 Momento Especial', color: '#16a34a' },
};

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

  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' (cronológica: início ao fim) | 'desc'
  const [tagFilter, setTagFilter] = useState('all');
  const [showConfig, setShowConfig] = useState(false);

  const handleSaveConfig = () => {
    storage.setSetting('book_title', bookTitle);
    storage.setSetting('baby_name', babyName);
    storage.setSetting('book_dedication', dedication);
    setShowConfig(false);
  };

  const handlePrint = () => {
    window.print();
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
          <h1 className="page-title" style={{ marginBottom: '6px' }}>Livro de Memórias do Bebê</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Visualização formatada para impressão e geração de álbum em PDF.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="btn"
            style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Edit3 size={16} /> Personalizar Capa & Dedicatória
          </button>

          <button
            onClick={handlePrint}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
          >
            <Printer size={18} /> Imprimir / Salvar Livro em PDF
          </button>
        </div>
      </div>

      {/* Painel de Configurações (Oculto na Impressão) */}
      {showConfig && (
        <div className="card no-print" style={{ backgroundColor: 'var(--accent-soft)', borderColor: 'var(--accent)', marginBottom: '24px' }}>
          <div className="flex-row" style={{ color: 'var(--primary)', marginBottom: '12px' }}>
            <Sparkles size={20} />
            <h2 className="card-title" style={{ margin: 0, fontSize: '1.05rem' }}>Personalizar Álbum de Memórias</h2>
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
              <label className="form-label">Nome do Bebê ou Dedicado a</label>
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
            <label className="form-label">Carta / Mensagem de Dedicatória</label>
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
              Salvar Configurações
            </button>
          </div>
        </div>
      )}

      {/* Barra de Filtros Rápidos (no-print) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        <div className="filter-pills-row" style={{ margin: 0 }}>
          <button
            onClick={() => setTagFilter('all')}
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
                onClick={() => setTagFilter(key)}
                className={`filter-pill ${tagFilter === key ? 'filter-pill-active' : ''}`}
              >
                {info.label} ({count})
              </button>
            );
          })}
        </div>

        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          📸 <b>{totalPhotos}</b> {totalPhotos === 1 ? 'foto no álbum' : 'fotos no álbum'}
        </span>
      </div>

      {/* FOLHA FORMATADA DO LIVRO DE MEMÓRIAS (PRONTA PARA IMPRESSÃO / PDF) */}
      <div className="memory-book-sheet">
        {/* CAPA DO LIVRO */}
        <div className="book-cover">
          <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>👶✨</div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1e3a8a', margin: '0 0 8px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            {bookTitle}
          </h1>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#db2777', margin: '0 0 16px' }}>
            Dedicado com todo amor a {babyName}
          </h2>
          <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Registro de Fotos, Sentimentos e Momentos da Gravidez
          </div>
          <div style={{ marginTop: '24px', fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
            Criado com FirstBump · {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>

        {/* PÁGINA DE DEDICATÓRIA */}
        {dedication.trim() && (
          <div className="book-dedication-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#db2777', fontWeight: 700, fontSize: '1rem', marginBottom: '8px' }}>
              <Heart size={18} /> Carta de Amor dos Pais
            </div>
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.7' }}>
              "{dedication}"
            </p>
          </div>
        )}

        {/* LISTAGEM CRONOLÓGICA DAS MEMÓRIAS */}
        {processedEntries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            Nenhuma memória registrada no diário ainda. Adicione relatos e fotos na aba <b>Diário</b> para montar seu livro!
          </div>
        ) : (
          <div>
            <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '24px', fontSize: '1.1rem', fontWeight: 700, color: '#1e3a8a' }}>
              📖 Nossa Linha do Tempo ({processedEntries.length} {processedEntries.length === 1 ? 'registro' : 'registros'})
            </div>

            {processedEntries.map((item, idx) => {
              const tagInfo = PHOTO_TAGS[item.tag] || PHOTO_TAGS.momento;
              const dateObj = new Date(item.date + 'T00:00:00');
              const dateFormatted = dateObj.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              });

              return (
                <div key={item.id || idx} className="book-memory-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e3a8a' }}>
                        #{idx + 1}
                      </span>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                        {item.title}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: 'var(--surface-hover)', color: tagInfo.color }}>
                        {tagInfo.label}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {dateFormatted}
                      </span>
                    </div>
                  </div>

                  {/* Foto da Memória (se houver) */}
                  {item.image && (
                    <div className="book-photo-frame">
                      <img src={item.image} alt={item.title} />
                    </div>
                  )}

                  {/* Relato e Sentimentos */}
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.65', margin: '10px 0 0', whiteSpace: 'pre-wrap' }}>
                    {item.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* PÁGINA FINAL DE ENCERRAMENTO */}
        <div style={{ textAlign: 'center', borderTop: '2px dashed #cbd5e1', paddingTop: '30px', marginTop: '40px', color: '#64748b', fontSize: '0.9rem' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>💖</div>
          <b>Fim deste capítulo... e o começo da nossa maior aventura!</b>
          <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
            {babyName} · Guardado com carinho no FirstBump
          </div>
        </div>
      </div>
    </div>
  );
}
