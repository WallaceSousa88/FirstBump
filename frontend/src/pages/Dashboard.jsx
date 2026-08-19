import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CalendarHeart, ListChecks } from 'lucide-react';

export default function Dashboard() {
  const [dueDate, setDueDate] = useState('');
  const [inputDate, setInputDate] = useState('');
  const [weeks, setWeeks] = useState(0);
  const [progress, setProgress] = useState(0);

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Due Date Setting
        const setting = await api.getSetting('due_date');
        if (setting && setting.value) {
          setDueDate(setting.value);
          calculateWeeks(setting.value);
        }

        // 2. Fetch Events
        const events = await api.getAgendaEvents();
        const today = new Date().toISOString().split('T')[0];
        const futureEvents = events
          .filter(e => e.date >= today)
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(0, 2);
        setUpcomingEvents(futureEvents);

        // 3. Fetch Checklists
        const checklists = await api.getChecklists();
        const pending = checklists.filter(c => !c.is_completed).slice(0, 3);
        setPendingTasks(pending);

      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };
    fetchData();
  }, []);

  const calculateWeeks = (dateString) => {
    // Due date = 40 weeks.
    // DUM (Last Menstrual Period) = Due Date - 280 days
    const dpp = new Date(dateString);
    const dum = new Date(dpp.getTime() - (280 * 24 * 60 * 60 * 1000));
    const now = new Date();

    const diffTime = now.getTime() - dum.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
    let currentWeek = Math.floor(diffDays / 7);

    if (currentWeek < 0) currentWeek = 0;
    if (currentWeek > 40) currentWeek = 40;

    setWeeks(currentWeek);
    setProgress((currentWeek / 40) * 100);
  };

  const handleSaveDate = async (e) => {
    e.preventDefault();
    if (!inputDate) return;
    await api.setSetting('due_date', inputDate);
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
            Para personalizarmos o seu painel, por favor, insira a <b>Data Prevista do Parto (DPP)</b> calculada pelo seu médico.
          </p>
          <form onSubmit={handleSaveDate} className="flex-row">
            <input 
              type="date" 
              className="form-input" 
              style={{ maxWidth: '200px' }}
              value={inputDate} 
              onChange={(e) => setInputDate(e.target.value)} 
            />
            <button className="btn btn-primary" type="submit">Salvar Data</button>
          </form>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '8px' }}>
            Semana {weeks}
          </h2>
          <p className="card-text">O grande dia está marcado para: {dueDate.split('-').reverse().join('/')}</p>
          
          <div style={{ maxWidth: '500px', margin: '24px auto 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Início</span>
              <span>40 Semanas</span>
            </div>
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '32px' }}>
        
        {/* Widget Agenda */}
        <div className="card">
          <div className="flex-row" style={{ marginBottom: '16px', color: 'var(--primary)' }}>
            <CalendarHeart size={24} />
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
                    {ev.date.split('-').reverse().join('/')} - {ev.type}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Widget Checklist */}
        <div className="card">
          <div className="flex-row" style={{ marginBottom: '16px', color: 'var(--primary)' }}>
            <ListChecks size={24} />
            <h2 className="card-title" style={{ margin: 0 }}>Tarefas Pendentes</h2>
          </div>
          {pendingTasks.length === 0 ? (
            <p className="card-text">Tudo em dia por aqui!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingTasks.map(task => (
                <div key={task.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--danger)' }}></div>
                  <span style={{ fontWeight: 500 }}>{task.title}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {task.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
