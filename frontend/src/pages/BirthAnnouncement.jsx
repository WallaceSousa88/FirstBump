import { useState, useEffect, useRef, useCallback } from 'react';
import { storage } from '../services/storage';
import {
  THEMES,
  FORMATS,
  renderBirthCardCanvas,
} from '../utils/birthCardRenderer';
import {
  Sparkles,
  Download,
  Share2,
  Image as ImageIcon,
  Footprints,
  Calendar,
  Clock,
  Scale,
  Ruler,
  Users,
  Building2,
  Heart,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Layers,
  Wand2,
} from 'lucide-react';

const SUGGESTED_MESSAGES = [
  'Nosso maior sonho se tornou realidade. Cheguei para encher o mundo de amor e luz! ✨',
  'Com 10 dedinhos nas mãos e 10 dedinhos nos pés, roubei o coração de todos! 👣💖',
  'O milagre da vida floresceu em nossa família. Seja muito bem-vindo(a), nosso amor! 🌸',
  'Você chegou e transformou nosso mundo para sempre. Te amamos infinitamente! 👶✨',
  'Prometido pelo céu, nascido nos nossos braços. Nosso bem mais precioso! 🕊️',
];

export default function BirthAnnouncement() {
  const canvasRef = useRef(null);
  const photoInputRef = useRef(null);
  const footInputRef = useRef(null);

  const [selectedFormat, setSelectedFormat] = useState('story');
  const [selectedTheme, setSelectedTheme] = useState('blush_floral');
  const [isRendering, setIsRendering] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const [cardData, setCardData] = useState(() => {
    const saved = storage.getBirthCard();
    if (saved) return saved;

    // Tenta obter o nome escolhido da lista de favoritos ou configurações
    const customNames = storage.getCustomNames?.() || [];
    const favoriteNames = storage.getFavoriteNames?.() || [];
    const medicalInfo = storage.getMedicalInfo?.() || {};

    const defaultName =
      customNames[0]?.name ||
      favoriteNames[0]?.name ||
      '';

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(
      today.getMonth() + 1
    ).padStart(2, '0')}/${today.getFullYear()}`;

    return {
      babyName: defaultName || 'Helena Silva Sousa',
      headline: 'Com muito amor anunciamos',
      title: 'Cheguei ao Mundo! 🍼',
      birthDate: formattedDate,
      birthTime: '14:35',
      weight: '3.420',
      height: '49',
      parents: medicalInfo?.companion ? `Mamãe & Papai (${medicalInfo.companion})` : 'Mamãe & Papai',
      hospital: medicalInfo?.maternityHospital || 'Maternidade Santa Joana - SP',
      message: 'Nosso maior sonho se tornou realidade. Cheguei para encher o mundo de amor! ✨',
      photoUrl: null,
      footprintUrl: null,
    };
  });

  // Salva no storage ao alterar
  useEffect(() => {
    storage.saveBirthCard(cardData);
  }, [cardData]);

  // Re-renderiza o canvas quando os dados, formato ou tema mudarem
  const triggerRender = useCallback(async () => {
    if (!canvasRef.current) return;
    setIsRendering(true);
    try {
      await renderBirthCardCanvas(canvasRef.current, cardData, selectedFormat, selectedTheme);
    } catch (err) {
      console.error('Erro ao renderizar cartão:', err);
    } finally {
      setIsRendering(false);
    }
  }, [cardData, selectedFormat, selectedTheme]);

  useEffect(() => {
    triggerRender();
  }, [triggerRender]);

  // Handler de Upload de Imagem (com compressão rápida)
  const handleImageUpload = (file, fieldName) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDimension = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const compCanvas = document.createElement('canvas');
        compCanvas.width = width;
        compCanvas.height = height;
        const compCtx = compCanvas.getContext('2d');
        compCtx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = compCanvas.toDataURL('image/jpeg', 0.88);
        setCardData((prev) => ({ ...prev, [fieldName]: compressedDataUrl }));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Download do arquivo PNG em alta resolução
  const handleDownloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    const safeName = (cardData.babyName || 'bebe')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    link.download = `cartao-nascimento-${safeName}-${selectedFormat}.png`;
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3500);
  };

  // Compartilhamento via Web Share API ou WhatsApp
  const handleShare = async () => {
    if (!canvasRef.current) return;

    const shareText = `🍼 Anúncio de Nascimento do(a) ${cardData.babyName || 'nosso bebê'}! Nasceu com ${cardData.weight || '3.4'}kg e ${cardData.height || '49'}cm de puro amor! ✨`;

    if (navigator.share && navigator.canShare) {
      try {
        canvasRef.current.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], `anuncio-${cardData.babyName || 'bebe'}.png`, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `Chegada de ${cardData.babyName}`,
              text: shareText,
            });
          } else {
            await navigator.share({
              title: `Chegada de ${cardData.babyName}`,
              text: shareText,
            });
          }
        }, 'image/png');
        return;
      } catch (e) {
        console.log('Share cancelado ou não suportado', e);
      }
    }

    // Fallback: Copia o texto e abre WhatsApp
    navigator.clipboard?.writeText?.(shareText);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header da Página */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f43f5e 0%, #db2777 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)',
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
              Gerador de Cartão de Nascimento
            </h1>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Crie uma arte de anúncio inesquecível em Alta Definição para postar nos Stories, WhatsApp e guardar para sempre 🍼👣
            </p>
          </div>
        </div>
      </div>

      <div className="birthcard-layout">
        {/* COLUNA ESQUERDA: Formulário & Customizações */}
        <div>
          {/* Seletor de Formato (Story 9:16 vs Post 1:1) */}
          <div className="format-toggle-bar">
            {Object.values(FORMATS).map((fmt) => (
              <button
                key={fmt.id}
                className={`format-tab-btn ${selectedFormat === fmt.id ? 'active' : ''}`}
                onClick={() => setSelectedFormat(fmt.id)}
              >
                {fmt.name}
              </button>
            ))}
          </div>

          {/* Seletor de Tema Visual */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, fontSize: '1rem', marginBottom: '12px' }}>
              <Layers size={18} style={{ color: 'var(--accent)' }} />
              <span>Estilo Visual & Paleta</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.values(THEMES).map((thm) => (
                <button
                  key={thm.id}
                  className={`theme-chip-btn ${selectedTheme === thm.id ? 'active' : ''}`}
                  onClick={() => setSelectedTheme(thm.id)}
                >
                  <span
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: thm.borderGold,
                    }}
                  />
                  <span>{thm.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dados do Bebê */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, fontSize: '1rem', marginBottom: '14px' }}>
              <Heart size={18} style={{ color: '#e11d48' }} />
              <span>Informações de Nascimento</span>
            </div>

            <div className="form-group">
              <label className="form-label">Nome Completo do Bebê *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Helena Silva Sousa"
                value={cardData.babyName}
                onChange={(e) => setCardData({ ...cardData, babyName: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">📅 Data de Nascimento</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="25/09/2026"
                  value={cardData.birthDate}
                  onChange={(e) => setCardData({ ...cardData, birthDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">⏰ Horário Exato</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: 14:35"
                  value={cardData.birthTime}
                  onChange={(e) => setCardData({ ...cardData, birthTime: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">⚖️ Peso (kg ou gramas)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: 3.420"
                  value={cardData.weight}
                  onChange={(e) => setCardData({ ...cardData, weight: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">📏 Comprimento (cm)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: 49"
                  value={cardData.height}
                  onChange={(e) => setCardData({ ...cardData, height: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">👨‍👩‍👧 Pais da Criança</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Mamãe Mariana & Papai Wallace"
                  value={cardData.parents}
                  onChange={(e) => setCardData({ ...cardData, parents: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">🏥 Maternidade / Cidade</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Maternidade Santa Joana - SP"
                  value={cardData.hospital}
                  onChange={(e) => setCardData({ ...cardData, hospital: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Fotos: Foto do Bebê & Carimbo do Pezinho */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, fontSize: '1rem', marginBottom: '14px' }}>
              <ImageIcon size={18} style={{ color: 'var(--accent)' }} />
              <span>Fotos & Carimbo do Pezinho</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {/* Dropzone Foto do Bebê */}
              <div>
                <label className="form-label">📸 Foto do Bebê Recém-Nascido</label>
                {cardData.photoUrl ? (
                  <div style={{ position: 'relative' }}>
                    <img src={cardData.photoUrl} alt="Bebê" className="image-thumb-preview" />
                    <button
                      onClick={() => setCardData({ ...cardData, photoUrl: null })}
                      className="btn-icon"
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(0,0,0,0.65)',
                        color: '#ffffff',
                      }}
                      title="Remover foto"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ) : (
                  <div
                    className="image-dropzone"
                    onClick={() => photoInputRef.current.click()}
                  >
                    <ImageIcon size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 6px' }} />
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      Adicionar Foto
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PNG ou JPG</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={photoInputRef}
                  style={{ display: 'none' }}
                  onChange={(e) => handleImageUpload(e.target.files[0], 'photoUrl')}
                />
              </div>

              {/* Dropzone Foto do Carimbo do Pezinho */}
              <div>
                <label className="form-label">👣 Foto do Carimbo do Pezinho</label>
                {cardData.footprintUrl ? (
                  <div style={{ position: 'relative' }}>
                    <img src={cardData.footprintUrl} alt="Pezinho" className="image-thumb-preview" />
                    <button
                      onClick={() => setCardData({ ...cardData, footprintUrl: null })}
                      className="btn-icon"
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(0,0,0,0.65)',
                        color: '#ffffff',
                      }}
                      title="Remover pezinho"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ) : (
                  <div
                    className="image-dropzone"
                    onClick={() => footInputRef.current.click()}
                  >
                    <Footprints size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 6px' }} />
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      Foto do Pezinho
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Opcional (Usa ícone lindo se vazio)</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={footInputRef}
                  style={{ display: 'none' }}
                  onChange={(e) => handleImageUpload(e.target.files[0], 'footprintUrl')}
                />
              </div>
            </div>
          </div>

          {/* Mensagem e Frases Sugeridas */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, fontSize: '1rem', marginBottom: '10px' }}>
              <Wand2 size={18} style={{ color: '#ca8a04' }} />
              <span>Frase de Dedicação</span>
            </div>

            <textarea
              className="form-input"
              rows="3"
              value={cardData.message}
              onChange={(e) => setCardData({ ...cardData, message: e.target.value })}
              placeholder="Digite uma mensagem especial de boas-vindas..."
              style={{ width: '100%', resize: 'vertical', marginBottom: '10px' }}
            />

            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Ideias de Frases (clique para aplicar):
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {SUGGESTED_MESSAGES.map((msg, i) => (
                <button
                  key={i}
                  onClick={() => setCardData({ ...cardData, message: msg })}
                  style={{
                    textAlign: 'left',
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '8px 10px',
                    fontSize: '0.78rem',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    lineHeight: '1.4',
                    transition: 'all 0.15s ease',
                  }}
                >
                  "{msg}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: Pré-Visualização Sticky & Botões de Exportação */}
        <div className="birthcard-preview-sticky">
          <div style={{ width: '100%', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Prévia ao Vivo ({selectedFormat === 'story' ? '9:16' : '1:1'})
            </span>
            {isRendering && (
              <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>
                Atualizando...
              </span>
            )}
          </div>

          {/* Container do Canvas HD */}
          <div className="birthcard-canvas-container">
            <canvas ref={canvasRef} className="birthcard-canvas" />
          </div>

          {/* Ações de Download e Compartilhamento */}
          <div style={{ width: '100%', maxWidth: '380px', marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={handleDownloadImage}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #f43f5e 0%, #db2777 100%)',
                boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)',
              }}
            >
              <Download size={18} /> Baixar Imagem (Alta Definição PNG)
            </button>

            {downloadSuccess && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius)',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <CheckCircle2 size={16} /> Cartão salvo com sucesso na sua galeria! 🎉
              </div>
            )}

            <button
              onClick={handleShare}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '0.9rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Share2 size={18} /> Compartilhar no WhatsApp / Redes
            </button>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', margin: '4px 0 0' }}>
              💡 Imagem gerada em 1080p, pronta para impressão ou postagem sem perda de qualidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
