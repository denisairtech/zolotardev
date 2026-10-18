(function () {
  "use strict";
  var S = window.SITE, I = window.I18N, LANGS = ["he", "ru", "en"];
  var SHOTS = ["1home", "2room", "3apt", "4tools", "5duct", "6cable", "7object", "8send"];
  var cur = "he";

  function fill(str, lang) {
    return String(str)
      .replace(/\{brand\}/g, S.brand[lang] || S.brand.he)
      .replace(/\{owner\}/g, S.owner[lang] || S.owner.he)
      .replace(/\{year\}/g, S.year).replace(/\{publisher\}/g, S.appPublisher || "");
  }
  function t(key, lang) { lang = lang || cur; return fill((I[lang] && I[lang][key]) || I.he[key] || "", lang); }
  function monogram(lang) {
    if (S.monogram) return S.monogram;
    var w = (S.brand[lang] || S.brand.he).trim().split(/\s+/);
    return (w[0].charAt(0) + (w[1] ? w[1].charAt(0) : "")).toUpperCase();
  }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function applyLang(lang) {
    if (LANGS.indexOf(lang) < 0) lang = "he";
    cur = lang;
    var html = document.documentElement;
    html.lang = lang === "he" ? "he" : lang;
    html.dir = lang === "he" ? "rtl" : "ltr";
    document.title = t("meta.title");
    var md = document.querySelector('meta[name="description"]'); if (md) md.content = t("meta.desc");
    $all("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    $all("[data-i18n-html]").forEach(function (el) { el.innerHTML = t(el.getAttribute("data-i18n-html")); });
    $all("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var p = pair.split(":"); if (p.length === 2) el.setAttribute(p[0].trim(), t(p[1].trim()));
      });
    });
    $all("[data-brand]").forEach(function (el) { el.textContent = S.brand[lang]; });
    $all("[data-owner]").forEach(function (el) { el.textContent = S.owner[lang]; });
    $all("[data-monogram]").forEach(function (el) { el.textContent = monogram(lang); });
    $all("img[data-shot]").forEach(function (img) {
      var k = img.getAttribute("data-shot");
      img.src = "assets/img/climasnap/" + lang + "/" + k + ".svg";
      img.alt = "ClimaSnap IL — " + t("shot." + k);
    });
    $all("[data-shot-cap]").forEach(function (el) { el.textContent = t("shot." + el.getAttribute("data-shot-cap")); });
    $all(".lang-switch button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-lang") === lang ? "true" : "false");
    });
    try { localStorage.setItem("site-lang", lang); } catch (e) {}
  }

  function applyContacts() {
    var c = S.contact;
    $all("[data-href]").forEach(function (a) {
      var k = a.getAttribute("data-href");
      var map = { tel: "tel:" + c.phoneE164, wa: "https://wa.me/" + c.whatsapp, mail: "mailto:" + c.email,
        fb: c.facebook, ig: c.instagram, privacy: S.privacyUrl };
      if (map[k]) a.href = map[k];
    });
    $all("[data-contact]").forEach(function (el) {
      var k = el.getAttribute("data-contact");
      var map = { phone: c.phoneDisplay, email: c.email, ig: c.instagramHandle };
      if (map[k]) el.textContent = map[k];
    });
  }

  function buildGallery() {
    var track = document.getElementById("shots");
    if (!track) return;
    track.innerHTML = SHOTS.map(function (k) {
      return '<figure class="shot"><div class="phone sm"><img data-shot="' + k + '" loading="lazy" decoding="async" width="540" height="1169" alt=""></div>' +
        '<figcaption data-shot-cap="' + k + '"></figcaption></figure>';
    }).join("");
    $all("[data-scroll]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var dir = btn.getAttribute("data-scroll") === "next" ? 1 : -1;
        var rtl = document.documentElement.dir === "rtl";
        var step = track.querySelector(".shot").getBoundingClientRect().width + 16;
        track.scrollBy({ left: dir * step * (rtl ? -1 : 1), behavior: "smooth" });
      });
    });
  }

  function initForm() {
    var f = document.getElementById("contact-form"); if (!f) return;
    var err = document.getElementById("form-err");
    function compose() {
      var name = f.elements.name.value.trim(), biz = f.elements.biz.value.trim(),
          type = f.elements.type, msg = f.elements.msg.value.trim();
      if (!name || !msg) { err.textContent = t("form.err"); err.hidden = false; (name ? f.elements.msg : f.elements.name).focus(); return null; }
      err.hidden = true;
      var lines = [t("form.hello"), "", t("form.name") + ": " + name];
      if (biz) lines.push(t("form.biz").replace(/\s*\(.*\)$/, "") + ": " + biz);
      lines.push(t("form.type") + ": " + type.options[type.selectedIndex].text, "", msg);
      return lines.join("\n");
    }
    f.addEventListener("submit", function (e) { e.preventDefault(); });
    document.getElementById("send-wa").addEventListener("click", function () {
      var m = compose(); if (!m) return;
      window.open("https://wa.me/" + S.contact.whatsapp + "?text=" + encodeURIComponent(m), "_blank", "noopener");
    });
    document.getElementById("send-mail").addEventListener("click", function () {
      var m = compose(); if (!m) return;
      location.href = "mailto:" + S.contact.email + "?subject=" + encodeURIComponent(t("form.subject")) + "&body=" + encodeURIComponent(m);
    });
  }

  function initNav() {
    var btn = document.getElementById("menu-btn"), nav = document.getElementById("site-nav");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      nav.classList.toggle("open", !open);
    });
    $all("#site-nav a").forEach(function (a) { a.addEventListener("click", function () {
      btn.setAttribute("aria-expanded", "false"); nav.classList.remove("open"); }); });
  }

  function initVideo() {
    var v = document.querySelector("video[data-b64]"); if (!v) return;
    var started = false;
    function load() {
      if (started) return; started = true;
      fetch(v.getAttribute("data-b64")).then(function (r) { return r.text(); }).then(function (t) {
        var bin = atob(t.trim()), n = bin.length, u8 = new Uint8Array(n);
        for (var i = 0; i < n; i++) u8[i] = bin.charCodeAt(i);
        v.src = URL.createObjectURL(new Blob([u8], { type: "video/mp4" }));
      }).catch(function () { started = false; });
    }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { load(); io.disconnect(); } }, { rootMargin: "300px" });
      io.observe(v);
    } else load();
    v.addEventListener("click", load);
  }

  function initialLang() {
    var q = (location.search.match(/[?&]lang=(he|ru|en)/) || [])[1];
    if (q) return q;
    try { var s = localStorage.getItem("site-lang"); if (s) return s; } catch (e) {}
    return "he";
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildGallery();
    applyContacts();
    applyLang(initialLang());
    initForm();
    initNav();
    initVideo();
    $all(".lang-switch button").forEach(function (b) {
      b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang")); });
    });
  });
})();
