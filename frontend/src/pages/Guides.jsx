import { useState, useMemo } from 'react';
import { Apple, Baby, Activity, Heart, Moon, Shield, Droplets, Info, Search, X, Star, AlertTriangle, ShieldAlert, CheckCircle2, PhoneCall } from 'lucide-react';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import { fireSparkleBurst } from '../utils/confetti';
import { storage } from '../services/storage';

const CATEGORIES = ['Todos', '⭐ Favoritos', 'Desenvolvimento', 'Alimentação', 'Saúde & Hábitos'];

const CATEGORY_COLORS = {
  'Desenvolvimento': { bg: '#eff6ff', color: '#2563eb', iconBg: '#dbeafe' },
  'Alimentação':     { bg: '#f0fdf4', color: '#16a34a', iconBg: '#dcfce7' },
  'Saúde & Hábitos': { bg: '#fdf4ff', color: '#9333ea', iconBg: '#f3e8ff' },
};

const GUIDES_DATA = [
  // ── DESENVOLVIMENTO ───────────────────────────────────────────────────────
  {
    id: 1,
    title: '1º Trimestre: Semanas 1 a 13',
    category: 'Desenvolvimento',
    icon: Baby,
    summary: 'O bebê vai de uma semente de papoula ao tamanho de um limão.',
    content: [
      {
        heading: '🌱 O que acontece com o bebê',
        text: 'Este é o trimestre mais crítico do desenvolvimento. As células se dividem rapidamente formando todos os órgãos vitais — coração, cérebro, pulmões e fígado. Ao final da semana 10, o bebê já é tecnicamente chamado de feto.',
      },
      {
        heading: '🤰 O que a mãe sente',
        text: 'Enjoos matinais (que podem ocorrer a qualquer hora), cansaço intenso, seios sensíveis, vontades e aversões alimentares são muito comuns. O corpo está trabalhando muito para sustentar o crescimento inicial.',
      },
      {
        heading: '📋 O que fazer nesta fase',
        text: '• Iniciar o pré-natal o quanto antes.\n• Solicitar os exames de sangue iniciais (hemograma, tipagem, toxoplasmose, rubéola, etc.).\n• Começar a suplementar ácido fólico, se ainda não estiver fazendo.\n• Fazer o Ultrassom Morfológico do 1º Trimestre (entre semanas 11 e 13).',
      },
    ],
  },
  {
    id: 2,
    title: '2º Trimestre: Semanas 14 a 27',
    category: 'Desenvolvimento',
    icon: Baby,
    summary: 'A "lua de mel" da gravidez. O bebê começa a chutar!',
    content: [
      {
        heading: '💪 O que acontece com o bebê',
        text: 'Os órgãos já estão formados e agora crescem e amadurecem. O bebê desenvolve impressões digitais, sobrancelhas e cabelos. Ele começa a ouvir sons — incluindo sua voz e músicas. Os chutinhos começam por volta da semana 18-20.',
      },
      {
        heading: '🤰 O que a mãe sente',
        text: 'Na maioria dos casos, os enjoos diminuem e a energia volta. A barriga começa a aparecer de forma mais evidente. Pode surgir dor nas costas e na região pélvica conforme o bebê cresce.',
      },
      {
        heading: '📋 O que fazer nesta fase',
        text: '• Ultrassom Morfológico do 2º Trimestre (entre semanas 18 e 24) — o exame mais esperado!\n• Exame de glicemia (curva glicêmica) para detectar diabetes gestacional.\n• Começar a preparar o quarto do bebê e montar o enxoval.\n• Considerar as aulas de preparação para o parto.',
      },
    ],
  },
  {
    id: 3,
    title: '3º Trimestre: Semanas 28 a 40',
    category: 'Desenvolvimento',
    icon: Baby,
    summary: 'A reta final. O bebê se posiciona para o parto.',
    content: [
      {
        heading: '🎯 O que acontece com o bebê',
        text: 'O bebê engorda rapidamente, acumulando gordura para manter a temperatura após o nascimento. Os pulmões amadurecem — a habilidade de respirar fora do útero se desenvolve neste período. O bebê se posiciona de cabeça para baixo (apresentação cefálica) em preparação para o parto.',
      },
      {
        heading: '🤰 O que a mãe sente',
        text: 'Falta de ar (pois o bebê comprime o diafragma), dificuldade para dormir, inchaço nos pés e tornozelos e contrações de Braxton-Hicks (treino do útero, não é parto!) são esperados.',
      },
      {
        heading: '📋 O que fazer nesta fase',
        text: '• Montar a mala da maternidade (a partir da semana 34).\n• Definir e visitar a maternidade onde o parto será realizado.\n• Fazer o Grupo B Streptococcus (GBS) por volta da semana 35-37.\n• Escolher o pediatra que acompanhará o bebê após o nascimento.\n• Visita ao anestesista (se optar por analgesia no parto).',
      },
    ],
  },

  // ── ALIMENTAÇÃO ───────────────────────────────────────────────────────────
  {
    id: 4,
    title: 'Ácido Fólico: O que é e por que é tão importante',
    category: 'Alimentação',
    icon: Apple,
    summary: 'A vitamina mais importante nas primeiras semanas. Não pule!',
    content: [
      {
        heading: '🧬 Por que é essencial',
        text: 'O ácido fólico (vitamina B9) é fundamental para a formação do tubo neural do bebê, estrutura que dá origem ao cérebro e à medula espinhal. Sua deficiência pode causar anencefalia ou espinha bífida. A suplementação deve começar idealmente 3 meses ANTES da gestação.',
      },
      {
        heading: '🥦 Onde encontrar nos alimentos',
        text: '• Vegetais verde-escuros: espinafre, couve, brócolis, aspargos.\n• Leguminosas: feijão, lentilha, grão-de-bico.\n• Frutas cítricas: laranja, limão, acerola.\n• Fígado bovino (com moderação, no máximo 1x por semana).\n• Ovos.',
      },
      {
        heading: '💊 Suplementação',
        text: 'A dose diária recomendada durante a gestação é de 400 a 800 mcg/dia. Como é difícil atingir isso só pela dieta, a suplementação em comprimidos é geralmente prescrita pelo médico. Não interrompa por conta própria.',
      },
    ],
  },
  {
    id: 5,
    title: 'Alimentos a Evitar na Gravidez',
    category: 'Alimentação',
    icon: Shield,
    summary: 'Uma lista clara do que não deve estar no prato durante a gestação.',
    content: [
      {
        heading: '🚫 Evite completamente',
        text: '• Bebidas alcoólicas (não existe dose segura).\n• Peixes de alto teor de mercúrio: tubarão, cação, peixe-espada e atum fresco em grande quantidade.\n• Queijos de casca mole e mofados: brie, camembert, roquefort (risco de listeria).\n• Leite e suco não pasteurizados.\n• Sushi e sashimi (peixes crus).',
      },
      {
        heading: '⚠️ Consuma com moderação',
        text: '• Cafeína: limite a 200mg/dia (equivalente a ~2 xícaras de café). Inclui chá-preto, chá-verde e refrigerantes com cafeína.\n• Carnes mal passadas ou cruas.\n• Ovos crus ou mal cozidos.\n• Adoçantes artificiais: prefira fontes naturais.',
      },
      {
        heading: '✅ Dica prática',
        text: 'Em vez de focar no que não pode comer, foque em variedade e nutrição. Uma dieta colorida e equilibrada, com muitas frutas, legumes e proteínas magras, é o melhor caminho para uma gestação saudável.',
      },
    ],
  },
  {
    id: 6,
    title: 'Hidratação: Por que beber mais água na gravidez',
    category: 'Alimentação',
    icon: Droplets,
    summary: 'A água desempenha um papel ainda maior quando você está grávida.',
    content: [
      {
        heading: '💧 Por que a hidratação importa mais',
        text: 'Durante a gestação, o volume de sangue aumenta em até 50%. A água é fundamental para formar o líquido amniótico, transportar nutrientes para o bebê, regular a temperatura corporal e prevenir infecções urinárias (muito comuns na gravidez).',
      },
      {
        heading: '📏 Quanto beber',
        text: 'A recomendação geral é de 8 a 12 copos de água por dia (cerca de 2 a 3 litros). Em dias quentes ou após exercícios, aumente a ingestão. Frutas com alto teor de água (melancia, melão, pepino) também contam.',
      },
      {
        heading: '💡 Dicas para beber mais',
        text: '• Tenha sempre uma garrafa de água por perto.\n• Adicione rodelas de limão, folhas de hortelã ou frutas para dar sabor.\n• Beba um copo ao acordar antes de qualquer outra coisa.\n• Urina amarela escura? Sinal de que você precisa beber mais água.',
      },
    ],
  },

  // ── SAÚDE & HÁBITOS ────────────────────────────────────────────────────────
  {
    id: 7,
    title: 'Exercícios Físicos Seguros na Gravidez',
    category: 'Saúde & Hábitos',
    icon: Activity,
    summary: 'Manter-se ativa traz benefícios enormes para mãe e bebê.',
    content: [
      {
        heading: '🏃‍♀️ Benefícios de se manter ativa',
        text: 'Exercícios regulares durante a gravidez reduzem o risco de diabetes gestacional, hipertensão e depressão perinatal. Ajudam a controlar o peso, melhoram o sono e a postura, e podem facilitar o trabalho de parto.',
      },
      {
        heading: '✅ Exercícios recomendados',
        text: '• Caminhada: ideal para todos os trimestres, segura e de baixo impacto.\n• Natação e hidroginástica: aliviam o peso nas articulações e são excelentes para o 3º trimestre.\n• Yoga para gestantes: melhora flexibilidade, respiração e equilíbrio emocional.\n• Pilates adaptado: fortalece o assoalho pélvico e a região lombar.\n• Dança: alegre e eficaz, desde que sem movimentos bruscos.',
      },
      {
        heading: '🚫 O que evitar',
        text: '• Esportes de contato ou com risco de queda (jiu-jitsu, futebol, ciclismo off-road).\n• Mergulho autônomo.\n• Exercícios deitada de costas por longos períodos a partir do 2º trimestre (pressiona a veia cava).\n• Atividades em altitudes muito elevadas.\n\n⚠️ Sempre consulte seu obstetra antes de iniciar qualquer programa de exercícios.',
      },
    ],
  },
  {
    id: 8,
    title: 'Saúde Mental e Emocional na Gravidez',
    category: 'Saúde & Hábitos',
    icon: Heart,
    summary: 'Cuidar da mente é tão importante quanto cuidar do corpo.',
    content: [
      {
        heading: '🧠 O que é normal sentir',
        text: 'Ansiedade, medos sobre o parto e a maternidade, oscilações de humor — tudo isso é normal. As mudanças hormonais intensas afetam diretamente as emoções. Sentir-se sobrecarregada às vezes não significa que você é uma má mãe.',
      },
      {
        heading: '❤️ Depressão Perinatal',
        text: 'A depressão não afeta apenas o pós-parto. Ela pode surgir durante a gravidez (depressão pré-natal) e é muito sub-diagnosticada. Sintomas que duram mais de 2 semanas — tristeza persistente, perda de prazer, isolamento — merecem atenção profissional imediata.',
      },
      {
        heading: '🌿 Práticas que ajudam',
        text: '• Fale sobre como você se sente com seu parceiro, família ou amigos próximos.\n• Mantenha-se conectada com pessoas que te apoiam.\n• Pratique atividades que te dão prazer: leitura, música, artesanato.\n• Meditação e respiração consciente ajudam no dia a dia.\n• Busque um psicólogo ou psicoterapeuta — é um ato de amor por você e pelo bebê.',
      },
    ],
  },
  {
    id: 9,
    title: 'Sono na Gravidez: Como Descansar Melhor',
    category: 'Saúde & Hábitos',
    icon: Moon,
    summary: 'O descanso é tão fundamental quanto a alimentação nesta fase.',
    content: [
      {
        heading: '😴 Por que o sono muda',
        text: 'Os níveis elevados de progesterona causam sonolência no 1º trimestre. No 3º trimestre, a barriga grande, idas ao banheiro à noite e desconforto físico tornam o sono fragmentado. A privação de sono aumenta o risco de depressão e dificulta a recuperação pós-parto.',
      },
      {
        heading: '🛌 A posição ideal para dormir',
        text: 'Dormir de lado — preferencialmente sobre o lado esquerdo — é a posição mais recomendada a partir do 2º trimestre. Isso melhora a circulação e o fluxo de sangue e nutrientes para o bebê. Use travesseiros entre os joelhos e sob a barriga para apoio.',
      },
      {
        heading: '💡 Dicas para dormir melhor',
        text: '• Evite telas (celular, TV) pelo menos 30 minutos antes de dormir.\n• Mantenha o quarto fresco e escuro.\n• Evite líquidos em excesso 2 horas antes de dormir para reduzir as idas ao banheiro.\n• Travesseiros de corpo (em "U" ou "C") são ótimos para apoio.\n• Cochilo diurno? Pode e deve! Limite a 20-30 minutos para não prejudicar o sono noturno.',
      },
    ],
  },
  {
    id: 10,
    title: 'Saúde Oral na Gravidez',
    category: 'Saúde & Hábitos',
    icon: Info,
    summary: 'A saúde da gengiva está ligada ao risco de parto prematuro.',
    content: [
      {
        heading: '🦷 A conexão que pouca gente conhece',
        text: 'Estudos mostram que problemas gengivais severos (periodontite) estão associados a risco aumentado de parto prematuro e bebê com baixo peso. As mudanças hormonais deixam as gengivas mais sensíveis e propensas a sangrar — isso é chamado de "gengivite gravídica".',
      },
      {
        heading: '✅ O que fazer',
        text: '• Visite o dentista ao menos uma vez durante a gestação — é seguro e recomendado.\n• Escove os dentes 3x ao dia com escova macia.\n• Use fio dental diariamente.\n• Enjoos frequentes? Após vomitar, enxague com água e espere 30 minutos antes de escovar para não agredir o esmalte.\n• Informe sempre ao dentista que está grávida e em que semana.',
      },
      {
        heading: '💊 Procedimentos seguros e a evitar',
        text: 'Limpeza de tártaro, restaurações e tratamentos de canal podem ser feitos com segurança durante a gravidez, preferencialmente no 2º trimestre. Evite Raio-X dentário se possível (especialmente no 1º trimestre) e anestésicos que contenham epinefrina sem orientação médica.',
      },
    ],
  },
];

