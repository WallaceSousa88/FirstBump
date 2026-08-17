import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { api } from '../services/api';

export default function Checklists() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('enxoval');

  const fetchItems = async () => {
    try {
      const data = await api.getChecklists();
      setItems(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title) return;
    await api.createChecklistItem({ title, category, is_completed: false });
    setTitle('');
    fetchItems();
  };

  const handleToggle = async (id, currentStatus) => {
    await api.updateChecklistItem(id, { is_completed: !currentStatus });
    fetchItems();
  };

  const handleDelete = async (id) => {
    await api.deleteChecklistItem(id);
    fetchItems();
  };

  return (
    <div>
      <h1 className="page-title">Checklists</h1>
      
      <div className="card">
        <form onSubmit={handleAdd} className="flex-row" style={{ alignItems: 'flex-end', marginBottom: '20px' }}>
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
              <option value="enxoval">Enxoval</option>
              <option value="maternidade">Mala Maternidade</option>
              <option value="quarto">Quarto do Bebê</option>
            </select>
          </div>
          <button className="btn btn-primary" type="submit">Adicionar</button>
        </form>

        <div style={{ marginTop: '24px' }}>
          {items.length === 0 ? (
            <div className="empty-state">Nenhum item na lista ainda.</div>
          ) : (
            items.map(item => (
              <div key={item.id} className="list-item">
                <div className="flex-row">
                  <input 
                    type="checkbox" 
                    className="checkbox-custom"
                    checked={item.is_completed}
                    onChange={() => handleToggle(item.id, item.is_completed)}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className={item.is_completed ? 'completed-text' : ''} style={{ fontWeight: 500 }}>
                      {item.title}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </span>
                  </div>
                </div>
                <button className="btn-icon btn-danger-icon" onClick={() => handleDelete(item.id)} title="Remover">
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
