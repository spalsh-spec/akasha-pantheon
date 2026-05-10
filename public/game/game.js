/* ============================================================
   AKASHA · the world game · Realm 1 — Göbekli Tepe (Phase 1)
   Walk · photograph carvings · read what we know
   Layout based on Schmidt's site plan of Enclosure D.
   ============================================================ */
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

/* ---------- LORE (every claim sourced) ---------- */
const LORE = {
  fox: {
    title: '⟁ The Fox · Pillar 33',
    body: `The fox appears more often than any other animal at Göbekli Tepe. Across hunter-gatherer cosmologies of Eurasia, the fox is <em>psychopomp</em> — guide between worlds. The choice is striking: the fox is not a powerful animal. The makers chose it for a reason we no longer carry.`,
    source: 'Schmidt, K. <em>Sie bauten die ersten Tempel.</em> C.H. Beck, 2006.',
  },
  scorpion: {
    title: '⟁ The Scorpion · Pillar 33',
    body: `In the Mesopotamian myth recorded six millennia later, the scorpion guards the gate the sun passes through nightly. At Göbekli Tepe — 7,000 years <em>before</em> that mythology was written down — the meaning is unknown. The carving remains. The reading is yours.`,
    source: 'Notroff, J., Dietrich, O., & Schmidt, K. <em>Antiquity</em> 88, 2014.',
  },
  vulture: {
    title: '⟁ The Vulture · Pillar 43',
    body: `The famous "Vulture Stone." A possible reference to <em>sky burial</em> — exposing the dead to be eaten by birds. Some authors (Sweatman & Tsikritsis, 2017) read constellation patterns into it; the archaeological consensus rejects this. Recorded as an open question — what the carving preserves matters more than what we can prove about it.`,
    source: 'Schmidt 2010; Notroff et al. <em>Antiquity</em> 91, 2017 (rebuttal).',
  },
};

/* ---------- SCENE ---------- */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xc9986a);            // dawn sky
scene.fog = new THREE.Fog(0xc9986a, 35, 220);

const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.1, 600);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

/* ---------- LIGHTING (dawn) ---------- */
scene.add(new THREE.HemisphereLight(0xffd6a5, 0x6a4a2a, 0.65));
const sun = new THREE.DirectionalLight(0xfff1d0, 1.4);
sun.position.set(-60, 40, 25);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left   = -30;
sun.shadow.camera.right  =  30;
sun.shadow.camera.top    =  30;
sun.shadow.camera.bottom = -30;
sun.shadow.bias = -0.0005;
scene.add(sun);

/* warm rim light from opposite side */
const rim = new THREE.DirectionalLight(0xc46544, 0.35);
rim.position.set(40, 12, -30);
scene.add(rim);

/* ---------- GROUND ---------- */
const groundGeo = new THREE.PlaneGeometry(500, 500, 32, 32);
// gentle terrain undulation
const gpos = groundGeo.attributes.position;
for (let i = 0; i < gpos.count; i++) {
  const x = gpos.getX(i), y = gpos.getY(i);
  const r = Math.hypot(x, y);
  if (r > 12) gpos.setZ(i, (Math.sin(x * 0.05) + Math.cos(y * 0.04)) * 0.6 + Math.random() * 0.3);
}
groundGeo.computeVertexNormals();
const groundMat = new THREE.MeshStandardMaterial({ color: 0xc9a063, roughness: 0.95, metalness: 0 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

/* ---------- DISTANT MOUNTAINS ---------- */
for (let i = 0; i < 26; i++) {
  const r = 90 + Math.random() * 80;
  const a = Math.random() * Math.PI * 2;
  const h = 10 + Math.random() * 22;
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(7 + Math.random() * 10, h, 5 + Math.floor(Math.random() * 3)),
    new THREE.MeshStandardMaterial({ color: 0x7e5e44, roughness: 1, metalness: 0, flatShading: true })
  );
  cone.position.set(Math.cos(a) * r, h / 2 - 0.2, Math.sin(a) * r);
  cone.rotation.y = Math.random() * Math.PI;
  scene.add(cone);
}

/* ---------- T-PILLARS ---------- */
const PILLAR_HEIGHT = 5.5;
const CIRCLE_RADIUS = 9;
const NUM_PILLARS = 12;

const limestoneMat = new THREE.MeshStandardMaterial({
  color: 0xb8a07a,
  roughness: 0.9,
  metalness: 0,
});
const limestoneDarkerMat = new THREE.MeshStandardMaterial({
  color: 0x9d8966,
  roughness: 0.95,
  metalness: 0,
});

/**
 * Build one T-shaped pillar.
 * Optionally embed a glyph carving on its inner face.
 */
function makeTPillar(height, withCarving = null) {
  const group = new THREE.Group();
  const shaftH = height * 0.84;
  const topH   = height * 0.20;

  // Vertical shaft
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.8, shaftH, 0.45), limestoneMat);
  shaft.position.y = shaftH / 2;
  shaft.castShadow = true;
  shaft.receiveShadow = true;
  group.add(shaft);

  // Top crossbar (the T)
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.7, topH, 0.55), limestoneDarkerMat);
  top.position.y = shaftH + topH / 2;
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);

  // Subtle bevel/base ring
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.18, 0.55),
    limestoneDarkerMat
  );
  base.position.y = 0.09;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  if (withCarving) {
    const glyph = makeCarving(withCarving);
    glyph.position.set(0, height * 0.42, 0.235);   // on the inner face
    glyph.userData.carving = withCarving;
    group.add(glyph);
    group.userData.carving = withCarving;
    group.userData.glyph   = glyph;
  }

  return group;
}

