// Canvas-based Ultra High Definition (1080p) Birth Card Renderer

export const THEMES = {
  blush_floral: {
    id: 'blush_floral',
    name: '🌸 Doce Aquarela (Rosa)',
    bgGradient: ['#fff1f2', '#ffe4e6', '#fecdd3'],
    primaryColor: '#9f1239',
    secondaryColor: '#db2777',
    accentColor: '#e11d48',
    cardBg: 'rgba(255, 255, 255, 0.92)',
    badgeBg: 'rgba(244, 114, 182, 0.15)',
    textColor: '#4c0519',
    subTextColor: '#881337',
    borderGold: '#f43f5e',
    starsColor: '#f472b6',
  },
  ocean_dream: {
    id: 'ocean_dream',
    name: '🌊 Azul Celestial (Oceano)',
    bgGradient: ['#f0f9ff', '#e0f2fe', '#bae6fd'],
    primaryColor: '#0369a1',
    secondaryColor: '#0284c7',
    accentColor: '#0ea5e9',
    cardBg: 'rgba(255, 255, 255, 0.92)',
    badgeBg: 'rgba(14, 165, 233, 0.15)',
    textColor: '#0c4a6e',
    subTextColor: '#075985',
    borderGold: '#0284c7',
    starsColor: '#38bdf8',
  },
  sage_botanical: {
    id: 'sage_botanical',
    name: '🌿 Sálvia & Natureza',
    bgGradient: ['#f0fdf4', '#dcfce7', '#bbf7d0'],
    primaryColor: '#166534',
    secondaryColor: '#15803d',
    accentColor: '#16a34a',
    cardBg: 'rgba(255, 255, 255, 0.92)',
    badgeBg: 'rgba(34, 197, 94, 0.15)',
    textColor: '#14532d',
    subTextColor: '#166534',
    borderGold: '#22c55e',
    starsColor: '#4ade80',
  },
  lavender_magic: {
    id: 'lavender_magic',
    name: '💜 Lavanda & Sonho',
    bgGradient: ['#faf5ff', '#f3e8ff', '#e9d5ff'],
    primaryColor: '#6b21a8',
    secondaryColor: '#7e22ce',
    accentColor: '#9333ea',
    cardBg: 'rgba(255, 255, 255, 0.92)',
    badgeBg: 'rgba(168, 85, 247, 0.15)',
    textColor: '#3b0764',
    subTextColor: '#581c87',
    borderGold: '#a855f7',
    starsColor: '#c084fc',
  },
  honey_gold: {
    id: 'honey_gold',
    name: '🍯 Dourado & Caramelo',
    bgGradient: ['#fffbeb', '#fef3c7', '#fde68a'],
    primaryColor: '#92400e',
    secondaryColor: '#b45309',
    accentColor: '#d97706',
    cardBg: 'rgba(255, 255, 255, 0.92)',
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    textColor: '#451a03',
    subTextColor: '#78350f',
    borderGold: '#d97706',
    starsColor: '#f59e0b',
  },
};

export const FORMATS = {
  story: {
    id: 'story',
    name: '📱 Story / Status (9:16)',
    width: 1080,
    height: 1920,
    aspect: '9:16',
  },
  square: {
    id: 'square',
    name: '🖼️ Post / WhatsApp (1:1)',
    width: 1080,
    height: 1080,
    aspect: '1:1',
  },
};

// Helper para carregar imagem de forma assíncrona
function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// Desenha molduras e cantos arredondados
function roundRect(ctx, x, y, width, height, radius, fill = true, stroke = false) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

