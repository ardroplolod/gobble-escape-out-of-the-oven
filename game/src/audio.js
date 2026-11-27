// Procedural Web Audio API sound effects and rustic Thanksgiving chase music (100% offline).

export function createAudioEngine() {
  let ctx = null;
  let muted = false;
  let musicTimer = null;
  let stepIndex = 0;

  function ensureContext() {
    if (muted) return null;
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function tone(freq, duration, type = 'triangle', volume = 0.14, freqEnd = null) {
    const c = ensureContext();
    if (!c) return;
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (freqEnd !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(30, freqEnd), now + duration);
    }
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  function playGobble() {
    const c = ensureContext();
    if (!c) return;
    const notes = [520, 660, 480, 620, 440];
    notes.forEach((f, idx) => {
      setTimeout(() => tone(f, 0.075, 'sawtooth', 0.09, f * 0.82), idx * 52);
    });
  }

  function playJump() {
    tone(290, 0.18, 'triangle', 0.14, 620);
  }

  function playDuck() {
    tone(240, 0.14, 'sine', 0.11, 120);
  }

  function playDash() {
    tone(360, 0.24, 'sawtooth', 0.11, 920);
  }

  function playCollect(high = false) {
    tone(high ? 740 : 587, 0.11, 'triangle', 0.13, high ? 1120 : 880);
  }

  function playNearMiss() {
    tone(660, 0.09, 'triangle', 0.13, 990);
    setTimeout(() => tone(990, 0.12, 'triangle', 0.12, 1320), 65);
  }

  function playHit() {
    tone(160, 0.28, 'sawtooth', 0.19, 55);
  }

  function playVictory() {
    [523, 659, 784, 1046].forEach((f, i) => {
      setTimeout(() => tone(f, 0.22, 'triangle', 0.15), i * 110);
    });
  }

  function playCaught() {
    [330, 277, 220, 146].forEach((f, i) => {
      setTimeout(() => tone(f, 0.24, 'sawtooth', 0.14, f * 0.88), i * 125);
    });
  }

  // Upbeat rustic banjo-style chase loop
  const melody = [293.66, 369.99, 440, 369.99, 329.63, 440, 493.88, 440];
  function startMusic() {
    if (musicTimer) return;
    stepIndex = 0;
    musicTimer = setInterval(() => {
      if (muted || !ctx || ctx.state !== 'running') return;
      const note = melody[stepIndex % melody.length];
      tone(note, 0.12, 'triangle', 0.045, note * 0.99);
      if (stepIndex % 2 === 0) {
        tone(note * 0.5, 0.1, 'sine', 0.05);
      }
      stepIndex++;
    }, 185);
  }

  function stopMusic() {
    if (musicTimer) {
      clearInterval(musicTimer);
      musicTimer = null;
    }
  }

  function toggleMute() {
    muted = !muted;
    return muted;
  }

  return {
    playGobble,
    playJump,
    playDuck,
    playDash,
    playCollect,
    playNearMiss,
    playHit,
    playVictory,
    playCaught,
    startMusic,
    stopMusic,
    toggleMute,
    isMuted: () => muted,
  };
}
