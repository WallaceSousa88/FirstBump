import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { storage } from '../services/storage';

export default function Agenda() {
  const [events, setEvents] = useState(() => storage.getAgendaEvents());
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('consulta');
  const [description, setDescription] = useState('');

  const refresh = () => setEvents(storage.getAgendaEvents());

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    storage.createAgendaEvent({ title, date, type, description });
    setTitle('');
    setDescription('');
    setDate('');
    refresh();
  };

  const handleDelete = (id) => {
    storage.deleteAgendaEvent(id);
    refresh();
  };

  const today = new Date().toISOString().split('T')[0];
  const upcoming = events.filter(e => e.date >= today);
  const past = events.filter(e => e.date < today);

  const typeColors = {
    consulta: '#dbeafe',
    exame: '#dcfce7',
    vacina: '#fef9c3',
    outro: '#f3e8ff',
  };

  const EventCard = ({ event }) => (
    <div key={event.id} className="card" style={{ marginBottom: 0 }}>
      <div className="flex-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{
            fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
            padding: '4px 8px', borderRadius: '12px',
            backgroundColor: typeColors[event.type] || '#f3f4f6',
            color: 'var(--text-main)', display: 'inline-block', marginBottom: '8px'
          }}>
            {event.type}
          </span>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '4px' }}>{event.title}</h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 500 }}>
            📅 {event.date.split('-').reverse().join('/')}
          </div>
        </div>
        <button className="btn-icon btn-danger-icon" onClick={() => handleDelete(event.id)}>
          <Trash2 size={16} />
        </button>
      </div>
      {event.description && (
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px' }}>{event.description}</p>
      )}
    </div>
  );

  return (
    <div>
      <h1 className="page-title">Agenda Médica</h1>

      <div className="card">
        <h2 className="card-title">Marcar Compromisso</h2>
        <form onSubmit={handleAdd}>
          <div className="flex-row" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: '2 1 200px' }}>
              <label className="form-label">Título</label>
              <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Ultrassom Morfológico" />
            </div>
            <div className="form-group" style={{ flex: '1 1 140px' }}>
              <label className="form-label">Data</label>
              <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="form-group" style={{ flex: '1 1 140px' }}>
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

      {upcoming.length > 0 && (
        <>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
            Próximos
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {upcoming.map(ev => <EventCard key={ev.id} event={ev} />)}
          </div>
        </>
      )}

      {past.length > 0 && (
        <>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
            Histórico
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', opacity: 0.65 }}>
            {past.map(ev => <EventCard key={ev.id} event={ev} />)}
          </div>
        </>
      )}

      {events.length === 0 && <div className="empty-state card">Nenhum evento agendado.</div>}
    </div>
  );
}
