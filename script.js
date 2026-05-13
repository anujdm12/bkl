const dom = {
  screens: document.querySelectorAll('.screen'),
  countdownHeader: document.getElementById('cd-head'),
  countdownMsg: document.getElementById('cd-msg'),
  countdownMicrocopy: document.getElementById('countdown-microcopy'),
  visitStreakBadge: document.getElementById('visit-streak-badge'),
  nextRefreshBadge: document.getElementById('next-refresh-badge'),
  dailyTeaseTitle: document.getElementById('daily-tease-title'),
  dailyTeaseCopy: document.getElementById('daily-tease-copy'),
  returnHookTitle: document.getElementById('return-hook-title'),
  returnHookCopy: document.getElementById('return-hook-copy'),
  countdownDays: document.getElementById('cd-d'),
  countdownHours: document.getElementById('cd-h'),
  countdownMinutes: document.getElementById('cd-m'),
  countdownSeconds: document.getElementById('cd-s'),
  musicWrap: document.getElementById('music-wrap'),
  birthdayMusicWrap: document.getElementById('bday-music-wrap'),
  countdownProgressFill: document.getElementById('countdown-progress-fill'),
  countdownProgressValue: document.getElementById('countdown-progress-value'),
  statusChipPrimary: document.getElementById('status-chip-primary'),
  statusChipSecondary: document.getElementById('status-chip-secondary'),
  countdownBox: document.querySelector('.countdown-box'),
  countdownHype: document.getElementById('countdown-hype'),
  hypeKicker: document.getElementById('hype-kicker'),
  hypeNumber: document.getElementById('hype-number'),
  hypeBurst: document.getElementById('hype-burst'),
};

let countdownInterval = null;
let audioAutoplayFailed = false;
let audioRetryTimer = null;
let birthdaySequenceStarted = false;
let countdownStartTarget = null;
let previousSecondValue = null;
let dailyVisitState = null;

const birthdayAudio = document.getElementById('birthday-audio');
const DAILY_VISIT_KEY = 'kruthiii-countdown-visit-state';
const DAILY_TEASES = [
  {
    title: 'A soft memory is hiding inside this surprise',
    copy: 'Not every gift is loud. Some hit hardest because they feel personal, warm, and unexpectedly close to the heart.',
  },
  {
    title: 'Tomorrow’s page should feel a little more dangerous',
    copy: 'The closer we get, the less calm this countdown wants to stay. It is learning how to make an entrance.',
  },
  {
    title: 'One part of the surprise is pure elder-sis energy',
    copy: 'It is equal parts comfort, chaos, sweetness, and that impossible mix of feeling safe and roasted at the same time.',
  },
  {
    title: 'The ending is not the only thing waiting for her',
    copy: 'There is a build-up happening here on purpose. You are meant to feel curiosity doing small circles in your head.',
  },
  {
    title: 'This page keeps a tiny secret for repeat visitors',
    copy: 'The more often you come back, the more it feels like the surprise is watching the countdown with you.',
  },
  {
    title: 'The final reveal is sweeter if you let the suspense cook',
    copy: 'That is why today only gives you a taste. Waiting is part of the gift this time.',
  },
];

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

function getCountdownStartTarget(target) {
  const start = new Date(target);
  start.setDate(start.getDate() - 7);
  return start.getTime();
}

function getDayStamp(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getPreviousDayStamp() {
  const previous = new Date();
  previous.setDate(previous.getDate() - 1);
  return getDayStamp(previous);
}

function loadDailyVisitState() {
  const today = getDayStamp();
  const yesterday = getPreviousDayStamp();
  const fallback = { lastVisit: today, streak: 1, firstVisitToday: true };

  try {
    const raw = window.localStorage.getItem(DAILY_VISIT_KEY);
    if (!raw) {
      window.localStorage.setItem(DAILY_VISIT_KEY, JSON.stringify(fallback));
      return fallback;
    }

    const parsed = JSON.parse(raw);
    let streak = Number(parsed.streak) || 1;
    let firstVisitToday = false;

    if (parsed.lastVisit === today) {
      return { lastVisit: today, streak, firstVisitToday };
    }

    firstVisitToday = true;
    streak = parsed.lastVisit === yesterday ? streak + 1 : 1;
    const nextState = { lastVisit: today, streak, firstVisitToday };
    window.localStorage.setItem(DAILY_VISIT_KEY, JSON.stringify(nextState));
    return nextState;
  } catch {
    return fallback;
  }
}

function formatTimeUntilTomorrow() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0);
  const difference = Math.max(tomorrow - now, 0);
  const hours = Math.floor(difference / 3600000);
  const minutes = Math.floor((difference % 3600000) / 60000);
  return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

