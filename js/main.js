(() => {
  "use strict";

  const body = document.body;
  const stage = document.getElementById("stage");
  const linesEl = document.getElementById("lines");
  const core = document.getElementById("core");
  const outro = document.getElementById("outro");
  const tiles = [...document.querySelectorAll(".tile")];
  const title1 = core.querySelector(".core__title--1");
  const title2 = core.querySelector(".core__title--2");
  const mark = core.querySelector(".core__mark");
  const chevrons = core.querySelector(".chevrons");

  const GAP = 10;
  const CORE_END = 90; // 그리드 완성 시 가운데 버튼 크기
  const START_SCALE = 2;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const shifts = tiles.map((t) => t.dataset.shift.split(",").map(Number));

  // CSS cubic-bezier(x1, y1, x2, y2)와 같은 곡선을 x → y로 푼다
  function cubicBezier(x1, y1, x2, y2) {
    const a = (p1, p2) => 1 - 3 * p2 + 3 * p1;
    const b = (p1, p2) => 3 * p2 - 6 * p1;
    const c = (p1) => 3 * p1;
    const at = (t, p1, p2) => ((a(p1, p2) * t + b(p1, p2)) * t + c(p1)) * t;
    const slope = (t, p1, p2) => 3 * a(p1, p2) * t * t + 2 * b(p1, p2) * t + c(p1);
    return (x) => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 8; i++) {
        const d = slope(t, x1, x2);
        if (Math.abs(d) < 1e-6) break;
        t -= (at(t, x1, x2) - x) / d;
      }
      if (t < 0 || t > 1 || Math.abs(at(t, x1, x2) - x) > 1e-4) {
        let lo = 0, hi = 1;
        for (let i = 0; i < 30; i++) {
          t = (lo + hi) / 2;
          if (at(t, x1, x2) < x) lo = t; else hi = t;
        }
      }
      return at(t, y1, y2);
    };
  }
  // 초반엔 거의 안 움직이다가 끝에서 몰아치는 ease-in
  const ease = cubicBezier(1, 0.25, 0.85, 1);
  const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  let W = 0, H = 0;
  let rects = []; // 완성 상태의 타일 위치 (8개 + 가운데)
  let centerRect;
  let coreState = 0;
  let morphTimer;
  let isStatic = false;
  let isEnd = false;

  /* ---------- 레이아웃: 가운데 90px 칸을 감싸는 바람개비 그리드 ---------- */
  function computeLayout() {
    const innerW = W - GAP * 2;
    const innerH = H - GAP * 2;
    const short = (innerH - GAP * 2 - CORE_END) / 2;
    const tall = short + CORE_END + GAP;
    const sideAndMid = (innerW - GAP * 4 - CORE_END) / 2;
    const side = Math.round(sideAndMid * 0.4155);
    const mid = sideAndMid - side;
    const wide = mid + CORE_END + GAP;

    const x1 = GAP;
    const x2 = x1 + side + GAP;
    const xc = x2 + mid + GAP;
    const x3 = x2 + wide + GAP;
    const x4 = x3 + mid + GAP;
    const y1 = GAP;
    const y2 = y1 + short + GAP;
    const y5 = y1 + tall + GAP;
    const y7 = y2 + CORE_END + GAP;

    rects = [
      [x1, y1, side, tall],  // Framework
      [x2, y1, wide, short], // Voice & Tone
      [x3, y1, mid, tall],   // Logo
      [x4, y1, side, short], // Typography
      [x1, y5, side, short], // Iconography
      [x2, y2, mid, tall],   // Color
      [xc, y7, wide, short], // Imagery
      [x4, y2, side, tall],  // Motion
    ];
    centerRect = [xc, y2, CORE_END, CORE_END];

    tiles.forEach((tile, i) => {
      const [x, y, w, h] = rects[i];
      Object.assign(tile.style, {
        left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`,
        transformOrigin: `${W / 2 - x}px ${H / 2 - y}px`,
      });
    });
  }

  /* ---------- 격자선: 각 타일/가운데 카드의 네 변을 화면 끝까지 연장 ---------- */
  const lineSets = [];
  function buildLines() {
    for (let i = 0; i < tiles.length + 1; i++) {
      const set = {};
      for (const side of ["l", "r", "t", "b"]) {
        const el = document.createElement("div");
        el.className = `line ${side === "l" || side === "r" ? "line--v" : "line--h"}`;
        el.appendChild(document.createElement("i"));
        linesEl.appendChild(el);
        set[side] = el;
      }
      lineSets.push(set);
    }
  }
  function placeLines(set, x, y, w, h) {
    set.l.style.transform = `translateX(${x - 1}px)`;
    set.r.style.transform = `translateX(${x + w}px)`;
    set.t.style.transform = `translateY(${y - 1}px)`;
    set.b.style.transform = `translateY(${y + h}px)`;
  }

  /* ---------- 스크롤 → 화면 상태 ---------- */
  function setCoreState(next, fromScroll) {
    if (next === coreState) return;
    const prev = coreState;
    coreState = next;
    core.dataset.state = String(next);
    // 1 ↔ 2 전환만 0.6초 트랜지션, 3단계는 스크롤에 직결
    if (fromScroll && (prev === 1 || next === 1)) {
      core.classList.add("is-animating");
      stage.classList.add("is-morphing");
      clearTimeout(morphTimer);
      morphTimer = setTimeout(() => {
        core.classList.remove("is-animating");
        stage.classList.remove("is-morphing");
      }, 650);
    }
    title1.style.opacity = next === 1 ? "1" : "0";
    title2.style.opacity = next === 1 ? "0" : "1";
  }

  function render(fromScroll = true) {
    if (isStatic) return;
    const max = document.documentElement.scrollHeight - H;
    const p = max > 0 ? clamp(scrollY / max) : 1;
    const e = ease(p);
    const scale = START_SCALE - (START_SCALE - 1) * e;
    const unit = (Math.max(W, H) - CORE_END) / 2 / START_SCALE;
    const ox = W / 2, oy = H / 2;

    tiles.forEach((tile, i) => {
      const [sx, sy] = shifts[i];
      const tx = -sx * unit * (1 - e);
      const ty = -sy * unit * (1 - e);
      if (!tile.classList.contains("is-enlarged")) {
        tile.style.transform = `scale(${scale}) translate(${tx}px, ${ty}px)`;
      }
      const [x, y, w, h] = rects[i];
      placeLines(
        lineSets[i],
        ox + scale * (x - ox + tx),
        oy + scale * (y - oy + ty),
        w * scale,
        h * scale,
      );
    });

    // 가운데 카드: 1) 흰 히어로 → 2) 파란 500px → 3) 90px 버튼
    const secondBreak = 0.05 + Math.max(W, H) / 5000;
    const fit = Math.min(W, H) - 64;
    let size, titleScale = 1, titleFade = 1;
    if (e <= 0) {
      setCoreState(1, fromScroll);
      size = Math.min(800, fit);
    } else if (e < secondBreak) {
      setCoreState(2, fromScroll);
      size = Math.min(500, fit);
    } else {
      setCoreState(3, fromScroll);
      const start = Math.min(500, fit);
      const k = clamp((e - secondBreak) / (1 - secondBreak));
      size = lerp(start, CORE_END, k);
      titleScale = Math.max(0.1, size / start);
      titleFade = clamp((titleScale - 0.65) / 0.3);
    }
    const cx = centerRect[0] + CORE_END / 2;
    const cy = centerRect[1] + CORE_END / 2;
    const left = cx - size / 2, top = cy - size / 2;
    Object.assign(core.style, { left: `${left}px`, top: `${top}px`, width: `${size}px`, height: `${size}px` });
    placeLines(lineSets[tiles.length], left, top, size, size);

    title1.style.transform = title2.style.transform = `scale(${titleScale})`;
    if (coreState === 3) title2.style.opacity = String(titleFade);

    // 의미 카드는 2단계 크기 기준으로 그리고, 작아질수록 로고 버튼으로 교차 전환
    core.style.setProperty("--start", `${Math.min(500, fit)}px`);
    core.style.setProperty("--mark-o", coreState === 3 ? String(1 - titleFade) : "0");

    linesEl.style.opacity = String(1 - clamp((e - 0.85) / 0.15));

    isEnd = p >= 0.999;
    core.classList.toggle("is-end", isEnd);
    core.setAttribute("aria-label", isEnd ? "소개 열기" : "전체 섹션 보기");
  }

  /* ---------- 스크롤 이벤트: rAF로 묶고, 바닥 근처에서 멈추면 바닥으로 스냅 ---------- */
  let ticking = false;
  let snapTimer;
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => { render(true); ticking = false; });
    }
    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => {
      const bottom = document.documentElement.scrollHeight - H;
      if (!isStatic && scrollY < bottom && bottom - scrollY <= 200) {
        scrollTo({ top: bottom, behavior: "smooth" });
      }
    }, 250);
  }

  function onResize() {
    const nearBottom = document.documentElement.scrollHeight - innerHeight - scrollY <= 200;
    W = innerWidth;
    H = innerHeight;
    applyMode();
    if (isStatic) return;
    computeLayout();
    if (nearBottom) scrollTo(0, document.documentElement.scrollHeight);
    render(false);
  }

  /* ---------- 모바일/모션 최소화: 정적 흐름 레이아웃 ---------- */
  let revealObserver;
  function applyMode() {
    const next = W <= 991 || reduceMotion.matches;
    if (next === isStatic && body.classList.contains("mode-set")) return;
    isStatic = next;
    body.classList.add("mode-set");
    body.classList.toggle("is-static", isStatic);
    if (isStatic) {
      closeOutro();
      tiles.forEach((t) => t.removeAttribute("style"));
      restoreColors();
      core.removeAttribute("style");
      core.dataset.state = "1";
      coreState = 0;
      title1.removeAttribute("style");
      title2.removeAttribute("style");
      mark.removeAttribute("style");
      outro.setAttribute("aria-hidden", "false");
      setupReveal();
    } else {
      revealObserver?.disconnect();
      document.querySelectorAll(".reveal").forEach((el) => el.classList.remove("reveal", "is-in"));
      outro.setAttribute("aria-hidden", "true");
    }
  }
  function setupReveal() {
    const targets = [...tiles, ...outro.querySelectorAll(".outro__inner > *")];
    targets.forEach((el) => el.classList.add("reveal"));
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // 빠르게 지나쳐 이미 화면 위로 올라간 요소도 보이게 한다
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    targets.forEach((el) => revealObserver.observe(el));
  }
  // 정적 모드에서 인라인 style을 지우면 --bg/--on도 사라지므로 원본을 보관
  tiles.forEach((t) => {
    t.dataset.bg = t.style.getPropertyValue("--bg");
    t.dataset.on = t.style.getPropertyValue("--on");
    t.dataset.deep = t.style.getPropertyValue("--deep");
  });
  const restoreColors = () => tiles.forEach((t) => {
    t.style.setProperty("--bg", t.dataset.bg);
    t.style.setProperty("--on", t.dataset.on);
    t.style.setProperty("--deep", t.dataset.deep);
  });

  /* ---------- 로드인 연출 ---------- */
  function intro() {
    requestAnimationFrame(() => {
      body.classList.add("lines-in");
      setTimeout(() => body.classList.add("intro-logo"), 400);
      setTimeout(() => {
        body.classList.add("intro-title");
        body.classList.remove("is-intro");
      }, 1250);
      setTimeout(() => body.classList.remove("intro-title"), 2600);
    });
    setTimeout(() => {
      chevrons.classList.add("is-visible");
      setTimeout(pulseChevrons, 500);
      setInterval(pulseChevrons, 2500);
    }, 2500);
  }
  function pulseChevrons() {
    if (coreState !== 1 && !isStatic) return;
    chevrons.querySelectorAll(".chevron").forEach((c, i) => {
      setTimeout(() => {
        c.classList.remove("is-pulse");
        void c.getBoundingClientRect();
        c.classList.add("is-pulse");
      }, i * 75);
    });
  }

  /* ---------- 가운데 버튼 / 아웃트로 ---------- */
  function openOutro() {
    body.classList.add("is-outro");
    outro.setAttribute("aria-hidden", "false");
    core.setAttribute("aria-label", "소개 닫기");
  }
  function closeOutro() {
    body.classList.remove("is-outro");
    if (!isStatic) outro.setAttribute("aria-hidden", "true");
  }
  core.addEventListener("click", () => {
    if (isStatic) return;
    if (body.classList.contains("is-outro")) return closeOutro();
    if (!isEnd) {
      scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
      return;
    }
    openOutro();
  });
  addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") closeOutro();
  });

  // 아웃트로의 협업 커서 태그: 각자 다른 지연으로 마우스를 따라온다
  const people = [
    { name: "Design", bg: "#f0c94f", fg: "#5a3a02", dx: -180, dy: -120, lag: 0.06 },
    { name: "Engineering", bg: "#fa551e", fg: "#fff", dx: 140, dy: -160, lag: 0.045 },
    { name: "Brand", bg: "#3dd3ee", fg: "#055463", dx: 220, dy: 60, lag: 0.035 },
    { name: "Product", bg: "#b4dc19", fg: "#175641", dx: -240, dy: 110, lag: 0.05 },
    { name: "Writing", bg: "#c8aff0", fg: "#682760", dx: 40, dy: 190, lag: 0.03 },
    { name: "You", bg: "#0061fe", fg: "#fff", dx: 18, dy: 18, lag: 0.28 },
  ];
  const cursorsEl = document.getElementById("cursors");
  const cursorState = people.map((person) => {
    const el = document.createElement("div");
    el.className = "cursor-tag";
    el.style.setProperty("--c-bg", person.bg);
    el.style.setProperty("--c-fg", person.fg);
    el.innerHTML = `<svg viewBox="0 0 16 16"><path d="M1 1l5 14 2-6 6-2z" fill="${person.bg}" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/></svg><span>${person.name}</span>`;
    cursorsEl.appendChild(el);
    return { el, person, x: innerWidth / 2 + person.dx, y: innerHeight / 2 + person.dy };
  });
  let mouse = { x: innerWidth * 0.62, y: innerHeight * 0.55 };
  addEventListener("pointermove", (ev) => { mouse = { x: ev.clientX, y: ev.clientY }; }, { passive: true });
  (function followCursors(t) {
    if (body.classList.contains("is-outro")) {
      cursorState.forEach((c, i) => {
        const wobble = c.person.name === "You" ? 0 : 14;
        const tx = mouse.x + c.person.dx + Math.sin(t / 900 + i) * wobble;
        const ty = mouse.y + c.person.dy + Math.cos(t / 1100 + i * 2) * wobble;
        c.x += (tx - c.x) * c.person.lag;
        c.y += (ty - c.y) * c.person.lag;
        c.el.style.transform = `translate(${c.x}px, ${c.y}px)`;
      });
    }
    requestAnimationFrame(followCursors);
  })(0);

  /* ---------- 타일 클릭: 화면 가득 확대 후 섹션 페이지로 ---------- */
  tiles.forEach((tile) => {
    tile.addEventListener("click", (ev) => {
      if (isStatic || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return;
      ev.preventDefault();
      const href = tile.href;
      const r = tile.getBoundingClientRect();
      // 현재 보이는 위치에서 transform 없이 다시 시작해 확대
      Object.assign(tile.style, {
        transform: "none", left: `${r.left}px`, top: `${r.top}px`,
        width: `${r.width}px`, height: `${r.height}px`,
      });
      void tile.offsetWidth;
      tile.classList.add("is-enlarged");
      body.classList.add("is-leaving");
      Object.assign(tile.style, { left: "16px", top: "16px", width: `${W - 32}px`, height: `${H - 32}px` });
      setTimeout(() => { location.href = href; }, 600);
    });
  });
  // 뒤로 가기(bfcache)로 돌아왔을 때 확대 상태 복구
  addEventListener("pageshow", (ev) => {
    if (!ev.persisted) return;
    body.classList.remove("is-leaving");
    tiles.forEach((t) => t.classList.remove("is-enlarged"));
    onResize();
  });

  /* ---------- 시작 ---------- */
  buildLines();
  W = innerWidth;
  H = innerHeight;
  applyMode();
  restoreColors();
  if (!isStatic) {
    computeLayout();
    render(false);
  }
  intro();
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", () => { onResize(); restoreColors(); });
  reduceMotion.addEventListener?.("change", () => { onResize(); restoreColors(); });
})();
