/**
 * Pílulas Diárias de Inspiração, Carinho & Sabedoria Obstétrica
 */

export const MATERNAL_AFFIRMATIONS = [
  {
    quote: 'Seu corpo está realizando a obra de engenharia biológica mais extraordinária da natureza.',
    author: 'Sabedoria da Maternidade',
    tag: 'Inspiração',
    emoji: '✨',
  },
  {
    quote: 'Cada batimento do seu coração é a canção de ninar que seu bebê mais ama ouvir.',
    author: 'Vínculo Afetivo',
    tag: 'Amor',
    emoji: '💓',
  },
  {
    quote: 'Permita-se desacelerar. Descansar também é cuidar do crescimento do seu pacotinho.',
    author: 'Autocuidado',
    tag: 'Bem-estar',
    emoji: '🌸',
  },
  {
    quote: 'Você já é exatamente a mãe ou pai que o seu bebê precisa no mundo.',
    author: 'Acolhimento',
    tag: 'Confiança',
    emoji: '🤱',
  },
  {
    quote: 'A cada copo d\'água que você bebe, você renova o ninho seguro e aconchegante do seu bebê.',
    author: 'Hidratação & Vida',
    tag: 'Saúde',
    emoji: '💧',
  },
  {
    quote: 'Respire fundo. Sinta as mãos sobre o ventre e envie pensamentos de paz para essa nova vida.',
    author: 'Mindfulness Gestacional',
    tag: 'Conexão',
    emoji: '🌿',
  },
  {
    quote: 'Não existe gestação perfeita, existe a sua jornada única, preciosa e inesquecível.',
    author: 'Amor Real',
    tag: 'Jornada',
    emoji: '🌟',
  },
  {
    quote: 'O seu colo já é o lugar mais seguro do universo para quem está a caminho.',
    author: 'Amor Incondicional',
    tag: 'Proteção',
    emoji: '🧸',
  },
];

export function getDailyAffirmation(index) {
  if (typeof index === 'number') {
    return MATERNAL_AFFIRMATIONS[index % MATERNAL_AFFIRMATIONS.length];
  }
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  return MATERNAL_AFFIRMATIONS[dayOfYear % MATERNAL_AFFIRMATIONS.length];
}
