// ============================================================
// TAHA AHMED VLOGS — main.js
// ============================================================
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Seekbar (scroll progress) ---------------- */
  var seekFill = document.getElementById("seekbarFill");
  function updateSeekbar() {
    var doc = document.documentElement;
    var scrollTop = doc.scrollTop || document.body.scrollTop;
    var height = doc.scrollHeight - doc.clientHeight;
    var pct = height > 0 ? (scrollTop / height) * 100 : 0;
    if (seekFill) seekFill.style.width = pct + "%";
  }
  document.addEventListener("scroll", updateSeekbar, { passive: true });
  updateSeekbar();

  /* ---------------- Mobile menu ---------------- */
  var burger = document.getElementById("burgerBtn");
  var mobileMenu = document.getElementById("mobileMenu");
  var scrim = document.getElementById("scrim");
  function closeMenu() {
    mobileMenu.classList.remove("open");
    scrim.classList.remove("open");
  }
  if (burger) {
    burger.addEventListener("click", function () {
      mobileMenu.classList.toggle("open");
      scrim.classList.toggle("open");
    });
  }
  if (scrim) scrim.addEventListener("click", closeMenu);
  document.querySelectorAll(".mobile-menu a").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------------- Hero particle canvas ---------------- */
  var canvas = document.getElementById("hero-canvas");
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var particles = [];
    var COLORS = ["#3b82f6", "#8b5cf6", "#ec4899"];
    var hero = canvas.closest(".hero");

    function resize() {
      var rect = hero.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      initParticles(rect.width, rect.height);
    }

    function initParticles(w, h) {
      var count = Math.min(70, Math.floor((w * h) / 16000));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.8 + 0.6,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          c: COLORS[i % COLORS.length],
          a: Math.random() * 0.5 + 0.25
        });
      }
    }

    function tick() {
      var rect = hero.getBoundingClientRect();
      var w = rect.width, h = rect.height;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = p.a;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      // connecting lines for a subtle "network" feel
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var dx = particles[a].x - particles[b].x;
          var dy = particles[a].y - particles[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.strokeStyle = "rgba(139,92,246," + (0.12 * (1 - dist / 110)) + ")";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(tick);
    }

    window.addEventListener("resize", resize);
    resize();
    requestAnimationFrame(tick);
  }

  /* ---------------- Video modal (click-to-play) ---------------- */
  var modal = document.getElementById("videoModal");
  var modalInner = document.getElementById("modalInner");
  var modalClose = document.getElementById("modalClose");

  function openVideo(videoId, ratio) {
    modalInner.classList.remove("ratio-16-9", "ratio-9-16");
    modalInner.classList.add(ratio === "9-16" ? "ratio-9-16" : "ratio-16-9");
    var iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube.com/embed/" + videoId + "?autoplay=1&rel=0&playsinline=1";
    iframe.title = "YouTube video player";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen";
    iframe.allowFullscreen = true;
    modalInner.appendChild(iframe);
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeVideo() {
    modal.classList.remove("open");
    document.body.style.overflow = "";
    // remove iframe after transition so playback stops
    setTimeout(function () {
      var iframe = modalInner.querySelector("iframe");
      if (iframe) iframe.remove();
    }, 300);
  }

  document.querySelectorAll("[data-video]").forEach(function (el) {
    el.addEventListener("click", function () {
      openVideo(el.getAttribute("data-video"), el.getAttribute("data-ratio"));
    });
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openVideo(el.getAttribute("data-video"), el.getAttribute("data-ratio"));
      }
    });
  });

  if (modalClose) modalClose.addEventListener("click", closeVideo);
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeVideo();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("open")) closeVideo();
  });

  /* ---------------- Vlog gallery filters ---------------- */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var vlogCards = document.querySelectorAll("#vlogGrid .card");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var filter = btn.getAttribute("data-filter");
      vlogCards.forEach(function (card) {
        var tags = (card.getAttribute("data-tags") || "").split(" ");
        var show = filter === "all" || tags.indexOf(filter) !== -1;
        card.style.display = show ? "" : "none";
      });
    });
  });

  /* ---------------- Shorts rail arrows ---------------- */
  var rail = document.getElementById("shortsRail");
  var railLeft = document.getElementById("railLeft");
  var railRight = document.getElementById("railRight");
  function scrollRail(dir) {
    if (!rail) return;
    var amount = Math.min(rail.clientWidth * 0.8, 600) * dir;
    rail.scrollBy({ left: amount, behavior: reduceMotion ? "auto" : "smooth" });
  }
  if (railLeft) railLeft.addEventListener("click", function () { scrollRail(-1); });
  if (railRight) railRight.addEventListener("click", function () { scrollRail(1); });

  /* ---------------- Floating scroll button (down / up toggle) ---------------- */
  var scrollFab = document.getElementById("scrollFab");
  var fabIcon = scrollFab ? scrollFab.querySelector("svg") : null;

  function nearBottom() {
    var doc = document.documentElement;
    return doc.scrollTop + doc.clientHeight >= doc.scrollHeight - 80;
  }

  function updateFab() {
    if (!fabIcon) return;
    if (nearBottom()) {
      fabIcon.style.transform = "rotate(180deg)";
      scrollFab.setAttribute("aria-label", "Scroll to top");
    } else {
      fabIcon.style.transform = "rotate(0deg)";
      scrollFab.setAttribute("aria-label", "Scroll to bottom");
    }
  }
  document.addEventListener("scroll", updateFab, { passive: true });
  updateFab();

  if (scrollFab) {
    scrollFab.addEventListener("click", function () {
      if (nearBottom()) {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      } else {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
      }
    });
  }
})();

