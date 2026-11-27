// Lightweight 3D particle system for flying turkey feathers, oven embers, dust puffs, and near-miss sparks.

import * as THREE from '../vendor/three.module.min.js';
import { PALETTE } from './config.js';

export function createParticleSystem(scene) {
  const particles = [];
  const featherGeo = new THREE.PlaneGeometry(0.28, 0.14);
  const sparkGeo = new THREE.SphereGeometry(0.11, 6, 6);
  const dustGeo = new THREE.SphereGeometry(0.18, 6, 6);

  function spawn(mesh, vel, life, gravity = 9.5, spin = 6) {
    scene.add(mesh);
    particles.push({ mesh, vel, life, maxLife: life, gravity, spin });
  }

  function burstFeathers(pos, count = 12) {
    for (let i = 0; i < count; i++) {
      const color = PALETTE.tailFeathers[i % PALETTE.tailFeathers.length];
      const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true });
      const m = new THREE.Mesh(featherGeo, mat);
      m.position.copy(pos);
      m.position.y += 0.8;
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 2.5 + Math.random() * 4.2;
      spawn(
        m,
        new THREE.Vector3(Math.cos(angle) * speed, 2.8 + Math.random() * 3.5, Math.sin(angle) * speed),
        0.75 + Math.random() * 0.45,
        5.5,
        9,
      );
    }
  }

  function burstSparks(pos, color = 0xffe066, count = 10) {
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true });
      const m = new THREE.Mesh(sparkGeo, mat);
      m.position.copy(pos);
      m.position.y += 0.9;
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 4.5;
      spawn(
        m,
        new THREE.Vector3(Math.cos(angle) * speed, 2 + Math.random() * 4, Math.sin(angle) * speed),
        0.45 + Math.random() * 0.3,
        8.5,
        0,
      );
    }
  }

  function puffDust(pos) {
    const mat = new THREE.MeshBasicMaterial({ color: 0xe3b882, transparent: true, opacity: 0.65 });
    const m = new THREE.Mesh(dustGeo, mat);
    m.position.set(pos.x + (Math.random() - 0.5) * 0.4, 0.18, pos.z + 0.35);
    spawn(m, new THREE.Vector3((Math.random() - 0.5) * 0.9, 1.1, 3.5), 0.38, -0.5, 0);
  }

  function update(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        scene.remove(p.mesh);
        p.mesh.material.dispose();
        particles.splice(i, 1);
        continue;
      }
      p.vel.y -= p.gravity * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      if (p.spin) {
        p.mesh.rotation.x += p.spin * dt;
        p.mesh.rotation.y += p.spin * 0.7 * dt;
      }
      const alpha = Math.max(0, p.life / p.maxLife);
      p.mesh.material.opacity = alpha;
      p.mesh.scale.setScalar(0.5 + alpha * 0.6);
    }
  }

  function clear() {
    for (const p of particles) {
      scene.remove(p.mesh);
      p.mesh.material.dispose();
    }
    particles.length = 0;
  }

  return { burstFeathers, burstSparks, puffDust, update, clear };
}
