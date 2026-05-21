/**
 * "Nothing to keep." — landing page interactions.
 *
 * Three small modules wired by hand:
 *   - mouse + custom cursor
 *   - dot-grid canvas that brightens near the cursor
 *   - password vapor stream + spacebar / click keycap depress
 *
 * Tuneable constants live in CONFIG below.
 */

const CONFIG = {
  dotSpacing: 38,
  dotHoverRadius: 140,
  /** vertical scroll speed of the password stream, in px / sec. */
  streamSpeed: 60,
};

/* ────────────────────────────────────────────────────────
   Mouse tracking + custom cursor
   ──────────────────────────────────────────────────────── */

const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, active: false };
const cursorEl = document.getElementById("cursor");

window.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
  mouse.active = true;
  cursorEl.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
});
window.addEventListener("mouseleave", () => {
  mouse.active = false;
  cursorEl.classList.add("dim");
});
window.addEventListener("mouseenter", () => {
  cursorEl.classList.remove("dim");
});

/* ────────────────────────────────────────────────────────
   Dot grid — a 2d canvas of dots that brightens within the
   cursor radius. The dots in the immediate vicinity of the
   keycap (centre of the viewport) are carved out so the
   keycap reads as a hole in the field.
   ──────────────────────────────────────────────────────── */

function startDotGrid() {
  const canvas = document.getElementById("dotgrid");
  const ctx = canvas.getContext("2d");
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0;
  let H = 0;
  let cx = 0;
  let cy = 0;
  let dots = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W / 2;
    cy = H / 2;
    build();
  }

  function build() {
    dots = [];
    const spacing = CONFIG.dotSpacing;
    const maxR = Math.hypot(W, H) / 2;
    const cols = Math.ceil(W / spacing) + 2;
    const rows = Math.ceil(H / spacing) + 2;
    const offX = (W - (cols - 1) * spacing) / 2;
    const offY = (H - (rows - 1) * spacing) / 2;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = offX + i * spacing;
        const y = offY + j * spacing;
        const distFromCentre = Math.hypot(x - cx, y - cy);
        // Base alpha falls off from centre outward, so the grid 'breathes out'.
        const t = Math.min(distFromCentre / (maxR * 0.85), 1);
        const base = 0.06 + (1 - t) * 0.18;
        // Ring carve-out: hide dots near the keycap.
        const innerHole = 110;
        let hole = 0;
        if (distFromCentre < innerHole) hole = 1 - distFromCentre / innerHole;
        dots.push({ x, y, base: Math.max(0, base - hole * 0.8) });
      }
    }
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    const hoverR = CONFIG.dotHoverRadius;
    const hoverR2 = hoverR * hoverR;
    for (const d of dots) {
      let a = d.base;
      if (mouse.active) {
        const dx = d.x - mouse.x;
        const dy = d.y - mouse.y;
        const sq = dx * dx + dy * dy;
        if (sq < hoverR2) {
          const t = 1 - Math.sqrt(sq) / hoverR;
          a += t * 0.65;
        }
      }
      if (a < 0.02) continue;
      const size = a > 0.5 ? 1.5 : 1.1;
      ctx.fillStyle = `oklch(0.92 0.004 260 / ${Math.min(a, 0.95)})`;
      ctx.beginPath();
      ctx.arc(d.x, d.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  resize();
  frame();
}

/* ────────────────────────────────────────────────────────
   Password vapour — short crypto-random strings that
   scroll up through a vertical mask, fade in then out,
   never repeat.
   ──────────────────────────────────────────────────────── */

function startPasswordStream() {
  const root = document.getElementById("stream");
  const seenEl = document.getElementById("seen-count");

  // Drop visually ambiguous characters (l, I, O, 0, 1) so passing readers
  // can still tell the strings apart at a glance.
  const ALPHABET =
    "abcdefghijkmnpqrstuvwxyz" + "ABCDEFGHJKLMNPQRSTUVWXYZ" + "23456789" + "!@#$%^&*-_+=?<>/";

  function rand(n) {
    const arr = new Uint32Array(n);
    crypto.getRandomValues(arr);
    return arr;
  }

  function pwGen(len) {
    const idx = rand(len);
    let out = "";
    for (let i = 0; i < len; i++) {
      out += ALPHABET[idx[i] % ALPHABET.length];
    }
    return out;
  }

  function colorize(s) {
    let out = "";
    for (const ch of s) {
      let cls = "c1";
      if (/[A-Z]/.test(ch)) cls = "c0";
      else if (/[^A-Za-z0-9]/.test(ch)) cls = "c0";
      else if (/[0-9]/.test(ch)) cls = "c2";
      const safe = ch === "<" ? "&lt;" : ch === ">" ? "&gt;" : ch === "&" ? "&amp;" : ch;
      out += `<span class="${cls}">${safe}</span>`;
    }
    return out;
  }

  const ROW_H = 22;
  const HEIGHT = 168;
  let totalGenerated = 0;
  const kept = 0;

  function updateCounter() {
    seenEl.textContent =
      String(totalGenerated).padStart(6, "0") +
      " generated · " +
      String(kept).padStart(6, "0") +
      " kept";
  }

  function spawn() {
    const len = 18 + Math.floor(Math.random() * 18);
    const pw = pwGen(len);
    totalGenerated++;
    updateCounter();

    const row = document.createElement("div");
    row.className = "stream-row";
    row.innerHTML = `<span class="pw">${colorize(pw)}</span>`;
    row.style.transform = `translateY(${HEIGHT + ROW_H}px)`;
    row.style.opacity = "0";
    root.appendChild(row);

    const travel = HEIGHT + ROW_H * 2;
    const duration = (travel / CONFIG.streamSpeed) * 1000;
    const start = performance.now();

    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const y = HEIGHT + ROW_H - travel * t;
      row.style.transform = `translateY(${y}px)`;
      let o = 1;
      if (t < 0.18) o = t / 0.18;
      else if (t > 0.82) o = (1 - t) / 0.18;
      row.style.opacity = String(o * 0.95);
      if (t < 1) requestAnimationFrame(tick);
      else row.remove();
    }
    requestAnimationFrame(tick);
  }

  function loop() {
    spawn();
    const interval = Math.max(180, 1200 - CONFIG.streamSpeed * 10);
    setTimeout(loop, interval);
  }

  // Prefill so the column isn't empty on first paint.
  for (let i = 0; i < 5; i++) setTimeout(spawn, i * 220);
  setTimeout(loop, 1200);
}

