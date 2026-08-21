// ============================================================
// AUTOPRIME — AI Concierge Chat Bot
// Knowledge engine: site fleet + latest 2026 models + services
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- LATEST MODELS (2025-2026) ---------- */
  const LATEST = [
    { name: "Rolls-Royce Spectre", type: "electric", price: "$420,000", spec: "All-electric grand coupe · 585 hp · 520 km range · Starlight headliner" },
    { name: "Lamborghini Temerario", type: "sports", price: "$340,000", spec: "4.0L V8 biturbo hybrid · 920 hp · 0–100 in 2.7s" },
    { name: "Ferrari 12Cilindri", type: "sports", price: "$425,000", spec: "6.5L V12 · 830 hp · 9,500 rpm · front-mid engine masterpiece" },
    { name: "Bentley Continental GT Speed", type: "grand", price: "$305,000", spec: "4.0L V8 PHEV · 771 hp · 850 Nm · 2026 flagship" },
    { name: "Aston Martin Vanquish", type: "grand", price: "$425,000", spec: "5.2L V12 · 824 hp · pure combustion grand tourer" },
    { name: "Aston Martin Valhalla", type: "sports", price: "$800,000", spec: "4.0L V8 hybrid · 998 hp · F1-inspired active aero" },
    { name: "McLaren W1", type: "sports", price: "$2,100,000", spec: "4.0L V8 hybrid · 1,258 hp · 350 km/h · limited to 399" },
    { name: "Bugatti Tourbillon", type: "sports", price: "$4,100,000", spec: "8.3L V16 hybrid · 1,775 hp · 445 km/h · 250 units" },
    { name: "Porsche 911 Dakar", type: "sports", price: "$220,000", spec: "3.0L flat-6 · 473 hp · rally-bred off-road 911" },
    { name: "Maserati GranTurismo Folgore", type: "electric", price: "$205,000", spec: "Tri-motor electric · 761 hp · 450 km range · pure Italian EV" },
    { name: "Mercedes-Maybach EQS SUV", type: "suv", price: "$210,000", spec: "All-electric luxury SUV · 649 hp · reclining rear lounge" },
    { name: "Land Rover Defender Octa", type: "suv", price: "$158,000", spec: "4.4L V8 twin-turbo · 626 hp · the most extreme Defender ever" }
  ];

  /* ---------- RENTAL PACKAGES ---------- */
  const RENTALS = [
    { name: "Executive", price: "$189/day", desc: "Mercedes S-Class or BMW 7 Series, chauffeur, full insurance" },
    { name: "Grand Tour", price: "$480/day", desc: "Bentley Continental GT or Rolls-Royce Ghost, champagne welcome, curated route" },
    { name: "Racing", price: "$950/day", desc: "Lamborghini, Ferrari or McLaren, track day access + instruction" }
  ];

  /* ---------- HELPERS ---------- */
  const $ = (sel) => document.querySelector(sel);
  const has = (text, words) => words.some((w) => text.includes(w));
  const fmt = (n) => "$" + n.toLocaleString();

  /* ---------- CHAT UI ELEMENTS ---------- */
  const fab = $("#chatFab");
  const panel = $("#chatPanel");
  const minBtn = $("#chatMin");
  const messages = $("#chatMessages");
  const suggestions = $("#chatSuggestions");
  const form = $("#chatForm");
  const input = $("#chatInput");

  let open = false;
  let greeted = false;

  /* ---------- OPEN / CLOSE ---------- */
  const toggleChat = (force) => {
    open = typeof force === "boolean" ? force : !open;
    fab.classList.toggle("active", open);
    panel.classList.toggle("open", open);
    panel.setAttribute("aria-hidden", String(!open));
    if (open && !greeted) {
      greeted = true;
      setTimeout(() => {
        addBot(
          `Welcome to ${window.BRANDING ? window.BRANDING.name : "AutoPrime"}. I am your private concierge — knowledgeable about our entire collection and the latest automobiles worldwide. How may I assist you?`
        );
        showSuggestions();
      }, 450);
    }
  };
  fab.addEventListener("click", () => toggleChat());
  minBtn.addEventListener("click", () => toggleChat(false));

  /* ---------- MESSAGE RENDERING ---------- */
  const timeNow = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const addMsg = (who, html) => {
    const wrap = document.createElement("div");
    wrap.className = "chat-msg " + who;
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.innerHTML = html;
    const time = document.createElement("span");
    time.className = "chat-time";
    time.textContent = timeNow();
    wrap.appendChild(bubble);
    wrap.appendChild(time);
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
    return wrap;
  };
  const addBot = (html) => {
    addMsg("bot", html);
    speakMessage(html);
  };
  const addUser = (text) => addMsg("user", escapeHtml(text));

  const escapeHtml = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /* ---------- TYPING INDICATOR ---------- */
  let typingEl = null;
  const showTyping = () => {
    hideTyping();
    typingEl = document.createElement("div");
    typingEl.className = "chat-msg bot";
    typingEl.innerHTML =
      '<div class="chat-bubble typing-dots"><span></span><span></span><span></span></div>';
    messages.appendChild(typingEl);
    messages.scrollTop = messages.scrollHeight;
  };
  const hideTyping = () => {
    if (typingEl) { typingEl.remove(); typingEl = null; }
  };
  const botReply = (html, delay = 600) => {
    showTyping();
    setTimeout(() => {
      hideTyping();
      addBot(html);
      showSuggestions();
    }, delay);
  };

  /* ---------- SUGGESTIONS ---------- */
  const SUGGESTIONS = [
    "Show all cars",
    "Latest 2026 models",
    "Which cars are under $300K?",
    "SUV collection",
    "Tell me about rentals",
    "How does financing work?"
  ];
  const showSuggestions = () => {
    suggestions.innerHTML = "";
    SUGGESTIONS.forEach((s) => {
      const b = document.createElement("button");
      b.textContent = s;
      b.addEventListener("click", () => {
        input.value = s;
        handleSend(s);
      });
      suggestions.appendChild(b);
    });
  };

  /* ---------- CAR LOOKUP ---------- */
  const findCars = (query) => {
    const q = query.toLowerCase();
    const byMake = CARS.filter((c) => c.make.includes(q));
    const byName = CARS.filter((c) => c.name.toLowerCase().includes(q));
    const merged = [...new Map([...byName, ...byMake].map((c) => [c.id, c])).values()];
    return merged;
  };

  const findLatest = (q) => {
    const query = q.toLowerCase();
    return LATEST.filter((c) =>
      c.name.toLowerCase().includes(query) ||
      (query.includes("electric") && c.type === "electric") ||
      (query.includes("sports") && c.type === "sports") ||
      (query.includes("suv") && c.type === "suv")
    );
  };

  const carCard = (c, latest) => `
    <b>${escapeHtml(c.name)}</b> (${latest ? c.price : fmt(c.price)})
    <ul>
      <li>${latest ? c.spec : "Spec: " + c.fuel + " · " + c.transmission + " · " + c.km}</li>
      <li>${latest ? "Type: " + c.type : "Type: " + c.type.replace("-", " ") + " · " + c.year}</li>
    </ul>`;

  /* ---------- INTENT ENGINE ---------- */
  const handleSend = (raw) => {
    const text = raw.trim().toLowerCase();
    if (!text) return;
    addUser(raw.trim());

    /* --- greeting --- */
    if (has(text, ["hi", "hello", "salam", "adaab", "hey ", "good morning", "good evening", "greetings", "marhaba"])) {
      return botReply("A pleasure to meet you. I am the AutoPrime concierge — your private guide to our collection and the finest automobiles of 2026. What brings you in today?");
    }

    /* --- help --- */
    if (has(text, ["help", "what can you", "how can you", "options"])) {
      return botReply(
        "I can assist with: <ul><li>Our full fleet &amp; pricing</li><li>The latest 2026 models</li><li>Car recommendations by budget or type</li><li>Private rentals</li><li>Financing &amp; acquisitions</li><li>Bespoke sourcing &amp; restoration</li><li>Contacting our advisors</li></ul>Ask me anything."
      );
    }

    /* --- show all / fleet --- */
    if (has(text, ["show all", "all cars", "all automobiles", "list of cars", "your collection", "what cars", "which cars do you have", "fleet"])) {
      const list = CARS.map((c) => `${c.name} — ${fmt(c.price)}`).join("<br>");
      return botReply(`Our full collection: <br>${list}<br><br>Use the search above to explore, or ask me about a specific marque.`);
    }

    /* --- latest 2026 --- */
    if (has(text, ["latest", "new model", "newest", "2025", "2026", "just released", "new cars", "upcoming"])) {
      const list = LATEST.map((c) => `<b>${c.name}</b> — ${c.price}<br><small>${c.spec}</small>`).join("<br><br>");
      return botReply(`Here are the most talked-about 2026 releases:<br><br>${list}<br><br>I can arrange a private briefing or allocation enquiry on any of these.`);
    }

    /* --- budget recommendation --- */
    const budgetMatch = text.match(/(?:under|below|less than|max(?:imum)?|up to|around|within)\s*(?:\$)?([\d.,]+)\s*k?/);
    if (budgetMatch || has(text, ["budget", "cheap", "affordable", "price range"])) {
      const budget = budgetMatch ? parseFloat(budgetMatch[1].replace(/,/g, "")) * 1000 : 400000;
      const inFleet = CARS.filter((c) => c.price <= budget);
      const inLatest = LATEST.filter((c) => parseFloat(c.price.replace(/[$,]/g, "")) <= budget);
      if (inFleet.length || inLatest.length) {
        const fleetList = inFleet.map((c) => `${c.name} — ${fmt(c.price)}`).join("<br>");
        const latestList = inLatest.map((c) => `${c.name} — ${c.price}`).join("<br>");
        let reply = `Within your budget of ${fmt(budget)}: <br><br>`;
        if (fleetList) reply += `<b>In our collection:</b><br>${fleetList}<br><br>`;
        if (latestList) reply += `<b>Latest models available to order:</b><br>${latestList}`;
        return botReply(reply + "<br><br>Would you like to arrange a private viewing?");
      }
      return botReply(`Our entry-level automobiles begin around $200,000. May I recommend we arrange a consultation to tailor options to your criteria?`);
    }

    /* --- car type --- */
    const typeWords = [
      { type: "sports", keys: ["sports", "supercar", "racing car", "hypercar"] },
      { type: "suv", keys: ["suv", "off-road", "off road"] },
      { type: "electric", keys: ["electric", "ev", "electric car"] },
      { type: "grand", keys: ["grand tourer", "gt", "touring"] },
      { type: "limousine", keys: ["limousine", "limo", "sedan"] }
    ];
    const typeHit = typeWords.find((t) => t.keys.some((k) => text.includes(k)));
    if (typeHit) {
      const inFleet = CARS.filter((c) => c.type === typeHit.type);
      const inLatest = LATEST.filter((c) => c.type === typeHit.type);
      const fleetList = inFleet.map((c) => `${c.name} — ${fmt(c.price)}`).join("<br>");
      const latestList = inLatest.map((c) => `${c.name} — ${c.price}`).join("<br>");
      let reply = `<b>${typeHit.type.charAt(0).toUpperCase() + typeHit.type.slice(1)} collection:</b><br><br>`;
      if (fleetList) reply += `In our collection:<br>${fleetList}<br><br>`;
      if (latestList) reply += `Latest models:<br>${latestList}`;
      return botReply(reply);
    }

    /* --- specific marque --- */
    const MAKES = {
      "rolls-royce": ["rolls", "phantom", "cullinan", "ghost", "spectre"],
      bentley: ["bentley", "continental", "bentayga", "batur"],
      lamborghini: ["lamborghini", "revuelto", "temerario", "urus", "huracan"],
      ferrari: ["ferrari", "sf90", "12cilindri", "purosangue"],
      aston: ["aston", "db12", "valkyrie", "vanquish", "valhalla"],
      maybach: ["maybach", "mercedes", "s680", "s-class"],
      porsche: ["porsche", "911", "cayenne", "dakar", "gt3"],
      maserati: ["maserati", "mc20", "folgore", "granturismo"]
    };
    const makeHit = Object.entries(MAKES).find(([, keys]) => keys.some((k) => text.includes(k)));
    if (makeHit) {
      const mk = makeHit[0];
      const inFleet = findCars(mk);
      const inLatest = findLatest(mk);
      const list = [
        ...inFleet.map((c) => `${c.name} — ${fmt(c.price)}<br><small>${c.fuel} · ${c.transmission} · ${c.km}</small>`),
        ...inLatest.map((c) => `${c.name} — ${c.price}<br><small>${c.spec}</small>`)
      ];
      if (list.length) {
        return botReply(
          `<b>${mk.split("-").join(" ").toUpperCase()}</b> in our portfolio:<br><br>` +
          list.join("<br><br>") +
          "<br><br>Would you like details on availability?"
        );
      }
    }

    /* --- specific model --- */
    const found = findCars(text);
    const foundLatest = findLatest(text);
    if (found.length || foundLatest.length) {
      const list = [
        ...found.map((c) => carCard(c, false)),
        ...foundLatest.map((c) => carCard(c, true))
      ];
      return botReply(list.join("<br><br>") + "<br><br>May I arrange a private viewing?");
    }

    /* --- price of specific --- */
    if (has(text, ["price", "how much", "cost", "value"])) {
      const named = CARS.filter((c) => c.name.toLowerCase().includes(text.replace(/price|how much|cost|value/g, "").trim()));
      const namedLatest = LATEST.filter((c) => c.name.toLowerCase().includes(text.replace(/price|how much|cost|value/g, "").trim()));
      if (named.length || namedLatest.length) {
        const list = [
          ...named.map((c) => `${c.name} — <b>${fmt(c.price)}</b>`),
          ...namedLatest.map((c) => `${c.name} — <b>${c.price}</b>`)
        ];
        return botReply("Current pricing:<br>" + list.join("<br>"));
      }
    }

    /* --- rentals --- */
    if (has(text, ["rent", "rental", "borrow", "chauffeur", "grand tour", "executive"])) {
      const list = RENTALS.map((r) => `<b>${r.name}</b> — ${r.price}<br><small>${r.desc}</small>`).join("<br><br>");
      return botReply(`Our private rental experiences:<br><br>${list}<br><br>Every rental includes full insurance, detailing, and a 24/7 concierge line. Reserve below via the contact form — I have pre-filled nothing, just mention the plan.`);
    }

    /* --- financing --- */
    if (has(text, ["finance", "financing", "installment", "lease", "payment plan", "loan", "emi"])) {
      return botReply(
        "We offer flexible acquisition programs: <ul><li>Cash purchase with certified provenance</li><li>Structured finance from 12 to 60 months</li><li>Private leasing for select models</li><li>Trade-in &amp; portfolio management</li></ul>Rates are tailored per client. Shall I connect you with our finance advisor?"
      );
    }

    /* --- test drive / viewing --- */
    if (has(text, ["test drive", "viewing", "see it", "appointment", "book", "schedule"])) {
      return botReply("Absolutely — private viewings are by appointment at our Beverly Hills salon. Use the contact form or mention your preferred marque, and I will have an advisor call you within hours.");
    }

    /* --- sourcing --- */
    if (has(text, ["source", "bespoke", "special order", "commission", "find me a", "look for", "search for"])) {
      return botReply("Our bespoke sourcing team locates limited-edition and commission-built automobiles worldwide — from LaFerrari allocations to one-off coachbuilt commissions. Share your wishlist and I will brief the team.");
    }

    /* --- restoration / collection --- */
    if (has(text, ["restor", "restore", "collect", "collection care", "storage"])) {
      return botReply("We offer concours-grade restoration and climate-controlled collection care for multi-car owners. Tell me the model and current condition, and I will arrange an atelier consultation.");
    }

    /* --- contact --- */
    if (has(text, ["contact", "phone", "email", "number", "location", "address", "where are you", "hours", "open"])) {
      return botReply("You can reach us at: <ul><li><b>concierge@autoprime.com</b> — acquisitions &amp; sourcing</li><li><b>+1 (310) 555-0134</b> — rental reservations</li><li><b>Beverly Hills · Monaco · Dubai</b> — salons worldwide</li><li><b>Mon–Sat 9AM–8PM</b></li></ul>Or use the consultation form below and we respond within hours.");
    }

    /* --- about --- */
    if (has(text, ["about", "who are you", "what is autoprime", "your company", "tell me about the brand", "history"])) {
      return botReply("AutoPrime has been quietly serving the world's most discerning collectors since 2011. We curate investment-grade automobiles, manage private collections, and arrange chauffeured experiences — with absolute discretion. 1,200+ vehicles delivered across 32 countries.");
    }

    /* --- thanks --- */
    if (has(text, ["thank", "shukriya", "shukr", "great", "awesome", "nice"])) {
      return botReply("It is my pleasure. Should you wish to proceed, our concierge is at your service around the clock. May I assist with anything else?");
    }

    /* --- bye --- */
    if (has(text, ["bye", "goodbye", "exit", "see you"])) {
      return botReply("Until we meet again. The AutoPrime salon is always open to you. Farewell.");
    }

    /* --- fallback --- */
    return botReply(
      "I specialise in our collection, latest 2026 releases, rentals, financing and sourcing. Try asking: <ul><li>\"Show me the Lamborghinis\"</li><li>\"What's new in 2026?\"</li><li>\"Cars under $400K\"</li><li>\"Tell me about rentals\"</li></ul>Or ask me about any specific marque."
    );
  };

  /* ---------- FORM SUBMIT ---------- */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value;
    input.value = "";
    handleSend(v);
  });

  showSuggestions();

  /* ============================================================
     VOICE AI — Speech Recognition (input) + Text-to-Speech
     ============================================================ */
  const micBtn = $("#chatMic");
  const speakBtn = $("#chatSpeak");
  const voiceBar = $("#chatVoiceBar");

  /* ---------- Speech-to-Text (user voice -> question) ---------- */
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognizer = null;
  let listening = false;

  if (SpeechRec) {
    recognizer = new SpeechRec();
    recognizer.continuous = true;
    recognizer.interimResults = true;
    recognizer.lang = "en-US";
    let finalText = "";

    recognizer.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const tr = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += tr + " ";
        else interim += tr;
      }
      input.value = (finalText + interim).trim();
    };
    recognizer.onerror = (e) => {
      if (e.error === "not-allowed") {
        stopListening();
        addBot("<b>Microphone access is denied.</b> Please allow microphone permission in your browser to use voice input, or type your question instead.");
      } else if (e.error === "no-speech") {
        stopListening();
      } else {
        stopListening();
      }
    };
    recognizer.onend = () => {
      if (listening) {
        if (input.value.trim()) {
          stopListening();
          handleSend(input.value);
          input.value = "";
        } else {
          stopListening();
        }
      }
    };
  }

  const startListening = () => {
    if (!recognizer) {
      addBot("Voice input is not supported in this browser. Please use Google Chrome for the best voice experience, or type your question.");
      return;
    }
    listening = true;
    finalText = "";
    input.value = "";
    input.placeholder = "Listening… speak now";
    micBtn.classList.add("active");
    voiceBar.classList.add("active");
    try { recognizer.start(); } catch (_) { /* already started */ }
  };
  const stopListening = () => {
    listening = false;
    micBtn.classList.remove("active");
    voiceBar.classList.remove("active");
    input.placeholder = "Ask about any automobile...";
    try { recognizer.stop(); } catch (_) { /* not running */ }
  };

  micBtn.addEventListener("click", () => (listening ? stopListening() : startListening()));

  /* ---------- Text-to-Speech (bot answers spoken aloud) ---------- */
  let voiceEnabled = false;
  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const speakMessage = (html) => {
    if (!voiceEnabled) return;
    const text = stripHtml(html);
    if (!text || !window.speechSynthesis) return;
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 1.02;
    utter.pitch = 1;
    const voices = speechSynthesis.getVoices();
    const preferred = voices.find((v) => /en[-_]US/i.test(v.lang) && /female|natural|samantha|zira|google/i.test(v.name));
    if (preferred) utter.voice = preferred;
    speechSynthesis.speak(utter);
  };

  speakBtn.addEventListener("click", () => {
    voiceEnabled = !voiceEnabled;
    speakBtn.classList.toggle("active", voiceEnabled);
    if (voiceEnabled && speechSynthesis) {
      const greet = "Voice replies are now on. I will read my answers aloud.";
      const u = new SpeechSynthesisUtterance(greet);
      u.lang = "en-US";
      speechSynthesis.speak(u);
    } else if (speechSynthesis) {
      speechSynthesis.cancel();
    }
  });

  /* Stop voice when chat closes */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      stopListening();
      if (speechSynthesis) speechSynthesis.cancel();
    }
  });

  /* Preload available voices */
  if (window.speechSynthesis) {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  }
});