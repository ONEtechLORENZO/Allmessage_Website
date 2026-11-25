// Small floating cluster of 3D boxes for the "Capabilities & evidence" block.
// Same boxes, materials and light as the hero tile wall (hero/tileWall.ts), but free-standing on a
// transparent background. Motion never stops: a soft wave runs across the boxes, the dots on the
// dotted tile ripple, and the whole cluster sways a little so the sides catch the light.
import * as THREE from "three";

const PI = Math.PI;

// Rounded, bevelled box with its top face at z=0 (same shape as the hero blocks).
function rbox(w: number, h: number, d: number, r: number, rc: number) {
  const s = new THREE.Shape(), iw = w - 2 * r, ih = h - 2 * r, x = -iw / 2, y = -ih / 2;
  rc = Math.min(rc, iw / 2, ih / 2);
  s.moveTo(x + rc, y); s.lineTo(x + iw - rc, y); s.quadraticCurveTo(x + iw, y, x + iw, y + rc);
  s.lineTo(x + iw, y + ih - rc); s.quadraticCurveTo(x + iw, y + ih, x + iw - rc, y + ih);
  s.lineTo(x + rc, y + ih); s.quadraticCurveTo(x, y + ih, x, y + ih - rc);
  s.lineTo(x, y + rc); s.quadraticCurveTo(x, y, x + rc, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * r, bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 4, curveSegments: 4 });
  g.translate(0, 0, -(d - r)); g.computeVertexNormals();
  return g;
}

// Boxes on a grid of 1-unit cells, as in the reference picture: col, row (top-left), w, h, colour, height.
// D = teal tile with white dots.
const B: [number, number, number, number, "T" | "W" | "D", number][] = [
  [2, 0, 1, 1, "T", 0.5], [3, 0, 1, 1, "T", 0.7],
  [1, 1, 1, 1, "T", 0.35], [2, 1, 1, 1, "T", 0.45], [3, 1, 1, 1, "T", 0.55],
  [4, 2, 1, 1, "T", 0.6],
  [3, 3, 1, 1, "T", 0.5], [4, 3, 1, 1, "W", 0.08], [5, 3, 1, 1, "W", 0.45],
  [0, 4.1, 0.7, 0.7, "W", 0.22], [1.85, 4, 1.15, 1, "W", 0.4], [3, 4, 1, 1, "T", 0.35], [4, 4, 1, 1, "T", 0.3], [5, 4, 1, 1, "W", 0.55], [6, 4, 1, 1, "W", 0.35],
  [3, 4, 0.38, 0.38, "W", 0.62],
  [2.55, 5, 0.45, 0.45, "W", 0.2], [3, 5, 1, 1, "T", 0.42], [4, 5, 1, 1, "T", 0.5], [5, 5, 1, 1, "D", 0.32],
  [4.1, 6, 0.7, 0.7, "W", 0.28],
];
const CX = 3.5, CY = 3.4; // centre of the cluster, in cells

export type BoxCluster = { dispose(): void };

/** motion: "wave" = a soft wave runs across the boxes; "rubik" = whole rows and columns slide one
 *  cell and back, like turning a Rubik's cube. */