/**
 * Tiny SVG-ish glyphs drawn as flat planes with canvas textures.
 * Schematic but readable.
 */
function makeCarvingTexture(kind) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(184, 160, 122, 1)';
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = '#3b2a18';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.fillStyle = '#3b2a18';

  if (kind === 'fox') {
    // simplified fox profile
    ctx.beginPath();
    ctx.moveTo(56, 170); ctx.lineTo(72, 130); ctx.lineTo(92, 100);
    ctx.lineTo(118, 92); ctx.lineTo(140, 80); ctx.lineTo(162, 88);
    ctx.lineTo(180, 76); ctx.lineTo(196, 92); ctx.lineTo(204, 130);
    ctx.lineTo(220, 174); ctx.lineTo(196, 184); ctx.lineTo(174, 178);
    ctx.lineTo(152, 188); ctx.lineTo(120, 188); ctx.lineTo(96, 184);
    ctx.lineTo(70, 188); ctx.closePath();
    ctx.stroke();
    ctx.beginPath(); ctx.arc(168, 110, 4, 0, 6.28); ctx.fill();   // eye
    // tail
    ctx.beginPath();
    ctx.moveTo(60, 174); ctx.quadraticCurveTo(20, 178, 32, 210);
    ctx.stroke();
  } else if (kind === 'scorpion') {
    // scorpion top-down: body + tail + claws
    ctx.beginPath();
    ctx.moveTo(110, 170); ctx.lineTo(146, 170); ctx.lineTo(160, 152);
    ctx.lineTo(156, 134); ctx.lineTo(140, 122); ctx.lineTo(116, 122);
    ctx.lineTo(100, 134); ctx.lineTo(96, 152); ctx.closePath();
    ctx.stroke();
    // tail curling up
    ctx.beginPath();
    ctx.moveTo(128, 122); ctx.quadraticCurveTo(128, 80, 100, 72);
    ctx.quadraticCurveTo(76, 64, 80, 96);
    ctx.stroke();
    // tail stinger
    ctx.beginPath(); ctx.arc(82, 92, 5, 0, 6.28); ctx.fill();
    // claws (left + right)
    ctx.beginPath();
    ctx.moveTo(96, 152); ctx.lineTo(60, 168); ctx.lineTo(48, 196);
    ctx.moveTo(160, 152); ctx.lineTo(196, 168); ctx.lineTo(208, 196);
    ctx.stroke();
    // legs
    for (let s = -1; s <= 1; s += 2) {
      for (let k = 0; k < 3; k++) {
        const y = 142 + k * 12;
        ctx.beginPath();
        ctx.moveTo(s > 0 ? 156 : 100, y);
        ctx.lineTo(s > 0 ? 200 : 56, y + 6);
        ctx.stroke();
      }
    }
  } else if (kind === 'vulture') {
    // vulture with extended wings
    ctx.beginPath();
    ctx.moveTo(40, 130); ctx.lineTo(80, 110); ctx.lineTo(100, 116);
    ctx.lineTo(118, 100); ctx.lineTo(138, 100); ctx.lineTo(156, 116);
    ctx.lineTo(176, 110); ctx.lineTo(216, 130);
    ctx.stroke();
    // body
    ctx.beginPath();
    ctx.moveTo(108, 116); ctx.lineTo(108, 174); ctx.lineTo(120, 188);
    ctx.lineTo(136, 188); ctx.lineTo(148, 174); ctx.lineTo(148, 116);
    ctx.stroke();
    // hooked head
    ctx.beginPath();
    ctx.moveTo(118, 116); ctx.lineTo(122, 100); ctx.lineTo(132, 96);
    ctx.lineTo(140, 100); ctx.lineTo(146, 110);
    ctx.stroke();
    ctx.beginPath(); ctx.arc(132, 102, 3, 0, 6.28); ctx.fill();
    // feathered wing detail
    for (let k = 0; k < 5; k++) {
      ctx.beginPath();
      ctx.moveTo(60 + k * 8, 124); ctx.lineTo(64 + k * 8, 138);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(196 - k * 8, 124); ctx.lineTo(192 - k * 8, 138);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function makeCarving(kind) {
  const tex = makeCarvingTexture(kind);
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, transparent: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.55), mat);
  return mesh;
}

