import { useState } from 'react';
import { ListChecks, Sparkles, Plus, Trash2, X, CheckCircle2, Download, PackageOpen, Filter } from 'lucide-react';
import { storage } from '../services/storage';
import { CHECKLIST_TEMPLATES } from '../data/checklistTemplates';

const CATEGORY_MAP = {
  maternidade_bebe: { label: 'Mala do Bebê', emoji: '🍼' },
  maternidade_mae: { label: 'Mala da Mãe', emoji: '🤰' },
  maternidade_acompanhante: { label: 'Mala do Acompanhante', emoji: '🎒' },
  documentos: { label: 'Documentos da Maternidade', emoji: '📑' },
  enxoval: { label: 'Enxoval & Cuidados', emoji: '🧸' },
  quarto: { label: 'Quarto & Móveis', emoji: '🛏️' },
  outros: { label: 'Outros Itens', emoji: '📝' },
};

export default function Checklists() {
  const [items, setItems] = useState(() => storage.getChecklists());
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('maternidade_bebe');
  const [selectedFilter, setSelectedFilter] = useState('all');
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
  };

  const handleToggle = (id, currentStatus) => {
    storage.updateChecklistItem(id, { is_completed: !currentStatus });
    refresh();
  };

  const handleDelete = (id) => {
    storage.deleteChecklistItem(id);
    refresh();
  };

  const handleClearCompleted = () => {
    const completedCount = items.filter((i) => i.is_completed).length;
    if (completedCount === 0) return;
    if (window.confirm(`Deseja remover os ${completedCount} itens já concluídos da lista?`)) {
      items.filter((i) => i.is_completed).forEach((i) => storage.deleteChecklistItem(i.id));
      refresh();
      showNotification(`${completedCount} itens concluídos foram removidos!`);
    }
  };

  // Carregar um modelo específico
  const handleLoadTemplate = (template) => {
    let addedCount = 0;
    const currentList = storage.getChecklists();

    template.items.forEach((itemTitle) => {
      // Evita duplicar itens idênticos na mesma categoria
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
    showNotification(`🚀 Pacote Completo Carregado! ${totalAdded} itens foram adicionados ao seu checklist.`);
  };

  // Itens filtrados
  const filteredItems = selectedFilter === 'all'
    ? items
    : items.filter((i) => i.category === selectedFilter);

  // Categorias que possuem itens no momento
  const presentCategories = Array.from(new Set(items.map((i) => i.category)));

  const completedCount = items.filter((i) => i.is_completed).length;
  const totalCount = items.length;
  const overallPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '6px' }}>Checklists do Bebê</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Organize malas de maternidade, enxoval e preparativos essenciais sem esquecer nada.
          </p>
        </div>

        <button
          onClick={() => setShowTemplateModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Sparkles size={16} /> Modelos Prontos (1-Clique)
        </button>
      </div>

      {/* Notificação Toast de feedback */}
      {feedbackMsg && (
        <div
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
          }}
        >
          <CheckCircle2 size={18} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Banner de Boas-vindas para listas vazias */}
      {items.length === 0 && (
        <div className="template-banner">
          <div>
            <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem', color: 'var(--primary)', fontWeight: 700 }}>
              💡 Quer economizar horas de pesquisa?
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', maxWidth: '560px', lineHeight: '1.5' }}>
              Carregue nosso pacote recomendado por obstetras e mães experientes: malas de maternidade (bebê, mãe e acompanhante), documentos e enxoval essencial.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleLoadAllTemplates}
              className="btn btn-primary"
              style={{ fontWeight: 600 }}
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
        <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
              Progresso Geral: <b>{completedCount}</b> de <b>{totalCount}</b> tarefas concluídas
            </span>
            <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '0.95rem' }}>
              {overallPercentage}%
            </span>
          </div>

          <div className="progress-container" style={{ margin: 0 }}>
            <div
              className="progress-bar"
              style={{
                width: `${overallPercentage}%`,
                backgroundColor: overallPercentage === 100 ? 'var(--success)' : 'var(--accent)',
              }}
            ></div>
          </div>

          {completedCount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
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
            </div>
          )}
        </div>
      )}

      {/* Formulário para Adicionar Item Personalizado */}
      <div className="card">
        <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '12px' }}>Adicionar Item Personalizado</h3>
        <form onSubmit={handleAdd} className="flex-row" style={{ alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
          <div className="form-group" style={{ flex: '2 1 240px', marginBottom: 0 }}>
            <label className="form-label">Nome do Item / Tarefa</label>
            <input
              className="form-input"
              placeholder="Ex: Fraldas tamanho P, Pomada de assadura, Lençol..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
            <label className="form-label">Categoria</label>
            <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="maternidade_bebe">🍼 Mala do Bebê</option>
              <option value="maternidade_mae">🤰 Mala da Mãe</option>
              <option value="maternidade_acompanhante">🎒 Mala do Acompanhante</option>
              <option value="documentos">📑 Documentos</option>
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

      {/* Filtros de Categoria (Pills) */}
      {items.length > 0 && (
        <div className="filter-pills-row">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`filter-pill ${selectedFilter === 'all' ? 'filter-pill-active' : ''}`}
          >
            Todas ({items.length})
          </button>

          {presentCategories.map((catKey) => {
            const catInfo = CATEGORY_MAP[catKey] || { label: catKey, emoji: '📦' };
            const catCount = items.filter((i) => i.category === catKey).length;
            const catDone = items.filter((i) => i.category === catKey && i.is_completed).length;

            return (
              <button
                key={catKey}
                onClick={() => setSelectedFilter(catKey)}
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
          const catItems = items.filter((i) => i.category === catKey);
          if (catItems.length === 0) return null;

          const catCompleted = catItems.filter((i) => i.is_completed).length;
          const catPercentage = Math.round((catCompleted / catItems.length) * 100);

          return (
            <div key={catKey} className="card">
              <div className="flex-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div className="flex-row" style={{ color: 'var(--primary)' }}>
                  <span style={{ fontSize: '1.3rem' }}>{catInfo.emoji}</span>
                  <h2 className="card-title" style={{ margin: 0 }}>{catInfo.label}</h2>
                </div>

                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {catCompleted} de {catItems.length} ({catPercentage}%)
                </span>
              </div>

              {/* Barra de progresso por categoria */}
              <div className="progress-container" style={{ height: '6px', margin: '0 0 14px' }}>
                <div
                  className="progress-bar"
                  style={{
                    width: `${catPercentage}%`,
                    backgroundColor: catPercentage === 100 ? 'var(--success)' : 'var(--accent)',
                  }}
                ></div>
              </div>

              {catItems.map((item) => (
                <div key={item.id} className="list-item">
                  <div className="flex-row" style={{ flex: 1 }}>
                    <input
                      type="checkbox"
                      className="checkbox-custom"
                      checked={item.is_completed}
                      onChange={() => handleToggle(item.id, item.is_completed)}
                    />
                    <span
                      className={item.is_completed ? 'completed-text' : ''}
                      style={{ fontWeight: 500, cursor: 'pointer', userSelect: 'none', lineHeight: '1.4' }}
                      onClick={() => handleToggle(item.id, item.is_completed)}
                    >
                      {item.title}
                    </span>
                  </div>

                  <button
                    className="btn-icon btn-danger-icon"
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
        <div className="lightbox-overlay" onClick={() => setShowTemplateModal(false)}>
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
