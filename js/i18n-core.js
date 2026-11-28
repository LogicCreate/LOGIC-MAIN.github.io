/* LogicPad 97-Language Site Core Engine (Home, Complete Guidebook & Privacy Policy) */
(function () {
  window.__LP_LOCALES = window.__LP_LOCALES || {};
  var pendingCallbacks = {};

  window.__LP_REGISTER_LOCALE = function (code, payload) {
    window.__LP_LOCALES[code] = payload;
    var cbs = pendingCallbacks[code] || [];
    delete pendingCallbacks[code];
    for (var i = 0; i < cbs.length; i++) {
      try { cbs[i](payload); } catch (err) { console.error(err); }
    }
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getManifest() {
    return window.__LP_MANIFEST || { languages: [], categoryOrder: [], categoryCounts: {} };
  }

  function resolveLangCode(raw) {
    if (!raw) return '';
    var langs = getManifest().languages;
    var norm = String(raw).trim().replace('_', '-');
    var low = norm.toLowerCase();

    // Exact match (case-insensitive)
    for (var i = 0; i < langs.length; i++) {
      if (langs[i].code.toLowerCase() === low) return langs[i].code;
    }
    // Common browser BCP-47 aliases
    if (low === 'zh' || low === 'zh-cn' || low === 'zh-sg' || low.indexOf('zh-hans') === 0) return 'zh-Hans';
    if (low === 'zh-tw' || low === 'zh-hk' || low === 'zh-mo' || low.indexOf('zh-hant') === 0) return 'zh-Hant';
    if (low === 'nb' || low === 'nn' || low.indexOf('nb-') === 0 || low.indexOf('nn-') === 0) return 'no';
    if (low.indexOf('hr') === 0) return 'bs-Latn';
    if (low === 'ha-latn') return 'ha';

    // Primary subtag fallback
    var base = low.split('-')[0];
    for (var j = 0; j < langs.length; j++) {
      if (langs[j].code.toLowerCase() === base) return langs[j].code;
    }
    return '';
  }

  function detectInitialLang() {
    try {
      var params = new URLSearchParams(window.location.search);
      var qLang = resolveLangCode(params.get('lang'));
      if (qLang) return qLang;
    } catch (e) {}

    try {
      var saved = resolveLangCode(localStorage.getItem('logicpad_lang'));
      if (saved) return saved;
    } catch (e2) {}

    var navList = navigator.languages || [navigator.language || 'en'];
    for (var i = 0; i < navList.length; i++) {
      var matched = resolveLangCode(navList[i]);
      if (matched) return matched;
    }
    return 'en';
  }

  function loadLocale(code, callback) {
    var target = resolveLangCode(code) || 'en';
    if (window.__LP_LOCALES[target]) {
      callback(window.__LP_LOCALES[target]);
      return;
    }
    var firstWaiter = !pendingCallbacks[target];
    pendingCallbacks[target] = pendingCallbacks[target] || [];
    pendingCallbacks[target].push(callback);
    if (firstWaiter) {
      var sc = document.createElement('script');
      sc.src = 'i18n/' + encodeURIComponent(target) + '.js';
      sc.async = true;
      sc.onerror = function () {
        if (target !== 'en') loadLocale('en', callback);
      };
      document.head.appendChild(sc);
    }
  }

  /* State */
  var activeLangCode = 'en';
  var activeLocale = null;
  var homeSlideIdx = 1;
  var activeCategoryFilter = '';
  var activeNodeQuery = '';
  var activeCheatTab = 0;
  var activeFaqTab = 'faq';

  function findLangMeta(code) {
    var langs = getManifest().languages;
    for (var i = 0; i < langs.length; i++) {
      if (langs[i].code === code) return langs[i];
    }
    return { code: code, native: code, english: code, rtl: false, shot_key: 'en' };
  }

  function syncInternalLinks(code) {
    var links = document.querySelectorAll('a[data-keep-lang]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var baseHref = a.getAttribute('data-base-href') || a.getAttribute('href') || '';
      if (!a.getAttribute('data-base-href')) a.setAttribute('data-base-href', baseHref);
      var hashIdx = baseHref.indexOf('#');
      var pathPart = hashIdx >= 0 ? baseHref.slice(0, hashIdx) : baseHref;
      var hashPart = hashIdx >= 0 ? baseHref.slice(hashIdx) : '';
      if (pathPart) {
        a.setAttribute('href', pathPart + '?lang=' + encodeURIComponent(code) + hashPart);
      }
    }
  }

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el && val != null) el.textContent = val;
  }

  function renderLangModal(loc) {
    var modalBackdrop = document.getElementById('lp-lang-backdrop');
    if (!modalBackdrop) {
      modalBackdrop = document.createElement('div');
      modalBackdrop.id = 'lp-lang-backdrop';
      modalBackdrop.className = 'lang-modal-backdrop';
      modalBackdrop.innerHTML =
        '<div class="lang-modal" role="dialog" aria-modal="true" aria-labelledby="lp-lang-modal-title">' +
          '<div class="lang-modal-head">' +
            '<h3 id="lp-lang-modal-title"></h3>' +
            '<button type="button" class="lang-close-btn" id="lp-lang-close" aria-label="Close">✕</button>' +
          '</div>' +
          '<div class="lang-search-wrap">' +
            '<input type="search" class="lang-search-input" id="lp-lang-search" autocomplete="off">' +
          '</div>' +
          '<div class="lang-grid" id="lp-lang-grid"></div>' +
        '</div>';
      document.body.appendChild(modalBackdrop);

      modalBackdrop.addEventListener('click', function (ev) {
        if (ev.target === modalBackdrop) modalBackdrop.classList.remove('open');
      });
      document.getElementById('lp-lang-close').addEventListener('click', function () {
        modalBackdrop.classList.remove('open');
      });
      document.getElementById('lp-lang-search').addEventListener('input', function () {
        populateLangGrid(this.value);
      });
      document.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape') modalBackdrop.classList.remove('open');
      });
    }
    setText('lp-lang-modal-title', loc.nav.lang_modal_title);
    var sInput = document.getElementById('lp-lang-search');
    if (sInput) sInput.placeholder = loc.nav.lang_search;
    populateLangGrid(sInput ? sInput.value : '');
  }

  function populateLangGrid(filterText) {
    var grid = document.getElementById('lp-lang-grid');
    if (!grid) return;
    var q = String(filterText || '').trim().toLowerCase();
    var langs = getManifest().languages;
    var html = '';
    for (var i = 0; i < langs.length; i++) {
      var lg = langs[i];
      if (q && lg.native.toLowerCase().indexOf(q) === -1 && lg.english.toLowerCase().indexOf(q) === -1 && lg.code.toLowerCase().indexOf(q) === -1) {
        continue;
      }
      var isAct = lg.code === activeLangCode;
      html +=
        '<button type="button" class="lang-option' + (isAct ? ' active' : '') + '" data-lang-pick="' + esc(lg.code) + '">' +
          '<span><span class="lang-opt-native">' + esc(lg.native) + '</span><span class="lang-opt-en">' + esc(lg.english) + '</span></span>' +
          '<span class="lang-code-badge">' + esc(lg.code) + '</span>' +
        '</button>';
    }
    grid.innerHTML = html;
    var btns = grid.querySelectorAll('[data-lang-pick]');
    for (var b = 0; b < btns.length; b++) {
      btns[b].addEventListener('click', function () {
        var chosen = this.getAttribute('data-lang-pick');
        document.getElementById('lp-lang-backdrop').classList.remove('open');
        window.setLogicPadLang(chosen);
      });
    }
  }

  function renderSharedChrome(loc) {
    var metaInfo = findLangMeta(loc.code);
    setText('lp-cur-lang-native', metaInfo.native);
    setText('lp-cur-lang-code', loc.code);

    setText('nav-showcase', loc.nav.showcase);
    setText('nav-features', loc.nav.features);
    setText('nav-guide', loc.nav.guide);
    setText('nav-reference', loc.nav.reference);
    setText('nav-history', loc.nav.history);
    setText('nav-download', loc.nav.download);
    setText('nav-home', loc.nav.home);
    if (loc.guide && loc.guide.diagrams && loc.guide.diagrams.c3_cat_chart) {
      setText('nav-version-pill', '213 ' + loc.guide.diagrams.c3_cat_chart.unit + ' · 97 🌐');
    }

    setText('ft-rights', loc.nav.rights);
    setText('ft-home', loc.nav.home);
    setText('ft-guide', loc.nav.guide);
    setText('ft-release', loc.nav.release_notes);
    setText('ft-privacy', loc.nav.privacy);
    setText('ft-feedback', loc.nav.feedback);

    renderLangModal(loc);
    syncInternalLinks(loc.code);
  }

  /* =========================================================
     HOME PAGE RENDERER (index.html)
     ========================================================= */
  var SLIDE_META = {
    1: { theme: 'dark',  title: 'ai_kpi_pipeline.lpf — LogicPad' },
    2: { theme: 'light', title: 'sales_matrix_2d.lpf — LogicPad' },
    3: { theme: 'dark',  title: 'local_llm_audit.lpf — LogicPad' },
    4: { theme: 'light', title: 'web_excel_python.lpf — LogicPad' },
    5: { theme: 'dark',  title: 'color_media_loop.lpf — LogicPad' }
  };

  function renderHomeSlide() {
    if (!activeLocale) return;
    var h = activeLocale.home;
    var sm = SLIDE_META[homeSlideIdx] || SLIDE_META[1];
    var win = document.getElementById('showcase-window');
    var img = document.getElementById('showcase-img');
    var wt = document.getElementById('showcase-wintitle');
    var cap = document.getElementById('showcase-caption');

    if (win) {
      if (sm.theme === 'light') win.classList.add('light');
      else win.classList.remove('light');
    }
    if (img) {
      img.src = 'assets/ui/' + encodeURIComponent(activeLocale.shot) + '_' + homeSlideIdx + '.webp';
    }
    if (wt) wt.textContent = sm.title;
    if (cap) cap.textContent = h.sc_caps[homeSlideIdx - 1] || '';

    var tabs = document.querySelectorAll('.showcase-tab');
    for (var i = 0; i < tabs.length; i++) {
      var idx = parseInt(tabs[i].getAttribute('data-slide'), 10);
      tabs[i].classList.toggle('active', idx === homeSlideIdx);
      if (h.sc_tabs[idx - 1]) tabs[i].textContent = h.sc_tabs[idx - 1];
    }
  }

  function renderHomePage(loc) {
    document.title = loc.meta.home_title;
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', loc.meta.home_desc);

    var h = loc.home;
    setText('hero-lead', h.hero_lead);
    setText('hero-btn-store', h.btn_store);
    setText('hero-btn-guide', h.btn_guide);
    setText('hero-btn-explore', h.btn_explore);

    setText('m1-val', h.m1_val); setText('m1-lbl', h.m1_lbl);
    setText('m2-val', h.m2_val); setText('m2-lbl', h.m2_lbl);
    setText('m3-val', h.m3_val); setText('m3-lbl', h.m3_lbl);
    setText('m4-val', h.m4_val); setText('m4-lbl', h.m4_lbl);

    setText('sc-h2', h.sc_h2);
    setText('sc-p', h.sc_p);
    renderHomeSlide();

    // Guide Portal Promo Section
    setText('gp-badge', h.gp_badge);
    setText('gp-h2', h.gp_h2);
    setText('gp-p', h.gp_p);
    setText('gp-cta', h.gp_cta);
    var gpAnchors = ['#quickstart', '#part-1', '#part-4', '#reference'];
    var gpGrid = document.getElementById('gp-cards-grid');
    if (gpGrid && h.gp_cards) {
      gpGrid.innerHTML = h.gp_cards.map(function (c, idx) {
        var href = 'guide.html?lang=' + encodeURIComponent(loc.code) + (gpAnchors[idx] || '');
        return (
          '<a class="gp-card" href="' + href + '">' +
            '<span class="gp-step">' + esc(c[0]) + '</span>' +
            '<h3>' + esc(c[1]) + '</h3>' +
            '<p>' + esc(c[2]) + '</p>' +
          '</a>'
        );
      }).join('');
    }

    // Features
    setText('ft-h2', h.ft_h2);
    setText('ft-p', h.ft_p);
    var ftGrid = document.getElementById('features-grid');
    if (ftGrid && h.features) {
      ftGrid.innerHTML = h.features.map(function (f) {
        return (
          '<div class="feature-card">' +
            '<span class="feature-tag">' + esc(f[0]) + '</span>' +
            '<h3>' + esc(f[1]) + '</h3>' +
            '<p>' + esc(f[2]) + '</p>' +
          '</div>'
        );
      }).join('');
    }

    // Release History
    setText('hist-h2', h.hist_h2);
    setText('hist-p', h.hist_p);
    var histBox = document.getElementById('timeline-container');
    if (histBox && h.hist_blocks) {
      histBox.innerHTML = h.hist_blocks.map(function (blk, idx) {
        var items = blk[2].map(function (li) { return '<li>' + esc(li) + '</li>'; }).join('');
        return (
          '<div class="timeline-card' + (idx === 0 ? ' latest' : '') + '">' +
            '<div class="timeline-head"><h3>' + esc(blk[0]) + '</h3><span class="timeline-period">' + esc(blk[1]) + '</span></div>' +
            '<ul class="history-list">' + items + '</ul>' +
          '</div>'
        );
      }).join('');
    }

    // Download CTA
    setText('dl-h2', h.dl_h2);
    setText('dl-p', h.dl_p);
    setText('dl-btn-store', h.dl_btn_store);
    setText('dl-btn-guide', h.btn_guide);
    var badge = document.getElementById('ms-badge-bottom');
    if (badge) badge.setAttribute('language', loc.code.split('-')[0]);
  }

  /* =========================================================
     GUIDEBOOK PORTAL RENDERER (guide.html)
     ========================================================= */
  function renderNodeReference(loc) {
    var ru = loc.guide.ref_ui;
    setText('ref-h2', ru.h2);
    setText('ref-p', ru.p);
    var sIn = document.getElementById('ref-search-input');
    if (sIn) sIn.placeholder = ru.search_ph;

    setText('ref-th-id', ru.th_id);
    setText('ref-th-name', ru.th_name);
    setText('ref-th-cat', ru.th_cat);
    setText('ref-th-desc', ru.th_desc);
    setText('ref-th-params', ru.th_params);

    var manifest = getManifest();
    var pillsWrap = document.getElementById('ref-cat-pills');
    if (pillsWrap) {
      var pHtml = '<button type="button" class="cat-pill' + (activeCategoryFilter === '' ? ' active' : '') + '" data-cat="">' + esc(ru.all_cat) + ' (213)</button>';
      for (var i = 0; i < manifest.categoryOrder.length; i++) {
        var cJa = manifest.categoryOrder[i];
        var cLoc = (loc.categories && loc.categories[cJa]) ? loc.categories[cJa] : cJa;
        var cnt = manifest.categoryCounts[cJa] || 0;
        pHtml += '<button type="button" class="cat-pill' + (activeCategoryFilter === cJa ? ' active' : '') + '" data-cat="' + esc(cJa) + '">' + esc(cLoc) + ' (' + cnt + ')</button>';
      }
      pillsWrap.innerHTML = pHtml;
      var btns = pillsWrap.querySelectorAll('.cat-pill');
      for (var b = 0; b < btns.length; b++) {
        btns[b].addEventListener('click', function () {
          activeCategoryFilter = this.getAttribute('data-cat') || '';
          renderNodeReference(activeLocale);
        });
      }
    }

    var q = activeNodeQuery.trim().toLowerCase();
    var rows = [];
    for (var ni = 0; ni < loc.nodes.length; ni++) {
      var n = loc.nodes[ni]; // [id, type, cat_ja, cat_loc, name, desc, params[]]
      if (activeCategoryFilter && n[2] !== activeCategoryFilter) continue;
      if (q) {
        var hay = (n[1] + ' ' + n[3] + ' ' + n[4] + ' ' + n[5] + ' ' + n[6].join(' ')).toLowerCase();
        if (hay.indexOf(q) === -1) continue;
      }
      var pChips = n[6].length === 0
        ? '<span style="color:#9ca3af;font-size:0.82rem;">' + esc(ru.no_params) + '</span>'
        : n[6].map(function (pm, pi) { return '<span class="param-chip"><strong>' + pi + ':</strong> ' + esc(pm) + '</span>'; }).join('');
      var idPad = '#' + ('000' + n[0]).slice(-3);
      rows.push(
        '<tr>' +
          '<td class="ltr-token" style="font-weight:700;color:#64748b;">' + idPad + '</td>' +
          '<td><strong>' + esc(n[4]) + '</strong><br><span class="type-pill">' + esc(n[1] || 'none') + '</span></td>' +
          '<td>' + esc(n[3]) + '</td>' +
          '<td>' + esc(n[5]) + '</td>' +
          '<td>' + pChips + '</td>' +
        '</tr>'
      );
    }
    setText('ref-showing-count', ru.showing + ' ' + rows.length + ' / 213');
    var tbody = document.getElementById('ref-tbody');
    if (tbody) tbody.innerHTML = rows.join('');
  }

  window.__LP_JUMP_CATEGORY = function (catJa) {
    activeCategoryFilter = catJa || '';
    if (activeLocale) renderNodeReference(activeLocale);
    var refEl = document.getElementById('reference');
    if (refEl) refEl.scrollIntoView({ behavior: 'smooth' });
  };

  function renderCheatSheets(loc) {
    var cs = loc.guide.cheatsheets;
    setText('cs-h2', cs.h2);
    setText('cs-p', cs.p);
    var tabsEl = document.getElementById('cs-tabs');
    if (tabsEl) {
      tabsEl.innerHTML = cs.tabs.map(function (t, idx) {
        return '<button type="button" class="tab-btn' + (idx === activeCheatTab ? ' active' : '') + '" data-cs-idx="' + idx + '">' + esc(t) + '</button>';
      }).join('');
      var tb = tabsEl.querySelectorAll('[data-cs-idx]');
      for (var i = 0; i < tb.length; i++) {
        tb[i].addEventListener('click', function () {
          activeCheatTab = parseInt(this.getAttribute('data-cs-idx'), 10) || 0;
          renderCheatSheets(activeLocale);
        });
      }
    }
    setText('cs-th-item', cs.th_item);
    setText('cs-th-desc', cs.th_desc);
    var sheet = cs.sheets[activeCheatTab] || cs.sheets[0] || [];
    var tbody = document.getElementById('cs-tbody');
    if (tbody) {
      tbody.innerHTML = sheet.map(function (r) {
        return '<tr><td class="ltr-token"><code>' + esc(r[0]) + '</code></td><td>' + esc(r[1]) + '</td></tr>';
      }).join('');
    }
  }

  function renderFaqAndGlossary(loc) {
    var fq = loc.guide.faq;
    setText('fq-h2', fq.h2);
    var tabsEl = document.getElementById('fq-tabs');
    if (tabsEl) {
      tabsEl.innerHTML =
        '<button type="button" class="tab-btn' + (activeFaqTab === 'faq' ? ' active' : '') + '" data-fq="faq">' + esc(fq.q_tab) + '</button>' +
        '<button type="button" class="tab-btn' + (activeFaqTab === 'glossary' ? ' active' : '') + '" data-fq="glossary">' + esc(fq.g_tab) + '</button>';
      var btns = tabsEl.querySelectorAll('[data-fq]');
      for (var i = 0; i < btns.length; i++) {
        btns[i].addEventListener('click', function () {
          activeFaqTab = this.getAttribute('data-fq');
          renderFaqAndGlossary(activeLocale);
        });
      }
    }
    var body = document.getElementById('fq-body');
    if (!body) return;
    var list = activeFaqTab === 'glossary' ? fq.glossary : fq.items;
    body.innerHTML = list.map(function (item, idx) {
      var qTxt = String(item[0] || '');
      var prefix = (activeFaqTab === 'faq' && !/^(Q?\d+[\.\:：])/i.test(qTxt)) ? ((idx + 1) + '. ') : '';
      return '<div class="faq-item"><p class="faq-q">' + esc(prefix + qTxt) + '</p><p class="faq-a">' + esc(item[1]) + '</p></div>';
    }).join('');
  }

  function renderGuidePage(loc) {
    document.title = loc.meta.guide_title;
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', loc.meta.guide_desc);

    var g = loc.guide;
    setText('guide-badge', g.badge);
    setText('guide-h1', g.h1);
    setText('guide-lead', g.lead);
    setText('toc-heading', g.toc_title);

    // Sidebar TOC
    var tocList = document.getElementById('guide-toc-list');
    if (tocList) {
      var tocHtml =
        '<li><a class="toc-major" href="#roadmaps">' + esc(g.toc_roadmaps) + '</a></li>' +
        '<li><a class="toc-major" href="#quickstart">' + esc(g.toc_quickstart) + '</a></li>';
      for (var ci = 0; ci < g.chapters.length; ci++) {
        var ch = g.chapters[ci];
        tocHtml += '<li><a href="#ch-' + ch.num + '">' + esc(ch.title) + '</a></li>';
      }
      tocHtml +=
        '<li><a class="toc-major" href="#reference">' + esc(g.toc_reference) + '</a></li>' +
        '<li><a class="toc-major" href="#cheatsheets">' + esc(g.toc_cheatsheets) + '</a></li>' +
        '<li><a class="toc-major" href="#samples">' + esc(g.toc_samples) + '</a></li>' +
        '<li><a class="toc-major" href="#faq">' + esc(g.toc_faq) + '</a></li>';
      tocList.innerHTML = tocHtml;
    }

    // Roadmaps
    setText('rm-h2', g.roadmaps_h2);
    var rmGrid = document.getElementById('rm-grid');
    if (rmGrid) {
      var rmArrow = loc.rtl ? '← ' : '→ ';
      rmGrid.innerHTML = g.roadmaps.map(function (r) {
        return '<div class="rm-box"><h4>' + esc(r[0]) + '</h4><p style="margin:0;font-size:0.88rem;color:#4b5563;">' + esc(r[1]) + '</p><div class="rm-route">' + rmArrow + esc(r[2]) + '</div></div>';
      }).join('');
    }

    // 3-Minute Quick Start
    setText('qs-h2', g.qs_h2);
    setText('qs-p', g.qs_p);
    var qsGrid = document.getElementById('qs-grid');
    if (qsGrid) {
      qsGrid.innerHTML = g.qs_steps.map(function (st) {
        return '<div class="qs-box"><h4>' + esc(st[0]) + '</h4><p style="margin:0;font-size:0.89rem;color:#4b5563;">' + esc(st[1]) + '</p></div>';
      }).join('');
    }

    // All 8 Parts & 20 Chapters + Embedded Interactive Diagrams & Charts
    var chWrap = document.getElementById('chapters-container');
    if (chWrap) {
      var manifest = getManifest();
      var lastPart = -1;
      var cHtml = '';
      for (var i = 0; i < g.chapters.length; i++) {
        var c = g.chapters[i];
        if (c.part !== lastPart) {
          lastPart = c.part;
          cHtml += '<div class="part-banner" id="part-' + c.part + '">' + esc(g.parts[c.part] || '') + '</div>';
        }
        var ptsHtml = c.points.map(function (pt) { return '<li>' + esc(pt) + '</li>'; }).join('');
        var diagHtml = (c.diag && window.__LP_DIAGRAMS) ? window.__LP_DIAGRAMS.render(c.diag, loc, manifest) : '';
        cHtml +=
          '<article class="chapter-card" id="ch-' + c.num + '">' +
            '<h3>' + esc(c.title) + '</h3>' +
            '<div class="ch-goal"><strong>🎯 ' + esc(g.lbl_goal) + ':</strong> ' + esc(c.goal) + '</div>' +
            '<p class="ch-intro">' + esc(c.intro) + '</p>' +
            diagHtml +
            '<div class="ch-subhead">▪ ' + esc(g.lbl_steps) + '</div>' +
            '<ul class="ch-points">' + ptsHtml + '</ul>' +
            '<div class="ch-callout-grid">' +
              '<div class="ch-tip"><strong>💡 ' + esc(g.lbl_tip) + '</strong><br>' + esc(c.tip) + '</div>' +
              '<div class="ch-handson"><strong>🛠 ' + esc(g.lbl_handson) + '</strong><br>' + esc(c.handson) + '</div>' +
            '</div>' +
          '</article>';
      }
      chWrap.innerHTML = cHtml;
      if (window.__LP_DIAGRAMS) {
        if (g.diagrams && g.diagrams.d11_floodfill) {
          window.__LP_DIAGRAMS.paintCanvases(g.diagrams.d11_floodfill.badge_word);
        }
        if (window.__LP_DIAGRAMS.fitSvgText) {
          window.__LP_DIAGRAMS.fitSvgText();
        }
      }
    }

    // Part VIII Banner + 213-Node Interactive Encyclopedia
    setText('part-7', 'VIII — ' + g.toc_reference + ' · ' + g.toc_cheatsheets + ' · ' + g.toc_faq);
    renderNodeReference(loc);

    // Cheat Sheets
    renderCheatSheets(loc);

    // Sample .lpf Downloads
    var su = g.samples_ui;
    setText('smp-h2', su.h2);
    setText('smp-p', su.p);
    var smpGrid = document.getElementById('smp-grid');
    if (smpGrid) {
      smpGrid.innerHTML = su.list.map(function (s) {
        return (
          '<div class="sample-card">' +
            '<div><div class="ltr-token" style="font-family:Consolas,monospace;font-size:0.8rem;color:#0067c0;font-weight:700;margin-bottom:4px;">' + esc(s[0]) + '</div>' +
            '<h4 style="margin:0 0 6px;font-size:0.96rem;">' + esc(s[1]) + '</h4>' +
            '<p style="margin:0;font-size:0.86rem;color:#4b5563;">' + esc(s[2]) + '</p></div>' +
            '<div><a class="btn-secondary" style="padding:7px 14px;font-size:0.83rem;" href="samples/' + encodeURIComponent(s[0]) + '" download>' + esc(su.btn_dl) + '</a></div>' +
          '</div>'
        );
      }).join('');
    }

    // FAQ & Glossary
    renderFaqAndGlossary(loc);
  }

  /* =========================================================
     PRIVACY POLICY RENDERER (privacy.html)
     ========================================================= */
  function renderPrivacyPage(loc) {
    document.title = loc.meta.privacy_title;
    var pv = loc.privacy;
    setText('pv-back', pv.back);
    setText('pv-h1', pv.h1);
    setText('pv-updated', pv.updated);
    setText('pv-intro', pv.intro);
    var secWrap = document.getElementById('pv-sections');
    if (secWrap && pv.sections) {
      secWrap.innerHTML = pv.sections.map(function (s) {
        return '<h2 style="font-size:1.12rem;margin-top:24px;">' + esc(s[0]) + '</h2><p style="color:#374151;">' + esc(s[1]) + '</p>';
      }).join('');
    }
  }

  function applyLocale(loc) {
    activeLocale = loc;
    activeLangCode = loc.code;
    document.documentElement.setAttribute('lang', loc.code);
    document.documentElement.setAttribute('dir', loc.rtl ? 'rtl' : 'ltr');

    renderSharedChrome(loc);

    var pageKind = document.body.getAttribute('data-page');
    if (pageKind === 'home') renderHomePage(loc);
    else if (pageKind === 'guide') renderGuidePage(loc);
    else if (pageKind === 'privacy') renderPrivacyPage(loc);
  }

  window.setLogicPadLang = function (code) {
    var resolved = resolveLangCode(code) || 'en';
    try { localStorage.setItem('logicpad_lang', resolved); } catch (e) {}
    try {
      var url = new URL(window.location.href);
      url.searchParams.set('lang', resolved);
      window.history.replaceState({}, '', url.toString());
    } catch (e2) {}
    loadLocale(resolved, applyLocale);
  };

  window.selectHomeSlide = function (idx) {
    homeSlideIdx = idx;
    renderHomeSlide();
  };

  document.addEventListener('DOMContentLoaded', function () {
    var siteNav = document.querySelector('.site-nav');
    var navToggle = document.getElementById('lp-nav-toggle');
    var navLinks = document.getElementById('lp-nav-links');

    function closeMobileMenu() {
      if (siteNav && siteNav.classList.contains('menu-open')) {
        siteNav.classList.remove('menu-open');
        if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
      }
    }

    if (navToggle && siteNav) {
      navToggle.addEventListener('click', function (ev) {
        ev.stopPropagation();
        var isOpen = siteNav.classList.toggle('menu-open');
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    }
    if (navLinks) {
      navLinks.addEventListener('click', function (ev) {
        if (ev.target && ev.target.closest('a')) {
          closeMobileMenu();
        }
      });
    }
    document.addEventListener('click', function (ev) {
      if (siteNav && !siteNav.contains(ev.target)) {
        closeMobileMenu();
      }
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') closeMobileMenu();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 980) closeMobileMenu();
    });

    // Collapsible TOC sidebar on mobile/tablet (<= 980px)
    var guideSidebar = document.querySelector('.guide-sidebar');
    var tocHeading = document.getElementById('toc-heading');
    var tocListEl = document.getElementById('guide-toc-list');
    if (guideSidebar && tocHeading) {
      tocHeading.addEventListener('click', function () {
        if (window.innerWidth <= 980) {
          guideSidebar.classList.toggle('toc-open');
        }
      });
    }
    if (guideSidebar && tocListEl) {
      tocListEl.addEventListener('click', function (ev) {
        if (window.innerWidth <= 980 && ev.target && ev.target.closest('a')) {
          guideSidebar.classList.remove('toc-open');
        }
      });
    }

    var langBtn = document.getElementById('lp-lang-btn');
    if (langBtn) {
      langBtn.addEventListener('click', function () {
        closeMobileMenu();
        var bd = document.getElementById('lp-lang-backdrop');
        if (bd) {
          bd.classList.add('open');
          var inp = document.getElementById('lp-lang-search');
          if (inp) setTimeout(function () { inp.focus(); }, 30);
        }
      });
    }
    var refSearch = document.getElementById('ref-search-input');
    if (refSearch) {
      refSearch.addEventListener('input', function () {
        activeNodeQuery = this.value || '';
        if (activeLocale) renderNodeReference(activeLocale);
      });
    }
    var initial = detectInitialLang();
    loadLocale(initial, applyLocale);
  });
})();
