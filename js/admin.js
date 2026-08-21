// AutoPrime — Admin Console (Premium Dashboard)

document.addEventListener("DOMContentLoaded", () => {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  /* ============================================================
     DATA LAYER (localStorage)
     ============================================================ */
  const DB = {
    key: "autoprime_data",
    get() {
      try { const raw = localStorage.getItem(this.key); return raw ? JSON.parse(raw) : null; }
      catch (e) { return null; }
    },
    save(obj) {
      try { localStorage.setItem(this.key, JSON.stringify(obj)); return true; }
      catch (e) { return false; }
    },
    all() { return this.get() || {}; },
    set(key, val) {
      const d = this.all();
      d[key] = val;
      this.save(d);
    },
    cars() { const d = this.get(); return (d && Array.isArray(d.cars) && d.cars.length) ? d.cars : DEFAULT_CARS; },
    bookingKey: "autoprime_bookings",
    msgKey: "autoprime_messages",
    analyticsKey: "autoprime_analytics",
    bookings() { try { return JSON.parse(localStorage.getItem(this.bookingKey) || "[]"); } catch (e) { return []; } },
    saveBookings(list) { localStorage.setItem(this.bookingKey, JSON.stringify(list)); },
    messages() { try { return JSON.parse(localStorage.getItem(this.msgKey) || "[]"); } catch (e) { return []; } },
    saveMessages(list) { localStorage.setItem(this.msgKey, JSON.stringify(list)); },
    analytics() { try { return JSON.parse(localStorage.getItem(this.analyticsKey) || "{}"); } catch (e) { return {}; } },
    saveAnalytics(obj) { localStorage.setItem(this.analyticsKey, JSON.stringify(obj)); },
    dealsKey: "autoprime_deals",
    deals() { try { return JSON.parse(localStorage.getItem(this.dealsKey) || "[]"); } catch (e) { return []; } },
    saveDeals(list) { localStorage.setItem(this.dealsKey, JSON.stringify(list)); },
    invoicesKey: "autoprime_invoices",
    invoices() { try { return JSON.parse(localStorage.getItem(this.invoicesKey) || "[]"); } catch (e) { return []; } },
    saveInvoices(list) { localStorage.setItem(this.invoicesKey, JSON.stringify(list)); },
    accentKey: "autoprime_accent",
    accent() { return localStorage.getItem(this.accentKey) || "gold"; },
    setAccent(a) { localStorage.setItem(this.accentKey, a); }
  };

  const toast = (msg, type = "success") => {
    const t = document.createElement("div");
    t.className = "toast " + type;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add("fade-out"), 2600);
    setTimeout(() => t.remove(), 3100);
  };

  const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const fmtMoney = (n) => "$" + Number(n || 0).toLocaleString();
  const fmtDate = (ts) => new Date(ts).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  /* ============================================================
     AUTH
     ============================================================ */
  const AUTH_KEY = "autoprime_admin";
  const DEFAULT_USER = "admin";
  const DEFAULT_PASS = "autoprime2026";

  const getCreds = () => {
    try { const r = localStorage.getItem(AUTH_KEY); return r ? JSON.parse(r) : { user: DEFAULT_USER, pass: DEFAULT_PASS }; }
    catch (e) { return { user: DEFAULT_USER, pass: DEFAULT_PASS }; }
  };
  const isLoggedIn = () => sessionStorage.getItem("autoprime_logged") === "1";

  const showLogin = () => {
    $("#loginScreen").style.display = "flex";
    $("#adminWrap").style.display = "none";
  };
  const showAdmin = () => {
    $("#loginScreen").style.display = "none";
    $("#adminWrap").style.display = "flex";
    renderAll();
  };

  $("#loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const creds = getCreds();
    if ($("#loginUser").value.trim() === creds.user && $("#loginPass").value === creds.pass) {
      sessionStorage.setItem("autoprime_logged", "1");
      $("#loginError").textContent = "";
      e.target.reset();
      showAdmin();
    } else {
      $("#loginError").textContent = "Invalid username or password.";
    }
  });
  $("#logoutBtn").addEventListener("click", () => { sessionStorage.removeItem("autoprime_logged"); showLogin(); });

  /* ============================================================
     NAVIGATION
     ============================================================ */
  $$(".nav-item").forEach((btn) =>
    btn.addEventListener("click", () => {
      $$(".nav-item").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      $$(".tab-panel").forEach((p) => p.classList.remove("active"));
      const tab = $("#tab-" + btn.dataset.tab);
      if (tab) tab.classList.add("active");
      if (btn.dataset.tab === "dashboard") renderDashboard();
      if (btn.dataset.tab === "analytics") renderAnalytics();
      if (btn.dataset.tab === "pipeline") renderPipeline();
      if (btn.dataset.tab === "financials") renderFinancials();
    })
  );

  /* ============================================================
     SEED DEMO DATA (first visit)
     ============================================================ */
  const seedDemo = () => {
    if (!localStorage.getItem("autoprime_seeded")) {
      const now = Date.now();
      DB.saveBookings([
        { id: 1, name: "Sophia Laurent", car: "Bentley Continental GT", plan: "Grand Tour", date: "2026-08-22", days: 3, status: "pending", created: now - 86400000 * 2, email: "sophia@example.com", phone: "+1 310 555 0192" },
        { id: 2, name: "Marcus Delgado", car: "Lamborghini Revuelto", plan: "Racing", date: "2026-08-25", days: 1, status: "pending", created: now - 86400000, email: "marcus@example.com", phone: "+1 415 555 0147" },
        { id: 3, name: "Alexander Whitmore", car: "Rolls-Royce Phantom", plan: "Executive", date: "2026-08-18", days: 2, status: "confirmed", created: now - 86400000 * 4, email: "alex@example.com", phone: "+44 20 5555 0133" }
      ]);
      DB.saveMessages([
        { id: 1, name: "Priya Sharma", email: "priya@example.com", subject: "Acquisition", message: "Interested in the Porsche 911 Turbo S. Please arrange a private viewing.", status: "new", created: now - 3600000 * 5 },
        { id: 2, name: "Daniel Kim", email: "daniel@example.com", subject: "Rental", message: "Need a Grand Tour rental for a wedding in Monaco next month.", status: "new", created: now - 3600000 * 20 },
        { id: 3, name: "Isabella Rossi", email: "isabella@example.com", subject: "Sourcing", message: "Looking for a low-mileage SF90. Can you source one?", status: "read", created: now - 86400000 * 2 }
      ]);
      DB.saveAnalytics({
        views: 1284, leads: 47,
        weekly: [12, 18, 15, 22, 19, 28, 24]
      });
      DB.saveDeals([
        { id: 1, customer: "Sophia Laurent", car: "Bentley Continental GT", value: 285000, stage: "negotiation", created: now - 86400000 * 3 },
        { id: 2, customer: "Marcus Delgado", car: "Lamborghini Revuelto", value: 610000, stage: "lead", created: now - 86400000 * 2 },
        { id: 3, customer: "Alexander Whitmore", car: "Rolls-Royce Phantom", value: 520000, stage: "agreement", created: now - 86400000 * 5 },
        { id: 4, customer: "Isabella Rossi", car: "Ferrari SF90 XX", value: 870000, stage: "closed", created: now - 86400000 * 7 }
      ]);
      DB.saveInvoices([
        { id: "INV-2026-0001", customer: "Alexander Whitmore", item: "Rolls-Royce Phantom — Executive Rental", amount: 18400, status: "paid", created: now - 86400000 * 4 },
        { id: "INV-2026-0002", customer: "Marcus Delgado", item: "Lamborghini Revuelto — Racing Rental", amount: 9600, status: "open", created: now - 86400000 },
        { id: "INV-2026-0003", customer: "Sophia Laurent", item: "Bentley Continental GT — Grand Tour", amount: 7300, status: "open", created: now - 3600000 * 30 }
      ]);
      localStorage.setItem("autoprime_seeded", "1");
    }
  };
  seedDemo();

  /* ============================================================
     DASHBOARD
     ============================================================ */
  const renderDashboard = () => {
    const cars = DB.cars();
    const bookings = DB.bookings();
    const messages = DB.messages();
    const an = DB.analytics();

    $("#statCars").textContent = cars.length;
    $("#statValue").textContent = "$" + Math.round(cars.reduce((s, c) => s + (c.price || 0), 0) / 1000).toLocaleString() + "K";
    $("#statBookings").textContent = bookings.length;
    $("#statMessages").textContent = messages.filter((m) => m.status === "new").length;
    $("#trendCars").textContent = Math.max(0, Math.round(cars.length * 0.15));
    $("#statAvg").textContent = fmtMoney(cars.length ? Math.round(cars.reduce((s, c) => s + (c.price || 0), 0) / cars.length) : 0);
    $("#statPendingBookings").textContent = bookings.filter((b) => b.status === "pending").length;
    $("#statUnread").textContent = messages.filter((m) => m.status === "new").length;

    $("#badgeBookings").textContent = bookings.filter((b) => b.status === "pending").length || "";
    $("#badgeMessages").textContent = messages.filter((m) => m.status === "new").length || "";
    $("#badgeDashboard").textContent = (bookings.filter((b) => b.status === "pending").length + messages.filter((m) => m.status === "new").length) || "";
    $("#navCarsCount").textContent = cars.length;

    renderTypeChart(cars);
    renderDonut(cars);
    renderActivity(cars, bookings, messages);
    renderRevenueWidgets(cars, bookings);
    renderRevenueChart(cars);
    renderFunnel(cars, bookings);
    renderPerformance(cars, bookings, messages);
    renderAIInsights(cars, bookings, messages);
    renderNotifications(cars, bookings, messages);
  };

  /* ---------- REVENUE KPIs ---------- */
  const renderRevenueWidgets = (cars, bookings) => {
    const fleetVal = cars.reduce((s, c) => s + (c.price || 0), 0);
    const avgDeal = cars.length ? Math.round(fleetVal / cars.length) : 0;
    const monthly = fleetVal * 0.085;
    const ytd = monthly * 6;
    const projection = monthly * 12;
    const growth = Math.round(((monthly * 0.12) / monthly) * 100) || 12;

    $("#revMonthly").textContent = fmtMoney(Math.round(monthly));
    $("#revMonthlyTrend").textContent = "▲ " + growth + "% MoM";
    $("#revMonthlyTrend").style.color = "var(--success)";
    $("#revYTD").textContent = fmtMoney(Math.round(ytd));
    $("#revProjection").textContent = fmtMoney(Math.round(projection));
    $("#revProjectionTrend").textContent = "▲ Estimated growth";
    $("#revProjectionTrend").style.color = "var(--success)";
    $("#revAvgDeal").textContent = fmtMoney(avgDeal);
  };

  /* ---------- SVG LINE / AREA CHART ---------- */
  const renderRevenueChart = (cars) => {
    const base = cars.length ? cars.reduce((s, c) => s + (c.price || 0), 0) / cars.length : 200000;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const data = months.map((m, i) => {
      const wave = Math.sin(i / 1.7) * 0.12 + (i * 0.035);
      return Math.round(base * 0.6 * (1 + wave));
    });
    const proj = [...data.slice(-6)].map((v, i) => Math.round(v * (1 + 0.09 * (i + 1))));

    const W = 640, H = 260, padL = 44, padR = 12, padT = 18, padB = 28;
    const iw = W - padL - padR, ih = H - padT - padB;
    const max = Math.max(...data, ...proj) * 1.12;
    const X = (i, n) => padL + (i / (n - 1)) * iw;
    const Y = (v) => padT + ih - (v / max) * ih;

    let grid = "";
    for (let g = 0; g <= 4; g++) {
      const gy = padT + (g / 4) * ih;
      const val = Math.round(max * (1 - g / 4) / 1000) + "K";
      grid += `<line x1="${padL}" y1="${gy}" x2="${W - padR}" y2="${gy}" class="chart-grid-line"/>`;
      grid += `<text x="${padL - 8}" y="${gy + 4}" text-anchor="end" class="chart-y-label">$${val}</text>`;
    }

    const linePath = data.map((v, i) => (i === 0 ? `M${X(i, 12)} ${Y(v)}` : `L${X(i, 12)} ${Y(v)}`)).join(" ");
    const areaPath = linePath + ` L${X(11, 12)} ${padT + ih} L${X(0, 12)} ${padT + ih} Z`;
    const projPath = "M" + data.slice(0, 7).map((v, i) => `${X(i, 12)} ${Y(v)}`).join(" ") +
      " " + proj.map((v, i) => `L${X(7 + i, 12)} ${Y(v)}`).join(" ") +
      ` M${X(7, 12)} ${Y(data[7])}`;

    const dots = data.map((v, i) => `<circle cx="${X(i, 12)}" cy="${Y(v)}" r="3.5" class="chart-dot" data-i="${i}"/>`).join("");
    const projDots = proj.map((v, i) => `<circle cx="${X(7 + i, 12)}" cy="${Y(v)}" r="3" class="chart-dot-2"/>`).join("");
    const labels = months.map((m, i) => (i % 2 === 0 ? `<text x="${X(i, 12)}" y="${H - 8}" text-anchor="middle" class="chart-x-label">${m}</text>` : "")).join("");

    $("#revChart").innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" class="svg-chart" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#c8a24c" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#c8a24c" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${grid}
        <path d="${areaPath}" class="chart-area"/>
        <path d="${linePath}" class="chart-line"/>
        <path d="${projPath}" class="chart-line-2"/>
        ${dots}${projDots}${labels}
      </svg>
      <div class="chart-tooltip" id="revTooltip"></div>`;

    const tooltip = $("#revTooltip");
    const svgWrap = $("#revChart");
    document.querySelectorAll("#revChart .chart-dot").forEach((d) => {
      d.addEventListener("mousemove", (e) => {
        const i = +d.dataset.i;
        tooltip.innerHTML = `<b>${months[i]}</b> ${fmtMoney(data[i])}`;
        tooltip.style.left = e.offsetX + 14 + "px";
        tooltip.style.top = e.offsetY - 10 + "px";
        tooltip.style.opacity = "1";
      });
      d.addEventListener("mouseleave", () => { tooltip.style.opacity = "0"; });
    });
  };

  /* ---------- DATA FLOW FUNNEL ---------- */
  const renderFunnel = (cars, bookings) => {
    const leads = 1200;
    const enquiries = 340;
    const bookingsCount = Math.max(bookings.length, 45);
    const confirmed = Math.max(bookings.filter((b) => b.status === "confirmed").length, 18);
    const steps = [
      { label: "Visitors", value: leads, pct: 100 },
      { label: "Enquiries", value: enquiries, pct: Math.round((enquiries / leads) * 100) },
      { label: "Bookings", value: bookingsCount, pct: Math.round((bookingsCount / leads) * 100) },
      { label: "Confirmed", value: confirmed, pct: Math.round((confirmed / leads) * 100) }
    ];
    $("#funnelChart").innerHTML = steps.map((s) => `
      <div class="funnel-step">
        <span class="funnel-label">${s.label}</span>
        <div class="funnel-bar"><div class="funnel-fill" style="width:${s.pct}%"><span class="funnel-value">${s.value}</span></div></div>
        <span style="color:var(--mist);font-size:0.72rem;min-width:36px;text-align:right">${s.pct}%</span>
      </div>`).join("");
  };

  /* ---------- TOP PERFORMING MODELS ---------- */
  const renderPerformance = (cars, bookings, messages) => {
    const weighted = cars.map((c) => {
      const bScore = bookings.filter((x) => (x.car || "").toLowerCase().includes(c.name.toLowerCase())).length * 30;
      const demand = (c.price >= 400000 ? 1.3 : 1) * (100 - Math.abs(500000 - c.price) / 10000) + bScore;
      return { name: c.name, score: Math.max(20, Math.min(100, Math.round(demand))), price: c.price };
    }).sort((a, b) => b.score - a.score).slice(0, 6);
    const max = weighted[0] ? weighted[0].score : 1;
    $("#perfList").innerHTML = weighted.map((w, i) => `
      <div class="perf-item">
        <span class="perf-rank">${i + 1}</span>
        <div class="perf-info">
          <div class="perf-name">${esc(w.name)} <small>· ${fmtMoney(w.price)}</small></div>
          <div class="perf-track"><div class="perf-bar" style="width:${Math.round((w.score / max) * 100)}%"></div></div>
        </div>
        <span class="perf-value">${w.score}%</span>
      </div>`).join("");
  };

  const renderTypeChart = (cars) => {
    const types = {};
    cars.forEach((c) => { types[c.type] = (types[c.type] || 0) + 1; });
    const sorted = Object.entries(types).sort((a, b) => b[1] - a[1]);
    const max = Math.max(...sorted.map(([, n]) => n), 1);
    $("#typeChart").innerHTML = sorted.map(([t, n]) => `
      <div class="bar-col">
        <div class="bar-wrap"><div class="bar" style="height:${(n / max) * 100}%"></div></div>
        <span class="bar-label">${esc(t)} (${n})</span>
      </div>`).join("");
  };

  const renderDonut = (cars) => {
    const ranges = [
      { label: "Under $300K", min: 0, max: 300000, color: "var(--gold)" },
      { label: "$300K–$500K", min: 300000, max: 500000, color: "var(--gold-light)" },
      { label: "$500K+", min: 500000, max: Infinity, color: "var(--gold-dark)" }
    ];
    const counts = ranges.map((r) => cars.filter((c) => c.price >= r.min && c.price < r.max).length);
    const total = cars.length || 1;
    let start = 0;
    const gradient = counts.map((n, i) => {
      const deg = (n / total) * 360;
      const seg = `${ranges[i].color} ${start}deg ${start + deg}deg`;
      start += deg;
      return seg;
    }).join(", ");
    const el = $("#donutChart"); if (!el) return;
    el.style.background = `conic-gradient(${gradient})`;
    const dt = $("#donutTotal"); if (dt) dt.textContent = cars.length;
    const lg = $("#legendList"); if (lg) lg.innerHTML = ranges.map((r, i) => `
      <div class="legend-item"><span class="legend-dot" style="background:${r.color}"></span> ${r.label} <strong>${counts[i]}</strong></div>`).join("");
  };

  const renderActivity = (cars, bookings, messages) => {
    const items = [];
    bookings.forEach((b) => items.push({ text: `<b>${esc(b.name)}</b> requested the ${esc(b.plan)} rental (${esc(b.car)})`, time: fmtDate(b.created), type: b.status === "pending" ? "warn" : "green", raw: b.created }));
    messages.forEach((m) => items.push({ text: `<b>${esc(m.name)}</b> sent an enquiry: "${esc(m.subject)}"`, time: fmtDate(m.created), type: m.status === "new" ? "gold" : "blue", raw: m.created }));
    cars.forEach((c) => items.push({ text: `<b>${esc(c.name)}</b> is available in inventory`, time: "now", type: "gold", raw: Date.now() }));
    items.sort((a, b) => b.raw - a.raw);
    const list = items.slice(0, 7);
    $("#activityList").innerHTML = list.length
      ? list.map((i) => `<div class="activity-item"><span class="activity-dot ${i.type}"></span><span class="activity-text">${i.text}</span><span class="activity-time">${i.time}</span></div>`).join("")
      : `<div class="empty-state"><span class="empty-icon">◈</span>No activity yet.</div>`;
  };

  /* ---------- AI INSIGHTS ---------- */
  const renderAIInsights = (cars, bookings, messages) => {
    const insights = [];
    const pendingB = bookings.filter((b) => b.status === "pending").length;
    const unread = messages.filter((m) => m.status === "new").length;
    const totalVal = cars.reduce((s, c) => s + (c.price || 0), 0);

    if (pendingB > 0) insights.push({ tag: "Action", ico: "⏳", text: `<b>${pendingB} booking${pendingB > 1 ? "s" : ""}</b> awaiting your approval — respond quickly to close the deal.` });
    if (unread > 0) insights.push({ tag: "Lead", ico: "✉", text: `<b>${unread} unread message${unread > 1 ? "s" : ""}</b> in your inbox. New leads convert best within the first hour.` });
    if (totalVal > 0) insights.push({ tag: "Insight", ico: "📈", text: `Your fleet is valued at <b>${fmtMoney(Math.round(totalVal))}</b>. Projected annual revenue: <b>${fmtMoney(Math.round(totalVal * 0.85))}</b>.` });
    if (cars.length > 0) {
      const top = cars.reduce((a, b) => (a.price || 0) > (b.price || 0) ? a : b);
      insights.push({ tag: "Spotlight", ico: "🏆", text: `<b>${esc(top.name)}</b> is your most valuable asset. Feature it prominently to drive premium leads.` });
    }
    const conv = (bookings.length && (bookings.length + messages.length)) ? Math.round((bookings.length / (bookings.length + messages.length + 30)) * 100) : 0;
    insights.push({ tag: "Signal", ico: conv > 40 ? "🚀" : "🧭", text: conv > 40 ? `Strong momentum — <b>${conv}%</b> of interactions convert to bookings. Keep the inventory fresh.` : `Consider refreshing your fleet — only <b>${conv}%</b> of interactions convert to bookings.` });

    $("#aiInsights").innerHTML = insights.slice(0, 4).map((i) => `
      <div class="ai-insight">
        <span class="ai-ico">${i.ico}</span>
        <div><span class="ai-tag">${i.tag}</span><div class="ai-text">${i.text}</div></div>
      </div>`).join("");
  };

  /* ---------- NOTIFICATIONS ---------- */
  const renderNotifications = (cars, bookings, messages) => {
    const items = [];
    bookings.forEach((b) => items.push({ ico: "gold", text: `New booking: <b>${esc(b.name)}</b> · ${esc(b.plan)}`, time: fmtDate(b.created), raw: b.created }));
    messages.forEach((m) => items.push({ ico: "blue", text: `Message from <b>${esc(m.name)}</b>: "${esc(m.subject)}"`, time: fmtDate(m.created), raw: m.created }));
    items.sort((a, b) => b.raw - a.raw);
    const total = items.length;
    $("#notifBadge").textContent = total || "";
    $("#notifList").innerHTML = total
      ? items.slice(0, 8).map((i) => `<div class="notif-item"><span class="ni-dot" style="background:var(--${i.ico})"></span><div><div>${i.text}</div><div class="ni-time">${i.time}</div></div></div>`).join("")
      : `<div class="notif-empty">No notifications yet.</div>`;
  };

  /* ---------- SALES PIPELINE (KANBAN) ---------- */
  const STAGES = ["lead", "negotiation", "agreement", "closed"];
  const STAGE_LABELS = { lead: "Lead", negotiation: "Negotiation", agreement: "Agreement", closed: "Closed Won" };

  const renderPipeline = () => {
    const deals = DB.deals();
    if (!deals.length) seedPipeline();
    const list = DB.deals();
    let totalVal = 0, closedVal = 0;
    list.forEach((d) => { totalVal += d.value || 0; if (d.stage === "closed") closedVal += d.value || 0; });
    $("#pipelineSummary").innerHTML = STAGES.map((s) => {
      const seg = list.filter((d) => d.stage === s);
      const val = seg.reduce((a, d) => a + (d.value || 0), 0);
      return `<div class="pipe-stat"><div class="ps-label">${STAGE_LABELS[s]}</div><div class="ps-value">${seg.length}<small> · ${fmtMoney(val)}</small></div></div>`;
    }).join("");
    $("#kanbanBoard").innerHTML = STAGES.map((s) => `
      <div class="kanban-col" data-stage="${s}">
        <div class="kanban-head"><h4>${STAGE_LABELS[s]}</h4><span class="kb-count">${list.filter((d) => d.stage === s).length}</span></div>
        <div class="kanban-body">
          ${list.filter((d) => d.stage === s).map((d) => `
            <div class="deal-card" draggable="true" data-id="${d.id}">
              <div class="dc-customer">${esc(d.customer)}</div>
              <div class="dc-car">${esc(d.car || "—")}</div>
              <div class="dc-foot">
                <span class="dc-value">${fmtMoney(d.value)}</span>
                <button class="dc-del" data-id="${d.id}">✕</button>
              </div>
            </div>`).join("") || `<div class="notif-empty">No deals</div>`}
        </div>
      </div>`).join("");
    bindKanban();
  };

  const seedPipeline = () => {
    const now = Date.now();
    const def = [
      { id: 1, customer: "Sophia Laurent", car: "Bentley Continental GT", value: 285000, stage: "negotiation", created: now - 86400000 * 3 },
      { id: 2, customer: "Marcus Delgado", car: "Lamborghini Revuelto", value: 610000, stage: "lead", created: now - 86400000 * 2 },
      { id: 3, customer: "Alexander Whitmore", car: "Rolls-Royce Phantom", value: 520000, stage: "agreement", created: now - 86400000 * 5 },
      { id: 4, customer: "Isabella Rossi", car: "Ferrari SF90 XX", value: 870000, stage: "closed", created: now - 86400000 * 7 }
    ];
    DB.saveDeals(def);
  };

  const bindKanban = () => {
    let dragged = null;
    $$(".deal-card").forEach((card) => {
      card.addEventListener("dragstart", (e) => {
        dragged = card;
        card.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
      });
      card.addEventListener("dragend", () => { card.classList.remove("dragging"); $$(".kanban-col").forEach((c) => c.classList.remove("dragover")); });
      card.querySelector(".dc-del").addEventListener("click", (e) => {
        e.stopPropagation();
        if (!confirm("Remove this deal?")) return;
        DB.saveDeals(DB.deals().filter((d) => d.id !== +card.dataset.id));
        renderPipeline();
        toast("Deal removed.");
      });
    });
    $$(".kanban-col").forEach((col) => {
      col.addEventListener("dragover", (e) => { e.preventDefault(); col.classList.add("dragover"); });
      col.addEventListener("dragleave", () => col.classList.remove("dragover"));
      col.addEventListener("drop", (e) => {
        e.preventDefault();
        col.classList.remove("dragover");
        if (!dragged) return;
        const deals = DB.deals();
        const d = deals.find((x) => x.id === +dragged.dataset.id);
        if (d) { d.stage = col.dataset.stage; DB.saveDeals(deals); }
        renderPipeline();
        toast("Deal moved to " + STAGE_LABELS[col.dataset.stage]);
      });
    });
  };

  $("#addDealBtn").addEventListener("click", () => { $("#dealModal").classList.add("open"); });
  $("#dealModalClose").addEventListener("click", () => $("#dealModal").classList.remove("open"));
  $("#dealCancel").addEventListener("click", () => $("#dealModal").classList.remove("open"));
  $("#dealForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const deals = DB.deals();
    const id = deals.length ? Math.max(...deals.map((d) => d.id)) + 1 : 1;
    deals.push({ id, customer: $("#dCustomer").value.trim(), car: $("#dCar").value.trim(), value: +$("#dValue").value || 0, stage: $("#dStage").value, created: Date.now() });
    DB.saveDeals(deals);
    e.target.reset();
    $("#dealModal").classList.remove("open");
    renderPipeline();
    toast("Deal added to pipeline.");
  });

  /* ---------- FINANCIALS ---------- */
  const renderFinancials = () => {
    const cars = DB.cars();
    const invoices = DB.invoices();
    const bookings = DB.bookings();
    if (!invoices.length) seedInvoices();
    const list = DB.invoices();
    const total = list.reduce((s, i) => s + (i.amount || 0), 0);
    const paid = list.filter((i) => i.status === "paid").reduce((s, i) => s + (i.amount || 0), 0);
    const open = total - paid;
    $("#finTotal").textContent = fmtMoney(total);
    $("#finPending").textContent = fmtMoney(open);
    $("#finInvoices").textContent = list.length;
    $("#finPaid").textContent = list.filter((i) => i.status === "paid").length;

    const sales = total * 0.62, rentals = total * 0.38;
    renderFinChart(sales, rentals);

    $("#invoiceList").innerHTML = `
      <div class="list-table">
        <div class="table-head invoice-row">
          <span>Invoice</span><span>Customer</span><span>Item</span><span>Amount</span><span>Status</span><span>Date</span><span></span><span></span><span></span>
        </div>
        ${list.map((i) => `
          <div class="table-row invoice-row">
            <b>${i.id}</b><span>${esc(i.customer)}</span><span class="row-muted">${esc(i.item)}</span><b>${fmtMoney(i.amount)}</b>
            <span class="inv-status ${i.status}">${i.status}</span><span class="row-muted">${fmtDate(i.created)}</span>
            <button class="btn btn-sm btn-outline inv-mark" data-id="${i.id}">${i.status === "paid" ? "Reopen" : "Mark Paid"}</button>
            <button class="btn btn-sm btn-ghost inv-print" data-id="${i.id}">Print</button>
            <button class="btn btn-sm btn-ghost inv-del" data-id="${i.id}">✕</button>
          </div>`).join("")}
      </div>`;
    $$(".inv-mark").forEach((b) => b.addEventListener("click", () => {
      const invs = DB.invoices();
      const inv = invs.find((x) => x.id === b.dataset.id);
      if (inv) { inv.status = inv.status === "paid" ? "open" : "paid"; DB.saveInvoices(invs); }
      renderFinancials(); toast("Invoice updated.");
    }));
    $$(".inv-del").forEach((b) => b.addEventListener("click", () => {
      if (!confirm("Delete invoice?")) return;
      DB.saveInvoices(DB.invoices().filter((x) => x.id !== b.dataset.id));
      renderFinancials(); toast("Invoice deleted.");
    }));
    $$(".inv-print").forEach((b) => b.addEventListener("click", () => printInvoice(b.dataset.id)));
  };

  const seedInvoices = () => {
    const now = Date.now();
    DB.saveInvoices([
      { id: "INV-2026-0001", customer: "Alexander Whitmore", item: "Rolls-Royce Phantom — Executive Rental", amount: 18400, status: "paid", created: now - 86400000 * 4 },
      { id: "INV-2026-0002", customer: "Marcus Delgado", item: "Lamborghini Revuelto — Racing Rental", amount: 9600, status: "open", created: now - 86400000 },
      { id: "INV-2026-0003", customer: "Sophia Laurent", item: "Bentley Continental GT — Grand Tour", amount: 7300, status: "open", created: now - 3600000 * 30 }
    ]);
  };

  const renderFinChart = (sales, rentals) => {
    const W = 640, H = 220, padL = 50, padR = 14, padT = 16, padB = 26;
    const iw = W - padL - padR, ih = H - padT - padB;
    const data = [sales, rentals];
    const labels = ["Sales", "Rentals"];
    const colors = ["#c8a24c", "#5aa5e0"];
    const max = Math.max(...data) * 1.15;
    const bw = (iw / data.length) * 0.55;
    const bars = data.map((v, i) => {
      const x = padL + (iw / data.length) * i + (iw / data.length - bw) / 2;
      const h = (v / max) * ih;
      const y = padT + ih - h;
      return `<rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="6" fill="${colors[i]}">
        <title>${labels[i]}: ${fmtMoney(Math.round(v))}</title></rect>
        <text x="${x + bw / 2}" y="${y - 6}" text-anchor="middle" class="chart-y-label">${fmtMoney(Math.round(v))}</text>
        <text x="${x + bw / 2}" y="${H - 8}" text-anchor="middle" class="chart-x-label">${labels[i]}</text>`;
    });
    let grid = "";
    for (let g = 0; g <= 4; g++) {
      const gy = padT + (g / 4) * ih;
      grid += `<line x1="${padL}" y1="${gy}" x2="${W - padR}" y2="${gy}" class="chart-grid-line"/><text x="${padL - 8}" y="${gy + 4}" text-anchor="end" class="chart-y-label">${fmtMoney(Math.round(max * (1 - g / 4)))}</text>`;
    }
    $("#finChart").innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="svg-chart" preserveAspectRatio="xMidYMid meet">${grid}${bars.join("")}</svg>`;
  };

  const printInvoice = (id) => {
    const inv = DB.invoices().find((x) => x.id === id);
    if (!inv) return;
    const brand = JSON.parse(localStorage.getItem("autoprime_branding") || "{}");
    const w = window.open("", "_blank", "width=520,height=640");
    w.document.write(`<!DOCTYPE html><html><head><title>${inv.id}</title><style>
      body{font-family:Georgia,serif;color:#111;max-width:460px;margin:40px auto;padding:0 20px}
      h1{font-size:26px;letter-spacing:2px;border-bottom:2px solid #c8a24c;padding-bottom:12px}
      .muted{color:#666;font-size:12px}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee}
      .tot{display:flex;justify-content:space-between;font-weight:bold;font-size:18px;margin-top:16px}
      .foot{margin-top:30px;font-size:11px;color:#888}
    </style></head><body>
      <h1>${esc(brand.name || "AUTOPRIME")}</h1>
      <div class="muted">${esc(brand.tagline || "Bespoke Automobiles")}</div>
      <div class="muted" style="margin-top:18px">INVOICE &nbsp; ${inv.id}</div>
      <div class="row"><span>Bill To</span><b>${esc(inv.customer)}</b></div>
      <div class="row"><span>Item</span><b>${esc(inv.item)}</b></div>
      <div class="row"><span>Date</span><b>${new Date(inv.created).toLocaleDateString()}</b></div>
      <div class="row"><span>Status</span><b>${inv.status.toUpperCase()}</b></div>
      <div class="tot"><span>Total</span><span>${fmtMoney(inv.amount)}</span></div>
      <div class="foot">Thank you for your business with ${esc(brand.name || "AutoPrime")}.</div>
    </body></html>`);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 300);
  };

  /* ---------- CSV EXPORT ---------- */
  $("#exportCsvBtn").addEventListener("click", () => {
    const invoices = DB.invoices();
    if (!invoices.length) return toast("No invoices to export.", "error");
    const rows = [["Invoice", "Customer", "Item", "Amount", "Status", "Date"]];
    invoices.forEach((i) => rows.push([i.id, i.customer, i.item, i.amount, i.status, new Date(i.created).toLocaleDateString()]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "autoprime-financials.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("CSV exported.");
  });

  /* ---------- FORECAST (analytics) ---------- */
  const renderForecast = () => {
    const weekly = DB.analytics().weekly || [12, 18, 15, 22, 19, 28, 24];
    const hist = [...weekly];
    const slope = (weekly[weekly.length - 1] - weekly[0]) / (weekly.length - 1);
    const pred = [];
    let last = weekly[weekly.length - 1];
    for (let i = 0; i < 7; i++) { last = last + slope * 0.9 + Math.sin(i) * 2; pred.push(Math.round(Math.max(4, last))); }
    const all = [...hist, ...pred];
    const W = 640, H = 240, padL = 40, padR = 14, padT = 18, padB = 28;
    const iw = W - padL - padR, ih = H - padT - padB;
    const max = Math.max(...all) * 1.15;
    const X = (i) => padL + (i / (all.length - 1)) * iw;
    const Y = (v) => padT + ih - (v / max) * ih;
    let grid = "";
    for (let g = 0; g <= 3; g++) { const gy = padT + (g / 3) * ih; grid += `<line x1="${padL}" y1="${gy}" x2="${W - padR}" y2="${gy}" class="chart-grid-line"/>`; }
    const hPath = hist.map((v, i) => (i === 0 ? `M${X(i)} ${Y(v)}` : `L${X(i)} ${Y(v)}`)).join(" ");
    const pPath = "M" + X(hist.length - 1) + " " + Y(hist[hist.length - 1]) + " " + pred.map((v, i) => `L${X(hist.length + i)} ${Y(v)}`).join(" ");
    const dots = hist.map((v, i) => `<circle cx="${X(i)}" cy="${Y(v)}" r="3.5" class="chart-dot-2"/>`).join("");
    const pDots = pred.map((v, i) => `<circle cx="${X(hist.length + i)}" cy="${Y(v)}" r="3" class="chart-dot" fill="#3ecf8a"/>`).join("");
    const labels = [...hist.map((_, i) => `D${i + 1}`), ...pred.map((_, i) => `+${i + 1}`)].map((l, i) => (i % 2 === 0 ? `<text x="${X(i)}" y="${H - 8}" text-anchor="middle" class="chart-x-label">${l}</text>` : "")).join("");
    $("#forecastChart").innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="svg-chart" preserveAspectRatio="xMidYMid meet">${grid}<path d="${hPath}" class="chart-line" style="stroke:var(--info)"/><path d="${pPath}" class="chart-line-2" style="stroke:#3ecf8a;stroke-dasharray:6 5"/>${dots}${pDots}${labels}</svg>`;
  };

  /* ---------- CUSTOMER 360 ---------- */
  const openCustomer360 = (email, name) => {
    const bookings = DB.bookings().filter((b) => (b.email || "").toLowerCase() === email.toLowerCase() || (b.name || "").toLowerCase() === name.toLowerCase());
    const messages = DB.messages().filter((m) => (m.email || "").toLowerCase() === email.toLowerCase() || (m.name || "").toLowerCase() === name.toLowerCase());
    const deals = DB.deals().filter((d) => (d.customer || "").toLowerCase() === name.toLowerCase());
    const totalSpend = bookings.filter((b) => b.status === "confirmed").reduce((s, b) => s + (b.amount || (b.days || 1) * 1200), 0);
    const avatar = (name || "?")[0].toUpperCase();
    const timeline = [
        ...bookings.map((b) => ({ raw: b.created, html: `<div class="cust-event"><span class="ce-dot" style="background:${b.status === "confirmed" ? "var(--success)" : b.status === "cancelled" ? "var(--danger)" : "var(--gold)"}"></span><div><div class="ce-text">Requested <b>${esc(b.plan)}</b> rental · <b>${esc(b.car)}</b></div><div class="ce-time">${fmtDate(b.created)} · ${b.status}</div></div></div>` })),
        ...messages.map((m) => ({ raw: m.created, html: `<div class="cust-event"><span class="ce-dot" style="background:var(--info)"></span><div><div class="ce-text">Enquiry: <b>"${esc(m.subject)}"</b></div><div class="ce-time">${fmtDate(m.created)}</div></div></div>` })),
        ...deals.map((d) => ({ raw: d.created, html: `<div class="cust-event"><span class="ce-dot" style="background:var(--warning)"></span><div><div class="ce-text">Deal: <b>${esc(d.car || "—")}</b> · ${fmtMoney(d.value)}</div><div class="ce-time">${STAGE_LABELS[d.stage] || d.stage}</div></div></div>` }))
      ].sort((a, b) => b.raw - a.raw).map((e) => e.html).join("");
    $("#cust360").innerHTML = `
      <div class="cust-hero">
        <div class="cust-avatar">${avatar}</div>
        <div>
          <h4>${esc(name || email)}</h4>
          <div class="cust-meta">
            <span>✉ ${esc(email || "—")}</span>
            <span>💬 ${bookings.length + messages.length} interactions</span>
          </div>
        </div>
      </div>
      <div class="cust-section">
        <h5>Lifetime Value</h5>
        <div class="kpi-row">
          <div class="kpi-cell"><div class="kc-label">Total Spend</div><div class="kc-value" style="color:var(--gold-light)">${fmtMoney(totalSpend)}</div></div>
          <div class="kpi-cell"><div class="kc-label">Bookings</div><div class="kc-value">${bookings.length}</div></div>
          <div class="kpi-cell"><div class="kc-label">Active Deals</div><div class="kc-value">${deals.length}</div></div>
        </div>
      </div>
      <div class="cust-section">
        <h5>Activity Timeline</h5>
        <div class="cust-timeline">${timeline || `<div class="notif-empty">No activity recorded.</div>`}</div>
      </div>`;
    $("#custModal").classList.add("open");
  };
  $("#custModalClose").addEventListener("click", () => $("#custModal").classList.remove("open"));
  $(".modal-overlay").addEventListener("click", (e) => { if (e.target.classList.contains("modal-overlay")) e.target.classList.remove("open"); });

  /* ---------- ACCENT + BACKUP + NOTIF ---------- */
  const applyAccent = () => {
    const a = DB.accent();
    document.body.setAttribute("data-accent", a);
    $$(".accent-opt").forEach((b) => b.classList.toggle("active", b.dataset.accent === a));
  };
  $$(".accent-opt").forEach((btn) => btn.addEventListener("click", () => { DB.setAccent(btn.dataset.accent); applyAccent(); toast("Console accent updated."); }));

  $("#backupBtn").addEventListener("click", () => {
    const data = { cars: DB.cars(), bookings: DB.bookings(), messages: DB.messages(), analytics: DB.analytics(), deals: DB.deals(), invoices: DB.invoices(), branding: JSON.parse(localStorage.getItem("autoprime_branding") || "{}") };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "autoprime-backup.json";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Backup downloaded.");
  });
  $("#restoreInputBtn").addEventListener("click", () => $("#restoreFile").click());
  $("#restoreFile").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.cars) DB.set("cars", data.cars);
        if (data.bookings) DB.saveBookings(data.bookings);
        if (data.messages) DB.saveMessages(data.messages);
        if (data.deals) DB.saveDeals(data.deals);
        if (data.invoices) DB.saveInvoices(data.invoices);
        if (data.branding) localStorage.setItem("autoprime_branding", JSON.stringify(data.branding));
        toast("Backup restored successfully.");
        renderAll();
      } catch (err) { toast("Invalid backup file.", "error"); }
    };
    reader.readAsText(file);
  });

  $("#notifBell").addEventListener("click", (e) => {
    e.stopPropagation();
    $("#notifBell").classList.toggle("open");
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".notif-bell")) $("#notifBell").classList.remove("open"); });

  /* ============================================================
     INVENTORY (CARS)
     ============================================================ */
  const carList = $("#carList");
  let carQuery = "";
  let carType = "all";
  let carSort = "newest";

  $("#addCarBtn").addEventListener("click", () => openCarModal());
  $("#carSearch").addEventListener("input", (e) => { carQuery = e.target.value.toLowerCase(); renderCars(); });
  $("#filterType").addEventListener("change", (e) => { carType = e.target.value; renderCars(); });
  $("#sortCars").addEventListener("change", (e) => { carSort = e.target.value; renderCars(); });

  const renderCars = () => {
    let cars = DB.cars().filter((c) => {
      if (carType !== "all" && c.type !== carType) return false;
      if (carQuery && !(c.name + " " + c.make + " " + c.year).toLowerCase().includes(carQuery)) return false;
      return true;
    });
    if (carSort === "price-high") cars = [...cars].sort((a, b) => b.price - a.price);
    if (carSort === "price-low") cars = [...cars].sort((a, b) => a.price - b.price);
    if (carSort === "name") cars = [...cars].sort((a, b) => a.name.localeCompare(b.name));
    if (carSort === "newest") cars = [...cars].sort((a, b) => (b.year || 0) - (a.year || 0));

    carList.innerHTML = "";
    if (!cars.length) {
      carList.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><span class="empty-icon">🚗</span>No vehicles match your filters.</div>`;
      return;
    }
    cars.forEach((c) => {
      const card = document.createElement("div");
      card.className = "admin-car-card";
      card.innerHTML = `
        <div class="admin-car-img">
          <img src="${esc(c.img)}" alt="${esc(c.name)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=60'" />
          ${c.featured ? '<span class="admin-car-feat">★ Featured</span>' : ""}
        </div>
        <div class="admin-car-body">
          <div class="admin-car-top">
            <div><h4 class="admin-car-name">${esc(c.name)}</h4><p class="admin-car-sub">${esc(c.year)} · ${esc(c.type)} · ${esc(c.make)}</p></div>
            <span class="admin-car-price">${fmtMoney(c.price)}</span>
          </div>
          <div class="admin-car-specs"><span>⚙ ${esc(c.transmission)}</span><span>⛽ ${esc(c.fuel)}</span><span>📏 ${esc(c.km)}</span></div>
          <div class="admin-car-actions">
            <button class="btn btn-outline edit-car" data-id="${c.id}">Edit</button>
            <button class="btn btn-ghost feat-car" data-id="${c.id}">${c.featured ? "★" : "☆"}</button>
            <button class="btn btn-danger del-car" data-id="${c.id}">Delete</button>
          </div>
        </div>`;
      carList.appendChild(card);
    });

    $$(".edit-car").forEach((b) => b.addEventListener("click", () => openCarModal(b.dataset.id)));
    $$(".feat-car").forEach((b) => b.addEventListener("click", () => toggleFeatured(b.dataset.id)));
    $$(".del-car").forEach((b) => b.addEventListener("click", () => deleteCar(b.dataset.id)));
  };

  const toggleFeatured = (id) => {
    const cars = DB.cars();
    const idx = cars.findIndex((c) => c.id === +id);
    if (idx > -1) { cars[idx].featured = !cars[idx].featured; DB.set("cars", cars); }
    renderCars();
    toast("Featured status updated.");
  };

  const deleteCar = (id) => {
    if (!confirm("Remove this car from inventory?")) return;
    DB.set("cars", DB.cars().filter((c) => c.id !== +id));
    renderCars();
    toast("Car removed from inventory.", "success");
  };

  /* ---------- CAR MODAL ---------- */
  const carModal = $("#carModal");
  const carForm = $("#carForm");
  const openCarModal = (id = null) => {
    $("#modalTitle").textContent = id ? "Edit Car" : "Add New Car";
    $("#carId").value = id || "";
    const car = id ? DB.cars().find((c) => c.id === +id) : null;
    $("#cName").value = car ? car.name : "";
    $("#cYear").value = car ? car.year : new Date().getFullYear();
    $("#cMake").value = car ? car.make : "";
    $("#cType").value = car ? car.type : "sports";
    $("#cPrice").value = car ? car.price : "";
    $("#cImg").value = car ? car.img : "";
    $("#cFuel").value = car ? car.fuel : "";
    $("#cTrans").value = car ? car.transmission : "";
    $("#cKm").value = car ? car.km : "";
    $("#cFeatured").value = car && car.featured ? "true" : "false";
    updateImgPreview();
    carModal.classList.add("open");
  };
  const closeCarModal = () => carModal.classList.remove("open");
  $("#modalClose").addEventListener("click", closeCarModal);
  $("#modalCancel").addEventListener("click", closeCarModal);
  carModal.addEventListener("click", (e) => { if (e.target === carModal) closeCarModal(); });
  $("#cImg").addEventListener("input", updateImgPreview);

  function updateImgPreview() {
    const url = $("#cImg").value.trim();
    const pv = $("#imgPreview");
    if (url) pv.innerHTML = `<img src="${esc(url)}" onerror="this.outerHTML='<span>Invalid image URL</span>'" />`;
    else pv.innerHTML = "<span>Enter an image URL to preview</span>";
  }

  carForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = $("#carId").value;
    const data = {
      id: id ? +id : Date.now(),
      name: $("#cName").value.trim(),
      year: +$("#cYear").value,
      make: $("#cMake").value.trim().toLowerCase(),
      type: $("#cType").value,
      price: +$("#cPrice").value,
      img: $("#cImg").value.trim(),
      fuel: $("#cFuel").value.trim(),
      transmission: $("#cTrans").value.trim(),
      km: $("#cKm").value.trim() || "0 km",
      featured: $("#cFeatured").value === "true"
    };
    let cars = DB.cars();
    if (id) {
      const idx = cars.findIndex((c) => c.id === +id);
      if (idx > -1) cars[idx] = data;
      toast("Car updated.");
    } else {
      cars.push(data);
      toast("Car added to inventory.");
    }
    DB.set("cars", cars);
    closeCarModal();
    renderCars();
    renderDashboard();
  });

  /* ============================================================
     BOOKINGS
     ============================================================ */
  let bookingFilter = "all";
  $("#filterBookingStatus").addEventListener("change", (e) => { bookingFilter = e.target.value; renderBookings(); });

  const renderBookings = () => {
    let bookings = DB.bookings().filter((b) => bookingFilter === "all" || b.status === bookingFilter);
    bookings.sort((a, b) => (a.status === "pending" ? -1 : 1) - (b.status === "pending" ? -1 : 1) || b.created - a.created);
    const head = `<div class="table-head"><span>Customer</span><span>Plan</span><span>Date</span><span>Status</span><span></span></div>`;
    if (!bookings.length) {
      $("#bookingsList").innerHTML = head + `<div class="empty-state"><span class="empty-icon">📅</span>No bookings found.</div>`;
      return;
    }
    $("#bookingsList").innerHTML = head + bookings.map((b) => `
      <div class="table-row">
        <div class="table-cell"><strong>${esc(b.name)}</strong><small>${esc(b.email || "")}</small></div>
        <div class="table-cell"><strong>${esc(b.plan)}</strong><small>${esc(b.car)} · ${b.days || 1} day(s)</small></div>
        <div class="table-cell">${esc(b.date || "")}</div>
        <div class="table-cell"><span class="status-badge ${esc(b.status)}">${esc(b.status)}</span></div>
        <div class="table-actions">
          ${b.status === "pending" ? `<button class="btn btn-success approve-b" data-id="${b.id}">✓</button>` : ""}
          <button class="btn btn-danger cancel-b" data-id="${b.id}">✕</button>
        </div>
      </div>`).join("");

    $$(".approve-b").forEach((b) => b.addEventListener("click", () => setBooking(b.dataset.id, "confirmed")));
    $$(".cancel-b").forEach((b) => b.addEventListener("click", () => setBooking(b.dataset.id, "cancelled")));
  };

  const setBooking = (id, status) => {
    const list = DB.bookings().map((b) => (b.id === +id ? Object.assign(b, { status }) : b));
    DB.saveBookings(list);
    renderBookings();
    renderDashboard();
    toast("Booking " + status + ".", status === "confirmed" ? "success" : "error");
  };

  /* ============================================================
     MESSAGES
     ============================================================ */
  const msgModal = $("#msgModal");
  const renderMessages = () => {
    const messages = DB.messages().sort((a, b) => b.created - a.created);
    const head = `<div class="table-head"><span>Sender</span><span>Subject</span><span>Received</span><span>Status</span><span></span></div>`;
    if (!messages.length) {
      $("#messagesList").innerHTML = head + `<div class="empty-state"><span class="empty-icon">✉</span>No messages yet.</div>`;
      return;
    }
    $("#messagesList").innerHTML = head + messages.map((m) => `
      <div class="table-row ${m.status === "new" ? 'style="background:rgba(200,162,76,0.04)"' : ""}">
        <div class="table-cell"><strong>${esc(m.name)}</strong><small>${esc(m.email)}</small></div>
        <div class="table-cell">${esc(m.subject)}</div>
        <div class="table-cell">${fmtDate(m.created)}</div>
        <div class="table-cell"><span class="status-badge ${m.status === "new" ? "pending" : "confirmed"}">${m.status === "new" ? "New" : "Read"}</span></div>
        <div class="table-actions">
          <button class="btn btn-outline view-m" data-id="${m.id}">View</button>
          <button class="btn btn-danger del-m" data-id="${m.id}">✕</button>
        </div>
      </div>`).join("");

    $$(".view-m").forEach((b) => b.addEventListener("click", () => openMessage(b.dataset.id)));
    $$(".del-m").forEach((b) => b.addEventListener("click", () => {
      DB.saveMessages(DB.messages().filter((m) => m.id !== +b.dataset.id));
      renderMessages();
      renderDashboard();
      toast("Message deleted.");
    }));
  };

  const openMessage = (id) => {
    const m = DB.messages().find((x) => x.id === +id);
    if (!m) return;
    $("#msgModalTitle").textContent = m.subject;
    $("#msgDetail").innerHTML = `
      <div class="detail-row"><span>From</span><span><b>${esc(m.name)}</b> · ${esc(m.email)}</span></div>
      <div class="detail-row"><span>Subject</span><span>${esc(m.subject)}</span></div>
      <div class="detail-row"><span>Received</span><span>${fmtDate(m.created)}</span></div>
      <div class="detail-row"><span>Message</span><span style="line-height:1.7">${esc(m.message)}</span></div>`;
    msgModal.classList.add("open");
    if (m.status === "new") {
      const list = DB.messages().map((x) => (x.id === +id ? Object.assign(x, { status: "read" }) : x));
      DB.saveMessages(list);
      renderMessages();
      renderDashboard();
    }
  };
  $("#msgModalClose").addEventListener("click", () => msgModal.classList.remove("open"));
  msgModal.addEventListener("click", (e) => { if (e.target === msgModal) msgModal.classList.remove("open"); });

  /* ============================================================
     CUSTOMERS
     ============================================================ */
  const renderCustomers = () => {
    const contacts = [];
    DB.bookings().forEach((b) => contacts.push({ name: b.name, email: b.email || "", phone: b.phone || "", type: "Booking", date: b.created, car: b.car }));
    DB.messages().forEach((m) => contacts.push({ name: m.name, email: m.email, phone: "", type: "Enquiry", date: m.created, car: "" }));
    const uniq = {};
    contacts.forEach((c) => { if (c.email) uniq[c.email] = c; });
    const list = Object.values(uniq).sort((a, b) => b.date - a.date);
    const head = `<div class="table-head"><span>Customer</span><span>Contact</span><span>Type</span><span>Last Activity</span><span></span></div>`;
    if (!list.length) {
      $("#customersList").innerHTML = head + `<div class="empty-state"><span class="empty-icon">👤</span>No customers yet.</div>`;
      return;
    }
    $("#customersList").innerHTML = head + list.map((c) => `
      <div class="table-row">
        <div class="table-cell"><strong>${esc(c.name)}</strong><small>${esc(c.car || "—")}</small></div>
        <div class="table-cell">${esc(c.email)}<small>${esc(c.phone || "")}</small></div>
        <div class="table-cell"><span class="status-badge confirmed">${esc(c.type)}</span></div>
        <div class="table-cell">${fmtDate(c.date)}</div>
        <div class="table-cell"><button class="btn btn-sm btn-outline cust360-btn" data-email="${esc(c.email)}" data-name="${esc(c.name)}">360° Profile</button></div>
      </div>`).join("");
    $$(".cust360-btn").forEach((btn) => btn.addEventListener("click", () => openCustomer360(btn.dataset.email, btn.dataset.name)));
  };

  /* ============================================================
     BRANDING
     ============================================================ */
  const loadBranding = () => {
    const b = DB.all().branding || {};
    $("#brandName").value = b.name || "";
    $("#brandLogo").value = b.logo || "";
    $("#brandTagline").value = b.tagline || "";
    $("#brandFont").value = b.font || "serif";
    $("#colorPrimary").value = b.primary || "#c8a24c";
    $("#colorAccent").value = b.accent || "#e8cf8f";
    $("#colorDark").value = b.dark || "#0a0a0c";
    $("#colorCard").value = b.card || "#141419";
    updatePreview();
  };

  const updatePreview = () => {
    const name = $("#brandName").value.trim() || "AUTO PRIME";
    $("#previewName").textContent = name.toUpperCase();
    $("#previewName").style.fontFamily = $("#brandFont").value === "serif" ? "var(--font-serif)" : $("#brandFont").value === "luxury" ? "'Playfair Display', serif" : "var(--font-sans)";
    if ($("#brandLogo").value.trim()) $("#previewLogo").innerHTML = `<img src="${esc($("#brandLogo").value.trim())}" style="width:34px;height:34px;object-fit:contain;border-radius:50%" onerror="this.outerHTML='🏎️'">`;
    else $("#previewLogo").textContent = "🏎️";
    const primary = $("#colorPrimary").value;
    const preview = document.querySelector(".brand-preview");
    preview.style.borderColor = primary;
    const btn = $("#previewBtn");
    btn.style.background = `linear-gradient(135deg, ${$("#colorAccent").value}, ${primary})`;
    btn.style.color = "#0a0a0c";
    document.documentElement.style.setProperty("--gold", primary);
  };

  ["brandName", "brandLogo", "brandTagline", "brandFont", "colorPrimary", "colorAccent", "colorDark", "colorCard"].forEach((id) => {
    $("#" + id).addEventListener("input", updatePreview);
  });

  $("#saveBrandingBtn").addEventListener("click", () => {
    const branding = {
      name: $("#brandName").value.trim() || "AUTO PRIME",
      logo: $("#brandLogo").value.trim(),
      tagline: $("#brandTagline").value.trim(),
      font: $("#brandFont").value,
      primary: $("#colorPrimary").value,
      accent: $("#colorAccent").value,
      dark: $("#colorDark").value,
      card: $("#colorCard").value
    };
    DB.set("branding", branding);
    toast("Branding saved. Refresh the website to apply changes.", "success");
  });

  /* ============================================================
     ANALYTICS
     ============================================================ */
  const renderAnalytics = () => {
    const an = DB.analytics();
    const views = an.views || 0;
    const leads = an.leads || 0;
    $("#anaViews").textContent = views.toLocaleString();
    $("#anaLeads").textContent = leads;
    $("#anaConv").textContent = views ? Math.round((leads / views) * 100) : "0%";
    const weekly = an.weekly || [0, 0, 0, 0, 0, 0, 0];
    const max = Math.max(...weekly, 1);
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    $("#lineChart").innerHTML = weekly.map((n, i) => `
      <div class="line-col">
        <div class="line-bar" style="height:${(n / max) * 100}%"></div>
        <span class="line-label">${days[i]} ${n}</span>
      </div>`).join("");

    const bookings = DB.bookings();
    const messages = DB.messages();
    const totalB = Math.max(bookings.length, 1);
    const totalM = Math.max(messages.length, 1);
    $("#srcDirect").textContent = views ? Math.round((views * 0.62) / Math.max(views, 1) * 100) + "%" : "62%";
    $("#srcRentals").textContent = Math.round((bookings.filter((b) => b.type === "rental" || true).length / totalB) * 100) + "%";
    $("#srcEnq").textContent = Math.round((messages.filter((m) => m.status === "new").length / totalM) * 100) + "%";
    $("#srcNews").textContent = Math.round((messages.filter((m) => m.type === "newsletter" || false).length / totalM) * 100) + "%";
    renderForecast();
  };

  /* ============================================================
     SETTINGS
     ============================================================ */
  $("#changePassBtn").addEventListener("click", () => {
    const np = $("#newPass").value.trim();
    const cp = $("#confirmPass").value.trim();
    if (!np || np.length < 4) return toast("Password must be at least 4 characters.", "error");
    if (np !== cp) return toast("Passwords do not match.", "error");
    const creds = getCreds();
    creds.pass = np;
    localStorage.setItem(AUTH_KEY, JSON.stringify(creds));
    $("#newPass").value = "";
    $("#confirmPass").value = "";
    toast("Password updated successfully.", "success");
  });

  $("#resetCarsBtn").addEventListener("click", () => {
    if (!confirm("Reset fleet back to the original default cars?")) return;
    DB.set("cars", DEFAULT_CARS);
    renderCars();
    renderDashboard();
    toast("Fleet reset to defaults.");
  });

  $("#resetAllBtn").addEventListener("click", () => {
    if (!confirm("WARNING: This wipes ALL data (cars, bookings, messages, branding). Continue?")) return;
    localStorage.removeItem("autoprime_data");
    localStorage.removeItem("autoprime_bookings");
    localStorage.removeItem("autoprime_messages");
    localStorage.removeItem("autoprime_analytics");
    localStorage.removeItem("autoprime_seeded");
    location.reload();
  });

  /* ============================================================
     RENDER ALL
     ============================================================ */
  function renderAll() {
    renderDashboard();
    renderCars();
    renderBookings();
    renderMessages();
    renderCustomers();
    loadBranding();
    renderPipeline();
    renderFinancials();
    applyAccent();
    $("#badgeInvoices").textContent = DB.invoices().filter((i) => i.status === "open").length || "";
  }

  if (isLoggedIn()) showAdmin(); else showLogin();
});