/* ==============================================================
   1 ano da nossa história — funcionamento do livro
   Os textos e as fotos ficam em js/data.js.
   ============================================================== */

(() => {
  "use strict";

  const S = window.STORY;
  if (!S) return;

  const $ = (sel, root = document) => root.querySelector(sel);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------------- Utilidades ---------------- */

  const esc = (str = "") =>
    String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c]));

  const toArr = (v) => (Array.isArray(v) ? v : v ? [v] : []);
  const isPh = (str) => /^\s*\\[[\s\S]*\\]\s*$/.test(String(str || ""));
  const txt = (str) => (isPh(str) ? `<span class="placeholder-text">${esc(str)}</span>` : esc(str));
  const pad = (n) => String(n).padStart(2, "0");

  const paras = (arr) =>
    toArr(arr)
      .filter(Boolean)
      .map((p) => `<p class="reveal${isPh(p) ? " is-placeholder" : ""}">${esc(p)}</p>`)
      .join("");

  function parseDate(s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || "").trim());
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }

  const fmtDate = (d) =>
    d.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

  function daysSince(d) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((today - d) / 86400000);
  }

  /* ---------------- Ícones ---------------- */

  const STAR_PATH = "M12 2l1.8 8.2L22 12l-8.2 1.8L12 22l-1.8-8.2L2 12l8.2-1.8z";

  const ICON = {
    arrowR: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    music: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>',
    gift: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/></svg>',
    replay: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    camera: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    star: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR_PATH}"/></svg>`
  };

  const ornament = () =>
    `<div class="ornament reveal" aria-hidden="true"><span></span>${ICON.star}<span></span></div>`;

  const runningHead = (right) =>
    `<div class="running-head" aria-hidden="true"><span>Nossa história</span><span>${esc(right)}</span></div>`;

  const folio = (n) => `<div class="folio" aria-hidden="true">— ${n} —</div>`;

  /* ---------------- Fotos ---------------- */

  function photoHTML(p = {}, { ratio = "", cls = "", eager = false, reveal = true } = {}) {
    const src = (p.src || "").trim();
    const cap = p.legenda || "";
    const alt = p.alt || (isPh(cap) ? "" : cap) || "Foto da nossa história";
    const style = ratio ? ` style="--ratio:${ratio}"` : "";

    const inner = src
      ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="${eager ? "eager" : "lazy"}" decoding="async"${eager ? ' fetchpriority="high"' : ""}>`
      : `<div class="ph" role="img" aria-label="Espaço reservado para foto">${ICON.camera}<span>Sua foto aqui</span></div>`;

    return `<figure class="photo ${cls}${reveal ? " reveal" : ""}">
      <div class="photo__frame"${style}>${inner}</div>
      ${cap ? `<figcaption class="photo__caption">${txt(cap)}</figcaption>` : ""}
    </figure>`;
  }

  function galleryHTML(layout, fotos) {
    const f = toArr(fotos).length ? toArr(fotos) : [{}];

    switch (layout) {
      case "duo": {
        const two = [f[0] || {}, f[1] || {}];
        return `<div class="gallery gallery--duo">${two.map((p) => photoHTML(p, { ratio: "3 / 4" })).join("")}</div>`;
      }

      case "caption": {
        const p = f[0] || {};
        return `<div class="gallery gallery--caption">
          ${photoHTML({ ...p, legenda: "" }, { ratio: "4 / 5" })}
          <p class="gallery__caption reveal">${txt(p.legenda || "[Legenda da foto]")}</p>
        </div>`;
      }

      case "collage": {
        const items = f.slice(0, 4);
        while (items.length < 3) items.push({});

        return `<div class="gallery gallery--collage${items.length === 4 ? " gallery--collage-4" : ""}">
          ${items.map((p, i) => photoHTML({ ...p, legenda: "" }, { cls: `collage-${i}` })).join("")}
        </div>`;
      }

      default:
        return `<div class="gallery gallery--single">${f.map((p) => photoHTML(p, { ratio: p.proporcao || "4 / 5" })).join("")}</div>`;
    }
  }

  
/* ---------------- Slideshow automático ---------------- */

function startPhotoSlideshow(page) {
  page.querySelectorAll(".gallery").forEach((gallery) => {
    const figures = Array.from(gallery.querySelectorAll(".photo"));

    if (figures.length < 2) return;

    let currentIndex = 0;

    figures.forEach((figure, index) => {
      figure.style.display = index === 0 ? "" : "none";
      figure.style.transition = "opacity 0.5s ease";
    });

    const timer = window.setInterval(() => {
      if (!page.isConnected) {
        window.clearInterval(timer);
        return;
      }

      figures[currentIndex].style.display = "none";

      currentIndex = (currentIndex + 1) % figures.length;

      figures[currentIndex].style.display = "";
    }, 3000);
  });
}

  function memoriesHTML(arr) {
    const items = toArr(arr).filter(Boolean);
    if (!items.length) return "";

    return `<section class="memories" aria-label="Pequenas memórias">
      <p class="memories__label reveal">Pequenas memórias</p>
      <ul>${items
        .map((m) => `<li class="memory reveal"><span class="memory__mark" aria-hidden="true">“</span><p>${txt(m)}</p></li>`)
        .join("")}</ul>
    </section>`;
  }

  function trackerHTML(m, total) {
    const dots = Array.from({ length: total }, (_, i) => {
      const n = i + 1;
      return `<span class="${n < m ? "is-past" : n === m ? "is-current" : ""}"></span>`;
    }).join("");

    return `<div class="tracker reveal" role="img" aria-label="Mês ${m} de ${total}">
      <div class="tracker__dots" aria-hidden="true">${dots}</div>
      <span class="tracker__label" aria-hidden="true">Mês ${m} de ${total}</span>
    </div>`;
  }

  function voucherHTML() {
    const V = S.vale;
    const para = V.para || S.casal.nome2;
    const de = V.de || S.casal.nome1;
    const n = Math.max(1, Number(V.quantidade) || 3);
    const rules = [...toArr(V.regras), ...toArr(V.regrasExtras)].filter(Boolean);

    return `<article class="voucher" aria-labelledby="voucher-title">
      <div class="voucher__head">
        <span class="voucher__icon" aria-hidden="true">${ICON.gift}</span>
        <p class="kicker">Vale-presente · Edição única</p>
        <h3 class="voucher__title" id="voucher-title" tabindex="-1">${esc(V.titulo)}</h3>
        <p class="voucher__subtitle">${esc(V.subtitulo)}</p>
      </div>
      <div class="voucher__perf" aria-hidden="true"></div>
      <div class="voucher__body">
        <ul class="voucher__rules">${rules.map((r) => `<li>${txt(r)}</li>`).join("")}</ul>
        <div class="voucher__tickets" aria-label="${n} pedidos">
          ${Array.from({ length: n }, (_, k) => `<div class="ticket"><span>Pedido</span><strong>${pad(k + 1)}</strong></div>`).join("")}
        </div>
        <dl class="voucher__meta">
          <div><dt>Para</dt><dd>${txt(para)}</dd></div>
          <div><dt>De</dt><dd>${txt(de)}</dd></div>
          <div><dt>Validade</dt><dd>${txt(V.validade)}</dd></div>
        </dl>
      </div>
    </article>`;
  }

  /* ---------------- Sequência de páginas ---------------- */

  const pages = [];
  const momentsAfter = (m) => toArr(S.momentosEspeciais).filter((x) => Number(x.depoisDoMes) === m);
  const totalMonths = toArr(S.meses).length;

  pages.push({ type: "cover" });
  pages.push({ type: "playlist" });
  pages.push({ type: "intro", data: S.inicio });

  momentsAfter(0).forEach((d) => pages.push({ type: "moment", data: d }));

  toArr(S.meses).forEach((mes, i) => {
    const n = Number(mes.mes) || i + 1;

    if (i === totalMonths - 1) {
      pages.push({ type: "finale", data: mes, n });
    } else {
      pages.push({ type: "month", data: mes, n });
      momentsAfter(n).forEach((d) => pages.push({ type: "moment", data: d }));
    }
  });

  pages.push({ type: "gift" });
  pages.push({ type: "ending" });

  /* ---------------- Modelos de página ---------------- */

  const corner = (pos) =>
    `<span class="cover__corner cover__corner--${pos}" aria-hidden="true">${ICON.star}</span>`;

  const RENDER = {
    cover() {
      const c = S.capa;
      const d = parseDate(S.casal.dataInicio);

      const date = d
        ? `Desde ${esc(fmtDate(d))}`
        : `<span class="placeholder-text">[Data em que começamos]</span>`;

      return `<div class="cover">
        <div class="cover__frame" aria-hidden="true"></div>
        ${corner("tl")}${corner("tr")}${corner("bl")}${corner("br")}
        <p class="kicker cover__kicker reveal">Nossa história · Volume I</p>
        <h1 class="cover__title reveal" tabindex="-1">${esc(c.titulo)}</h1>
        <p class="cover__subtitle reveal">${esc(c.subtitulo)}</p>
        ${photoHTML(c.foto, { cls: "cover__photo", eager: true })}
        <p class="cover__names reveal">${txt(S.casal.nome1)}<span class="amp">&amp;</span>${txt(S.casal.nome2)}</p>
        <p class="cover__date reveal">${date}</p>
        <button class="btn btn--primary btn--lg reveal" type="button" data-action="next">${esc(c.botao)} ${ICON.arrowR}</button>
      </div>`;
    },

    playlist() {
      const P = S.playlist;
      const url = String(S.spotify || "").trim();

      const button = url
        ? `<a class="btn btn--primary btn--xl" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${ICON.music}<span>${esc(P.botao)}</span></a>`
        : `<button class="btn btn--primary btn--xl" type="button" aria-disabled="true" aria-describedby="spotify-hint">${ICON.music}<span>${esc(P.botao)}</span></button>
           <p class="hint" id="spotify-hint">Link da playlist ainda não configurado. Cole o link em <code>spotify</code>, no arquivo <code>js/data.js</code>.</p>`;

      return `${runningHead("Antes de começar")}
      <div class="center-page">
        <div class="disc reveal" aria-hidden="true"></div>
        <h2 class="display reveal" tabindex="-1">${esc(P.titulo)}</h2>
        <p class="lead reveal">${esc(P.texto)}</p>
        <div class="reveal" style="display:flex;flex-direction:column;align-items:center;gap:10px;width:100%">${button}</div>
        ${ornament()}
        <p class="script reveal">${esc(P.chamada)}</p>
        <button class="btn btn--ghost btn--lg reveal" type="button" data-action="next">${esc(P.botaoComecar)} ${ICON.arrowR}</button>
      </div>`;
    },

    intro(p, i) {
      return chapterHTML(p, i, {
        right: p.data.rotulo || "Prólogo",
        kicker: p.data.rotulo || "Prólogo",
        heading: p.data.titulo || "Início",
        subtitle: p.data.subtitulo
      });
    },

    month(p, i) {
      return chapterHTML(p, i, {
        right: `Capítulo ${pad(p.n)}`,
        kicker: `Capítulo ${pad(p.n)}`,
        heading: `Mês ${p.n}`,
        subtitle: p.data.titulo,
        tracker: true
      });
    },

    moment(p, i) {
      const d = p.data;

      return `${runningHead("Momento especial")}
      <div class="moment">
        <p class="kicker reveal">${ICON.star} Momento especial</p>
        <h2 class="display reveal" tabindex="-1">${esc(d.rotulo || "Um dos nossos momentos favoritos")}</h2>
        ${d.titulo ? `<h3 class="moment-title reveal">${txt(d.titulo)}</h3>` : ""}
        <div class="moment__card reveal">
          <span class="tape" aria-hidden="true"></span>
          ${photoHTML(d.foto || {}, { ratio: "4 / 5", reveal: false })}
        </div>
        ${d.texto ? `<p class="moment__text reveal">${txt(d.texto)}</p>` : ""}
        ${d.data ? `<p class="date reveal">${ICON.calendar}<span>${txt(d.data)}</span></p>` : ""}
      </div>
      ${folio(i + 1)}`;
    },

    finale(p, i) {
      const d = p.data;
      const fotos = toArr(d.fotos);
      const extra = fotos.slice(1);

      return `${runningHead(`Capítulo ${pad(p.n)}`)}
      <div class="finale">
        <p class="kicker reveal">Capítulo ${pad(p.n)} · Mês ${p.n}</p>
        <h2 class="finale__title reveal" tabindex="-1">${esc(d.titulo || "12 meses.")}</h2>
        <p class="finale__subtitle reveal">${esc(d.subtitulo || "Um ano inteiro de nós.")}</p>
        ${d.data ? `<p class="date reveal">${ICON.calendar}<span>${txt(d.data)}</span></p>` : ""}
        ${photoHTML(fotos[0] || {}, { cls: "finale__photo", ratio: "4 / 5" })}
        ${extra.length ? galleryHTML(extra.length === 1 ? "single" : "duo", extra) : ""}
        ${ornament()}
        <div class="letter reveal">
          <p class="kicker letter__label">Para você</p>
          <div class="prose">${paras(d.mensagem)}</div>
          ${d.assinatura ? `<p class="letter__sign">${txt(d.assinatura)}</p>` : ""}
        </div>
        ${memoriesHTML(d.memorias)}
        ${trackerHTML(p.n, totalMonths)}
        <button class="btn btn--primary btn--lg reveal" type="button" data-action="next">${esc(d.botao || "Tem mais uma coisa...")} ${ICON.arrowR}</button>
      </div>
      ${folio(i + 1)}`;
    },

    gift() {
      const G = S.presente;
      const opened = state.giftOpened;

      const sparks = Array.from({ length: 14 }, (_, k) =>
        `<span style="--a:${Math.round((360 / 14) * k)}deg;--r:${95 + (k % 3) * 22}px"></span>`
      ).join("");

      return `${runningHead("Último capítulo")}
      <div class="gift-page">
        <p class="kicker reveal">Último capítulo</p>
        <h2 class="display reveal" tabindex="-1">${esc(G.titulo)}</h2>
        <p class="lead reveal"${opened ? " hidden" : ""}>${esc(G.texto)}</p>
        <div class="gift-stage reveal" data-gift-stage${opened ? " hidden" : ""}>
          <div class="gift" aria-hidden="true">
            <div class="gift__box"></div>
            <div class="gift__lid"><span class="gift__bow"></span><span class="gift__knot"></span></div>
          </div>
          <div class="burst" aria-hidden="true">${sparks}</div>
        </div>
        <button class="btn btn--primary btn--lg reveal" type="button" data-action="open-gift"${opened ? " hidden" : ""}>${ICON.gift}<span>${esc(G.botao)}</span></button>
        <div class="voucher-wrap${opened ? " is-visible" : ""}" data-voucher${opened ? "" : " hidden"}>
          ${voucherHTML()}
          <button class="btn btn--ghost btn--lg" type="button" data-action="next">${esc(G.continuar || "Continuar")} ${ICON.arrowR}</button>
        </div>
      </div>`;
    },

    ending() {
      const F = S.final;
      const d = parseDate(S.casal.dataInicio);
      const days = d ? daysSince(d) : 0;

      const first = days > 0
        ? `<div><strong>${days.toLocaleString("pt-BR")}</strong><span>dias</span></div>`
        : `<div><strong>1</strong><span>ano</span></div>`;

      return `<div class="ending">
        ${ornament()}
        <p class="kicker reveal">Fim</p>
        <h2 class="ending__title reveal" tabindex="-1">${esc(F.titulo)}</h2>
        <p class="ending__text reveal">${esc(F.texto)}</p>
        <div class="stats reveal">
          ${first}
          <div><strong>${totalMonths}</strong><span>meses</span></div>
          <div><strong>∞</strong><span>capítulos</span></div>
        </div>
        <p class="ending__love reveal">${esc(F.mensagem)}</p>
        <button class="btn btn--primary btn--lg reveal" type="button" data-action="restart">${ICON.replay}<span>${esc(F.botao)}</span></button>
      </div>`;
    }
  };

  function chapterHTML(p, i, o) {
    const d = p.data;

    return `${runningHead(o.right)}
    <header class="chapter-head">
      <p class="kicker reveal">${esc(o.kicker)}</p>
      <h2 class="chapter-title reveal" tabindex="-1">${esc(o.heading)}</h2>
      ${ornament()}
      ${o.subtitle ? `<h3 class="moment-title reveal">${txt(o.subtitle)}</h3>` : ""}
      ${d.data ? `<p class="date reveal">${ICON.calendar}<span>${txt(d.data)}</span></p>` : ""}
    </header>
    <div class="chapter-body">
      <div class="prose">${paras(d.texto)}</div>
      ${galleryHTML(d.layout, d.fotos)}
      ${toArr(d.textoDepois).length ? `<div class="prose">${paras(d.textoDepois)}</div>` : ""}
      ${memoriesHTML(d.memorias)}
    </div>
    ${o.tracker ? trackerHTML(p.n, totalMonths) : ""}
    ${folio(i + 1)}`;
  }

  /* ---------------- Montagem de uma página ---------------- */

  function createPage(i) {
    const p = pages[i];
    const el = document.createElement("section");

    el.className = `page page--${p.type}`;
    el.setAttribute("aria-label", `Página ${i + 1} de ${pages.length}`);

    el.innerHTML = `
      <div class="page__scroll"><div class="page__inner">${RENDER[p.type](p, i)}</div></div>
      <div class="page__shade" aria-hidden="true"></div>
      ${p.type !== "cover" ? '<span class="ribbon" aria-hidden="true"></span>' : ""}`;

    el.querySelectorAll(".reveal").forEach((n, k) =>
      n.style.setProperty("--i", Math.min(k, 12))
    );

    el.querySelectorAll("img").forEach((img) => {
      const done = () => img.classList.add("is-loaded");

      if (img.complete && img.naturalWidth) {
        done();
      } else {
        img.addEventListener("load", done, { once: true });

        img.addEventListener("error", () => {
          const ph = document.createElement("div");
          ph.className = "ph";
          ph.setAttribute("role", "img");
          ph.setAttribute("aria-label", "Foto não encontrada");
          ph.innerHTML = `${ICON.camera}<span>Foto não encontrada</span><small>${esc(img.getAttribute("src"))}</small>`;
          img.replaceWith(ph);
        }, { once: true });
      }
    });

    // Inicia a troca automática das fotos desta página.
    startPhotoSlideshow(el);

    return el;
  }

  /* ---------------- Navegação ---------------- */

  const book = $("#book");
  const prevBtn = $("#prev");
  const nextBtn = $("#next");
  const label = $("#progress-label");
  const track = $("#progress-track");
  const fill = $("#progress-fill");
  const live = $("#live");
  const nav = $("#nav");

  const state = { giftOpened: false };
  let current = -1;
  let currentEl = null;
  let busy = false;

  const canGoNext = () =>
    current < pages.length - 1 &&
    !(pages[current].type === "gift" && !state.giftOpened);

  const canGoPrev = () => current > 0;

  function updateUI() {
    const onCover = current === 0;

    document.body.classList.toggle("on-cover", onCover);
    nav.inert = onCover;
    nav.setAttribute("aria-hidden", String(onCover));

    prevBtn.disabled = !canGoPrev();
    nextBtn.disabled = !canGoNext();

    nextBtn.title =
      pages[current].type === "gift" && !state.giftOpened
        ? "Abra o presente primeiro"
        : "";

    label.textContent = `Página ${current + 1} de ${pages.length}`;
    track.setAttribute("aria-valuemax", String(pages.length));
    track.setAttribute("aria-valuenow", String(current + 1));
    fill.style.width = `${((current + 1) / pages.length) * 100}%`;
  }

  function afterTurn() {
    const heading = currentEl.querySelector("[tabindex='-1']");

    if (heading && document.activeElement !== document.body) {
      heading.focus({ preventScroll: true });
    } else if (heading && current !== 0) {
      heading.focus({ preventScroll: true });
    }

    live.textContent = `Página ${current + 1} de ${pages.length}`;
    preload(current + 1);

    try {
      const hash = current === 0 ? "" : `#p${current + 1}`;
      history.replaceState(null, "", location.pathname + location.search + hash);
    } catch (_) {
      /* ignora */
    }
  }

  function go(index, opts = {}) {
    index = Math.max(0, Math.min(pages.length - 1, index));

    if (index === current || busy) return;

    const dir = opts.dir ?? (index > current ? 1 : -1);
    const old = currentEl;
    const fresh = createPage(index);

    current = index;
    currentEl = fresh;
    updateUI();

    if (!old || opts.instant || reduceMotion.matches) {
      if (old) old.remove();

      book.appendChild(fresh);

      if (old) fresh.classList.add("is-fade-in");

      afterTurn();
      return;
    }

    busy = true;
    let animated;

    if (dir > 0) {
      book.insertBefore(fresh, old);
      fresh.classList.add("under-in");
      old.classList.add("turn-out");
      animated = old;
    } else {
      book.appendChild(fresh);
      fresh.classList.add("turn-in");
      old.classList.add("under-out");
      animated = fresh;
    }

    let finished = false;

    const finish = () => {
      if (finished) return;

      finished = true;
      old.remove();
      fresh.classList.remove("turn-in", "under-in");
      busy = false;
      afterTurn();
    };

    animated.addEventListener("animationend", function onEnd(e) {
      if (e.target !== animated) return;

      animated.removeEventListener("animationend", onEnd);
      finish();
    });

    setTimeout(finish, 1400);
  }

  const next = () => canGoNext() && go(current + 1, { dir: 1 });
  const prev = () => canGoPrev() && go(current - 1, { dir: -1 });

  /* Pré-carrega as fotos da próxima página */

  function srcsOf(obj, out = []) {
    if (!obj || typeof obj !== "object") return out;

    for (const [k, v] of Object.entries(obj)) {
      if (k === "src" && typeof v === "string" && v.trim()) {
        out.push(v.trim());
      } else if (v && typeof v === "object") {
        srcsOf(v, out);
      }
    }

    return out;
  }

  function preload(i) {
    const p = pages[i];
    if (!p) return;

    const src = p.type === "cover" ? srcsOf(S.capa) : srcsOf(p.data);

    src.forEach((s) => {
      const im = new Image();
      im.decoding = "async";
      im.src = s;
    });
  }

  /* ---------------- Presente ---------------- */

  function openGift(btn) {
    const page = currentEl;
    const stage = page.querySelector("[data-gift-stage]");
    const wrap = page.querySelector("[data-voucher]");
    const lead = page.querySelector(".gift-page .lead");

    btn.disabled = true;

    const reveal = () => {
      state.giftOpened = true;
      stage.hidden = true;
      btn.hidden = true;

      if (lead) lead.hidden = true;

      wrap.hidden = false;

      requestAnimationFrame(() =>
        requestAnimationFrame(() => wrap.classList.add("is-visible"))
      );

      updateUI();
      live.textContent = `Presente aberto: ${S.vale.titulo}. ${S.vale.subtitulo}`;

      setTimeout(() => {
        const t = wrap.querySelector("#voucher-title");
        if (t) t.focus({ preventScroll: true });

        const scroller = page.querySelector(".page__scroll");

        const top =
          wrap.getBoundingClientRect().top -
          scroller.getBoundingClientRect().top +
          scroller.scrollTop -
          24;

        scroller.scrollTo({
          top: Math.max(0, top),
          behavior: reduceMotion.matches ? "auto" : "smooth"
        });
      }, 150);
    };

    if (reduceMotion.matches) return reveal();

    stage.classList.add("is-shaking");

    setTimeout(() => {
      stage.classList.remove("is-shaking");
      stage.classList.add("is-opening");
    }, 650);

    setTimeout(reveal, 650 + 1150);
  }

  /* ---------------- Eventos ---------------- */

  book.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el) return;

    const action = el.dataset.action;

    if (el.getAttribute("aria-disabled") === "true") return;

    if (action === "next") {
      next();
    } else if (action === "open-gift") {
      openGift(el);
    } else if (action === "restart") {
      state.giftOpened = false;
      go(0, { dir: -1 });
    }
  });

  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);

  document.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

    const tag = (e.target.tagName || "").toLowerCase();

    if (tag === "input" || tag === "textarea") return;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  });

  /* Swipe no celular */

  let sx = 0, sy = 0, st = 0, tracking = false;

  book.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) {
      tracking = false;
      return;
    }

    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
    st = Date.now();
    tracking = true;
  }, { passive: true });

  book.addEventListener("touchend", (e) => {
    if (!tracking) return;

    tracking = false;

    const t = e.changedTouches[0];
    const dx = t.clientX - sx;
    const dy = t.clientY - sy;

    if (
      Math.abs(dx) < 55 ||
      Math.abs(dx) < Math.abs(dy) * 1.4 ||
      Date.now() - st > 900
    ) return;

    if (dx < 0) {
      next();
    } else {
      prev();
    }
  }, { passive: true });

  /* Estrelinhas discretas ao fundo */

  (function ambient() {
    const box = $("#ambient");

    if (!box || reduceMotion.matches) return;

    const frag = document.createDocumentFragment();

    for (let k = 0; k < 16; k++) {
      const s = document.createElement("span");

      s.className = "star";
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${Math.random() * 100}%`;
      s.style.setProperty("--s", `${5 + Math.random() * 8}px`);
      s.style.setProperty("--d", `${6 + Math.random() * 6}s`);
      s.style.setProperty("--delay", `${-Math.random() * 10}s`);

      frag.appendChild(s);
    }

    box.appendChild(frag);
  })();

  /* Início: abre na capa ou na página do link (#p5) */

  const fromHash = /^#p(\d+)$/.exec(location.hash);

  let start = fromHash
    ? Math.min(pages.length, Math.max(1, +fromHash[1])) - 1
    : 0;

  if (pages[start] && pages[start].type === "ending") {
    state.giftOpened = true;
  }

  go(start, { instant: true });

  setTimeout(() => book.classList.remove("is-intro"), 1200);
})();