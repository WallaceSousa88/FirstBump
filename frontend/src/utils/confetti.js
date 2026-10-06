/**
 * Pure Canvas Confetti & Micro-Particle Celebration Engine
 * Zero dependencies, 60fps lightweight canvas overlay.
 */

let canvas = null;
let ctx = null;
let particles = [];
let animationFrameId = null;

function ensureCanvas() {
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'celebration-confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '999999';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }
}

function resizeCanvas() {
  if (canvas) {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

const DEFAULT_COLORS = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#fbbf24'];

class Particle {
  constructor(x, y, type = 'confetti', customColor = null) {
    this.x = x;
    this.y = y;
    this.type = type; // 'confetti' | 'heart' | 'star'
    this.color = customColor || DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
    this.size = type === 'heart' ? randomRange(14, 22) : randomRange(6, 12);
    
    // Physics
    const angle = randomRange(0, Math.PI * 2);
    const speed = randomRange(4, 12);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - (type === 'heart' ? 4 : 2);
    this.gravity = type === 'heart' ? 0.08 : 0.22;
    this.drag = 0.96;
    
    this.rotation = randomRange(0, 360);
    this.rotationSpeed = randomRange(-8, 8);
    this.opacity = 1;
    this.decay = randomRange(0.012, 0.022);
  }

  update() {
    this.vx *= this.drag;
    this.vy = this.vy * this.drag + this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;
    this.opacity -= this.decay;
    return this.opacity > 0;
  }

  draw(context) {
    context.save();
    context.globalAlpha = Math.max(0, this.opacity);
    context.translate(this.x, this.y);
    context.rotate((this.rotation * Math.PI) / 180);

    if (this.type === 'heart') {
      context.fillStyle = this.color;
      context.beginPath();
      const s = this.size * 0.5;
      context.moveTo(0, s * 0.3);
      context.bezierCurveTo(-s, -s * 0.6, -s * 1.3, s * 0.4, 0, s * 1.4);
      context.bezierCurveTo(s * 1.3, s * 0.4, s, -s * 0.6, 0, s * 0.3);
      context.fill();
    } else if (this.type === 'star') {
      context.fillStyle = this.color;
      context.beginPath();
      const spikes = 5;
      const outerRadius = this.size;
      const innerRadius = this.size / 2;
      let rot = (Math.PI / 2) * 3;
      let x = 0;
      let y = 0;
      const step = Math.PI / spikes;

      context.moveTo(0, -outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = Math.cos(rot) * outerRadius;
        y = Math.sin(rot) * outerRadius;
        context.lineTo(x, y);
        rot += step;

        x = Math.cos(rot) * innerRadius;
        y = Math.sin(rot) * innerRadius;
        context.lineTo(x, y);
        rot += step;
      }
      context.lineTo(0, -outerRadius);
      context.closePath();
      context.fill();
    } else {
      // Retângulo de confete giratório
      context.fillStyle = this.color;
      context.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
    }

    context.restore();
  }
}

function animate() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles = particles.filter((p) => p.update());

  for (const p of particles) {
    p.draw(ctx);
  }

  if (particles.length > 0) {
    animationFrameId = requestAnimationFrame(animate);
  } else {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

export function fireConfetti(options = {}) {
  ensureCanvas();
  const count = options.count || 65;
  const originX = options.x !== undefined ? options.x : window.innerWidth / 2;
  const originY = options.y !== undefined ? options.y : window.innerHeight / 2;
  const type = options.type || 'confetti';

  for (let i = 0; i < count; i++) {
    particles.push(new Particle(originX, originY, type, options.color));
  }

  if (!animationFrameId) {
    animationFrameId = requestAnimationFrame(animate);
  }
}

export function fireHeartBurst(originX, originY) {
  ensureCanvas();
  const x = originX || window.innerWidth / 2;
  const y = originY || window.innerHeight / 2;
  const colors = ['#f43f5e', '#ec4899', '#fb7185', '#fda4af', '#e11d48'];

  for (let i = 0; i < 35; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    particles.push(new Particle(x, y, 'heart', color));
  }

  if (!animationFrameId) {
    animationFrameId = requestAnimationFrame(animate);
  }
}

export function fireSparkleBurst(originX, originY) {
  ensureCanvas();
  const x = originX || window.innerWidth / 2;
  const y = originY || window.innerHeight / 2;
  const colors = ['#f59e0b', '#fbbf24', '#fde047', '#ffffff', '#ca8a04'];

  for (let i = 0; i < 30; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    particles.push(new Particle(x, y, 'star', color));
  }

  if (!animationFrameId) {
    animationFrameId = requestAnimationFrame(animate);
  }
}
