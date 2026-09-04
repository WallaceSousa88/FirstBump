import { useState } from 'react';
import { Calculator, DollarSign, Gift, CheckCircle2, Plus, Trash2, Edit3, Sparkles, Package, ShoppingBag, TrendingUp, Info } from 'lucide-react';
import { storage } from '../services/storage';
import { DIAPER_SIZES, BUDGET_CATEGORIES } from '../data/diaperData';

export default function DiaperBudget() {
  const [activeTab, setActiveTab] = useState('diapers'); // 'diapers' | 'budget'

  // Estoque de Fraldas
  const [inventory, setInventory] = useState(() => storage.getDiaperInventory());

  // Orçamento do Enxoval
  const [budgetLimit, setBudgetLimit] = useState(() => {
    const s = storage.getSetting('budget_limit');
    return s ? parseFloat(s.value) : 5000;
  });
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudgetLimit, setNewBudgetLimit] = useState(budgetLimit);

  // Lista de itens do orçamento
  const [budgetItems, setBudgetItems] = useState(() => storage.getBudgetItems());

  // Formulário de novo item do enxoval
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('quarto');
  const [itemValue, setItemValue] = useState('');
  const [itemStatus, setItemStatus] = useState('comprado'); // 'comprado' | 'presente' | 'pendente'

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const showNotification = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Atualizar estoque de fraldas
  const handleUpdateInventory = (sizeKey, delta) => {
    const current = inventory[sizeKey] || 0;
    const nextVal = Math.max(0, current + delta);
    const updated = { ...inventory, [sizeKey]: nextVal };
    setInventory(updated);
    storage.saveDiaperInventory(updated);
  };

  // Salvar meta de orçamento
  const handleSaveBudgetLimit = (e) => {
    e.preventDefault();
    const val = parseFloat(newBudgetLimit);
    if (!isNaN(val) && val >= 0) {
      setBudgetLimit(val);
      storage.setSetting('budget_limit', val);
      setIsEditingBudget(false);
      showNotification('Meta de orçamento atualizada com sucesso!');
    }
  };

  // Adicionar item ao orçamento
  const handleAddBudgetItem = (e) => {
    e.preventDefault();
    const parsedVal = parseFloat(itemValue.replace(',', '.'));
    if (!itemName.trim() || isNaN(parsedVal) || parsedVal < 0) {
      alert('Por favor, insira um nome e valor válido.');
      return;
    }

    const newItem = {
      title: itemName.trim(),
      category: itemCategory,
      value: parsedVal,
      status: itemStatus,
      createdAt: new Date().toISOString(),
    };

    storage.createBudgetItem(newItem);
    setBudgetItems(storage.getBudgetItems());
    setItemName('');
    setItemValue('');
    showNotification('Item adicionado ao orçamento!');
  };

  const handleDeleteBudgetItem = (id) => {
    storage.deleteBudgetItem(id);
    setBudgetItems(storage.getBudgetItems());
  };

  // Cálculos de Fraldas
  const totalRecommendedPacks = DIAPER_SIZES.reduce((acc, d) => acc + d.recommendedPacks, 0);
  const totalCurrentPacks = Object.values(inventory).reduce((acc, count) => acc + (count || 0), 0);
  const diaperStockPercentage = Math.min(100, Math.round((totalCurrentPacks / totalRecommendedPacks) * 100));

  // Cálculos Financeiros
  const totalSpent = budgetItems
    .filter((i) => i.status === 'comprado')
    .reduce((acc, i) => acc + (parseFloat(i.value) || 0), 0);

  const totalGifts = budgetItems
    .filter((i) => i.status === 'presente')
    .reduce((acc, i) => acc + (parseFloat(i.value) || 0), 0);

  const totalPending = budgetItems
    .filter((i) => i.status === 'pendente')
    .reduce((acc, i) => acc + (parseFloat(i.value) || 0), 0);

  const remainingBudget = budgetLimit - totalSpent;
  const budgetUsedPercentage = budgetLimit > 0 ? Math.min(100, Math.round((totalSpent / budgetLimit) * 100)) : 0;

  // Itens filtrados
  const filteredBudgetItems = categoryFilter === 'all'
    ? budgetItems
    : budgetItems.filter((i) => i.category === categoryFilter);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '6px' }}>Calculadora & Orçamento</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Planeje o estoque de fraldas do 1º ano e controle os gastos e presentes do enxoval.
          </p>
        </div>
      </div>

      {/* Toast Feedback */}
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

      {/* Alternador de Abas */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('diapers')}
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
            backgroundColor: activeTab === 'diapers' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'diapers' ? '#fff' : 'var(--text-muted)',
            borderColor: activeTab === 'diapers' ? 'var(--primary)' : 'var(--border)',
          }}
        >
          <Calculator size={16} /> Calculadora de Fraldas
        </button>

        <button
          onClick={() => setActiveTab('budget')}
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
            backgroundColor: activeTab === 'budget' ? '#10b981' : 'transparent',
            color: activeTab === 'budget' ? '#fff' : 'var(--text-muted)',
            borderColor: activeTab === 'budget' ? '#10b981' : 'var(--border)',
          }}
        >
          <DollarSign size={16} /> Orçamento do Enxoval ({budgetItems.length})
        </button>
      </div>

      {/* ABA 1: CALCULADORA & ESTOQUE DE FRALDAS */}
      {activeTab === 'diapers' && (
        <>
          {/* Painel de Resumo do Estoque */}
          <div className="stats-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-box">
              <div className="stat-box-label">Estimativa Total (1º Ano)</div>
              <div className="stat-box-value" style={{ color: 'var(--primary)' }}>
                ~4.050 <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>fraldas</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Equivalente a ~{totalRecommendedPacks} pacotes de 36 un.
              </span>
            </div>

            <div className="stat-box">
              <div className="stat-box-label">Estoque Atual em Casa</div>
              <div className="stat-box-value" style={{ color: '#10b981' }}>
                {totalCurrentPacks} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>pacotes</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ~{totalCurrentPacks * 36} fraldas garantidas
              </span>
            </div>

            <div className="stat-box">
              <div className="stat-box-label">Progresso do Enxoval de Fraldas</div>
              <div className="stat-box-value" style={{ color: 'var(--accent)' }}>
                {diaperStockPercentage}%
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {totalRecommendedPacks - totalCurrentPacks > 0
                  ? `Faltam ~${totalRecommendedPacks - totalCurrentPacks} pacotes`
                  : '🎉 Meta de fraldas atingida!'}
              </span>
            </div>
          </div>

          {/* Grid de Tamanhos de Fraldas */}
          <div className="diaper-grid">
            {DIAPER_SIZES.map((d) => {
              const currentPacks = inventory[d.size] || 0;
              const sizePercentage = Math.min(100, Math.round((currentPacks / d.recommendedPacks) * 100));

              return (
                <div key={d.size} className="diaper-card">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '999px',
                          backgroundColor: `${d.color}20`,
                          color: d.color,
                        }}
                      >
                        {d.emoji} {d.label}
                      </span>

                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {d.weightRange}
                      </span>
                    </div>

                    <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                      <div><b>Uso:</b> ~{d.dailyUsage} fraldas/dia ({d.ageRange})</div>
                      <div><b>Estimativa total:</b> ~{d.recommendedTotal} fraldas (~{d.recommendedPacks} pacotes)</div>
                    </div>

                    {/* Contador de Estoque */}
                    <div className="inventory-counter-box">
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        Pacotes em estoque:
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          className="inventory-counter-btn"
                          onClick={() => handleUpdateInventory(d.size, -1)}
                          title="Diminuir 1 pacote"
                        >
                          -
                        </button>
                        <span style={{ fontWeight: 700, fontSize: '1rem', minWidth: '20px', textAlign: 'center' }}>
                          {currentPacks}
                        </span>
                        <button
                          className="inventory-counter-btn"
                          onClick={() => handleUpdateInventory(d.size, 1)}
                          title="Adicionar 1 pacote"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Barra de Progresso do Tamanho */}
                    <div className="progress-container" style={{ height: '6px', margin: '8px 0 10px' }}>
                      <div
                        className="progress-bar"
                        style={{
                          width: `${sizePercentage}%`,
                          backgroundColor: sizePercentage === 100 ? 'var(--success)' : d.color,
                        }}
                      ></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      <span>{currentPacks} de {d.recommendedPacks} pacotes</span>
                      <span>{sizePercentage}%</span>
                    </div>

                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0, lineHeight: '1.4' }}>
                      💡 {d.tip}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ABA 2: ORÇAMENTO DO ENXOVAL */}
      {activeTab === 'budget' && (
        <>
          {/* Painel de Metas Financeiras */}
          <div className="stats-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="stat-box-label">Meta de Orçamento</div>
                <button
                  onClick={() => setIsEditingBudget(!isEditingBudget)}
                  className="btn-icon"
                  title="Editar meta"
                  style={{ padding: '2px' }}
                >
                  <Edit3 size={14} />
                </button>
              </div>

              {isEditingBudget ? (
                <form onSubmit={handleSaveBudgetLimit} style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  <input
                    type="number"
                    step="50"
                    className="form-input"
                    style={{ fontSize: '0.85rem', padding: '4px 8px' }}
                    value={newBudgetLimit}
                    onChange={(e) => setNewBudgetLimit(e.target.value)}
                  />
                  <button className="btn btn-primary" type="submit" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>
                    OK
                  </button>
                </form>
              ) : (
                <div className="stat-box-value" style={{ color: 'var(--primary)' }}>
                  R$ {budgetLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              )}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Teto planejado pelo casal
              </span>
            </div>

            <div className="stat-box">
              <div className="stat-box-label">Total Gasto Real</div>
              <div className="stat-box-value" style={{ color: remainingBudget >= 0 ? '#10b981' : '#ef4444' }}>
                R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {budgetUsedPercentage}% do limite utilizado
              </span>
            </div>

            <div className="stat-box">
              <div className="stat-box-label">Economia com Presentes 🎁</div>
              <div className="stat-box-value" style={{ color: '#8b5cf6' }}>
                R$ {totalGifts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Ganhos no Chá de Bebê / Família
              </span>
            </div>

            <div className="stat-box">
              <div className="stat-box-label">Saldo Disponível</div>
              <div className="stat-box-value" style={{ color: remainingBudget >= 0 ? 'var(--accent)' : '#ef4444' }}>
                R$ {remainingBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {remainingBudget >= 0 ? 'Dentro do orçamento planejado' : '⚠️ Limite ultrapassado'}
              </span>
            </div>
          </div>

          {/* Barra de Progresso do Orçamento */}
          <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600 }}>Uso do Orçamento:</span>
              <span style={{ fontWeight: 700, color: remainingBudget >= 0 ? '#10b981' : '#ef4444' }}>
                {budgetUsedPercentage}%
              </span>
            </div>

            <div className="progress-container" style={{ margin: 0 }}>
              <div
                className="progress-bar"
                style={{
                  width: `${budgetUsedPercentage}%`,
                  backgroundColor: remainingBudget >= 0 ? '#10b981' : '#ef4444',
                }}
              ></div>
            </div>
          </div>

          {/* Formulário para Adicionar Item */}
          <div className="card">
            <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '12px' }}>Adicionar Item ao Enxoval</h3>
            <form onSubmit={handleAddBudgetItem} className="flex-row" style={{ alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
              <div className="form-group" style={{ flex: '2 1 200px', marginBottom: 0 }}>
                <label className="form-label">Nome do Item</label>
                <input
                  className="form-input"
                  placeholder="Ex: Berço americano, Carrinho de bebê, Banheira..."
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ flex: '1 1 150px', marginBottom: 0 }}>
                <label className="form-label">Categoria</label>
                <select className="form-input" value={itemCategory} onChange={(e) => setItemCategory(e.target.value)}>
                  {BUDGET_CATEGORIES.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.emoji} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ flex: '1 1 120px', marginBottom: 0 }}>
                <label className="form-label">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 350.00"
                  className="form-input"
                  value={itemValue}
                  onChange={(e) => setItemValue(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ flex: '1 1 140px', marginBottom: 0 }}>
                <label className="form-label">Situação</label>
                <select className="form-input" value={itemStatus} onChange={(e) => setItemStatus(e.target.value)}>
                  <option value="comprado">✅ Comprado</option>
                  <option value="presente">🎁 Ganho de Presente</option>
                  <option value="pendente">⏳ Lista de Desejos</option>
                </select>
              </div>

              <button className="btn btn-primary" type="submit" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={16} /> Adicionar
              </button>
            </form>
          </div>

          {/* Filtros de Categoria */}
          <div className="filter-pills-row" style={{ marginBottom: '16px' }}>
            <button
              onClick={() => setCategoryFilter('all')}
              className={`filter-pill ${categoryFilter === 'all' ? 'filter-pill-active' : ''}`}
            >
              Todos ({budgetItems.length})
            </button>
            {BUDGET_CATEGORIES.map((cat) => {
              const count = budgetItems.filter((i) => i.category === cat.key).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat.key}
                  onClick={() => setCategoryFilter(cat.key)}
                  className={`filter-pill ${categoryFilter === cat.key ? 'filter-pill-active' : ''}`}
                >
                  {cat.emoji} {cat.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Listagem de Itens */}
          <div className="card">
            <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '12px' }}>
              <div className="flex-row" style={{ color: 'var(--primary)' }}>
                <ShoppingBag size={20} />
                <h2 className="card-title" style={{ margin: 0 }}>Itens Cadastrados</h2>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {filteredBudgetItems.length} {filteredBudgetItems.length === 1 ? 'item' : 'itens'}
              </span>
            </div>

            {filteredBudgetItems.length === 0 ? (
              <div className="empty-state">
                Nenhum item cadastrado nesta categoria. Adicione seus itens no formulário acima!
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="contractions-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Categoria</th>
                      <th>Situação</th>
                      <th>Valor (R$)</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBudgetItems.map((item) => {
                      const catInfo = BUDGET_CATEGORIES.find((c) => c.key === item.category) || { label: item.category, emoji: '📦' };

                      return (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 600 }}>{item.title}</td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {catInfo.emoji} {catInfo.label}
                          </td>
                          <td>
                            {item.status === 'comprado' && (
                              <span className="budget-status-tag tag-comprado">✅ Comprado</span>
                            )}
                            {item.status === 'presente' && (
                              <span className="budget-status-tag tag-presente">🎁 Presente</span>
                            )}
                            {item.status === 'pendente' && (
                              <span className="budget-status-tag tag-pendente">⏳ Pendente</span>
                            )}
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                            R$ {parseFloat(item.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td>
                            <button
                              className="btn-icon btn-danger-icon"
                              onClick={() => handleDeleteBudgetItem(item.id)}
                              title="Remover item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
