// Procedural PBR canvas textures so the 3D scene has rich material detail with zero network assets.

import * as THREE from '../vendor/three.module.min.js';

function makeCanvas(width, height, drawFn) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  drawFn(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

export function createProceduralTextures() {
  const dirtPath = makeCanvas(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#c48544';
    ctx.fillRect(0, 0, w, h);
    // Soft graded wheel tracks
    const gradL = ctx.createLinearGradient(50, 0, 150, 0);
    gradL.addColorStop(0, 'rgba(140, 82, 32, 0)');
    gradL.addColorStop(0.5, 'rgba(140, 82, 32, 0.35)');
    gradL.addColorStop(1, 'rgba(140, 82, 32, 0)');
    ctx.fillStyle = gradL;
    ctx.fillRect(50, 0, 100, h);
    const gradR = ctx.createLinearGradient(w - 150, 0, w - 50, 0);
    gradR.addColorStop(0, 'rgba(140, 82, 32, 0)');
    gradR.addColorStop(0.5, 'rgba(140, 82, 32, 0.35)');
    gradR.addColorStop(1, 'rgba(140, 82, 32, 0)');
    ctx.fillStyle = gradR;
    ctx.fillRect(w - 150, 0, 100, h);
    // Fine natural gravel & soil grain
    for (let i = 0; i < 600; i++) {
      const x = (i * 97) % w;
      const y = (i * 173) % h;
      const r = 1.5 + (i % 3);
      ctx.fillStyle = i % 3 === 0 ? 'rgba(235,180,115,0.45)' : i % 3 === 1 ? 'rgba(128,74,28,0.35)' : 'rgba(218,154,84,0.4)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    // Crisp autumn leaves scattered on path
    for (let i = 0; i < 28; i++) {
      const x = (i * 131 + 23) % w;
      const y = (i * 89 + 17) % h;
      ctx.fillStyle = i % 2 === 0 ? '#c94318' : '#e6a024';
      ctx.fillRect(x, y, 7, 4);
    }
  });
  dirtPath.repeat.set(1, 2);

  const barnPlanks = makeCanvas(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#7e4823';
    ctx.fillRect(0, 0, w, h);
    const plankCount = 8;
    const plankW = w / plankCount;
    for (let i = 0; i < plankCount; i++) {
      const shade = i % 2 === 0 ? '#8c522a' : '#73401e';
      ctx.fillStyle = shade;
      ctx.fillRect(i * plankW + 1, 0, plankW - 2, h);
      ctx.fillStyle = '#4a250e';
      ctx.fillRect(i * plankW, 0, 2, h);
      // Wood grain lines
      ctx.strokeStyle = 'rgba(54, 26, 10, 0.25)';
      ctx.lineWidth = 1.5;
      for (let g = 0; g < 5; g++) {
        ctx.beginPath();
        ctx.moveTo(i * plankW + 4 + g * 5, 0);
        ctx.lineTo(i * plankW + 6 + g * 5, h);
        ctx.stroke();
      }
    }
  });
  barnPlanks.repeat.set(2, 6);

  const kitchenTile = makeCanvas(256, 256, (ctx, w, h) => {
    const cells = 4;
    const s = w / cells;
    for (let y = 0; y < cells; y++) {
      for (let x = 0; x < cells; x++) {
        const warm = (x + y) % 2 === 0;
        ctx.fillStyle = warm ? '#f3dfc0' : '#9c3a24';
        ctx.fillRect(x * s, y * s, s, s);
        // Subtle bevel highlight
        ctx.strokeStyle = warm ? 'rgba(255,255,255,0.45)' : 'rgba(255,180,120,0.18)';
        ctx.lineWidth = 3;
        ctx.strokeRect(x * s + 2, y * s + 2, s - 4, s - 4);
      }
    }
    // Grout lines
    ctx.strokeStyle = '#4a2c1d';
    ctx.lineWidth = 2;
    for (let i = 0; i <= cells; i++) {
      ctx.beginPath();
      ctx.moveTo(i * s, 0);
      ctx.lineTo(i * s, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * s);
      ctx.lineTo(w, i * s);
      ctx.stroke();
    }
  });
  kitchenTile.repeat.set(3, 8);

  const flannelPlaid = makeCanvas(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#b52722';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(35, 16, 12, 0.55)';
    for (let i = 0; i < w; i += 32) {
      ctx.fillRect(i, 0, 10, h);
      ctx.fillRect(0, i, w, 10);
    }
    ctx.fillStyle = 'rgba(245, 200, 110, 0.45)';
    for (let i = 16; i < w; i += 32) {
      ctx.fillRect(i, 0, 3, h);
      ctx.fillRect(0, i, w, 3);
    }
  });

  const ovenGrate = makeCanvas(256, 256, (ctx, w, h) => {
    const grad = ctx.createRadialGradient(w / 2, h / 2, 18, w / 2, h / 2, w * 0.62);
    grad.addColorStop(0, '#fff2a6');
    grad.addColorStop(0.35, '#ff8b1f');
    grad.addColorStop(0.75, '#cc2900');
    grad.addColorStop(1, '#3b0a00');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    // Cast iron bars
    ctx.fillStyle = '#1b181c';
    for (let x = 24; x < w; x += 42) {
      ctx.fillRect(x, 0, 10, h);
    }
    for (let y = 36; y < h; y += 58) {
      ctx.fillRect(0, y, w, 10);
    }
    // Outer frame
    ctx.strokeStyle = '#1b181c';
    ctx.lineWidth = 22;
    ctx.strokeRect(0, 0, w, h);
  });

  const hayBale = makeCanvas(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#d9a941';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 220; i++) {
      const x = (i * 41) % w;
      const y = (i * 29) % h;
      ctx.strokeStyle = i % 2 === 0 ? '#f0ca65' : '#a87b22';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 18, y + ((i % 5) - 2));
      ctx.stroke();
    }
    // Twine bindings
    ctx.fillStyle = '#6e471b';
    ctx.fillRect(0, 28, w, 6);
    ctx.fillRect(0, h - 34, w, 6);
  });

  const skyGradient = makeCanvas(64, 256, (ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#2a1f4a');
    grad.addColorStop(0.32, '#87383a');
    grad.addColorStop(0.62, '#e07a38');
    grad.addColorStop(0.84, '#f8be68');
    grad.addColorStop(1, '#ffe39e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  });
  skyGradient.wrapS = THREE.ClampToEdgeWrapping;
  skyGradient.wrapT = THREE.ClampToEdgeWrapping;

  return {
    dirtPath,
    barnPlanks,
    kitchenTile,
    flannelPlaid,
    ovenGrate,
    hayBale,
    skyGradient,
  };
}