export function createBoxCluster(vp: HTMLElement, motion: "wave" | "rubik" = "wave"): BoxCluster {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.setAttribute("aria-hidden", "true");
  Object.assign(renderer.domElement.style, { display: "block", position: "absolute", inset: "0", width: "100%", height: "100%" });
  vp.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  camera.position.set(0, 0, 20); camera.lookAt(0, 0, 0);

  // same light as the hero
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9fb4b4, 0.72 * PI));
  scene.add(new THREE.AmbientLight(0xffffff, 0.06 * PI));
  const sun = new THREE.DirectionalLight(0xffffff, 0.52 * PI);
  sun.position.set(7, 6, 10); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 40 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.015; sun.shadow.radius = 4;
  scene.add(sun);

  const mats = {
    W: new THREE.MeshStandardMaterial({ color: "#f1f3f3", roughness: 0.62, metalness: 0 }),
    T: new THREE.MeshStandardMaterial({ color: "#0bd0c9", roughness: 0.5, metalness: 0 }),
    dot: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.5 }),
    floor: new THREE.ShadowMaterial({ color: 0x244f55, opacity: 0.16 }), // only the soft shadow shows on the page
  };
  const geometries: THREE.BufferGeometry[] = [];

  const group = new THREE.Group(); scene.add(group);
  const floorGeo = new THREE.PlaneGeometry(30, 30); geometries.push(floorGeo);
  const floor = new THREE.Mesh(floorGeo, mats.floor); floor.position.z = -0.3; floor.receiveShadow = true; group.add(floor);

  type Blk = { m: THREE.Mesh; x: number; y: number; hw: number; hh: number; h: number; delay: number; ph: number; col: number; row: number; ox: number; oy: number; lift: number };
  const blocks: Blk[] = [];
  let dotTile: { x: number; y: number } | null = null;
  B.forEach(([c, r, w, h, kind, height], i) => {
    const x = c + w / 2 - CX, y = CY - (r + h / 2);
    const g = rbox(w - 0.035, h - 0.035, 1.6, 0.025, 0.03); geometries.push(g);
    const m = new THREE.Mesh(g, kind === "W" ? mats.W : mats.T);
    m.castShadow = m.receiveShadow = true; group.add(m);
    blocks.push({ m, x, y, hw: w / 2, hh: h / 2, h: height, delay: 0.1 + (x - y + 8) * 0.07, ph: i * 1.7, col: Math.floor(c + w / 2), row: Math.floor(r + h / 2), ox: 0, oy: 0, lift: 0 });
    if (kind === "D") dotTile = { x, y };
  });

  // white dot "pixels" on the dotted tile
  const dots: { x: number; y: number; k: number }[] = [];
  if (dotTile) {
    const t: { x: number; y: number } = dotTile;
    for (let j = 0; j < 7; j++) for (let i = 0; i < 7; i++) dots.push({ x: t.x - 0.36 + i * 0.12, y: t.y + 0.36 - j * 0.12, k: i + j });
  }
  const dotGeo = new THREE.BoxGeometry(1, 1, 1); dotGeo.translate(0, 0, -0.5); geometries.push(dotGeo);
  const dotMesh = new THREE.InstancedMesh(dotGeo, mats.dot, Math.max(1, dots.length)); dotMesh.castShadow = true; group.add(dotMesh);

  function fit() {
    const w = vp.clientWidth, h = vp.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    const half = 4.4, a = w / h; // keep the whole cluster in view at any box shape
    const hw = a >= 1 ? half * a : half, hh = a >= 1 ? half : half / a;
    Object.assign(camera, { left: -hw, right: hw, top: hh, bottom: -hh });
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(() => { fit(); if (reduce) frame(); }); ro.observe(vp); fit();

  const t0 = performance.now(), clock = () => (performance.now() - t0) / 1000;
  const easeBack = (p: number) => { const c1 = 0.7, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
  const smooth = (p: number) => p * p * (3 - 2 * p);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), P = new THREE.Vector3();

  // soft wave travelling diagonally across the cluster, plus a slow individual bob
  const wave = (x: number, y: number, t: number) => {
    const d = x * 0.7 - y * 0.7 - ((t * 1.6) % 14) + 7;
    return 0.16 * Math.exp(-d * d / 1.6);
  };

  // Rubik moves: a column slides up (or a row sideways) by one cell, pauses, then slides back.
  type Move = { axis: "col" | "row"; dir: 1 | -1; start: number; members: Blk[] };
  const lines = (axis: "col" | "row") => {
    const by = new Map<number, Blk[]>();
    blocks.forEach((b) => { const k = b[axis]; by.set(k, [...(by.get(k) ?? []), b]); });
    return [...by.values()].filter((l) => l.length >= 2);
  };
  const cols = lines("col"), rows = lines("row");
  let move: Move | null = null, undo: Move | null = null, nextAt = 2.8, lastLine: Blk[] | null = null;
  // Space kept free at the edges for the sway and the lift.
  const MARGIN = 0.45;
  function fits(axis: "col" | "row", dir: 1 | -1, members: Blk[]) {
    return members.every((b) => {
      if (axis === "row") { const x = b.x + b.ox + dir; return Math.abs(x) + b.hw <= camera.right - MARGIN; }
      const y = b.y - b.oy - dir; return Math.abs(y) + b.hh <= camera.top - MARGIN;
    });
  }
  const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  function rubik(t: number) {
    if (!move && t >= nextAt) {
      if (undo) { move = { ...undo, start: t }; undo = null; }
      else {
        // Only moves that keep every box inside the picture (a row sliding past the edge got cut off).
        const options: { axis: "col" | "row"; dir: 1 | -1; members: Blk[]; w: number }[] = [];
        for (const [axis, pool, weight] of [["col", cols, 0.7], ["row", rows, 0.3]] as const)
          for (const members of pool) for (const dir of [1, -1] as const)
            if (members !== lastLine && fits(axis, dir, members)) options.push({ axis, dir, members, w: weight / pool.length });
        if (!options.length) { nextAt = t + 1; return; }
        let r = Math.random() * options.reduce((a, o) => a + o.w, 0), pick = options[0];
        for (const o of options) { r -= o.w; if (r <= 0) { pick = o; break; } }
        lastLine = pick.members;
        move = { axis: pick.axis, dir: pick.dir, start: t, members: pick.members };
      }
    }
    if (!move) return;
    const p = Math.min(1, (t - move.start) / 0.85), e = easeInOut(p), m = move;
    m.members.forEach((b) => {
      const base = (b as Blk & { b0?: [number, number] }).b0 ??= [b.ox, b.oy];
      if (m.axis === "col") b.oy = base[1] + m.dir * e; else b.ox = base[0] + m.dir * e;
      b.lift = 0.22 * Math.sin(Math.PI * p);
    });
    if (p >= 1) {
      m.members.forEach((b) => { delete (b as Blk & { b0?: [number, number] }).b0; b.lift = 0; });
      // first the move, then the same line slides back, so the shape always returns home
      if (m.members.every((b) => b.ox === 0 && b.oy === 0)) nextAt = t + 0.5;
      else { undo = { ...m, dir: m.dir === 1 ? -1 : 1 }; nextAt = t + 0.9; }
      move = null;
    }
  }

  let raf = 0, visible = false, started = -1;
  function frame(): void {
    const now = clock();
    if (started < 0) started = now;
    const t = reduce ? 0 : now - started;

    if (!reduce) { // gentle sway so the box sides catch the light
      group.rotation.y = Math.sin(t * 0.32) * 0.09;
      group.rotation.x = -0.05 + Math.sin(t * 0.23 + 1) * 0.06;
      group.position.y = Math.sin(t * 0.5) * 0.06;
    }

    if (motion === "rubik" && !reduce) rubik(t);

    blocks.forEach((b) => {
      const p = reduce ? 1 : Math.min(1, Math.max(0, (t - b.delay) / 1.5));
      const rise = p <= 0 ? 0 : easeBack(p);
      const w = motion === "wave" ? wave(b.x, b.y, t) : 0;
      const live = reduce ? 0 : (w + 0.035 * Math.sin(t * 0.9 + b.ph)) * smooth(Math.min(1, t / 3)) + b.lift;
      b.m.position.set(b.x + b.ox, b.y - b.oy, -0.5 + (b.h + 0.5) * rise + live);
    });

    if (dotTile) {
      const tile = blocks[B.findIndex((x) => x[4] === "D")], base = tile.m.position.z;
      dots.forEach((d, i) => {
        const p = reduce ? 1 : smooth(Math.min(1, Math.max(0, (t - 1.6 - i * 0.012) / 0.8)));
        const ripple = reduce ? 0 : 0.03 * (0.5 + 0.5 * Math.sin(t * 2.2 - d.k * 0.55));
        P.set(d.x + tile.ox, d.y - tile.oy, base + (0.015 + ripple) * p); S.set(0.045, 0.045, 0.06 * p + 0.001); M.compose(P, Q, S); dotMesh.setMatrixAt(i, M);
      });
      dotMesh.instanceMatrix.needsUpdate = true;
    }

    renderer.render(scene, camera);
    raf = visible && !reduce ? requestAnimationFrame(frame) : 0;
  }

  // render only while on screen; the entrance starts the first time it is seen
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(frame);
  }, { threshold: 0.15 });
  io.observe(vp);

  return {
    dispose() {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
      geometries.forEach((g) => g.dispose()); Object.values(mats).forEach((m) => m.dispose());
      dotMesh.dispose(); sun.shadow.dispose(); renderer.dispose(); renderer.domElement.remove();
    },
  };
}
