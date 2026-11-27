// Core Gobble Escape simulation: physics, farmer pursuit AI, obstacle waves, collisions, and camera.

import * as THREE from '../vendor/three.module.min.js';
import { GAME_CONFIG, getStageForDistance } from './config.js';
import { SeededRandom } from './random.js';
import { createTurkeyCharacter, createFarmerCharacter } from './characters.js';
import { createEnvironment } from './environment.js';
import { createHazardFactory } from './hazards.js';
import { createParticleSystem } from './particles.js';

export function createGameEngine({ scene, camera, textures, audio, hud, input }) {
  const env = createEnvironment(scene, textures);
  const factory = createHazardFactory(textures);
  const particles = createParticleSystem(scene);
  const turkey = createTurkeyCharacter();
  const farmer = createFarmerCharacter(textures);

  scene.add(turkey.root);
  scene.add(farmer.root);

  // Lighting rig (warm golden autumn sun + soft sky/ground hemisphere fill)
  const hemiLight = new THREE.HemisphereLight(0xffe1b5, 0x5c361e, 0.92);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xffb866, 2.05);
  sunLight.position.set(14, 24, 16);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(1024, 1024);
  sunLight.shadow.camera.near = 2;
  sunLight.shadow.camera.far = 95;
  sunLight.shadow.camera.left = -22;
  sunLight.shadow.camera.right = 22;
  sunLight.shadow.camera.top = 28;
  sunLight.shadow.camera.bottom = -28;
  sunLight.shadow.bias = -0.0005;
  scene.add(sunLight);

  const fogColorCurrent = new THREE.Color(0xe69c5c);
  scene.fog = new THREE.Fog(fogColorCurrent, 28, 98);
  scene.background = fogColorCurrent;

  let rng = new SeededRandom(42);
  const hazards = [];
  const collectibles = [];

  const state = {
    mode: 'title', // 'title' | 'playing' | 'caught' | 'escaped'
    time: 0,
    distance: 0,
    score: 0,
    lives: GAME_CONFIG.maxLives,
    dashEnergy: 100,
    dashTimer: 0,
    dashCooldown: 0,
    invulnTimer: 0,
    slowTimer: 0,
    nearMisses: 0,
    combo: 1,
    comboTimer: 0,
    stageId: 'farmyard',
    stageName: 'AUTUMN FARMYARD',
    speed: GAME_CONFIG.baseSpeed,
    playerX: 0,
    playerVx: 0,
    playerY: 0,
    playerVy: 0,
    duckTimer: 0,
    farmerGap: 4.4,
    farmerX: -0.9,
    spawnTimer: 0.6,
    dustTimer: 0,
    shakeTimer: 0,
    shakeIntensity: 0,
  };

  function clearEntities() {
    for (const h of hazards) scene.remove(h.mesh);
    hazards.length = 0;
    for (const c of collectibles) scene.remove(c.mesh);
    collectibles.length = 0;
    particles.clear();
  }

  function addHazard(h, x, z) {
    h.mesh.position.x = x;
    h.mesh.position.z = z;
    h.baseX = x;
    h.nearMissed = false;
    h.hit = false;
    scene.add(h.mesh);
    hazards.push(h);
    return h;
  }

  function addCollectible(kind, x, z) {
    const c = factory.buildCollectible(kind);
    c.mesh.position.x = x;
    c.mesh.position.z = z;
    scene.add(c.mesh);
    collectibles.push(c);
    return c;
  }

  function spawnWave(zPos) {
    const stage = getStageForDistance(state.distance + Math.abs(zPos));
    const lanes = [...GAME_CONFIG.lanePositions];
    // Shuffle lanes so at least one lane is always safely passable
    for (let i = lanes.length - 1; i > 0; i--) {
      const j = rng.int(0, i);
      [lanes[i], lanes[j]] = [lanes[j], lanes[i]];
    }

    const hazardCount = stage.id === 'farmyard' ? (rng.chance(0.55) ? 2 : 1) : 2;
    for (let i = 0; i < hazardCount; i++) {
      const laneX = lanes[i];
      const roll = rng.next();
      let h;
      if (stage.id === 'farmyard') {
        if (roll < 0.28) h = factory.buildOven();
        else if (roll < 0.54) h = factory.buildKnife(rng.chance(0.45) ? 'high' : 'spin');
        else if (roll < 0.76) h = factory.buildHayBale();
        else if (roll < 0.92) h = factory.buildTrap();
        else h = factory.buildGravy();
      } else if (stage.id === 'barn') {
        if (roll < 0.34) h = factory.buildOven();
        else if (roll < 0.66) h = factory.buildKnife(rng.chance(0.5) ? 'high' : 'spin');
        else if (roll < 0.84) h = factory.buildTrap();
        else h = factory.buildGravy();
      } else {
        // Thanksgiving Kitchen: intense ovens, flying carving knives, and traps!
        if (roll < 0.4) h = factory.buildOven();
        else if (roll < 0.76) h = factory.buildKnife(rng.chance(0.48) ? 'high' : 'spin');
        else if (roll < 0.9) h = factory.buildTrap();
        else h = factory.buildGravy();
      }
      addHazard(h, laneX, zPos - i * rng.range(0, 3.2));
    }

    // Place enticing collectibles along the open safe lane
    const safeLane = lanes[2];
    const collectCount = rng.int(1, 3);
    const kind = rng.chance(0.1) && state.lives < GAME_CONFIG.maxLives
      ? 'feather'
      : rng.chance(0.32)
        ? 'cranberry'
        : 'corn';
    for (let k = 0; k < collectCount; k++) {
      addCollectible(kind, safeLane, zPos - k * 2.8);
    }
  }

  function setupTitleBackdrop() {
    clearEntities();
    state.mode = 'title';
    state.distance = 45;
    state.time = 0;
    state.playerX = 1.65;
    state.playerY = 0;
    state.farmerGap = 3.2;
    state.farmerX = 3.1;
    env.resetThemes(state.distance);

    // Stage iconic Thanksgiving hazards in the open right 60% of the title scene
    addHazard(factory.buildOven(), 4.2, -5.8);
    addHazard(factory.buildKnife('spin'), 0.2, -5.2);
    addHazard(factory.buildTrap(), 2.2, -10.5);
    addHazard(factory.buildOven(), -0.6, -15.0);
    addCollectible('corn', 2.4, -2.5);
    addCollectible('cranberry', 0.8, -8.0);

    // Hero 3/4 pose: Barnaby turns slightly toward camera so face, wattle, beak & fanned tail all shine!
    turkey.root.position.set(state.playerX, 0, 0.8);
    turkey.root.rotation.y = 2.55;
    // Farmer Jed lunges right behind Barnaby with carving knife raised high!
    farmer.root.position.set(state.farmerX, 0, -2.1);
    farmer.root.rotation.y = 2.85;
    hud.showTitle();
  }

  function startRun(seed = Date.now() & 0xfffffff) {
    rng = new SeededRandom(seed);
    clearEntities();
    input.clear();

    state.mode = 'playing';
    state.time = 0;
    state.distance = 0;
    state.score = 0;
    state.lives = GAME_CONFIG.maxLives;
    state.dashEnergy = 100;
    state.dashTimer = 0;
    state.dashCooldown = 0;
    state.invulnTimer = 0;
    state.slowTimer = 0;
    state.nearMisses = 0;
    state.combo = 1;
    state.comboTimer = 0;
    state.stageId = 'farmyard';
    state.stageName = 'AUTUMN FARMYARD';
    state.speed = GAME_CONFIG.baseSpeed;
    state.playerX = 0;
    state.playerVx = 0;
    state.playerY = 0;
    state.playerVy = 0;
    state.duckTimer = 0;
    state.farmerGap = 4.4;
    state.farmerX = 0;
    state.spawnTimer = 0.5;
    state.shakeTimer = 0;

    env.resetThemes(0);
    // Pre-seed initial waves ahead so action begins immediately
    spawnWave(-22);
    spawnWave(-40);
    spawnWave(-58);

    turkey.root.position.set(0, 0, 0);
    turkey.root.rotation.y = 0;
    farmer.root.position.set(0, 0, state.farmerGap);
    farmer.root.rotation.y = 0;

    hud.showPlaying();
    hud.update(state);
    audio.playGobble();
    audio.startMusic();
  }

  function triggerShake(intensity = 0.45, duration = 0.35) {
    state.shakeIntensity = intensity;
    state.shakeTimer = duration;
  }

  function handleDamage(reason) {
    if (state.invulnTimer > 0 || state.dashTimer > 0) return;
    state.lives -= 1;
    state.invulnTimer = GAME_CONFIG.invulnDuration;
    state.combo = 1;
    state.comboTimer = 0;
    state.farmerGap = Math.max(GAME_CONFIG.farmerMinGap, state.farmerGap - 1.55);
    particles.burstFeathers(turkey.root.position, 16);
    triggerShake(0.6, 0.38);
    audio.playHit();
    hud.showCallout(reason, 'danger');

    if (state.lives <= 0 || state.farmerGap <= GAME_CONFIG.farmerMinGap + 0.05) {
      finishRun('caught');
    }
  }

  function finishRun(outcome) {
    state.mode = outcome;
    audio.stopMusic();
    if (outcome === 'escaped') {
      state.score += 1000 + state.lives * 250;
      particles.burstSparks(turkey.root.position, 0xffe066, 24);
      audio.playVictory();
    } else {
      state.farmerGap = 1.45;
      particles.burstFeathers(turkey.root.position, 22);
      audio.playCaught();
    }
    hud.update(state);
    hud.showEnd(outcome, state);
  }

  function updateAtmosphere(dt, stage) {
    const targetFog = new THREE.Color(stage.fogColor);
    fogColorCurrent.lerp(targetFog, Math.min(1, dt * 2.2));
    scene.fog.color.copy(fogColorCurrent);
    scene.fog.near += (stage.fogNear - scene.fog.near) * Math.min(1, dt * 2);
    scene.fog.far += (stage.fogFar - scene.fog.far) * Math.min(1, dt * 2);
    scene.background = fogColorCurrent;
    sunLight.color.lerp(new THREE.Color(stage.sunColor), Math.min(1, dt * 2));
    hemiLight.color.lerp(new THREE.Color(stage.ambientColor), Math.min(1, dt * 2));
  }

  function updatePlaying(dt) {
    const ctrl = input.getState();
    const progress = Math.min(1, state.distance / GAME_CONFIG.escapeDistance);
    const baseTargetSpeed = GAME_CONFIG.baseSpeed + progress * (GAME_CONFIG.maxSpeed - GAME_CONFIG.baseSpeed);

    // Dash activation
    if (state.dashCooldown > 0) state.dashCooldown -= dt;
    if (ctrl.dashPressed && state.dashTimer <= 0 && state.dashCooldown <= 0 && state.dashEnergy >= GAME_CONFIG.dashCost) {
      state.dashEnergy -= GAME_CONFIG.dashCost;
      state.dashTimer = GAME_CONFIG.dashDuration;
      state.dashCooldown = GAME_CONFIG.dashCooldown;
      state.farmerGap = Math.min(5.6, state.farmerGap + 1.15);
      particles.burstFeathers(turkey.root.position, 9);
      audio.playDash();
      hud.showCallout('FEATHER DASH!', 'boost');
    }

    if (state.dashTimer > 0) {
      state.dashTimer -= dt;
    } else {
      state.dashEnergy = Math.min(100, state.dashEnergy + GAME_CONFIG.dashRegenPerSec * dt);
    }

    if (state.invulnTimer > 0) state.invulnTimer -= dt;
    if (state.slowTimer > 0) state.slowTimer -= dt;
    if (state.comboTimer > 0) {
      state.comboTimer -= dt;
      if (state.comboTimer <= 0) state.combo = 1;
    }

    const slowMul = state.slowTimer > 0 ? 0.62 : 1.0;
    const dashBonus = state.dashTimer > 0 ? GAME_CONFIG.dashBonusSpeed : 0;
    state.speed = (baseTargetSpeed + dashBonus) * slowMul;

    // Horizontal movement (keyboard or mouse drag steering)
    let targetVx = ctrl.moveAxis * 13.8;
    if (ctrl.mouseSteerActive && ctrl.moveAxis === 0) {
      const targetX = ctrl.mouseTargetNorm * (GAME_CONFIG.trackHalfWidth - 0.7);
      targetVx = Math.max(-14, Math.min(14, (targetX - state.playerX) * 8.5));
    }
    state.playerVx += (targetVx - state.playerVx) * Math.min(1, dt * 15);
    state.playerX = Math.max(
      -GAME_CONFIG.trackHalfWidth + 0.75,
      Math.min(GAME_CONFIG.trackHalfWidth - 0.75, state.playerX + state.playerVx * dt),
    );

    // Jump & Flutter-Glide
    if (ctrl.jumpPressed && state.playerY <= 0.05) {
      state.playerVy = GAME_CONFIG.jumpVelocity;
      state.duckTimer = 0;
      particles.puffDust(turkey.root.position);
      audio.playJump();
    }
    const gravScale = ctrl.holdJump && state.playerVy < 0 ? GAME_CONFIG.flutterGravityScale : 1.0;
    state.playerVy -= GAME_CONFIG.gravity * gravScale * dt;
    state.playerY += state.playerVy * dt;
    if (state.playerY < 0) {
      state.playerY = 0;
      state.playerVy = 0;
    }

    // Duck / Slide under high carving knives
    if (ctrl.duckPressed) {
      state.duckTimer = GAME_CONFIG.duckDuration;
      if (state.playerY > 0.2) state.playerVy = Math.min(state.playerVy, -14);
      audio.playDuck();
    } else if (ctrl.holdDuck && state.playerY <= 0.05) {
      state.duckTimer = Math.max(state.duckTimer, 0.12);
    } else if (state.duckTimer > 0) {
      state.duckTimer -= dt;
    }

    // Advance distance & score
    const stepDist = state.speed * dt;
    state.distance += stepDist;
    state.score += stepDist * 2.2 * state.combo;

    const stage = env.update(dt, state.time, state.distance, state.speed);
    if (stage.id !== state.stageId) {
      state.stageId = stage.id;
      state.stageName = stage.name;
      hud.showCallout(`ENTERING ${stage.name}!`, 'stage');
      audio.playGobble();
    }
    updateAtmosphere(dt, stage);

    // Check Escape victory at 900m
    if (state.distance >= GAME_CONFIG.escapeDistance) {
      finishRun('escaped');
      return;
    }

    // Active Farmer Jed pursuit dynamics: flanks slightly to the side so Barnaby is NEVER occluded!
    const targetGap = state.slowTimer > 0 ? 2.15 : state.dashTimer > 0 ? 5.1 : 3.7 - progress * 0.65;
    state.farmerGap += (targetGap - state.farmerGap) * Math.min(1, dt * 1.15);
    const flankOffset = state.playerX > 1.2 ? -1.95 : 1.95;
    const desiredFarmerX = Math.max(-4.5, Math.min(4.5, state.playerX * 0.72 + flankOffset));
    state.farmerX += (desiredFarmerX - state.farmerX) * Math.min(1, dt * 3.4);

    // Spawn upcoming waves
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0 && state.distance < GAME_CONFIG.escapeDistance - 55) {
      spawnWave(-66);
      state.spawnTimer = stage.spawnInterval * rng.range(0.84, 1.14);
    }

    // Player bounding box
    const isDucking = state.duckTimer > 0 && state.playerY < 0.2;
    const pMinY = state.playerY;
    const pMaxY = state.playerY + (isDucking ? 0.82 : 1.55);
    const pHalfW = 0.56;

    // Update hazards + collisions + near misses
    for (let i = hazards.length - 1; i >= 0; i--) {
      const h = hazards[i];
      const dz = (state.speed + (h.extraSpeed || 0)) * dt;
      h.mesh.position.z += dz;
      h.update(dt, state.time);

      const hz = h.mesh.position.z;
      const hx = h.mesh.position.x;

      if (!h.hit && Math.abs(hz) < h.halfD + 0.55) {
        const overlapX = Math.abs(state.playerX - hx) < h.halfW + pHalfW;
        const overlapY = pMaxY > h.minY && pMinY < h.maxY;
        if (overlapX && overlapY) {
          h.hit = true;
          if (h.isSlowZone) {
            state.slowTimer = 1.65;
            state.farmerGap = Math.max(2.0, state.farmerGap - 1.1);
            audio.playDuck();
            hud.showCallout('GRAVY SLICK! FARMER CLOSING!', 'warn');
          } else {
            const label =
              h.kind === 'oven'
                ? 'ROASTING OVEN HIT!'
                : h.kind.startsWith('knife')
                  ? 'CARVING KNIFE CLIP!'
                  : h.kind === 'trap'
                    ? 'SNAP TRAP HIT!'
                    : 'HAY BALE CRASH!';
            handleDamage(label);
            if (state.mode !== 'playing') return;
          }
        }
      }

      // Near-miss reward once hazard passes behind turkey without hitting
      if (!h.hit && !h.nearMissed && !h.isSlowZone && hz > h.halfD + 0.4) {
        const dx = Math.abs(state.playerX - hx) - (h.halfW + pHalfW);
        const duckedUnder = h.kind === 'knife_high' && isDucking && Math.abs(state.playerX - hx) < h.halfW + 0.6;
        const jumpedOver = (h.kind === 'trap' || h.kind === 'hay') && state.playerY > h.maxY - 0.15 && Math.abs(state.playerX - hx) < h.halfW + 0.6;
        if ((dx >= 0 && dx < GAME_CONFIG.nearMissMargin) || duckedUnder || jumpedOver) {
          h.nearMissed = true;
          state.nearMisses += 1;
          state.combo = Math.min(5, state.combo + 1);
          state.comboTimer = 4.2;
          const pts = GAME_CONFIG.nearMissScore * state.combo;
          state.score += pts;
          state.dashEnergy = Math.min(100, state.dashEnergy + 22);
          particles.burstSparks(turkey.root.position, 0xffd23f, 8);
          audio.playNearMiss();
          hud.showCallout(`NEAR MISS! +${pts} (x${state.combo})`, 'boost');
        }
      }

      if (hz > 16) {
        scene.remove(h.mesh);
        hazards.splice(i, 1);
      }
    }

    // Update collectibles
    for (let i = collectibles.length - 1; i >= 0; i--) {
      const c = collectibles[i];
      c.mesh.position.z += state.speed * dt;
      c.update(dt, state.time);

      const dx = state.playerX - c.mesh.position.x;
      const dz = c.mesh.position.z;
      const dy = state.playerY + 0.85 - c.mesh.position.y;
      if (!c.collected && dx * dx + dy * dy + dz * dz < (c.radius + 0.65) ** 2) {
        c.collected = true;
        scene.remove(c.mesh);
        collectibles.splice(i, 1);
        if (c.kind === 'corn') {
          state.score += GAME_CONFIG.cornScore * state.combo;
          state.dashEnergy = Math.min(100, state.dashEnergy + 18);
          audio.playCollect(false);
        } else if (c.kind === 'cranberry') {
          state.score += GAME_CONFIG.cranberryScore * state.combo;
          state.dashEnergy = Math.min(100, state.dashEnergy + 28);
          audio.playCollect(true);
          hud.showCallout(`CRANBERRIES +${GAME_CONFIG.cranberryScore * state.combo}`, 'boost');
        } else {
          if (state.lives < GAME_CONFIG.maxLives) {
            state.lives += 1;
            hud.showCallout('GOLDEN FEATHER +1 LIFE!', 'stage');
          } else {
            state.score += GAME_CONFIG.featherScore;
            hud.showCallout(`GOLDEN FEATHER +${GAME_CONFIG.featherScore}`, 'stage');
          }
          audio.playCollect(true);
        }
        particles.burstSparks(turkey.root.position, 0xffe066, 7);
        continue;
      }

      if (c.mesh.position.z > 15) {
        scene.remove(c.mesh);
        collectibles.splice(i, 1);
      }
    }

    // Running dust puffs
    state.dustTimer -= dt;
    if (state.dustTimer <= 0 && state.playerY <= 0.05) {
      particles.puffDust(turkey.root.position);
      state.dustTimer = state.dashTimer > 0 ? 0.06 : 0.16;
    }

    // Update character transforms & animations
    turkey.root.position.set(state.playerX, state.playerY, 0);
    const speedRatio = (state.speed - GAME_CONFIG.baseSpeed) / (GAME_CONFIG.maxSpeed - GAME_CONFIG.baseSpeed);
    const dangerLevel = Math.max(0, Math.min(1, (4.8 - state.farmerGap) / 3.2));
    turkey.updateAnimation(state.time, {
      speedRatio,
      isJumping: state.playerY > 0.08,
      isDucking,
      isDashing: state.dashTimer > 0,
      leanX: state.playerVx / 14,
      dangerLevel,
      hitFlash: state.invulnTimer,
    });

    farmer.root.position.set(state.farmerX, 0, state.farmerGap);
    farmer.updateAnimation(state.time, {
      speedRatio,
      lungeIntensity: dangerLevel,
    });

    // Dynamic third-person camera (elevated slightly so Farmer Jed, Barnaby, and hazards all read clearly!)
    let shakeX = 0;
    let shakeY = 0;
    if (state.shakeTimer > 0) {
      state.shakeTimer -= dt;
      shakeX = (Math.random() - 0.5) * state.shakeIntensity;
      shakeY = (Math.random() - 0.5) * state.shakeIntensity * 0.7;
    }
    const camTargetX = state.playerX * 0.45 + shakeX;
    const camTargetY = 5.45 + state.playerY * 0.25 + shakeY;
    const camTargetZ = 10.6 + (state.dashTimer > 0 ? 0.65 : 0);
    camera.position.x += (camTargetX - camera.position.x) * Math.min(1, dt * 8);
    camera.position.y += (camTargetY - camera.position.y) * Math.min(1, dt * 8);
    camera.position.z += (camTargetZ - camera.position.z) * Math.min(1, dt * 8);
    camera.lookAt(state.playerX * 0.32, 1.2 + state.playerY * 0.18, -11.0);

    hud.update(state);
  }

  function update(rawDt) {
    const dt = Math.min(0.05, rawDt);
    state.time += dt;

    if (state.mode === 'title') {
      const stage = env.update(dt, state.time, state.distance, 6.5);
      updateAtmosphere(dt, stage);
      turkey.updateAnimation(state.time, {
        speedRatio: 0.4,
        isJumping: false,
        isDucking: false,
        isDashing: false,
        leanX: Math.sin(state.time * 1.4) * 0.25,
        dangerLevel: 0.65,
        hitFlash: 0,
      });
      farmer.updateAnimation(state.time, { speedRatio: 0.45, lungeIntensity: 0.85 });
      for (const h of hazards) h.update(dt, state.time);
      for (const c of collectibles) c.update(dt, state.time);

      // Dramatic hero 3/4 composition showing Barnaby & Farmer Jed in the open right 60% of the screen
      camera.position.set(
        -0.4 + Math.sin(state.time * 0.4) * 0.25,
        2.75,
        6.8,
      );
      camera.lookAt(0.45, 1.45, -2.0);
    } else if (state.mode === 'playing') {
      updatePlaying(dt);
    } else {
      // End screen slow showcase orbit
      const isEscaped = state.mode === 'escaped';
      turkey.updateAnimation(state.time, {
        speedRatio: isEscaped ? 0.8 : 0.1,
        isJumping: isEscaped && Math.sin(state.time * 6) > 0,
        isDucking: !isEscaped,
        isDashing: isEscaped,
        leanX: 0,
        dangerLevel: isEscaped ? 0 : 1,
        hitFlash: 0,
      });
      farmer.updateAnimation(state.time, {
        speedRatio: isEscaped ? 0.1 : 0.5,
        lungeIntensity: isEscaped ? 0 : 1,
      });
      const angle = Math.sin(state.time * 0.45) * 0.4;
      camera.position.set(state.playerX + Math.sin(angle) * 5.6, 3.2, 6.4);
      camera.lookAt(state.playerX, 1.3, isEscaped ? -1 : 0.8);
    }

    particles.update(dt);
  }

  // Deterministic preview helper for automated testing and screenshot verification
  function applyPreviewMode(shotName) {
    if (shotName === 'title') {
      setupTitleBackdrop();
      update(0.016);
      return;
    }
    if (shotName === 'play') {
      startRun(77);
      clearEntities();
      state.distance = 148;
      state.score = 1840;
      state.lives = 3;
      state.dashEnergy = 82;
      state.combo = 2;
      state.comboTimer = 3.0;
      state.playerX = -0.35;
      state.farmerX = -2.25;
      state.farmerGap = 3.5;
      env.resetThemes(state.distance);
      addHazard(factory.buildOven(), 2.9, -9.5);
      addHazard(factory.buildKnife('spin'), -3.0, -7.2);
      addHazard(factory.buildTrap(), 0.2, -16.5);
      addHazard(factory.buildHayBale(), -3.1, -24.0);
      addCollectible('corn', -0.2, -5.2);
      addCollectible('cranberry', 2.6, -15.5);
      turkey.root.position.set(state.playerX, 0, 0);
      farmer.root.position.set(state.farmerX, 0, state.farmerGap);
      camera.position.set(-0.2, 5.45, 10.6);
      camera.lookAt(-0.1, 1.2, -11.0);
      hud.update(state);
      update(0.016);
      return;
    }
    if (shotName === 'kitchen') {
      startRun(108);
      clearEntities();
      state.distance = 712;
      state.score = 6420;
      state.lives = 2;
      state.dashEnergy = 95;
      state.dashTimer = 0.4;
      state.combo = 4;
      state.comboTimer = 3.5;
      state.stageId = 'kitchen';
      state.stageName = 'THANKSGIVING KITCHEN';
      state.playerX = 0.35;
      state.playerY = 0.85;
      state.farmerX = -1.95;
      state.farmerGap = 2.9;
      env.resetThemes(state.distance);
      updateAtmosphere(1.0, getStageForDistance(state.distance));
      addHazard(factory.buildOven(), -3.0, -7.2);
      addHazard(factory.buildOven(), 3.2, -14.0);
      addHazard(factory.buildKnife('high'), 0.3, -5.8);
      addHazard(factory.buildKnife('spin'), 2.7, -4.2);
      addHazard(factory.buildTrap(), 0.3, -1.6);
      addCollectible('feather', 0.35, -9.5);
      turkey.root.position.set(state.playerX, state.playerY, 0);
      farmer.root.position.set(state.farmerX, 0, state.farmerGap);
      particles.burstFeathers(turkey.root.position, 14);
      camera.position.set(0.25, 5.4, 10.4);
      camera.lookAt(0.15, 1.35, -10.5);
      hud.showCallout('NEAR MISS! +600 (x4)', 'boost');
      hud.update(state);
      update(0.016);
      return;
    }
    if (shotName === 'escaped' || shotName === 'caught') {
      startRun(202);
      clearEntities();
      state.distance = shotName === 'escaped' ? 900 : 542;
      state.score = shotName === 'escaped' ? 9850 : 4120;
      state.lives = shotName === 'escaped' ? 2 : 0;
      state.nearMisses = shotName === 'escaped' ? 14 : 6;
      state.stageId = shotName === 'escaped' ? 'kitchen' : 'barn';
      state.stageName = shotName === 'escaped' ? 'THANKSGIVING KITCHEN' : 'HARVEST BARN';
      env.resetThemes(state.distance);
      updateAtmosphere(1.0, getStageForDistance(state.distance));
      if (shotName === 'caught') {
        addHazard(factory.buildOven(), 2.8, -5.5);
        addHazard(factory.buildKnife('spin'), -2.6, -4.5);
      }
      finishRun(shotName);
      update(0.016);
    }
  }

  setupTitleBackdrop();

  return {
    startRun,
    setupTitleBackdrop,
    update,
    applyPreviewMode,
    getState: () => state,
  };
}