function updateDailyRitual(difference, days, hours, minutes) {
  if (!dailyVisitState) {
    dailyVisitState = loadDailyVisitState();
  }

  const teaseIndex = Math.abs(days + hours + new Date().getDate()) % DAILY_TEASES.length;
  const tease = DAILY_TEASES[teaseIndex];
  const visitText = dailyVisitState.streak === 1 ? '1 day' : `${dailyVisitState.streak} days`;

  if (dom.visitStreakBadge) {
    dom.visitStreakBadge.textContent = `Check-in streak: ${visitText}`;
  }

  if (dom.nextRefreshBadge) {
    dom.nextRefreshBadge.textContent = `New tease unlocks in ${formatTimeUntilTomorrow()}`;
  }

  if (dom.dailyTeaseTitle) dom.dailyTeaseTitle.textContent = tease.title;
  if (dom.dailyTeaseCopy) dom.dailyTeaseCopy.textContent = tease.copy;

  let returnTitle = 'The surprise remembers your visits';
  let returnCopy = dailyVisitState.firstVisitToday
    ? 'Nice. Today counted. Come back tomorrow and this page will greet you with a fresh tease and a hotter countdown mood.'
    : 'You already checked in today. Come back after midnight for a fresh tease and another little hit of suspense.';

  if (difference / 3600000 <= 24) {
    returnTitle = 'Now the waiting becomes deliciously unbearable';
    returnCopy = 'From here on, checking this page feels dangerous in the best way. The closer it gets, the more impossible it is not to peek again.';
  } else if (difference / 86400000 <= 3) {
    returnTitle = 'This is the phase where people start checking twice';
    returnCopy = 'You are close enough now that every revisit feels justified. The page knows it, and it is leaning into it.';
  } else if (dailyVisitState.streak >= 3) {
    returnTitle = 'The page officially thinks you are invested';
    returnCopy = `A ${visitText} streak means the suspense is working. Keep the streak alive and let the anticipation do its thing.`;
  }

  if (dom.returnHookTitle) dom.returnHookTitle.textContent = returnTitle;
  if (dom.returnHookCopy) dom.returnHookCopy.textContent = returnCopy;
}

function pulseCountdownUnit(element) {
  if (!element) return;
  element.classList.remove('pulse');
  void element.offsetWidth;
  element.classList.add('pulse');
}

function setCountdownStage(stageName) {
  if (!dom.countdownBox) return;
  dom.countdownBox.classList.remove('stage-distant', 'stage-soon', 'stage-final');
  dom.countdownBox.classList.add(stageName);
}

function updateCountdownExperience(difference, days, hours, minutes, seconds) {
  const target = getNextBirthday();
  const totalDays = difference / 86400000;
  const totalHours = difference / 3600000;
  const totalMinutes = difference / 60000;

  if (!countdownStartTarget) {
    countdownStartTarget = getCountdownStartTarget(target);
  }

  const totalWindow = Math.max(target.getTime() - countdownStartTarget, 1);
  const passed = Math.min(Math.max(Date.now() - countdownStartTarget, 0), totalWindow);
  const progress = Math.round((passed / totalWindow) * 100);

  if (dom.countdownProgressFill) {
    dom.countdownProgressFill.style.width = `${progress}%`;
  }

  if (dom.countdownProgressValue) {
    dom.countdownProgressValue.textContent = `${progress}%`;
  }

  let primary = 'Birthday radar: active';
  let secondary = 'Loading surprise energy ✨';
  let microcopy = 'The lights are warming up and the surprise is getting ready backstage.';
  let stageName = 'stage-distant';

  if (totalDays >= 2) {
    primary = `${days} day${days === 1 ? '' : 's'} left to go`;
    secondary = 'We are still in the dreamy pre-party zone';
    microcopy = 'The countdown is calm right now, but every second is secretly building something lovely.';
  } else if (totalHours >= 6) {
    primary = 'Today feels different already';
    secondary = `${hours}h ${minutes}m until birthday mode`;
    microcopy = 'The room is getting brighter, the music is waiting, and the surprise is almost ready to step on stage.';
    stageName = 'stage-soon';
  } else if (totalHours >= 1) {
    primary = 'Final stretch unlocked';
    secondary = `${hours} hour${hours === 1 ? '' : 's'} to the big moment`;
    microcopy = 'This is the golden-hour countdown zone now. Everything is starting to glow a little harder.';
    stageName = 'stage-soon';
  } else if (totalMinutes >= 10) {
    primary = 'Almost party o’clock';
    secondary = `${minutes} minutes until lift-off`;
    microcopy = 'The surprise is fully dressed, the confetti is restless, and the page is holding its breath.';
    stageName = 'stage-final';
  } else if (totalMinutes >= 1) {
    primary = 'Last few minutes';
    secondary = `${minutes}m ${seconds}s to go`;
    microcopy = 'We are officially in heart-racing territory now. Blink and the birthday blast will be here.';
    stageName = 'stage-final';
  } else {
    primary = 'This is it';
    secondary = `${seconds} seconds to the explosion`;
    microcopy = 'Every second now lands louder than the last. The party is literally at the door.';
    stageName = 'stage-final';
  }

  setCountdownStage(stageName);

  if (dom.statusChipPrimary) dom.statusChipPrimary.textContent = primary;
  if (dom.statusChipSecondary) dom.statusChipSecondary.textContent = secondary;
  if (dom.countdownMicrocopy) dom.countdownMicrocopy.textContent = microcopy;

  if (previousSecondValue !== null && previousSecondValue !== seconds && totalMinutes < 1) {
    pulseCountdownUnit(dom.countdownSeconds?.parentElement);
  }

  updateDailyRitual(difference, days, hours, minutes);
  previousSecondValue = seconds;
}

