import { useState, useMemo } from 'react';
import { ListChecks, Sparkles, Plus, Trash2, X, CheckCircle2, Download, PackageOpen, Filter, Printer, Search, Luggage, Check, AlertCircle } from 'lucide-react';
import { storage } from '../services/storage';
import { CHECKLIST_TEMPLATES } from '../data/checklistTemplates';
import { fireConfetti, fireSparkleBurst } from '../utils/confetti';
import { soundSynthesizer } from '../utils/soundSynthesizer';

const CATEGORY_MAP = {
  maternidade_bebe: { label: 'Mala do Bebê', emoji: '🍼', color: '#db2777' },
  maternidade_mae: { label: 'Mala da Mãe', emoji: '🤰', color: '#9333ea' },
  maternidade_acompanhante: { label: 'Mala do Acompanhante', emoji: '🎒', color: '#2563eb' },
  documentos: { label: 'Documentos da Maternidade', emoji: '📑', color: '#ca8a04' },
  enxoval: { label: 'Enxoval & Cuidados', emoji: '🧸', color: '#16a34a' },
  quarto: { label: 'Quarto & Móveis', emoji: '🛏️', color: '#0891b2' },
  outros: { label: 'Outros Itens', emoji: '📝', color: '#64748b' },
};

// 4 Malas Principais de Parto para o Dashboard Interativo
const CORE_SUITCASES = [
  { key: 'maternidade_bebe', label: 'Mala do Bebê', emoji: '🍼' },
  { key: 'maternidade_mae', label: 'Mala da Mãe', emoji: '🤰' },
  { key: 'maternidade_acompanhante', label: 'Acompanhante', emoji: '🎒' },
  { key: 'documentos', label: 'Documentos', emoji: '📑' },
];

