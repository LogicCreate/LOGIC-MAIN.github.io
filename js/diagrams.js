/* LogicPad 97-Language Interactive Vector Diagram, Native UI Callout & Chart Engine */
(function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function svgFitText(x, y, text, maxW, fontSize, weight, fill, anchor) {
    return (
      '<text class="lp-svg-fit" data-maxw="' + maxW + '" data-basefs="' + fontSize + '" ' +
      'x="' + x + '" y="' + y + '" text-anchor="' + (anchor || 'middle') + '" ' +
      'font-size="' + fontSize + '" font-weight="' + (weight || '700') + '" fill="' + (fill || '#0f172a') + '" ' +
      'unicode-bidi="plaintext">' + esc(text) + '</text>'
    );
  }

  function wrapHeader(dObj, innerHtml) {
    return (
      '<div class="diag-box">' +
      '<div class="diag-header"><h4>' + esc(dObj.title) + '</h4><p>' + esc(dObj.sub) + '</p></div>' +
      '<div class="diag-body">' + innerHtml + '</div>' +
      '</div>'
    );
  }

  function renderDiagram(diagId, loc, manifest) {
    var dg = loc.guide.diagrams;
    if (!dg || !dg[diagId]) return '';
    var d = dg[diagId];

    if (diagId === 'd1_hello') {
      var body =
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;align-items:center;">' +
          '<svg viewBox="0 0 360 270" style="width:100%;max-width:360px;margin:0 auto;display:block;direction:ltr;" role="img" aria-label="' + esc(d.title) + '">' +
            '<defs><marker id="arw1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" fill="#059669"/></marker></defs>' +
            '<rect x="55" y="14" width="250" height="48" rx="24" fill="#dcfce7" stroke="#059669" stroke-width="2.5"/>' +
            svgFitText(180, 43, d.n_start, 224, 14, '700', '#0f172a', 'middle') +
            '<line x1="180" y1="62" x2="180" y2="96" stroke="#059669" stroke-width="2.5" marker-end="url(#arw1)"/>' +
            '<rect x="25" y="100" width="310" height="66" rx="10" fill="#ffffff" stroke="#0067c0" stroke-width="2.5"/>' +
            svgFitText(180, 127, d.n_out, 288, 14, '700', '#0f172a', 'middle') +
            svgFitText(180, 150, d.n_out_sub, 288, 12, '500', '#475569', 'middle') +
            '<line x1="180" y1="166" x2="180" y2="200" stroke="#059669" stroke-width="2.5" marker-end="url(#arw1)"/>' +
            '<rect x="55" y="204" width="250" height="48" rx="24" fill="#f1f5f9" stroke="#334155" stroke-width="2.5"/>' +
            svgFitText(180, 233, d.n_end, 224, 14, '700', '#0f172a', 'middle') +
          '</svg>' +
          '<div style="background:#0f172a;color:#e2e8f0;border-radius:10px;padding:16px 18px;font-size:0.86rem;border:1px solid #334155;">' +
            '<div style="font-weight:700;color:#38bdf8;margin-bottom:10px;border-bottom:1px solid #1e293b;padding-bottom:6px;">' + esc(d.out_win) + '</div>' +
            '<div style="color:#94a3b8;margin-bottom:6px;">' + esc(d.out_line1) + '</div>' +
            '<div style="color:#34d399;font-weight:700;font-size:0.96rem;margin-bottom:6px;">' + esc(d.out_line2) + '</div>' +
            '<div style="color:#94a3b8;">' + esc(d.out_line3) + '</div>' +
          '</div>' +
        '</div>';
      return wrapHeader(d, body);
    }

    if (diagId === 'd2_panes') {
      var cards = '';
      for (var i = 0; i < d.items.length; i++) {
        cards +=
          '<div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;">' +
            '<div style="font-weight:700;font-size:0.86rem;color:#0067c0;margin-bottom:3px;">' + esc(d.items[i][0]) + '</div>' +
            '<div style="font-size:0.82rem;color:#475569;line-height:1.5;">' + esc(d.items[i][1]) + '</div>' +
          '</div>';
      }
      var shotSrc = 'assets/ui/' + encodeURIComponent(loc.shot) + '_2.webp';
      var body2 =
        '<div class="window-frame light" style="margin-bottom:16px;">' +
          '<div class="window-titlebar"><div class="win-tb-left"><img src="icon.png" alt=""><span>LogicPad (' + esc(loc.code.toUpperCase()) + ')</span></div><div class="win-dots"><span>—</span><span>□</span><span>✕</span></div></div>' +
          '<div class="window-body"><img src="' + shotSrc + '" alt="' + esc(d.title) + '" loading="lazy"></div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;">' + cards + '</div>';
      return wrapHeader(d, body2);
    }

    if (diagId === 'c3_cat_chart') {
      var cats = manifest.categoryOrder;
      var counts = manifest.categoryCounts;
      var maxCnt = 41;
      var rowsHtml = '';
      for (var ci = 0; ci < cats.length; ci++) {
        var cJa = cats[ci];
        var cLoc = (loc.categories && loc.categories[cJa]) ? loc.categories[cJa] : cJa;
        var cnt = counts[cJa] || 0;
        var pct = Math.max(6, Math.round((cnt / maxCnt) * 100));
        rowsHtml +=
          '<div class="cat-bar-row" onclick="window.__LP_JUMP_CATEGORY && window.__LP_JUMP_CATEGORY(\'' + esc(cJa) + '\')">' +
            '<div class="cat-bar-label">' + esc(cLoc) + '</div>' +
            '<div class="cat-bar-track"><div class="cat-bar-fill" style="width:' + pct + '%"></div></div>' +
            '<div class="cat-bar-val">' + cnt + ' ' + esc(d.unit) + '</div>' +
          '</div>';
      }
      var body3 =
        '<div style="display:grid;gap:4px;">' + rowsHtml + '</div>' +
        '<div style="margin-top:14px;padding-top:10px;border-top:1px solid #e2e8f0;font-size:0.86rem;font-weight:650;color:#059669;text-align:center;">' +
          esc(d.total_label) +
        '</div>';
      return wrapHeader(d, body3);
    }

    if (diagId === 'd4_exception') {
      var svg4 =
        '<svg viewBox="0 0 780 280" style="width:100%;max-width:780px;margin:0 auto;display:block;direction:ltr;" role="img" aria-label="' + esc(d.title) + '">' +
          '<defs>' +
            '<marker id="aOk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,1 L9,5 L0,9 z" fill="#0067c0"/></marker>' +
            '<marker id="aEr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,1 L9,5 L0,9 z" fill="#e11d48"/></marker>' +
          '</defs>' +
          '<rect x="18" y="16" width="194" height="40" rx="20" fill="#dcfce7" stroke="#059669" stroke-width="2"/>' +
          svgFitText(115, 41, d.n_start, 174, 12.5, '700', '#0f172a', 'middle') +
          '<line x1="115" y1="56" x2="115" y2="84" stroke="#0067c0" stroke-width="2" marker-end="url(#aOk)"/>' +
          '<rect x="10" y="88" width="210" height="46" rx="8" fill="#ffffff" stroke="#0067c0" stroke-width="2"/>' +
          '<circle cx="24" cy="111" r="6" fill="#e11d48"/>' +
          svgFitText(121, 116, d.n_read, 178, 12, '700', '#0f172a', 'middle') +
          '<line x1="115" y1="134" x2="115" y2="168" stroke="#0067c0" stroke-width="2" marker-end="url(#aOk)"/>' +
          svgFitText(104, 156, d.lbl_ok, 94, 11, '700', '#0067c0', 'end') +
          '<rect x="10" y="172" width="210" height="42" rx="8" fill="#ffffff" stroke="#0067c0" stroke-width="2"/>' +
          svgFitText(115, 198, d.n_ok, 194, 12, '600', '#0f172a', 'middle') +
          '<line x1="115" y1="214" x2="115" y2="232" stroke="#0067c0" stroke-width="2" marker-end="url(#aOk)"/>' +
          '<rect x="28" y="235" width="174" height="34" rx="17" fill="#f1f5f9" stroke="#475569" stroke-width="2"/>' +
          svgFitText(115, 257, d.n_end, 154, 12, '700', '#0f172a', 'middle') +
          /* Individual Exception branch */
          '<path d="M220,111 L352,111 L352,152" fill="none" stroke="#e11d48" stroke-width="2" marker-end="url(#aEr)"/>' +
          svgFitText(286, 103, d.lbl_err, 124, 11, '700', '#e11d48', 'middle') +
          '<rect x="244" y="156" width="216" height="44" rx="8" fill="#ffe4e6" stroke="#e11d48" stroke-width="2"/>' +
          svgFitText(352, 183, d.n_exc, 200, 12, '700', '#9f1239', 'middle') +
          '<line x1="352" y1="200" x2="352" y2="225" stroke="#e11d48" stroke-width="2" marker-end="url(#aEr)"/>' +
          '<rect x="244" y="229" width="216" height="40" rx="8" fill="#ffffff" stroke="#e11d48" stroke-width="2"/>' +
          svgFitText(352, 254, d.n_rec, 200, 12, '500', '#0f172a', 'middle') +
          /* General Exception safety net */
          '<rect x="488" y="54" width="278" height="48" rx="8" fill="#ffe4e6" stroke="#e11d48" stroke-width="2.5"/>' +
          svgFitText(627, 83, d.n_gen, 260, 12.5, '700', '#9f1239', 'middle') +
          '<line x1="627" y1="102" x2="627" y2="152" stroke="#e11d48" stroke-width="2.5" marker-end="url(#aEr)"/>' +
          svgFitText(627, 132, d.lbl_catch, 250, 11, '700', '#e11d48', 'middle') +
          '<rect x="488" y="156" width="278" height="52" rx="8" fill="#ffffff" stroke="#334155" stroke-width="2"/>' +
          svgFitText(627, 187, d.n_log, 260, 12, '650', '#0f172a', 'middle') +
        '</svg>';
      return wrapHeader(d, svg4);
    }

    if (diagId === 'd5_types') {
      var body5 =
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;">' +
          '<div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:10px;padding:16px;">' +
            '<div style="font-weight:700;color:#be123c;margin-bottom:8px;">' + esc(d.float_title) + '</div>' +
            '<div class="ltr-token" style="font-family:Consolas,monospace;font-weight:700;background:#ffffff;padding:8px 10px;border-radius:6px;border:1px solid #fda4af;margin-bottom:8px;color:#9f1239;">' + esc(d.float_expr) + '</div>' +
            '<div style="font-size:0.85rem;color:#881337;">' + esc(d.float_note) + '</div>' +
          '</div>' +
          '<div style="background:#ecfdf5;border:2px solid #10b981;border-radius:10px;padding:16px;">' +
            '<div style="font-weight:700;color:#047857;margin-bottom:8px;">✓ ' + esc(d.rat_title) + '</div>' +
            '<div class="ltr-token" style="font-family:Consolas,monospace;font-weight:700;background:#ffffff;padding:8px 10px;border-radius:6px;border:1px solid #6ee7b7;margin-bottom:8px;color:#065f46;">' + esc(d.rat_expr) + '</div>' +
            '<div style="font-size:0.85rem;color:#064e3b;">' + esc(d.rat_note) + '</div>' +
          '</div>' +
        '</div>';
      return wrapHeader(d, body5);
    }

    if (diagId === 'd6_if') {
      var body6 =
        '<svg viewBox="0 0 650 232" style="width:100%;max-width:650px;margin:0 auto 12px;display:block;direction:ltr;" role="img" aria-label="' + esc(d.title) + '">' +
          '<polygon points="185,12 335,48 185,84 35,48" fill="#fef3c7" stroke="#d97706" stroke-width="2.5"/>' +
          svgFitText(185, 53, d.n_if, 205, 12.5, '700', '#0f172a', 'middle') +
          '<line x1="185" y1="84" x2="185" y2="116" stroke="#059669" stroke-width="2.5"/>' +
          '<text x="173" y="105" text-anchor="end" font-size="11.5" font-weight="700" fill="#059669">True</text>' +
          '<rect x="60" y="118" width="250" height="40" rx="8" fill="#dcfce7" stroke="#059669" stroke-width="2"/>' +
          svgFitText(185, 143, d.n_true, 232, 12, '700', '#0f172a', 'middle') +
          '<path d="M335,48 L495,48 L495,118" fill="none" stroke="#e11d48" stroke-width="2.5"/>' +
          '<text x="415" y="40" text-anchor="middle" font-size="11.5" font-weight="700" fill="#e11d48">False</text>' +
          '<rect x="370" y="118" width="250" height="40" rx="8" fill="#ffe4e6" stroke="#e11d48" stroke-width="2"/>' +
          svgFitText(495, 143, d.n_false, 232, 12, '700', '#0f172a', 'middle') +
          '<line x1="185" y1="158" x2="185" y2="182" stroke="#334155" stroke-width="2"/>' +
          '<path d="M495,158 L495,172 L185,172" fill="none" stroke="#334155" stroke-width="2"/>' +
          '<rect x="55" y="182" width="260" height="38" rx="8" fill="#ffffff" stroke="#0067c0" stroke-width="2"/>' +
          svgFitText(185, 206, d.n_merge, 242, 12, '700', '#0f172a', 'middle') +
        '</svg>' +
        '<div style="display:grid;gap:6px;font-size:0.85rem;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:10px 14px;">' +
          '<div><strong>•</strong> ' + esc(d.ops_title) + '</div>' +
          '<div><strong>•</strong> ' + esc(d.logic_title) + '</div>' +
        '</div>';
      return wrapHeader(d, body6);
    }

    if (diagId === 'd7_loop') {
      var body7 =
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;">' +
          '<div style="background:#f0fdf4;border:2px solid #059669;border-radius:10px;padding:14px;">' +
            '<div style="font-weight:700;color:#047857;margin-bottom:10px;">' + esc(d.ok_head) + '</div>' +
            '<svg viewBox="0 0 330 205" style="width:100%;max-width:330px;display:block;margin:0 auto;direction:ltr;">' +
              '<rect x="58" y="8" width="194" height="34" rx="7" fill="#ffffff" stroke="#475569" stroke-width="2"/>' +
              svgFitText(155, 30, d.n_init, 180, 12, '650', '#0f172a', 'middle') +
              '<line x1="155" y1="42" x2="155" y2="62" stroke="#475569" stroke-width="2"/>' +
              '<polygon points="155,60 265,88 155,116 45,88" fill="#fef3c7" stroke="#059669" stroke-width="2.5"/>' +
              svgFitText(155, 92, d.n_cond, 160, 11.5, '700', '#0f172a', 'middle') +
              '<line x1="155" y1="116" x2="155" y2="142" stroke="#059669" stroke-width="2"/>' +
              '<rect x="38" y="142" width="234" height="38" rx="7" fill="#ffffff" stroke="#0067c0" stroke-width="2"/>' +
              svgFitText(155, 165, d.n_body, 220, 11.5, '650', '#0f172a', 'middle') +
              '<path d="M38,161 L14,161 L14,88 L43,88" fill="none" stroke="#059669" stroke-width="3"/>' +
              '<polygon points="43,88 34,83 34,93" fill="#059669"/>' +
              '<line x1="265" y1="88" x2="320" y2="88" stroke="#64748b" stroke-width="2"/>' +
              svgFitText(293, 80, d.n_exit, 52, 10.5, '600', '#475569', 'middle') +
            '</svg>' +
            '<div style="font-size:0.84rem;font-weight:650;color:#065f46;margin-top:8px;text-align:center;">✓ ' + esc(d.ok_foot) + '</div>' +
          '</div>' +
          '<div style="background:#fff1f2;border:2px solid #e11d48;border-radius:10px;padding:14px;">' +
            '<div style="font-weight:700;color:#be123c;margin-bottom:10px;">' + esc(d.ng_head) + '</div>' +
            '<svg viewBox="0 0 330 205" style="width:100%;max-width:330px;display:block;margin:0 auto;direction:ltr;">' +
              '<rect x="58" y="8" width="194" height="34" rx="7" fill="#ffe4e6" stroke="#e11d48" stroke-width="2.5"/>' +
              svgFitText(155, 30, d.n_init, 180, 12, '700', '#9f1239', 'middle') +
              '<line x1="155" y1="42" x2="155" y2="62" stroke="#475569" stroke-width="2"/>' +
              '<polygon points="155,60 265,88 155,116 45,88" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>' +
              svgFitText(155, 92, d.n_cond, 160, 11.5, '700', '#0f172a', 'middle') +
              '<line x1="155" y1="116" x2="155" y2="142" stroke="#475569" stroke-width="2"/>' +
              '<rect x="38" y="142" width="234" height="38" rx="7" fill="#ffffff" stroke="#475569" stroke-width="2"/>' +
              svgFitText(155, 165, d.n_body, 220, 11.5, '500', '#0f172a', 'middle') +
              '<path d="M38,161 L14,161 L14,25 L56,25" fill="none" stroke="#e11d48" stroke-width="3"/>' +
              '<polygon points="56,25 47,20 47,30" fill="#e11d48"/>' +
            '</svg>' +
            '<div style="font-size:0.84rem;font-weight:650;color:#9f1239;margin-top:8px;text-align:center;">⚠ ' + esc(d.ng_foot) + '</div>' +
          '</div>' +
        '</div>';
      return wrapHeader(d, body7);
    }

    if (diagId === 'd8_array') {
      var ths = d.col_headers.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('');
      var trs = d.rows.map(function (r) {
        return '<tr><td><strong>' + esc(r[0]) + '</strong></td><td>' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td><td>' + esc(r[3]) + '</td></tr>';
      }).join('');
      var body8 =
        '<div class="table-scroll" style="margin-bottom:12px;"><table class="lp-table"><thead><tr>' + ths + '</tr></thead><tbody>' + trs + '</tbody></table></div>' +
        '<div style="display:grid;gap:6px;font-size:0.86rem;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px;">' +
          '<div><strong>•</strong> ' + esc(d.idx_note) + '</div>' +
          '<div style="color:#0067c0;font-weight:600;"><strong>•</strong> ' + esc(d.stats_note) + '</div>' +
          '<div style="color:#059669;font-weight:600;"><strong>•</strong> ' + esc(d.trans_note) + '</div>' +
        '</div>';
      return wrapHeader(d, body8);
    }

    if (diagId === 'c9_perf_chart') {
      var colors = ['#059669', '#0067c0', '#94a3b8'];
      var bHtml = '';
      for (var bi = 0; bi < d.bars.length; bi++) {
        var b = d.bars[bi];
        var w = Math.max(4, Math.min(100, Number(b[2]) || 10));
        bHtml +=
          '<div style="margin-bottom:12px;">' +
            '<div style="display:flex;justify-content:space-between;gap:10px;font-size:0.87rem;margin-bottom:4px;">' +
              '<strong>' + esc(b[0]) + '</strong>' +
              '<span style="color:#334155;font-weight:600;">' + esc(b[1]) + '</span>' +
            '</div>' +
            '<div style="height:20px;background:#e2e8f0;border-radius:999px;overflow:hidden;">' +
              '<div style="height:100%;width:' + w + '%;background:' + colors[bi % 3] + ';border-radius:999px;"></div>' +
            '</div>' +
          '</div>';
      }
      return wrapHeader(d, bHtml);
    }

    if (diagId === 'd10_ai_web') {
      var arrowChar = loc.rtl ? '←' : '→';
      var stHtml = d.steps.map(function (s, idx) {
        var stepNum = ('0' + (idx + 1)).slice(-2);
        var stepCard =
          '<div style="flex:1;min-width:135px;background:#ffffff;border:2px solid #0067c0;border-radius:10px;padding:12px 10px;text-align:center;font-size:0.85rem;font-weight:650;color:#0f172a;">' +
            '<div style="display:inline-block;background:#dcfce7;color:#047857;border-radius:999px;padding:1px 8px;font-size:0.72rem;font-weight:800;margin-bottom:5px;">' + stepNum + '</div>' +
            '<div>' + esc(s) + '</div>' +
          '</div>';
        if (idx < d.steps.length - 1) {
          stepCard += '<div style="font-weight:700;color:#059669;font-size:1.2rem;align-self:center;">' + arrowChar + '</div>';
        }
        return stepCard;
      }).join('');
      return wrapHeader(d, '<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;">' + stHtml + '</div>');
    }

    if (diagId === 'd11_floodfill') {
      var body11 =
        '<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:18px;">' +
          '<div style="background:#ffffff;border:1px solid #cbd5e1;border-radius:10px;padding:12px;text-align:center;">' +
            '<div style="font-size:0.83rem;font-weight:650;margin-bottom:8px;">' + esc(d.before_lbl) + '</div>' +
            '<canvas id="cv-flood-before" width="220" height="170" style="border:1px solid #e2e8f0;border-radius:6px;display:block;margin:0 auto;"></canvas>' +
          '</div>' +
          '<div style="background:#ecfdf5;border:2px solid #059669;color:#047857;font-weight:700;padding:8px 14px;border-radius:999px;font-size:0.86rem;">' +
            esc(d.arrow_lbl) + (loc.rtl ? ' ←' : ' →') +
          '</div>' +
          '<div style="background:#ffffff;border:2px solid #059669;border-radius:10px;padding:12px;text-align:center;">' +
            '<div style="font-size:0.83rem;font-weight:700;color:#047857;margin-bottom:8px;">' + esc(d.after_lbl) + '</div>' +
            '<canvas id="cv-flood-after" width="220" height="170" style="border:1px solid #e2e8f0;border-radius:6px;display:block;margin:0 auto;"></canvas>' +
          '</div>' +
        '</div>';
      return wrapHeader(d, body11);
    }

    if (diagId === 'd12_subflow') {
      var body12 =
        '<div style="display:grid;gap:12px;max-width:740px;margin:0 auto;">' +
          '<div style="background:#dcfce7;border:2px solid #059669;border-radius:10px;padding:12px;text-align:center;font-weight:700;">' + esc(d.main_box) + '</div>' +
          '<div class="ltr-token" style="text-align:center;font-size:0.82rem;font-weight:700;color:#0067c0;">⇅ runworkflow (share_vars = ON)</div>' +
          '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;">' +
            '<div style="background:#ffffff;border:1.5px solid #0067c0;border-radius:8px;padding:10px;text-align:center;font-size:0.85rem;font-weight:600;">' + esc(d.sub1) + '</div>' +
            '<div style="background:#ffffff;border:1.5px solid #0067c0;border-radius:8px;padding:10px;text-align:center;font-size:0.85rem;font-weight:600;">' + esc(d.sub2) + '</div>' +
            '<div style="background:#ffffff;border:1.5px solid #0067c0;border-radius:8px;padding:10px;text-align:center;font-size:0.85rem;font-weight:600;">' + esc(d.sub3) + '</div>' +
          '</div>' +
          '<div style="background:#0f172a;color:#a7f3d0;border-radius:8px;padding:10px 14px;text-align:center;font-size:0.85rem;font-weight:600;">' + esc(d.git_box) + '</div>' +
        '</div>';
      return wrapHeader(d, body12);
    }

    return '';
  }

  function fitAllSvgText() {
    var els = document.querySelectorAll('text.lp-svg-fit');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var maxW = parseFloat(el.getAttribute('data-maxw') || '0');
      var baseFs = parseFloat(el.getAttribute('data-basefs') || '12');
      if (!maxW || typeof el.getComputedTextLength !== 'function') continue;
      el.removeAttribute('textLength');
      el.removeAttribute('lengthAdjust');
      el.setAttribute('font-size', String(baseFs));
      try {
        var len = el.getComputedTextLength();
        if (len > maxW && len > 0) {
          var scaled = Math.max(9.2, +(baseFs * (maxW / len)).toFixed(2));
          el.setAttribute('font-size', String(scaled));
          var len2 = el.getComputedTextLength();
          if (len2 > maxW) {
            el.setAttribute('textLength', String(maxW));
            el.setAttribute('lengthAdjust', 'spacingAndGlyphs');
          }
        }
      } catch (e) {}
    }
  }

  function paintFloodFillDemo(badgeWord) {
    function drawIcon(canvasId, outerFill) {
      var cv = document.getElementById(canvasId);
      if (!cv || !cv.getContext) return;
      var ctx = cv.getContext('2d');
      ctx.fillStyle = outerFill;
      ctx.fillRect(0, 0, 220, 170);
      ctx.fillStyle = '#1e40af';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(38, 20, 144, 130, 24);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(82, 62, 17, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(138, 62, 17, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.roundRect(62, 100, 96, 32, 8); ctx.fill();
      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 16px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(badgeWord || 'NEWS', 110, 122);
    }
    drawIcon('cv-flood-before', '#ffffff');
    drawIcon('cv-flood-after', '#ff8000');
  }

  window.__LP_DIAGRAMS = {
    render: renderDiagram,
    paintCanvases: paintFloodFillDemo,
    fitSvgText: fitAllSvgText
  };
})();
