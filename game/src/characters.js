// Expressive articulated 3D Turkey ("Barnaby") and Farmer Jed pursuer with smooth animations.

import * as THREE from '../vendor/three.module.min.js';
import { PALETTE } from './config.js';

export function createTurkeyCharacter() {
  const root = new THREE.Group();
  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const bodyMat = new THREE.MeshStandardMaterial({
    color: PALETTE.turkeyBody,
    roughness: 0.72,
    metalness: 0.05,
  });
  const chestMat = new THREE.MeshStandardMaterial({
    color: PALETTE.turkeyChest,
    roughness: 0.75,
  });
  const redMat = new THREE.MeshStandardMaterial({
    color: PALETTE.turkeyWattle,
    roughness: 0.35,
  });
  const beakMat = new THREE.MeshStandardMaterial({
    color: PALETTE.turkeyBeak,
    roughness: 0.4,
  });
  const feetMat = new THREE.MeshStandardMaterial({
    color: PALETTE.turkeyFeet,
    roughness: 0.5,
  });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1 });

  // Plump oval turkey torso
  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.68, 20, 16), bodyMat);
  torso.scale.set(0.95, 0.88, 1.18);
  torso.position.set(0, 0.92, 0);
  torso.castShadow = true;
  torso.receiveShadow = true;
  bodyPivot.add(torso);

  // Warm lighter breast plumage
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.54, 16, 14), chestMat);
  chest.scale.set(0.88, 0.85, 0.8);
  chest.position.set(0, 0.9, -0.32);
  chest.castShadow = true;
  bodyPivot.add(chest);

  // Iconic fanned multi-colored Thanksgiving tail feathers (7 distinct feathers with cream tips)
  const tailFan = new THREE.Group();
  tailFan.position.set(0, 1.05, 0.62);
  bodyPivot.add(tailFan);

  const featherCount = PALETTE.tailFeathers.length;
  for (let i = 0; i < featherCount; i++) {
    const t = (i / (featherCount - 1)) * 2 - 1; // -1..1
    const angle = t * 1.08;
    const fGroup = new THREE.Group();
    fGroup.rotation.z = -angle;
    fGroup.rotation.x = 0.26 + Math.abs(t) * 0.08;

    const fMat = new THREE.MeshStandardMaterial({
      color: PALETTE.tailFeathers[i],
      roughness: 0.65,
    });
    const feather = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.72, 6, 10), fMat);
    feather.scale.set(1.0, 1.0, 0.25);
    feather.position.y = 0.56;
    feather.castShadow = true;
    fGroup.add(feather);

    // Cream feather tip band for high-contrast readability
    const tip = new THREE.Mesh(
      new THREE.SphereGeometry(0.145, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xfff0cc, roughness: 0.55 }),
    );
    tip.scale.set(1.0, 0.58, 0.28);
    tip.position.y = 0.96;
    fGroup.add(tip);

    tailFan.add(fGroup);
  }

  // Neck + expressive head group
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.38, -0.58);
  bodyPivot.add(headGroup);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 0.52, 12), chestMat);
  neck.position.set(0, 0.14, 0.05);
  neck.rotation.x = 0.22;
  neck.castShadow = true;
  headGroup.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 14), new THREE.MeshStandardMaterial({
    color: 0x5c2c16,
    roughness: 0.55,
  }));
  head.position.set(0, 0.44, -0.06);
  head.castShadow = true;
  headGroup.add(head);

  // Curved golden beak
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.34, 10), beakMat);
  beak.rotation.x = -Math.PI / 2 + 0.15;
  beak.position.set(0, 0.41, -0.38);
  beak.castShadow = true;
  headGroup.add(beak);

  // Bright red snood over beak + wattle under chin
  const snood = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.16, 6, 8), redMat);
  snood.position.set(0.03, 0.42, -0.34);
  snood.rotation.z = -0.35;
  headGroup.add(snood);

  const wattle = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), redMat);
  wattle.scale.set(0.85, 1.35, 0.85);
  wattle.position.set(0, 0.23, -0.22);
  headGroup.add(wattle);

  // Expressive cartoon eyes
  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 10), whiteMat);
  leftEye.position.set(-0.15, 0.5, -0.22);
  headGroup.add(leftEye);
  const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), pupilMat);
  leftPupil.position.set(-0.16, 0.5, -0.29);
  headGroup.add(leftPupil);

  const rightEye = leftEye.clone();
  rightEye.position.x = 0.15;
  headGroup.add(rightEye);
  const rightPupil = leftPupil.clone();
  rightPupil.position.x = 0.16;
  headGroup.add(rightPupil);

  // Articulated wings
  const leftWing = new THREE.Group();
  leftWing.position.set(-0.62, 1.0, -0.05);
  const wingMeshL = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 12), bodyMat);
  wingMeshL.scale.set(0.32, 0.72, 1.28);
  wingMeshL.position.set(-0.12, -0.08, 0.08);
  wingMeshL.castShadow = true;
  leftWing.add(wingMeshL);
  bodyPivot.add(leftWing);

  const rightWing = new THREE.Group();
  rightWing.position.set(0.62, 1.0, -0.05);
  const wingMeshR = wingMeshL.clone();
  wingMeshR.position.x = 0.12;
  rightWing.add(wingMeshR);
  bodyPivot.add(rightWing);

  // Animated legs + webbed feet
  function makeLeg(side) {
    const legGroup = new THREE.Group();
    legGroup.position.set(side * 0.25, 0.44, 0.02);

    const drumstick = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.2, 6, 8), chestMat);
    drumstick.position.y = -0.08;
    legGroup.add(drumstick);

    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.34, 8), feetMat);
    shin.position.y = -0.28;
    legGroup.add(shin);

    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.32), feetMat);
    foot.position.set(0, -0.43, -0.08);
    legGroup.add(foot);
    return legGroup;
  }

  const leftLeg = makeLeg(-1);
  const rightLeg = makeLeg(1);
  root.add(leftLeg);
  root.add(rightLeg);

  // Soft warm rim point light on turkey so silhouette stays readable even in dark barn/kitchen
  const rimGlow = new THREE.PointLight(0xffd082, 1.1, 6.5);
  rimGlow.position.set(0, 1.6, 0.4);
  root.add(rimGlow);

  return {
    root,
    bodyPivot,
    tailFan,
    headGroup,
    leftWing,
    rightWing,
    leftLeg,
    rightLeg,
    wattle,
    updateAnimation(time, { speedRatio, isJumping, isDucking, isDashing, leanX, dangerLevel, hitFlash }) {
      const strideFreq = 11 + speedRatio * 7;
      const stride = Math.sin(time * strideFreq);

      // Leg running cycle
      if (isJumping) {
        leftLeg.rotation.x = 0.55;
        rightLeg.rotation.x = -0.35;
      } else {
        leftLeg.rotation.x = stride * 0.78;
        rightLeg.rotation.x = -stride * 0.78;
      }

      // Wing flapping (frantic when airborne, dashing, or farmer close)
      const flapAmp = isJumping ? 0.95 : isDashing ? 1.15 : 0.22 + dangerLevel * 0.45;
      const flapFreq = isJumping || isDashing ? 22 : 12 + dangerLevel * 8;
      const flap = Math.sin(time * flapFreq) * flapAmp;
      leftWing.rotation.z = 0.35 + flap;
      rightWing.rotation.z = -0.35 - flap;

      // Tail fan flares wide during dash/jump/panic
      const tailFlare = 1.0 + (isDashing ? 0.22 : 0) + dangerLevel * 0.14;
      tailFan.scale.set(tailFlare, tailFlare, 1);
      tailFan.rotation.x = 0.12 + Math.sin(time * strideFreq * 0.5) * 0.08;

      // Body bounce, steering bank, and duck squash
      const bounce = isJumping ? 0 : Math.abs(Math.sin(time * strideFreq)) * 0.11;
      bodyPivot.position.y = isDucking ? -0.32 : bounce;
      bodyPivot.scale.set(
        isDucking ? 1.18 : 1.0,
        isDucking ? 0.56 : 1.0,
        isDucking ? 1.14 : isDashing ? 1.12 : 1.0,
      );
      bodyPivot.rotation.z = -leanX * 0.28;
      bodyPivot.rotation.x = isDashing ? -0.22 : isDucking ? -0.18 : 0.04;

      // Head bob + wattle jiggle
      headGroup.rotation.x = Math.sin(time * strideFreq) * 0.14 - (isDashing ? 0.2 : 0);
      wattle.rotation.z = Math.sin(time * 18) * 0.28;

      // Brief invulnerability blink after taking a hit
      root.visible = hitFlash <= 0 || Math.floor(time * 18) % 2 === 0;
    },
  };
}

