import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ checklists: 0, diary: 0, agenda: 0 });

  useEffect(() => {
    // In a real app we might have a specific stats endpoint, 
    // for now we just fetch all to get counts
    const fetchStats = async () => {
      try {
        const [chk, diary, agenda] = await Promise.all([
          api.getChecklists(),
          api.getDiaryEntries(),
          api.getAgendaEvents()
        ]);
        setStats({
          checklists: chk.length,
          diary: diary.length,
          agenda: agenda.length
        });
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="page-title">Resumo Geral</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
        Bem-vindo ao FirstBump! Acompanhe o seu progresso e próximos passos.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        <div className="card">
          <h2 className="card-title">Checklists</h2>
          <p className="card-text">Você tem {stats.checklists} itens registrados.</p>
        </div>
        <div className="card">
          <h2 className="card-title">Diário de Evolução</h2>
          <p className="card-text">{stats.diary} registros efetuados na sua jornada.</p>
        </div>
        <div className="card">
          <h2 className="card-title">Agenda Médica</h2>
          <p className="card-text">{stats.agenda} eventos ou consultas marcadas.</p>
        </div>
      </div>
    </div>
  );
}
