// 3D turquoise tile wall (three.js). Ported from "Blocchi Turchesi" (written for three r128) to current three.js:
// - colours: three now converts sRGB hex colours to linear itself, so no manual conversion
// - lights: physically based lighting is now always on, so legacy intensities are multiplied by PI
import * as THREE from "three";
import { TU, wallView } from "./layout";

const PI = Math.PI;

const PAL = {
  day: { white: "#f1f3f3", teal: "#0bd0c9", tileW: "#eceeee", tileT: "#09c8c1", grout: "#dde3e3", dot: "#ffffff", dotG: "#d2d9d9", emis: 0, hemi: 0.72, sun: 0.52, sky: 0xffffff, ground: 0x9fb4b4 },
  night: { white: "#1c3538", teal: "#12e6de", tileW: "#0f2427", tileT: "#0a3f42", grout: "#0a1b1d", dot: "#7ff7f1", dotG: "#2c6f6c", emis: 0.55, hemi: 0.42, sun: 0.62, sky: 0x9fe8e6, ground: 0x0b1b1d },
};
type Palette = (typeof PAL)["day"];

// Rounded, bevelled box with its top face at z=0.
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

// Layout in reference-image pixels (1456×819) → world units.
const X = (x: number) => (x - 728) / TU, Y = (y: number) => (409.5 - y) / TU;
const isTeal = (cx: number, cy: number) => cy >= 578 || (cy >= 478 && cy < 578 && ((cx >= 200 && cx < 410) || cx >= 805));
const B: [number, number, number, number, "W" | "T", number][] = [ // x, y, w, h, colour, depth(px)
  [0, 178, 100, 100, "T", 14], [100, 80, 100, 98, "T", 30], [200, 78, 102, 100, "T", 36], [100, 178, 100, 100, "T", 20], [200, 178, 102, 100, "T", 26],
  [302, 278, 106, 100, "T", 36], [200, 378, 102, 98, "T", 26],
  [90, 478, 110, 100, "W", 34], [198, 478, 36, 32, "W", 14], [162, 578, 38, 34, "W", 14],
  [410, 378, 104, 100, "W", 26], [410, 478, 104, 100, "W", 36], [512, 478, 103, 100, "W", 24], [512, 578, 103, 102, "W", 32], [615, 578, 90, 102, "W", 26],
  [512, 680, 40, 38, "W", 14], [553, 680, 38, 38, "W", 14], [295, 672, 108, 105, "W", 36], [360, 637, 40, 38, "W", 16],
  [1005, 478, 160, 100, "W", 34], [963, 538, 42, 40, "W", 16], [1165, 538, 40, 38, "W", 16], [1165, 578, 40, 35, "W", 14], [1210, 642, 42, 40, "W", 16],
  [1312, 178, 104, 100, "W", 36], [1265, 178, 46, 42, "T", 16], [1312, 282, 46, 42, "T", 14],
];

export type TileWall = { play(): void; setNight(night: boolean): void; dispose(): void };

