import { useState, useEffect } from 'react';
import { Scale, TrendingUp, Plus, Trash2, Info, Sparkles, CheckCircle2, AlertCircle, Edit3, HelpCircle } from 'lucide-react';
import { storage } from '../services/storage';
import { calculateBMI, getBMICategoryKey, BMI_CATEGORIES, getExpectedGainForWeek, generateReferenceCurve } from '../utils/gestationalWeight';
import WeightChart from '../components/WeightChart';

export default function WeightTracker() {
  const [weights, setWeights] = useState(() => storage.getWeights());
  const [heightCm, setHeightCm] = useState(() => {
    const s = storage.getSetting('mother_height');
    return s ? s.value : '';
  });
  const [preWeight, setPreWeight] = useState(() => {
    const s = storage.getSetting('pre_pregnancy_weight');
    return s ? s.value : '';
  });
  const [isEditingSetup, setIsEditingSetup] = useState(false);

  // Formulário de nova pesagem
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [week, setWeek] = useState(1);
  const [weightValue, setWeightValue] = useState('');
  const [notes, setNotes] = useState('');

  // Semana atual calculada da DPP
  const [currentWeek, setCurrentWeek] = useState(null);

  const refresh = () => setWeights(storage.getWeights());

  // Determinar semana gestacional com base na DPP
  useEffect(() => {
    const dueSetting = storage.getSetting('due_date');
    if (dueSetting && dueSetting.value) {
      const dpp = new Date(dueSetting.value);
      const dum = new Date(dpp.getTime() - 280 * 24 * 60 * 60 * 1000);
      const now = new Date();
      const diffDays = Math.floor((now - dum) / (1000 * 60 * 60 * 24));
      const calcWeek = Math.max(1, Math.min(40, Math.floor(diffDays / 7) || 1));
      setCurrentWeek(calcWeek);
      setWeek(calcWeek);
    }
  }, []);

  const handleSaveSetup = (e) => {
    e.preventDefault();
    if (!heightCm || !preWeight) return;
    storage.setSetting('mother_height', heightCm);
    storage.setSetting('pre_pregnancy_weight', preWeight);
    setIsEditingSetup(false);
  };

  const handleAddWeight = (e) => {
    e.preventDefault();
    const parsedWeight = parseFloat(weightValue.replace(',', '.'));
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      alert('Por favor insira um peso válido.');
      return;
    }

    storage.createWeight({
      date,
      week: parseInt(week, 10),
      weight: Number(parsedWeight.toFixed(1)),
      notes: notes.trim() || null,
    });

    setWeightValue('');
    setNotes('');
    refresh();
  };

  const handleDelete = (id) => {
    storage.deleteWeight(id);
    refresh();
  };

  // Cálculos de IMC e Categorias
  const numPreWeight = parseFloat(preWeight);
  const numHeight = parseFloat(heightCm);
  const bmi = calculateBMI(numPreWeight, numHeight);
  const categoryKey = getBMICategoryKey(bmi);
  const categoryInfo = BMI_CATEGORIES[categoryKey];

  // Curva de referência
  const referenceCurve = preWeight ? generateReferenceCurve(numPreWeight, categoryKey) : [];

  // Pesagem mais recente
  const sortedWeights = [...weights].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latestWeight = sortedWeights.length > 0 ? sortedWeights[0] : null;
  const latestWeek = latestWeight ? latestWeight.week : (currentWeek || 1);

  // Ganho total atual
  const totalGain = latestWeight && numPreWeight ? Number((latestWeight.weight - numPreWeight).toFixed(1)) : null;

  // Faixa esperada para a semana mais recente
  const expectedForLatest = getExpectedGainForWeek(categoryKey, latestWeek);

  // Avaliação de status
  let statusBadge = null;
  if (totalGain !== null && expectedForLatest) {
    if (totalGain < expectedForLatest.min) {
      statusBadge = {
        label: 'Abaixo da faixa esperada',
        color: '#ca8a04',
        bg: '#fef9c3',
        desc: 'O ganho de peso está um pouco abaixo da média. Converse com seu obstetra sobre nutrição adequada.',
      };
    } else if (totalGain > expectedForLatest.max) {
      statusBadge = {
        label: 'Acima da faixa esperada',
        color: '#ea580c',
        bg: '#ffedd5',
        desc: 'O ganho de peso está um pouco acima da média recomendada. Mantenha hábitos saudáveis e hidratação.',
      };
    } else {
      statusBadge = {
        label: 'Dentro da faixa ideal recomendada',
        color: '#15803d',
        bg: '#dcfce7',
        desc: 'Excelente! Seu ganho de peso está acompanhando perfeitamente a curva saudável da gestação.',
      };
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '6px' }}>Curva de Peso Gestacional</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Acompanhe o ganho de peso saudável semana a semana conforme as diretrizes do Ministério da Saúde e IOM.
          </p>
        </div>

        {preWeight && heightCm && !isEditingSetup && (
          <button
            onClick={() => setIsEditingSetup(true)}
            className="btn"
            style={{ border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)' }}
          >
            <Edit3 size={14} /> Editar Altura / Peso Inicial
          </button>
        )}
      </div>

      {/* Card de Configuração Inicial (Altura & Peso Pré-Gestacional) */}
      {(!preWeight || !heightCm || isEditingSetup) && (
        <div className="card" style={{ backgroundColor: 'var(--accent-soft)', borderColor: 'var(--accent)' }}>
          <div className="flex-row" style={{ color: 'var(--accent)', marginBottom: '8px' }}>
            <Sparkles size={20} />
            <h2 className="card-title" style={{ margin: 0, color: 'var(--primary)' }}>
              Configuração Pré-Gestacional
            </h2>
          </div>
          <p className="card-text" style={{ marginBottom: '16px', color: 'var(--text-main)' }}>
            Para desenhar sua curva de ganho de peso personalizada, informe sua altura e seu peso aproximado antes de engravidar:
          </p>

          <form onSubmit={handleSaveSetup} className="flex-row" style={{ alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
            <div className="form-group" style={{ flex: '1 1 150px', marginBottom: 0 }}>
              <label className="form-label">Altura (cm)</label>
              <input
                type="number"
                step="1"
                min="100"
                max="230"
                placeholder="Ex: 165"
                className="form-input"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ flex: '1 1 150px', marginBottom: 0 }}>
              <label className="form-label">Peso Pré-Gestacional (kg)</label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="250"
                placeholder="Ex: 60.5"
                className="form-input"
                value={preWeight}
                onChange={(e) => setPreWeight(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" type="submit">
                Salvar Configuração
              </button>
              {isEditingSetup && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => setIsEditingSetup(false)}
                  style={{ border: '1px solid var(--border)' }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Painel de Métricas e Resumo */}
      {preWeight && heightCm && (
        <>
          <div className="stats-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-box">
              <div className="stat-box-label">IMC Pré-Gestacional</div>
              <div className="stat-box-value" style={{ color: categoryInfo.color }}>
                {bmi} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>kg/m²</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {categoryInfo.label}
              </span>
            </div>

            <div className="stat-box">
              <div className="stat-box-label">Meta Total Recomendada</div>
              <div className="stat-box-value" style={{ color: 'var(--accent)' }}>
                +{categoryInfo.totalGainMin} a +{categoryInfo.totalGainMax} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>kg</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Final esperado: {(numPreWeight + categoryInfo.totalGainMin).toFixed(1)} a {(numPreWeight + categoryInfo.totalGainMax).toFixed(1)} kg
              </span>
            </div>

            <div className="stat-box">
              <div className="stat-box-label">Último Peso Registrado</div>
              <div className="stat-box-value" style={{ color: 'var(--primary)' }}>
                {latestWeight ? `${latestWeight.weight} kg` : `${numPreWeight} kg`}
              </div>
              <span style={{ fontSize: '0.75rem', color: totalGain >= 0 ? '#16a34a' : 'var(--text-muted)', fontWeight: 600 }}>
                {totalGain !== null ? `Ganho total: ${totalGain >= 0 ? '+' : ''}${totalGain} kg (Semana ${latestWeek})` : 'Aguardando pesagem'}
              </span>
            </div>
          </div>

          {/* Banner de Status Atual */}
          {statusBadge && (
            <div
              style={{
                backgroundColor: statusBadge.bg,
                border: `1px solid ${statusBadge.color}`,
                borderRadius: 'var(--radius)',
                padding: '14px 18px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <CheckCircle2 size={22} style={{ color: statusBadge.color, flexShrink: 0 }} />
              <div>
                <strong style={{ color: statusBadge.color, display: 'block', fontSize: '0.95rem' }}>
                  {statusBadge.label} (Semana {latestWeek})
                </strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  {statusBadge.desc} Faixa esperada para esta semana: <b>+{expectedForLatest.min} kg a +{expectedForLatest.max} kg</b>.
                </span>
              </div>
            </div>
          )}

          {/* Gráfico da Curva Gestacional */}
          <div className="card">
            <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div className="flex-row" style={{ color: 'var(--primary)' }}>
                <TrendingUp size={22} />
                <h2 className="card-title" style={{ margin: 0 }}>Curva de Ganho de Peso</h2>
              </div>

              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Baseada em IMC {bmi} ({categoryInfo.label})
              </span>
            </div>

            <WeightChart
              referenceCurve={referenceCurve}
              userWeights={weights}
              preWeight={numPreWeight}
              currentWeek={currentWeek}
            />
          </div>

          {/* Formulário de Registro de Nova Pesagem */}
          <div className="card">
            <div className="flex-row" style={{ marginBottom: '12px', color: 'var(--primary)' }}>
              <Scale size={20} />
              <h2 className="card-title" style={{ margin: 0, fontSize: '1.05rem' }}>Nova Pesagem</h2>
            </div>

            <form onSubmit={handleAddWeight}>
              <div className="flex-row" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                <div className="form-group" style={{ flex: '1 1 140px' }}>
                  <label className="form-label">Data</label>
                  <input
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ flex: '1 1 120px' }}>
                  <label className="form-label">Semana (1 a 40)</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    className="form-input"
                    value={week}
                    onChange={(e) => setWeek(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ flex: '1 1 130px' }}>
                  <label className="form-label">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="250"
                    placeholder="Ex: 64.2"
                    className="form-input"
                    value={weightValue}
                    onChange={(e) => setWeightValue(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ flex: '2 1 200px' }}>
                  <label className="form-label">Notas / Consulta (Opcional)</label>
                  <input
                    className="form-input"
                    placeholder="Ex: Pesagem no consultório obstétrico..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <button className="btn btn-primary" type="submit" style={{ marginTop: '8px' }}>
                <Plus size={16} /> Salvar Pesagem
              </button>
            </form>
          </div>

          {/* Histórico de Pesagens */}
          <div className="card">
            <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '12px' }}>
              <div className="flex-row" style={{ color: 'var(--primary)' }}>
                <h2 className="card-title" style={{ margin: 0 }}>Histórico de Pesagens</h2>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {weights.length} {weights.length === 1 ? 'registro' : 'registros'}
              </span>
            </div>

            {weights.length === 0 ? (
              <div className="empty-state">
                Nenhuma pesagem registrada ainda. Insira sua primeira pesagem no formulário acima!
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="contractions-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Semana</th>
                      <th>Peso</th>
                      <th>Ganho Total</th>
                      <th>Notas</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedWeights.map((w) => {
                      const diff = Number((w.weight - numPreWeight).toFixed(1));
                      const dateFormatted = w.date ? w.date.split('-').reverse().join('/') : '-';

                      return (
                        <tr key={w.id}>
                          <td style={{ fontWeight: 500 }}>{dateFormatted}</td>
                          <td>
                            <span style={{ fontWeight: 600, color: 'var(--accent)' }}>
                              Semana {w.week}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{w.weight} kg</td>
                          <td>
                            <span
                              style={{
                                fontWeight: 600,
                                color: diff >= 0 ? '#16a34a' : '#ea580c',
                              }}
                            >
                              {diff >= 0 ? `+${diff}` : diff} kg
                            </span>
                          </td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '200px' }}>
                            {w.notes || '-'}
                          </td>
                          <td>
                            <button
                              className="btn-icon btn-danger-icon"
                              onClick={() => handleDelete(w.id)}
                              title="Remover pesagem"
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

          {/* Guia Didático sobre a Distribuição do Peso na Gravidez */}
          <div className="card" style={{ backgroundColor: 'var(--surface-hover)' }}>
            <div className="flex-row" style={{ marginBottom: '12px', color: 'var(--primary)' }}>
              <Info size={20} />
              <h3 className="card-title" style={{ margin: 0, fontSize: '1rem' }}>
                Para onde vão os quilos da gravidez?
              </h3>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '14px' }}>
              O ganho de peso na gestação é natural e saudável! Em média, um ganho de ~12 kg é distribuído assim:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
              <div style={{ padding: '10px 12px', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                👶 <b>Bebê:</b> ~3.3 a 3.6 kg
              </div>
              <div style={{ padding: '10px 12px', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                🩸 <b>Volume de sangue extra:</b> ~1.5 a 1.8 kg
              </div>
              <div style={{ padding: '10px 12px', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                💧 <b>Líquido amniótico:</b> ~0.8 a 1.0 kg
              </div>
              <div style={{ padding: '10px 12px', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                🌿 <b>Placenta:</b> ~0.7 kg
              </div>
              <div style={{ padding: '10px 12px', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                🤰 <b>Crescimento do Útero:</b> ~1.0 kg
              </div>
              <div style={{ padding: '10px 12px', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                🍼 <b>Mamas / Amamentação:</b> ~0.5 a 1.0 kg
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '14px' }}>
              ⚠️ <b>Atenção:</b> Cada corpo é único. Nunca faça dietas restritivas para emagrecer durante a gestação sem expressa orientação do seu obstetra e nutricionista.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