/* ---------- LAYOUT (Enclosure D) ---------- */
// 12 surrounding pillars in a circle, two central pillars (oriented N-NW per Schmidt)
// Carvings placed on three of the surrounding pillars (fox, scorpion, vulture).
const carvingAssignments = { 0: 'fox', 4: 'scorpion', 8: 'vulture' };

const interactablePillars = [];
for (let i = 0; i < NUM_PILLARS; i++) {
  const angle = (i / NUM_PILLARS) * Math.PI * 2;
  const x = Math.cos(angle) * CIRCLE_RADIUS;
  const z = Math.sin(angle) * CIRCLE_RADIUS;
  const carving = carvingAssignments[i] || null;
  const pillar = makeTPillar(PILLAR_HEIGHT, carving);
  pillar.position.set(x, 0, z);
  pillar.rotation.y = -angle + Math.PI;   // face the centre
  scene.add(pillar);
  if (carving) interactablePillars.push(pillar);
}

// Two central pillars (N-NW oriented, per Schmidt's site plan)
const centralL = makeTPillar(PILLAR_HEIGHT * 1.1);
centralL.position.set(-1.5, 0, 0);
centralL.rotation.y = -0.18;
scene.add(centralL);

const centralR = makeTPillar(PILLAR_HEIGHT * 1.1);
centralR.position.set(1.5, 0, 0);
centralR.rotation.y = -0.18;
scene.add(centralR);

// stone bench/wall ring (low) connecting pillar bases
const ringGeo = new THREE.TorusGeometry(CIRCLE_RADIUS, 0.55, 6, 60);
const ring = new THREE.Mesh(ringGeo, limestoneDarkerMat);
ring.position.y = 0.3;
ring.rotation.x = -Math.PI / 2;
ring.castShadow = true;
ring.receiveShadow = true;
scene.add(ring);

/* ---------- CONTROLS ---------- */
const controls = new PointerLockControls(camera, document.body);
camera.position.set(0, 1.7, CIRCLE_RADIUS + 5);
camera.lookAt(0, 1.7, 0);
scene.add(controls.getObject());

const overlay      = document.getElementById('overlay');
const album        = document.getElementById('album');
const lorePanel    = document.getElementById('lore-panel');
const reticle      = document.getElementById('reticle');
const promptHint   = document.getElementById('prompt-hint');
const startBtn     = document.getElementById('start-btn');
const touchHud     = document.getElementById('touch-controls');
const touchStick   = document.getElementById('touch-stick');
const touchKnob    = document.getElementById('touch-knob');
const touchPhoto   = document.getElementById('touch-photo');

// touch / desktop detection
const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 1);
let touchMode = false;

