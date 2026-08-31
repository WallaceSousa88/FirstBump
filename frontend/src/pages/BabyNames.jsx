import { useState, useMemo } from 'react';
import { Sparkles, Heart, Search, Star, Plus, Trash2, Dices, Baby, CheckCircle2, X } from 'lucide-react';
import { storage } from '../services/storage';
import { BABY_NAMES } from '../data/babyNames';

const GENDER_BADGES = {
  menina: { label: 'Menina', emoji: '👧', color: '#db2777', bg: '#fdf2f8' },
  menino: { label: 'Menino', emoji: '👦', color: '#2563eb', bg: '#eff6ff' },
  unissex: { label: 'Unissex', emoji: '✨', color: '#7c3aed', bg: '#f5f3ff' },
};

const STYLES = [
  { key: 'all', label: 'Todos os Estilos' },
  { key: 'curto', label: 'Curtos & Marcantes ⚡' },
  { key: 'classico', label: 'Clássicos & Nobres 👑' },
  { key: 'biblico', label: 'Bíblicos & Históricos 📖' },
  { key: 'natureza', label: 'Inspirados na Natureza 🌿' },
  { key: 'moderno', label: 'Modernos & Em Alta 🔥' },
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function BabyNames() {
  const [favorites, setFavorites] = useState(() => storage.getFavoriteNames());
  const [customNames, setCustomNames] = useState(() => storage.getCustomNames());
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'favorites'

  // Filtros
  const [genderFilter, setGenderFilter] = useState('all'); // 'all' | 'menina' | 'menino' | 'unissex'
  const [styleFilter, setStyleFilter] = useState('all');
  const [letterFilter, setLetterFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sugestão aleatória da Roleta
  const [suggestedName, setSuggestedName] = useState(null);

  // Modal para novo nome personalizado
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customGender, setCustomGender] = useState('menina');
  const [customOrigin, setCustomOrigin] = useState('');
  const [customMeaning, setCustomMeaning] = useState('');

  const refreshFavorites = () => setFavorites(storage.getFavoriteNames());
  const refreshCustom = () => setCustomNames(storage.getCustomNames());

  // Combina banco de nomes padrão com os nomes personalizados criados pelo usuário
  const allAvailableNames = useMemo(() => {
    return [...BABY_NAMES, ...customNames];
  }, [customNames]);

  // Lista filtrada
  const filteredNames = useMemo(() => {
    return allAvailableNames.filter((item) => {
      // Filtro de Gênero
      if (genderFilter !== 'all' && item.gender !== genderFilter) return false;

      // Filtro de Estilo
      if (styleFilter !== 'all' && item.style !== styleFilter) return false;

      // Filtro de Letra Inicial
      if (letterFilter !== 'all' && !item.name.toUpperCase().startsWith(letterFilter)) return false;

      // Filtro de Busca por Texto (nome, significado ou origem)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesMeaning = item.meaning && item.meaning.toLowerCase().includes(query);
        const matchesOrigin = item.origin && item.origin.toLowerCase().includes(query);
        if (!matchesName && !matchesMeaning && !matchesOrigin) return false;
      }

      return true;
    });
  }, [allAvailableNames, genderFilter, styleFilter, letterFilter, searchQuery]);

  // Checa se um nome está favoritado
  const isFavorite = (nameStr) => {
    return favorites.some((f) => f.name.toLowerCase() === nameStr.toLowerCase());
  };

  const handleToggleFavorite = (nameObj) => {
    storage.toggleFavoriteName(nameObj);
    refreshFavorites();
  };

  const handleRatingChange = (nameStr, rating) => {
    storage.updateFavoriteName(nameStr, { rating });
    refreshFavorites();
  };

  const handleNotesChange = (nameStr, notes) => {
    storage.updateFavoriteName(nameStr, { notes });
    refreshFavorites();
  };

  // Gerador de Nomes Aleatórios
  const handleGenerateRandom = () => {
    const pool = filteredNames.length > 0 ? filteredNames : allAvailableNames;
    if (pool.length === 0) return;
    const randomIndex = Math.floor(Math.random() * pool.length);
    setSuggestedName(pool[randomIndex]);
  };

  // Adicionar Nome Customizado
  const handleAddCustomName = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newObj = {
      name: customName.trim(),
      gender: customGender,
      origin: customOrigin.trim() || 'Personalizada',
      meaning: customMeaning.trim() || 'Nome escolhido com muito carinho pela família.',
      style: 'moderno',
      popularity: 'Exclusivo da Família 💖',
    };

    storage.createCustomName(newObj);
    // Também adiciona automaticamente aos favoritos
    storage.toggleFavoriteName(newObj);

    setCustomName('');
    setCustomOrigin('');
    setCustomMeaning('');
    setShowCustomModal(false);
    refreshCustom();
    refreshFavorites();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '6px' }}>Guia & Gerador de Nomes</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Descubra significados, explore origens e monte a lista de nomes favoritos do seu bebê.
          </p>
        </div>

        <button
          onClick={() => setShowCustomModal(true)}
          className="btn"
          style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-main)' }}
        >
          <Plus size={16} /> Adicionar Nome Próprio
        </button>
      </div>

      {/* Alternador de Abas (Explorar vs Favoritos) */}
      <div style={{ display: 'flex', gap: '8px', margin: '20px 0 24px' }}>
        <button
          onClick={() => setActiveTab('explore')}
          style={{
            padding: '8px 18px',
            borderRadius: '999px',
            border: '1px solid',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            backgroundColor: activeTab === 'explore' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'explore' ? '#fff' : 'var(--text-muted)',
            borderColor: activeTab === 'explore' ? 'var(--primary)' : 'var(--border)',
          }}
        >
          <Sparkles size={16} /> Explorar Nomes ({allAvailableNames.length})
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          style={{
            padding: '8px 18px',
            borderRadius: '999px',
            border: '1px solid',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            backgroundColor: activeTab === 'favorites' ? '#ef4444' : 'transparent',
            color: activeTab === 'favorites' ? '#fff' : 'var(--text-muted)',
            borderColor: activeTab === 'favorites' ? '#ef4444' : 'var(--border)',
          }}
        >
          <Heart size={16} fill={activeTab === 'favorites' ? '#fff' : 'none'} /> Nossos Favoritos ({favorites.length})
        </button>
      </div>

      {/* ABA 1: EXPLORAR NOMES */}
      {activeTab === 'explore' && (
        <>
          {/* Card do Gerador / Roleta de Nomes */}
          <div className="names-generator-card">
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--surface)', padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, color: '#9333ea', marginBottom: '10px', boxShadow: 'var(--shadow-sm)' }}>
                <Sparkles size={14} /> Modo Inspiração & Roleta
              </div>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)', margin: '0 0 8px' }}>
                Em dúvida sobre qual nome escolher?
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 16px' }}>
                Gire a roleta e receba uma sugestão especial baseada nas suas preferências.
              </p>

              <button
                onClick={handleGenerateRandom}
                className="btn btn-primary"
                style={{ padding: '12px 24px', fontSize: '1rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Dices size={20} /> Sugerir um Nome Aleatório
              </button>

              {/* Resultado do Sorteio */}
              {suggestedName && (
                <div className="generator-result-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '999px',
                        backgroundColor: GENDER_BADGES[suggestedName.gender]?.bg,
                        color: GENDER_BADGES[suggestedName.gender]?.color,
                      }}
                    >
                      {GENDER_BADGES[suggestedName.gender]?.emoji} {GENDER_BADGES[suggestedName.gender]?.label}
                    </span>

                    <button
                      className={`fav-heart-btn ${isFavorite(suggestedName.name) ? 'fav-heart-active' : ''}`}
                      onClick={() => handleToggleFavorite(suggestedName)}
                      title={isFavorite(suggestedName.name) ? 'Remover dos favoritos' : 'Favoritar nome'}
                    >
                      <Heart size={22} fill={isFavorite(suggestedName.name) ? '#ef4444' : 'none'} />
                    </button>
                  </div>

                  <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary)', margin: '0 0 4px' }}>
                    {suggestedName.name}
                  </h3>

                  <div style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600, marginBottom: '8px' }}>
                    Origem: {suggestedName.origin} · {suggestedName.popularity}
                  </div>

                  <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', margin: 0, fontStyle: 'italic' }}>
                    "{suggestedName.meaning}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Barra de Busca e Filtros de Gênero */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {/* Campo de Busca */}
              <div style={{ position: 'relative', flex: '2 1 240px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="Buscar por nome, significado ou origem..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filtro de Gênero */}
              <div style={{ display: 'flex', gap: '6px', flex: '1 1 200px' }}>
                {[
                  { key: 'all', label: 'Todos' },
                  { key: 'menina', label: '👧 Meninas' },
                  { key: 'menino', label: '👦 Meninos' },
                  { key: 'unissex', label: '✨ Unissex' },
                ].map((g) => (
                  <button
                    key={g.key}
                    onClick={() => setGenderFilter(g.key)}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: 'var(--radius)',
                      border: '1px solid',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: genderFilter === g.key ? 'var(--primary)' : 'var(--surface)',
                      color: genderFilter === g.key ? '#fff' : 'var(--text-main)',
                      borderColor: genderFilter === g.key ? 'var(--primary)' : 'var(--border)',
                    }}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtros de Estilo */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {STYLES.map((st) => (
                <button
                  key={st.key}
                  onClick={() => setStyleFilter(st.key)}
                  className={`filter-pill ${styleFilter === st.key ? 'filter-pill-active' : ''}`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Barra Alfabética A-Z */}
            <div className="alphabet-filter-bar">
              <button
                onClick={() => setLetterFilter('all')}
                className={`alphabet-btn ${letterFilter === 'all' ? 'alphabet-btn-active' : ''}`}
                style={{ width: 'auto', padding: '0 8px' }}
              >
                Todas
              </button>
              {ALPHABET.map((letter) => (
                <button
                  key={letter}
                  onClick={() => setLetterFilter(letter)}
                  className={`alphabet-btn ${letterFilter === letter ? 'alphabet-btn-active' : ''}`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Nomes */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Exibindo <b>{filteredNames.length}</b> nomes encontrados
            </span>
          </div>

          {filteredNames.length === 0 ? (
            <div className="empty-state card">
              Nenhum nome encontrado com os filtros selecionados. Tente buscar por outra letra ou termo!
            </div>
          ) : (
            <div className="names-grid">
              {filteredNames.map((item) => {
                const isFav = isFavorite(item.name);
                const gender = GENDER_BADGES[item.gender] || GENDER_BADGES.unissex;

                return (
                  <div key={item.id || item.name} className="name-card">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '999px',
                            backgroundColor: gender.bg,
                            color: gender.color,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {gender.emoji} {gender.label}
                        </span>

                        <button
                          className={`fav-heart-btn ${isFav ? 'fav-heart-active' : ''}`}
                          onClick={() => handleToggleFavorite(item)}
                          title={isFav ? 'Remover dos favoritos' : 'Favoritar nome'}
                        >
                          <Heart size={20} fill={isFav ? '#ef4444' : 'none'} />
                        </button>
                      </div>

                      <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary)', margin: '8px 0 2px' }}>
                        {item.name}
                      </h3>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
                        Origem: {item.origin} {item.popularity ? `· ${item.popularity}` : ''}
                      </div>

                      <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.45', margin: 0 }}>
                        {item.meaning}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ABA 2: NOSSOS FAVORITOS */}
      {activeTab === 'favorites' && (
        <div>
          {favorites.length === 0 ? (
            <div className="empty-state card" style={{ padding: '40px 20px' }}>
              <Heart size={36} style={{ color: '#f87171', marginBottom: '12px' }} />
              <h3 style={{ margin: '0 0 6px', color: 'var(--primary)' }}>Nenhum nome favoritado ainda</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 16px' }}>
                Clique no ícone de coração nos nomes da aba "Explorar" para criar a lista de preferidos do casal e dar notas com estrelas!
              </p>
              <button onClick={() => setActiveTab('explore')} className="btn btn-primary">
                Explorar Nomes
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {favorites.map((fav, index) => {
                const gender = GENDER_BADGES[fav.gender] || GENDER_BADGES.unissex;

                return (
                  <div key={fav.name} className="card" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-muted)', width: '24px' }}>
                          #{index + 1}
                        </span>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                              {fav.name}
                            </h3>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '999px',
                                backgroundColor: gender.bg,
                                color: gender.color,
                              }}
                            >
                              {gender.emoji} {gender.label}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Origem: {fav.origin}
                          </div>
                        </div>
                      </div>

                      {/* Classificação com Estrelas */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="rating-stars-row">
                          {[1, 2, 3, 4, 5].map((starVal) => (
                            <button
                              key={starVal}
                              onClick={() => handleRatingChange(fav.name, starVal)}
                              className={`rating-star-btn ${starVal <= (fav.rating || 5) ? 'rating-star-active' : ''}`}
                              title={`Avaliar ${starVal} estrelas`}
                            >
                              <Star size={18} fill={starVal <= (fav.rating || 5) ? '#eab308' : 'none'} />
                            </button>
                          ))}
                        </div>

                        <button
                          className="btn-icon btn-danger-icon"
                          onClick={() => handleToggleFavorite(fav)}
                          title="Remover dos favoritos"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', margin: '10px 0 12px', lineHeight: '1.45' }}>
                      <b>Significado:</b> {fav.meaning}
                    </p>

                    {/* Campo de Anotações do Casal */}
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                      <input
                        className="form-input"
                        style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                        placeholder="Adicionar nota do casal (ex: 'Preferido da mamãe', 'Combina com o sobrenome'...)"
                        value={fav.notes || ''}
                        onChange={(e) => handleNotesChange(fav.name, e.target.value)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal para Adicionar Nome Personalizado */}
      {showCustomModal && (
        <div className="lightbox-overlay" onClick={() => setShowCustomModal(false)}>
          <div
            className="lightbox-content"
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '520px',
              width: '95%',
              padding: '24px',
              border: '1px solid var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={20} style={{ color: 'var(--accent)' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--primary)' }}>Cadastrar Nome Personalizado</h3>
              </div>

              <button className="btn-icon" onClick={() => setShowCustomModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCustomName}>
              <div className="form-group">
                <label className="form-label">Nome</label>
                <input
                  className="form-input"
                  placeholder="Ex: Liz Vitória, Ravi Lucca, Maya..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  required
                />
              </div>

              <div className="flex-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Gênero</label>
                  <select className="form-input" value={customGender} onChange={(e) => setCustomGender(e.target.value)}>
                    <option value="menina">👧 Menina</option>
                    <option value="menino">👦 Menino</option>
                    <option value="unissex">✨ Unissex</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Origem (Opcional)</label>
                  <input
                    className="form-input"
                    placeholder="Ex: Italiana, Hebraica..."
                    value={customOrigin}
                    onChange={(e) => setCustomOrigin(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Significado ou Motivo da Escolha</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '80px' }}
                  placeholder="Ex: Homenagem à vovó, significa alegria e luz..."
                  value={customMeaning}
                  onChange={(e) => setCustomMeaning(e.target.value)}
                />
              </div>

              <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: '8px' }}>
                Salvar e Adicionar aos Favoritos
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
