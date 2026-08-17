// ============================================================
// FACTORY QUEST — dados do jogo
// Edite este arquivo para trocar setores, máquinas e perguntas
// sem precisar mexer na lógica do jogo (js/game.js e js/app.js).
// ============================================================

const SECTORS = [
  {
    id: 'usinagem', name: 'Usinagem', color: '#4aa8ff', x: 40, y: 40, w: 300, h: 260, doorSide: 'bottom',
    machines: [
      { id: 'cnc', name: 'CNC', label: 'CNC', x: 150, y: 130, icon: 'gear' },
      { id: 'trn', name: 'Torno', label: 'TRN', x: 280, y: 250, icon: 'gear' }
    ]
  },
  {
    id: 'soldagem', name: 'Soldagem', color: '#ff8c42', x: 370, y: 40, w: 300, h: 260, doorSide: 'bottom',
    machines: [
      { id: 'mig', name: 'Solda MIG', label: 'MIG', x: 480, y: 130, icon: 'spark' },
      { id: 'tig', name: 'Solda TIG', label: 'TIG', x: 610, y: 250, icon: 'spark' }
    ]
  },
  {
    id: 'eletrica', name: 'Elétrica', color: '#f2c94c', x: 700, y: 40, w: 300, h: 260, doorSide: 'bottom',
    machines: [
      { id: 'pwr', name: 'Painel', label: 'PWR', x: 810, y: 130, icon: 'bolt' },
      { id: 'mtr', name: 'Motor', label: 'MTR', x: 940, y: 250, icon: 'bolt' }
    ]
  },
  {
    id: 'mecatronica', name: 'Mecatrônica', color: '#b980f0', x: 40, y: 360, w: 300, h: 260, doorSide: 'top',
    machines: [
      { id: 'rob', name: 'Robô', label: 'ROB', x: 150, y: 450, icon: 'arm' },
      { id: 'srv1', name: 'Servo', label: 'SRV', x: 280, y: 570, icon: 'arm' }
    ]
  },
  {
    id: 'informatica', name: 'Informática', color: '#4ecdc4', x: 370, y: 360, w: 300, h: 260, doorSide: 'top',
    machines: [
      { id: 'srv2', name: 'Servidor', label: 'SRV', x: 480, y: 450, icon: 'monitor' },
      { id: 'plc', name: 'CLP/PLC', label: 'PLC', x: 610, y: 570, icon: 'monitor' }
    ]
  },
  {
    id: 'automacao', name: 'Automação', color: '#6bcf7f', x: 700, y: 360, w: 300, h: 260, doorSide: 'top',
    machines: [
      { id: 'sen', name: 'Sensor', label: 'SEN', x: 810, y: 450, icon: 'conveyor' },
      { id: 'est', name: 'Esteira', label: 'EST', x: 940, y: 570, icon: 'conveyor' }
    ]
  }
];

// Duas "notas" (missões) por setor, cada uma aponta para uma máquina alvo.
const NOTES = [];
SECTORS.forEach((sector) => {
  sector.machines.forEach((machine, i) => {
    NOTES.push({
      id: `${sector.id}-note-${i}`,
      sectorId: sector.id,
      targetMachineId: machine.id,
      x: machine.x + (i === 0 ? -70 : 70),
      y: machine.y + (i === 0 ? 65 : -65)
    });
  });
});

