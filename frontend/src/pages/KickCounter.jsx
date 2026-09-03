import { useState, useEffect, useRef } from 'react';
import { Footprints, Timer, Sparkles, CheckCircle2, RotateCcw, Trash2, Undo2, Info, AlertTriangle, Heart, Clock } from 'lucide-react';
import { storage } from '../services/storage';

export default function KickCounter() {
  const [sessions, setSessions] = useState(() => storage.getKickSessions());
  const [kicks, setKicks] = useState([]);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [notes, setNotes] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const timerRef = useRef(null);
  const TARGET_KICKS = 10;

  const refreshSessions = () => setSessions(storage.getKickSessions());

  // Cronômetro da sessão ativa
  useEffect(() => {
    if (sessionStartTime && !isCompleted) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        setElapsedSeconds(Math.floor((now - sessionStartTime) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [sessionStartTime, isCompleted]);

  // Formata segundos em MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Registrar um novo chute
  const handleRegisterKick = () => {
    const now = Date.now();
    let start = sessionStartTime;

    // Inicia a sessão no primeiro chute
    if (!start) {
      start = now;
      setSessionStartTime(now);
    }

    const newKick = {
      id: kicks.length + 1,
      time: new Date(now).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timestamp: now,
    };

    const nextKicks = [...kicks, newKick];
    setKicks(nextKicks);

    // Feedback háptico se disponível no celular
    if ('vibrate' in navigator) {
      navigator.vibrate(60);
    }

    // Se completou a meta de 10 chutes
    if (nextKicks.length >= TARGET_KICKS) {
      setIsCompleted(true);
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 150]);
      }
    }
  };

  // Desfazer último chute
  const handleUndoLast = () => {
    if (kicks.length === 0) return;
    const nextKicks = kicks.slice(0, -1);
    setKicks(nextKicks);
    setIsCompleted(false);
    if (nextKicks.length === 0) {
      setSessionStartTime(null);
      setElapsedSeconds(0);
    }
  };

  // Reiniciar sessão
  const handleResetSession = () => {
    if (kicks.length > 0 && !window.confirm('Deseja cancelar esta contagem e reiniciar?')) {
      return;
    }
    setKicks([]);
    setSessionStartTime(null);
    setElapsedSeconds(0);
    setIsCompleted(false);
    setNotes('');
  };

  // Salvar sessão no histórico
  const handleSaveSession = (e) => {
    e.preventDefault();
    if (kicks.length === 0) return;

    const sessionData = {
      startTime: new Date(sessionStartTime).toISOString(),
      endTime: new Date().toISOString(),
      durationSeconds: elapsedSeconds,
      kickCount: kicks.length,
      notes: notes.trim() || null,
      kicksHistory: kicks,
    };

    storage.createKickSession(sessionData);
    refreshSessions();

    setKicks([]);
    setSessionStartTime(null);
    setElapsedSeconds(0);
    setIsCompleted(false);
    setNotes('');

    setFeedbackMsg('Sessão de contagem de chutes salva com sucesso!');
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleDeleteSession = (id) => {
    storage.deleteKickSession(id);
    refreshSessions();
  };

  // Estatísticas das sessões
  const totalSessions = sessions.length;
  const avgDurationSeconds = totalSessions > 0
    ? Math.round(sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) / totalSessions)
    : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '6px' }}>Contador de Chutes do Bebê</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Monitore o padrão de movimentos do seu bebê no 3º trimestre (Regra dos 10 Chutes / OMS).
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

      {/* Hero Card Interativo de Contagem */}
      <div className="kick-hero-card">
        {/* Status e Tempo */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
          <Clock size={16} />
          <span>
            {sessionStartTime ? `Tempo decorrido: ${formatTime(elapsedSeconds)}` : 'Toque no botão para iniciar a contagem'}
          </span>
        </div>

        {/* Botão Grande de Chute */}
        <button
          onClick={handleRegisterKick}
          disabled={isCompleted}
          className="kick-main-btn"
          style={{ opacity: isCompleted ? 0.6 : 1 }}
          title="Registrar movimento do bebê"
        >
          <Footprints size={44} style={{ marginBottom: '4px' }} />
          <span style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1 }}>
            {kicks.length} / {TARGET_KICKS}
          </span>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9, marginTop: '4px' }}>
            {isCompleted ? 'Concluído' : 'Chute'}
          </span>
        </button>

        {/* Indicador Visual das 10 Bolinhas */}
        <div className="kick-progress-bar-row">
          {Array.from({ length: TARGET_KICKS }, (_, i) => (
            <div key={i} className={`kick-dot ${i < kicks.length ? 'filled' : ''}`}>
              {i + 1}
            </div>
          ))}
        </div>

        {/* Controles de Desfazer e Reiniciar */}
        {kicks.length > 0 && !isCompleted && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
            <button
              onClick={handleUndoLast}
              className="btn"
              style={{ border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Undo2 size={15} /> Desfazer Último
            </button>

            <button
              onClick={handleResetSession}
              className="btn"
              style={{ border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '0.85rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RotateCcw size={15} /> Reiniciar
            </button>
          </div>
        )}

        {/* Banner de Celebração de Meta Concluída */}
        {isCompleted && (
          <div
            style={{
              backgroundColor: 'var(--surface)',
              border: '2px solid #10b981',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              maxWidth: '480px',
              margin: '24px auto 0',
              boxShadow: 'var(--shadow-md)',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 700, fontSize: '1.1rem', marginBottom: '6px' }}>
              <Sparkles size={20} /> Meta de 10 Chutes Atingida!
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', margin: '0 0 16px' }}>
              Seu bebê atingiu 10 movimentos em <b>{formatTime(elapsedSeconds)}</b>. Excelente sinal de atividade e bem-estar!
            </p>

            <form onSubmit={handleSaveSession}>
              <input
                className="form-input"
                placeholder="Anotação opcional (ex: após o almoço, deitada de lado...)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ marginBottom: '12px', fontSize: '0.85rem' }}
              />

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button className="btn btn-primary" type="submit" style={{ flex: 1 }}>
                  Salvar Sessão
                </button>
                <button
                  type="button"
                  onClick={handleResetSession}
                  className="btn"
                  style={{ border: '1px solid var(--border)' }}
                >
                  Nova Contagem
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Painel de Métricas */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-box">
          <div className="stat-box-label">Total de Sessões</div>
          <div className="stat-box-value" style={{ color: 'var(--primary)' }}>
            {totalSessions}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {totalSessions === 1 ? 'sessão realizada' : 'sessões realizadas'}
          </span>
        </div>

        <div className="stat-box">
          <div className="stat-box-label">Tempo Médio para 10 Chutes</div>
          <div className="stat-box-value" style={{ color: '#db2777' }}>
            {totalSessions > 0 ? `${Math.round(avgDurationSeconds / 60)} min` : '--'}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Meta padrão: menos de 2 horas
          </span>
        </div>

        <div className="stat-box">
          <div className="stat-box-label">Última Atividade</div>
          <div className="stat-box-value" style={{ color: 'var(--accent)', fontSize: '1.25rem' }}>
            {sessions.length > 0 ? new Date(sessions[0].startTime).toLocaleDateString('pt-BR') : '--'}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {sessions.length > 0 ? new Date(sessions[0].startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Sem registros'}
          </span>
        </div>
      </div>

      {/* Histórico de Sessões */}
      <div className="card">
        <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '14px' }}>
          <div className="flex-row" style={{ color: 'var(--primary)' }}>
            <Footprints size={20} />
            <h2 className="card-title" style={{ margin: 0 }}>Histórico de Movimentos</h2>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {sessions.length} {sessions.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        {sessions.length === 0 ? (
          <div className="empty-state">
            Nenhuma sessão de contagem registrada ainda. Toque no botão de chute acima quando sentir seu bebê se movimentar!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="contractions-table">
              <thead>
                <tr>
                  <th>Data e Hora</th>
                  <th>Duração</th>
                  <th>Movimentos</th>
                  <th>Notas</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((sess) => {
                  const dateFormatted = new Date(sess.startTime).toLocaleDateString('pt-BR');
                  const timeFormatted = new Date(sess.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <tr key={sess.id}>
                      <td>
                        <b>{dateFormatted}</b> às {timeFormatted}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--accent)' }}>
                          {formatTime(sess.durationSeconds || 0)}
                        </span>
                      </td>
                      <td>
                        <span style={{ padding: '2px 8px', borderRadius: '999px', background: 'rgba(219, 39, 119, 0.15)', color: '#db2777', fontWeight: 600, fontSize: '0.8rem' }}>
                          {sess.kickCount} chutes
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '220px' }}>
                        {sess.notes || '-'}
                      </td>
                      <td>
                        <button
                          className="btn-icon btn-danger-icon"
                          onClick={() => handleDeleteSession(sess.id)}
                          title="Remover sessão"
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

      {/* Card Educativo e Orientações Médicas */}
      <div className="card" style={{ backgroundColor: 'var(--surface-hover)' }}>
        <div className="flex-row" style={{ marginBottom: '12px', color: 'var(--primary)' }}>
          <Info size={20} />
          <h3 className="card-title" style={{ margin: 0, fontSize: '1rem' }}>
            Como funciona a contagem de movimentos fetais?
          </h3>
        </div>

        <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <b>🕒 Quando fazer:</b> A partir da <b>28ª semana</b> de gestação, escolha 1 ou 2 momentos do dia em que o bebê costuma estar mais acordado (geralmente após as refeições ou à noite).
          </div>
          <div>
            <b>🛌 Posição recomendada:</b> Deite-se confortavelmente virada para o <b>lado esquerdo</b> (decúbito lateral esquerdo) ou sente-se relaxada com as mãos na barriga.
          </div>
          <div>
            <b>🦶 O que conta como movimento:</b> Chutes, cambalhotas, giros, cotoveladas e estiramentos contam. Soluços contínuos e rítmicos não são contabilizados.
          </div>
          <div>
            <b>⏱️ Meta esperada:</b> A maioria dos bebês saudáveis realiza 10 movimentos em menos de <b>30 a 60 minutos</b>.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '12px', background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.4)', borderRadius: 'var(--radius)', marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
          <AlertTriangle size={18} style={{ color: '#ca8a04', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <b>Sinal de Alerta:</b> Se você passar <b>mais de 2 horas</b> sem sentir 10 movimentos mesmo após se alimentar, ou notar uma redução drástica e repentina no padrão habitual do seu bebê, entre em contato com seu obstetra ou dirija-se à maternidade para avaliação médica preventiva.
          </div>
        </div>
      </div>
    </div>
  );
}
