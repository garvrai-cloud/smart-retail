/* ===== INDEX SCRIPTS ===== */

/* =======================
   PARTICLE BACKGROUND
======================= */
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const particles = Array.from({ length: 50 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: Math.random() * 2 + 1,
  dx: Math.random() - 0.5,
  dy: Math.random() - 0.5
}));

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fill();

    p.x += p.dx;
    p.y += p.dy;

    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

/* =======================
   COUNTER ANIMATION
======================= */
document.querySelectorAll(".count").forEach(counter => {
  let current = 0;
  const target = +counter.dataset.target;

  function update() {
    if (current <= target) {
      counter.innerText = current++;
      setTimeout(update, 40);
    }
  }
  update();
});

/* =======================
   ACCORDION (ONLY ONE OPEN)
======================= */
const features = document.querySelectorAll(".feature");

features.forEach(card => {
  card.addEventListener("click", () => {
    const isOpen = card.classList.contains("active");

    // Close all cards
    features.forEach(item => item.classList.remove("active"));

    // Open only the clicked card if it was closed
    if (!isOpen) {
      card.classList.add("active");
    }
  });
});

/* =======================
   CURSOR GLOW EFFECT
======================= */
const cursor = document.getElementById("cursor");

window.addEventListener("mousemove", e => {
  cursor.style.left = e.clientX - 9 + "px";
  cursor.style.top = e.clientY - 9 + "px";
});