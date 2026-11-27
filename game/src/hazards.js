// Iconic Thanksgiving hazards (Roaring Ovens, Flying Carving Knives, Traps, Hay Bales, Gravy) and collectibles.

import * as THREE from '../vendor/three.module.min.js';
import { PALETTE } from './config.js';

export function createHazardFactory(textures) {
  const ironMat = new THREE.MeshStandardMaterial({
    color: PALETTE.ovenIron,
    roughness: 0.45,
    metalness: 0.65,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: PALETTE.ovenTrim,
    roughness: 0.3,
    metalness: 0.78,
  });
  const grateMat = new THREE.MeshStandardMaterial({
    map: textures.ovenGrate,
    emissive: 0xff5a14,
    emissiveMap: textures.ovenGrate,
    emissiveIntensity: 1.55,
    roughness: 0.4,
  });
  const flameMat = new THREE.MeshBasicMaterial({
    color: 0xffb833,
    transparent: true,
    opacity: 0.88,
  });
  const bladeMat = new THREE.MeshStandardMaterial({
    color: 0xf4f8fc,
    emissive: 0x4b5c70,
    emissiveIntensity: 0.45,
    metalness: 0.42,
    roughness: 0.16,
  });
  const handleMat = new THREE.MeshStandardMaterial({
    color: PALETTE.knifeHandle,
    roughness: 0.72,
  });
  const dangerRingMat = new THREE.MeshBasicMaterial({
    color: 0xff3b1f,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
  });
  const trapMat = new THREE.MeshStandardMaterial({
    color: PALETTE.trapMetal,
    metalness: 0.75,
    roughness: 0.32,
  });
  const hayMat = new THREE.MeshStandardMaterial({
    map: textures.hayBale,
    roughness: 0.9,
  });
  const gravyMat = new THREE.MeshStandardMaterial({
    color: PALETTE.gravy,
    roughness: 0.12,
    metalness: 0.15,
  });
  const cornMat = new THREE.MeshStandardMaterial({
    color: 0xffd23f,
    emissive: 0x805400,
    emissiveIntensity: 0.35,
    roughness: 0.38,
  });
  const huskMat = new THREE.MeshStandardMaterial({ color: 0x4f8a2b, roughness: 0.7 });
  const berryMat = new THREE.MeshStandardMaterial({
    color: 0xd91e36,
    emissive: 0x6b0816,
    emissiveIntensity: 0.45,
    roughness: 0.22,
  });
  const goldFeatherMat = new THREE.MeshStandardMaterial({
    color: 0xffe066,
    emissive: 0xffa600,
    emissiveIntensity: 0.85,
    metalness: 0.4,
    roughness: 0.25,
  });

  function buildOven() {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.35, 2.35, 2.0), ironMat);
    body.position.y = 1.18;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Glowing cast-iron oven door facing player (+Z)
    const door = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 1.35), grateMat);
    door.position.set(0, 1.05, 1.02);
    group.add(door);

    // Brass oven handle + control knobs
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 8), brassMat);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(0, 1.85, 1.08);
    group.add(handle);

    for (const kx of [-0.7, -0.25, 0.25, 0.7]) {
      const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.12, 10), brassMat);
      knob.rotation.x = Math.PI / 2;
      knob.position.set(kx, 2.15, 1.02);
      group.add(knob);
    }

    // Stovepipe chimney on top
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 1.15, 10), ironMat);
    pipe.position.set(0.65, 2.85, -0.35);
    pipe.castShadow = true;
    group.add(pipe);

    // Animated flickering flame tongue
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.88, 7), flameMat);
    flame.position.set(0, 0.9, 1.18);
    flame.rotation.x = 0.28;
    group.add(flame);

    // Warm fiery glow light
    const glow = new THREE.PointLight(0xff6a1a, 2.6, 8.5);
    glow.position.set(0, 1.2, 1.55);
    group.add(glow);

    return {
      kind: 'oven',
      mesh: group,
      halfW: 1.08,
      minY: 0,
      maxY: 2.35,
      halfD: 0.95,
      update(dt, time) {
        const flicker = 0.85 + Math.sin(time * 22 + group.position.x) * 0.22;
        flame.scale.set(1, flicker, 1);
        glow.intensity = 2.2 + Math.sin(time * 18) * 0.7;
      },
    };
  }

  function buildKnife(variant = 'spin') {
    const group = new THREE.Group();
    const bladePivot = new THREE.Group();
    group.add(bladePivot);

    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 1.95), bladeMat);
    blade.position.z = 0.55;
    blade.castShadow = true;
    bladePivot.add(blade);

    // Tapered knife tip
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.21, 0.52, 4), bladeMat);
    tip.rotation.x = Math.PI / 2;
    tip.rotation.z = Math.PI / 4;
    tip.scale.set(0.25, 1, 1);
    tip.position.z = 1.72;
    bladePivot.add(tip);

    const bolster = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.48, 0.14), brassMat);
    bolster.position.z = -0.42;
    bladePivot.add(bolster);

    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.24, 0.72), handleMat);
    handle.position.z = -0.82;
    bladePivot.add(handle);

    // Crimson motion-trail ring so knife reads instantly in screenshots
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.82, 1.02, 20), dangerRingMat);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    const isHigh = variant === 'high';
    group.scale.setScalar(1.28);
    if (isHigh) {
      bladePivot.rotation.z = Math.PI / 2;
      group.position.y = 1.62;
    } else {
      group.position.y = 0.96;
    }

    return {
      kind: isHigh ? 'knife_high' : 'knife_spin',
      mesh: group,
      halfW: isHigh ? 1.25 : 0.95,
      minY: isHigh ? 1.15 : 0.2,
      maxY: isHigh ? 2.15 : 1.55,
      halfD: 0.95,
      extraSpeed: isHigh ? 5.5 : 8.5,
      swayAmp: isHigh ? 0 : 1.35,
      swayPhase: Math.random() * Math.PI * 2,
      baseX: 0,
      update(dt, time) {
        if (isHigh) {
          bladePivot.rotation.y += dt * 11.0;
        } else {
          bladePivot.rotation.y += dt * 14.0;
          group.position.x = this.baseX + Math.sin(time * 3.2 + this.swayPhase) * this.swayAmp;
        }
        ring.rotation.z -= dt * 6;
      },
    };
  }

  function buildTrap() {
    const group = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 0.18, 16), trapMat);
    base.position.y = 0.09;
    base.receiveShadow = true;
    group.add(base);

    // Red pressure plate
    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.44, 0.44, 0.22, 12),
      new THREE.MeshStandardMaterial({
        color: 0xd92626,
        emissive: 0x6e0808,
        emissiveIntensity: 0.7,
        roughness: 0.35,
      }),
    );
    plate.position.y = 0.14;
    group.add(plate);

    // Jagged steel jaw teeth
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.36, 4), bladeMat);
      tooth.position.set(Math.cos(angle) * 0.78, 0.28, Math.sin(angle) * 0.78);
      tooth.castShadow = true;
      group.add(tooth);
    }

    return {
      kind: 'trap',
      mesh: group,
      halfW: 0.92,
      minY: 0,
      maxY: 0.65,
      halfD: 0.88,
      update(dt, time) {
        plate.scale.y = 1 + Math.sin(time * 9) * 0.12;
      },
    };
  }

  function buildHayBale() {
    const group = new THREE.Group();
    const bale = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.25, 1.35), hayMat);
    bale.position.y = 0.62;
    bale.castShadow = true;
    bale.receiveShadow = true;
    group.add(bale);

    return {
      kind: 'hay',
      mesh: group,
      halfW: 1.15,
      minY: 0,
      maxY: 1.2,
      halfD: 0.68,
      update() {},
    };
  }

  function buildGravy() {
    const group = new THREE.Group();
    const puddle = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.55, 0.08, 18), gravyMat);
    puddle.scale.set(1.1, 1, 1.4);
    puddle.position.y = 0.04;
    group.add(puddle);

    return {
      kind: 'gravy',
      mesh: group,
      halfW: 1.35,
      minY: 0,
      maxY: 0.35,
      halfD: 1.7,
      isSlowZone: true,
      update() {},
    };
  }

  function buildCollectible(kind = 'corn') {
    const group = new THREE.Group();
    if (kind === 'corn') {
      const cob = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.62, 6, 10), cornMat);
      cob.rotation.z = 0.25;
      cob.castShadow = true;
      group.add(cob);
      const husk = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.45, 6), huskMat);
      husk.position.y = -0.35;
      husk.rotation.x = Math.PI;
      group.add(husk);
    } else if (kind === 'cranberry') {
      for (const [x, y, z] of [
        [0, 0.16, 0],
        [-0.22, -0.06, 0.12],
        [0.22, -0.06, -0.1],
      ]) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), berryMat);
        b.position.set(x, y, z);
        b.castShadow = true;
        group.add(b);
      }
    } else {
      const feather = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.78, 6, 10), goldFeatherMat);
      feather.scale.set(1, 1, 0.28);
      feather.rotation.z = -0.25;
      group.add(feather);
    }
    group.position.y = 1.05;

    return {
      kind,
      mesh: group,
      radius: 0.95,
      collected: false,
      update(dt, time) {
        group.rotation.y += dt * 2.8;
        group.position.y = 1.05 + Math.sin(time * 4.5 + group.position.z) * 0.2;
      },
    };
  }

  return {
    buildOven,
    buildKnife,
    buildTrap,
    buildHayBale,
    buildGravy,
    buildCollectible,
  };
}