startBtn.addEventListener('click', () => {
  if (isTouch) {
    touchMode = true;
    overlay.style.display = 'none';
    touchHud.classList.remove('hidden');
    document.body.requestFullscreen?.().catch(() => {});
  } else {
    controls.lock();
  }
});
controls.addEventListener('lock',   () => { overlay.style.display = 'none'; });
controls.addEventListener('unlock', () => {
  if (lorePanel.style.display === 'block') return; // lore panel was opened, not user esc
  overlay.style.display = 'flex';
});

/* ---------- MOVEMENT ---------- */
const velocity  = new THREE.Vector3();
const direction = new THREE.Vector3();
const keys = { forward: false, backward: false, left: false, right: false };

addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'KeyW': case 'ArrowUp':    keys.forward  = true; break;
    case 'KeyS': case 'ArrowDown':  keys.backward = true; break;
    case 'KeyA': case 'ArrowLeft':  keys.left     = true; break;
    case 'KeyD': case 'ArrowRight': keys.right    = true; break;
    case 'KeyE': case 'Space':      tryPhoto(); break;
    case 'Escape':                  break;
  }
});
addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'KeyW': case 'ArrowUp':    keys.forward  = false; break;
    case 'KeyS': case 'ArrowDown':  keys.backward = false; break;
    case 'KeyA': case 'ArrowLeft':  keys.left     = false; break;
    case 'KeyD': case 'ArrowRight': keys.right    = false; break;
  }
});

/* ---------- TOUCH (mobile) ---------- */
let stickActive = false, stickStart = null, stickVec = { x: 0, y: 0 };
let lookActive  = false, lookStart  = null;
const lookEuler = new THREE.Euler(0, 0, 0, 'YXZ');

if (touchStick) {
  touchStick.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    stickActive = true;
    const r = touchStick.getBoundingClientRect();
    stickStart = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, { passive: false });
  touchStick.addEventListener('touchmove', (e) => {
    if (!stickActive) return;
    e.preventDefault();
    const t = e.changedTouches[0];
    const dx = t.clientX - stickStart.x;
    const dy = t.clientY - stickStart.y;
    const len = Math.hypot(dx, dy);
    const max = 44;
    const k = Math.min(1, len / max);
    stickVec = { x: (dx / (len || 1)) * k, y: (dy / (len || 1)) * k };
    touchKnob.style.transform = `translate(calc(-50% + ${stickVec.x * max}px), calc(-50% + ${stickVec.y * max}px))`;
  }, { passive: false });
  const stickEnd = (e) => {
    e.preventDefault();
    stickActive = false;
    stickVec = { x: 0, y: 0 };
    touchKnob.style.transform = `translate(-50%, -50%)`;
  };
  touchStick.addEventListener('touchend',    stickEnd, { passive: false });
  touchStick.addEventListener('touchcancel', stickEnd, { passive: false });
}

if (touchPhoto) {
  touchPhoto.addEventListener('touchstart', (e) => { e.preventDefault(); tryPhoto(); }, { passive: false });
  touchPhoto.addEventListener('click',      tryPhoto);
}

// look-drag (anywhere outside stick + photo button)
addEventListener('touchstart', (e) => {
  if (!touchMode) return;
  const t = e.changedTouches[0];
  if (touchStick.contains(t.target) || touchPhoto.contains(t.target)) return;
  lookActive = true;
  lookStart = { x: t.clientX, y: t.clientY, id: t.identifier };
}, { passive: true });
addEventListener('touchmove', (e) => {
  if (!touchMode || !lookActive) return;
  for (const t of e.changedTouches) {
    if (t.identifier !== lookStart.id) continue;
    const dx = t.clientX - lookStart.x;
    const dy = t.clientY - lookStart.y;
    lookStart = { x: t.clientX, y: t.clientY, id: t.identifier };
    lookEuler.setFromQuaternion(camera.quaternion);
    lookEuler.y -= dx * 0.0035;
    lookEuler.x -= dy * 0.0035;
    lookEuler.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, lookEuler.x));
    camera.quaternion.setFromEuler(lookEuler);
  }
}, { passive: true });
addEventListener('touchend', (e) => {
  for (const t of e.changedTouches) {
    if (lookStart && t.identifier === lookStart.id) lookActive = false;
  }
}, { passive: true });

/* ---------- INTERACTION (photograph) ---------- */
const raycaster = new THREE.Raycaster();
const photographed = new Set();