export function createFarmerCharacter(textures) {
  const root = new THREE.Group();
  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const shirtMat = new THREE.MeshStandardMaterial({
    map: textures.flannelPlaid,
    roughness: 0.82,
  });
  const overallsMat = new THREE.MeshStandardMaterial({
    color: 0x355e96,
    roughness: 0.72,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: PALETTE.farmerSkin,
    roughness: 0.65,
  });
  const hatMat = new THREE.MeshStandardMaterial({
    color: PALETTE.farmerHat,
    roughness: 0.85,
  });
  const beardMat = new THREE.MeshStandardMaterial({
    color: PALETTE.farmerBeard,
    roughness: 0.85,
  });
  const bootMat = new THREE.MeshStandardMaterial({
    color: 0x382012,
    roughness: 0.6,
  });
  const bladeMat = new THREE.MeshStandardMaterial({
    color: 0xf4f8fc,
    emissive: 0x4b5c70,
    emissiveIntensity: 0.45,
    metalness: 0.45,
    roughness: 0.18,
  });
  const handleMat = new THREE.MeshStandardMaterial({
    color: PALETTE.knifeHandle,
    roughness: 0.7,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xe3b146,
    metalness: 0.7,
    roughness: 0.3,
  });

  // Chunky torso (plaid shirt + denim overalls bib)
  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.24, 0.72), shirtMat);
  torso.position.set(0, 1.72, 0);
  torso.castShadow = true;
  bodyPivot.add(torso);

  const overallsBib = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.84, 0.76), overallsMat);
  overallsBib.position.set(0, 1.48, 0);
  overallsBib.castShadow = true;
  bodyPivot.add(overallsBib);

  // Brass buttons on overalls
  for (const sx of [-0.3, 0.3]) {
    const btn = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), brassMat);
    btn.position.set(sx, 1.82, -0.39);
    bodyPivot.add(btn);
  }

  // Head + angry furrowed brows + bushy mustache + straw hat
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 2.52, 0);
  bodyPivot.add(headGroup);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 14), skinMat);
  head.castShadow = true;
  headGroup.add(head);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), new THREE.MeshStandardMaterial({
    color: 0xe08972,
    roughness: 0.6,
  }));
  nose.position.set(0, -0.02, -0.4);
  headGroup.add(nose);

  const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.15, 0.18), beardMat);
  mustache.position.set(0, -0.15, -0.36);
  headGroup.add(mustache);

  // Furrowed angry eyebrows
  for (const side of [-1, 1]) {
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.08), beardMat);
    brow.position.set(side * 0.16, 0.14, -0.38);
    brow.rotation.z = side * 0.32;
    headGroup.add(brow);
  }

  // Wide straw hat
  const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.92, 0.09, 20), hatMat);
  hatBrim.position.y = 0.28;
  hatBrim.castShadow = true;
  headGroup.add(hatBrim);

  const hatCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.5, 0.42, 16), hatMat);
  hatCrown.position.y = 0.5;
  hatCrown.castShadow = true;
  headGroup.add(hatCrown);

  const hatBand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.51, 0.51, 0.1, 16),
    new THREE.MeshStandardMaterial({ color: 0x9e2218, roughness: 0.7 }),
  );
  hatBand.position.y = 0.36;
  headGroup.add(hatBand);

  // Right arm raised high brandishing a gleaming oversized carving knife!
  const rightArm = new THREE.Group();
  rightArm.position.set(0.76, 2.22, 0);
  bodyPivot.add(rightArm);

  const rSleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.68, 6, 10), shirtMat);
  rSleeve.position.set(0.08, 0.22, -0.18);
  rSleeve.rotation.x = -0.55;
  rSleeve.rotation.z = -0.22;
  rSleeve.castShadow = true;
  rightArm.add(rSleeve);

  const knifeGroup = new THREE.Group();
  knifeGroup.position.set(0.16, 0.62, -0.45);
  knifeGroup.rotation.x = -0.45;
  knifeGroup.rotation.z = -0.15;
  rightArm.add(knifeGroup);

  const kHandle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.44), handleMat);
  knifeGroup.add(kHandle);
  const kBlade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.32, 1.38), bladeMat);
  kBlade.position.set(0, 0.06, -0.88);
  kBlade.castShadow = true;
  knifeGroup.add(kBlade);

  // Left arm holding glowing brass lantern (illuminates farmer silhouette!)
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.72, 2.15, 0);
  bodyPivot.add(leftArm);

  const lSleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.68, 6, 10), shirtMat);
  lSleeve.position.set(0, -0.35, -0.16);
  lSleeve.rotation.x = 0.55;
  lSleeve.castShadow = true;
  leftArm.add(lSleeve);

  const lantern = new THREE.Group();
  lantern.position.set(0, -0.78, -0.52);
  leftArm.add(lantern);

  const lanternGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.14, 0.34, 10),
    new THREE.MeshStandardMaterial({
      color: 0xffd275,
      emissive: 0xff9224,
      emissiveIntensity: 2.2,
      roughness: 0.2,
    }),
  );
  lantern.add(lanternGlass);
  const lanternCap = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.16, 10), brassMat);
  lanternCap.position.y = 0.24;
  lantern.add(lanternCap);

  const lanternLight = new THREE.PointLight(0xff9c3b, 2.8, 12);
  lanternLight.position.set(0, 0, 0);
  lantern.add(lanternLight);

  // Striding legs
  function makeFarmerLeg(side) {
    const leg = new THREE.Group();
    leg.position.set(side * 0.3, 1.05, 0);
    const pant = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.56, 6, 10), overallsMat);
    pant.position.y = -0.36;
    pant.castShadow = true;
    leg.add(pant);
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, 0.52), bootMat);
    boot.position.set(0, -0.86, -0.08);
    boot.castShadow = true;
    leg.add(boot);
    return leg;
  }

  const leftLeg = makeFarmerLeg(-1);
  const rightLeg = makeFarmerLeg(1);
  root.add(leftLeg);
  root.add(rightLeg);

  return {
    root,
    bodyPivot,
    rightArm,
    leftArm,
    leftLeg,
    rightLeg,
    updateAnimation(time, { speedRatio, lungeIntensity }) {
      const freq = 9 + speedRatio * 5.5;
      const stride = Math.sin(time * freq);
      leftLeg.rotation.x = stride * 0.82;
      rightLeg.rotation.x = -stride * 0.82;

      // Aggressive forward lean + knife chopping motion when close
      bodyPivot.rotation.x = -0.18 - lungeIntensity * 0.24;
      bodyPivot.position.y = Math.abs(Math.sin(time * freq)) * 0.16;

      rightArm.rotation.x = -0.35 + Math.sin(time * (freq + 3)) * (0.45 + lungeIntensity * 0.55);
      leftArm.rotation.x = -0.2 - stride * 0.4;
    },
  };
}
