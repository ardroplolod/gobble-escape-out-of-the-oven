// Main entry point: initializes Three.js WebGL renderer, wires subsystems, and drives the frame loop.

import * as THREE from '../vendor/three.module.min.js';
import { createProceduralTextures } from './textures.js';
import { createAudioEngine } from './audio.js';
import { createInputController } from './input.js';
import { createHudController } from './hud.js';
import { createGameEngine } from './game.js';

const canvas = document.getElementById('game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(56, window.innerWidth / window.innerHeight, 0.1, 220);

const textures = createProceduralTextures();
const audio = createAudioEngine();
const input = createInputController(canvas);

let engine = null;
let previewFrozen = false;

const hud = createHudController({
  onStart: () => {
    previewFrozen = false;
    if (engine) engine.startRun();
  },
  onRestart: () => {
    previewFrozen = false;
    if (engine) engine.startRun();
  },
  onToggleMute: () => audio.toggleMute(),
});

engine = createGameEngine({ scene, camera, textures, audio, hud, input });

// Keyboard quick-start / restart with Enter or Space on title/end screens
window.addEventListener('keydown', (e) => {
  const mode = engine.getState().mode;
  if ((e.code === 'Enter' || e.code === 'Space') && mode !== 'playing') {
    e.preventDefault();
    previewFrozen = false;
    engine.startRun();
  }
  if (e.code === 'KeyM') {
    audio.toggleMute();
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Optional query parameter ?shot=title|play|kitchen|escaped|caught for deterministic inspection
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  previewFrozen = true;
  engine.applyPreviewMode(shot);
  renderer.render(scene, camera);
}

let lastTime = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = (now - lastTime) / 1000;
  lastTime = now;
  if (!previewFrozen) {
    engine.update(dt);
  }
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);