function updateCountdown() {
  const now = new Date();
  const target = getNextBirthday();
  const difference = target - now;

  if (difference <= 0) {
    clearInterval(countdownInterval);
    runBirthdayHypeSequence();
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
  updateCountdownExperience(difference, days, hours, minutes, seconds);
}

function getCountdownMood(seconds) {
  if (seconds <= 5) {
    return 'Hold on... this is about to explode into birthday mode 🎆';
  }

  const phrases = [
    'Hang tight... the birthday magic is almost here 🌟',
    'She’s gonna LOVE this 😏',
    'Psst... don’t peek at the surprise early 👀',
    'The countdown is real. The love is realer. 💕',
    'Almost time to embarrass her with all this love 😂',
  ];
  return phrases[Math.floor(seconds / 12) % phrases.length];
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function triggerMiniConfettiBurst() {
  const confettiRoot = document.getElementById('conf');
  if (!confettiRoot) return;

  const palette = ['#ff5fa0', '#ffcc44', '#00d9ff', '#a78bfa', '#34d399', '#ffffff'];
  for (let index = 0; index < 26; index += 1) {
    const piece = document.createElement('div');
    piece.className = 'cp';
    const size = Math.random() * 10 + 6;
    const left = 35 + (Math.random() * 30);
    piece.style.cssText = `width:${size}px;height:${size}px;left:${left}%;top:22%;background:${palette[Math.floor(Math.random() * palette.length)]};border-radius:${Math.random() > 0.5 ? '50%' : '3px'};animation-duration:${Math.random() * 1.8 + 1.8}s;animation-delay:0s;opacity:1`;
    confettiRoot.appendChild(piece);
    window.setTimeout(() => piece.remove(), 2600);
  }
}

async function runBirthdayHypeSequence() {
  if (birthdaySequenceStarted) return;
  birthdaySequenceStarted = true;

  dom.countdownDays.textContent = '00';
  dom.countdownHours.textContent = '00';
  dom.countdownMinutes.textContent = '00';
  dom.countdownSeconds.textContent = '00';
  dom.countdownHeader.textContent = 'It is happening... ✨';
  dom.countdownMsg.textContent = 'Get ready for the birthday blast-off 🚀';
  dom.musicWrap.innerHTML = '';

  if (dom.countdownHype) {
    dom.countdownHype.classList.add('active');
    dom.countdownHype.setAttribute('aria-hidden', 'false');
  }

  const sequence = [
    { number: '3', kicker: 'Everybody ready?', delay: 750 },
    { number: '2', kicker: 'Turn the hype all the way up', delay: 750 },
    { number: '1', kicker: 'Kruthiii mode incoming...', delay: 800 },
  ];

  for (const step of sequence) {
    if (dom.hypeKicker) dom.hypeKicker.textContent = step.kicker;
    if (dom.hypeNumber) {
      dom.hypeNumber.textContent = step.number;
      dom.hypeNumber.style.animation = 'none';
      void dom.hypeNumber.offsetWidth;
      dom.hypeNumber.style.animation = '';
    }
    await wait(step.delay);
  }

  if (dom.hypeKicker) dom.hypeKicker.textContent = 'And now... explode the party!';
  if (dom.hypeNumber) dom.hypeNumber.textContent = '0';
  if (dom.countdownHype) dom.countdownHype.classList.add('burst');
  if (dom.countdownBox) dom.countdownBox.classList.add('party-mode');
  triggerMiniConfettiBurst();
  await wait(1150);

  if (dom.countdownHype) {
    dom.countdownHype.classList.remove('active', 'burst');
    dom.countdownHype.setAttribute('aria-hidden', 'true');
  }
  if (dom.countdownBox) dom.countdownBox.classList.remove('party-mode');

  displayBirthdayReady();
}

function displayBirthdayReady() {
  dom.countdownDays.textContent = '00';
  dom.countdownHours.textContent = '00';
  dom.countdownMinutes.textContent = '00';
  dom.countdownSeconds.textContent = '00';
  dom.countdownHeader.textContent = "It's time!! 🎉";
  dom.countdownMsg.innerHTML = '<span style="font-size:1.1rem;color:#d63384;font-weight:900">🎂 Happy Birthday Kruthiii!! Click below! 🎂</span>';
  if (dom.countdownMicrocopy) {
    dom.countdownMicrocopy.textContent = 'The countdown did its job. Time to open the surprise and let the birthday energy take over.';
  }
  if (dom.statusChipPrimary) dom.statusChipPrimary.textContent = 'Birthday unlocked';
  if (dom.statusChipSecondary) dom.statusChipSecondary.textContent = 'Tap to open the surprise 🎁';
  if (dom.countdownProgressFill) dom.countdownProgressFill.style.width = '100%';
  if (dom.countdownProgressValue) dom.countdownProgressValue.textContent = '100%';
  if (dom.visitStreakBadge) dom.visitStreakBadge.textContent = 'Check-in streak completed';
  if (dom.nextRefreshBadge) dom.nextRefreshBadge.textContent = 'No more waiting needed';
  if (dom.dailyTeaseTitle) dom.dailyTeaseTitle.textContent = 'The waiting part is over';
  if (dom.dailyTeaseCopy) dom.dailyTeaseCopy.textContent = 'No more tiny clues. The real birthday surprise is ready for you now.';
  if (dom.returnHookTitle) dom.returnHookTitle.textContent = 'This was worth coming back for';
  if (dom.returnHookCopy) dom.returnHookCopy.textContent = 'All that suspense finally pays off here. Open it and let the birthday chaos begin.';
  dom.musicWrap.innerHTML = '';

  const revealButton = document.createElement('button');
  revealButton.className = 'unlock-btn';
  revealButton.textContent = 'Open your Birthday Surprise 🎁';
  revealButton.addEventListener('click', showSurprise);
  dom.musicWrap.appendChild(revealButton);
}

function prepareBirthdayAudio() {
  if (!birthdayAudio) return;
  birthdayAudio.volume = 0.82;
  birthdayAudio.loop = true;
  birthdayAudio.preload = 'auto';
}

function syncMusicUi() {
  updateMusicButtonState();
}

function queueAudioRetry() {
  if (audioRetryTimer || !birthdayAudio || !birthdayAudio.paused) return;
  audioRetryTimer = window.setTimeout(() => {
    audioRetryTimer = null;
    attemptPlayBirthdayAudio();
  }, 1500);
}

function attemptPlayBirthdayAudio() {
  if (!birthdayAudio) return;

  prepareBirthdayAudio();

  const playPromise = birthdayAudio.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      audioAutoplayFailed = false;
      syncMusicUi();
    }).catch(() => {
      audioAutoplayFailed = true;
      syncMusicUi();
      enableAudioFallback();
      queueAudioRetry();
    });
    return;
  }

  syncMusicUi();
}

