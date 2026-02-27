const widget = document.getElementById("widget");
const toggle = document.getElementById("widget-toggle");
const closeBtn = document.getElementById("close-widget");
const chat = document.getElementById("chat");
const form = document.getElementById("chat-form");
const input = document.getElementById("chat-input");
const quickActions = document.getElementById("quick-actions");
const speechText = document.getElementById("speech-text");
const avatarCard = document.getElementById("avatar-card");
const avatarVideo = document.getElementById("avatar-video");
const voiceToggle = document.getElementById("toggle-voice");
const listenStatus = document.getElementById("listen-status");
const micButton = document.getElementById("mic-button");
const micStatus = document.getElementById("mic-status");
const productPanel = document.getElementById("product-panel");
const productImage = document.getElementById("product-image");
const productName = document.getElementById("product-name");
const productList = document.getElementById("product-list");
const productLink = document.getElementById("product-link");
const closePanel = document.getElementById("close-panel");

let isOpen = false;
let hasGreeted = false;
let voiceEnabled = true;
let preferredVoice = null;
let recognition = null;
let isMicActive = false;
let isVideoReplyPlaying = false;
const defaultAvatarVideo = avatarVideo?.getAttribute("src") || "";

if (avatarVideo) {
  avatarVideo.muted = true;
  avatarVideo.volume = 0;
  avatarVideo.loop = true;
}

const qaPairs = [
  {
    question: "Which model is best for iPad or tablet?",
    answer:
      "Tab 12 is the most portable option for iPad or tablet use. It folds down for travel and is quick to set up on location.",
    keywords: ["ipad", "tablet", "tab 12", "tab12", "tab twelve", "portable", "location"],
    productId: "tab12",
  },
  {
    question: "I need a 24-inch bright monitor.",
    answer:
      "Cue 24 is the 24-inch teleprompter built for clear readability and flexible studio or on-site setups.",
    keywords: ["24", "cue 24", "cue24", "cue twenty four", "bright", "studio"],
    productId: "cue24",
  },
  {
    question: "What is the difference between Cue 24, 27, and 32?",
    answer:
      "The Cue series steps up in screen size. Cue 24 is a compact studio option, while Cue 27 and Cue 32 are better for larger spaces or longer camera distances.",
    keywords: ["cue series", "cue 24", "cue 27", "cue 32", "difference", "sizes"],
  },
  {
    question: "What is Mime 27?",
    answer:
      "Mime 27 is a PGM monitor that mounts under the teleprompter so talent can see live program output while reading.",
    keywords: ["mime", "mime 27", "mime27", "mime twenty seven", "pgm", "program", "under"],
    productId: "mime27",
  },
  {
    question: "Can I use my own 32-inch monitor?",
    answer:
      "Framer 32 is a DIY frame that lets you mount a standard 32-inch monitor you already own.",
    keywords: ["framer", "framer 32", "framer32", "framer thirty two", "32", "own monitor", "diy"],
    productId: "framer32",
  },
  {
    question: "I need something very portable.",
    answer:
      "Tab 12 is the lightest, most portable choice for shooting anywhere and quick fold-up travel.",
    keywords: ["portable", "travel", "fold", "lightweight"],
    productId: "tab12",
  },
  {
    question: "How do I set it up?",
    answer:
      "Setup is modular and fast: mount the teleprompter, load your script on the display, flip the screen if needed, and align the camera. I can share a quick checklist if you want.",
    keywords: ["setup", "set up", "assemble", "install"],
  },
  {
    question: "Do you ship internationally?",
    answer:
      "We can arrange international shipping. Tell me your country and I can point you to the right contact route.",
    keywords: ["ship", "shipping", "international", "delivery"],
    video: "assets/shipping.mp4",
  },
  {
    question: "What about returns or warranty?",
    answer:
      "Returns and warranty details depend on the product. I can connect you with support for the exact policy.",
    keywords: ["return", "warranty", "policy"],
  },
  {
    question: "How do I talk to sales?",
    answer:
      "I can route you to sales or collect your email. Want me to connect you to the Crystal Prompter team?",
    keywords: ["sales", "contact", "email", "phone"],
  },
];

