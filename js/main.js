// AutoPrime — Luxury Interactions

document.addEventListener("DOMContentLoaded", () => {
  /* ============ WELCOME SCREEN ============ */
  const welcome = document.getElementById("welcome");
  document.body.classList.add("welcome-active");

  /* particles */
  const particlesContainer = document.getElementById("welcomeParticles");
  if (particlesContainer) {
    const particleCount = Math.min(30, Math.floor(window.innerWidth / 40));
    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement("span");
      p.className = "welcome-particle";
      p.style.left = Math.random() * 100 + "%";
      p.style.animationDelay = Math.random() * 8 + "s";
      p.style.animationDuration = 6 + Math.random() * 6 + "s";
      p.style.opacity = 0.3 + Math.random() * 0.5;
      particlesContainer.appendChild(p);
    }
  }

  const hideWelcome = () => {
    if (!welcome) return;
    welcome.classList.add("hidden");
    document.body.classList.remove("welcome-active");
    document.body.classList.add("welcome-done");
  };

  window.addEventListener("load", () => {
    setTimeout(hideWelcome, 20000);
  });

  const welcomeEnter = document.getElementById("welcomeEnter");
  if (welcomeEnter) {
    welcomeEnter.addEventListener("click", () => {
      if (window.SoundEngine) window.SoundEngine.rev(0.9);
      hideWelcome();
    });
  }

  /* sound hint click -> enable audio */
  const soundHint = document.querySelector(".welcome-sound-hint");
  if (soundHint) {
    soundHint.style.cursor = "pointer";
    soundHint.addEventListener("click", () => {
      if (window.SoundEngine) {
        window.SoundEngine.rev(0.4);
        soundHint.style.opacity = "0";
        soundHint.style.pointerEvents = "none";
      }
    });
  }

  /* ============ CUSTOM CURSOR ============ */
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  let mx = 0, my = 0, rx = 0, ry = 0;
  window.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx - 4 + "px";
    dot.style.top = my - 4 + "px";
  });
  const ringLoop = () => {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.left = rx - 18 + "px";
    ring.style.top = ry - 18 + "px";
    requestAnimationFrame(ringLoop);
  };
  ringLoop();
  document.querySelectorAll("a, button, .car-card, .gallery-item, input, select, textarea").forEach((el) => {
    el.addEventListener("mouseenter", () => ring.classList.add("hovering"));
    el.addEventListener("mouseleave", () => ring.classList.remove("hovering"));
  });

  /* ============ NAVBAR ============ */
  const navbar = document.getElementById("navbar");
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    navLinks.classList.toggle("open");
  });
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      hamburger.classList.remove("open");
      navLinks.classList.remove("open");
    })
  );

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 50);
    document.getElementById("backToTop").classList.toggle("show", window.scrollY > 600);
  });

  const sections = document.querySelectorAll("section[id]");
  const navAnchors = document.querySelectorAll(".nav-link:not(.nav-cta)");
  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach((sec) => {
      if (window.scrollY >= sec.offsetTop - 140) current = sec.getAttribute("id");
    });
    navAnchors.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
  });

  /* ============ REVEAL ============ */
  const revealObserver = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("visible"); revealObserver.unobserve(e.target); }
    }),
    { threshold: 0.1 }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  /* ============ COUNTERS ============ */
  const counters = document.querySelectorAll(".cstat-num");
  const animateCounter = (el) => {
    const target = +el.dataset.count;
    const suffix = el.dataset.count > 99 ? "%" : "+";
    const dur = 1800;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.floor(p * target).toLocaleString() + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { animateCounter(e.target); counterObserver.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  counters.forEach((c) => counterObserver.observe(c));

  /* ============ FLEET CAROUSEL + ENGINE SOUNDS ============ */
  const SoundEngine = (() => {
    let ctx = null;
    let enabled = localStorage.getItem("autoprime_sound") !== "0";
    const files = {
      start: "sounds/car-ignition.mp3",
      rev: "sounds/car-driveby.mp3",
      away: "sounds/car-swoosh.mp3"
    };
    const pools = { start: [], rev: [], away: [] };
    const ensure = () => {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) ctx = new AC();
        if (ctx) {
          const unlock = () => { if (ctx.state === "suspended") ctx.resume(); };
          document.addEventListener("pointerdown", unlock, { once: true });
          document.addEventListener("keydown", unlock, { once: true });
        }
      }
      if (ctx && ctx.state === "suspended") ctx.resume();
      return ctx;
    };
    const getPlayer = (key) => {
      const pool = pools[key];
      const p = pool.find((a) => a.paused);
      if (p) return p;
      const a = new Audio(files[key]);
      a.preload = "auto";
      a.volume = 0.6;
      pool.push(a);
      return a;
    };
    const stopAll = () => {
      Object.values(pools).forEach((pool) => pool.forEach((a) => { a.pause(); a.currentTime = 0; }));
    };
    const playOne = (key, power = 0.8) => {
      if (!enabled) return null;
      ensure();
      const a = getPlayer(key);
      a.currentTime = 0;
      a.volume = Math.max(0.15, Math.min(0.9, 0.3 + power * 0.6));
      const pr = a.play();
      if (pr && pr.catch) pr.catch(() => {});
      return a;
    };
    const playSequence = (power = 0.8) => {
      if (!enabled) return;
      stopAll();
      playOne("start", power);
      const schedule = (key, offset) => {
        setTimeout(() => {
          if (!enabled) return;
          const b = playOne(key, power);
          if (b) b.currentTime = 0;
        }, offset);
      };
      schedule("rev", 3800);
      schedule("away", 8500);
    };
    return {
      init() { ensure(); },
      setEnabled(v) { enabled = v; localStorage.setItem("autoprime_sound", v ? "1" : "0"); },
      isEnabled() { return enabled; },
      rev(p) {
        if (p < 0.5) { stopAll(); playOne("start", p); }
        else playSequence(p);
      }
    };
  })();
  window.SoundEngine = SoundEngine;

  const carousel = document.getElementById("fleetCarousel");
  if (carousel && CARS.length) {
    const track = document.getElementById("fcTrack");
    const dots = document.getElementById("fcDots");
    const progress = document.getElementById("fcProgress");
    const soundBtn = document.getElementById("fcSound");
    let idx = 0;
    let timer = null;
    let interval = 14000;

    const renderSlides = () => {
      track.innerHTML = CARS.map((c, i) => `
        <div class="fc-slide ${i === 0 ? "active" : ""}" data-id="${c.id}">
          <img src="${c.img}" alt="${c.name}" loading="lazy" />
          <div class="fc-caption">
            <div>
              <h3>${c.name}</h3>
              <div class="fc-meta">${c.year} · ${c.fuel} · ${c.km}</div>
            </div>
            <div class="fc-price">$${c.price.toLocaleString()}<small>Acquisition</small></div>
          </div>
        </div>`).join("");
      dots.innerHTML = CARS.map((_, i) => `<button class="fc-dot ${i === 0 ? "active" : ""}" data-i="${i}"></button>`).join("");
      dots.querySelectorAll(".fc-dot").forEach((d) =>
        d.addEventListener("click", () => { goTo(+d.dataset.i, true); })
      );
    };

    const goTo = (n, withSound) => {
      idx = (n + CARS.length) % CARS.length;
      track.querySelectorAll(".fc-slide").forEach((s, i) => s.classList.toggle("active", i === idx));
      dots.querySelectorAll(".fc-dot").forEach((d, i) => d.classList.toggle("active", i === idx));
      if (withSound !== false) SoundEngine.rev(0.5 + idx / CARS.length * 0.5);
      progress.style.transition = "none";
      progress.style.width = "0%";
      requestAnimationFrame(() => {
        progress.style.transition = `width ${interval}ms linear`;
        progress.style.width = "100%";
      });
    };

    const start = () => {
      clearInterval(timer);
      timer = setInterval(() => goTo(idx + 1, true), interval);
    };
    const stop = () => clearInterval(timer);

    document.getElementById("fcNext").addEventListener("click", () => { goTo(idx + 1, true); start(); });
    document.getElementById("fcPrev").addEventListener("click", () => { goTo(idx - 1, true); start(); });

    track.querySelectorAll(".fc-slide").forEach((s) =>
      s.addEventListener("click", () => SoundEngine.rev(1))
    );

    soundBtn.addEventListener("click", () => {
      const on = !SoundEngine.isEnabled();
      SoundEngine.setEnabled(on);
      soundBtn.textContent = on ? "🔊" : "🔇";
      soundBtn.classList.toggle("muted", !on);
      if (on) { SoundEngine.init(); SoundEngine.rev(0.9); }
    });
    if (!SoundEngine.isEnabled()) {
      soundBtn.textContent = "🔇";
      soundBtn.classList.add("muted");
    }

    renderSlides();
    SoundEngine.init();
    start();
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop(); else start();
    });
  }

  /* ============ FLEET (GRID) ============ */
  const grid = document.getElementById("carGrid");
  const searchInput = document.getElementById("searchInput");
  const filterMake = document.getElementById("filterMake");
  const filterType = document.getElementById("filterType");
  const filterPrice = document.getElementById("filterPrice");
  const filterYear = document.getElementById("filterYear");
  const filterFuel = document.getElementById("filterFuel");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  let visibleCount = 10;
  let favs = new Set(JSON.parse(localStorage.getItem("autoprime_favs") || "[]"));

  const getFiltered = () => {
    const q = searchInput.value.trim().toLowerCase();
    const mk = filterMake.value;
    const ty = filterType.value;
    const pr = filterPrice.value;
    const yr = filterYear.value;
    const fu = filterFuel.value;
    return CARS.filter((c) => {
      if (!(c.name + " " + c.make).toLowerCase().includes(q)) return false;
      if (mk !== "all" && c.make !== mk) return false;
      if (ty !== "all" && c.type !== ty) return false;
      if (pr !== "all") {
        if (pr === "low" && (c.price < 200000 || c.price > 400000)) return false;
        if (pr === "mid" && (c.price < 400000 || c.price > 700000)) return false;
        if (pr === "high" && c.price <= 700000) return false;
      }
      if (yr !== "all" && String(c.year) !== yr) return false;
      if (fu !== "all" && !c.fuel.toLowerCase().includes(fu)) return false;
      return true;
    });
  };

  const renderCards = (cars) => {
    grid.innerHTML = cars.map((c) => `
      <article class="car-card" data-id="${c.id}">
        <div class="car-media">
          <img src="${c.img}" alt="${c.name}" loading="lazy" />
          <span class="car-tag">${(c.type || "grand").replace("-", " ")}</span>
          <span class="car-badge">${c.year}</span>
          <div class="car-actions">
            <button class="car-fav ${favs.has(c.id) ? "active" : ""}" data-id="${c.id}" aria-label="Save to favourites" title="Favourite">${favs.has(c.id) ? "♥" : "♡"}</button>
            <button class="car-cmp ${compare.has(c.id) ? "active" : ""}" data-id="${c.id}" aria-label="Compare" title="Compare">⇄</button>
          </div>
          <div class="car-overlay">
            <button class="btn btn-gold btn-block car-view" data-id="${c.id}">View Details</button>
          </div>
        </div>
        <div class="car-body">
          <p class="car-sub">${c.make.split("-").join(" ").toUpperCase()} · ${c.location || "Showroom"}</p>
          <h3 class="car-name">${c.name}</h3>
          <div class="car-specs">
            <span class="car-spec"><i class="spec-ico">⛽</i>${c.fuel}</span>
            <span class="car-spec"><i class="spec-ico">⚙</i>${c.transmission}</span>
          </div>
          <div class="car-foot">
            <span class="car-price">$${c.price.toLocaleString()}<small> Est. </small></span>
            <button class="btn btn-gold car-enquire" data-id="${c.id}">Enquire</button>
          </div>
        </div>
      </article>
    `).join("");

    grid.querySelectorAll(".car-fav").forEach((btn) =>
      btn.addEventListener("click", () => {
        const id = +btn.dataset.id;
        favs.has(id) ? favs.delete(id) : favs.add(id);
        localStorage.setItem("autoprime_favs", JSON.stringify([...favs]));
        btn.classList.toggle("active");
        btn.textContent = favs.has(id) ? "♥" : "♡";
        SoundEngine.rev(0.5);
      })
    );

    grid.querySelectorAll(".car-cmp").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = +btn.dataset.id;
        if (compare.has(id)) compare.delete(id);
        else if (compare.size >= 3) { alert("Compare up to 3 vehicles."); return; }
        else compare.add(id);
        btn.classList.toggle("active");
        updateCompareBar();
      })
    );

    grid.querySelectorAll(".car-card").forEach((card) =>
      card.addEventListener("mouseenter", () => SoundEngine.rev(0.35))
    );

    grid.querySelectorAll(".car-view, .car-enquire").forEach((btn) =>
      btn.addEventListener("click", () => {
        const id = +btn.dataset.id;
        openDetail(CARS.find((c) => c.id === id));
      })
    );
  };

  const updateGrid = (reset = true) => {
    if (reset) visibleCount = 10;
    const filtered = getFiltered();
    renderCards(filtered.slice(0, visibleCount));
    loadMoreBtn.style.display = filtered.length > visibleCount ? "inline-flex" : "none";
    if (!filtered.length) {
      grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#a6b0c0;padding:80px 0;">No automobiles match your selection. Please refine your search.</p>`;
      loadMoreBtn.style.display = "none";
    }
  };

  /* ============ COMPARE ============ */
  const compare = new Set();
  const compareBar = document.getElementById("compareBar");
  const updateCompareBar = () => {
    if (!compareBar) return;
    compareBar.classList.toggle("show", compare.size > 0);
    const list = document.getElementById("compareList");
    const cars = CARS.filter((c) => compare.has(c.id));
    list.innerHTML = cars.map((c) => `
      <div class="compare-chip">
        <img src="${c.img}" alt="" />
        <span>${c.name}</span>
        <button data-id="${c.id}" aria-label="Remove">✕</button>
      </div>`).join("");
    document.getElementById("compareCount").textContent = compare.size + "/3";
    document.getElementById("compareBtn").disabled = compare.size < 2;
    list.querySelectorAll("button").forEach((b) =>
      b.addEventListener("click", () => { compare.delete(+b.dataset.id); updateCompareBar(); updateGrid(false); })
    );
  };
  const compareBtn = document.getElementById("compareBtn");
  if (compareBtn) compareBtn.addEventListener("click", () => {
    const cars = CARS.filter((c) => compare.has(c.id));
    const rows = [["Model", "Year", "Price", "Engine", "Transmission", "Location"],
      ...cars.map((c) => [c.name, c.year, "$" + c.price.toLocaleString(), c.fuel, c.transmission, c.location || "—"])];
    let html = "<table class='cmp-table'>" + rows.map((r) => "<tr>" + r.map((c) => "<td>" + c + "</td>").join("") + "</tr>").join("") + "</table>";
    const ov = document.createElement("div");
    ov.className = "modal-overlay";
    ov.innerHTML = `<div class="detail-modal"><button class="modal-close">✕</button><h3>Vehicle Comparison</h3>${html}</div>`;
    ov.querySelector(".modal-close").addEventListener("click", () => ov.remove());
    ov.addEventListener("click", (e) => { if (e.target === ov) ov.remove(); });
    document.body.appendChild(ov);
  });

  /* ============ DETAIL MODAL ============ */
  const openDetail = (car) => {
    if (!car) return;
    const ov = document.createElement("div");
    ov.className = "modal-overlay";
    ov.innerHTML = `
      <div class="detail-modal">
        <button class="modal-close" aria-label="Close">✕</button>
        <div class="detail-media">
          <img src="${car.img}" alt="${car.name}" />
          <button class="btn btn-ghost view-360" aria-label="360 degree view">360°</button>
        </div>
        <div class="detail-body">
          <p class="detail-sub">${car.make.split("-").join(" ").toUpperCase()} · ${car.location || "Showroom"}</p>
          <h3>${car.name}</h3>
          <div class="detail-specs">
            <div><span>Model Year</span><b>${car.year}</b></div>
            <div><span>Price</span><b>$${car.price.toLocaleString()}</b></div>
            <div><span>Engine</span><b>${car.fuel}</b></div>
            <div><span>Transmission</span><b>${car.transmission}</b></div>
            <div><span>Odometer</span><b>${car.km}</b></div>
            <div><span>Location</span><b>${car.location || "—"}</b></div>
          </div>
          <button class="btn btn-gold btn-block car-enquire-detail" data-id="${car.id}">Enquire About This Vehicle</button>
        </div>
      </div>`;
    const media = ov.querySelector(".detail-media");
    const img = ov.querySelector(".detail-media img");
    let spins = 0;
    const spin360 = () => {
      const angles = [
        car.img,
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&q=80",
        "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=900&q=80",
        car.img
      ];
      spins++;
      if (spins > angles.length) { spins = 0; img.classList.remove("spinning"); return; }
      img.classList.add("spinning");
      img.style.opacity = 0;
      setTimeout(() => { img.src = angles[spins - 1]; img.style.opacity = 1; }, 320);
      setTimeout(spin360, 700);
    };
    ov.querySelector(".view-360").addEventListener("click", (e) => {
      e.stopPropagation();
      spin360();
    });
    ov.querySelector(".modal-close").addEventListener("click", () => ov.remove());
    ov.addEventListener("click", (e) => { if (e.target === ov) ov.remove(); });
    ov.querySelector(".car-enquire-detail").addEventListener("click", () => {
      ov.remove();
      document.getElementById("interest").value = "acquisition";
      document.getElementById("message").value = `I would like to enquire about the ${car.name} ($${car.price.toLocaleString()}).`;
      document.getElementById("contactForm").scrollIntoView({ behavior: "smooth" });
    });
    document.body.appendChild(ov);
  };

  loadMoreBtn.addEventListener("click", () => { visibleCount += 6; updateGrid(false); });
  [searchInput, filterMake, filterType, filterPrice, filterYear, filterFuel].forEach((el) =>
    el.addEventListener("input", () => updateGrid(true))
  );
  updateGrid();

  /* ============ GALLERY ============ */
  const galleryGrid = document.getElementById("galleryGrid");
  if (galleryGrid) {
    galleryGrid.innerHTML = GALLERY.map(
      (g) => `<div class="gallery-item" data-caption="${g.caption}"><img src="${g.img}" alt="${g.caption}" loading="lazy" /></div>`
    ).join("");
    galleryGrid.querySelectorAll(".gallery-item").forEach((item) =>
      item.addEventListener("click", () => {
        const img = item.querySelector("img").src;
        const cap = item.dataset.caption;
        const ov = document.createElement("div");
        ov.className = "modal-overlay";
        ov.innerHTML = `
          <div class="lightbox">
            <button class="modal-close" aria-label="Close">✕</button>
            <img src="${img}" alt="${cap}" />
            <span class="lightbox-cap">${cap}</span>
            <span class="lightbox-hint">CLICK ANYWHERE TO CLOSE</span>
          </div>`;
        ov.querySelector(".modal-close").addEventListener("click", () => ov.remove());
        ov.addEventListener("click", (e) => { if (e.target === ov) ov.remove(); });
        document.body.appendChild(ov);
      })
    );
  }

  /* ============ RENT NOW ============ */
  const captureBooking = (data) => {
    try {
      const key = "autoprime_bookings";
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      list.unshift(Object.assign({ id: Date.now(), created: Date.now(), status: "pending" }, data));
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) { /* ignore */ }
  };

  document.querySelectorAll(".rent-now").forEach((btn) =>
    btn.addEventListener("click", () => {
      const plan = btn.dataset.car;
      const booking = { plan, car: plan, date: new Date().toISOString().slice(0, 10), days: 1, name: "Website Visitor", email: "", phone: "" };
      captureBooking(booking);
      const form = document.getElementById("contactForm");
      form.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        document.getElementById("interest").value = "rental";
        document.getElementById("message").value = `I would like to reserve the ${plan} rental experience.`;
      }, 700);
    })
  );

  /* ============ CONTACT (captures to admin console) ============ */
  const captureMessage = (data) => {
    try {
      const key = "autoprime_messages";
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      list.unshift(Object.assign({ id: Date.now(), created: Date.now(), status: "new" }, data));
      localStorage.setItem(key, JSON.stringify(list));
      trackAnalytics();
    } catch (e) { /* storage full */ }
  };
  const trackAnalytics = () => {
    try {
      const key = "autoprime_analytics";
      const an = JSON.parse(localStorage.getItem(key) || "{}");
      an.views = (an.views || 0) + 1;
      an.leads = (an.leads || 0) + 1;
      an.weekly = an.weekly || [];
      const today = new Date().getDay();
      const week = an.weekly || [0, 0, 0, 0, 0, 0, 0];
      week[today] = (week[today] || 0) + 1;
      an.weekly = week;
      localStorage.setItem(key, JSON.stringify(an));
    } catch (e) { /* ignore */ }
  };
  const trackView = () => {
    try {
      const key = "autoprime_analytics";
      const an = JSON.parse(localStorage.getItem(key) || "{}");
      an.views = (an.views || 0) + 1;
      localStorage.setItem(key, JSON.stringify(an));
    } catch (e) { /* ignore */ }
  };

  document.getElementById("contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const interest = document.getElementById("interest").value;
    const message = document.getElementById("message").value;

    window.location.href = `mailto:concierge@autoprime.com?subject=${encodeURIComponent("Consultation: " + interest)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\nInterest: ${interest}\n\n${message}`)}`;

    captureMessage({ name, email, subject: interest, message });

    const success = document.getElementById("formSuccess");
    success.classList.add("show");
    e.target.reset();
    setTimeout(() => success.classList.remove("show"), 6000);
  });

  /* ============ NEWSLETTER (captures email) ============ */
  document.getElementById("newsletterForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const emailInput = e.target.querySelector("input");
    if (emailInput && emailInput.value) {
      try {
        const key = "autoprime_messages";
        const list = JSON.parse(localStorage.getItem(key) || "[]");
        list.unshift({ id: Date.now(), created: Date.now(), status: "new", name: "Newsletter Subscriber", email: emailInput.value, subject: "Newsletter Subscription", message: "Subscribed to the newsletter." });
        localStorage.setItem(key, JSON.stringify(list));
      } catch (err) { /* ignore */ }
    }
    const btn = e.target.querySelector("button");
    btn.textContent = "✓";
    setTimeout(() => { btn.textContent = "→"; e.target.reset(); }, 2500);
  });

  /* Track page view once */
  if (!sessionStorage.getItem("autoprime_viewed")) {
    sessionStorage.setItem("autoprime_viewed", "1");
    trackView();
  }

  /* ============ BACK TO TOP ============ */
  document.getElementById("backToTop").addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );

  /* ============ DRAGGABLE WHATSAPP ============ */
  (() => {
    const btn = document.getElementById("waFloat");
    if (!btn) return;
    const saved = localStorage.getItem("autoprime_wa_pos");
    if (saved) {
      const p = JSON.parse(saved);
      btn.style.left = "auto";
      btn.style.right = "auto";
      btn.style.bottom = "auto";
      btn.style.top = p.top + "px";
      btn.style.left = p.left + "px";
    }
    let drag = false, moved = false, ox = 0, oy = 0, sx = 0, sy = 0;
    const start = (x, y) => {
      drag = true; moved = false;
      btn.classList.add("dragging");
      const r = btn.getBoundingClientRect();
      ox = x - r.left; oy = y - r.top;
      sx = x; sy = y;
    };
    const move = (x, y) => {
      if (!drag) return;
      if (Math.abs(x - sx) > 4 || Math.abs(y - sy) > 4) moved = true;
      let nx = x - ox, ny = y - oy;
      nx = Math.max(8, Math.min(window.innerWidth - btn.offsetWidth - 8, nx));
      ny = Math.max(8, Math.min(window.innerHeight - btn.offsetHeight - 8, ny));
      btn.style.top = ny + "px";
      btn.style.left = nx + "px";
    };
    const end = (x, y) => {
      if (!drag) return;
      drag = false;
      btn.classList.remove("dragging");
      if (moved) {
        try { localStorage.setItem("autoprime_wa_pos", JSON.stringify({ top: parseInt(btn.style.top), left: parseInt(btn.style.left) })); } catch (e) {}
      } else if (x === 0 && y === 0) {
        /* keyboard/click fallback — let the anchor open */
        window.open(btn.href, "_blank");
      }
    };
    btn.addEventListener("pointerdown", (e) => {
      if (e.button === 0) { e.preventDefault(); start(e.clientX, e.clientY); btn.setPointerCapture && btn.setPointerCapture(e.pointerId); }
    });
    btn.addEventListener("pointermove", (e) => move(e.clientX, e.clientY));
    btn.addEventListener("pointerup", (e) => end(e.clientX, e.clientY));
    btn.addEventListener("pointercancel", () => { drag = false; });
    btn.addEventListener("click", (e) => { if (moved) e.preventDefault(); });
  })();
});