export default function Checklists() {
  const [items, setItems] = useState(() => storage.getChecklists());
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('maternidade_bebe');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const refresh = () => setItems(storage.getChecklists());

  const showNotification = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    storage.createChecklistItem({ title: title.trim(), category, is_completed: false });
    setTitle('');
    refresh();
    soundSynthesizer.playPop();
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      fireSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  };

  const handleToggle = (e, id, currentStatus, itemCategory) => {
    const newStatus = !currentStatus;
    storage.updateChecklistItem(id, { is_completed: newStatus });
    refresh();

    if (newStatus) {
      soundSynthesizer.playChime();
      if (e && e.currentTarget) {
        const rect = e.currentTarget.getBoundingClientRect();
        fireSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }

      // Verifica se completou a mala atual
      const updatedList = storage.getChecklists();
      const catItems = updatedList.filter((i) => i.category === itemCategory);
      if (catItems.length > 0 && catItems.every((i) => i.is_completed)) {
        soundSynthesizer.playSuccessChord();
        fireConfetti({ count: 60 });
        showNotification(`🎉 Incrível! A categoria "${CATEGORY_MAP[itemCategory]?.label || itemCategory}" está 100% pronta!`);
      }
    } else {
      soundSynthesizer.playPop();
    }
  };

  const handleDelete = (id) => {
    storage.deleteChecklistItem(id);
    soundSynthesizer.playPop();
    refresh();
  };

  const handleClearCompleted = () => {
    const completedCount = items.filter((i) => i.is_completed).length;
    if (completedCount === 0) return;
    if (window.confirm(`Deseja remover os ${completedCount} itens já concluídos da lista?`)) {
      items.filter((i) => i.is_completed).forEach((i) => storage.deleteChecklistItem(i.id));
      refresh();
      soundSynthesizer.playPop();
      showNotification(`${completedCount} itens concluídos foram removidos!`);
    }
  };

  // Carregar um modelo específico
  const handleLoadTemplate = (template) => {
    let addedCount = 0;
    const currentList = storage.getChecklists();

    template.items.forEach((itemTitle) => {
      const alreadyExists = currentList.some(
        (existing) =>
          existing.category === template.category &&
          existing.title.toLowerCase().trim() === itemTitle.toLowerCase().trim()
      );

      if (!alreadyExists) {
        storage.createChecklistItem({
          title: itemTitle,
          category: template.category,
          is_completed: false,
        });
        addedCount++;
      }
    });

    refresh();
    soundSynthesizer.playSuccessChord();
    fireConfetti({ count: 45 });
    showNotification(`🎉 ${addedCount} novos itens adicionados à "${template.title}"!`);
  };

  // Carregar todos os modelos de uma vez
  const handleLoadAllTemplates = () => {
    let totalAdded = 0;
    const currentList = storage.getChecklists();

    CHECKLIST_TEMPLATES.forEach((template) => {
      template.items.forEach((itemTitle) => {
        const alreadyExists = currentList.some(
          (existing) =>
            existing.category === template.category &&
            existing.title.toLowerCase().trim() === itemTitle.toLowerCase().trim()
        );

        if (!alreadyExists) {
          storage.createChecklistItem({
            title: itemTitle,
            category: template.category,
            is_completed: false,
          });
          totalAdded++;
        }
      });
    });

    refresh();
    setShowTemplateModal(false);
    soundSynthesizer.playSuccessChord();
    fireConfetti({ count: 80 });
    showNotification(`🚀 Pacote Completo Carregado! ${totalAdded} itens foram adicionados ao seu checklist.`);
  };

  const handlePrint = () => {
    soundSynthesizer.playChime();
    window.print();
  };

  // Itens filtrados com suporte à busca em tempo real
  const filteredItems = useMemo(() => {
    let list = items;
    if (selectedFilter !== 'all') {
      list = list.filter((i) => i.category === selectedFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((i) => i.title.toLowerCase().includes(q));
    }
    return list;
  }, [items, selectedFilter, searchQuery]);

  // Categorias presentes
  const presentCategories = Array.from(new Set(items.map((i) => i.category)));

  const completedCount = items.filter((i) => i.is_completed).length;
  const totalCount = items.length;
  const overallPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '6px' }}>Checklists do Bebê & Malas de Maternidade</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Planeje os preparativos para o parto, documentos e enxoval sem esquecer nenhum detalhe essencial.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setShowTemplateModal(true);
              soundSynthesizer.playPop();
            }}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
          >
            <Sparkles size={16} /> Modelos Prontos (1-Clique)
          </button>

          {items.length > 0 && (
            <button
              onClick={handlePrint}
              className="btn"
              style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Imprimir folha de checklist para colar na mala"
            >
              <Printer size={16} /> Imprimir Checklist
            </button>
          )}
        </div>
      </div>

      {/* Notificação Toast de feedback */}
      {feedbackMsg && (
        <div
          className="no-print"
          style={{
            backgroundColor: '#dcfce7',
            color: '#15803d',
            border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius)',
            padding: '12px 16px',
            marginBottom: '20px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.1)',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* PAINEL INTERATIVO DE MALAS DA MATERNIDADE (Suitcase Dashboard) */}
      {items.length > 0 && (
        <div className="suitcase-cards-grid no-print">
          {CORE_SUITCASES.map((bag) => {
            const bagItems = items.filter((i) => i.category === bag.key);
            const bagTotal = bagItems.length;
            const bagDone = bagItems.filter((i) => i.is_completed).length;
            const bagPct = bagTotal > 0 ? Math.round((bagDone / bagTotal) * 100) : 0;
            const isComplete = bagTotal > 0 && bagDone === bagTotal;
            const isSelected = selectedFilter === bag.key;

            return (
              <div
                key={bag.key}
                onClick={() => {
                  setSelectedFilter(isSelected ? 'all' : bag.key);
                  soundSynthesizer.playPop();
                }}
                className={`suitcase-card ${isSelected ? 'suitcase-active' : ''} ${isComplete ? 'suitcase-complete' : ''}`}
                title={`Clique para filtrar itens de: ${bag.label}`}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div className="suitcase-emoji-circle">{bag.emoji}</div>
                    <span className={`suitcase-status-pill ${isComplete ? 'suitcase-pill-complete' : 'suitcase-pill-progress'}`}>
                      {bagTotal === 0 ? 'Não iniciada' : isComplete ? '✓ Pronta!' : `${bagPct}%`}
                    </span>
                  </div>

                  <h3 className="suitcase-name">{bag.label}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {bagTotal === 0 ? 'Sem itens' : `${bagDone} de ${bagTotal} embalados`}
                  </div>
                </div>

                <div className="progress-container" style={{ height: '5px', margin: 0 }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${bagPct}%`,
                      backgroundColor: isComplete ? '#10b981' : 'var(--accent)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Banner de Boas-vindas para listas vazias */}
      {items.length === 0 && (
        <div className="template-banner no-print">
          <div>
            <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem', color: 'var(--primary)', fontWeight: 700 }}>
              💡 Quer economizar horas de pesquisa e estresse?
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', maxWidth: '560px', lineHeight: '1.5' }}>
              Carregue o checklist oficial recomendado por obstetras e mães experientes: malas de maternidade (bebê, mãe e acompanhante), documentos e enxoval essencial.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleLoadAllTemplates}
              className="btn btn-primary"
              style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <PackageOpen size={18} /> Carregar Tudo com 1 Clique
            </button>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="btn"
              style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)' }}
            >
              Ver Modelos
            </button>
          </div>
        </div>
      )}

      {/* Barra de Progresso Geral */}
      {totalCount > 0 && (
        <div className="card no-print" style={{ padding: '16px 20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
              Progresso Geral dos Preparativos: <b>{completedCount}</b> de <b>{totalCount}</b> tarefas concluídas
            </span>
            <span style={{ fontWeight: 700, color: overallPercentage === 100 ? '#10b981' : 'var(--accent)', fontSize: '0.95rem' }}>
              {overallPercentage}%
            </span>
          </div>

          <div className="progress-container" style={{ margin: 0 }}>
            <div
              className="progress-bar"
              style={{
                width: `${overallPercentage}%`,
                backgroundColor: overallPercentage === 100 ? '#10b981' : 'var(--accent)',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              💡 Dica Obstétrica: Mantenha as malas 100% fechadas no carro ou no quarto a partir da <b>35ª semana</b>.
            </span>

            {completedCount > 0 && (
              <button
                onClick={handleClearCompleted}
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--danger)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Trash2 size={13} /> Limpar itens concluídos ({completedCount})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Busca em Tempo Real e Formulário de Adicionar (no-print) */}
      <div className="card no-print" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
          <h3 className="card-title" style={{ fontSize: '1rem', margin: 0 }}>Adicionar Item Personalizado</h3>

          {/* Campo de Busca Rápida */}
          {items.length > 5 && (
            <div style={{ position: 'relative', width: '100%', maxWidth: '260px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: '32px', fontSize: '0.85rem', padding: '6px 12px 6px 32px' }}
                placeholder="Buscar item na lista..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleAdd} className="flex-row" style={{ alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
          <div className="form-group" style={{ flex: '2 1 240px', marginBottom: 0 }}>
            <label className="form-label">Nome do Item / Tarefa</label>
            <input
              className="form-input"
              placeholder="Ex: Fraldas RN, Camisola de Amamentação, Carregador de celular..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
            <label className="form-label">Categoria de Destino</label>
            <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="maternidade_bebe">🍼 Mala do Bebê</option>
              <option value="maternidade_mae">🤰 Mala da Mãe</option>
              <option value="maternidade_acompanhante">🎒 Mala do Acompanhante</option>
              <option value="documentos">📑 Documentos da Maternidade</option>
              <option value="enxoval">🧸 Enxoval do Bebê</option>
              <option value="quarto">🛏️ Quarto & Móveis</option>
              <option value="outros">📝 Outros Itens</option>
            </select>
          </div>

          <button className="btn btn-primary" type="submit" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={18} /> Adicionar
          </button>
        </form>
      </div>

      {/* Filtros Rápidos de Categoria (Pills) - no-print */}
      {items.length > 0 && (
        <div className="filter-pills-row no-print">
          <button
            onClick={() => {
              setSelectedFilter('all');
              soundSynthesizer.playPop();
            }}
            className={`filter-pill ${selectedFilter === 'all' ? 'filter-pill-active' : ''}`}
          >
            Todas as Categorias ({items.length})
          </button>

          {presentCategories.map((catKey) => {
            const catInfo = CATEGORY_MAP[catKey] || { label: catKey, emoji: '📦' };
            const catCount = items.filter((i) => i.category === catKey).length;
            const catDone = items.filter((i) => i.category === catKey && i.is_completed).length;

            return (
              <button
                key={catKey}
                onClick={() => {
                  setSelectedFilter(catKey);
                  soundSynthesizer.playPop();
                }}
                className={`filter-pill ${selectedFilter === catKey ? 'filter-pill-active' : ''}`}
              >
                {catInfo.emoji} {catInfo.label} ({catDone}/{catCount})
              </button>
            );
          })}
        </div>
      )}

      {/* Listagem dos Itens por Categoria */}
      {presentCategories
        .filter((catKey) => selectedFilter === 'all' || selectedFilter === catKey)
        .map((catKey) => {
          const catInfo = CATEGORY_MAP[catKey] || { label: catKey, emoji: '📦' };
          const catItems = filteredItems.filter((i) => i.category === catKey);
          if (catItems.length === 0) return null;

          const totalCatItems = items.filter((i) => i.category === catKey);
          const catCompleted = totalCatItems.filter((i) => i.is_completed).length;
          const catPercentage = totalCatItems.length > 0 ? Math.round((catCompleted / totalCatItems.length) * 100) : 0;

          return (
            <div key={catKey} className="card" style={{ marginBottom: '20px' }}>
              <div className="flex-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div className="flex-row" style={{ color: 'var(--primary)' }}>
                  <span style={{ fontSize: '1.4rem' }}>{catInfo.emoji}</span>
                  <div>
                    <h2 className="card-title" style={{ margin: 0, fontSize: '1.1rem' }}>{catInfo.label}</h2>
                  </div>
                </div>

                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: catPercentage === 100 ? '#10b981' : 'var(--accent)' }}>
                  {catCompleted} de {totalCatItems.length} ({catPercentage}%)
                </span>
              </div>

              {/* Barra de progresso por categoria */}
              <div className="progress-container no-print" style={{ height: '6px', margin: '0 0 14px' }}>
                <div
                  className="progress-bar"
                  style={{
                    width: `${catPercentage}%`,
                    backgroundColor: catPercentage === 100 ? '#10b981' : 'var(--accent)',
                  }}
                />
              </div>

              {catItems.map((item) => (
                <div key={item.id} className="list-item">
                  <div className="flex-row" style={{ flex: 1 }}>
                    <input
                      type="checkbox"
                      className="checkbox-custom"
                      checked={item.is_completed}
                      onChange={(e) => handleToggle(e, item.id, item.is_completed, item.category)}
                    />
                    <span
                      className={item.is_completed ? 'completed-text' : ''}
                      style={{ fontWeight: 500, cursor: 'pointer', userSelect: 'none', lineHeight: '1.4' }}
                      onClick={(e) => handleToggle(e, item.id, item.is_completed, item.category)}
                    >
                      {item.title}
                    </span>
                  </div>

                  <button
                    className="btn-icon btn-danger-icon no-print"
                    onClick={() => handleDelete(item.id)}
                    title="Remover item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          );
        })}

      {items.length === 0 && (
        <div className="empty-state card">
          Nenhum item na sua lista ainda. Clique no botão de <b>Modelos Prontos</b> acima ou adicione itens manualmente!
        </div>
      )}

      {/* Modal de Modelos Prontos de Checklist */}
      {showTemplateModal && (
        <div className="lightbox-overlay no-print" onClick={() => setShowTemplateModal(false)}>
          <div
            className="lightbox-content"
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '850px',
              width: '95%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '28px',
              border: '1px solid var(--border)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={22} style={{ color: '#ca8a04' }} />
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>
                  Modelos de Checklist Recomendados
                </h2>
              </div>

              <button
                onClick={() => setShowTemplateModal(false)}
                className="btn-icon"
                style={{ fontSize: '1.2rem' }}
                title="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Escolha uma lista para adicionar ao seu checklist ou carregue todas de uma vez com 1 clique. Itens repetidos não serão duplicados.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button
                onClick={handleLoadAllTemplates}
                className="btn btn-primary"
                style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <PackageOpen size={18} /> Carregar Todos os Modelos (+50 Itens)
              </button>
            </div>

            {/* Grid dos Templates */}
            <div className="template-grid">
              {CHECKLIST_TEMPLATES.map((tmpl) => (
                <div key={tmpl.id} className="template-card">
                  <div>
                    <div className="template-header">
                      <div className="template-emoji">{tmpl.emoji}</div>
                      <div>
                        <h3 className="template-title">{tmpl.title}</h3>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)' }}>
                          {tmpl.categoryLabel}
                        </span>
                      </div>
                    </div>

                    <p className="template-desc" style={{ marginTop: '10px' }}>
                      {tmpl.description}
                    </p>

                    <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <b>Exemplos:</b> {tmpl.items.slice(0, 3).join(', ')}...
                    </div>
                  </div>

                  <div className="template-footer">
                    <span className="template-item-count">{tmpl.items.length} itens essenciais</span>
                    <button
                      onClick={() => handleLoadTemplate(tmpl)}
                      className="template-load-btn"
                    >
                      + Carregar Lista
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