const products = {
  tab12: {
    name: "Tab 12",
    bullets: [
      "Portable 12-inch teleprompter for iPad/tablets",
      "Foldable, compact design for easy transport",
      "Quick, intuitive setup for on-location filming",
      "Lightweight and easy to operate",
    ],
    image:
      "https://static.wixstatic.com/media/d0630a_981e91bc34b44598b9c0277632ad56c9~mv2.png",
    link: "https://www.crystalprompter.com/tab12",
    video: "assets/tab12.mp4",
  },
  cue24: {
    name: "Cue 24",
    bullets: [
      "24-inch teleprompter for modern productions",
      "1000 cd/m² high-luminance monitor",
      "Built-in screen flip control (hardware)",
      "Professional-grade yet beginner-friendly",
    ],
    image:
      "https://static.wixstatic.com/media/d0630a_4da74b55aced44e59284f9daa4f0d6fb~mv2.png",
    link: "https://www.crystalprompter.com/cue24",
    video: "assets/cue24.mp4",
  },
  mime27: {
    name: "Mime 27",
    bullets: [
      "PGM monitor mounted beneath the teleprompter",
      "Built-in screen flip for correct orientation",
      "Angle-adjustable bracket for glare control",
      "Real-time live output monitoring",
    ],
    image:
      "https://static.wixstatic.com/media/d0630a_ce521e02dfa345a28c3415b6bc788a79~mv2.png",
    link: "https://www.crystalprompter.com/mime27",
    video: "assets/mime27.mp4",
  },
  framer32: {
    name: "Framer 32",
    bullets: [
      "DIY frame for standard 32-inch monitors",
      "Built-in 4K screen flip converter",
      "Affordable, easy-to-assemble design",
      "Large 32-inch viewing experience",
    ],
    image:
      "https://static.wixstatic.com/media/d0630a_2166cf549ed94b659e4e92179e76df57~mv2.png",
    link: "https://www.crystalprompter.com/framer32",
  },
};

const fallbackResponses = [
  "I can help with model selection, setup, and support. Try asking about Tab 12, Cue 24, Mime 27, or Framer 32.",
  "I’m not sure yet. Want a recommendation based on your camera, screen size, and shooting location?",
  "I can recommend the right prompter. Tell me your camera type and where you shoot most often.",
];

const greeting =
  "Hi! I’m Daniel. I can help you pick the right teleprompter, explain setup, or connect you with support.";

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findAnswer(text) {
  const normalized = normalize(text);
  if (!normalized) return null;

  for (const item of qaPairs) {
    if (item.keywords.some((keyword) => normalized.includes(keyword))) {
      return item;
    }
  }

  return null;
}

function addMessage(text, type) {
  const bubble = document.createElement("div");
  bubble.className = `message ${type}`;
  bubble.textContent = text;
  chat.appendChild(bubble);
  chat.scrollTop = chat.scrollHeight;
}

function setSpeech(text) {
  speechText.textContent = text;
}

function pickVoice(voices) {
  const list = voices || window.speechSynthesis?.getVoices?.() || [];
  const maleHints = /(male|daniel|alex|fred|david|mark|guy|brian|james|john|microsoft.*male|google.*male)/i;

  return (
    list.find((voice) => voice.lang === "en-US" && maleHints.test(voice.name)) ||
    list.find((voice) => voice.lang.startsWith("en-US") && !/female/i.test(voice.name)) ||
    list.find((voice) => voice.lang.startsWith("en") && maleHints.test(voice.name)) ||
    list.find((voice) => voice.lang.startsWith("en") && !/female/i.test(voice.name)) ||
    list.find((voice) => voice.lang.startsWith("en")) ||
    list[0] ||
    null
  );
}


function speak(text) {
  if (!voiceEnabled || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  if (preferredVoice) utterance.voice = preferredVoice;
  utterance.rate = 0.98;
  utterance.pitch = 0.9;

  utterance.onstart = () => {
    avatarCard.classList.add("is-speaking");
    if (avatarVideo) {
      avatarVideo.muted = true;
      avatarVideo.volume = 0;
      avatarVideo.currentTime = 0;
      avatarVideo.play().catch(() => {});
    }
  };
  utterance.onend = () => {
    avatarCard.classList.remove("is-speaking");
    if (avatarVideo) {
      avatarVideo.pause();
      avatarVideo.currentTime = 0;
    }
  };
  utterance.onerror = () => {
    avatarCard.classList.remove("is-speaking");
    if (avatarVideo) {
      avatarVideo.pause();
    }
  };

  window.speechSynthesis.speak(utterance);
}

function respond(text, { useTts = true } = {}) {
  addMessage(text, "bot");
  setSpeech(text);
  if (useTts) speak(text);
}

function showProduct(productId) {
  if (!productPanel) return;
  const product = products[productId];
  if (!product) return;

  productName.textContent = product.name;
  productImage.src = product.image;
  productImage.alt = `${product.name} preview`;
  productList.innerHTML = "";
  product.bullets.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    productList.appendChild(li);
  });
  productLink.href = product.link;

  productPanel.classList.add("is-open");
  positionPanel();
  schedulePanelClose();
}

function hideProduct() {
  if (panelTimer) window.clearTimeout(panelTimer);
  productPanel?.classList.remove("is-open");
}

let panelTimer = null;

function schedulePanelClose() {
  if (!productPanel) return;
  if (panelTimer) window.clearTimeout(panelTimer);
  panelTimer = window.setTimeout(() => {
    hideProduct();
  }, 10000);
}

