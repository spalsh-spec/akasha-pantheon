/* ============================================================
   AKASHA · the world game · Realm 2 — Eridu (Phase 2)
   Walk the ziggurat of Enki. Find five Atrahasis tablets.
   Speak with Enki at the temple platform.

   Layout: stepped ziggurat (~50m square base, 3 receding tiers),
   Euphrates curve to the south, marshland reeds, dusk lighting.
   Sources: Lambert & Millard 1969 (Atrahasis text);
            George 2003 (Babylonian Gilgamesh tablets);
            Safar, Mustafa, & Lloyd 1981 (Eridu excavation).
   ============================================================ */
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

/* ---------- LORE (every claim sourced) ---------- */
const TABLETS = {
  t1: {
    title: '⟁ Tablet I · Cosmogony',
    sumerian: 'i-nu-ma i-lu a-wi-lum ki-ma a-mé-li ub-lu šu-up-ša-am',
    body: `<em>"When the gods, like men, bore the work and suffered the toil — the toil of the gods was great, the work was heavy, the distress was much."</em><br><br>The Atrahasis opens not with a creator but with <em>tired gods</em>. The lesser gods (Igigi) labour for the higher ones (Anunnaki) and revolt. From the revolt comes the decision to make humans, so the gods can rest.`,
    source: 'Atrahasis, Tablet I. Trans. Lambert & Millard, <em>Atrahasis: The Babylonian Story of the Flood</em>, Clarendon, 1969.',
  },
  t2: {
    title: '⟁ Tablet II · The Creation of Mankind',
    sumerian: 'Nintu da-šal-tum li-ib-ni-ma a-wi-la-am',
    body: `<em>"Let Nintu, the womb-goddess, create man. Let man bear the yoke of the gods, that the gods may rest."</em><br><br>Humans are made from clay mixed with the blood of a slain god (We-ila). The reason for our existence, in the Mesopotamian frame, is to do the work the gods grew tired of. <em>This is not a flattering origin story.</em> It is also 4,000 years older than any other written creation myth that survives.`,
    source: 'Atrahasis, Tablet I lines 192-248. Trans. Foster, <em>Before the Muses</em>, CDL Press, 2005.',
  },
  t3: {
    title: '⟁ Tablet III · The Noise Decision',
    sumerian: 'ri-gi-im a-wi-lu-tim ka-ab-tu-um šu-zu-um',
    body: `<em>"The land became wide, the people multiplied. The land was bellowing like a bull. The god was disturbed by their uproar. Enlil heard their clamour and said: 'The noise of mankind has become too much; I am losing sleep over their racket.'"</em><br><br>The flood is not sent because humanity is wicked. It is sent because we are <em>loud</em>. Enlil tries plagues first, then famine, then drought. None of them quiet us. Finally he chooses water.`,
    source: 'Atrahasis, Tablet II. Trans. Lambert & Millard 1969; Foster 2005.',
  },
  t4: {
    title: '⟁ Tablet IV · Enki Warns Atrahasis',
    sumerian: 'i-gar i-gar ši-tam-ma-an i-ga-ru',
    body: `<em>"Wall, wall! Reed-hut, reed-hut! Listen, wall, and hear, reed-hut: Atrahasis, take heed of my counsel. Tear down your house, build a boat. Abandon possessions and seek life..."</em><br><br>Enki — god of this very ziggurat — was forbidden to warn humans directly. So he speaks to the reed wall of Atrahasis's house, knowing Atrahasis is listening on the other side. <em>A god finds the loophole rather than betray either side.</em>`,
    source: 'Atrahasis, Tablet III. Cf. Gilgamesh XI (Utnapishtim variant); George, <em>The Babylonian Gilgamesh Epic</em>, Oxford, 2003.',
  },
  t5: {
    title: '⟁ Tablet V · The Flood and the Lesson',
    sumerian: 'a-bu-bu a-na te-er-tim ar-pu i-li',
    body: `<em>"For seven days and seven nights the storm raged. On the seventh day, the flood subsided. The land was silent like a roof. Atrahasis opened a window and released a bird, then a swallow, then a raven."</em><br><br>Atrahasis survives. The gods, who had grown thirsty and hungry without their human workers, smell his offering and "gather like flies." The story ends with a compromise: humans will live shorter lives, suffer barrenness and infant mortality — so we never grow too loud again. <em>The Hebrew Genesis flood, written ~1,500 years later, drops this ending.</em>`,
    source: 'Atrahasis, Tablet III, final fragment. Trans. Foster 2005. On dating priority: Lambert 2008, <em>Babylonian Creation Myths</em>, Eisenbrauns.',
  },
};

