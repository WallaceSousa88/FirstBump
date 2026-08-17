import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { api } from '../services/api';

export default function Diary() {
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchEntries = async () => {
    try {
      const data = await api.getDiaryEntries();
      setEntries(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchEntries(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    await api.createDiaryEntry({ title, content, date });
    setTitle('');
    setContent('');
    fetchEntries();
  };

  const handleDelete = async (id) => {
    await api.deleteDiaryEntry(id);
    fetchEntries();
  };

  return (
    <div>
      <h1 className="page-title">Diário de Evolução</h1>

      <div className="card">
        <h2 className="card-title">Novo Registro</h2>
        <form onSubmit={handleAdd}>
          <div className="flex-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Título</label>
              <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Como você está se sentindo hoje?" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Data</label>
              <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Relato</label>
            <textarea className="form-textarea" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Escreva os detalhes, sintomas, pensamentos..."></textarea>
          </div>
          <button className="btn btn-primary" type="submit">Salvar Registro</button>
        </form>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {entries.length === 0 && <div className="empty-state card">Nenhum registro encontrado.</div>}
        {entries.map(entry => (
          <div key={entry.id} className="card" style={{ marginBottom: 0 }}>
            <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{entry.title}</h3>
              <div className="flex-row">
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{entry.date}</span>
                <button className="btn-icon btn-danger-icon" onClick={() => handleDelete(entry.id)}><Trash2 size={16}/></button>
              </div>
            </div>
            <p style={{ color: 'var(--text-main)', whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{entry.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
