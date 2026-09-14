import { useState, useMemo } from 'react';
import { Sparkles, Heart, Search, Star, Plus, Trash2, Dices, Baby, CheckCircle2, X, UserCheck, Award, Plane, Briefcase, GraduationCap, Volume2, Bookmark, Check } from 'lucide-react';
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
  const [savedCombos, setSavedCombos] = useState(() => storage.getNameCombos());
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'favorites' | 'tester'

  // Filtros da aba Explorar
  const [genderFilter, setGenderFilter] = useState('all');
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

  // Estado do Testador de Sobrenome
  const [testerFirst, setTesterFirst] = useState('Theo');
  const [testerMiddle, setTesterMiddle] = useState('Henrique');
  const [testerMotherSurname, setTesterMotherSurname] = useState('Silva');
  const [testerFatherSurname, setTesterFatherSurname] = useState('Albuquerque');
  const [testerOrder, setTesterOrder] = useState('mother_father'); // 'mother_father' | 'father_mother' | 'mother_only' | 'father_only'
  const [comboSavedMsg, setComboSavedMsg] = useState(false);

  const refreshFavorites = () => setFavorites(storage.getFavoriteNames());
  const refreshCustom = () => setCustomNames(storage.getCustomNames());
  const refreshCombos = () => setSavedCombos(storage.getNameCombos());

  // Combina banco de nomes padrão com os nomes personalizados
  const allAvailableNames = useMemo(() => {
    return [...BABY_NAMES, ...customNames];
  }, [customNames]);

  // Lista filtrada de nomes
  const filteredNames = useMemo(() => {
    return allAvailableNames.filter((item) => {
      if (genderFilter !== 'all' && item.gender !== genderFilter) return false;
      if (styleFilter !== 'all' && item.style !== styleFilter) return false;
      if (letterFilter !== 'all' && !item.name.toUpperCase().startsWith(letterFilter)) return false;

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

  const handleGenerateRandom = () => {
    const pool = filteredNames.length > 0 ? filteredNames : allAvailableNames;
    if (pool.length === 0) return;
    const randomIndex = Math.floor(Math.random() * pool.length);
    setSuggestedName(pool[randomIndex]);
  };

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
    storage.toggleFavoriteName(newObj);

    setCustomName('');
    setCustomOrigin('');
    setCustomMeaning('');
    setShowCustomModal(false);
    refreshCustom();
    refreshFavorites();
  };

  // Abrir o testador de sobrenome a partir de um nome escolhido
  const handleTestWithName = (nameStr) => {
    setTesterFirst(nameStr);
    setActiveTab('tester');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Cálculos do Testador de Sobrenome ────────────────────────────────────────
  const fullFullName = useMemo(() => {
    const parts = [testerFirst.trim(), testerMiddle.trim()];
    if (testerOrder === 'mother_father') {
      parts.push(testerMotherSurname.trim(), testerFatherSurname.trim());
    } else if (testerOrder === 'father_mother') {
      parts.push(testerFatherSurname.trim(), testerMotherSurname.trim());
    } else if (testerOrder === 'mother_only') {
      parts.push(testerMotherSurname.trim());
    } else if (testerOrder === 'father_only') {
      parts.push(testerFatherSurname.trim());
    }
    return parts.filter(Boolean).join(' ');
  }, [testerFirst, testerMiddle, testerMotherSurname, testerFatherSurname, testerOrder]);

  const nameParts = useMemo(() => {
    return fullFullName.split(' ').filter(Boolean);
  }, [fullFullName]);

  // Monograma / Iniciais (ex: T H S A)
  const monogram = useMemo(() => {
    return nameParts.map((p) => p[0]?.toUpperCase()).join(' ');
  }, [nameParts]);

  const monogramCompact = useMemo(() => {
    return nameParts.map((p) => p[0]?.toUpperCase()).join('');
  }, [nameParts]);

  // Análise de Cacofonia e Encontros Vocálicos
  const phoneticAnalysis = useMemo(() => {
    const issues = [];
    for (let i = 0; i < nameParts.length - 1; i++) {
      const current = nameParts[i].toLowerCase();
      const next = nameParts[i + 1].toLowerCase();
      const lastChar = current[current.length - 1];
      const firstChar = next[0];

      if (lastChar === firstChar) {
        issues.push({
          type: 'cacofonia',
          msg: `Repetição da letra "${lastChar.toUpperCase()}" entre "${nameParts[i]}" e "${nameParts[i + 1]}" pode causar junção de sons ao falar rápido.`,
        });
      }
    }

    const totalLetters = fullFullName.replace(/\s+/g, '').length;
    let lengthComment = 'Tamanho ideal e balanceado para documentos e assinaturas.';
    if (totalLetters > 30) {
      lengthComment = 'Nome longo: pode ultrapassar o limite de caracteres em alguns crachás ou cartões de crédito.';
    } else if (totalLetters < 10) {
      lengthComment = 'Nome curto, moderno e super fácil de lembrar!';
    }

    return {
      totalLetters,
      totalWords: nameParts.length,
      issues,
      lengthComment,
    };
  }, [fullFullName, nameParts]);

  // Salvar Combinação
  const handleSaveCombo = () => {
    if (!fullFullName.trim()) return;
    storage.createNameCombo({
      fullName: fullFullName,
      firstName: testerFirst,
      middleName: testerMiddle,
      motherSurname: testerMotherSurname,
      fatherSurname: testerFatherSurname,
      monogram: monogramCompact,
      rating: 5,
      createdAt: new Date().toISOString(),
    });
    refreshCombos();
    setComboSavedMsg(true);
    setTimeout(() => setComboSavedMsg(false), 3000);
  };

  const handleDeleteCombo = (id) => {
    storage.deleteNameCombo(id);
    refreshCombos();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '6px' }}>Guia & Testador de Nomes</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Descubra significados, combine sobrenomes e simule o nome completo do bebê em situações da vida real.
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

      {/* Alternador de Abas (Explorar vs Favoritos vs Testador) */}
      <div style={{ display: 'flex', gap: '8px', margin: '20px 0 24px', flexWrap: 'wrap' }}>
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

        <button
          onClick={() => setActiveTab('tester')}
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
            backgroundColor: activeTab === 'tester' ? '#8b5cf6' : 'transparent',
            color: activeTab === 'tester' ? '#fff' : 'var(--text-muted)',
            borderColor: activeTab === 'tester' ? '#8b5cf6' : 'var(--border)',
          }}
        >
          <UserCheck size={16} /> Testador de Sobrenome ({savedCombos.length})
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

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', border: '1px solid var(--border)' }}
                        onClick={() => handleTestWithName(suggestedName.name)}
                      >
                        🧪 Testar Sobrenome
                      </button>
                      <button
                        className={`fav-heart-btn ${isFavorite(suggestedName.name) ? 'fav-heart-active' : ''}`}
                        onClick={() => handleToggleFavorite(suggestedName)}
                        title={isFavorite(suggestedName.name) ? 'Remover dos favoritos' : 'Favoritar nome'}
                      >
                        <Heart size={22} fill={isFavorite(suggestedName.name) ? '#ef4444' : 'none'} />
                      </button>
                    </div>
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

          {/* Barra de Busca e Filtros */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <div style={{ position: 'relative', flex: '2 1 240px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="Buscar nome, significado ou origem..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={{ flex: '1 1 180px' }}>
                <select className="form-input" value={styleFilter} onChange={(e) => setStyleFilter(e.target.value)}>
                  {STYLES.map((st) => (
                    <option key={st.key} value={st.key}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filtros de Gênero */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <button
                onClick={() => setGenderFilter('all')}
                className={`filter-pill ${genderFilter === 'all' ? 'filter-pill-active' : ''}`}
              >
                Todos os Gêneros
              </button>
              {Object.entries(GENDER_BADGES).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setGenderFilter(key)}
                  className={`filter-pill ${genderFilter === key ? 'filter-pill-active' : ''}`}
                >
                  {info.emoji} {info.label}
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

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn"
                            style={{ padding: '2px 6px', fontSize: '0.7rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                            onClick={() => handleTestWithName(item.name)}
                            title="Testar com sobrenome"
                          >
                            🧪 Testar
                          </button>
                          <button
                            className={`fav-heart-btn ${isFav ? 'fav-heart-active' : ''}`}
                            onClick={() => handleToggleFavorite(item)}
                            title={isFav ? 'Remover dos favoritos' : 'Favoritar nome'}
                          >
                            <Heart size={18} fill={isFav ? '#ef4444' : 'none'} />
                          </button>
                        </div>
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
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)', minWidth: '28px' }}>
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
                            Origem: {fav.origin} · {fav.meaning}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          className="btn"
                          style={{ padding: '4px 10px', fontSize: '0.8rem', border: '1px solid var(--border)' }}
                          onClick={() => handleTestWithName(fav.name)}
                        >
                          🧪 Testar Sobrenome
                        </button>
                        <button
                          className="btn-icon btn-danger-icon"
                          onClick={() => handleToggleFavorite(fav)}
                          title="Remover dos favoritos"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Avaliação por Estrelas (1 a 5) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '6px' }}>
                          Nossa Nota:
                        </span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            className="rating-star-btn"
                            onClick={() => handleRatingChange(fav.name, star)}
                            title={`Dar ${star} estrelas`}
                          >
                            <Star
                              size={18}
                              fill={(fav.rating || 5) >= star ? '#f59e0b' : 'none'}
                              color={(fav.rating || 5) >= star ? '#f59e0b' : 'var(--border)'}
                            />
                          </button>
                        ))}
                      </div>

                      {/* Notas do Casal */}
                      <div style={{ flex: '1 1 240px' }}>
                        <input
                          className="form-input"
                          style={{ fontSize: '0.85rem', padding: '4px 8px' }}
                          placeholder="Anotações do casal (ex: preferido do papai, combina com Silva...)"
                          value={fav.notes || ''}
                          onChange={(e) => handleNotesChange(fav.name, e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ABA 3: TESTADOR DE SOBRENOME & NOME COMPLETO */}
      {activeTab === 'tester' && (
        <div>
          {/* Toast de Sucesso */}
          {comboSavedMsg && (
            <div
              style={{
                backgroundColor: '#dcfce7',
                color: '#15803d',
                border: '1px solid #bbf7d0',
                borderRadius: 'var(--radius)',
                padding: '10px 16px',
                marginBottom: '16px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Check size={18} /> Combinação de nome salva com sucesso nos seus favoritos!
            </div>
          )}

          {/* PLACA HERO: O NOME COMPLETO */}
          <div className="name-hero-plate">
            {/* Monograma Circular */}
            <div className="monogram-badge" title="Monograma Oficial">
              {monogram || '👶'}
            </div>

            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700 }}>
              Nome Completo do Bebê
            </span>

            <div className="name-cursive-preview">
              {fullFullName || 'Digite o nome abaixo...'}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
              <span className="baby-metric-badge">
                📏 <b>{phoneticAnalysis.totalLetters}</b> letras
              </span>
              <span className="baby-metric-badge">
                🗣️ <b>{phoneticAnalysis.totalWords}</b> palavras
              </span>
              <span className="baby-metric-badge">
                👑 Monograma: <b>{monogramCompact}</b>
              </span>
            </div>

            <div style={{ marginTop: '18px' }}>
              <button
                onClick={handleSaveCombo}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
              >
                <Bookmark size={16} /> Salvar Esta Combinação
              </button>
            </div>
          </div>

          {/* FORMULÁRIO DE TESTES */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 className="card-title" style={{ fontSize: '1.05rem', marginBottom: '14px' }}>
              🧪 Personalizar Nomes e Sobrenomes
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Primeiro Nome</label>
                  {favorites.length > 0 && (
                    <select
                      style={{ fontSize: '0.75rem', padding: '2px', border: 'none', background: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
                      onChange={(e) => e.target.value && setTesterFirst(e.target.value)}
                    >
                      <option value="">(Puxar dos Favoritos)</option>
                      {favorites.map((f) => (
                        <option key={f.name} value={f.name}>{f.name}</option>
                      ))}
                    </select>
                  )}
                </div>
                <input
                  className="form-input"
                  placeholder="Ex: Theo, Maya, Helena..."
                  value={testerFirst}
                  onChange={(e) => setTesterFirst(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Segundo Nome (Opcional)</label>
                <input
                  className="form-input"
                  placeholder="Ex: Henrique, Luiza, Vitória..."
                  value={testerMiddle}
                  onChange={(e) => setTesterMiddle(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Sobrenome Materno</label>
                <input
                  className="form-input"
                  placeholder="Ex: Silva, Santos..."
                  value={testerMotherSurname}
                  onChange={(e) => setTesterMotherSurname(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Sobrenome Paterno</label>
                <input
                  className="form-input"
                  placeholder="Ex: Albuquerque, Oliveira..."
                  value={testerFatherSurname}
                  onChange={(e) => setTesterFatherSurname(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '16px', marginBottom: 0 }}>
              <label className="form-label">Ordem dos Sobrenomes</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setTesterOrder('mother_father')}
                  className={`filter-pill ${testerOrder === 'mother_father' ? 'filter-pill-active' : ''}`}
                >
                  Materno + Paterno (Tradicional BR)
                </button>
                <button
                  type="button"
                  onClick={() => setTesterOrder('father_mother')}
                  className={`filter-pill ${testerOrder === 'father_mother' ? 'filter-pill-active' : ''}`}
                >
                  Paterno + Materno (Espanhol / Moderno)
                </button>
                <button
                  type="button"
                  onClick={() => setTesterOrder('mother_only')}
                  className={`filter-pill ${testerOrder === 'mother_only' ? 'filter-pill-active' : ''}`}
                >
                  Apenas Materno
                </button>
                <button
                  type="button"
                  onClick={() => setTesterOrder('father_only')}
                  className={`filter-pill ${testerOrder === 'father_only' ? 'filter-pill-active' : ''}`}
                >
                  Apenas Paterno
                </button>
              </div>
            </div>
          </div>

          {/* ANÁLISE FONÉTICA & HARMONIA */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="flex-row" style={{ color: 'var(--primary)', marginBottom: '10px' }}>
              <Volume2 size={20} />
              <h3 className="card-title" style={{ margin: 0, fontSize: '1rem' }}>Análise de Sonoridade & Harmonia</h3>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '10px' }}>
              💡 <b>Diagnóstico de Extensão:</b> {phoneticAnalysis.lengthComment}
            </p>

            {phoneticAnalysis.issues.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {phoneticAnalysis.issues.map((iss, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                      color: '#d97706',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: 'var(--radius)',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                    }}
                  >
                    ⚠️ {iss.msg}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '8px 12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius)', fontSize: '0.85rem', fontWeight: 500 }}>
                ✨ <b>Excelente fluidez!</b> Não detectamos repetições de consoantes ou junções cacofônicas entre os nomes.
              </div>
            )}
          </div>

          {/* SIMULADOR DE SITUAÇÕES DA VIDA REAL */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px' }}>
              🌍 Como o nome do seu bebê vai soar na vida real:
            </h3>

            <div className="real-life-grid">
              {/* Diploma */}
              <div className="simulation-card" style={{ borderTop: '4px solid #f59e0b' }}>
                <div className="simulation-icon-badge" style={{ background: '#fef3c7', color: '#d97706' }}>
                  <GraduationCap size={20} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>
                  Diploma Universitário
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '8px', lineHeight: '1.5', fontStyle: 'italic' }}>
                  "A Reitoria confere a <b>{fullFullName}</b> o grau acadêmico com todas as honras..."
                </div>
              </div>

              {/* Passaporte Internacional */}
              <div className="simulation-card" style={{ borderTop: '4px solid #3b82f6' }}>
                <div className="simulation-icon-badge" style={{ background: '#eff6ff', color: '#2563eb' }}>
                  <Plane size={20} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                  Passaporte / Embarque IATA
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '8px', fontFamily: 'monospace' }}>
                  <b>{(testerFatherSurname || testerMotherSurname || 'SOBRENOME').toUpperCase()}</b> / {(testerFirst + ' ' + testerMiddle).toUpperCase()}
                </div>
              </div>

              {/* E-mail Corporativo & Crachá */}
              <div className="simulation-card" style={{ borderTop: '4px solid #10b981' }}>
                <div className="simulation-icon-badge" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                  <Briefcase size={20} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>
                  Crachá & E-mail Profissional
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '8px' }}>
                  <b>{testerFirst} {testerFatherSurname || testerMotherSurname}</b>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
                    {testerFirst.toLowerCase().replace(/\s+/g, '')}.{(testerFatherSurname || testerMotherSurname || 'sobrenome').toLowerCase()}@empresa.com
                  </div>
                </div>
              </div>

              {/* Chamada da Escola */}
              <div className="simulation-card" style={{ borderTop: '4px solid #8b5cf6' }}>
                <div className="simulation-icon-badge" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                  <Award size={20} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' }}>
                  Lista de Presença / Pódio
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '8px', lineHeight: '1.5' }}>
                  "Com vocês no palco, recebendo aplausos... <b>{fullFullName}</b>!"
                </div>
              </div>
            </div>
          </div>

          {/* COMBINAÇÕES SALVAS */}
          <div className="card">
            <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '14px' }}>
              <div className="flex-row" style={{ color: 'var(--primary)' }}>
                <Bookmark size={20} />
                <h3 className="card-title" style={{ margin: 0 }}>Combinações Salvas para Decidir</h3>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {savedCombos.length} {savedCombos.length === 1 ? 'combinação salva' : 'combinações salvas'}
              </span>
            </div>

            {savedCombos.length === 0 ? (
              <div className="empty-state">
                Nenhuma combinação salva ainda. Clique em "Salvar Esta Combinação" acima para guardar suas favoritas!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {savedCombos.map((combo) => (
                  <div
                    key={combo.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      background: 'var(--surface-hover)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, padding: '2px 6px', background: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: '4px' }}>
                          {combo.monogram}
                        </span>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)' }}>
                          {combo.fullName}
                        </h4>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        className="btn"
                        style={{ fontSize: '0.75rem', padding: '4px 8px', border: '1px solid var(--border)' }}
                        onClick={() => {
                          setTesterFirst(combo.firstName || '');
                          setTesterMiddle(combo.middleName || '');
                          setTesterMotherSurname(combo.motherSurname || '');
                          setTesterFatherSurname(combo.fatherSurname || '');
                        }}
                      >
                        Carregar
                      </button>
                      <button
                        className="btn-icon btn-danger-icon"
                        onClick={() => handleDeleteCombo(combo.id)}
                        title="Remover combinação"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