// Desenha o pezinho de bebê vetorial caso não haja foto do carimbo
function drawStylizedFootprint(ctx, cx, cy, scale, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;

  // Calcanhar e planta do pé
  ctx.beginPath();
  ctx.ellipse(0, 10, 16, 26, 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(-2, -16, 22, 18, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Dedinhos
  // Dedão
  ctx.beginPath();
  ctx.ellipse(-14, -40, 7.5, 9, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Dedo 2
  ctx.beginPath();
  ctx.ellipse(-4, -43, 5.5, 7, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Dedo 3
  ctx.beginPath();
  ctx.ellipse(5, -41, 5, 6.5, 0.05, 0, Math.PI * 2);
  ctx.fill();

  // Dedo 4
  ctx.beginPath();
  ctx.ellipse(13, -37, 4.5, 5.5, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Dedinho
  ctx.beginPath();
  ctx.ellipse(19, -32, 4, 5, 0.25, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Renderizador principal no Canvas
export async function renderBirthCardCanvas(canvas, cardData, formatKey = 'story', themeKey = 'blush_floral') {
  const format = FORMATS[formatKey] || FORMATS.story;
  const theme = THEMES[themeKey] || THEMES.blush_floral;
  const isStory = format.id === 'story';

  canvas.width = format.width;
  canvas.height = format.height;
  const ctx = canvas.getContext('2d');
  const W = format.width;
  const H = format.height;

  // 1. Fundo com Gradiente
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, theme.bgGradient[0]);
  bgGrad.addColorStop(0.5, theme.bgGradient[1]);
  bgGrad.addColorStop(1, theme.bgGradient[2]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // 2. Elementos Decorativos de Fundo (Estrelas / Brilhos / Círculos de Luz)
  ctx.fillStyle = theme.starsColor;
  ctx.globalAlpha = 0.45;
  const decorDots = isStory
    ? [
        { x: 80, y: 120, r: 8 }, { x: 1000, y: 140, r: 10 }, { x: 120, y: 350, r: 6 },
        { x: 960, y: 380, r: 7 }, { x: 80, y: 1750, r: 10 }, { x: 990, y: 1780, r: 8 },
        { x: 540, y: 90, r: 12 }, { x: 920, y: 880, r: 6 }, { x: 150, y: 920, r: 6 },
      ]
    : [
        { x: 80, y: 100, r: 8 }, { x: 1000, y: 110, r: 9 }, { x: 80, y: 980, r: 8 },
        { x: 1000, y: 980, r: 9 }, { x: 540, y: 70, r: 10 },
      ];

  decorDots.forEach(dot => {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1.0;

  // 3. Moldura Interna com Bordas Decoradas
  const margin = 48;
  ctx.strokeStyle = theme.borderGold;
  ctx.lineWidth = 4;
  ctx.globalAlpha = 0.5;
  roundRect(ctx, margin, margin, W - margin * 2, H - margin * 2, 36, false, true);

  ctx.strokeStyle = theme.primaryColor;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.3;
  roundRect(ctx, margin + 12, margin + 12, W - (margin + 12) * 2, H - (margin + 12) * 2, 28, false, true);
  ctx.globalAlpha = 1.0;

  // 4. Cabeçalho / Título de Anúncio
  const headerY = isStory ? 180 : 120;
  ctx.textAlign = 'center';

  // Subtítulo pequeno decorado
  ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = theme.secondaryColor;
  ctx.letterSpacing = '6px';
  ctx.fillText((cardData.headline || '✨ COM MUITO AMOR ANUNCIAMOS ✨').toUpperCase(), W / 2, headerY - 35);

  // Título Principal / "Cheguei ao Mundo!"
  ctx.font = '800 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = theme.primaryColor;
  ctx.letterSpacing = '1px';
  ctx.fillText(cardData.title || 'Cheguei ao Mundo! 🍼', W / 2, headerY + 15);

  // 5. Nome do Bebê
  const nameY = isStory ? headerY + 90 : headerY + 70;
  ctx.font = 'bold 56px "Playfair Display", Georgia, serif';
  ctx.fillStyle = theme.primaryColor;
  ctx.fillText(cardData.babyName || 'Nome do Bebê', W / 2, nameY);

  // Linha divisória sutil
  ctx.strokeStyle = theme.borderGold;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 120, nameY + 22);
  ctx.lineTo(W / 2 + 120, nameY + 22);
  ctx.stroke();

  // 6. Foto do Bebê (ou placeholder estético com pezinho)
  const photoY = isStory ? nameY + 70 : nameY + 50;
  const photoSize = isStory ? 480 : 380;
  const photoX = (W - photoSize) / 2;

  // Sombra e moldura da foto
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 25;
  ctx.shadowOffsetY = 10;

  ctx.fillStyle = '#ffffff';
  roundRect(ctx, photoX - 10, photoY - 10, photoSize + 20, photoSize + 20, 32, true, false);
  ctx.restore();

  // Imagem do bebê
  const babyImg = await loadImage(cardData.photoUrl);
  if (babyImg) {
    ctx.save();
    // Cria máscara com cantos arredondados
    roundRect(ctx, photoX, photoY, photoSize, photoSize, 24, false, false);
    ctx.clip();

    // Mantém proporção centralizada
    const aspectImg = babyImg.width / babyImg.height;
    let sW = photoSize;
    let sH = photoSize;
    let sX = photoX;
    let sY = photoY;

    if (aspectImg > 1) {
      sW = photoSize * aspectImg;
      sX = photoX - (sW - photoSize) / 2;
    } else {
      sH = photoSize / aspectImg;
      sY = photoY - (sH - photoSize) / 2;
    }

    ctx.drawImage(babyImg, sX, sY, sW, sH);
    ctx.restore();
  } else {
    // Placeholder bonito com pezinho vetorial e coração
    ctx.fillStyle = theme.cardBg;
    roundRect(ctx, photoX, photoY, photoSize, photoSize, 24, true, false);
    drawStylizedFootprint(ctx, W / 2, photoY + photoSize / 2 - 20, 2.2, theme.accentColor);

    ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = theme.subTextColor;
    ctx.fillText('Adicione a foto do bebê 📸', W / 2, photoY + photoSize - 50);
  }

  // 7. Grid de Métricas do Nascimento (Data, Hora, Peso, Comprimento)
  const badgesY = isStory ? photoY + photoSize + 60 : photoY + photoSize + 35;
  const badgeWidth = (W - margin * 2 - 90) / 4;
  const badgeHeight = isStory ? 150 : 120;
  const badgesStartX = margin + 45;

  const metrics = [
    { label: 'DATA', value: cardData.birthDate || '25/09/2026', icon: '📅' },
    { label: 'HORA', value: cardData.birthTime ? `${cardData.birthTime}h` : '14:35h', icon: '⏰' },
    { label: 'PESO', value: cardData.weight ? `${cardData.weight} kg` : '3.420 kg', icon: '⚖️' },
    { label: 'ALTURA', value: cardData.height ? `${cardData.height} cm` : '49 cm', icon: '📏' },
  ];

  metrics.forEach((m, idx) => {
    const bx = badgesStartX + idx * (badgeWidth + 15);
    const by = badgesY;

    // Fundo do card
    ctx.fillStyle = theme.cardBg;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.04)';
    ctx.shadowBlur = 10;
    roundRect(ctx, bx, by, badgeWidth, badgeHeight, 20, true, false);
    ctx.shadowBlur = 0;

    // Borda do badge
    ctx.strokeStyle = theme.borderGold;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.3;
    roundRect(ctx, bx, by, badgeWidth, badgeHeight, 20, false, true);
    ctx.globalAlpha = 1.0;

    // Ícone
    ctx.font = isStory ? '32px sans-serif' : '26px sans-serif';
    ctx.fillText(m.icon, bx + badgeWidth / 2, by + (isStory ? 45 : 35));

    // Valor em destaque
    ctx.font = `bold ${isStory ? 24 : 20}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.fillStyle = theme.primaryColor;
    ctx.fillText(m.value, bx + badgeWidth / 2, by + (isStory ? 90 : 72));

    // Label
    ctx.font = '600 15px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = theme.subTextColor;
    ctx.letterSpacing = '1px';
    ctx.fillText(m.label, bx + badgeWidth / 2, by + (isStory ? 125 : 100));
  });

  // 8. Seção do Pezinho (Foto Real ou Ícone Realista) + Mensagem dos Pais
  if (isStory) {
    const footerStartY = badgesY + badgeHeight + 50;

    // Card do Pezinho / Carimbo
    const footImg = await loadImage(cardData.footprintUrl);
    const footBoxW = 160;
    const footBoxH = 160;
    const footBoxX = margin + 50;

    ctx.fillStyle = theme.cardBg;
    roundRect(ctx, footBoxX, footerStartY, footBoxW, footBoxH, 20, true, false);
    ctx.strokeStyle = theme.borderGold;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.3;
    roundRect(ctx, footBoxX, footerStartY, footBoxW, footBoxH, 20, false, true);
    ctx.globalAlpha = 1.0;

    if (footImg) {
      ctx.save();
      roundRect(ctx, footBoxX + 8, footerStartY + 8, footBoxW - 16, footBoxH - 16, 14, false, false);
      ctx.clip();
      ctx.drawImage(footImg, footBoxX + 8, footerStartY + 8, footBoxW - 16, footBoxH - 16);
      ctx.restore();
    } else {
      drawStylizedFootprint(ctx, footBoxX + footBoxW / 2, footerStartY + footBoxH / 2 - 5, 1.1, theme.accentColor);
      ctx.font = '600 13px sans-serif';
      ctx.fillStyle = theme.subTextColor;
      ctx.fillText('Pezinho Real 👣', footBoxX + footBoxW / 2, footerStartY + footBoxH - 14);
    }

    // Informações da Família e Mensagem (ao lado do pezinho)
    const textStartX = footBoxX + footBoxW + 30;
    const textMaxW = W - textStartX - margin - 40;

    ctx.textAlign = 'left';

    // Pais
    if (cardData.parents) {
      ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = theme.primaryColor;
      ctx.fillText(`👨‍👩‍👧 ${cardData.parents}`, textStartX, footerStartY + 35);
    }

    // Local / Maternidade
    if (cardData.hospital) {
      ctx.font = '500 18px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = theme.subTextColor;
      ctx.fillText(`🏥 ${cardData.hospital}`, textStartX, footerStartY + 70);
    }

    // Frase carinhosa
    const quote = cardData.message || 'Cheguei para encher a nossa família de amor e alegria sem fim! ✨';
    ctx.font = 'italic 18px Georgia, serif';
    ctx.fillStyle = theme.textColor;
    wrapText(ctx, `"${quote}"`, textStartX, footerStartY + 115, textMaxW, 26);

    // Rodapé sutil com FirstBump
    ctx.textAlign = 'center';
    ctx.font = '500 16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = theme.subTextColor;
    ctx.globalAlpha = 0.7;
    ctx.fillText('FirstBump 🍼 Cartão de Boas-Vindas', W / 2, H - 75);
    ctx.globalAlpha = 1.0;
  } else {
    // Modo Quadrado (1:1): Pais e Mensagem centralizados
    ctx.textAlign = 'center';
    const bottomY = badgesY + badgeHeight + 35;

    if (cardData.parents) {
      ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = theme.primaryColor;
      ctx.fillText(`👨‍👩‍👧 ${cardData.parents}${cardData.hospital ? ` · 🏥 ${cardData.hospital}` : ''}`, W / 2, bottomY + 15);
    }

    const quote = cardData.message || 'Cheguei para encher o mundo de amor! ✨';
    ctx.font = 'italic 18px Georgia, serif';
    ctx.fillStyle = theme.textColor;
    ctx.fillText(`"${quote}"`, W / 2, bottomY + 50);
  }

  return canvas;
}

// Quebra de texto automática no canvas
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let curY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, curY);
      line = words[n] + ' ';
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, curY);
}
