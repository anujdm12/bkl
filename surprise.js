let celebStep = 1;
let galleryEffectsStarted = false;
let heartIntervalsStarted = false;

function transitionTo(pageId) {
  document.querySelectorAll('.page').forEach((page) => page.classList.remove('active'));

  const target = document.getElementById(pageId);
  if (!target) return;

  target.classList.add('active');

  if (pageId === 'curtain-page') {
    window.setTimeout(() => {
      document.getElementById('stage')?.classList.add('open');
      startSparkles('message-card');
    }, 1000);
  }

  if (pageId === 'gallery-page') {
    startGalleryEffects();
  }
}

function createHeart(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const heart = document.createElement('div');
  heart.style.position = 'absolute';
  heart.style.left = `${Math.random() * 100}vw`;
  heart.style.bottom = '-10vh';
  heart.style.color = 'var(--accent)';
  heart.textContent = '❤️';
  heart.style.fontSize = `${Math.random() * 20 + 10}px`;
  heart.style.animation = `floatHeart ${Math.random() * 3 + 3}s linear forwards`;
  container.appendChild(heart);
  window.setTimeout(() => heart.remove(), 6000);
}

function startHeartParticles() {
  if (heartIntervalsStarted) return;
  heartIntervalsStarted = true;
  window.setInterval(() => createHeart('particle-container'), 300);
  window.setInterval(() => createHeart('slider-particles'), 400);
}

function nextStep(step) {
  document.querySelectorAll('.step-content').forEach((content) => content.classList.remove('active'));
  document.querySelectorAll('.dot').forEach((dot) => dot.classList.remove('active'));
  document.getElementById(`step-${step}`)?.classList.add('active');
  document.getElementById(`dot-${step}`)?.classList.add('active');
}

function finishSlider() {
  transitionTo('celebration-page');
}

function celebFlow() {
  const button = document.getElementById('celeb-master-btn');
  const hint = document.getElementById('celeb-hint');
  const page = document.getElementById('celebration-page');
  const lights = document.getElementById('fairy-lights-container');

  if (!button || !hint || !page || !lights) return;

  if (celebStep === 1) {
    page.classList.add('bright');
    lights.style.opacity = '1';
    hint.textContent = 'Music makes it better...';
    button.textContent = 'Play Music';
    celebStep = 2;
    return;
  }

  if (celebStep === 2) {
    document.getElementById('birthday-audio')?.play().catch(() => {});
    hint.textContent = 'Let the colors fly!';
    button.textContent = 'Fly Balloons';
    celebStep = 3;
    return;
  }

  if (celebStep === 3) {
    spawnBalloons(document.body);
    hint.textContent = 'Almost there...';
    button.textContent = 'Show The Message';
    celebStep = 4;
    return;
  }

  transitionTo('curtain-page');
}

function spawnBalloons(targetContainer) {
  if (!targetContainer) return;

  const colorGradients = [
    ['#ff2d55', '#800020'],
    ['#74b9ff', '#0984e3'],
    ['#55efc4', '#00b894'],
    ['#ffeaa7', '#fdcb6e'],
    ['#a29bfe', '#6c5ce7'],
    ['#ff9ff3', '#f368e0'],
  ];

  const interval = window.setInterval(() => {
    const balloon = document.createElement('div');
    const shine = document.createElement('div');
    const gradient = colorGradients[Math.floor(Math.random() * colorGradients.length)];

    balloon.classList.add('balloon');
    shine.classList.add('balloon-shine');
    balloon.style.left = `${Math.random() * 95}vw`;
    balloon.style.background = `radial-gradient(circle at 70% 30%, ${gradient[0]}, ${gradient[1]})`;
    balloon.style.boxShadow = 'inset -10px -10px 20px rgba(0,0,0,0.3), 0 10px 30px rgba(0,0,0,0.2)';
    balloon.appendChild(shine);
    targetContainer.appendChild(balloon);

    window.setTimeout(() => balloon.remove(), 8000);
  }, 400);

  window.setTimeout(() => window.clearInterval(interval), 6000);
}

function startGalleryEffects() {
  if (galleryEffectsStarted) return;
  galleryEffectsStarted = true;

  const container = document.getElementById('gallery-bg-elements');
  if (!container) return;

  window.setInterval(() => {
    if (document.getElementById('gallery-page')?.classList.contains('active')) {
      spawnBalloons(container);
    }
  }, 8000);

  window.setInterval(() => {
    if (!document.getElementById('gallery-page')?.classList.contains('active')) return;

    const sparkle = document.createElement('div');
    sparkle.classList.add('gallery-sparkle');
    sparkle.style.width = sparkle.style.height = `${Math.random() * 6 + 2}px`;
    sparkle.style.top = `${Math.random() * 100}%`;
    sparkle.style.left = `${Math.random() * 100}%`;
    container.appendChild(sparkle);
    window.setTimeout(() => sparkle.remove(), 2000);
  }, 200);
}

function startSparkles(targetId) {
  const card = document.getElementById(targetId);
  if (!card || card.dataset.sparklesStarted === 'true') return;

  card.dataset.sparklesStarted = 'true';
  window.setInterval(() => {
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle-particle');
    sparkle.style.width = sparkle.style.height = `${Math.random() * 4 + 2}px`;
    sparkle.style.top = `${Math.random() * 100}%`;
    sparkle.style.left = `${Math.random() * 100}%`;
    card.appendChild(sparkle);
    window.setTimeout(() => sparkle.remove(), 1000);
  }, 50);
}

function initFairyLights() {
  const container = document.getElementById('fairy-lights-container');
  const path = document.getElementById('wire-path');
  if (!container || !path) return;

  const pathLength = path.getTotalLength();
  const bulbCount = 25;

  for (let index = 0; index <= bulbCount; index += 1) {
    const distance = (index / bulbCount) * pathLength;
    const point = path.getPointAtLength(distance);
    const bulb = document.createElement('div');
    bulb.classList.add('bulb-teardrop');
    bulb.style.left = `${(point.x / 1000) * 100}%`;
    bulb.style.top = `${point.y}px`;
    bulb.style.setProperty('--d', `${0.5 + Math.random() * 2}s`);
    container.appendChild(bulb);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initFairyLights();
  startHeartParticles();
});