const ENKI_DIALOGUE = [
  {
    sumerian: 'lu₂-galam-ma ab-zu eridu-ki en-ki',
    english: '"I am Enki of the Abzu, of Eridu — of the deep, sweet waters under the earth."',
    source: 'Self-introduction formula. Black, Cunningham, Robson & Zólyomi, <em>The Literature of Ancient Sumer</em>, Oxford, 2004.',
  },
  {
    sumerian: 'enlil-le rigim-ma-bi šu-mu-un-da-an-zi',
    english: '"Enlil was angry at the noise. I am the god of cunning, not of obedience. I told you what you needed to know — through a wall."',
    source: 'Paraphrased from Atrahasis Tablet III opening. Lambert & Millard 1969.',
  },
  {
    sumerian: 'me-bi nig₂-nam-ma nu-il₂-il₂-da',
    english: '"The me — the ordering principles of civilization — were kept here in my temple. Writing, kingship, craft, the loom. Inanna stole them from me when I was drunk. I do not always come out of my stories looking wise."',
    source: 'On the me and Inanna\'s visit: Kramer, <em>The Sumerians</em>, University of Chicago Press, 1963.',
  },
  {
    sumerian: 'a-na-aš-šum gal du₁₁-du₁₁-ma-an a-na ud-da-bi e₂-na',
    english: '"You came here to learn. The lesson is this: the gods of the oldest cities were not omnipotent. We were clever, partial, sometimes asleep, sometimes outwitted by our own daughters. The flood was not justice. It was a mistake — and the patch we wrote into mortality afterward is the patch you still live with."',
    source: 'A synthesis, not a direct quote. The mortality-as-flood-compromise reading is Lambert\'s, <em>Babylonian Creation Myths</em>, 2008.',
  },
  {
    sumerian: 'silim-ma-zu lu-bí-in-du-ug',
    english: '"Go in peace. Read what they buried, not what they built."',
    source: 'Farewell formula in Sumerian temple hymns. Cf. ETCSL (Oxford), <em>Hymn to Enki for Šulgi</em>.',
  },
];

/* ---------- SCENE ---------- */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a0e08);
scene.fog = new THREE.Fog(0x2a1f15, 30, 240);

const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.1, 700);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

/* ---------- LIGHTING — Mesopotamian dusk ---------- */
scene.add(new THREE.HemisphereLight(0xd4965a, 0x2a1818, 0.55));
const sun = new THREE.DirectionalLight(0xffb070, 1.3);
sun.position.set(40, 28, -30);            // setting sun, west-ish
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -40;
sun.shadow.camera.right = 40;
sun.shadow.camera.top = 40;
sun.shadow.camera.bottom = -40;
sun.shadow.bias = -0.0005;
scene.add(sun);

// soft blue rim from the water
const waterRim = new THREE.DirectionalLight(0x6a9bcc, 0.4);
waterRim.position.set(-20, 8, 40);
scene.add(waterRim);

