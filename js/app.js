// ============================================================
// FACTORY QUEST — orquestração da interface (fora do Phaser)
// Controla: tela de menu, HUD, modal de quiz, pontuação, timer
// e tela de resultado final.
// ============================================================

window.gameState = null;

function freshState() {
  return {
    name: '',
    score: 0,
    pickedNotes: new Set(),          // notas já coletadas
    activeMissions: {},              // machineId -> sectorId (missão pendente naquela máquina)
    missionsDone: 0,
    totalMissions: NOTES.length,
    timeLeft: GAME_CONFIG.totalTimeSeconds,
    timerId: null,
    paused: false,
    askedQuestions: {}               // sectorId -> Set de índices já perguntados (evita repetição)
  };
}

// ---------- DOM refs ----------
const el = (id) => document.getElementById(id);
const menuScreen = el('menu-screen');
const gameScreen = el('game-screen');
const gameoverScreen = el('gameover-screen');
const quizModal = el('quiz-modal');

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ---------- Menu ----------
function buildLegend() {
  const legend = el('menu-legend');
  legend.innerHTML = '';
  SECTORS.forEach((s) => {
    const item = document.createElement('span');
    item.className = 'legend-item';
    item.innerHTML = `<span class="legend-dot" style="background:${s.color}"></span>${s.name}`;
    legend.appendChild(item);
  });
}

el('stat-missions').textContent = NOTES.length;
el('stat-time').textContent = formatTime(GAME_CONFIG.totalTimeSeconds);
el('stat-sectors').textContent = SECTORS.length;
buildLegend();

el('btn-start').addEventListener('click', () => {
  window.gameState = freshState();
  window.gameState.name = el('player-name').value.trim();
  menuScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  updateHud();
  startFactoryGame();
  startTimer();
});

el('btn-restart').addEventListener('click', () => {
  destroyFactoryGame();
  gameoverScreen.classList.add('hidden');
  menuScreen.classList.remove('hidden');
});

// ---------- HUD ----------
function updateHud() {
  const gs = window.gameState;
  el('hud-timer').textContent = formatTime(gs.timeLeft);
  el('hud-progress').textContent = `${gs.missionsDone}/${gs.totalMissions}`;
  el('hud-score').textContent = `${gs.score} pts`;
}

function setMissionText(text) {
  el('hud-mission-text').textContent = text;
}

// ---------- Timer ----------
function startTimer() {
  const gs = window.gameState;
  gs.timerId = setInterval(() => {
    if (gs.paused) return;
    gs.timeLeft -= 1;
    updateHud();
    if (gs.timeLeft <= 0) {
      clearInterval(gs.timerId);
      endGame('time');
    }
  }, 1000);
}

// ---------- Mission flow (called from js/game.js) ----------
window.onPickUpNote = function (note) {
  const gs = window.gameState;
  if (gs.pickedNotes.has(note.id)) return;
  gs.pickedNotes.add(note.id);
  gs.activeMissions[note.targetMachineId] = note.sectorId;

  const sector = SECTORS.find((s) => s.id === note.sectorId);
  const machine = sector.machines.find((m) => m.id === note.targetMachineId);
  setMissionText(`Missão: vá até ${machine.label} (${machine.name}) — ${sector.name}`);

  if (window.phaserGame) {
    const scene = window.phaserGame.scene.getScene('FactoryScene');
    scene.removeNoteVisual(note.id);
    scene.markMachinePending(machine.id, true);
  }
};

window.onInteractMachine = function (sectorId, machine) {
  const gs = window.gameState;
  if (gs.activeMissions[machine.id] === undefined) {
    setMissionText('Nenhuma missão aqui ainda. Encontre a nota amarela primeiro!');
    return;
  }
  openQuiz(sectorId, machine);
};

// ---------- Quiz ----------
function pickQuestion(sectorId) {
  const gs = window.gameState;
  const bank = QUESTIONS[sectorId] || [];
  if (!gs.askedQuestions[sectorId]) gs.askedQuestions[sectorId] = new Set();
  const asked = gs.askedQuestions[sectorId];

  let pool = bank.map((_, i) => i).filter((i) => !asked.has(i));
  if (pool.length === 0) { asked.clear(); pool = bank.map((_, i) => i); }

  const idx = pool[Math.floor(Math.random() * pool.length)];
  asked.add(idx);
  return bank[idx];
}