// ============================================================
// TAHA AI — floating assistant widget
// ============================================================
(function () {
  "use strict";

  var fab = document.getElementById("aiFab");
  var panel = document.getElementById("aiPanel");
  var closeBtn = document.getElementById("aiCloseBtn");
  var body = document.getElementById("aiBody");
  var form = document.getElementById("aiForm");
  var input = document.getElementById("aiInput");

  if (!fab || !panel) return;

  var history = []; // {role: 'user'|'assistant', content: string}
  var MAX_HISTORY = 8;

  function openPanel() {
    panel.classList.add("open");
    fab.classList.add("open");
    setTimeout(function () { input.focus(); }, 200);
  }
  function closePanel() {
    panel.classList.remove("open");
    fab.classList.remove("open");
  }
  fab.addEventListener("click", function () {
    panel.classList.contains("open") ? closePanel() : openPanel();
  });
  if (closeBtn) closeBtn.addEventListener("click", closePanel);

  function scrollToBottom() {
    body.scrollTop = body.scrollHeight;
  }

  function addBotMessage(text) {
    var el = document.createElement("div");
    el.className = "ai-msg bot";
    el.innerHTML = text;
    body.appendChild(el);
    scrollToBottom();
  }

  function addUserMessage(text) {
    var el = document.createElement("div");
    el.className = "ai-msg user";
    el.textContent = text;
    body.appendChild(el);
    scrollToBottom();
  }

  function addTyping() {
    var el = document.createElement("div");
    el.className = "ai-msg bot typing";
    el.id = "aiTypingIndicator";
    el.innerHTML = "<span></span><span></span><span></span>";
    body.appendChild(el);
    scrollToBottom();
    return el;
  }

  function removeTyping() {
    var el = document.getElementById("aiTypingIndicator");
    if (el) el.remove();
  }

  // quick-action chips that scroll to a section
  document.querySelectorAll(".ai-chip[data-scroll]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var target = document.querySelector(chip.getAttribute("data-scroll"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
      closePanel();
    });
  });

  // suggested-question chips that ask the AI directly
  document.querySelectorAll(".ai-chip.ai-ask").forEach(function (chip) {
    chip.addEventListener("click", function () {
      sendMessage(chip.textContent.trim());
    });
  });

  async function sendMessage(text) {
    if (!text) return;
    addUserMessage(text);
    history.push({ role: "user", content: text });
    if (history.length > MAX_HISTORY) history = history.slice(-MAX_HISTORY);

    var typingEl = addTyping();

    try {
      var res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: history.slice(0, -1) })
      });

      if (!res.ok) throw new Error("Bad response");
      var data = await res.json();
      removeTyping();
      var reply = (data && data.reply) ? data.reply : "Sorry, I couldn't get a response right now. Try WhatsApp or email instead!";
      addBotMessage(reply);
      history.push({ role: "assistant", content: reply });
    } catch (err) {
      removeTyping();
      addBotMessage("Hmm, I'm having trouble connecting right now. You can reach Taha directly on <a href=\"https://wa.me/923336506507\" target=\"_blank\" rel=\"noopener\" style=\"color:#ec4899;\">WhatsApp</a> or <a href=\"mailto:tahastars23@gmail.com\" style=\"color:#ec4899;\">email</a>.");
    }
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) return;
      input.value = "";
      sendMessage(text);
    });
  }
})();
