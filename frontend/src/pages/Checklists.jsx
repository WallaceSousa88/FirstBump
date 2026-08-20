import { useState } from 'react';
import { ListChecks } from 'lucide-react';
import { storage } from '../services/storage';

export default function Checklists() {
  const [items, setItems] = useState(() => storage.getChecklists());
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('enxoval');

  const refresh = () => setItems(storage.getChecklists());

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    storage.createChecklistItem({ title, category, is_completed: false });
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

  const categories = ['enxoval', 'maternidade', 'quarto'];
  const categoryLabel = { enxoval: 'Enxoval', maternidade: 'Mala Maternidade', quarto: 'Quarto do Bebê' };
  const completed = items.filter(i => i.is_completed).length;

  return (
    <div>
      <h1 className="page-title">Checklists</h1>

      {items.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            <span>{completed} de {items.length} concluídos</span>
            <span>{Math.round((completed / items.length) * 100)}%</span>
          </div>
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${(completed / items.length) * 100}%`, backgroundColor: 'var(--success)' }}></div>
          </div>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleAdd} className="flex-row" style={{ alignItems: 'flex-end', gap: '12px' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Novo Item</label>
            <input
              className="form-input"
              placeholder="Ex: Fraldas, roupinhas..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ width: '200px', marginBottom: 0 }}>
            <label className="form-label">Categoria</label>
            <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{categoryLabel[c]}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" type="submit">Adicionar</button>
        </form>
      </div>

      {categories.map(cat => {
        const catItems = items.filter(i => i.category === cat);
        if (catItems.length === 0) return null;
        return (
          <div key={cat} className="card">
            <div className="flex-row" style={{ marginBottom: '12px', color: 'var(--primary)' }}>
              <ListChecks size={18} />
              <h2 className="card-title" style={{ margin: 0 }}>{categoryLabel[cat]}</h2>
            </div>
            {catItems.map(item => (
              <div key={item.id} className="list-item">
                <div className="flex-row">
                  <input
                    type="checkbox"
                    className="checkbox-custom"
                    checked={item.is_completed}
                    onChange={() => handleToggle(item.id, item.is_completed)}
                  />
                  <span className={item.is_completed ? 'completed-text' : ''} style={{ fontWeight: 500 }}>
                    {item.title}
                  </span>
                </div>
                <button className="btn-icon btn-danger-icon" onClick={() => handleDelete(item.id)} title="Remover">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4h6v2"></path></svg>
                </button>
              </div>
            ))}
          </div>
        );
      })}

      {items.length === 0 && <div className="empty-state card">Nenhum item na lista ainda.</div>}
    </div>
  );
}