function enableAudioFallback() {
  const events = ['click', 'touchstart', 'keypress', 'pointerdown'];
  const playAudioOnce = () => {
    if (birthdayAudio && birthdayAudio.paused) {
      attemptPlayBirthdayAudio();
    }
    events.forEach(evt => document.removeEventListener(evt, playAudioOnce));
  };
  events.forEach(evt => document.addEventListener(evt, playAudioOnce, { once: true }));
}

function startBirthdayAudio() {
  if (!birthdayAudio) return;
  prepareBirthdayAudio();
  if (birthdayAudio.paused) {
    attemptPlayBirthdayAudio();
    return;
  }
  syncMusicUi();
}

function toggleBirthdayAudio() {
  if (!birthdayAudio) return;
  if (birthdayAudio.paused) {
    attemptPlayBirthdayAudio();
  } else {
    birthdayAudio.pause();
    syncMusicUi();
  }
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
  dailyVisitState = loadDailyVisitState();
  makeConfetti();
  prepareBirthdayAudio();
  attemptPlayBirthdayAudio();
  showCountdown();
  enableAudioFallback();
}

window.addEventListener('DOMContentLoaded', initializeApp);

window.addEventListener('pageshow', () => {
  if (birthdayAudio && birthdayAudio.paused) {
    attemptPlayBirthdayAudio();
  }
});

window.addEventListener('load', attemptPlayBirthdayAudio);
window.addEventListener('focus', attemptPlayBirthdayAudio);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    attemptPlayBirthdayAudio();
  }
});

if (birthdayAudio) {
  birthdayAudio.addEventListener('canplay', attemptPlayBirthdayAudio);
  birthdayAudio.addEventListener('play', syncMusicUi);
  birthdayAudio.addEventListener('pause', syncMusicUi);
}