// Banco de perguntas por setor. Adicione quantas quiser — uma é sorteada
// aleatoriamente sempre que o jogador resolve uma missão daquele setor.
const QUESTIONS = {
  usinagem: [
    { q: 'O que é usinagem CNC?', options: ['Controle Numérico Computadorizado', 'Chapa Não Cortada', 'Circuito Numérico de Corte', 'Central de Nivelamento'], correct: 0 },
    { q: 'Qual ferramenta o torno mecânico usa para remover material?', options: ['Ferramenta de corte (bit)', 'Eletrodo', 'Broca magnética', 'Laser'], correct: 0 },
    { q: 'O que mede um paquímetro?', options: ['Dimensões com alta precisão', 'Temperatura', 'Corrente elétrica', 'Pressão de ar'], correct: 0 }
  ],
  soldagem: [
    { q: 'O que significa a sigla MIG na soldagem?', options: ['Metal Inert Gas', 'Máquina de Ignição a Gás', 'Modo de Impacto Guiado', 'Metal Inflamável Girante'], correct: 0 },
    { q: 'Qual gás é comumente usado na solda TIG?', options: ['Argônio', 'Oxigênio puro', 'Hidrogênio', 'Gás de cozinha'], correct: 0 },
    { q: 'Qual EPI é essencial na soldagem?', options: ['Máscara de solda com filtro escuro', 'Óculos de sol comuns', 'Boné', 'Luvas de látex'], correct: 0 }
  ],
  eletrica: [
    { q: 'O que mede um multímetro?', options: ['Tensão, corrente e resistência', 'Velocidade do motor', 'Pressão hidráulica', 'Temperatura ambiente'], correct: 0 },
    { q: 'Qual a unidade de medida da corrente elétrica?', options: ['Ampère (A)', 'Volt (V)', 'Watt (W)', 'Ohm (Ω)'], correct: 0 },
    { q: 'Para que serve um disjuntor num painel elétrico?', options: ['Proteger o circuito contra sobrecarga', 'Aumentar a tensão', 'Armazenar energia', 'Filtrar ruído sonoro'], correct: 0 }
  ],
  mecatronica: [
    { q: 'O que é um servomotor?', options: ['Motor com controle preciso de posição/velocidade', 'Motor a combustão', 'Gerador de energia solar', 'Sensor de temperatura'], correct: 0 },
    { q: 'Quantos eixos tem um braço robótico industrial típico?', options: ['Geralmente 6 eixos', 'Sempre 2 eixos', 'Sempre 10 eixos', '1 eixo fixo'], correct: 0 },
    { q: 'O que é encoder num sistema mecatrônico?', options: ['Sensor que informa posição/velocidade do eixo', 'Cabo de alimentação', 'Tipo de parafuso', 'Software de desenho'], correct: 0 }
  ],
  informatica: [
    { q: 'O que significa CLP (ou PLC em inglês)?', options: ['Controlador Lógico Programável', 'Circuito de Ligação Paralela', 'Cabo de Ligação Principal', 'Central de Log de Processos'], correct: 0 },
    { q: 'O que é um servidor?', options: ['Computador que fornece serviços/dados na rede', 'Cabo de rede', 'Impressora de alta velocidade', 'Tipo de sensor óptico'], correct: 0 },
    { q: 'O que é um protocolo de comunicação industrial?', options: ['Modbus', 'HTML', 'Excel', 'PDF'], correct: 0 }
  ],
  automacao: [
    { q: 'O que faz um sensor de presença numa linha de produção?', options: ['Detecta a presença de objetos/peças', 'Solda peças', 'Gera energia elétrica', 'Imprime etiquetas'], correct: 0 },
    { q: 'Para que serve uma esteira transportadora?', options: ['Movimentar peças/produtos entre etapas', 'Resfriar motores', 'Armazenar dados', 'Cortar metal'], correct: 0 },
    { q: 'O que é automação industrial?', options: ['Uso de sistemas para operar processos com pouca intervenção humana', 'Trabalho totalmente manual', 'Apenas desenho de projetos', 'Somente manutenção de máquinas'], correct: 0 }
  ]
};

const GAME_CONFIG = {
  totalTimeSeconds: 300, // 5:00
  questionTimeSeconds: 12,
  pointsCorrect: 100,
  worldWidth: 1000,
  worldHeight: 660,
  wallThickness: 8,
  doorGap: 100,
  rankingKey: 'factoryQuestRanking',
  rankingMaxEntries: 10
};
