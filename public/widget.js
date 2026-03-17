(function () {
  /* ── Read *only* client identity from the script tag ── */
  var script   = document.currentScript;
  var clientId = script.getAttribute("data-client-id") || "client_001";
  var apiKey   = script.getAttribute("data-api-key")   || "";
  var origin   = script.src.replace(/\/widget\.js(\?.*)?$/, "");

  /* ── Defaults used while config loads or if the request fails ── */
  var DEFAULT_COLOR    = "#2563eb";
  var DEFAULT_POSITION = "right";

  /* ── Helpers ── */
  function hexToRgb(hex) {
    var r = 0, g = 0, b = 0;
    hex = hex.replace("#", "");
    if (hex.length === 3) { hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]; }
    r = parseInt(hex.substring(0,2), 16);
    g = parseInt(hex.substring(2,4), 16);
    b = parseInt(hex.substring(4,6), 16);
    return r + "," + g + "," + b;
  }

  /* ── Styles injected once ── */
  var style = document.createElement("style");
  style.textContent =
    "@keyframes estateai-bounce-in{0%{transform:scale(0);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}" +
    "@keyframes estateai-fade-up{0%{opacity:0;transform:translateY(12px) scale(.96)}100%{opacity:1;transform:translateY(0) scale(1)}}";
  document.head.appendChild(style);

  /* ── Chat bubble (rendered immediately with defaults) ── */
  var bubble = document.createElement("div");
  bubble.setAttribute("id", "estateai-bubble");
  bubble.setAttribute("aria-label", "Open chat");
  bubble.setAttribute("role", "button");
  bubble.setAttribute("tabindex", "0");

  var chatIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" ' +
    'stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';

  var closeIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" ' +
    'stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

  function applyBubbleStyle(color, position) {
    var rgb = hexToRgb(color);
    var isLeft = (position || "").toLowerCase() === "left";
    Object.assign(bubble.style, {
      position: "fixed",
      bottom: "20px",
      left: "",
      right: "",
      zIndex: "2147483646",
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, " + color + " 0%, " + color + "cc 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      boxShadow: "0 4px 14px rgba(" + rgb + ",.45)",
      transition: "transform .2s ease, box-shadow .2s ease",
      animation: "estateai-bounce-in .5s ease forwards",
    });
    bubble.style[isLeft ? "left" : "right"] = "20px";
    bubble._rgb = rgb;

    /* reposition container too */
    if (container) {
      container.style.left = "";
      container.style.right = "";
      container.style[isLeft ? "left" : "right"] = "20px";
    }
  }

  bubble.innerHTML = chatIcon;

  /* ── Iframe container ── */
  var container = document.createElement("div");
  container.setAttribute("id", "estateai-widget-container");
  Object.assign(container.style, {
    position: "fixed",
    bottom: "90px",
    right: "20px",         /* default; updated after config loads */
    width: "400px",
    height: "600px",
    zIndex: "2147483647",
    display: "none",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0,0,0,.18)",
    animation: "estateai-fade-up .25s ease forwards",
  });

  /* ── Build iframe src (only client identity — no color/position) ── */
  var src = origin + "/widget?client_id=" + encodeURIComponent(clientId);
  if (apiKey) { src += "&api_key=" + encodeURIComponent(apiKey); }

  var iframe = document.createElement("iframe");
  iframe.setAttribute("id", "estateai-widget-iframe");
  iframe.setAttribute("title", "AI Chatbot");
  iframe.setAttribute("allow", "microphone");
  iframe.src = src;
  Object.assign(iframe.style, {
    width: "100%",
    height: "100%",
    border: "none",
    borderRadius: "16px",
  });

  container.appendChild(iframe);

  /* ── Apply defaults immediately so bubble appears before fetch completes ── */
  applyBubbleStyle(DEFAULT_COLOR, DEFAULT_POSITION);

  /* ── Hover effects (re-bound after color is known) ── */
  bubble.addEventListener("mouseenter", function () {
    bubble.style.transform = "scale(1.1)";
    bubble.style.boxShadow = "0 6px 20px rgba(" + (bubble._rgb || hexToRgb(DEFAULT_COLOR)) + ",.6)";
  });
  bubble.addEventListener("mouseleave", function () {
    bubble.style.transform = "scale(1)";
    bubble.style.boxShadow = "0 4px 14px rgba(" + (bubble._rgb || hexToRgb(DEFAULT_COLOR)) + ",.45)";
  });

  /* ── Toggle logic ── */
  var open = false;
  function toggle() {
    open = !open;
    container.style.display = open ? "block" : "none";
    bubble.innerHTML = open ? closeIcon : chatIcon;
  }

  bubble.addEventListener("click", toggle);
  bubble.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  });

  /* ── Mount ── */
  document.body.appendChild(container);
  document.body.appendChild(bubble);

  /* ── Fetch widget config from backend and apply brand_color + widget_position ── */
  fetch(origin + "/api/widget-config/" + encodeURIComponent(clientId))
    .then(function (res) {
      if (!res.ok) throw new Error("widget-config " + res.status);
      return res.json();
    })
    .then(function (config) {
      var color    = (config.brand_color    || DEFAULT_COLOR).trim();
      var position = (config.widget_position || DEFAULT_POSITION).toString().toLowerCase().trim();
      applyBubbleStyle(color, position);
    })
    .catch(function (err) {
      /* Silently keep defaults — widget remains fully functional */
      console.warn("[EstateAI widget] Could not load config:", err);
    });
})();
