(() => {
  "use strict";
  const { main, others, etc, all } = window.COCOBI;
  const A = "assets/cocobi/";
  const slug = new URLSearchParams(location.search).get("c") || "coco";
  const data = all.find((c) => c.slug === slug) || main[0];
  const root = document.documentElement;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  root.style.setProperty("--bg", data.bg);
  root.style.setProperty("--on", data.on);
  root.style.setProperty("--deep", data.deep);
  document.title = `${data.name} — 꼬마공룡 코코비`;
  $("name").textContent = data.name;
  $("tag").innerHTML = `<span>${esc(data.en)}</span>${esc(data.tag)}`;

  // 공식 꽃 오브젝트를 패널 곳곳에 띄운다
  const flowers = [1, 2, 3, 5, 6, 7, 9, 10, 11];
  const spots = [[4, 30], [88, 12], [93, 58], [6, 82], [50, 6], [70, 90], [30, 94], [97, 86], [2, 55]];
  $("flowers").innerHTML = spots
    .map(([x, y], i) => {
      const n = String(flowers[i % flowers.length]).padStart(2, "0");
      return `<img src="${A}characters_bg_object_${n}.png" alt="" style="left:${x}%;top:${y}%;animation-delay:${(i * 0.37).toFixed(2)}s">`;
    })
    .join("");

  const note = (title, html, extra = "") => `
    <div class="note ${extra}">
      <img class="note__tape" src="${A}characters_txt_object_01.png" alt="">
      <img class="note__dot" src="${A}characters_txt_object_04.png" alt="">
      <img class="note__blob" src="${A}characters_txt_object_05.png" alt="">
      <h2 class="note__title">${esc(title)}</h2>
      ${html}
    </div>`;

  function profile(c) {
    if (c.cutout) {
      return `
        <figure class="profile profile--cutout">
          <img class="profile__cloud profile__cloud--1" src="${A}main_characters_cloud_01.png" alt="">
          <img class="profile__cloud profile__cloud--2" src="${A}main_characters_cloud_03.png" alt="">
          <img class="profile__cut" src="${c.cutout}" alt="${esc(c.name)}">
          <figcaption class="profile__label">${esc(c.name)}</figcaption>
        </figure>`;
    }
    return `
      <figure class="profile">
        <img class="profile__img" src="${c.detail}" alt="${esc(c.name)}">
        <figcaption class="profile__label">${esc(c.name)}</figcaption>
      </figure>`;
  }

  function characterBody(c) {
    const story = c.story.map((p) => `<p>${esc(p)}</p>`).join("");
    const traits = `<ul class="traits">${c.traits.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
    const facts = `<dl class="facts">${c.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>`;
    return `${profile(c)}${note("이런 친구예요", story + traits + facts)}`;
  }

  // ETC: 소개되지 않은 가족·친구를 한곳에 모아 보기
  function etcBody() {
    const card = (c, i) => `
      <li style="--i:${i}"><button class="friend" type="button" data-slug="${c.slug}" data-group="${c.group}">
        <img src="${c.thumb}" alt="">
        <span class="friend__name">${esc(c.name)}</span>
        <span class="friend__tag">${esc(c.tag)}</span>
      </button></li>`;
    return `
      <div class="etc">
        <p class="etc__lead">코코비 가족의 어른들과 유치원·동네 친구들이에요.<br>카드를 누르면 자세히 볼 수 있어요.</p>
        <div class="chips" role="tablist">
          <button class="chip is-on" data-filter="all" role="tab" aria-selected="true">전체 ${others.length}</button>
          <button class="chip" data-filter="family" role="tab" aria-selected="false">가족 ${others.filter((o) => o.group === "family").length}</button>
          <button class="chip" data-filter="friends" role="tab" aria-selected="false">친구들 ${others.filter((o) => o.group === "friends").length}</button>
        </div>
        <ul class="friends">${others.map(card).join("")}</ul>
      </div>`;
  }

  $("body").innerHTML = data.slug === "etc" ? etcBody() : characterBody(data);
  document.body.classList.toggle("is-etc", data.slug === "etc");

  if (data.slug === "etc") {
    const chips = [...document.querySelectorAll(".chip")];
    chips.forEach((chip) => chip.addEventListener("click", () => {
      chips.forEach((c) => { c.classList.toggle("is-on", c === chip); c.setAttribute("aria-selected", String(c === chip)); });
      const f = chip.dataset.filter;
      document.querySelectorAll(".friend").forEach((el) => {
        el.parentElement.hidden = f !== "all" && el.dataset.group !== f;
      });
    }));
    const sheet = $("sheet");
    document.querySelectorAll(".friend").forEach((el) => el.addEventListener("click", () => {
      const c = others.find((o) => o.slug === el.dataset.slug);
      $("sheet-body").innerHTML = `
        <figure class="profile"><img class="profile__img" src="${c.detail}" alt="${esc(c.name)}"><figcaption class="profile__label">${esc(c.name)}</figcaption></figure>
        ${note(c.tag, `<p>${esc(c.story)}</p>`, "note--sheet")}`;
      sheet.showModal();
    }));
    sheet.addEventListener("click", (ev) => { if (ev.target === sheet) sheet.close(); });
  }

  // 다른 친구들: 홈 타일과 같은 색 카드
  $("others").innerHTML = all
    .map((c) => {
      const img = c.cutout || c.thumb || `${A}characters_04.png`;
      const current = c.slug === data.slug ? ' aria-current="page"' : "";
      return `<a class="mini" href="character.html?c=${c.slug}" style="--bg:${c.bg};--on:${c.on};--deep:${c.deep}"${current}>
        <span class="mini__name">${esc(c.name)}</span>
        <img class="mini__img${c.cutout ? " is-cut" : ""}" src="${img}" alt="">
      </a>`;
    })
    .join("");
})();