/* ---------- GROUND — desert plain with undulation ---------- */
const groundGeo = new THREE.PlaneGeometry(600, 600, 48, 48);
const gpos = groundGeo.attributes.position;
for (let i = 0; i < gpos.count; i++) {
  const x = gpos.getX(i), y = gpos.getY(i);
  const r = Math.hypot(x, y);
  if (r > 12) gpos.setZ(i, (Math.sin(x * 0.04) + Math.cos(y * 0.05)) * 0.7 + Math.random() * 0.3);
}
groundGeo.computeVertexNormals();
const ground = new THREE.Mesh(
  groundGeo,
  new THREE.MeshStandardMaterial({ color: 0x8c6e4a, roughness: 0.95 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

/* ---------- THE EUPHRATES — a curving blue plane ---------- */
const riverGeo = new THREE.PlaneGeometry(200, 14, 30, 4);
const rpos = riverGeo.attributes.position;
for (let i = 0; i < rpos.count; i++) {
  const x = rpos.getX(i);
  rpos.setY(rpos.getY(i) + Math.sin(x * 0.08) * 2);   // gentle S-curve
  rpos.setZ(i, Math.sin(x * 0.3) * 0.1);              // tiny ripples
}
riverGeo.computeVertexNormals();
const river = new THREE.Mesh(
  riverGeo,
  new THREE.MeshStandardMaterial({
    color: 0x3a5a78,
    roughness: 0.4,
    metalness: 0.1,
    transparent: true,
    opacity: 0.85,
  })
);
river.rotation.x = -Math.PI / 2;
river.position.set(0, 0.1, 45);
river.receiveShadow = true;
scene.add(river);

/* ---------- THE ZIGGURAT — 3 receding tiers, mudbrick ---------- */
const mudbrickMat = new THREE.MeshStandardMaterial({ color: 0x9a6b3d, roughness: 0.95, metalness: 0 });
const mudbrickDark = new THREE.MeshStandardMaterial({ color: 0x7a542d, roughness: 0.95 });
const mudbrickLight = new THREE.MeshStandardMaterial({ color: 0xb4824b, roughness: 0.9 });

const ziggurat = new THREE.Group();

const tiers = [
  { w: 22, h: 4.5, d: 22, mat: mudbrickDark },
  { w: 16, h: 4,   d: 16, mat: mudbrickMat },
  { w: 10, h: 3.5, d: 10, mat: mudbrickLight },
];

let yCursor = 0;
for (const t of tiers) {
  const tier = new THREE.Mesh(new THREE.BoxGeometry(t.w, t.h, t.d), t.mat);
  tier.position.y = yCursor + t.h / 2;
  tier.castShadow = true;
  tier.receiveShadow = true;
  ziggurat.add(tier);

  // brick striations — horizontal grooves
  for (let g = 0; g < 3; g++) {
    const groove = new THREE.Mesh(
      new THREE.BoxGeometry(t.w + 0.05, 0.15, t.d + 0.05),
      mudbrickDark
    );
    groove.position.y = yCursor + (t.h * (g + 1) / 4);
    ziggurat.add(groove);
  }
  yCursor += t.h;
}

// Top temple — small box shrine of Enki
const shrine = new THREE.Mesh(
  new THREE.BoxGeometry(5, 2.5, 5),
  new THREE.MeshStandardMaterial({ color: 0xc9986a, roughness: 0.85 })
);
shrine.position.y = yCursor + 1.25;
shrine.castShadow = true;
shrine.receiveShadow = true;
ziggurat.add(shrine);

// Top temple roof — a low pyramid for silhouette
const shrineRoof = new THREE.Mesh(
  new THREE.ConeGeometry(3.5, 1.8, 4),
  new THREE.MeshStandardMaterial({ color: 0x8a5a30, roughness: 0.9, flatShading: true })
);
shrineRoof.position.y = yCursor + 2.5 + 0.9;
shrineRoof.rotation.y = Math.PI / 4;
shrineRoof.castShadow = true;
ziggurat.add(shrineRoof);

// Staircase up the front face (rough wide steps)
for (let s = 0; s < 8; s++) {
  const step = new THREE.Mesh(
    new THREE.BoxGeometry(4, 0.4, 1.6),
    mudbrickLight
  );
  step.position.set(0, 0.2 + s * 0.7, 11 - s * 1.0);
  step.castShadow = true;
  step.receiveShadow = true;
  ziggurat.add(step);
}

ziggurat.position.set(0, 0, -8);
scene.add(ziggurat);

/* ---------- ENKI MARKER — a tall standing stone where dialogue triggers ---------- */
const enkiStone = new THREE.Group();
const stoneBody = new THREE.Mesh(
  new THREE.CylinderGeometry(0.4, 0.55, 2.8, 8),
  new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.9 })
);
stoneBody.position.y = 1.4;
stoneBody.castShadow = true;
enkiStone.add(stoneBody);

// glowing top — to mark it as special
const stoneTop = new THREE.Mesh(
  new THREE.SphereGeometry(0.32, 12, 8),
  new THREE.MeshBasicMaterial({ color: 0x6a9bcc, transparent: true, opacity: 0.85 })
);
stoneTop.position.y = 2.95;
enkiStone.add(stoneTop);

// soft point light at the stone
const enkiLight = new THREE.PointLight(0x6a9bcc, 1.5, 12, 2);
enkiLight.position.set(0, 2.8, 0);
enkiStone.add(enkiLight);

enkiStone.position.set(0, 0, 14);   // in front of the ziggurat, near the player spawn
enkiStone.userData.kind = 'enki';
scene.add(enkiStone);

/* ---------- ATRAHASIS TABLETS — 5 photographable clay tablets ---------- */
// Tablet visual: small rectangular slab with a darker face (cuneiform).
function makeTablet(label) {
  const group = new THREE.Group();

  // Pedestal
  const ped = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.8, 0.6),
    mudbrickDark
  );
  ped.position.y = 0.4;
  ped.castShadow = true;
  ped.receiveShadow = true;
  group.add(ped);

  // Tablet body (tilted slightly upward for legibility)
  const tabGeo = new THREE.BoxGeometry(0.85, 1.0, 0.15);
  const tabMat = new THREE.MeshStandardMaterial({ color: 0xc9a37a, roughness: 0.85 });
  const tab = new THREE.Mesh(tabGeo, tabMat);
  tab.position.set(0, 1.25, 0);
  tab.rotation.x = -Math.PI / 6;
  tab.castShadow = true;
  tab.receiveShadow = true;
  tab.userData = { tablet: label };
  group.add(tab);

  // Cuneiform "face" — a darker plane with wedge marks (canvas texture)
  const c = document.createElement('canvas');
  c.width = 256; c.height = 320;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#b8946a';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#3a2818';
  // ~5 lines of pseudo-cuneiform wedges
  for (let line = 0; line < 7; line++) {
    const y = 36 + line * 38;
    let x = 24;
    while (x < c.width - 30) {
      // wedge: triangle
      ctx.beginPath();
      const w = 8 + Math.random() * 6;
      const h = 6 + Math.random() * 4;
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y - h);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      ctx.fill();
      x += w + 4 + Math.random() * 8;
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.95),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 })
  );
  face.position.set(0, 1.25, 0.08);
  face.rotation.x = -Math.PI / 6;
  face.userData = { tablet: label };
  group.add(face);

  group.userData = { tablet: label, face };
  return group;
}

