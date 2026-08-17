import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { api } from '../services/api';

export default function Agenda() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('consulta');
  const [description, setDescription] = useState('');

  const fetchEvents = async () => {
    try {
      const data = await api.getAgendaEvents();
      setEvents(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title || !date) return;
    await api.createAgendaEvent({ title, date, type, description });
    setTitle('');
    setDescription('');
    setDate('');
    fetchEvents();
  };

  const handleDelete = async (id) => {
    await api.deleteAgendaEvent(id);
    fetchEvents();
  };

  return (
    <div>
      <h1 className="page-title">Agenda Médica</h1>

      <div className="card">
        <h2 className="card-title">Marcar Compromisso</h2>
        <form onSubmit={handleAdd}>
          <div className="flex-row" style={{ alignItems: 'flex-start' }}>
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Título</label>
              <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Ultrassom Morfológico" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Data</label>
              <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Tipo</label>
              <select className="form-input" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="consulta">Consulta</option>
                <option value="exame">Exame</option>
                <option value="vacina">Vacina</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Observações (Opcional)</label>
            <input className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Levar exames anteriores, jejum de 8h..." />
          </div>
          <button className="btn btn-primary" type="submit">Adicionar à Agenda</button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {events.length === 0 && <div className="empty-state" style={{ gridColumn: '1 / -1' }}>Nenhum evento agendado.</div>}
        {events.map(event => (
          <div key={event.id} className="card" style={{ marginBottom: 0 }}>
            <div className="flex-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  textTransform: 'uppercase',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--border)',
                  color: 'var(--text-main)',
                  display: 'inline-block',
                  marginBottom: '8px'
                }}>
                  {event.type}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>{event.title}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 500, marginBottom: '8px' }}>
                  📅 {event.date.split('-').reverse().join('/')}
                </div>
              </div>
              <button className="btn-icon btn-danger-icon" onClick={() => handleDelete(event.id)}><Trash2 size={16}/></button>
            </div>
            {event.description && <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{event.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
