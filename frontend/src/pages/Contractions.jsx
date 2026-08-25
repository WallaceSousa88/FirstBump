import { useState, useEffect, useRef } from 'react';
import { Play, Square, Trash2, Clock, Activity, AlertCircle, Info, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { storage } from '../services/storage';

function formatSeconds(totalSeconds) {
  if (totalSeconds === null || totalSeconds === undefined || totalSeconds < 0) return '-';
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

function formatTimerDigits(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const INTENSITY_CONFIG = {
  leve: { label: 'Leve', color: '#16a34a', bg: '#dcfce7' },
  moderada: { label: 'Moderada', color: '#ca8a04', bg: '#fef9c3' },
  intensa: { label: 'Intensa', color: '#dc2626', bg: '#fee2e2' },
};

export default function Contractions() {
  const [contractions, setContractions] = useState(() => storage.getContractions());
  const [isActive, setIsActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [intensity, setIntensity] = useState('moderada');
  const [notes, setNotes] = useState('');
  const [startTime, setStartTime] = useState(null);

  const timerRef = useRef(null);

  const refresh = () => setContractions(storage.getContractions());

  // Cronômetro em tempo real
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const handleStart = () => {
    setIsActive(true);
    setElapsedSeconds(0);
    setStartTime(new Date().toISOString());
  };

  const handleStop = () => {
    if (!isActive) return;
    const now = new Date().toISOString();
    const duration = Math.max(1, elapsedSeconds);

    storage.createContraction({
      startTime: startTime || now,
      endTime: now,
      durationSeconds: duration,
      intensity,
      notes: notes.trim() || null,
    });

    setIsActive(false);
    setElapsedSeconds(0);
    setStartTime(null);
    setNotes('');
    refresh();
  };

  const handleDelete = (id) => {
    storage.deleteContraction(id);
    refresh();
  };

  const handleClearAll = () => {
    if (window.confirm('Tem certeza que deseja apagar todo o histórico de contrações desta sessão?')) {
      storage.clearContractions();
      refresh();
    }
  };

  // Calcular intervalos entre contrações (do início de uma ao início da seguinte)
  // Como a lista está ordenada do mais recente para o mais antigo:
  const contractionsWithIntervals = contractions.map((item, index) => {
    // O próximo item no array é a contração ANTERIOR no tempo
    const previousTime = contractions[index + 1];
    let intervalSeconds = null;

    if (previousTime) {
      const diffMs = new Date(item.startTime).getTime() - new Date(previousTime.startTime).getTime();
      intervalSeconds = Math.max(0, Math.round(diffMs / 1000));
    }

    return {
      ...item,
      intervalSeconds,
    };
  });

  // Estatísticas das últimas contrações (últimas 5 ou última 1 hora)
  const recentContractions = contractionsWithIntervals.slice(0, 6);
  const avgDuration = recentContractions.length > 0
    ? Math.round(recentContractions.reduce((acc, c) => acc + c.durationSeconds, 0) / recentContractions.length)
    : 0;

  const validIntervals = recentContractions
    .map((c) => c.intervalSeconds)
    .filter((i) => i !== null && i > 0 && i < 3600); // menores que 1 hora

  const avgInterval = validIntervals.length > 0
    ? Math.round(validIntervals.reduce((acc, i) => acc + i, 0) / validIntervals.length)
    : null;

  // Avaliação médica (Regra 5-1-1: contrações a cada 5 min ou menos, durando ~1 min, por 1 hora)
  let statusBanner = null;

  if (contractions.length >= 3) {
    if (avgInterval !== null && avgInterval <= 300 && avgDuration >= 45) {
      statusBanner = {
        type: 'alert',
        title: '🚨 Hora de ir para a Maternidade! (Regra 5-1-1)',
        message:
          'Suas contrações estão vindo a cada 5 minutos (ou menos) e durando cerca de 1 minuto. Entre em contato com seu obstetra/equipe médica e dirija-se à maternidade!',
      };
    } else if (avgInterval !== null && avgInterval <= 600) {
      statusBanner = {
        type: 'active',
        title: '🟡 Trabalho de Parto Ativo em Evolução',
        message:
          'As contrações estão ficando mais regulares e frequentes (a cada 5-10 minutos). Deixe a mala da maternidade pronta e monitore de perto!',
      };
    } else {
      statusBanner = {
        type: 'calm',
        title: '🟢 Fase Inicial / Latente',
        message:
          'As contrações ainda estão espaçadas ou irregulares. Descanse, respire fundo, hidrate-se e continue cronometrando.',
      };
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '6px' }}>Cronômetro de Contrações</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Monitore a duração e o intervalo das contrações para saber o momento exato de ir para a maternidade.
          </p>
        </div>

        {contractions.length > 0 && (
          <button
            onClick={handleClearAll}
            className="btn"
            style={{ border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)' }}
          >
            <RotateCcw size={14} /> Limpar Sessão
          </button>
        )}
      </div>

      {/* Banner de Recomendação Médica */}
      {statusBanner && (
        <div
          className={`hospital-banner ${
            statusBanner.type === 'alert'
              ? 'hospital-banner-alert'
              : statusBanner.type === 'active'
              ? 'hospital-banner-active'
              : 'hospital-banner-calm'
          }`}
        >
          <AlertCircle size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ fontSize: '1.05rem', display: 'block', marginBottom: '4px' }}>
              {statusBanner.title}
            </strong>
            <span style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>{statusBanner.message}</span>
          </div>
        </div>
      )}

      {/* Card Principal do Cronômetro */}
      <div className="card timer-hero-card">
        <div style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
          {isActive ? 'Contração em Andamento' : 'Pronto para Cronometrar'}
        </div>

        <div className="timer-digits">{formatTimerDigits(elapsedSeconds)}</div>

        <button
          onClick={isActive ? handleStop : handleStart}
          className={`timer-button ${isActive ? 'timer-button-active' : 'timer-button-idle'}`}
        >
          {isActive ? (
            <>
              <Square size={36} fill="white" />
              <span>PARAR</span>
            </>
          ) : (
            <>
              <Play size={38} fill="white" style={{ marginLeft: '4px' }} />
              <span>INICIAR</span>
            </>
          )}
        </button>

        {/* Intensidade e Notas enquanto cronometra */}
        <div style={{ marginTop: '24px', width: '100%', maxWidth: '360px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            Intensidade da dor:
          </label>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '12px' }}>
            {Object.entries(INTENSITY_CONFIG).map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => setIntensity(key)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: 'var(--radius)',
                  border: `1.5px solid ${intensity === key ? config.color : 'var(--border)'}`,
                  backgroundColor: intensity === key ? config.bg : 'transparent',
                  color: intensity === key ? config.color : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {config.label}
              </button>
            ))}
          </div>

          <input
            className="form-input"
            placeholder="Observações (ex: dor nas costas, perda de líquido...)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ fontSize: '0.85rem', textAlign: 'center' }}
          />
        </div>
      </div>

      {/* Grid de Estatísticas */}
      {contractions.length > 0 && (
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-box-label">Total de Contrações</div>
            <div className="stat-box-value">{contractions.length}</div>
          </div>

          <div className="stat-box">
            <div className="stat-box-label">Duração Média (Recente)</div>
            <div className="stat-box-value" style={{ color: 'var(--accent)' }}>
              {formatSeconds(avgDuration)}
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-box-label">Intervalo Médio</div>
            <div className="stat-box-value" style={{ color: '#9333ea' }}>
              {formatSeconds(avgInterval)}
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Histórico de Contrações */}
      <div className="card">
        <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '12px' }}>
          <div className="flex-row" style={{ color: 'var(--primary)' }}>
            <Activity size={20} />
            <h2 className="card-title" style={{ margin: 0 }}>Histórico da Sessão</h2>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {contractions.length} {contractions.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        {contractions.length === 0 ? (
          <div className="empty-state">
            Nenhuma contração registrada ainda. Clique no botão <b>INICIAR</b> assim que sentir a contração começar.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="contractions-table">
              <thead>
                <tr>
                  <th>Horário</th>
                  <th>Duração</th>
                  <th>Intervalo (Frequência)</th>
                  <th>Intensidade</th>
                  <th>Notas</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {contractionsWithIntervals.map((c) => {
                  const tag = INTENSITY_CONFIG[c.intensity] || INTENSITY_CONFIG.moderada;
                  const dateObj = new Date(c.startTime);
                  const timeFormatted = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  const dateFormatted = dateObj.toLocaleDateString([], { day: '2-digit', month: '2-digit' });

                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{timeFormatted}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dateFormatted}</div>
                      </td>

                      <td>
                        <span style={{ fontWeight: 600, color: '#2563eb' }}>
                          {formatSeconds(c.durationSeconds)}
                        </span>
                      </td>

                      <td>
                        {c.intervalSeconds !== null ? (
                          <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                            {formatSeconds(c.intervalSeconds)}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Primeira</span>
                        )}
                      </td>

                      <td>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '12px',
                            backgroundColor: tag.bg,
                            color: tag.color,
                          }}
                        >
                          {tag.label}
                        </span>
                      </td>

                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '200px' }}>
                        {c.notes || '-'}
                      </td>

                      <td>
                        <button
                          className="btn-icon btn-danger-icon"
                          onClick={() => handleDelete(c.id)}
                          title="Excluir este registro"
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

      {/* Guia Educativo sobre a Regra 5-1-1 */}
      <div className="card" style={{ backgroundColor: '#f8fafc' }}>
        <div className="flex-row" style={{ marginBottom: '12px', color: 'var(--primary)' }}>
          <Info size={20} />
          <h3 className="card-title" style={{ margin: 0, fontSize: '1rem' }}>Como funciona a Regra 5-1-1?</h3>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '12px' }}>
          A <b>Regra 5-1-1</b> é o padrão de referência utilizado pela maioria dos obstetras e maternidades para indicar o trabalho de parto ativo:
        </p>

        <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: '16px' }}>
          <li>
            <b>5 minutos:</b> O intervalo entre o início de uma contração e o início da próxima é de 5 minutos ou menos.
          </li>
          <li>
            <b>1 minuto:</b> Cada contração tem duração constante de pelo menos 45 a 60 segundos.
          </li>
          <li>
            <b>1 hora:</b> Esse padrão regular se repete de forma contínua por pelo menos 1 hora seguida.
          </li>
        </ul>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
          ⚠️ <b>Atenção:</b> Se a bolsa romper (especialmente com líquido esverdeado ou escuro), se houver sangramento intenso ou febre, dirija-se à maternidade imediatamente, independentemente do cronômetro.
        </div>
      </div>
    </div>
  );
}