let quizTimerInterval = null;

function openQuiz(sectorId, machine) {
  const gs = window.gameState;
  gs.paused = true;

  const sector = SECTORS.find((s) => s.id === sectorId);
  const question = pickQuestion(sectorId);

  el('quiz-sector-label').textContent = sector.name;
  el('quiz-sector-label').style.color = sector.color;
  el('quiz-question').textContent = question.q;
  el('quiz-feedback').textContent = '';
  el('quiz-feedback').className = 'quiz-feedback';

  const optionsWrap = el('quiz-options');
  optionsWrap.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D'];
  question.options.forEach((optionText, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.innerHTML = `<span class="letter">${letters[i]}</span><span>${optionText}</span>`;
    btn.addEventListener('click', () => resolveQuiz(i === question.correct, sectorId, machine, btn, question));
    optionsWrap.appendChild(btn);
  });

  quizModal.classList.remove('hidden');
  startQuizTimer(sectorId, machine, question);
}

function startQuizTimer(sectorId, machine, question) {
  let remaining = GAME_CONFIG.questionTimeSeconds;
  const bar = el('quiz-timer-bar');
  const text = el('quiz-timer-text');
  bar.style.width = '100%';
  bar.style.background = 'var(--accent)';
  text.textContent = `${remaining}s`;

  clearInterval(quizTimerInterval);
  quizTimerInterval = setInterval(() => {
    remaining -= 1;
    const pct = Math.max(0, (remaining / GAME_CONFIG.questionTimeSeconds) * 100);
    bar.style.width = `${pct}%`;
    text.textContent = `${Math.max(0, remaining)}s`;
    if (remaining <= 4) bar.style.background = 'var(--danger)';
    if (remaining <= 0) {
      clearInterval(quizTimerInterval);
      resolveQuiz(false, sectorId, machine, null, question, true);
    }
  }, 1000);
}

function resolveQuiz(isCorrect, sectorId, machine, clickedBtn, question, timedOut) {
  clearInterval(quizTimerInterval);
  const gs = window.gameState;

  // Disable all options and reveal correct/wrong styling
  const buttons = Array.from(el('quiz-options').children);
  buttons.forEach((b, i) => {
    b.classList.add('disabled');
    if (i === question.correct) b.classList.add('correct');
  });
  if (clickedBtn && !isCorrect) clickedBtn.classList.add('wrong');

  const feedback = el('quiz-feedback');
  if (timedOut) {
    feedback.textContent = 'Tempo esgotado!';
    feedback.classList.add('bad');
  } else if (isCorrect) {
    gs.score += GAME_CONFIG.pointsCorrect;
    feedback.textContent = `Correto! +${GAME_CONFIG.pointsCorrect} pts`;
    feedback.classList.add('ok');
  } else {
    feedback.textContent = 'Resposta incorreta.';
    feedback.classList.add('bad');
  }

  delete gs.activeMissions[machine.id];
  gs.missionsDone += 1;

  if (window.phaserGame) {
    const scene = window.phaserGame.scene.getScene('FactoryScene');
    scene.markMachinePending(machine.id, false);
  }

  updateHud();

  setTimeout(() => {
    quizModal.classList.add('hidden');
    gs.paused = false;
    setMissionText('Procure notas amarelas no chão para receber missões...');
    if (gs.missionsDone >= gs.totalMissions) {
      clearInterval(gs.timerId);
      endGame('complete');
    }
  }, 1200);
}

// ---------- Game over ----------
function endGame(reason) {
  const gs = window.gameState;
  gs.paused = true;

  el('final-score').textContent = gs.score;
  el('final-missions').textContent = `${gs.missionsDone}/${gs.totalMissions}`;
  el('final-time').textContent = formatTime(GAME_CONFIG.totalTimeSeconds - gs.timeLeft);

  el('gameover-title').innerHTML = reason === 'complete'
    ? 'Fábrica <span class="accent">concluída</span>!'
    : 'Tempo <span class="accent">esgotado</span>';
  el('gameover-eyebrow').textContent = gs.name ? `RESULTADO — ${gs.name}` : 'RESULTADO';

  gameScreen.classList.add('hidden');
  gameoverScreen.classList.remove('hidden');
}
