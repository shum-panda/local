// Vega website: scroll-driven reveals, the sticky tour, counters, the starry sky and the intro. Plain JS, no libraries,
// works from file:// too. Everything that moves is skipped with "reduce motion".
(() => {
  const root = document.documentElement;
  // "reduce motion" (also set by Windows when its animation effects are off) only drops the big moves:
  // the shooting stars, tilt/zoom and parallax. The star's fly-in, fades, counters and the tour stay, gentle as they are.
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  // ------------------------------------------------------------ menu on small screens
  const menu = $(".menu"), nav = $(".nav");
  menu?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(open));
  });
  $$(".nav a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("open")));

  // ------------------------------------------------------------ download links from assets/downloads.js
  const D = window.VEGA_DOWNLOADS;
  if (D) {
    $$("[data-dl]").forEach((a) => { const f = D.files[a.dataset.dl]; if (f) a.href = f.url; });
    $$("[data-dl-size]").forEach((e) => { const f = D.files[e.dataset.dlSize]; if (f) e.textContent = f.size; });
    $$("[data-dl-file]").forEach((e) => { const f = D.files[e.dataset.dlFile]; if (f) e.textContent = f.file; });
    $$("[data-dl-needs]").forEach((e) => { const f = D.files[e.dataset.dlNeeds]; if (f) e.textContent = f.needs; });
    $$("[data-version]").forEach((e) => { e.textContent = D.version; });
    $$("[data-releases]").forEach((a) => { a.href = D.releases; });
    $$("[data-repo]").forEach((a) => { a.href = D.repo; });
    $$("[data-issues]").forEach((a) => { a.href = D.issues; });
    // the hero button offers the build for this device
    const auto = $("[data-dl-auto]");
    if (auto) {
      const android = /Android/i.test(navigator.userAgent);
      const f = D.files[android ? "lite-android" : "lite-windows"]; // Vega Lite: the edition for everyone
      auto.href = android ? f.url : "download.html";
      const label = $("[data-dl-auto-label]", auto);
      if (label && android) label.textContent = `Get Vega Lite for Android`;
    }
  }

  // ------------------------------------------------------------ reveal on scroll
  const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }, { rootMargin: "0px 0px -12% 0px" }) : null;
  $$(".rv").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));

  // ------------------------------------------------------------ counters: count up once they're in view
  const fmt = (n, dec) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const count = (el) => {
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), pre = el.dataset.pre || "", suf = el.dataset.suf || "";
    const t0 = performance.now(), dur = 1600;
    const tick = (t) => {
      const k = clamp((t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = pre + fmt(to * e, dec) + suf;
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const cio = "IntersectionObserver" in window ? new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) { count(e.target); cio.unobserve(e.target); }
  }, { threshold: 0.6 }) : null;
  $$("[data-count]").forEach((el) => (cio ? cio.observe(el) : count(el)));

  // ------------------------------------------------------------ typed tagline
  const typed = $(".typed");
  if (typed) {
    const words = typed.dataset.words.split("|");
    {
      let w = 0, i = 0, back = false;
      const step = () => {
        const word = words[w];
        i += back ? -1 : 1;
        typed.textContent = word.slice(0, i);
        let wait = back ? 35 : 75;
        if (!back && i === word.length) { back = true; wait = 1900; }
        else if (back && i === 0) { back = false; w = (w + 1) % words.length; wait = 300; }
        setTimeout(step, wait);
      };
      setTimeout(step, 900);
    }
  }

  // ------------------------------------------------------------ statement: words light up as you scroll
  $$(".statement").forEach((s) => {
    s.innerHTML = s.innerHTML.replace(/(<[^>]+>)|([^\s<]+)/g, (m, tag, word) => (tag ? tag : `<span class="w">${word}</span>`));
    // words inside <span class="hl|or"> keep their colour
    $$(".hl .w, .or .w", s).forEach((w) => w.classList.add(w.parentElement.classList.contains("hl") ? "hl" : "or"));
  });

  // ------------------------------------------------------------ the sticky tour: which step is in the middle
  const tour = $(".tour");
  const steps = tour ? $$(".step", tour) : [];
  const layers = tour ? $$(".tour-stage img.layer", tour) : [];
  let current = -1;
  const setStep = (i) => {
    if (i === current) return;
    current = i;
    steps.forEach((s, k) => s.classList.toggle("on", k === i));
    const shot = steps[i]?.dataset.shot;
    layers.forEach((l) => l.classList.toggle("on", l.dataset.shot === shot));
  };
  if (steps.length) setStep(0);

  // ------------------------------------------------------------ one scroll loop for everything that follows the scroll
  const hero = $(".hero");
  const zooms = $$(".zoom"), paras = $$(".para"), grows = $$(".rule.grow"), statements = $$(".statement");
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const vh = innerHeight;
    if (hero) root.style.setProperty("--p", clamp(scrollY / (hero.offsetHeight * 0.8)).toFixed(3));
    if (!still) for (const z of zooms) {
      const r = z.getBoundingClientRect();
      z.style.setProperty("--s", clamp((vh - r.top) / (vh * 0.75)).toFixed(3));
    }
    if (!still) for (const p of paras) {
      const r = p.getBoundingClientRect(), mid = r.top + r.height / 2 - vh / 2;
      p.style.setProperty("--y", (mid * -(+p.dataset.speed || 0.12)).toFixed(1));
    }
    for (const g of grows) {
      const r = g.getBoundingClientRect();
      g.style.setProperty("--g", clamp((vh - r.top) / (vh * 0.6)).toFixed(3));
    }
    for (const s of statements) {
      const r = s.getBoundingClientRect(), ws = $$(".w", s);
      const k = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35));
      const n = Math.round(k * ws.length);
      ws.forEach((w, i) => w.classList.toggle("on", i < n));
    }
    if (steps.length) {
      let best = 0, bd = Infinity;
      steps.forEach((s, i) => { const r = s.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - vh / 2); if (d < bd) { bd = d; best = i; } });
      setStep(best);
    }
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  // ------------------------------------------------------------ the starry sky behind the hero
  const sky = $("#sky");
  if (sky) {
    const ctx = sky.getContext("2d");
    let W, H, dpr, stars = [], shoot = null, nextShoot = 2500;
    const size = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      W = sky.clientWidth; H = sky.clientHeight;
      sky.width = W * dpr; sky.height = H * dpr;
      const n = Math.round((W * H) / 5200);
      stars = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, s: Math.random() < 0.15 ? 3 : 2,
        ph: Math.random() * 6.3, sp: 0.6 + Math.random() * 1.8, c: Math.random() < 0.12 ? "255,138,31" : Math.random() < 0.2 ? "92,214,92" : "244,231,201" }));
    };
    size(); addEventListener("resize", size);
    const draw = (t) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const lift = (parseFloat(root.style.getPropertyValue("--p")) || 0) * 60;
      for (const s of stars) {
        const a = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(s.ph + (t / 1000) * s.sp));
        ctx.fillStyle = `rgba(${s.c},${a.toFixed(2)})`;
        ctx.fillRect(Math.round(s.x), Math.round(s.y - lift * (s.s - 1)), s.s, s.s); // the bigger ones drift more: depth
      }
      {
        if (!still && !shoot && t > nextShoot) shoot = { x: W * (0.2 + Math.random() * 0.7), y: H * Math.random() * 0.35, t0: t, len: 110 + Math.random() * 120 };
        if (shoot) {
          const k = (t - shoot.t0) / 900;
          if (k >= 1) { shoot = null; nextShoot = t + 3500 + Math.random() * 5000; }
          else {
            const hx = shoot.x - k * shoot.len * 2.2, hy = shoot.y + k * shoot.len * 1.1;
            for (let i = 0; i < 26; i++) {
              const f = i / 26;
              ctx.fillStyle = `rgba(${i < 5 ? "255,255,255" : i < 14 ? "214,222,234" : "92,104,122"},${((1 - f) * (1 - k)).toFixed(2)})`;
              ctx.fillRect(Math.round(hx + f * 60), Math.round(hy - f * 30), 3, 3);
            }
          }
        }
        requestAnimationFrame(draw);
      }
    };
    requestAnimationFrame(draw);
  }

  // ------------------------------------------------------------ the intro: the star arrives as a shooting star
  // Like the app's start (static/js/ui/intro.js), backwards: the chrome star comes in from beyond the edge with a
  // pixel tail (white, silver, steel), sweeps across the page on a golden spiral (its radius shrinks by φ every
  // quarter turn, like the Fibonacci squares) and slows into its place, growing from far away to full size. Then
  // the real star (the SVG) takes over. On every load of the home page, unless it's opened scrolled down.
  const heroStar = $(".hero .hero-star");
  const PHI = (1 + Math.sqrt(5)) / 2, WAIST = 0.28;
  const CHROME = [[0, "#ffffff"], [0.4, "#d6deea"], [0.5, "#242830"], [0.55, "#808896"], [0.8, "#e2e6ee"], [1, "#ffffff"]];
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;
  const chromeStar = (ctx, r) => { // a four-pointed chrome star at 0,0 as in the logo, lit from the upper left
    const g = ctx.createLinearGradient(-r * 0.3, -r, r * 0.3, r);
    for (const [at, c] of CHROME) g.addColorStop(at, c);
    const pt = (i, rr) => { const a = -Math.PI / 2 + (i * Math.PI) / 4; return [rr * Math.cos(a), rr * Math.sin(a)]; };
    for (let i = 0; i < 8; i += 2) for (const side of [-1, 1]) {
      const [px, py] = pt(i, r), [wx, wy] = pt(i + side, r * WAIST);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(px, py); ctx.lineTo(wx, wy); ctx.closePath();
      ctx.fillStyle = g; ctx.fill();
      const light = Math.cos(-Math.PI / 2 + ((i + side * 0.5) * Math.PI) / 4 + (3 * Math.PI) / 4);
      ctx.fillStyle = rgba(light > 0 ? [255, 255, 255] : [20, 22, 28], Math.abs(light) * 0.5); ctx.fill();
    }
  };
  if (heroStar) {
    const box = () => { const b = $("svg", heroStar).getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, r: b.width / 2.5 }; };
    const land = () => heroStar.classList.add("here");
    const start = box();
    if (scrollY > innerHeight * 0.5 || start.y > innerHeight) land();
    else {
      const W = innerWidth, H = innerHeight, dpr = Math.min(2, devicePixelRatio || 1);
      const cv = document.createElement("canvas");
      cv.className = "flight"; cv.width = W * dpr; cv.height = H * dpr; cv.setAttribute("aria-hidden", "true");
      document.body.append(cv);
      const ctx = cv.getContext("2d");
      // the path, relative to the star's place: a golden spiral from beyond the left edge, flattened so its outer
      // turn sweeps across the whole page (in from the left, under the title to the right, up over the star), then in
      const r0 = Math.max(W * 0.78, 520), quarters = Math.log(r0 / 6) / Math.log(PHI);
      const pts = [];
      for (let i = 0; i <= 900; i++) {
        const q = (i / 900) * quarters, th = Math.PI - (q * Math.PI) / 2, r = r0 / PHI ** q; // in from the left, below first
        pts.push([r * Math.cos(th), r * Math.sin(th) * 0.6]);
      }
      pts.push([0, 0]);
      const at = [0];
      for (let i = 1; i < pts.length; i++) at.push(at[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      const L = at[at.length - 1];
      const along = (s) => {
        let lo = 1, hi = at.length - 1;
        while (lo < hi) { const m = (lo + hi) >> 1; if (at[m] < s) lo = m + 1; else hi = m; }
        const [x0, y0] = pts[lo - 1], [x1, y1] = pts[lo], f = Math.min(1, Math.max(0, (s - at[lo - 1]) / (at[lo] - at[lo - 1] || 1)));
        return [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, Math.atan2(y1 - y0, x1 - x0)];
      };
      const FLY = 2400, TAIL = 900, trail = [];
      let t0 = null, last = null, landed = false;
      const frame = (now) => {
        if (t0 === null) t0 = now;
        const t = now - t0, k = Math.min(1, t / FLY);
        const e = 1 - (1 - k) ** 2.2; // fast from the edge, slowing into its place
        const b = box(); // follows the page if you scroll meanwhile
        const [px, py, dir] = along(e * L), x = b.x + px, y = b.y + py;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        if (!landed && last) { // a dense tail: fill in the way since the last frame
          const steps = Math.max(6, Math.ceil(Math.hypot(x - last[0], y - last[1]) / 2));
          for (let i = 1; i <= steps; i++) trail.push([last[0] + ((x - last[0]) * i) / steps, last[1] + ((y - last[1]) * i) / steps, now, 0.35 + 0.65 * (1 - e)]);
        }
        let alive = false;
        for (const [tx, ty, born, size] of trail) { // the fading tail: white, then silver, then steel
          const age = (now - born) / TAIL;
          if (age > 1) continue;
          alive = true;
          ctx.fillStyle = rgba(age < 0.25 ? [255, 255, 255] : age < 0.55 ? [196, 204, 216] : [92, 104, 122], (1 - age) * 0.9);
          const s = Math.max(1.5, (1 - age) * 9 * size), j = age * 14 * size;
          ctx.fillRect(tx + (Math.random() - 0.5) * j, ty + (Math.random() - 0.5) * j, s, s);
        }
        if (!landed) {
          const speed = last ? Math.hypot(x - last[0], y - last[1]) / Math.max(1, now - last[2]) : 0; // px per ms
          const stretch = 1 + Math.min(0.9, speed * 0.35);
          ctx.save();
          ctx.translate(x, y); ctx.rotate(dir); ctx.scale(stretch, 1 / Math.sqrt(stretch));
          ctx.rotate(-dir + (1 - e) * Math.PI * 1.5); // turns as it flies, upright when it arrives
          chromeStar(ctx, b.r * (0.15 + 0.85 * k ** 1.6)); // small far away, full size in its place
          ctx.restore();
          last = [x, y, now];
          if (k >= 1) { landed = true; land(); }
        }
        if (!landed || alive) requestAnimationFrame(frame);
        else cv.remove();
      };
      requestAnimationFrame(frame);
    }
  }

  // ------------------------------------------------------------ give the star a spin
  // Pointing at a star and moving across it turns it about its vertical axis like a globe you give a push: its
  // surface catches up with your pointer's speed, then it spins on and slows down by itself, coming to rest upright.
  $$(".hero-star").forEach((star) => {
    const svg = $("svg", star);
    let angle = 0, w = 0, over = false, lastX = null, lastT = 0, running = false, prev = 0;
    const tick = (now) => {
      const dt = prev ? Math.min(50, now - prev) : 16;
      prev = now;
      angle += w * dt;
      w *= Math.exp(-dt / 900); // friction
      if (Math.abs(w) < 0.04 && !over) { // nearly stopped: settle on the nearest upright position
        const rest = Math.round(angle / 360) * 360;
        angle += (rest - angle) * Math.min(1, dt / 220);
        w = 0;
        if (Math.abs(rest - angle) < 0.3) { angle = 0; svg.style.transform = ""; running = false; return; }
      }
      svg.style.transform = `perspective(900px) rotateY(${angle.toFixed(2)}deg)`;
      requestAnimationFrame(tick);
    };
    const go = () => { if (!running) { running = true; prev = 0; requestAnimationFrame(tick); } };
    star.addEventListener("pointerenter", (e) => { over = true; lastX = e.clientX; lastT = e.timeStamp; });
    star.addEventListener("pointerleave", () => { over = false; lastX = null; go(); });
    star.addEventListener("pointermove", (e) => {
      if (lastX === null) { lastX = e.clientX; lastT = e.timeStamp; return; }
      const dt = Math.max(8, e.timeStamp - lastT), vx = (e.clientX - lastX) / dt; // px per ms
      lastX = e.clientX; lastT = e.timeStamp;
      const r = svg.getBoundingClientRect().width / 2.5;
      const want = Math.max(-2.4, Math.min(2.4, (vx / r) * (180 / Math.PI) * 0.5)); // deg per ms: half the pointer's pace at the rim
      if (Math.sign(want) !== Math.sign(w) || Math.abs(want) > Math.abs(w)) w += (want - w) * 0.5;
      go();
    });
  });

})();
