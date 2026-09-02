document.getElementById("year").textContent = new Date().getFullYear();

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function series(seed) {
  const rand = mulberry32(seed);
  const actual = [];
  const pred = [];
  const lo = [];
  const hi = [];
  let v = 82 + rand() * 8;
  for (let i = 0; i < 48; i++) {
    const hour = i % 24;
    const diurnal = Math.sin(((hour - 7) / 24) * Math.PI * 2) * 18;
    v += (rand() - 0.48) * 2.2;
    const a = Math.max(40, v + diurnal);
    actual.push(a);
    const p = a + (rand() - 0.5) * 3 + (i > 32 ? (rand() - 0.4) * 4 : 0);
    pred.push(p);
    lo.push(p - 6 - rand() * 2);
    hi.push(p + 6 + rand() * 2);
  }
  return { actual, pred, lo, hi };
}

function drawLoad(seed = 322) {
  const canvas = document.getElementById("load-chart");
  const ctx = canvas.getContext("2d");
  const { width: w, height: h } = canvas;
  ctx.clearRect(0, 0, w, h);
  const { actual, pred, lo, hi } = series(seed);
  const min = Math.min(...lo) - 4;
  const max = Math.max(...hi) + 4;
  const x = (i) => (i / (actual.length - 1)) * (w - 32) + 16;
  const y = (v) => h - 24 - ((v - min) / (max - min)) * (h - 40);

  ctx.strokeStyle = "#2c2f27";
  ctx.lineWidth = 1;
  for (let g = 0; g < 4; g++) {
    const yy = 20 + g * ((h - 40) / 3);
    ctx.beginPath();
    ctx.moveTo(16, yy);
    ctx.lineTo(w - 16, yy);
    ctx.stroke();
  }

  ctx.beginPath();
  hi.forEach((v, i) => (i === 0 ? ctx.moveTo(x(i), y(v)) : ctx.lineTo(x(i), y(v))));
  for (let i = lo.length - 1; i >= 0; i--) ctx.lineTo(x(i), y(lo[i]));
  ctx.closePath();
  ctx.fillStyle = "rgba(212, 160, 23, 0.16)";
  ctx.fill();

  ctx.beginPath();
  actual.forEach((v, i) => (i === 0 ? ctx.moveTo(x(i), y(v)) : ctx.lineTo(x(i), y(v))));
  ctx.strokeStyle = "#8faf6a";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  pred.forEach((v, i) => (i === 0 ? ctx.moveTo(x(i), y(v)) : ctx.lineTo(x(i), y(v))));
  ctx.strokeStyle = "#d4a017";
  ctx.setLineDash([5, 4]);
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.setLineDash([]);

  const last = pred[pred.length - 1];
  const peak = Math.max(...actual);
  document.getElementById("load-stat").textContent =
    `peak ${peak.toFixed(1)}  ·  t+16h ${last.toFixed(1)}  ·  band ±6–8`;
}

document.getElementById("reshuffle").addEventListener("click", () => {
  drawLoad(Math.floor(Math.random() * 1e9));
});
drawLoad(322);

function size() {
  const eq = Number(document.getElementById("eq").value);
  const risk = Number(document.getElementById("risk").value);
  const stop = Number(document.getElementById("stop").value);
  const dollars = eq * (risk / 100);
  const qty = stop > 0 ? dollars / stop : 0;
  document.getElementById("risk-amt").textContent = `$${dollars.toFixed(0)}`;
  document.getElementById("qty").textContent = qty.toFixed(0);
}
["eq", "risk", "stop"].forEach((id) => {
  document.getElementById(id).addEventListener("input", size);
});
size();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function initMotion() {
  if (reduceMotion) return;

  const sections = document.querySelectorAll("main .section.reveal");
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.14, rootMargin: "0px 0px -10% 0px" }
  );

  document.documentElement.classList.add("motion-on");

  function armReveals() {
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        section.classList.add("is-in");
        return;
      }
      io.observe(section);
    });
  }

  const hero = document.querySelector(".hero");
  if (!hero) {
    armReveals();
    return;
  }

  const layers = [...hero.querySelectorAll(".hero-layer")].map((el) => ({
    el,
    factor: Number(el.dataset.parallax) || 0,
  }));
  const mobileMq = window.matchMedia("(max-width: 800px)");
  let introDone = false;
  let ticking = false;

  function applyParallax() {
    ticking = false;
    if (!introDone) return;

    const rect = hero.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
      layers.forEach(({ el }) => {
        el.style.transform = "";
        el.style.willChange = "";
      });
      return;
    }

    const y = window.scrollY;
    const scale = mobileMq.matches ? 0.35 : 1;
    layers.forEach(({ el, factor }) => {
      el.style.willChange = "transform";
      el.style.transform = `translate3d(0, ${y * factor * scale}px, 0)`;
    });
  }

  function requestTick() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(applyParallax);
  }

  window.setTimeout(() => {
    hero.classList.add("intro-done");
    introDone = true;
    armReveals();
    requestTick();
  }, 800);

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick, { passive: true });
}

initMotion();