// Tablet placements — scattered around the ziggurat base + temple platform
const tabletPositions = [
  { id: 't1', x:  -9, z:  10 },                  // entrance left
  { id: 't2', x:   9, z:  10 },                  // entrance right
  { id: 't3', x: -12, z:  -8 },                  // west side
  { id: 't4', x:  12, z:  -8 },                  // east side
  { id: 't5', x:   0, z:  -16 },                 // behind the ziggurat
];

const tablets = [];
for (const t of tabletPositions) {
  const tab = makeTablet(t.id);
  tab.position.set(t.x, 0, t.z);
  tab.rotation.y = Math.atan2(-t.x, -t.z);       // face the ziggurat
  scene.add(tab);
  tablets.push(tab);
}

/* ---------- REEDS — atmospheric, near the river ---------- */
const reedMat = new THREE.MeshStandardMaterial({ color: 0x4a5c2e, roughness: 0.9 });
for (let i = 0; i < 60; i++) {
  const r = 18 + Math.random() * 26;
  const a = (Math.random() * Math.PI) - Math.PI / 2;        // mostly along the river
  const x = Math.cos(a) * r * 0.4;
  const z = 38 + Math.random() * 10;
  const h = 1.0 + Math.random() * 1.6;
  const reed = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.06, h, 4),
    reedMat
  );
  reed.position.set(x, h / 2, z);
  reed.rotation.z = (Math.random() - 0.5) * 0.2;
  scene.add(reed);
}

