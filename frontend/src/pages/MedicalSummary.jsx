import { useState, useMemo } from 'react';
import { Stethoscope, Printer, Edit3, CheckCircle2, AlertCircle, Calendar, Scale, Footprints, Syringe, HelpCircle, Plus, Trash2, HeartPulse, User, Phone, MessageSquare, Copy, Check, ShieldAlert, AlertTriangle } from 'lucide-react';
import { storage } from '../services/storage';
import { calculateBMI, getBMICategoryKey, BMI_CATEGORIES } from '../utils/gestationalWeight';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import { fireSparkleBurst, fireConfetti } from '../utils/confetti';

export default function MedicalSummary() {
  const [medicalInfo, setMedicalInfo] = useState(() => {
    const saved = storage.getMedicalInfo();
    const motherNameSetting = storage.getSetting('mother_name');
    const dppSetting = storage.getSetting('dpp');
    const dumSetting = storage.getSetting('dum');
    return (
      saved || {
        motherName: motherNameSetting ? motherNameSetting.value : 'Gestante',
        age: '29',
        bloodType: 'O+',
        allergies: 'Nenhuma alergia relatada',
        doctorName: 'Dra. Obstetra',
        doctorPhone: '',
        hospital: 'Maternidade São Luiz',
        hospitalPhone: '',
        dum: dumSetting ? dumSetting.value : '',
        dpp: dppSetting ? dppSetting.value : '',
        vaccines: {
          dtpa: true,
          hepatiteB: true,
          influenza: true,
          covid: true,
        },
        questions: [
          { id: 1, text: 'Avaliar resultado dos últimos exames de sangue e urina', done: false },
          { id: 2, text: 'Confirmar data prevista do próximo ultrassom morfológico', done: false },
        ],
      }
    );
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(medicalInfo);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);

  // Dados puxados dos outros módulos
  const weights = storage.getWeights();
  const kickSessions = storage.getKickSessions();
  const agendaEvents = storage.getAgendaEvents();
  const heightSetting = storage.getSetting('mother_height');
  const preWeightSetting = storage.getSetting('pre_weight');

  // Cálculos Gestacionais
  const motherHeight = heightSetting ? parseFloat(heightSetting.value) : 165;
  const preWeight = preWeightSetting
    ? parseFloat(preWeightSetting.value)
    : weights.length > 0
    ? parseFloat(weights[weights.length - 1].weight)
    : 62.0;

  const currentWeight = weights.length > 0 ? parseFloat(weights[0].weight) : preWeight;
  const totalWeightGain = currentWeight - preWeight;
  const initialBMI = calculateBMI(preWeight, motherHeight);
  const categoryKey = getBMICategoryKey(initialBMI);
  const bmiCategory = BMI_CATEGORIES[categoryKey] || BMI_CATEGORIES.peso_normal;

  // Idade Gestacional baseada na DPP ou DUM
  const gestCalc = useMemo(() => {
    const dppStr = medicalInfo.dpp || storage.getSetting('dpp')?.value;
    if (!dppStr) return { weeks: 24, days: 3 };

    const dppDate = new Date(dppStr + 'T00:00:00');
    const conceptionDate = new Date(dppDate);
    conceptionDate.setDate(conceptionDate.getDate() - 280);

    const now = new Date();
    const diffDays = Math.floor((now - conceptionDate) / (1000 * 60 * 60 * 24));
    const weeks = Math.max(1, Math.min(42, Math.floor(diffDays / 7)));
    const days = Math.max(0, diffDays % 7);
    return { weeks, days };
  }, [medicalInfo.dpp]);

  // Média de Chutes
  const avgKickTime = useMemo(() => {
    if (kickSessions.length === 0) return null;
    const totalSecs = kickSessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
    const avgSecs = Math.round(totalSecs / kickSessions.length);
    const mins = Math.floor(avgSecs / 60);
    return `${mins} min`;
  }, [kickSessions]);

  const isRhNegative = useMemo(() => {
    return medicalInfo.bloodType?.includes('-');
  }, [medicalInfo.bloodType]);

  const hasAllergies = useMemo(() => {
    const a = (medicalInfo.allergies || '').toLowerCase();
    return a.length > 0 && !a.includes('nenhum') && !a.includes('não') && !a.includes('nao');
  }, [medicalInfo.allergies]);

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setMedicalInfo(editForm);
    storage.saveMedicalInfo(editForm);
    setIsEditing(false);
    soundSynthesizer.playSuccessChord();
    fireSparkleBurst(window.innerWidth / 2, 200);
  };

  const handleToggleVaccine = (key) => {
    const updated = {
      ...medicalInfo,
      vaccines: {
        ...medicalInfo.vaccines,
        [key]: !medicalInfo.vaccines?.[key],
      },
    };
    setMedicalInfo(updated);
    storage.saveMedicalInfo(updated);
    soundSynthesizer.playPop();
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    const updatedQuestions = [
      ...(medicalInfo.questions || []),
      { id: Date.now(), text: newQuestionText.trim(), done: false },
    ];
    const updated = { ...medicalInfo, questions: updatedQuestions };
    setMedicalInfo(updated);
    storage.saveMedicalInfo(updated);
    setNewQuestionText('');
    soundSynthesizer.playPop();
  };

  const handleToggleQuestion = (id) => {
    const updatedQuestions = (medicalInfo.questions || []).map((q) =>
      q.id === id ? { ...q, done: !q.done } : q
    );
    const updated = { ...medicalInfo, questions: updatedQuestions };
    setMedicalInfo(updated);
    storage.saveMedicalInfo(updated);
    soundSynthesizer.playPop();
  };

  const handleDeleteQuestion = (id) => {
    const updatedQuestions = (medicalInfo.questions || []).filter((q) => q.id !== id);
    const updated = { ...medicalInfo, questions: updatedQuestions };
    setMedicalInfo(updated);
    storage.saveMedicalInfo(updated);
    soundSynthesizer.playPop();
  };

  const handlePrint = (e) => {
    soundSynthesizer.playChime();
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      fireConfetti({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, count: 50 });
    }
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // Copiar Resumo Clínico Formatado para o WhatsApp do Obstetra
  const handleCopyWhatsAppSummary = (e) => {
    const questionsList = (medicalInfo.questions || [])
      .filter((q) => !q.done)
      .map((q, idx) => `  ${idx + 1}. ${q.text}`)
      .join('\n');

    const text = `📋 *FIRSTBUMP · RESUMO PRÉ-NATAL PARA O OBSTETRA*
👤 *Paciente:* ${medicalInfo.motherName} (${medicalInfo.age || '—'} anos)
🗓️ *Idade Gestacional:* ${gestCalc.weeks}ª semanas + ${gestCalc.days} dias
🎯 *DPP:* ${medicalInfo.dpp ? new Date(medicalInfo.dpp + 'T00:00:00').toLocaleDateString('pt-BR') : 'A definir'}
🩸 *Tipo Sanguíneo:* ${medicalInfo.bloodType || 'O+'} ${isRhNegative ? '⚠️ (Rh Negativo - Atenção Anti-D)' : ''}
⚠️ *Alergias:* ${medicalInfo.allergies || 'Nenhuma relatada'}
⚖️ *Peso Atual:* ${currentWeight.toFixed(1)} kg (Ganho total: ${totalWeightGain >= 0 ? '+' : ''}${totalWeightGain.toFixed(1)} kg)
👣 *Vitalidade Fetal:* ${avgKickTime ? `~${avgKickTime} para 10 chutes` : 'Sem registros recentes'}
🏥 *Maternidade:* ${medicalInfo.hospital || 'A definir'}
🩺 *Médico Obstetra:* ${medicalInfo.doctorName || 'A definir'}
${questionsList ? `\n❓ *Dúvidas/Sintomas para a Consulta:*\n${questionsList}` : ''}

_Documento gerado pelo FirstBump Gestação Inteligente_`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedToast(true);
        soundSynthesizer.playCopyChime();
        if (e && e.currentTarget) {
          const rect = e.currentTarget.getBoundingClientRect();
          fireSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
        setTimeout(() => setCopiedToast(false), 3000);
      });
    }
  };

  return (
    <div>
      {/* Barra de Ações (Oculta na Impressão) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '6px' }}>Ficha Médica para o Obstetra</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Resumo clínico em 1 página com dados antropométricos, vacinas, vitalidade e triagem rápida de emergência.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleCopyWhatsAppSummary}
            className="btn"
            style={{
              border: '1.5px solid #25d366',
              background: copiedToast ? '#25d366' : 'rgba(37, 211, 102, 0.1)',
              color: copiedToast ? '#ffffff' : '#15803d',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            {copiedToast ? <Check size={16} /> : <Copy size={16} />}
            {copiedToast ? 'Copiado para o WhatsApp!' : 'Copiar Resumo para WhatsApp'}
          </button>

          <button
            onClick={() => {
              setEditForm(medicalInfo);
              setIsEditing(!isEditing);
              soundSynthesizer.playPop();
            }}
            className="btn"
            style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Edit3 size={16} /> {isEditing ? 'Fechar Edição' : 'Editar Dados Clínicos'}
          </button>

          <button
            onClick={handlePrint}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
          >
            <Printer size={18} /> Imprimir / Salvar em PDF (1 Página)
          </button>
        </div>
      </div>

      {/* Cartão de Triagem de Emergência Obstétrica (SOS Maternidade) - no-print */}
      <div className="sos-triage-card no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>🚨</span>
            <div>
              <strong style={{ fontSize: '1.05rem', color: '#dc2626', display: 'block' }}>
                Cartão de Triagem & Emergência Obstétrica
              </strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Acesso imediato para ambulância, pronto-socorro ou internação na maternidade
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className={`sos-blood-type-pill ${isRhNegative ? 'sos-blood-type-negative' : 'sos-blood-type-positive'}`}>
              🩸 {medicalInfo.bloodType || 'O+'}
            </span>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, padding: '6px 14px', borderRadius: '999px', background: 'var(--accent-soft)', color: 'var(--accent)' }}>
              {gestCalc.weeks}s + {gestCalc.days}d
            </span>
          </div>
        </div>

        {/* Alerta de Rh Negativo se aplicável */}
        {isRhNegative && (
          <div style={{ background: '#fef2f2', border: '1px solid #f87171', borderRadius: 'var(--radius)', padding: '8px 12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b', fontSize: '0.85rem' }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>
              <b>Atenção Clínica (Fator Rh Negativo):</b> Se o pai biológico for Rh positivo ou desconhecido, confirme se a Imunoglobulina Anti-D foi administrada na 28ª semana ou após sangramentos/amniocentese.
            </span>
          </div>
        )}

        {/* Alerta de Alergia Medicamentosa */}
        {hasAllergies && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde047', borderRadius: 'var(--radius)', padding: '8px 12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#854d0e', fontSize: '0.85rem' }}>
            <ShieldAlert size={16} style={{ flexShrink: 0, color: '#ca8a04' }} />
            <span>
              <b>Alerta de Alergia Medicamentosa:</b> {medicalInfo.allergies}
            </span>
          </div>
        )}

        {/* Ações Rápidas de Ligação e Contato */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
          {medicalInfo.doctorPhone ? (
            <a
              href={`tel:${medicalInfo.doctorPhone}`}
              className="btn"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', textDecoration: 'none' }}
            >
              <Phone size={15} style={{ color: '#16a34a' }} /> Ligar p/ Obstetra ({medicalInfo.doctorPhone})
            </a>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="btn"
              style={{ background: 'var(--surface)', border: '1px dashed var(--border)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}
            >
              <Plus size={14} /> Cadastrar Telefone do Obstetra
            </button>
          )}

          {medicalInfo.hospitalPhone ? (
            <a
              href={`tel:${medicalInfo.hospitalPhone}`}
              className="btn"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', textDecoration: 'none' }}
            >
              <Phone size={15} style={{ color: '#dc2626' }} /> Ligar p/ Maternidade ({medicalInfo.hospitalPhone})
            </a>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="btn"
              style={{ background: 'var(--surface)', border: '1px dashed var(--border)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}
            >
              <Plus size={14} /> Cadastrar Telefone da Maternidade
            </button>
          )}
        </div>
      </div>

      {/* Modal de Edição (no-print) */}
      {isEditing && (
        <div className="card no-print" style={{ backgroundColor: 'var(--accent-soft)', borderColor: 'var(--accent)', marginBottom: '24px' }}>
          <div className="flex-row" style={{ color: 'var(--primary)', marginBottom: '14px' }}>
            <Stethoscope size={20} />
            <h2 className="card-title" style={{ margin: 0, fontSize: '1.05rem' }}>Editar Dados Clínicos da Gestante</h2>
          </div>

          <form onSubmit={handleSaveEdit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nome da Gestante</label>
                <input
                  className="form-input"
                  value={editForm.motherName}
                  onChange={(e) => setEditForm({ ...editForm, motherName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Idade da Mãe</label>
                <input
                  type="number"
                  className="form-input"
                  value={editForm.age}
                  onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                  placeholder="Ex: 29"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tipo Sanguíneo & Fator Rh</label>
                <select
                  className="form-input"
                  value={editForm.bloodType}
                  onChange={(e) => setEditForm({ ...editForm, bloodType: e.target.value })}
                >
                  <option value="A+">A Positivo (A+)</option>
                  <option value="A-">A Negativo (A-) ⚠️</option>
                  <option value="B+">B Positivo (B+)</option>
                  <option value="B-">B Negativo (B-) ⚠️</option>
                  <option value="AB+">AB Positivo (AB+)</option>
                  <option value="AB-">AB Negativo (AB-) ⚠️</option>
                  <option value="O+">O Positivo (O+)</option>
                  <option value="O-">O Negativo (O-) ⚠️</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Médico Obstetra</label>
                <input
                  className="form-input"
                  value={editForm.doctorName}
                  onChange={(e) => setEditForm({ ...editForm, doctorName: e.target.value })}
                  placeholder="Ex: Dra. Juliana Santos"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Telefone / WhatsApp do Obstetra</label>
                <input
                  className="form-input"
                  value={editForm.doctorPhone || ''}
                  onChange={(e) => setEditForm({ ...editForm, doctorPhone: e.target.value })}
                  placeholder="Ex: (11) 98765-4321"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Maternidade / Hospital</label>
                <input
                  className="form-input"
                  value={editForm.hospital}
                  onChange={(e) => setEditForm({ ...editForm, hospital: e.target.value })}
                  placeholder="Ex: Hospital e Maternidade São Luiz"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Telefone da Maternidade (Emergência)</label>
                <input
                  className="form-input"
                  value={editForm.hospitalPhone || ''}
                  onChange={(e) => setEditForm({ ...editForm, hospitalPhone: e.target.value })}
                  placeholder="Ex: (11) 3000-0000"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Data Prevista do Parto (DPP)</label>
                <input
                  type="date"
                  className="form-input"
                  value={editForm.dpp}
                  onChange={(e) => setEditForm({ ...editForm, dpp: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Alergias Medicamentosas & Observações</label>
              <input
                className="form-input"
                value={editForm.allergies}
                onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
                placeholder="Ex: Alergia a Dipirona / Nenhuma"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={() => setIsEditing(false)} className="btn" style={{ border: '1px solid var(--border)' }}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Salvar Dados Clínicos
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DOCUMENTO DA FICHA MÉDICA (1 PÁGINA A4) */}
      <div className="medical-summary-sheet">
        {/* CABEÇALHO CLÍNICO */}
        <div className="medical-header-banner">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              <HeartPulse size={24} style={{ color: 'var(--accent)' }} /> Ficha de Acompanhamento Pré-Natal
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
              FirstBump Saúde Gestacional · Gerado em {new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent)' }}>
              {gestCalc.weeks}ª Semanas + {gestCalc.days}d
            </span>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              DPP: {medicalInfo.dpp ? new Date(medicalInfo.dpp + 'T00:00:00').toLocaleDateString('pt-BR') : 'A definir'}
            </div>
          </div>
        </div>

        {/* 1. DADOS DA PACIENTE */}
        <div className="medical-section-title">
          <User size={16} /> 1. Identificação da Gestante & Equipe
        </div>
        <div className="medical-grid-box">
          <div className="medical-stat-cell">
            <div className="medical-stat-label">Nome da Gestante</div>
            <div className="medical-stat-value">{medicalInfo.motherName}</div>
          </div>
          <div className="medical-stat-cell">
            <div className="medical-stat-label">Idade Materna</div>
            <div className="medical-stat-value">{medicalInfo.age ? `${medicalInfo.age} anos` : 'Não informada'}</div>
          </div>
          <div className="medical-stat-cell">
            <div className="medical-stat-label">Tipo Sanguíneo / Rh</div>
            <div className="medical-stat-value" style={{ color: isRhNegative ? '#ef4444' : 'var(--primary)' }}>
              {medicalInfo.bloodType || 'O+'}
              {isRhNegative && (
                <span style={{ fontSize: '0.7rem', display: 'block', color: '#ef4444', fontWeight: 600 }}>
                  (Rh Negativo - Anti-D profilaxia)
                </span>
              )}
            </div>
          </div>
          <div className="medical-stat-cell">
            <div className="medical-stat-label">Médico Obstetra</div>
            <div className="medical-stat-value">
              {medicalInfo.doctorName || 'Não informado'}
              {medicalInfo.doctorPhone && (
                <span style={{ fontSize: '0.72rem', display: 'block', color: '#64748b', fontWeight: 500 }}>
                  {medicalInfo.doctorPhone}
                </span>
              )}
            </div>
          </div>
          <div className="medical-stat-cell">
            <div className="medical-stat-label">Maternidade de Escolha</div>
            <div className="medical-stat-value">
              {medicalInfo.hospital || 'A definir'}
              {medicalInfo.hospitalPhone && (
                <span style={{ fontSize: '0.72rem', display: 'block', color: '#64748b', fontWeight: 500 }}>
                  {medicalInfo.hospitalPhone}
                </span>
              )}
            </div>
          </div>
          <div className="medical-stat-cell">
            <div className="medical-stat-label">Alergias Medicamentosas</div>
            <div className="medical-stat-value" style={{ color: hasAllergies ? '#ef4444' : '#10b981' }}>
              {medicalInfo.allergies || 'Nenhuma relatada'}
            </div>
          </div>
        </div>

        {/* 2. ANTROPOMETRIA & CURVA DE PESO */}
        <div className="medical-section-title">
          <Scale size={16} /> 2. Evolução Ponderal & Antropometria (IOM/MS)
        </div>
        <div className="medical-grid-box">
          <div className="medical-stat-cell">
            <div className="medical-stat-label">Altura Materna</div>
            <div className="medical-stat-value">{motherHeight} cm</div>
          </div>
          <div className="medical-stat-cell">
            <div className="medical-stat-label">Peso Pré-Gestacional</div>
            <div className="medical-stat-value">{preWeight.toFixed(1)} kg</div>
          </div>
          <div className="medical-stat-cell">
            <div className="medical-stat-label">IMC Inicial</div>
            <div className="medical-stat-value">
              {initialBMI} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>({bmiCategory.label})</span>
            </div>
          </div>
          <div className="medical-stat-cell">
            <div className="medical-stat-label">Peso Atual</div>
            <div className="medical-stat-value">{currentWeight.toFixed(1)} kg</div>
          </div>
          <div className="medical-stat-cell">
            <div className="medical-stat-label">Ganho Total Acumulado</div>
            <div className="medical-stat-value" style={{ color: totalWeightGain >= 0 ? '#10b981' : '#ef4444' }}>
              {totalWeightGain >= 0 ? `+${totalWeightGain.toFixed(1)}` : totalWeightGain.toFixed(1)} kg
            </div>
          </div>
          <div className="medical-stat-cell">
            <div className="medical-stat-label">Ganho Recomendado (Total)</div>
            <div className="medical-stat-value">{bmiCategory.totalGainMin} a {bmiCategory.totalGainMax} kg</div>
          </div>
        </div>

        {/* 3. VITALIDADE FETAL & MOVIMENTAÇÃO */}
        <div className="medical-section-title">
          <Footprints size={16} /> 3. Vitalidade Fetal & Monitoramento
        </div>
        <div className="medical-grid-box">
          <div className="medical-stat-cell">
            <div className="medical-stat-label">Sessões de Chutes (Kick Count)</div>
            <div className="medical-stat-value">{kickSessions.length} sessões registradas</div>
          </div>
          <div className="medical-stat-cell">
            <div className="medical-stat-label">Tempo Médio para 10 Chutes</div>
            <div className="medical-stat-value" style={{ color: '#10b981' }}>
              {avgKickTime ? `~${avgKickTime}` : 'Não registrado'}
            </div>
          </div>
          <div className="medical-stat-cell">
            <div className="medical-stat-label">Padrão de Movimentação</div>
            <div className="medical-stat-value">
              {kickSessions.length > 0 ? 'Normal / Ativo' : 'Aguardando 28ª semana'}
            </div>
          </div>
        </div>

        {/* 4. CALENDÁRIO VACINAL DA GESTANTE */}
        <div className="medical-section-title">
          <Syringe size={16} /> 4. Vacinas Recomendadas na Gestação
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {[
            { key: 'dtpa', label: 'dTpa (Tríplice Acelular - Coqueluche)', tip: 'A partir da 20ª sem' },
            { key: 'influenza', label: 'Influenza (Gripe)', tip: 'Dose única em qualquer idade gestacional' },
            { key: 'hepatiteB', label: 'Hepatite B (3 doses)', tip: 'Se não vacinada anteriormente' },
            { key: 'covid', label: 'Covid-19', tip: 'Conforme cronograma PNI' },
          ].map((v) => {
            const isDone = medicalInfo.vaccines?.[v.key];
            return (
              <span
                key={v.key}
                className={`medical-vaccine-badge ${isDone ? 'vaccine-done' : 'vaccine-pending'}`}
                onClick={() => handleToggleVaccine(v.key)}
                title="Clique para alternar status"
              >
                {isDone ? '✅' : '⏳'} <b>{v.label}</b>
              </span>
            );
          })}
        </div>

        {/* 5. DÚVIDAS & QUEIXAS PARA ESTA CONSULTA */}
        <div className="medical-section-title">
          <HelpCircle size={16} /> 5. Dúvidas & Sintomas para Discutir nesta Consulta
        </div>
        <div style={{ marginBottom: '12px' }}>
          {(!medicalInfo.questions || medicalInfo.questions.length === 0) ? (
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
              Nenhuma dúvida cadastrada para esta consulta.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {medicalInfo.questions.map((q) => (
                <div
                  key={q.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    background: q.done ? '#f0fdf4' : 'var(--surface-hover)',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.85rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      textDecoration: q.done ? 'line-through' : 'none',
                      color: q.done ? '#64748b' : 'var(--text-main)',
                    }}
                    onClick={() => handleToggleQuestion(q.id)}
                  >
                    <input type="checkbox" checked={q.done} readOnly style={{ cursor: 'pointer' }} />
                    <span>{q.text}</span>
                  </div>

                  <button
                    className="btn-icon no-print"
                    onClick={() => handleDeleteQuestion(q.id)}
                    title="Remover pergunta"
                    style={{ padding: '2px' }}
                  >
                    <Trash2 size={14} style={{ color: '#ef4444' }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Adicionar Dúvida Rápida (no-print) */}
          <form onSubmit={handleAddQuestion} className="no-print flex-row" style={{ marginTop: '10px', gap: '8px' }}>
            <input
              className="form-input"
              style={{ fontSize: '0.85rem', padding: '6px 10px' }}
              placeholder="Adicionar nova dúvida ou sintoma para o médico..."
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
            />
            <button className="btn btn-primary" type="submit" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', padding: '6px 12px' }}>
              <Plus size={14} /> Adicionar
            </button>
          </form>
        </div>

        {/* RODAPÉ DO DOCUMENTO */}
        <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '10px', marginTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
          <span>Assinatura da Gestante: ___________________________</span>
          <span>Carimbo / Assinatura do Obstetra: ___________________________</span>
        </div>
      </div>
    </div>
  );
}
