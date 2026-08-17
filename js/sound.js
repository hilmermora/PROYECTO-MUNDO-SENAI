// ============================================================
// FACTORY QUEST — efeitos sonoros
// Sons sintetizados via Web Audio API (nenhum arquivo de áudio
// externo necessário). O AudioContext só é criado após o primeiro
// clique do usuário (política de autoplay dos navegadores).
// ============================================================

let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone(freq, startTime, duration, type = 'sine', gainPeak = 0.15) {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

const Sound = {
  unlock() {
    // Chamado no clique de "ENTRAR NA FÁBRICA" para destravar o áudio.
    getAudioCtx();
  },
  pickup() {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    tone(660, t, 0.09, 'triangle', 0.12);
    tone(880, t + 0.06, 0.12, 'triangle', 0.12);
  },
  correct() {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    tone(523.25, t, 0.14, 'square', 0.1);
    tone(659.25, t + 0.1, 0.14, 'square', 0.1);
    tone(783.99, t + 0.2, 0.22, 'square', 0.1);
  },
  wrong() {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    tone(180, t, 0.28, 'sawtooth', 0.1);
    tone(140, t + 0.12, 0.3, 'sawtooth', 0.1);
  },
  gameOverWin() {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, t + i * 0.14, 0.3, 'triangle', 0.12));
  },
  gameOverTime() {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    [392, 349.23, 293.66, 220].forEach((f, i) => tone(f, t + i * 0.16, 0.32, 'sawtooth', 0.09));
  }
};

window.Sound = Sound;