export default function Guides() {
  const [expandedId, setExpandedId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = storage.getSetting('guide_favorites');
      return saved ? JSON.parse(saved.value) : [];
    } catch (e) {
      return [];
    }
  });

  const toggleGuide = (id) => {
    soundSynthesizer.playPop();
    setExpandedId(expandedId === id ? null : id);
  };

  const handleToggleFavorite = (e, id) => {
    e.stopPropagation();
    let updated;
    if (favorites.includes(id)) {
      updated = favorites.filter((favId) => favId !== id);
      soundSynthesizer.playPop();
    } else {
      updated = [...favorites, id];
      soundSynthesizer.playChime();
      if (e && e.currentTarget) {
        const rect = e.currentTarget.getBoundingClientRect();
        fireSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    }
    setFavorites(updated);
    storage.setSetting('guide_favorites', JSON.stringify(updated));
  };

  const filtered = useMemo(() => {
    return GUIDES_DATA.filter((guide) => {
      // Filtro de Categoria
      if (activeCategory === '⭐ Favoritos' && !favorites.includes(guide.id)) {
        return false;
      }
      if (activeCategory !== 'Todos' && activeCategory !== '⭐ Favoritos' && guide.category !== activeCategory) {
        return false;
      }

      // Filtro de Busca
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = guide.title.toLowerCase().includes(q);
        const matchesSummary = guide.summary.toLowerCase().includes(q);
        const matchesContent = guide.content.some(
          (c) => c.heading.toLowerCase().includes(q) || c.text.toLowerCase().includes(q)
        );
        return matchesTitle || matchesSummary || matchesContent;
      }

      return true;
    });
  }, [activeCategory, searchQuery, favorites]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '6px' }}>Biblioteca Clínica & Guias</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Orientações médicas embasadas sobre nutrição, desenvolvimento fetal e hábitos saudáveis para cada semana.
          </p>
        </div>
      </div>

      {/* SINAIS DE ALERTA OBSTÉTRICO (QUANDO IR IMEDIATAMENTE À MATERNIDADE) */}
      <div className="guide-red-flags-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <ShieldAlert size={24} style={{ color: '#dc2626', flexShrink: 0 }} />
          <div>
            <strong style={{ fontSize: '1.05rem', color: '#dc2626', display: 'block' }}>
              🚨 Sinais de Alerta Obstétrico: Quando Procurar o Pronto-Socorro Imediatamente
            </strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Independentemente da idade gestacional, não espere a próxima consulta se apresentar:
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px', marginTop: '12px' }}>
          <div style={{ background: 'var(--surface)', padding: '10px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
            🩸 <b>Sangramento Vaginal:</b> Qualquer sangramento vivo como menstruação.
          </div>
          <div style={{ background: 'var(--surface)', padding: '10px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
            💧 <b>Perda de Líquido:</b> Escorrimento aquoso contínuo ou em jato (bolsa rota).
          </div>
          <div style={{ background: 'var(--surface)', padding: '10px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
            🛑 <b>Movimentos Fetais:</b> Queda brusca na movimentação após a 28ª semana.
          </div>
          <div style={{ background: 'var(--surface)', padding: '10px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
            ⚡ <b>Cefaleia com Escotomas:</b> Dor de cabeça forte com visão embaçada ou luzes.
          </div>
        </div>
      </div>

      {/* Busca em Tempo Real nos Guias */}
      <div className="guide-search-box">
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          className="guide-search-input"
          placeholder="Pesquisar por assunto (ex: ácido fólico, dor nas costas, queijos, exercícios, enjoo)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filtros de Categoria */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat;
          const count = cat === '⭐ Favoritos' ? favorites.length : null;

          return (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                soundSynthesizer.playPop();
              }}
              style={{
                padding: '6px 16px',
                borderRadius: '999px',
                border: '1px solid',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: isSelected ? 'var(--primary)' : 'var(--surface)',
                color: isSelected ? '#fff' : 'var(--text-muted)',
                borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {cat} {count !== null ? `(${count})` : ''}
            </button>
          );
        })}
      </div>

      {/* Lista de Guias */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filtered.map((guide) => {
          const isOpen = expandedId === guide.id;
          const isFavorited = favorites.includes(guide.id);
          const colors = CATEGORY_COLORS[guide.category] || {};
          const Icon = guide.icon;

          return (
            <div
              key={guide.id}
              className="card"
              style={{
                cursor: 'pointer',
                padding: '20px 24px',
                marginBottom: 0,
                borderLeft: isOpen ? `4px solid ${colors.color || 'var(--accent)'}` : '4px solid transparent',
                transition: 'border-color 0.2s, transform 0.15s, box-shadow 0.2s',
              }}
              onClick={() => toggleGuide(guide.id)}
            >
              {/* Cabeçalho */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    color: colors.color,
                    backgroundColor: colors.iconBg,
                    padding: '10px',
                    borderRadius: '50%',
                    display: 'flex',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={22} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: colors.color,
                        backgroundColor: colors.bg,
                        padding: '2px 8px',
                        borderRadius: '999px',
                      }}
                    >
                      {guide.category}
                    </span>
                  </div>

                  <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {guide.title}
                  </h2>

                  {!isOpen && (
                    <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {guide.summary}
                    </p>
                  )}
                </div>

                {/* Botão de Favoritar */}
                <button
                  className="btn-icon"
                  onClick={(e) => handleToggleFavorite(e, guide.id)}
                  title={isFavorited ? 'Remover dos favoritos' : 'Favoritar este guia'}
                  style={{ color: isFavorited ? '#eab308' : 'var(--text-muted)', padding: '6px' }}
                >
                  <Star size={19} fill={isFavorited ? '#eab308' : 'none'} />
                </button>

                <div
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '1.4rem',
                    fontWeight: 300,
                    flexShrink: 0,
                    width: '24px',
                    textAlign: 'center',
                  }}
                >
                  {isOpen ? '−' : '+'}
                </div>
              </div>

              {/* Conteúdo expandido */}
              {isOpen && (
                <div
                  style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {guide.content.map((section, idx) => (
                    <div key={idx} style={{ marginBottom: '20px' }}>
                      <h3
                        style={{
                          fontSize: '0.98rem',
                          fontWeight: 700,
                          color: 'var(--primary)',
                          marginBottom: '8px',
                        }}
                      >
                        {section.heading}
                      </h3>
                      <p
                        style={{
                          fontSize: '0.95rem',
                          color: 'var(--text-main)',
                          whiteSpace: 'pre-wrap',
                          lineHeight: '1.75',
                          margin: 0,
                        }}
                      >
                        {section.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state card">
          Nenhum guia encontrado para a busca "{searchQuery}" ou categoria selecionada.
        </div>
      )}
    </div>
  );
}
