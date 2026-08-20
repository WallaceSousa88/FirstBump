import { useState } from 'react';
import { Apple, Baby, Activity, Heart, Moon, Shield, Droplets, Info } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Dados dos Guias
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES = ['Todos', 'Desenvolvimento', 'Alimentação', 'Saúde & Hábitos'];

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

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────

export default function Guides() {
  const [expandedId, setExpandedId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Todos');

  const toggleGuide = (id) => setExpandedId(expandedId === id ? null : id);

  const filtered = activeCategory === 'Todos'
    ? GUIDES_DATA
    : GUIDES_DATA.filter(g => g.category === activeCategory);

  return (
    <div>
      <h1 className="page-title">Biblioteca & Guias</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
        Conteúdo confiável sobre nutrição, desenvolvimento do bebê e hábitos saudáveis para acompanhar cada fase da sua gestação.
      </p>

      {/* Filtros de Categoria */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '6px 16px',
              borderRadius: '999px',
              border: '1px solid',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: activeCategory === cat ? 'var(--primary)' : 'transparent',
              color: activeCategory === cat ? '#fff' : 'var(--text-muted)',
              borderColor: activeCategory === cat ? 'var(--primary)' : 'var(--border)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lista de Guias */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map(guide => {
          const isOpen = expandedId === guide.id;
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
                borderLeft: isOpen ? `4px solid ${colors.color}` : '4px solid transparent',
                transition: 'border-color 0.2s',
              }}
              onClick={() => toggleGuide(guide.id)}
            >
              {/* Cabeçalho */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  color: colors.color,
                  backgroundColor: colors.iconBg,
                  padding: '10px',
                  borderRadius: '50%',
                  display: 'flex',
                  flexShrink: 0,
                }}>
                  <Icon size={22} />
                </div>

                <div style={{ flex: 1 }}>
                  <span style={{
                    display: 'inline-block',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: colors.color,
                    backgroundColor: colors.bg,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    marginBottom: '5px',
                  }}>
                    {guide.category}
                  </span>
                  <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--primary)' }}>
                    {guide.title}
                  </h2>
                  {!isOpen && (
                    <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {guide.summary}
                    </p>
                  )}
                </div>

                <div style={{
                  color: 'var(--text-muted)',
                  fontSize: '1.4rem',
                  fontWeight: 300,
                  flexShrink: 0,
                  width: '24px',
                  textAlign: 'center',
                }}>
                  {isOpen ? '−' : '+'}
                </div>
              </div>

              {/* Conteúdo expandido */}
              {isOpen && (
                <div
                  style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}
                  onClick={e => e.stopPropagation()}
                >
                  {guide.content.map((section, idx) => (
                    <div key={idx} style={{ marginBottom: '20px' }}>
                      <h3 style={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: 'var(--primary)',
                        marginBottom: '8px',
                      }}>
                        {section.heading}
                      </h3>
                      <p style={{
                        fontSize: '0.95rem',
                        color: 'var(--text-main)',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.75',
                        margin: 0,
                      }}>
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
        <div className="empty-state card">Nenhum guia encontrado para essa categoria.</div>
      )}
    </div>
  );
}
