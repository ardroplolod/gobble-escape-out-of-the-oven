// Dynamic 3-stage Thanksgiving environment: Autumn Farmyard -> Harvest Barn -> Thanksgiving Kitchen -> Freedom Gate.

import * as THREE from '../vendor/three.module.min.js';
import { GAME_CONFIG, PALETTE, getStageForDistance } from './config.js';

const SEGMENT_LENGTH = 26;
const SEGMENT_COUNT = 6;

export function createEnvironment(scene, textures) {
  const root = new THREE.Group();
  scene.add(root);

  // Warm sunset sky dome
  const skyGeo = new THREE.SphereGeometry(140, 24, 18);
  const skyMat = new THREE.MeshBasicMaterial({
    map: textures.skyGradient,
    side: THREE.BackSide,
    fog: false,
  });
  const skyDome = new THREE.Mesh(skyGeo, skyMat);
  scene.add(skyDome);

  // Warm harvest sun positioned off-center in the autumn sky (hidden indoors)
  const sunDisc = new THREE.Mesh(
    new THREE.CircleGeometry(10.5, 28),
    new THREE.MeshBasicMaterial({ color: 0xffdf91, fog: false }),
  );
  sunDisc.position.set(28, 25, -125);
  scene.add(sunDisc);

  // Shared materials
  const dirtMat = new THREE.MeshStandardMaterial({ map: textures.dirtPath, roughness: 0.92 });
  const barnFloorMat = new THREE.MeshStandardMaterial({ map: textures.barnPlanks, roughness: 0.85 });
  const kitchenFloorMat = new THREE.MeshStandardMaterial({
    map: textures.kitchenTile,
    roughness: 0.35,
    metalness: 0.08,
  });
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x6e6a26, roughness: 0.95 });
  const woodDarkMat = new THREE.MeshStandardMaterial({ color: PALETTE.woodDark, roughness: 0.85 });
  const woodLightMat = new THREE.MeshStandardMaterial({ color: PALETTE.woodLight, roughness: 0.8 });
  const barnRedMat = new THREE.MeshStandardMaterial({ color: PALETTE.barnRed, roughness: 0.78 });
  const pumpkinMat = new THREE.MeshStandardMaterial({ color: PALETTE.pumpkin, roughness: 0.62 });
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x3b5922, roughness: 0.85 });
  const creamWallMat = new THREE.MeshStandardMaterial({ color: 0xf0dec0, roughness: 0.65 });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xc97336, metalness: 0.78, roughness: 0.25 });
  const lanternGlowMat = new THREE.MeshStandardMaterial({
    color: 0xffe194,
    emissive: 0xff8c1a,
    emissiveIntensity: 2.0,
  });

  function buildPumpkin(scale = 1) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.55 * scale, 12, 10), pumpkinMat);
    body.scale.set(1.18, 0.85, 1.18);
    body.position.y = 0.44 * scale;
    body.castShadow = true;
    g.add(body);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * scale, 0.09 * scale, 0.26 * scale, 6), stemMat);
    stem.position.y = 0.92 * scale;
    stem.rotation.z = 0.2;
    g.add(stem);
    return g;
  }

  function buildAutumnTree(colorHex) {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 3.6, 8), woodDarkMat);
    trunk.position.y = 1.8;
    trunk.castShadow = true;
    g.add(trunk);

    const foliageMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.82 });
    const crown1 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.1, 1), foliageMat);
    crown1.position.set(0, 4.4, 0);
    crown1.castShadow = true;
    g.add(crown1);

    const crown2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5, 1), foliageMat);
    crown2.position.set(1.1, 3.6, 0.5);
    g.add(crown2);
    return g;
  }

  function buildSegment() {
    const group = new THREE.Group();

    // Main track ground
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(12.2, SEGMENT_LENGTH), dirtMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    group.add(ground);

    // Side aprons (autumn meadow outside track)
    const sideLeft = new THREE.Mesh(new THREE.PlaneGeometry(40, SEGMENT_LENGTH), grassMat);
    sideLeft.rotation.x = -Math.PI / 2;
    sideLeft.position.set(-26.1, -0.04, 0);
    sideLeft.receiveShadow = true;
    group.add(sideLeft);

    const sideRight = sideLeft.clone();
    sideRight.position.x = 26.1;
    group.add(sideRight);

    // --- Stage 1 props: Farmyard fences, red barns, pumpkins, autumn trees ---
    const farmProps = new THREE.Group();
    for (const side of [-1, 1]) {
      const fenceX = side * 6.4;
      for (let z = -SEGMENT_LENGTH / 2 + 2; z < SEGMENT_LENGTH / 2; z += 4.3) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.45, 0.24), woodLightMat);
        post.position.set(fenceX, 0.72, z);
        post.castShadow = true;
        farmProps.add(post);
      }
      for (const railY of [0.55, 1.1]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, SEGMENT_LENGTH), woodLightMat);
        rail.position.set(fenceX, railY, 0);
        farmProps.add(rail);
      }

      const tree = buildAutumnTree(side < 0 ? 0xc9491a : 0xe08d22);
      tree.position.set(side * 10.5, 0, side < 0 ? -4 : 5);
      farmProps.add(tree);

      const p1 = buildPumpkin(1.0);
      p1.position.set(side * 7.6, 0, -6 * side);
      farmProps.add(p1);
      const p2 = buildPumpkin(0.72);
      p2.position.set(side * 8.4, 0, -5.1 * side);
      farmProps.add(p2);
    }

    // Background red barn silhouette on left
    const barn = new THREE.Group();
    const barnBody = new THREE.Mesh(new THREE.BoxGeometry(8, 6.2, 10), barnRedMat);
    barnBody.position.y = 3.1;
    barnBody.castShadow = true;
    barn.add(barnBody);
    const barnRoof = new THREE.Mesh(new THREE.ConeGeometry(6.6, 3.2, 4), woodDarkMat);
    barnRoof.rotation.y = Math.PI / 4;
    barnRoof.position.y = 7.7;
    barn.add(barnRoof);
    barn.position.set(-15.5, 0, 2);
    farmProps.add(barn);
    group.add(farmProps);

    // --- Stage 2 props: Harvest Barn timber walls, overhead rafters, hanging lanterns ---
    const barnProps = new THREE.Group();
    for (const side of [-1, 1]) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 9.5, SEGMENT_LENGTH), barnRedMat);
      wall.position.set(side * 6.8, 4.75, 0);
      barnProps.add(wall);

      for (let z = -9; z <= 9; z += 9) {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.65, 9.5, 0.65), woodDarkMat);
        pillar.position.set(side * 6.2, 4.75, z);
        barnProps.add(pillar);
      }
    }
    for (const z of [-6.5, 6.5]) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(13.6, 0.65, 0.65), woodDarkMat);
      beam.position.set(0, 8.2, z);
      barnProps.add(beam);

      const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.56, 8), lanternGlowMat);
      lantern.position.set(0, 7.4, z);
      barnProps.add(lantern);
    }
    barnProps.visible = false;
    group.add(barnProps);

    // --- Stage 3 props: Thanksgiving Kitchen counters, shelves, copper pots, warm walls ---
    const kitchenProps = new THREE.Group();
    for (const side of [-1, 1]) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 10.5, SEGMENT_LENGTH), creamWallMat);
      wall.position.set(side * 6.9, 5.25, 0);
      kitchenProps.add(wall);

      // Wooden kitchen counter along each wall
      const counter = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.3, SEGMENT_LENGTH), woodDarkMat);
      counter.position.set(side * 6.1, 1.15, 0);
      kitchenProps.add(counter);

      const counterTop = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.22, SEGMENT_LENGTH),
        new THREE.MeshStandardMaterial({ color: 0xe8d5b7, roughness: 0.35 }),
      );
      counterTop.position.set(side * 6.0, 2.38, 0);
      kitchenProps.add(counterTop);

      // Decorative copper pots on counter
      for (const z of [-7, 2, 9]) {
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.42, 0.65, 12), copperMat);
        pot.position.set(side * 5.8, 2.8, z);
        kitchenProps.add(pot);
      }
    }
    // Overhead copper pot rack + warm kitchen lamp
    const rack = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.25, 0.3), woodDarkMat);
    rack.position.set(0, 7.6, 0);
    kitchenProps.add(rack);
    for (const x of [-3.2, 0, 3.2]) {
      const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.14, 14), copperMat);
      pan.rotation.x = Math.PI / 2;
      pan.position.set(x, 6.9, 0);
      kitchenProps.add(pan);
    }
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 10), lanternGlowMat);
    lamp.position.set(0, 8.2, -6);
    kitchenProps.add(lamp);

    // Warm indoor ceiling for the kitchen so outdoor sky never bleeds inside
    const kitchenCeiling = new THREE.Mesh(
      new THREE.PlaneGeometry(14.5, SEGMENT_LENGTH),
      new THREE.MeshStandardMaterial({ color: 0x6b321d, roughness: 0.85 }),
    );
    kitchenCeiling.rotation.x = Math.PI / 2;
    kitchenCeiling.position.set(0, 9.6, 0);
    kitchenProps.add(kitchenCeiling);

    kitchenProps.visible = false;
    group.add(kitchenProps);

    return {
      group,
      ground,
      farmProps,
      barnProps,
      kitchenProps,
      setTheme(stageId) {
        farmProps.visible = stageId === 'farmyard';
        barnProps.visible = stageId === 'barn';
        kitchenProps.visible = stageId === 'kitchen';
        if (stageId === 'farmyard') ground.material = dirtMat;
        else if (stageId === 'barn') ground.material = barnFloorMat;
        else ground.material = kitchenFloorMat;
      },
    };
  }

  const segments = [];
  for (let i = 0; i < SEGMENT_COUNT; i++) {
    const seg = buildSegment();
    seg.group.position.z = 16 - i * SEGMENT_LENGTH;
    root.add(seg.group);
    segments.push(seg);
  }

  // Grand Freedom Archway (appears near 900m escape line)
  const freedomGate = new THREE.Group();
  const postMat = new THREE.MeshStandardMaterial({ color: 0xf2c14e, metalness: 0.45, roughness: 0.35 });
  const gateLeft = new THREE.Mesh(new THREE.BoxGeometry(0.9, 6.5, 0.9), postMat);
  gateLeft.position.set(-5.8, 3.25, 0);
  freedomGate.add(gateLeft);
  const gateRight = gateLeft.clone();
  gateRight.position.x = 5.8;
  freedomGate.add(gateRight);
  const gateArch = new THREE.Mesh(new THREE.BoxGeometry(12.8, 1.35, 1.1), barnRedMat);
  gateArch.position.set(0, 6.8, 0);
  freedomGate.add(gateArch);
  const gateLight = new THREE.PointLight(0xffe082, 5.0, 24);
  gateLight.position.set(0, 5.2, 2);
  freedomGate.add(gateLight);
  freedomGate.visible = false;
  root.add(freedomGate);

  // Drifting 3D autumn leaves for atmosphere
  const leaves = [];
  const leafGeo = new THREE.PlaneGeometry(0.32, 0.22);
  const leafColors = [0xd94e1f, 0xe88b23, 0xf2c14e, 0xa82a19];
  for (let i = 0; i < 42; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: leafColors[i % leafColors.length],
      side: THREE.DoubleSide,
    });
    const leaf = new THREE.Mesh(leafGeo, mat);
    leaf.position.set((Math.random() - 0.5) * 20, 1 + Math.random() * 8, -Math.random() * 75);
    leaf.userData = {
      vy: 0.9 + Math.random() * 1.1,
      sway: Math.random() * Math.PI * 2,
      spin: 1.5 + Math.random() * 2.5,
    };
    scene.add(leaf);
    leaves.push(leaf);
  }

  return {
    update(dt, time, distance, speed) {
      const stage = getStageForDistance(distance);
      sunDisc.visible = stage.id === 'farmyard';
      for (const seg of segments) {
        seg.group.position.z += speed * dt;
        if (seg.group.position.z > SEGMENT_LENGTH + 14) {
          seg.group.position.z -= SEGMENT_COUNT * SEGMENT_LENGTH;
          const futureDist = distance + Math.abs(seg.group.position.z);
          seg.setTheme(getStageForDistance(futureDist).id);
        }
      }

      // Show freedom gate when within 95m of escape
      const remaining = GAME_CONFIG.escapeDistance - distance;
      if (remaining < 95 && remaining > -25) {
        freedomGate.visible = true;
        freedomGate.position.z = -remaining;
      } else {
        freedomGate.visible = false;
      }

      // Animate falling autumn leaves
      for (const leaf of leaves) {
        leaf.position.z += (speed * 0.65) * dt;
        leaf.position.y -= leaf.userData.vy * dt;
        leaf.position.x += Math.sin(time * 2.1 + leaf.userData.sway) * 1.4 * dt;
        leaf.rotation.x += leaf.userData.spin * dt;
        leaf.rotation.z += leaf.userData.spin * 0.7 * dt;
        if (leaf.position.y < 0.2 || leaf.position.z > 14) {
          leaf.position.set((Math.random() - 0.5) * 18, 6.5 + Math.random() * 4, -35 - Math.random() * 45);
        }
      }

      return stage;
    },
    resetThemes(initialDistance = 0) {
      sunDisc.visible = getStageForDistance(initialDistance).id === 'farmyard';
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        seg.group.position.z = 16 - i * SEGMENT_LENGTH;
        const segDist = Math.max(0, initialDistance - seg.group.position.z);
        seg.setTheme(getStageForDistance(segDist).id);
      }
      freedomGate.visible = false;
    },
  };
}