/** onIntroDone fires once the blocks have finished rising (after every play()). */
export function createTileWall(vp: HTMLElement, onIntroDone?: () => void): TileWall {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = vp.clientWidth < 900;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); // sharper adds little but costs a lot on slower PCs
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap; // PCFSoftShadowMap was removed; PCF + radius gives the soft edge
  renderer.domElement.setAttribute("aria-hidden", "true");
  Object.assign(renderer.domElement.style, { display: "block", position: "absolute", inset: "0", width: "100%", height: "100%" });
  vp.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x9fb4b4, 0.72 * PI); scene.add(hemi);
  scene.add(new THREE.AmbientLight(0xffffff, 0.06 * PI));
  const sun = new THREE.DirectionalLight(0xffffff, 0.52 * PI);
  sun.position.set(7, 6, 10); sun.castShadow = true;
  const shadowSize = small ? 1024 : 2048; // soft shadows hide the lower resolution; much lighter on slower PCs
  sun.shadow.mapSize.set(shadowSize, shadowSize);
  Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 8, bottom: -8, near: 1, far: 40 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.015; sun.shadow.radius = 4;
  scene.add(sun);

  const mats = {
    W: new THREE.MeshStandardMaterial({ color: PAL.day.white, roughness: 0.62, metalness: 0 }),
    T: new THREE.MeshStandardMaterial({ color: PAL.day.teal, roughness: 0.5, metalness: 0, emissive: PAL.day.teal, emissiveIntensity: 0 }),
    tile: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.75, metalness: 0 }),
    dot: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, emissive: 0xffffff, emissiveIntensity: 0 }),
    back: new THREE.MeshStandardMaterial({ color: PAL.day.grout, roughness: 1 }),
  };
  const geometries: THREE.BufferGeometry[] = [];

  // Backplate (grout between tiles)
  const backGeo = new THREE.PlaneGeometry(40, 24); geometries.push(backGeo);
  const back = new THREE.Mesh(backGeo, mats.back); back.position.z = -0.25; back.receiveShadow = true; scene.add(back);

  // Blocks
  const hidden = new Set<string>();
  const blocks: { m: THREE.Mesh; cx: number; cy: number; rise: number; start: number; ord: number; delay: number }[] = [];
  for (const [x, y, w, h, c, d] of B) {
    const big = w >= 85 && h >= 85;
    const cx = X(x + w / 2), cy = Y(y + h / 2);
    if (big) hidden.add(`${Math.round((x + w / 2 - 50.3) / TU)},${Math.round((y + h / 2 - 28) / 100)}`);
    const g = rbox(w / TU + 0.004, h / TU + 0.004, 1.6, 0.014, 0.012); geometries.push(g);
    const m = new THREE.Mesh(g, mats[c]);
    m.position.set(cx, cy, 0); m.castShadow = m.receiveShadow = true; scene.add(m);
    const rise = d * 0.0125;
    blocks.push({ m, cx, cy, rise, start: big ? 0 : -(rise + 0.04), ord: x / 1456 + (y / 819) * 0.45, delay: 0 });
  }
  blocks.sort((a, b) => a.ord - b.ord).forEach((b, i) => (b.delay = 0.15 + i * 0.04));

  // Wall tiles (instanced). The grid runs well past the original artwork so full-width
  // and tall screens see more wall instead of empty edges.
  const tiles: { x: number; y: number; teal: boolean; z: number }[] = [];
  for (let j = -6; j <= 15; j++) for (let i = -12; i <= 27; i++) {
    if (hidden.has(`${i},${j}`)) continue;
    const cx = 50.3 + i * TU, cy = 28 + j * 100;
    tiles.push({ x: X(cx), y: Y(cy), teal: isTeal(cx, cy), z: 0 });
  }
  const tileGeo = rbox(0.994, (0.994 * 100) / TU, 0.5, 0.006, 0.006); geometries.push(tileGeo);
  const tileMesh = new THREE.InstancedMesh(tileGeo, mats.tile, tiles.length);
  tileMesh.castShadow = tileMesh.receiveShadow = true; scene.add(tileMesh);

  // Dot "pixels" (instanced tiny cubes)
  const dots: { x: number; y: number; s: number; gray: boolean; soft?: boolean; tiny?: boolean; delay: number }[] = [];
  const cluster = (x0: number, y0: number, gap: number, size: number, pat: string[], gray: boolean) =>
    pat.forEach((row, j) => [...row].forEach((ch, i) => {
      if (ch === ".") return;
      dots.push({ x: X(x0 + i * gap + size / 2), y: Y(y0 + j * gap + size / 2), s: size / TU, gray, soft: ch === "o", delay: 0 });
    }));
  cluster(122, 660, 27, 10, ["....x.x.x", "x...o.x.x", "x.x.x.o.x", "x.x.x...x", "....x....", "x.x.x.x.x"], false);
  cluster(1158, 340, 24, 9, ["....x.x.x", "..x.x.x..", "x.x..o.x.", "x.o.x.x.x", "..x.x.x.x", "....x.x.x"], true);
  for (let j = 0; j < 9; j++) for (let i = 0; i < 10; i++) dots.push({ x: X(414 + i * 10), y: Y(583 + j * 10), s: 3 / TU, gray: false, tiny: true, delay: 0 });
  dots.forEach((d, i) => (d.delay = 0.6 + ((i * 0.137) % 0.9)));
  const dotGeo = new THREE.BoxGeometry(1, 1, 1); dotGeo.translate(0, 0, -0.5); geometries.push(dotGeo);
  const dotMesh = new THREE.InstancedMesh(dotGeo, mats.dot, dots.length); dotMesh.castShadow = true; scene.add(dotMesh);

  // Colours per palette (+ the glow colours used under the cursor)
  const baseCol: THREE.Color[] = [];
  let glowW = new THREE.Color("#8ff0ea"), glowT = new THREE.Color("#e9fffd");
  const tmpCol = new THREE.Color();
  let tinted = false;
  const col = (h: string) => new THREE.Color(h);
  const linHex = (n: number) => new THREE.Color().setHex(n, THREE.LinearSRGBColorSpace); // r128 treated these as linear
  function applyPalette(p: Palette) {
    mats.W.color.copy(col(p.white)); mats.T.color.copy(col(p.teal)); mats.T.emissive.copy(col(p.teal)); mats.T.emissiveIntensity = p.emis;
    mats.back.color.copy(col(p.grout));
    mats.dot.emissive.copy(col(p.dot)); mats.dot.emissiveIntensity = p.emis * 0.8;
    hemi.intensity = p.hemi * PI; hemi.color.copy(linHex(p.sky)); hemi.groundColor.copy(linHex(p.ground)); sun.intensity = p.sun * PI;
    const cw = col(p.tileW), ct = col(p.tileT);
    tiles.forEach((t, i) => { const c = t.teal ? ct : cw; baseCol[i] = c; tileMesh.setColorAt(i, c); }); tileMesh.instanceColor!.needsUpdate = true;
    glowW = col(p === PAL.night ? "#1f7f7b" : "#8ff0ea"); glowT = col(p === PAL.night ? "#5ff5ee" : "#e9fffd");
    const d1 = col(p.dot), d2 = col(p.dotG);
    dots.forEach((d, i) => dotMesh.setColorAt(i, d.gray ? d2 : d1)); dotMesh.instanceColor!.needsUpdate = true;
  }
  applyPalette(PAL.day);

  // Camera: frontal and centred; the box is always filled with wall (see layout.ts)
  function fit() {
    const w = vp.clientWidth, h = vp.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    const { hw, hh } = wallView(w, h);
    Object.assign(camera, { left: -hw, right: hw, top: hh, bottom: -hh });
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(fit); ro.observe(vp); fit();

  // Interaction: cursor lifts tiles, click sends a wave
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3(), ndc = new THREE.Vector2();
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, on: 0, ton: 0 };
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 }; // cursor position on the hero, -1..1: the wall leans gently toward it
  const waves: { x: number; y: number; t: number }[] = [];
  const trail: { x: number; y: number; t: number }[] = []; // recent cursor positions: a soft wake follows the cursor
  const t0 = performance.now(); const clock = () => (performance.now() - t0) / 1000;
  const isUi = (e: Event) => (e.target as Element | null)?.closest?.("[data-wall-ui]");
  function toWorld(e: PointerEvent) {
    const r = vp.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera); return ray.ray.intersectPlane(plane, hit);
  }
  const onMove = (e: PointerEvent) => {
    if (isUi(e)) return;
    const r = vp.getBoundingClientRect();
    tilt.tx = ((e.clientX - r.left) / r.width) * 2 - 1; tilt.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
    if (!toWorld(e)) return;
    pointer.tx = hit.x; pointer.ty = hit.y; pointer.ton = 1;
    const last = trail[trail.length - 1];
    if (!last || Math.hypot(hit.x - last.x, hit.y - last.y) > 0.3) { trail.push({ x: hit.x, y: hit.y, t: clock() }); if (trail.length > 48) trail.shift(); }
  };
  const onLeave = () => { pointer.ton = 0; tilt.tx = 0; tilt.ty = 0; };
  const onDown = (e: PointerEvent) => { if (isUi(e)) return; if (toWorld(e)) waves.push({ x: hit.x, y: hit.y, t: clock() }); };
  vp.addEventListener("pointermove", onMove); vp.addEventListener("pointerleave", onLeave); vp.addEventListener("pointerdown", onDown);

  // Animation
  let start = 0;
  const easeBack = (p: number) => { const c1 = 0.7, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
  const smooth = (p: number) => p * p * (3 - 2 * p);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), P = new THREE.Vector3();
  function field(x: number, y: number, t: number) {
    let h = 0;
    if (!reduce) {
      const dx = x - pointer.x, dy = y - pointer.y, d2 = dx * dx + dy * dy;
      h += pointer.on * (0.3 * Math.exp(-d2 / 1.6) - 0.05 * Math.exp(-((Math.sqrt(d2) - 2.2) ** 2) / 0.5)); // hill with a small dip around it
      for (const p of trail) { const a = t - p.t; if (a < 1.4) { const ex = x - p.x, ey = y - p.y; h += 0.11 * (1 - a / 1.4) * Math.exp(-(ex * ex + ey * ey) / 0.7); } }
      for (const w of waves) { const a = t - w.t, dd = Math.hypot(x - w.x, y - w.y) - a * 7; h += 0.34 * Math.exp((-dd * dd) / 0.45) * Math.max(0, 1 - a / 2.4); }
      const ia = t - start - 2.1; // soft diagonal "breath" every 4s
      if (ia > 0) { const ph = (ia % 4) * 7 - 9, dd = x * 0.8 - y * 0.6 - ph; h += 0.035 * Math.exp((-dd * dd) / 1.2); }
    }
    return h;
  }

  let raf = 0, visible = true;
  function frame() {
    const t = clock(), lt = t - start;
    for (let i = waves.length - 1; i >= 0; i--) if (t - waves[i].t > 2.4) waves.splice(i, 1);
    while (trail.length && t - trail[0].t > 1.4) trail.shift();
    pointer.x += (pointer.tx - pointer.x) * 0.12; pointer.y += (pointer.ty - pointer.y) * 0.12; pointer.on += (pointer.ton - pointer.on) * 0.06;

    const ci = reduce ? 1 : smooth(Math.min(1, lt / 1.6)); // gentle frontal dolly-in
    tilt.x += (tilt.tx - tilt.x) * 0.05; tilt.y += (tilt.ty - tilt.y) * 0.05;
    if (reduce) camera.position.set(0, 0, 20); else camera.position.set(-tilt.x * 1.1, tilt.y * 0.8, 20);
    camera.lookAt(0, 0, 0);
    const z = 1.07 - 0.07 * ci; if (Math.abs(camera.zoom - z) > 1e-5) { camera.zoom = z; camera.updateProjectionMatrix(); }

    const glowing = !reduce && (pointer.on > 0.01 || trail.length > 0);
    tiles.forEach((tl, i) => {
      tl.z += (field(tl.x, tl.y, t) - tl.z) * 0.18;
      if (glowing) {
        const k = Math.min(0.7, Math.max(0, tl.z) * 2.2);
        tileMesh.setColorAt(i, tmpCol.copy(baseCol[i]).lerp(tl.teal ? glowT : glowW, k));
      }
      P.set(tl.x, tl.y, tl.z); S.set(1, 1, 1); M.compose(P, Q, S); tileMesh.setMatrixAt(i, M);
    });
    tileMesh.instanceMatrix.needsUpdate = true;
    if (glowing || tinted) {
      if (!glowing) tiles.forEach((_, i) => tileMesh.setColorAt(i, baseCol[i])); // back to plain colours
      tileMesh.instanceColor!.needsUpdate = true; tinted = glowing;
    }

    blocks.forEach((b) => {
      const p = reduce ? 1 : Math.min(1, Math.max(0, (lt - b.delay) / 0.95));
      const e = p <= 0 ? 0 : easeBack(p);
      b.m.position.z = b.start + (b.rise - b.start) * e + field(b.cx, b.cy, t) * 0.6;
    });

    dots.forEach((d, i) => {
      const p = reduce ? 1 : Math.min(1, Math.max(0, (lt - d.delay) / 0.55)); const e = smooth(p);
      const depth = d.tiny ? 0.03 : 0.07, top = -depth - 0.01 + (depth + 0.01 + (d.tiny ? 0.012 : d.soft ? 0.025 : 0.045)) * e + field(d.x, d.y, t);
      P.set(d.x, d.y, top); S.set(d.s, d.s, 0.3); M.compose(P, Q, S); dotMesh.setMatrixAt(i, M);
    });
    dotMesh.instanceMatrix.needsUpdate = true;

    renderer.render(scene, camera);
    raf = visible ? requestAnimationFrame(frame) : 0;
  }

  // Pause rendering while the hero is scrolled out of view (saves battery and CPU).
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(frame);
  });
  io.observe(vp);

  // The intro ends when the last block and the last dot have landed.
  const introMs = reduce ? 0 : Math.max(...blocks.map((b) => b.delay + 0.95), ...dots.map((d) => d.delay + 0.55)) * 1000;
  let introTimer: ReturnType<typeof setTimeout> | undefined;
  const play = () => {
    start = clock(); waves.length = 0;
    clearTimeout(introTimer);
    if (onIntroDone) introTimer = setTimeout(onIntroDone, introMs);
  };
  play(); raf = requestAnimationFrame(frame);

  return {
    play,
    setNight: (night) => applyPalette(night ? PAL.night : PAL.day),
    dispose() {
      cancelAnimationFrame(raf); clearTimeout(introTimer); io.disconnect(); ro.disconnect();
      vp.removeEventListener("pointermove", onMove); vp.removeEventListener("pointerleave", onLeave); vp.removeEventListener("pointerdown", onDown);
      geometries.forEach((g) => g.dispose()); Object.values(mats).forEach((m) => m.dispose());
      tileMesh.dispose(); dotMesh.dispose(); sun.shadow.dispose(); renderer.dispose(); renderer.domElement.remove();
    },
  };
}
