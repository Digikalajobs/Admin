const slides = [...document.querySelectorAll(".slide")];
const dots = [...document.querySelectorAll(".dot")];
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const phoneForm = document.getElementById("phoneForm");
const phoneInput = document.getElementById("phone");
const formMessage = document.getElementById("formMessage");
const downloadPanel = document.getElementById("downloadPanel");
const downloadBtn = document.getElementById("downloadBtn");

let current = 0;
let timer;

function showSlide(index) {
  current = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => slide.classList.toggle("active", i === current));
  dots.forEach((dot, i) => dot.classList.toggle("active", i === current));
  restartAuto();
}

function restartAuto() {
  clearInterval(timer);
  timer = setInterval(() => showSlide(current + 1), 5200);
}

dots.forEach(dot => {
  dot.addEventListener("click", () => showSlide(Number(dot.dataset.go)));
});

prevBtn.addEventListener("click", () => showSlide(current - 1));
nextBtn.addEventListener("click", () => showSlide(current + 1));

restartAuto();

function normalizePhone(value) {
  return String(value || "")
    .replace(/[^\d۰-۹٠-٩]/g, "")
    .replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
}

function isValidIranPhone(phone) {
  return /^09\d{9}$/.test(phone);
}

function setMessage(text, type = "") {
  formMessage.textContent = text;
  formMessage.className = `form-message ${type}`;
}

phoneForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const phone = normalizePhone(phoneInput.value);

  if (!isValidIranPhone(phone)) {
    setMessage("شماره موبایل را درست وارد کن؛ نمونه: 09123456789", "error");
    downloadPanel.classList.add("hidden");
    return;
  }

  setMessage("شماره تأیید شد. لینک دانلود آماده است.", "ok");
  downloadPanel.classList.remove("hidden");
  localStorage.setItem("lead_phone", phone);

  // ارسال اختیاری شماره به تلگرام از طریق Netlify Function
  // اگر متغیرهای TELEGRAM_BOT_TOKEN و TELEGRAM_CHAT_ID را در Netlify تنظیم کرده باشی، پیام ارسال می‌شود.
  try {
    await fetch("/.netlify/functions/lead", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ phone, source: "download-landing" })
    });
  } catch (err) {
    console.log("Telegram lead function not active yet.");
  }
});

// Particle background
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  particles = Array.from({length: Math.min(90, Math.floor(window.innerWidth / 10))}, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 2 + .5,
    vx: (Math.random() - .5) * .35,
    vy: (Math.random() - .5) * .35,
    a: Math.random() * .45 + .15
  }));
}

function drawParticles() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
    if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${p.a})`;
    ctx.fill();
  });

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(239,57,78,${(1 - dist / 120) * .18})`;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(drawParticles);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
drawParticles();
