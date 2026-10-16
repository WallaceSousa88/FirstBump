// Dados anatômicos, sensoriais e dicas de suporte por semana gestacional (Semanas 1 a 40)

export const WEEKLY_SENSORY_DATA = {
  stage1: {
    hearing: 'Ouvido interno e placóides acústicos em fase embrionária de diferenciação celular.',
    vision: 'Vesículas ópticas primitivas se formam a partir do tubo neural.',
    touchAndMotor: 'Divisão celular celular acelerada e nidação perfeita no endométrio materno.',
    tasteAndSwallow: 'Nutrição celular embrionária inicial mediada pelo saco vitelino.',
    lungsAndBreathing: 'Folhetos embrionários estabelecendo as bases do futuro sistema cardiorrespiratório.',
    momTip: 'Mantenha o ácido fólico em dia, beba muita água e evite qualquer esforço extenuante.',
    partnerMission: 'Garanta um ambiente sereno em casa, prepare alimentos leves e celebre essa nova fase com carinho.',
  },
  stage2: {
    hearing: 'Ossículos do ouvido médio (martelo, bigorna e estribo) em formação cartilaginosa.',
    vision: 'Pálpebras se formam e permanecem suavemente seladas para proteger as retinas sensíveis.',
    touchAndMotor: 'Dedinhos se separam; pequenos reflexos involuntários e ondulações corporais começam.',
    tasteAndSwallow: 'Boca e papilas gustativas primárias começam a se diferenciar.',
    lungsAndBreathing: 'Aparelho brônquico ramifica-se nos primeiros segmentos pulmonares.',
    momTip: 'Pequenas porções de alimentos frios e secos (biscoito integral, água com limão) amenizam o enjoo.',
    partnerMission: 'Assuma tarefas com cheiros fortes na cozinha e deixe a mãe descansar sempre que sentir sono.',
  },
  stage3: {
    hearing: 'Percebe vibrações graves através do líquido amniótico: pulso cardíaco materno e fluxo uterino.',
    vision: 'Movimentos oculares lentos acontecem por trás das pálpebras protetoras.',
    touchAndMotor: 'Reflexo de sucção ativo! O bebê já leva o dedinho à boca e segura o cordão umbilical.',
    tasteAndSwallow: 'Engole ativamente líquido amniótico e percebe moléculas aromáticas da alimentação da mãe.',
    lungsAndBreathing: 'Treina movimentos torácicos respiratórios movimentando líquido pelos pulmões em formação.',
    momTip: 'Sua energia começa a se renovar! Hidrate bem a pele da barriga e seios com óleos naturais.',
    partnerMission: 'Presenteie a mãe com uma massagem relaxante nas costas e nos pés antes de dormir.',
  },
  stage4: {
    hearing: 'Reconhece o tom e o ritmo da voz da mãe como o som mais reconfortante do universo.',
    vision: 'Retinas sensíveis à luz; o bebê pode reagir virando a cabecinha em direção a focos de luz forte.',
    touchAndMotor: 'Sensação das "borboletinhas": chutes, reviravoltas e alongamentos perceptíveis na barriga.',
    tasteAndSwallow: 'Deglutição frequente que auxilia na maturação do trato gastrointestinal e rins.',
    lungsAndBreathing: 'Alvéolos pulmonares primitivos em expansão com primeiros sinais de surfactante.',
    momTip: 'Reserve momentos do dia deitada em silêncio após comer para sentir os chutinhos com tranquilidade.',
    partnerMission: 'Coloque a mão na barriga e converse em voz alta com o bebê para ele memorizar o seu tom de voz.',
  },
  stage5: {
    hearing: 'Audição apurada: ouve e se assusta com barulhos súbitos, acalma-se com cantigas de ninar.',
    vision: 'As pálpebras se abrem! O bebê já pisca, fecha os olhinhos para dormir e os abre acordado.',
    touchAndMotor: 'Pele recoberta pelo vérnix caseoso protetor; mãos ágeis e coordenação motora refinada.',
    tasteAndSwallow: 'Preferência nata por sabores doces; reage com movimentos mais ativos a estímulos saborosos.',
    lungsAndBreathing: 'Capilares sanguíneos pulmonares realizam trocas gasosas simuladas no líquido amniótico.',
    momTip: 'Durma virada para o lado esquerdo com apoio de travesseiro entre os joelhos para melhorar a oxigenação.',
    partnerMission: 'Ajude na organização dos itens do quarto e prepare uma playlist suave para os momentos de relaxamento.',
  },
  stage6: {
    hearing: 'Memória auditiva formada: reconhece canções tocadas repetidamente durante a gestação.',
    vision: 'Pupilas reagem com contração e dilatação automática à incidência de luz externa.',
    touchAndMotor: 'Espaço mais aconchegante: os movimentos se transformam em empurrões fortes, cotoveladas e soluços rítmicos.',
    tasteAndSwallow: 'Coordenação neuromuscular perfeita de sucção, deglutição e respiração fetal.',
    lungsAndBreathing: 'Produção maciça de surfactante pulmonar, garantindo elasticidade dos alvéolos ao nascer.',
    momTip: 'Eleve as pernas durante a tarde para reduzir a retenção de líquidos e o inchaço nos tornozelos.',
    partnerMission: 'Faça escalda-pés com água morna e camomila para aliviar o cansaço dos pés da mamãe.',
  },
  stage7: {
    hearing: 'Pronto para se acalmar imediatamente ao escutar os batimentos cardíacos da mãe no colo!',
    vision: 'Visão perfeitamente ajustada para focar o rosto da mãe a 20-30 cm durante a amamentação.',
    touchAndMotor: 'Sensibilidade tátil total e reflexo de busca apurado, ansioso pelo contato pele a pele imediato.',
    tasteAndSwallow: 'Reflexo de sucção vigoroso e mecônio pronto no intestino para as primeiras horas pós-parto.',
    lungsAndBreathing: 'Pulmões 100% maduros e prontos para o primeiro e emocionante choro da vida!',
    momTip: 'Confie na potência do seu corpo. Descanse bastante e deixe a malinha da maternidade pronta.',
    partnerMission: 'Seja a âncora de segurança: memorize o caminho da maternidade, separe os documentos e apoie cada respiração.',
  },
};

export function getWeeklySensory(week) {
  const w = Math.max(1, Math.min(40, Number(week) || 1));
  if (w <= 4) return { ...WEEKLY_SENSORY_DATA.stage1, week: w, phaseName: 'Concepção & Nidação' };
  if (w <= 10) return { ...WEEKLY_SENSORY_DATA.stage2, week: w, phaseName: 'Diferenciação & Primeiros Batimentos' };
  if (w <= 16) return { ...WEEKLY_SENSORY_DATA.stage3, week: w, phaseName: 'Despertar dos Sentidos & Reflexos' };
  if (w <= 24) return { ...WEEKLY_SENSORY_DATA.stage4, week: w, phaseName: 'Conexão Sensorial & Chutinhos' };
  if (w <= 30) return { ...WEEKLY_SENSORY_DATA.stage5, week: w, phaseName: 'Abertura dos Olhos & Ritmo Circadiano' };
  if (w <= 36) return { ...WEEKLY_SENSORY_DATA.stage6, week: w, phaseName: 'Maturação Pulmonar & Memória Auditiva' };
  return { ...WEEKLY_SENSORY_DATA.stage7, week: w, phaseName: 'Bebê a Termo & Grande Encontro' };
}