function positionPanel() {
  if (!productPanel || !widget) return;
  const rect = widget.getBoundingClientRect();
  const panelWidth = productPanel.offsetWidth || 280;
  const gap = 16;
  let left = rect.left - panelWidth - gap;
  if (left < 16) left = 16;
  const top = Math.max(16, rect.top);
  productPanel.style.left = `${left}px`;
  productPanel.style.top = `${top}px`;
}

function setListening(active) {
  widget.classList.toggle("is-listening", active);
  if (listenStatus) {
    listenStatus.textContent = active ? "Listening" : "Idle";
  }
}

function setMicActive(active) {
  isMicActive = active;
  widget.classList.toggle("is-mic-active", active);
  if (micButton) micButton.classList.toggle("is-active", active);
  if (micStatus) micStatus.textContent = active ? "Listening..." : "Listening…";
}

function handleUserMessage(text) {
  addMessage(text, "user");

  const match = findAnswer(text);
  const reply =
    match?.answer || fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

  setTimeout(() => {
    const productVideo = match?.productId ? products[match.productId]?.video : null;
    const replyVideo = productVideo || match?.video;
    if (replyVideo) {
      playVideoReply(reply, replyVideo);
    } else {
      respond(reply);
    }
    if (match?.productId) {
      showProduct(match.productId);
    }
  }, 350);
}

function openWidget() {
  widget.classList.add("is-open");
  isOpen = true;
  if (!hasGreeted) {
    setTimeout(() => playVideoReply(greeting, "assets/daniel.mp4"), 300);
    hasGreeted = true;
  }
  input.focus();
  setListening(true);
}

function closeWidget() {
  widget.classList.remove("is-open");
  isOpen = false;
  setListening(false);
  hideProduct();
  if (recognition && isMicActive) {
    recognition.stop();
    setMicActive(false);
  }
}

function toggleVoice() {
  voiceEnabled = !voiceEnabled;
  voiceToggle.textContent = voiceEnabled ? "🔊" : "🔇";
  if (!voiceEnabled && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    avatarCard.classList.remove("is-speaking");
  }
}

window.speechSynthesis?.addEventListener?.("voiceschanged", () => {
  preferredVoice = pickVoice();
});
if (window.speechSynthesis) {
  preferredVoice = pickVoice();
}

// Events

toggle.addEventListener("click", () => (isOpen ? closeWidget() : openWidget()));
closeBtn.addEventListener("click", closeWidget);
voiceToggle.addEventListener("click", toggleVoice);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  handleUserMessage(text);
  input.value = "";
  setListening(true);
});

input.addEventListener("focus", () => setListening(true));
input.addEventListener("blur", () => setListening(false));
input.addEventListener("input", () => setListening(true));

quickActions.addEventListener("click", (event) => {
  const target = event.target;
  if (target.tagName !== "BUTTON") return;
  const prompt = target.getAttribute("data-quick");
  if (!prompt) return;
  handleUserMessage(prompt);
});

const heroTalkButton = document.querySelector(".solid");
heroTalkButton?.addEventListener("click", openWidget);

closePanel?.addEventListener("click", hideProduct);
window.addEventListener("resize", positionPanel);

function setupRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition || !micButton) {
    micButton?.setAttribute("disabled", "true");
    micButton?.setAttribute("title", "Voice input not supported in this browser");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  recognition.onstart = () => setMicActive(true);
  recognition.onend = () => setMicActive(false);
  recognition.onerror = () => setMicActive(false);
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (!transcript) return;
    input.value = transcript;
    form.requestSubmit();
  };

  micButton.addEventListener("click", () => {
    if (!recognition) return;
    if (isMicActive) {
      recognition.stop();
    } else {
      recognition.start();
    }
  });
}

setupRecognition();

function playVideoReply(text, videoSrc) {
  if (!avatarVideo || !videoSrc) {
    respond(text);
    return;
  }

  if (isVideoReplyPlaying) {
    avatarVideo.pause();
    avatarVideo.currentTime = 0;
  }

  isVideoReplyPlaying = true;
  window.speechSynthesis?.cancel?.();
  respond(text, { useTts: false });

  const previousSrc = avatarVideo.getAttribute("src");
  avatarVideo.loop = false;
  avatarVideo.muted = false;
  avatarVideo.volume = 1;
  avatarVideo.setAttribute("src", videoSrc);
  avatarVideo.currentTime = 0;

  const onEnd = () => {
    avatarVideo.removeEventListener("ended", onEnd);
    avatarVideo.removeEventListener("error", onEnd);
    avatarVideo.pause();
    avatarVideo.loop = true;
    avatarVideo.muted = true;
    avatarVideo.volume = 0;
    avatarVideo.setAttribute("src", previousSrc || defaultAvatarVideo);
    avatarVideo.currentTime = 0;
    isVideoReplyPlaying = false;
  };

  avatarVideo.addEventListener("ended", onEnd);
  avatarVideo.addEventListener("error", onEnd);
  avatarVideo.play().catch(() => {
    onEnd();
    respond(text);
  });
}
