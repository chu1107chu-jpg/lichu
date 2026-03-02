// ─── Canvas particle-trail animation (inspired by lamalama.nl) ───

const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');

let W, H, mouse = { x: W / 2, y: H / 2 }, particles = [], trails = [];
const COUNT   = 120;
const TRAIL   = 80;

// ─── Resize ───
function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// ─── Particle class ───
class Particle {
  constructor() { this.reset(true); }

  reset(initial = false) {
    this.x  = initial ? Math.random() * W : W / 2 + (Math.random() - 0.5) * 200;
    this.y  = initial ? Math.random() * H : H / 2 + (Math.random() - 0.5) * 200;
    this.vx = (Math.random() - 0.5) * 0.6;
    this.vy = (Math.random() - 0.5) * 0.6;
    this.radius  = Math.random() * 1.4 + 0.3;
    this.alpha   = Math.random() * 0.5 + 0.1;
    this.life    = 1;
    this.decay   = Math.random() * 0.002 + 0.0005;
    this.attract = Math.random() > 0.6;
  }

  update() {
    if (this.attract) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = Math.min(60 / (dist * dist), 0.08);
      this.vx += dx / dist * force;
      this.vy += dy / dist * force;
    }

    this.vx *= 0.98;
    this.vy *= 0.98;
    this.x  += this.vx;
    this.y  += this.vy;
    this.life -= this.decay;

    if (this.life <= 0 || this.x < -50 || this.x > W + 50 || this.y < -50 || this.y > H + 50) {
      this.reset();
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(240,240,240,${this.alpha * this.life})`;
    ctx.fill();
  }
}

// ─── Trail point ───
class TrailPoint {
  constructor(x, y) {
    this.x     = x;
    this.y     = y;
    this.alpha = 0.6;
  }
  update() { this.alpha *= 0.93; }
}

// ─── Init particles ───
for (let i = 0; i < COUNT; i++) particles.push(new Particle());

// ─── Mouse ───
window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  trails.push(new TrailPoint(e.clientX, e.clientY));
  if (trails.length > TRAIL) trails.shift();
});

// ─── Grid lines ───
function drawGrid() {
  const spacing = 80;
  ctx.strokeStyle = 'rgba(240,240,240,0.025)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += spacing) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += spacing) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
}

// ─── Trail render ───
function drawTrail() {
  for (let i = 1; i < trails.length; i++) {
    const prev = trails[i - 1];
    const curr = trails[i];
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(curr.x, curr.y);
    ctx.strokeStyle = `rgba(240,240,240,${curr.alpha * 0.25})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  trails.forEach(t => t.update());
  trails = trails.filter(t => t.alpha > 0.01);
}

// ─── Connect nearby particles ───
function drawConnections() {
  const MAX_DIST = 120;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < MAX_DIST) {
        const a = (1 - d / MAX_DIST) * 0.12;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(240,240,240,${a})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

// ─── Loop ───
function loop() {
  ctx.clearRect(0, 0, W, H);
  drawGrid();
  drawConnections();
  particles.forEach(p => { p.update(); p.draw(); });
  drawTrail();
  requestAnimationFrame(loop);
}
loop();

// ─── Custom cursor ───
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
let cx = 0, cy = 0, tx = 0, ty = 0;

window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });

function animCursor() {
  cx += (tx - cx) * 0.12;
  cy += (ty - cy) * 0.12;
  cursor.style.left    = cx + 'px';
  cursor.style.top     = cy + 'px';
  cursorDot.style.left = tx + 'px';
  cursorDot.style.top  = ty + 'px';
  requestAnimationFrame(animCursor);
}
animCursor();

document.querySelectorAll('a, button, .nav-toggle').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// ─── Active nav on scroll ───
const sections = document.querySelectorAll('main[id], section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.5 });

sections.forEach(s => observer.observe(s));
