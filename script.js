const dom = {
  screens: document.querySelectorAll('.screen'),
  countdownHeader: document.getElementById('cd-head'),
  countdownMsg: document.getElementById('cd-msg'),
  countdownDays: document.getElementById('cd-d'),
  countdownHours: document.getElementById('cd-h'),
  countdownMinutes: document.getElementById('cd-m'),
  countdownSeconds: document.getElementById('cd-s'),
  musicWrap: document.getElementById('music-wrap'),
  birthdayMusicWrap: document.getElementById('bday-music-wrap'),
};

let countdownInterval = null;
let audioAutoplayFailed = false;

const birthdayAudio = document.getElementById('birthday-audio');

function makeConfetti() {
  const confettiRoot = document.getElementById('conf');
  const palette = ['#ff5fa0', '#ff9de2', '#ffcc44', '#a78bfa', '#34d399', '#60a5fa', '#fb923c', '#f472b6'];
  const pieces = 55;

  for (let index = 0; index < pieces; index += 1) {
    const piece = document.createElement('div');
    piece.className = 'cp';
    const size = Math.random() * 8 + 5;
    piece.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;background:${palette[Math.floor(Math.random() * palette.length)]};border-radius:${Math.random() > 0.5 ? '50%' : '3px'};animation-duration:${Math.random() * 4 + 3}s;animation-delay:${Math.random() * 5}s;opacity:${Math.random() * 0.5 + 0.5}`;
    confettiRoot.appendChild(piece);
  }
}

function showScreen(screenId) {
  dom.screens.forEach((screen) => screen.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

function getNextBirthday() {
  const now = new Date();
  const birthday = new Date(now.getFullYear(), 4, 26, 0, 0, 0);
  if (now > birthday) {
    birthday.setFullYear(birthday.getFullYear() + 1);
  }
  return birthday;
}

function updateCountdown() {
  const now = new Date();
  const target = getNextBirthday();
  const difference = target - now;

  if (difference <= 0) {
    clearInterval(countdownInterval);
    displayBirthdayReady();
    return;
  }

  const days = Math.floor(difference / 86400000);
  const hours = Math.floor((difference % 86400000) / 3600000);
  const minutes = Math.floor((difference % 3600000) / 60000);
  const seconds = Math.floor((difference % 60000) / 1000);

  dom.countdownDays.textContent = String(days).padStart(2, '0');
  dom.countdownHours.textContent = String(hours).padStart(2, '0');
  dom.countdownMinutes.textContent = String(minutes).padStart(2, '0');
  dom.countdownSeconds.textContent = String(seconds).padStart(2, '0');
  dom.countdownMsg.textContent = getCountdownMood(seconds);
}

function getCountdownMood(seconds) {
  const phrases = [
    'Hang tight... the birthday magic is almost here 🌟',
    'She’s gonna LOVE this 😏',
    'Psst... don’t peek at the surprise early 👀',
    'The countdown is real. The love is realer. 💕',
    'Almost time to embarrass her with all this love 😂',
  ];
  return phrases[Math.floor(seconds / 12) % phrases.length];
}

function displayBirthdayReady() {
  dom.countdownDays.textContent = '00';
  dom.countdownHours.textContent = '00';
  dom.countdownMinutes.textContent = '00';
  dom.countdownSeconds.textContent = '00';
  dom.countdownHeader.textContent = "It's time!! 🎉";
  dom.countdownMsg.innerHTML = '<span style="font-size:1.1rem;color:#d63384;font-weight:900">🎂 Happy Birthday Kruthiii!! Click below! 🎂</span>';
  dom.musicWrap.innerHTML = '';

  const revealButton = document.createElement('button');
  revealButton.className = 'unlock-btn';
  revealButton.textContent = 'Open your Birthday Surprise 🎁';
  revealButton.addEventListener('click', showSurprise);
  dom.musicWrap.appendChild(revealButton);
}

function attemptPlayBirthdayAudio() {
  if (!birthdayAudio) return;
  birthdayAudio.volume = 0.82;
  birthdayAudio.loop = true;
  birthdayAudio.preload = 'auto';

  const playPromise = birthdayAudio.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      audioAutoplayFailed = true;
      enableAudioFallback();
    });
  }
}

function enableAudioFallback() {
  const events = ['click', 'touchstart', 'keypress', 'pointerdown'];
  const playAudioOnce = () => {
    if (birthdayAudio && birthdayAudio.paused) {
      birthdayAudio.play().catch(() => {});
    }
    events.forEach(evt => document.removeEventListener(evt, playAudioOnce));
  };
  events.forEach(evt => document.addEventListener(evt, playAudioOnce, { once: true }));
}

function startBirthdayAudio() {
  if (!birthdayAudio) return;
  birthdayAudio.volume = 0.82;
  birthdayAudio.loop = true;
  if (birthdayAudio.paused) {
    birthdayAudio.play().catch(() => {
      // fallback if autoplay blocked
    });
  }
}

function toggleBirthdayAudio() {
  if (!birthdayAudio) return;
  if (birthdayAudio.paused) {
    birthdayAudio.play().catch(() => {});
  } else {
    birthdayAudio.pause();
  }
  updateMusicButtonState();
}

function updateMusicButtonState() {
  const label = birthdayAudio && !birthdayAudio.paused ? '⏹ Pause music' : '🎵 Play birthday music';
  document.querySelectorAll('.music-btn-inner').forEach((element) => {
    element.textContent = label;
  });
}

function renderMusicButton(containerId) {
  const wrapper = document.getElementById(containerId);
  if (!wrapper) return;

  wrapper.innerHTML = '';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'music-btn';
  button.innerHTML = `<span class="music-btn-inner">${birthdayAudio && !birthdayAudio.paused ? '⏹ Pause music' : '🎵 Play birthday music'}</span>`;
  button.addEventListener('click', toggleBirthdayAudio);
  wrapper.appendChild(button);
}

function showSurprise() {
  startBirthdayAudio();
  showScreen('s-surprise');
  renderMusicButton('bday-music-wrap');
}

function showCountdown() {
  startBirthdayAudio();
  showScreen('s-countdown');
  renderMusicButton('music-wrap');
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

function initializeApp() {
  makeConfetti();
  attemptPlayBirthdayAudio();
  showCountdown();
  enableAudioFallback();
}

window.addEventListener('DOMContentLoaded', initializeApp);

window.addEventListener('pageshow', () => {
  if (birthdayAudio && birthdayAudio.paused) {
    birthdayAudio.volume = 0.82;
    birthdayAudio.play().catch(() => {});
  }
});
