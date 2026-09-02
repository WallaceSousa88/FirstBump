import { useState, useEffect } from 'react';
import { ScrollText, Printer, Sparkles, CheckCircle2, FileEdit, Info, Check, ShieldCheck, Heart } from 'lucide-react';
import { storage } from '../services/storage';
import { BIRTH_PLAN_SECTIONS } from '../data/birthPlanOptions';

export default function BirthPlan() {
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview'
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Informações Gerais
  const [general, setGeneral] = useState(() => {
    const saved = storage.getBirthPlan();
    return saved?.general || {
      motherName: '',
      partnerName: '',
      doctorName: '',
      doulaName: '',
      hospitalName: '',
      pediatricianName: '',
      dueDate: storage.getSetting('due_date')?.value || '',
    };
  });

  // Opções Selecionadas (IDs booleanos)
  const [selectedOptions, setSelectedOptions] = useState(() => {
    const saved = storage.getBirthPlan();
    if (saved?.selectedOptions) return saved.selectedOptions;

    // Inicializa com os defaults recomendados da OMS
    const initial = {};
    BIRTH_PLAN_SECTIONS.forEach((section) => {
      section.options.forEach((opt) => {
        initial[opt.id] = opt.default;
      });
    });
    return initial;
  });

  // Notas Personalizadas
  const [customNotes, setCustomNotes] = useState(() => {
    const saved = storage.getBirthPlan();
    return saved?.customNotes || '';
  });

  // Sincroniza e salva no storage
  const handleSave = (showToast = true) => {
    const planData = {
      general,
      selectedOptions,
      customNotes,
      updatedAt: new Date().toISOString(),
    };
    storage.saveBirthPlan(planData);
    if (showToast) {
      setFeedbackMsg('Plano de Parto salvo com sucesso!');
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleToggleOption = (id) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Preencher modelo padrão humanizado (Recomendado pela OMS)
  const handleFillDefault = () => {
    const defaultOpts = {};
    BIRTH_PLAN_SECTIONS.forEach((section) => {
      section.options.forEach((opt) => {
        defaultOpts[opt.id] = opt.default;
      });
    });
    setSelectedOptions(defaultOpts);
    setFeedbackMsg('Modelo de Parto Humanizado (OMS) carregado com sucesso!');
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handlePrint = () => {
    handleSave(false);
    window.print();
  };

  return (
    <div>
      {/* Cabeçalho no-print */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '6px' }}>Plano de Parto Humanizado</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Documento formal para comunicar seus desejos e preferências para a equipe obstétrica e pediátrica.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleFillDefault}
            className="btn"
            style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={16} style={{ color: '#ca8a04' }} /> Preencher Padrão OMS
          </button>

          <button
            onClick={handlePrint}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Printer size={18} /> Imprimir / Salvar PDF
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {feedbackMsg && (
        <div
          className="no-print"
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

      {/* Alternador de Visualização (Editar vs Visualizar Documento) */}
      <div className="no-print" style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('edit')}
          style={{
            padding: '8px 18px',
            borderRadius: '999px',
            border: '1px solid',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            backgroundColor: activeTab === 'edit' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'edit' ? '#fff' : 'var(--text-muted)',
            borderColor: activeTab === 'edit' ? 'var(--primary)' : 'var(--border)',
          }}
        >
          <FileEdit size={16} /> Formulário & Preferências
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          style={{
            padding: '8px 18px',
            borderRadius: '999px',
            border: '1px solid',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            backgroundColor: activeTab === 'preview' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'preview' ? '#fff' : 'var(--text-muted)',
            borderColor: activeTab === 'preview' ? 'var(--accent)' : 'var(--border)',
          }}
        >
          <ScrollText size={16} /> Prévia do Documento Oficial
        </button>
      </div>

      {/* MODO 1: FORMULÁRIO DE EDIÇÃO */}
      {activeTab === 'edit' && (
        <div className="no-print">
          {/* Card de Informações Gerais / Equipe */}
          <div className="card">
            <div className="flex-row" style={{ color: 'var(--primary)', marginBottom: '14px' }}>
              <ShieldCheck size={22} />
              <h2 className="card-title" style={{ margin: 0 }}>Identificação & Equipe de Parto</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nome da Gestante</label>
                <input
                  className="form-input"
                  placeholder="Ex: Maria Carolina Silva"
                  value={general.motherName}
                  onChange={(e) => setGeneral({ ...general, motherName: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Acompanhante Escolhido(a)</label>
                <input
                  className="form-input"
                  placeholder="Ex: Lucas Henrique (Esposo)"
                  value={general.partnerName}
                  onChange={(e) => setGeneral({ ...general, partnerName: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Hospital / Maternidade</label>
                <input
                  className="form-input"
                  placeholder="Ex: Hospital e Maternidade Santa Joana"
                  value={general.hospitalName}
                  onChange={(e) => setGeneral({ ...general, hospitalName: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Médico(a) / Obstetra</label>
                <input
                  className="form-input"
                  placeholder="Ex: Dra. Juliana Santos"
                  value={general.doctorName}
                  onChange={(e) => setGeneral({ ...general, doctorName: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Doula (se houver)</label>
                <input
                  className="form-input"
                  placeholder="Ex: Camila Ferreira"
                  value={general.doulaName}
                  onChange={(e) => setGeneral({ ...general, doulaName: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Data Prevista do Parto (DPP)</label>
                <input
                  type="date"
                  className="form-input"
                  value={general.dueDate}
                  onChange={(e) => setGeneral({ ...general, dueDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Seções de Preferências */}
          {BIRTH_PLAN_SECTIONS.map((sec) => (
            <div key={sec.id} className="card">
              <div className="flex-row" style={{ color: 'var(--primary)', marginBottom: '6px' }}>
                <span style={{ fontSize: '1.3rem' }}>{sec.emoji}</span>
                <h2 className="card-title" style={{ margin: 0 }}>{sec.title}</h2>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 16px' }}>
                {sec.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sec.options.map((opt) => {
                  const isChecked = !!selectedOptions[opt.id];

                  return (
                    <label
                      key={opt.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius)',
                        background: isChecked ? 'var(--surface-hover)' : 'var(--surface)',
                        border: `1px solid ${isChecked ? 'var(--accent)' : 'var(--border)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <input
                        type="checkbox"
                        className="checkbox-custom"
                        checked={isChecked}
                        onChange={() => handleToggleOption(opt.id)}
                        style={{ marginTop: '2px' }}
                      />
                      <span style={{ fontSize: '0.9rem', color: isChecked ? 'var(--primary)' : 'var(--text-main)', fontWeight: isChecked ? 600 : 400, lineHeight: '1.45' }}>
                        {opt.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Pedidos Especiais e Observações */}
          <div className="card">
            <div className="flex-row" style={{ color: 'var(--primary)', marginBottom: '8px' }}>
              <Heart size={20} />
              <h2 className="card-title" style={{ margin: 0, fontSize: '1.05rem' }}>Observações e Pedidos Especiais</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 12px' }}>
              Inclua alergias medicamentosas, homenagens, preferências musicais específicas ou detalhes religiosos.
            </p>

            <textarea
              className="form-textarea"
              style={{ minHeight: '100px' }}
              placeholder="Ex: Tenho alergia a dipirona. Gostaríamos que a luz ficasse o mais baixa possível e que o papai fizesse o corte do cordão..."
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                onClick={() => handleSave(true)}
                className="btn btn-primary"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODO 2: PRÉVIA DO DOCUMENTO (E VIEW DE IMPRESSÃO) */}
      {(activeTab === 'preview' || window.matchMedia('print').matches) && (
        <div>
          <div className="birthplan-sheet">
            {/* Cabeçalho do Documento */}
            <div className="birthplan-header">
              <div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e3a8a', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Plano de Parto
                </h1>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  Diretrizes de Parto Humanizado · Em conformidade com a OMS e Lei Federal nº 11.108/2005
                </p>
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748b' }}>
                <div>Documento Oficial</div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>{new Date().toLocaleDateString('pt-BR')}</div>
              </div>
            </div>

            {/* Mensagem de Introdução */}
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', margin: '0 0 18px', textAlign: 'justify' }}>
              Este documento tem como objetivo registrar os desejos e preferências de <b>{general.motherName || '[Nome da Gestante]'}</b> e de sua família para o trabalho de parto, parto e cuidados pós-natais. Compreendemos que intercorrências médicas imprevistas podem ocorrer e confiamos na equipe para intervir caso haja real necessidade clínica de saúde para a mãe ou para o bebê, sempre mediante esclarecimento e consentimento prévio.
            </p>

            {/* Quadro de Identificação */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', background: '#f8fafc', padding: '14px 18px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', marginBottom: '20px' }}>
              <div><b>Gestante:</b> {general.motherName || 'A preencher'}</div>
              <div><b>Acompanhante:</b> {general.partnerName || 'A preencher'}</div>
              <div><b>Hospital / Maternidade:</b> {general.hospitalName || 'A preencher'}</div>
              <div><b>Data Prevista (DPP):</b> {general.dueDate ? general.dueDate.split('-').reverse().join('/') : 'A definir'}</div>
              {general.doctorName && <div><b>Obstetra de Preferência:</b> {general.doctorName}</div>}
              {general.doulaName && <div><b>Doula:</b> {general.doulaName}</div>}
            </div>

            {/* Tópicos Selecionados */}
            {BIRTH_PLAN_SECTIONS.map((sec) => {
              const checkedInSec = sec.options.filter((opt) => selectedOptions[opt.id]);
              if (checkedInSec.length === 0) return null;

              return (
                <div key={sec.id} style={{ marginBottom: '18px' }}>
                  <div className="birthplan-section-title">
                    {sec.title}
                  </div>

                  <div>
                    {checkedInSec.map((opt) => (
                      <div key={opt.id} className="birthplan-item">
                        <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '1.05rem', lineHeight: 1 }}>✔</span>
                        <span>{opt.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Observações Customizadas */}
            {customNotes.trim() && (
              <div style={{ marginBottom: '24px' }}>
                <div className="birthplan-section-title">
                  Observações e Informações Especiais
                </div>
                <p style={{ fontSize: '0.9rem', fontStyle: 'italic', margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  "{customNotes}"
                </p>
              </div>
            )}

            {/* Linhas de Assinatura */}
            <div className="birthplan-signatures">
              <div>
                <div className="signature-line">
                  {general.motherName || 'Assinatura da Gestante'}
                  <div style={{ fontSize: '0.7rem' }}>Gestante</div>
                </div>
              </div>

              <div>
                <div className="signature-line">
                  {general.partnerName || 'Assinatura do(a) Acompanhante'}
                  <div style={{ fontSize: '0.7rem' }}>Acompanhante</div>
                </div>
              </div>

              <div>
                <div className="signature-line">
                  Assinatura / Carimbo do Médico(a)
                  <div style={{ fontSize: '0.7rem' }}>Equipe Obstétrica</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