function carvingUnderReticle() {
  raycaster.setFromCamera({ x: 0, y: 0 }, camera);
  const targets = [];
  for (const p of interactablePillars) if (p.userData.glyph) targets.push(p.userData.glyph);
  const hits = raycaster.intersectObjects(targets, false);
  if (hits.length && hits[0].distance < 6) return hits[0].object;
  return null;
}

function tryPhoto() {
  const target = carvingUnderReticle();
  if (!target) return;
  const key = target.userData.carving;
  if (photographed.has(key)) return;
  photographed.add(key);
  flashCamera();
  showLore(key);
  updateAlbum();
}

function flashCamera() {
  const flash = document.createElement('div');
  Object.assign(flash.style, {
    position: 'fixed', inset: 0, background: 'white',
    opacity: '0.55', zIndex: '6', pointerEvents: 'none',
    transition: 'opacity 0.4s',
  });
  document.body.appendChild(flash);
  requestAnimationFrame(() => { flash.style.opacity = '0'; });
  setTimeout(() => flash.remove(), 450);
}

function showLore(key) {
  const e = LORE[key];
  lorePanel.innerHTML = `
    <h2>${e.title}</h2>
    <p>${e.body}</p>
    <p class="source">Source · ${e.source}</p>
    <button id="lore-close">CLOSE</button>
  `;
  lorePanel.style.display = 'block';
  document.exitPointerLock?.();
  document.getElementById('lore-close').addEventListener('click', () => {
    lorePanel.style.display = 'none';
    if (!touchMode) controls.lock();
  });
}

function updateAlbum() {
  album.textContent = `photographed: ${photographed.size} / 3`;
  if (photographed.size === 3) {
    setTimeout(() => {
      lorePanel.innerHTML = `
        <h2>⟁ ENCLOSURE D · COMPLETE</h2>
        <p>You have walked the oldest temple humans built. You photographed three carvings — fox, scorpion, vulture.</p>
        <p>There are five hundred more pillars at Göbekli Tepe, most still buried. Around 8000 BCE, the makers covered the entire site themselves. <em>We do not know why.</em></p>
        <p>This is Phase 1 of 5. Eridu, Mohenjo-daro, Teotihuacan, and Yggdrasil are next.</p>
        <p class="source">Schmidt 2006 · Notroff et al. 2014, 2017 · Site plans: German Archaeological Institute (DAI) Şanlıurfa branch.</p>
        <button id="lore-close">CLOSE</button>
      `;
      lorePanel.style.display = 'block';
      document.getElementById('lore-close').addEventListener('click', () => {
        lorePanel.style.display = 'none';
      });
    }, 1100);
  }
}

/* ---------- LOOP ---------- */
let prevTime = performance.now();
function animate() {
  requestAnimationFrame(animate);
  const t = performance.now();
  const delta = Math.min((t - prevTime) / 1000, 0.1);
  prevTime = t;

  if (controls.isLocked || touchMode) {
    velocity.x -= velocity.x * 9 * delta;
    velocity.z -= velocity.z * 9 * delta;

    let fwd = 0, side = 0;
    if (keys.forward)  fwd  += 1;
    if (keys.backward) fwd  -= 1;
    if (keys.left)     side -= 1;
    if (keys.right)    side += 1;

    if (touchMode) {
      fwd  -= stickVec.y * 1.4;
      side += stickVec.x * 1.4;
    }

    direction.set(side, 0, fwd);
    if (direction.lengthSq() > 0) direction.normalize();

    const speed = 22;
    velocity.x += direction.x * speed * delta;
    velocity.z -= direction.z * speed * delta;

    controls.moveRight(velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    // keep on ground
    controls.getObject().position.y = 1.7;

    // soft world boundary (dome ~80m)
    const o = controls.getObject().position;
    const r2 = o.x * o.x + o.z * o.z;
    if (r2 > 80 * 80) {
      const r = Math.sqrt(r2);
      o.x *= 80 / r;
      o.z *= 80 / r;
    }

    // reticle hot when looking at unphotographed carving
    const t2 = carvingUnderReticle();
    if (t2 && !photographed.has(t2.userData.carving)) {
      reticle.classList.add('hot');
      promptHint.classList.remove('hidden');
    } else {
      reticle.classList.remove('hot');
      promptHint.classList.add('hidden');
    }
  }

  renderer.render(scene, camera);
}
animate();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