/* ────────────────────────────────────────────────────────
   Spacebar / click on the keycap = depress feedback.
   ──────────────────────────────────────────────────────── */

function startKeycapInteractions() {
  const cap = document.getElementById("keycap");
  const wrap = document.getElementById("keycapWrap");
  const pressedShadow = `
    0 4px 12px oklch(0 0 0 / 0.5),
    0 1px 0 oklch(0.07 0.004 260),
    inset 0 1px 0 oklch(0.55 0.004 260 / 0.5),
    inset 0 -2px 0 oklch(0.06 0.004 260 / 0.9),
    inset 0 0 0 1px oklch(0.34 0.004 260 / 0.4)
  `;

  function depress() {
    cap.style.transform = "translateY(4px) scale(0.985)";
    cap.style.boxShadow = pressedShadow;
    wrap.style.animationPlayState = "paused";
  }

  function release() {
    cap.style.transform = "";
    cap.style.boxShadow = "";
    wrap.style.animationPlayState = "running";
  }

  window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      event.preventDefault();
      depress();
    }
  });
  window.addEventListener("keyup", (event) => {
    if (event.code === "Space") release();
  });
  cap.addEventListener("mousedown", depress);
  window.addEventListener("mouseup", release);
}

/* ──────────────────────────────────────────────────────── */

startDotGrid();
startPasswordStream();
startKeycapInteractions();
