/**
 * Lara Games — script.js universal (para TODAS as páginas)
 * - Não quebra se elementos não existirem
 * - Acessibilidade funciona tanto com BOTÕES (Loja) quanto com CHECKBOX (outras páginas)
 * - Loja: busca, filtro, ordenar, modal, toast, favoritos
 * - Catálogo: busca, categorias, modal, favoritos, validação do form
 * - Cadastro: validação do form
 * - Suporte: validação simples do form
 * - Rodapé: ano automático [data-ano]
 */

document.addEventListener("DOMContentLoaded", () => {
  // Helpers
  const $ = (id) => document.getElementById(id);
  const qs = (sel) => document.querySelector(sel);
  const qsa = (sel) => Array.from(document.querySelectorAll(sel));

  // ============================================================
  // 0) Ano automático no footer (span data-ano)
  // ============================================================
  qsa("[data-ano]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  // ============================================================
  // 1) Acessibilidade (accessibility – acessibilidade)
  // Suporta:
  // - Loja: botões #btnHighContrast / #btnFontLarge / #btnClearPrefs
  // - Outras páginas: checkboxes #alto-contraste / #grande-fonte
  // Classes no body:
  // - Loja: high-contrast / font-large
  // - CSS geral: alto-contraste / fonte-maior
  // (a gente aplica as DUAS para ficar compatível)
  // ============================================================
  const KEY_PREFS = "lara_prefs";

  function safeParseJSON(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function loadPrefs() {
    return safeParseJSON(localStorage.getItem(KEY_PREFS), {
      highContrast: false,
      fontLarge: false,
    });
  }

  function savePrefs(prefs) {
    localStorage.setItem(KEY_PREFS, JSON.stringify(prefs));
  }

  function applyPrefsToBody(prefs) {
    // classes da Loja
    document.body.classList.toggle("high-contrast", !!prefs.highContrast);
    document.body.classList.toggle("font-large", !!prefs.fontLarge);

    // classes do style.css (outras páginas)
    document.body.classList.toggle("alto-contraste", !!prefs.highContrast);
    document.body.classList.toggle("fonte-maior", !!prefs.fontLarge);

    // Atualiza UI de botões (se existirem)
    const btnHC = $("btnHighContrast");
    const btnFL = $("btnFontLarge");

    if (btnHC) {
      btnHC.classList.toggle("btn-light", !!prefs.highContrast);
      btnHC.classList.toggle("btn-outline-light", !prefs.highContrast);
    }
    if (btnFL) {
      btnFL.classList.toggle("btn-light", !!prefs.fontLarge);
      btnFL.classList.toggle("btn-outline-light", !prefs.fontLarge);
    }

    // Atualiza UI de checkboxes (se existirem)
    const cbHC = $("alto-contraste");
    const cbFL = $("grande-fonte");
    if (cbHC) cbHC.checked = !!prefs.highContrast;
    if (cbFL) cbFL.checked = !!prefs.fontLarge;
  }

  function initAccessibility() {
    const prefs = loadPrefs();
    applyPrefsToBody(prefs);

    // Botões da Loja
    const btnHC = $("btnHighContrast");
    const btnFL = $("btnFontLarge");
    const btnClear = $("btnClearPrefs");

    if (btnHC) {
      btnHC.addEventListener("click", () => {
        const p = loadPrefs();
        p.highContrast = !p.highContrast;
        savePrefs(p);
        applyPrefsToBody(p);
      });
    }
    if (btnFL) {
      btnFL.addEventListener("click", () => {
        const p = loadPrefs();
        p.fontLarge = !p.fontLarge;
        savePrefs(p);
        applyPrefsToBody(p);
      });
    }
    if (btnClear) {
      btnClear.addEventListener("click", () => {
        localStorage.removeItem(KEY_PREFS);
        applyPrefsToBody(loadPrefs());
      });
    }

    // Checkboxes das outras páginas
    const cbHC = $("alto-contraste");
    const cbFL = $("grande-fonte");

    if (cbHC) {
      cbHC.addEventListener("change", () => {
        const p = loadPrefs();
        p.highContrast = cbHC.checked;
        savePrefs(p);
        applyPrefsToBody(p);
      });
    }
    if (cbFL) {
      cbFL.addEventListener("change", () => {
        const p = loadPrefs();
        p.fontLarge = cbFL.checked;
        savePrefs(p);
        applyPrefsToBody(p);
      });
    }
  }

  initAccessibility();

  // ============================================================
  // 2) Favoritos (favorites – favoritos) universal
  // Loja usa .btn-fav com data-game-id
  // Catálogo usa .btn-fav com data-game-id
  // ============================================================
  const KEY_FAVS = "lara_favorites";

  function getFavs() {
    return safeParseJSON(localStorage.getItem(KEY_FAVS), []);
  }

  function setFavs(favs) {
    localStorage.setItem(KEY_FAVS, JSON.stringify(favs));
  }

  function toggleFav(id) {
    if (!id) return;
    let favs = getFavs();
    if (favs.includes(id)) favs = favs.filter((x) => x !== id);
    else favs.push(id);
    setFavs(favs);
    updateFavUI();
  }

  function updateFavUI() {
    const favs = getFavs();

    // contador da Loja (se existir)
    const favCount = $("favCount");
    if (favCount) favCount.textContent = String(favs.length);

    // aplica estado em todos os botões .btn-fav
    qsa(".btn-fav").forEach((btn) => {
      const id = btn.dataset.gameId;
      const isFav = id && favs.includes(id);

      btn.classList.toggle("active", !!isFav);

      const icon = btn.querySelector("i");
      if (icon) {
        icon.classList.toggle("bi-heart-fill", !!isFav);
        icon.classList.toggle("bi-heart", !isFav);
      }
    });
  }

  updateFavUI();

  // ============================================================
  // 3) Modal (Bootstrap) — só se existir #gameModal
  // ============================================================
  let modalInstance = null;
  const modalEl = $("gameModal");
  if (modalEl && window.bootstrap) {
    modalInstance = new bootstrap.Modal(modalEl);
  }

  function openDetailsFromButton(btn) {
    if (!btn || !modalInstance) return;

    const modalTitle = $("gameModalTitle");
    const modalGenre = $("gameModalGenre");
    const modalPlatform = $("gameModalPlatform");
    const modalPrice = $("gameModalPrice");
    const modalDescription = $("gameModalDescription");

    if (modalTitle) modalTitle.textContent = btn.dataset.title || "Detalhes";
    if (modalGenre) modalGenre.textContent = btn.dataset.genre || "-";
    if (modalPlatform) modalPlatform.textContent = btn.dataset.platform || "-";
    if (modalPrice) modalPrice.textContent = btn.dataset.price || "-";
    if (modalDescription) modalDescription.textContent = btn.dataset.description || "Sem descrição.";

    modalInstance.show();
  }

  // ============================================================
  // 4) Toast de compra — só se existir #buyToast
  // ============================================================
  let buyToast = null;
  const buyToastEl = $("buyToast");
  const buyToastText = $("buyToastText");
  if (buyToastEl && window.bootstrap) {
    buyToast = new bootstrap.Toast(buyToastEl);
  }

  function showBuyToast(gameName, url) {
    if (!buyToast || !buyToastText) {
      // fallback simples
      if (url) window.open(url, "_blank");
      return;
    }

    buyToastText.textContent = `Abrindo a loja de ${gameName || "o jogo"}...`;
    buyToast.show();

    setTimeout(() => {
      if (url) window.open(url, "_blank");
    }, 800);
  }

  // ============================================================
  // 5) Loja (index/loja) — busca + filtro + ordenação
  // Detecta por .game-col e .filter-btn
  // ============================================================
  (function initLojaFeatures() {
    const gamesGrid = $("gamesGrid");
    const gameCols = qsa(".game-col");
    const filterButtons = qsa(".filter-btn");
    const searchInput = $("searchInput");
    const sortSelect = $("sortSelect");

    // se não for a página da Loja, sai
    if (!gamesGrid || gameCols.length === 0 || !searchInput || filterButtons.length === 0) return;

    let activeGenre = "all";

    function matchesFilters(el) {
      const term = (searchInput.value || "").toLowerCase().trim();
      const title = (el.dataset.title || "").toLowerCase();
      const tags = (el.dataset.tags || "").toLowerCase();
      const genre = (el.dataset.genre || "").toLowerCase();

      const matchGenre = activeGenre === "all" || genre === activeGenre;
      const matchTerm = !term || title.includes(term) || tags.includes(term);
      return matchGenre && matchTerm;
    }

    function applyFilterAndSearch() {
      gameCols.forEach((col) => {
        col.classList.toggle("d-none", !matchesFilters(col));
      });
    }

    searchInput.addEventListener("input", applyFilterAndSearch);

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeGenre = (btn.dataset.genre || "all").toLowerCase();
        applyFilterAndSearch();
      });
    });

    function sortDomColumns(mode) {
      if (!sortSelect) return;

      const visible = gameCols.filter((col) => !col.classList.contains("d-none"));
      const hidden = gameCols.filter((col) => col.classList.contains("d-none"));

      const compare = {
        default: () => 0,
        az: (a, b) => (a.dataset.title || "").localeCompare(b.dataset.title || "", "pt-BR"),
        priceAsc: (a, b) => (parseFloat(a.dataset.price) || 0) - (parseFloat(b.dataset.price) || 0),
        priceDesc: (a, b) => (parseFloat(b.dataset.price) || 0) - (parseFloat(a.dataset.price) || 0),
      }[mode] || (() => 0);

      visible.sort(compare);
      [...visible, ...hidden].forEach((col) => gamesGrid.appendChild(col));
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", () => sortDomColumns(sortSelect.value));
    }

    // Delegação de cliques (fav/detalhes/comprar)
    gamesGrid.addEventListener("click", (e) => {
      const target = e.target;

      const favBtn = target.closest(".btn-fav");
      if (favBtn) {
        toggleFav(favBtn.dataset.gameId);
        return;
      }

      const detailsBtn = target.closest(".btn-details");
      if (detailsBtn) {
        openDetailsFromButton(detailsBtn);
        return;
      }

      const buyBtn = target.closest(".btn-buy");
      if (buyBtn) {
        showBuyToast(buyBtn.dataset.game, buyBtn.dataset.url);
        return;
      }
    });

    applyFilterAndSearch();
  })();

  // ============================================================
  // 6) Catálogo — busca + categoria (category-btn) + favoritos + modal
  // Detecta por .game-card-wrapper e .category-btn
  // ============================================================
  (function initCatalogoFeatures() {
    const wrappers = qsa(".game-card-wrapper");
    const categoryBtns = qsa(".category-btn");
    const searchInput = $("searchInput"); // mesmo id do seu catálogo
    const grid = $("gamesGrid");

    if (!grid || wrappers.length === 0 || categoryBtns.length === 0 || !searchInput) return;

    let activeCat = "all";

    function matchCatalogo(el) {
      const term = (searchInput.value || "").toLowerCase().trim();
      const title = (el.dataset.title || "").toLowerCase();
      const tags = (el.dataset.tags || "").toLowerCase();
      const cat = (el.dataset.category || "").toLowerCase();

      const matchCat = activeCat === "all" || cat === activeCat;
      const matchTerm = !term || title.includes(term) || tags.includes(term);
      return matchCat && matchTerm;
    }

    function apply() {
      wrappers.forEach((w) => w.classList.toggle("d-none", !matchCatalogo(w)));
    }

    searchInput.addEventListener("input", apply);

    categoryBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        categoryBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeCat = (btn.dataset.category || "all").toLowerCase();
        apply();
      });
    });

    // cliques: favoritos e detalhes (catalogo tem .btn-fav e .btn-details)
    grid.addEventListener("click", (e) => {
      const target = e.target;

      const favBtn = target.closest(".btn-fav");
      if (favBtn) {
        toggleFav(favBtn.dataset.gameId);
        return;
      }

      const detailsBtn = target.closest(".btn-details");
      if (detailsBtn) {
        openDetailsFromButton(detailsBtn);
        return;
      }
    });

    apply();
  })();

  // ============================================================
  // 7) Validação do newsletterForm (Loja/Catálogo)
  // Suporta tipoSelect OU tipoJogadorSelect
  // ============================================================
  (function initNewsletterValidation() {
    const form = $("newsletterForm");
    if (!form) return;

    const nomeInput = $("nomeInput");
    const emailInput = $("emailInput");
    const tipoSelect = $("tipoSelect") || $("tipoJogadorSelect");
    const termsCheck = $("termsCheck");
    const formAlert = $("formAlert");

    // se não tiver os campos esperados, não roda
    if (!nomeInput || !emailInput || !tipoSelect || !termsCheck || !formAlert) return;

    function toggleValidation(el, ok) {
      el.classList.toggle("is-valid", ok);
      el.classList.toggle("is-invalid", !ok);
    }

    function validateName() {
      const v = nomeInput.value.trim();
      const ok = v.length >= 3;
      toggleValidation(nomeInput, ok);
      return ok;
    }

    function validateEmail() {
      const v = emailInput.value.trim();
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const ok = regex.test(v);
      toggleValidation(emailInput, ok);
      return ok;
    }

    function validateTipo() {
      const ok = (tipoSelect.value || "") !== "";
      toggleValidation(tipoSelect, ok);
      return ok;
    }

    function validateTerms() {
      const ok = termsCheck.checked;
      termsCheck.classList.toggle("is-invalid", !ok);
      return ok;
    }

    nomeInput.addEventListener("input", validateName);
    emailInput.addEventListener("input", validateEmail);
    tipoSelect.addEventListener("change", validateTipo);
    termsCheck.addEventListener("change", validateTerms);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = validateName() && validateEmail() && validateTipo() && validateTerms();

      if (ok) {
        formAlert.classList.remove("d-none");
        form.reset();

        [nomeInput, emailInput, tipoSelect].forEach((el) => el.classList.remove("is-valid", "is-invalid"));
        termsCheck.classList.remove("is-invalid");

        setTimeout(() => formAlert.classList.add("d-none"), 4000);
      } else {
        formAlert.classList.add("d-none");
      }
    });
  })();

  // ============================================================
  // 8) Cadastro — validação do cadastroForm
  // ============================================================
  (function initCadastroValidation() {
    const form = $("cadastroForm");
    if (!form) return;

    const nome = $("nome");
    const email = $("email");
    const senha = $("senha");

    if (!nome || !email || !senha) return;

    // cria msg se não existir
    let msg = $("msgCadastro");
    if (!msg) {
      msg = document.createElement("p");
      msg.id = "msgCadastro";
      msg.className = "mt-3 text-center";
      form.appendChild(msg);
    }

    function setMsg(text, ok) {
      msg.textContent = text;
      msg.classList.toggle("text-success", !!ok);
      msg.classList.toggle("text-danger", !ok);
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const nomeOk = nome.value.trim().length >= 3;
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      const senhaOk = senha.value.trim().length >= 6;

      nome.classList.toggle("is-invalid", !nomeOk);
      email.classList.toggle("is-invalid", !emailOk);
      senha.classList.toggle("is-invalid", !senhaOk);

      if (nomeOk && emailOk && senhaOk) {
        setMsg("✅ Cadastro validado com sucesso! (Simulação)", true);
        form.reset();
      } else {
        setMsg("❌ Verifique os campos: nome, e-mail e senha (mínimo 6).", false);
      }
    });
  })();

  // ============================================================
  // 9) Suporte — validação simples no formulário (sem id, pega o 1º form da página suporte)
  // ============================================================
  (function initSuporteValidation() {
    // Só roda se estiver em suporte.html (heurística simples)
    if (!location.href.toLowerCase().includes("suporte")) return;

    const form = qs("main form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const nome = qs("#nome");
      const email = qs("#email");
      const mensagem = qs("#mensagem");

      const nomeOk = nome && nome.value.trim().length >= 3;
      const emailOk = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      const msgOk = mensagem && mensagem.value.trim().length >= 10;

      if (nome) nome.classList.toggle("is-invalid", !nomeOk);
      if (email) email.classList.toggle("is-invalid", !emailOk);
      if (mensagem) mensagem.classList.toggle("is-invalid", !msgOk);

      if (nomeOk && emailOk && msgOk) {
        alert("✅ Mensagem enviada! (Simulação)");
        form.reset();
      } else {
        alert("❌ Preencha corretamente: nome, e-mail e mensagem (mínimo 10 caracteres).");
      }
    });
  })();

  // ============================================================
  // 10) Botão voltar ao topo — se existir #btnScrollTop
  // ============================================================
  (function initScrollTop() {
    const btn = $("btnScrollTop");
    if (!btn) return;

    window.addEventListener("scroll", () => {
      btn.style.display = window.scrollY > 220 ? "block" : "none";
    });

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" }); // smooth scroll (rolagem suave)
    });
  })();
});