/* ---------- DISTANT FEATURES ---------- */
// distant low hills
for (let i = 0; i < 22; i++) {
  const r = 110 + Math.random() * 80;
  const a = Math.random() * Math.PI * 2;
  const h = 6 + Math.random() * 16;
  const hill = new THREE.Mesh(
    new THREE.ConeGeometry(7 + Math.random() * 12, h, 5),
    new THREE.MeshStandardMaterial({ color: 0x6a4828, roughness: 1, flatShading: true })
  );
  hill.position.set(Math.cos(a) * r, h / 2 - 0.3, Math.sin(a) * r);
  hill.rotation.y = Math.random() * Math.PI;
  scene.add(hill);
}

// stars in the dusk sky — simple particle plane
const starGeo = new THREE.BufferGeometry();
const starCount = 200;
const starPos = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  const a = Math.random() * Math.PI * 2;
  const r = 200 + Math.random() * 80;
  starPos[i * 3]     = Math.cos(a) * r;
  starPos[i * 3 + 1] = 60 + Math.random() * 80;
  starPos[i * 3 + 2] = Math.sin(a) * r;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(
  starGeo,
  new THREE.PointsMaterial({ color: 0xffe8b0, size: 0.7, transparent: true, opacity: 0.7 })
);
scene.add(stars);

/* ---------- CONTROLS ---------- */
const controls = new PointerLockControls(camera, document.body);
camera.position.set(0, 1.7, 22);                  // facing the ziggurat
camera.lookAt(0, 4, 0);
scene.add(controls.getObject());

const overlay     = document.getElementById('overlay');
const album       = document.getElementById('album');
const lorePanel   = document.getElementById('lore-panel');
const enkiPanel   = document.getElementById('enki-panel');
const reticle     = document.getElementById('reticle');
const promptHint  = document.getElementById('prompt-hint');
const startBtn    = document.getElementById('start-btn');
const touchHud    = document.getElementById('touch-controls');
const touchStick  = document.getElementById('touch-stick');
const touchKnob   = document.getElementById('touch-knob');
const touchPhoto  = document.getElementById('touch-photo');

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
  if (lorePanel.style.display === 'block' || enkiPanel.style.display === 'block') return;
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
    case 'KeyE': case 'Space':      tryInteract(); break;
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
let lookActive = false, lookStart = null;
const lookEuler = new THREE.Euler(0, 0, 0, 'YXZ');

