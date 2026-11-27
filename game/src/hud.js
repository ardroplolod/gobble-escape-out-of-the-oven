// HUD, floating event callouts, farmer danger vignette, Title Screen, and End Screen UI controller.

import { GAME_CONFIG } from './config.js';

export function createHudController({ onStart, onRestart, onToggleMute }) {
  const titleScreen = document.getElementById('title-screen');
  const hudBar = document.getElementById('hud');
  const endScreen = document.getElementById('end-screen');
  const vignette = document.getElementById('danger-vignette');
  const calloutEl = document.getElementById('callout');

  const scoreVal = document.getElementById('hud-score');
  const distVal = document.getElementById('hud-distance');
  const progressFill = document.getElementById('progress-fill');
  const stageBadge = document.getElementById('hud-stage');
  const livesEl = document.getElementById('hud-lives');
  const dashFill = document.getElementById('dash-fill');
  const farmerStatus = document.getElementById('farmer-status');
  const comboBadge = document.getElementById('hud-combo');

  const endTitle = document.getElementById('end-title');
  const endSubtitle = document.getElementById('end-subtitle');
  const endScore = document.getElementById('end-score');
  const endDistance = document.getElementById('end-distance');
  const endNearMiss = document.getElementById('end-nearmiss');
  const endStage = document.getElementById('end-stage');
  const muteBtn = document.getElementById('mute-btn');

  document.getElementById('play-btn').addEventListener('click', onStart);
  document.getElementById('restart-btn').addEventListener('click', onRestart);
  muteBtn.addEventListener('click', () => {
    const isMuted = onToggleMute();
    muteBtn.textContent = isMuted ? 'SOUND: OFF' : 'SOUND: ON';
  });

  let calloutTimer = null;

  function showCallout(text, tone = 'boost') {
    calloutEl.textContent = text;
    calloutEl.className = `callout visible tone-${tone}`;
    if (calloutTimer) clearTimeout(calloutTimer);
    calloutTimer = setTimeout(() => {
      calloutEl.classList.remove('visible');
    }, 1150);
  }

  function showTitle() {
    titleScreen.classList.remove('hidden');
    hudBar.classList.add('hidden');
    endScreen.classList.add('hidden');
    vignette.style.opacity = '0';
  }

  function showPlaying() {
    titleScreen.classList.add('hidden');
    hudBar.classList.remove('hidden');
    endScreen.classList.add('hidden');
  }

  function showEnd(outcome, state) {
    titleScreen.classList.add('hidden');
    hudBar.classList.add('hidden');
    endScreen.classList.remove('hidden');
    endScreen.dataset.outcome = outcome;
    vignette.style.opacity = outcome === 'caught' ? '0.65' : '0';

    if (outcome === 'escaped') {
      endTitle.textContent = 'ESCAPED! FREEDOM!';
      endSubtitle.textContent = 'Barnaby outran Farmer Jed and made it out of the Thanksgiving Kitchen!';
    } else {
      endTitle.textContent = 'CAUGHT! DINNER TIME!';
      endSubtitle.textContent = 'Farmer Jed cornered Barnaby before the Freedom Gate!';
    }
    endScore.textContent = Math.floor(state.score).toLocaleString();
    endDistance.textContent = `${Math.floor(state.distance)}m / ${GAME_CONFIG.escapeDistance}m`;
    endNearMiss.textContent = String(state.nearMisses);
    endStage.textContent = state.stageName;
  }

  function update(state) {
    scoreVal.textContent = Math.floor(state.score).toLocaleString();
    const dist = Math.min(GAME_CONFIG.escapeDistance, Math.floor(state.distance));
    distVal.textContent = `${dist}m / ${GAME_CONFIG.escapeDistance}m`;
    const pct = Math.min(100, (state.distance / GAME_CONFIG.escapeDistance) * 100);
    progressFill.style.width = `${pct.toFixed(1)}%`;
    stageBadge.textContent = state.stageName;

    // Render turkey feather life pips
    let hearts = '';
    for (let i = 0; i < GAME_CONFIG.maxLives; i++) {
      hearts += `<span class="life-pip ${i < state.lives ? 'alive' : 'lost'}"></span>`;
    }
    livesEl.innerHTML = hearts;

    dashFill.style.width = `${Math.max(0, Math.min(100, state.dashEnergy)).toFixed(0)}%`;
    comboBadge.textContent = state.combo > 1 ? `COMBO x${state.combo}` : '';
    comboBadge.classList.toggle('active', state.combo > 1);

    const farmerClose = state.farmerGap < 3.4;
    farmerStatus.textContent = farmerClose ? 'FARMER RIGHT BEHIND YOU!' : `FARMER: ${state.farmerGap.toFixed(1)}m`;
    farmerStatus.classList.toggle('danger', farmerClose);

    const dangerAlpha = Math.max(0, Math.min(0.72, (4.0 - state.farmerGap) * 0.28));
    vignette.style.opacity = state.mode === 'playing' ? dangerAlpha.toFixed(2) : '0';
  }

  return { showTitle, showPlaying, showEnd, update, showCallout };
}
