import { useEffect, useState } from 'react';
import { storage } from '../services/storage';
import { CalendarHeart, ListChecks } from 'lucide-react';

export default function Dashboard() {
  const [dueDate, setDueDate] = useState('');
  const [inputDate, setInputDate] = useState('');
  const [weeks, setWeeks] = useState(0);
  const [progress, setProgress] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);

  useEffect(() => {
    const setting = storage.getSetting('due_date');
    if (setting && setting.value) {
      setDueDate(setting.value);
      calculateWeeks(setting.value);
    }

    const today = new Date().toISOString().split('T')[0];
    const events = storage.getAgendaEvents();
    setUpcomingEvents(events.filter(e => e.date >= today).slice(0, 2));

    const checklists = storage.getChecklists();
    setPendingTasks(checklists.filter(c => !c.is_completed).slice(0, 3));
  }, []);

  const calculateWeeks = (dateString) => {
    const dpp = new Date(dateString);
    const dum = new Date(dpp.getTime() - (280 * 24 * 60 * 60 * 1000));
    const now = new Date();
    const diffDays = Math.floor((now - dum) / (1000 * 60 * 60 * 24));
    let currentWeek = Math.max(0, Math.min(40, Math.floor(diffDays / 7)));
    setWeeks(currentWeek);
    setProgress((currentWeek / 40) * 100);
  };

  const handleSaveDate = (e) => {
    e.preventDefault();
    if (!inputDate) return;
    storage.setSetting('due_date', inputDate);
    setDueDate(inputDate);
    calculateWeeks(inputDate);
  };

  return (
    <div>
      <h1 className="page-title">Resumo da Gestação</h1>

      {!dueDate ? (
        <div className="card" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
          <h2 className="card-title" style={{ color: '#1e3a8a' }}>Bem-vindo ao FirstBump! 👋</h2>
          <p className="card-text" style={{ marginBottom: '16px', color: '#1e40af' }}>
            Para personalizarmos o seu painel, insira a <b>Data Prevista do Parto (DPP)</b> calculada pelo seu médico.
          </p>
          <form onSubmit={handleSaveDate} className="flex-row">
            <input
              type="date" className="form-input" style={{ maxWidth: '200px' }}
              value={inputDate} onChange={(e) => setInputDate(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">Salvar Data</button>
          </form>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '4px' }}>Semana {weeks}</h2>
          <p className="card-text">O grande dia está marcado para: <b>{dueDate.split('-').reverse().join('/')}</b></p>
          <div style={{ maxWidth: '500px', margin: '24px auto 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              <span>Semana 1</span>
              <span>Semana 40</span>
            </div>
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          <button
            onClick={() => { setDueDate(''); storage.setSetting('due_date', ''); }}
            style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Alterar data
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '32px' }}>
        <div className="card">
          <div className="flex-row" style={{ marginBottom: '16px', color: 'var(--primary)' }}>
            <CalendarHeart size={22} />
            <h2 className="card-title" style={{ margin: 0 }}>Próximas Consultas</h2>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="card-text">Nenhum evento futuro agendado.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingEvents.map(ev => (
                <div key={ev.id} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                  <div style={{ fontWeight: 600 }}>{ev.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent)', marginTop: '4px' }}>
                    {ev.date.split('-').reverse().join('/')} · {ev.type}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex-row" style={{ marginBottom: '16px', color: 'var(--primary)' }}>
            <ListChecks size={22} />
            <h2 className="card-title" style={{ margin: 0 }}>Tarefas Pendentes</h2>
          </div>
          {pendingTasks.length === 0 ? (
            <p className="card-text">Tudo em dia por aqui! ✅</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingTasks.map(task => (
                <div key={task.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--danger)', flexShrink: 0 }}></div>
                  <span style={{ fontWeight: 500 }}>{task.title}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{task.category}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