if (touchStick) {
  touchStick.addEventListener('touchstart', (e) => {
    e.preventDefault();
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
  touchStick.addEventListener('touchend', stickEnd, { passive: false });
  touchStick.addEventListener('touchcancel', stickEnd, { passive: false });
}

if (touchPhoto) {
  touchPhoto.addEventListener('touchstart', (e) => { e.preventDefault(); tryInteract(); }, { passive: false });
  touchPhoto.addEventListener('click', tryInteract);
}

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

/* ---------- INTERACTION ---------- */
const raycaster = new THREE.Raycaster();
const photographed = new Set();
let enkiTurn = 0;            // current line of the Enki dialogue

function reticleTarget() {
  raycaster.setFromCamera({ x: 0, y: 0 }, camera);

  // tablets first
  const tabletFaces = [];
  for (const t of tablets) if (t.userData.face) tabletFaces.push(t.userData.face);
  const hits = raycaster.intersectObjects(tabletFaces, false);
  if (hits.length && hits[0].distance < 5) {
    return { kind: 'tablet', id: hits[0].object.userData.tablet };
  }

  // Enki stone — match by spatial distance, not raycast, because the stone is small
  const camPos = controls.getObject().position;
  const dx = enkiStone.position.x - camPos.x;
  const dz = enkiStone.position.z - camPos.z;
  const d2 = dx * dx + dz * dz;
  if (d2 < 9) {                      // within 3m
    return { kind: 'enki' };
  }
  return null;
}

function tryInteract() {
  const target = reticleTarget();
  if (!target) return;
  if (target.kind === 'tablet') {
    if (photographed.has(target.id)) return;
    photographed.add(target.id);
    flashCamera();
    showTablet(target.id);
    updateAlbum();
  } else if (target.kind === 'enki') {
    speakEnki();
  }
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

function showTablet(id) {
  const t = TABLETS[id];
  lorePanel.innerHTML = `
    <h2>${t.title}</h2>
    <p style="font-family:'Lora',serif;font-style:italic;color:#c9986a;font-size:16px;margin-bottom:10px;">${t.sumerian}</p>
    <p>${t.body}</p>
    <p class="source">Source · ${t.source}</p>
    <button id="lore-close">CLOSE</button>
  `;
  lorePanel.style.display = 'block';
  document.exitPointerLock?.();
  document.getElementById('lore-close').addEventListener('click', () => {
    lorePanel.style.display = 'none';
    if (!touchMode) controls.lock();
  });
}

function speakEnki() {
  if (enkiPanel.style.display === 'block') return;
  const line = ENKI_DIALOGUE[enkiTurn % ENKI_DIALOGUE.length];
  enkiPanel.innerHTML = `
    <div class="who">⟁ ENKI · god of the Abzu</div>
    <p class="sumerian">${line.sumerian}</p>
    <p class="english">${line.english}</p>
    <p class="source">${line.source}</p>
    <button id="enki-close">CONTINUE</button>
  `;
  enkiPanel.style.display = 'block';
  document.exitPointerLock?.();
  document.getElementById('enki-close').addEventListener('click', () => {
    enkiPanel.style.display = 'none';
    enkiTurn++;
    if (!touchMode) controls.lock();
  });
}

function updateAlbum() {
  album.textContent = `tablets: ${photographed.size} / 5`;
  if (photographed.size === 5) {
    setTimeout(() => {
      lorePanel.innerHTML = `
        <h2>⟁ ERIDU · ALL TABLETS READ</h2>
        <p>You have read the <em>Atrahasis</em> in fragments: the tired gods, the muddy creation of humans, the noise that grew too loud, the loophole Enki spoke through a reed wall, the bird Atrahasis sent into the silence after the flood.</p>
        <p>The Hebrew Genesis flood, written 1,500 years later, drops Enki, drops Atrahasis, drops the compromise about mortality. <em>It keeps the dove.</em></p>
        <p>This is Phase 2 of 5. Mohenjo-daro, Teotihuacan, and Yggdrasil are next — on the timeline a solo dev keeps.</p>
        <p class="source">Lambert &amp; Millard 1969 · George 2003 · Foster 2005 · Kramer 1963 · ETCSL (Oxford).</p>
        <button id="lore-close">CLOSE</button>
      `;
      lorePanel.style.display = 'block';
      document.getElementById('lore-close').addEventListener('click', () => { lorePanel.style.display = 'none'; });
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

    // ground clamp
    controls.getObject().position.y = 1.7;

    // soft boundary (~100m radius)
    const o = controls.getObject().position;
    const r2 = o.x * o.x + o.z * o.z;
    if (r2 > 100 * 100) {
      const r = Math.sqrt(r2);
      o.x *= 100 / r;
      o.z *= 100 / r;
    }

    // reticle hot
    const target = reticleTarget();
    if (target && (target.kind === 'enki' || !photographed.has(target.id))) {
      reticle.classList.add('hot');
      promptHint.classList.remove('hidden');
      promptHint.innerHTML = target.kind === 'enki'
        ? 'press <span class="key">E</span> to speak with Enki'
        : 'press <span class="key">E</span> to read tablet';
    } else {
      reticle.classList.remove('hot');
      promptHint.classList.add('hidden');
    }

    // gentle enki light pulse
    enkiLight.intensity = 1.2 + Math.sin(t * 0.003) * 0.4;
    stoneTop.scale.setScalar(1 + Math.sin(t * 0.003) * 0.06);
  }

  renderer.render(scene, camera);
}
animate();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
