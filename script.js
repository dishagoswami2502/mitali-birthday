/* ==========================================================================
   The Mitali Experience - Sibling Hijacked JS Engine
   Created by Disha - Implements interactive 9-room flow, procedural sound
   synthesis, floating nickname vault, custom orbit canvas, stamps, 
   Younger Sister Council lock rules, and Pink Revenge toast hijackers.
   ========================================================================== */

const state = {
  audioInitialized: false,
  isPlaying: false,
  currentScreen: 'welcome-screen',
  openingAttempts: 0,
  quizQuestionIndex: 1,
  unlockedNicknames: new Set(),
  stampedTitles: new Set(),
  ordersUncheckCount: 0,
  randomExcusesIndex: 0,
  typewriterTimer: null,
  toastTimeout: null,
  orbitSpeedMultiplier: 1,
  fleeCount: 0
};

// --- 1. PROCEDURAL SOUND SYNTHESIZER ---
class SiblingSynthesizer {
  constructor() {
    this.ctx = null;
    this.mainGain = null;
    this.delayNode = null;
    this.delayFeedback = null;
    this.melodyInterval = null;
    this.chordIndex = 0;
    this.stepIndex = 0;
    
    // Chord progression in F Major, G Major, E Minor, A Minor (cinematic warmth)
    this.chords = [
      { notes: [349.23, 440.00, 523.25, 698.46] }, // F Major
      { notes: [392.00, 493.88, 587.33, 783.99] }, // G Major
      { notes: [329.63, 392.00, 493.88, 659.25] }, // E Minor
      { notes: [440.00, 523.25, 659.25, 880.00] }  // A Minor
    ];
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    this.mainGain = this.ctx.createGain();
    this.mainGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.mainGain.connect(this.ctx.destination);
    
    this.delayNode = this.ctx.createDelay(2.0);
    this.delayNode.delayTime.setValueAtTime(0.6, this.ctx.currentTime);
    
    this.delayFeedback = this.ctx.createGain();
    this.delayFeedback.gain.setValueAtTime(0.35, this.ctx.currentTime);
    
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayNode.connect(this.mainGain);
  }

  startAmbientMelody() {
    this.init();
    if (state.isPlaying) return;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    this.mainGain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 2.0);
    
    this.melodyInterval = setInterval(() => {
      this.playSynthNote();
    }, 1800);
    
    document.getElementById('audio-control').classList.remove('hidden');
    state.isPlaying = true;
  }

  stopAmbientMelody() {
    if (!state.isPlaying) return;
    clearInterval(this.melodyInterval);
    if (this.mainGain) {
      this.mainGain.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + 1.0);
    }
    state.isPlaying = false;
  }

  playNote(frequency, duration = 3.0) {
    if (!this.ctx) return;
    const time = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, time);
    filter.frequency.exponentialRampToValueAtTime(100, time + duration);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, time);
    
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(frequency / 2, time);
    
    gain.gain.setValueAtTime(0.0, time);
    gain.gain.linearRampToValueAtTime(0.08, time + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    
    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(this.mainGain);
    gain.connect(this.delayNode);
    
    osc.start(time);
    subOsc.start(time);
    osc.stop(time + duration);
    subOsc.stop(time + duration);
  }

  playSynthNote() {
    const chord = this.chords[this.chordIndex];
    const notes = chord.notes;
    const note = notes[this.stepIndex % notes.length];
    
    this.playNote(note, 3.5);
    
    this.stepIndex++;
    if (this.stepIndex >= 4) {
      this.stepIndex = 0;
      this.chordIndex = (this.chordIndex + 1) % this.chords.length;
    }
  }

  playStampThud() {
    if (!this.ctx) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.22);
    
    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    
    osc.connect(gain);
    gain.connect(this.mainGain);
    
    osc.start(time);
    osc.stop(time + 0.28);
  }

  playSqueak() {
    if (!this.ctx) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, time);
    osc.frequency.exponentialRampToValueAtTime(1600, time + 0.08);
    osc.frequency.exponentialRampToValueAtTime(800, time + 0.15);
    
    gain.gain.setValueAtTime(0.0, time);
    gain.gain.linearRampToValueAtTime(0.08, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    
    osc.connect(gain);
    gain.connect(this.mainGain);
    
    osc.start(time);
    osc.stop(time + 0.2);
  }

  playBoing() {
    if (!this.ctx) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(450, time + 0.3);
    
    const mod = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    mod.frequency.setValueAtTime(35, time);
    modGain.gain.setValueAtTime(40, time);
    
    mod.connect(modGain);
    modGain.connect(osc.frequency);
    
    gain.gain.setValueAtTime(0.0, time);
    gain.gain.linearRampToValueAtTime(0.12, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
    
    osc.connect(gain);
    gain.connect(this.mainGain);
    
    mod.start(time);
    osc.start(time);
    
    mod.stop(time + 0.35);
    osc.stop(time + 0.35);
  }

  startMach99Sound() {
    this.stopMach99Sound();
    let pitch = 600;
    this.mach99Interval = setInterval(() => {
      if (!this.ctx) return;
      const time = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      pitch = pitch === 600 ? 900 : 600;
      osc.frequency.setValueAtTime(pitch, time);
      
      gain.gain.setValueAtTime(0.02, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
      
      osc.connect(gain);
      gain.connect(this.mainGain);
      
      osc.start(time);
      osc.stop(time + 0.15);
    }, 100);
  }

  stopMach99Sound() {
    if (this.mach99Interval) {
      clearInterval(this.mach99Interval);
      this.mach99Interval = null;
    }
  }

  playUnlockSparkle() {
    if (!this.ctx) return;
    const time = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // Arpeggio C Major
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time + idx * 0.08);
      
      gain.gain.setValueAtTime(0.0, time + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.05, time + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + idx * 0.08 + 0.5);
      
      osc.connect(gain);
      gain.connect(this.mainGain);
      
      osc.start(time + idx * 0.08);
      osc.stop(time + idx * 0.08 + 0.55);
    });
  }

  playBuzzer() {
    if (!this.ctx) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, time);
    osc.frequency.linearRampToValueAtTime(65, time + 0.28);
    
    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);
    
    osc.connect(gain);
    gain.connect(this.mainGain);
    
    osc.start(time);
    osc.stop(time + 0.3);
  }
}

const synth = new SiblingSynthesizer();

// --- 2. STARS AND FIREFLIES BACKGROUND ENGINE ---
class TwilightBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.particles = [];
    this.resizeCanvas();
    
    window.addEventListener('resize', () => this.resizeCanvas());
    this.initStars();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initStars() {
    const starCount = Math.floor((this.canvas.width * this.canvas.height) / 12000);
    this.stars = [];
    for (let i = 0; i < Math.min(starCount, 100); i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 1.5 + 0.4,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.02 + 0.005
      });
    }
  }

  spawnFirefly(x, y) {
    this.particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      alpha: 1.0,
      size: Math.random() * 4 + 2,
      decay: Math.random() * 0.015 + 0.01
    });
  }

  start() {
    const loop = () => {
      this.draw();
      requestAnimationFrame(loop);
    };
    loop();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Twinkling stars
    this.stars.forEach(star => {
      star.twinklePhase += star.twinkleSpeed;
      const alpha = Math.sin(star.twinklePhase) * 0.4 + 0.6;
      
      this.ctx.fillStyle = `rgba(255, 225, 230, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Firefly mouse trails
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      
      // Blush glow firefly
      const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
      gradient.addColorStop(0, `rgba(255, 164, 182, ${p.alpha})`);
      gradient.addColorStop(1, `rgba(255, 164, 182, 0)`);
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}

let skyEngine = null;

// Track mousemovement for firefly trail
window.addEventListener('mousemove', (e) => {
  if (skyEngine && Math.random() < 0.18) {
    skyEngine.spawnFirefly(e.clientX, e.clientY);
  }
});

// --- 3. CONFETTI BURST SIMULATION ---
class ConfettiEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.items = [];
    this.animationId = null;
    
    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    });
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  explode() {
    this.items = [];
    const colors = ['#b76e79', '#ffa4b6', '#ffd5dd', '#fffff3', '#c59b4c'];
    const midX = this.canvas.width / 2;
    const midY = this.canvas.height / 2;
    
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 3;
      
      this.items.push({
        x: midX,
        y: midY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (Math.random() * 5),
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5,
        gravity: 0.22,
        drag: 0.98
      });
    }
    
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.tick();
  }

  tick() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let active = false;
    
    for (let i = this.items.length - 1; i >= 0; i--) {
      const p = this.items[i];
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation * Math.PI / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      this.ctx.restore();
      
      if (p.y < this.canvas.height) {
        active = true;
      }
    }
    
    if (active) {
      this.animationId = requestAnimationFrame(() => this.tick());
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

const confetti = new ConfettiEngine('confetti-canvas');

// --- 4. NAVIGATION TRANSITIONS ---
function transitionToScreen(targetId) {
  const current = document.getElementById(state.currentScreen);
  const target = document.getElementById(targetId);
  
  if (current) {
    current.style.opacity = 0;
    setTimeout(() => {
      current.classList.remove('active');
      current.classList.add('hidden');
      
      target.classList.remove('hidden');
      target.classList.add('active');
      setTimeout(() => {
        target.style.opacity = 1;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }, 450);
  }
  state.currentScreen = targetId;
}

function showTeaseToast(msg) {
  const toast = document.getElementById('tease-toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  
  setTimeout(() => toast.classList.add('visible'), 50);
  
  if (state.toastTimeout) clearTimeout(state.toastTimeout);
  state.toastTimeout = setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.classList.add('hidden'), 400);
  }, 3200);
}

// --- 4.5. MITALI IS WATCHING SYSTEM ---
const watchingMessages = [
  "I have eyes on you.",
  "Behave.",
  "Disha...",
  "I will break your legs.",
  "Nice try. Also, I have eyes on you.",
  "Risky choice. I have been notified.",
  "I know what you just did.",
  "I am watching. As always.",
  "I have eyes on you."
];

const watchingContextMessages = {
  idle: [
    "Still there? I have eyes on you.",
    "You have been idle for too long. Unacceptable.",
    "Disha. Stop staring and proceed.",
    "I am watching. Move."
  ],
  wrongAnswer: [
    "Incorrect. Also, I have eyes on you.",
    "Wrong. I expected this.",
    "That was a terrible choice. I have been watching.",
    "Disha... that was the wrong answer."
  ],
  skipAttempt: [
    "Nice try.",
    "I see you trying to skip. Bold move.",
    "Not so fast. I have eyes on you."
  ],
  suspicious: [
    "Risky choice. Mitali has been notified.",
    "I see you. I always see you.",
    "You thought I wasn't watching. Cute."
  ]
};

let watchingTimeout = null;
let watchingDismissTimeout = null;
let watchingMsgIdx = 0;

function showMitaliWatching(msg, duration = 3800) {
  const notif = document.getElementById('mitali-watching-notif');
  const msgEl = document.getElementById('watching-msg-text');
  if (!notif || !msgEl) return;

  // Clear any existing dismiss timeout
  if (watchingDismissTimeout) clearTimeout(watchingDismissTimeout);

  msgEl.textContent = msg;
  notif.classList.remove('hidden');
  // Force reflow then slide in
  void notif.offsetWidth;
  notif.classList.add('slide-in');

  watchingDismissTimeout = setTimeout(() => {
    notif.classList.remove('slide-in');
    setTimeout(() => notif.classList.add('hidden'), 550);
  }, duration);
}

function triggerWatchingContext(context) {
  const pool = watchingContextMessages[context] || watchingMessages;
  const msg = pool[Math.floor(Math.random() * pool.length)];
  showMitaliWatching(msg);
}

// Idle detection — 14 seconds of no activity
function resetIdleTimer() {
  if (watchingTimeout) clearTimeout(watchingTimeout);
  watchingTimeout = setTimeout(() => {
    triggerWatchingContext('idle');
    resetIdleTimer();
  }, 14000);
}

['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
  document.addEventListener(evt, resetIdleTimer, { passive: true });
});

// Random ambient watching — 3% chance on any movement
document.addEventListener('mousemove', () => {
  if (Math.random() < 0.003) {
    const msg = watchingMessages[watchingMsgIdx % watchingMessages.length];
    watchingMsgIdx++;
    showMitaliWatching(msg, 3000);
  }
});

// --- 5. WELCOME SCREEN CONTROLS ---
function initializeWelcomeScreen() {
  // line-0 is already visible (intro tag), reveal lines 1-5 then actions
  const lineIds = ['welcome-line-2','welcome-line-3','welcome-line-4','welcome-line-5','welcome-actions'];

  lineIds.forEach((id, idx) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove('hidden');
        if (skyEngine) {
          skyEngine.spawnFirefly(window.innerWidth / 2, window.innerHeight / 2 - 50);
        }
      }
    }, (idx + 1) * 1600);
  });
}

document.getElementById('btn-accept-fate').addEventListener('click', () => {
  synth.startAmbientMelody();
  transitionToScreen('quiz-screen');
  setTimeout(() => initSecurityCheck(), 200);
});



// --- 6. TERMS CONTRACT CHECKLISTS ---
const contractChecks = document.querySelectorAll('.contract-check');
const btnAgree = document.getElementById('btn-contract-agree');
const btnNoChoice = document.getElementById('btn-contract-nochoice');
const fleeingContainer = document.getElementById('fleeing-checkbox-container');

contractChecks.forEach(box => {
  box.addEventListener('change', () => {
    if (box.checked) {
      synth.playSqueak();
    } else {
      synth.playBuzzer();
    }
    const allChecked = Array.from(contractChecks).every(c => c.checked);
    if (allChecked) {
      btnAgree.disabled = false;
      btnNoChoice.disabled = false;
      btnAgree.classList.add('pulse-btn');
    } else {
      btnAgree.disabled = true;
      btnNoChoice.disabled = true;
      btnAgree.classList.remove('pulse-btn');
    }
  });
});

if (fleeingContainer) {
  fleeingContainer.addEventListener('mouseenter', () => {
    const isChecked = fleeingContainer.querySelector('input').checked;
    if (isChecked) return;

    if (state.fleeCount < 4) {
      state.fleeCount++;
      synth.playBoing();
      
      const direction = Math.random() > 0.5 ? 1 : -1;
      const shiftX = direction * (Math.random() * 30 + 40);
      const shiftY = (Math.random() - 0.5) * 15;
      
      fleeingContainer.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
      
      const fleeComments = [
        "Non-negotiable! 😤",
        "Toleration is mandatory! 😈",
        "Stop trying to dodge this! 🙅‍♀️",
        "Nice try, Ma'am! 😌"
      ];
      showTeaseToast(fleeComments[state.fleeCount - 1]);
      
      if (state.fleeCount === 2) setTimeout(() => triggerWatchingContext('suspicious'), 800);
    } else if (state.fleeCount === 4) {
      state.fleeCount++;
      fleeingContainer.style.transform = 'translate(0px, 0px)';
      showTeaseToast("Okay, fine! You can check it. 🙄");
    }
  });
}

const proceedFromContract = () => {
  synth.playUnlockSparkle();
  transitionToScreen('vault-screen');
  setTimeout(() => initializeVault(), 200);
};

btnAgree.addEventListener('click', proceedFromContract);
btnNoChoice.addEventListener('click', proceedFromContract);


// --- 7. SECURITY CHECK — Personal Identity Quiz ---
const feedbackBox = document.getElementById('quiz-feedback');
const directionModal = document.getElementById('direction-modal');

// This replaces the old generic quiz with Disha's personal 2-question check.

function initSecurityCheck() {
  // Wire Q1 options
  document.querySelectorAll('.btn-option[data-q="1"]').forEach(btn => {
    btn.addEventListener('click', () => handleSecurityAnswer(btn, 1));
  });
  // Wire Q2 options
  document.querySelectorAll('.btn-option[data-q="2"]').forEach(btn => {
    btn.addEventListener('click', () => handleSecurityAnswer(btn, 2));
  });
  // Q1 retry
  const q1retry = document.getElementById('q1-retry');
  if (q1retry) q1retry.addEventListener('click', () => resetSecurityQ(1));
  // Q2 retry
  const q2retry = document.getElementById('q2-retry');
  if (q2retry) q2retry.addEventListener('click', () => resetSecurityQ(2));
  // Q1 next button → show Q2
  const q1next = document.getElementById('q1-next');
  if (q1next) q1next.addEventListener('click', () => {
    document.getElementById('q1-reveal').classList.add('hidden');
    const q2 = document.getElementById('quiz-q2');
    q2.classList.remove('hidden');
    q2.scrollIntoView({ behavior: 'smooth', block: 'center' });
    synth.playUnlockSparkle && synth.playUnlockSparkle();
  });
  // Enter Celebration → go to contract (Birthday Terms)
  const enterBtn = document.getElementById('btn-enter-celebration');
  if (enterBtn) enterBtn.addEventListener('click', () => {
    transitionToScreen('contract-screen');
  });

  // Fallback direction button
  const dirBtn = document.getElementById('btn-need-direction');
  if (dirBtn) dirBtn.addEventListener('click', () => {
    directionModal.classList.remove('hidden');
    setTimeout(() => directionModal.classList.add('active'), 50);
  });
}

function handleSecurityAnswer(btn, qNum) {
  const isCorrect = btn.getAttribute('data-correct') === 'true';
  // Disable all options for this question
  document.querySelectorAll(`.btn-option[data-q="${qNum}"]`).forEach(b => b.disabled = true);

  if (isCorrect) {
    btn.classList.add('correct-choice');
    synth.playUnlockSparkle && synth.playUnlockSparkle();

    setTimeout(() => {
      if (qNum === 1) {
        // Hide Q1 panel, show Q1 reveal
        document.getElementById('quiz-q1').classList.add('hidden');
        const reveal = document.getElementById('q1-reveal');
        reveal.classList.remove('hidden');
        reveal.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (qNum === 2) {
        // Hide Q2 panel, show identity verified
        document.getElementById('quiz-q2').classList.add('hidden');
        const verified = document.getElementById('identity-verified');
        verified.classList.remove('hidden');
        verified.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Stagger tribute lines
        const lines = verified.querySelectorAll('.tribute-line');
        lines.forEach((l, i) => {
          l.style.opacity = '0';
          l.style.transform = 'translateY(12px)';
          setTimeout(() => {
            l.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            l.style.opacity = '1';
            l.style.transform = 'translateY(0)';
          }, 400 + i * 300);
        });
      }
    }, 600);
  } else {
    btn.classList.add('wrong-choice');
    synth.playBoing && synth.playBoing();
    // Show wrong message
    const wrongEl = document.getElementById(`q${qNum}-wrong`);
    if (wrongEl) wrongEl.classList.remove('hidden');
    // Shake
    const panel = document.getElementById(qNum === 1 ? 'quiz-q1' : 'quiz-q2');
    panel.classList.add('stamp-shake');
    setTimeout(() => panel.classList.remove('stamp-shake'), 400);
    setTimeout(() => triggerWatchingContext && triggerWatchingContext('wrongAnswer'), 600);
  }
}

function resetSecurityQ(qNum) {
  const wrongEl = document.getElementById(`q${qNum}-wrong`);
  if (wrongEl) wrongEl.classList.add('hidden');
  document.querySelectorAll(`.btn-option[data-q="${qNum}"]`).forEach(b => {
    b.disabled = false;
    b.classList.remove('wrong-choice', 'correct-choice');
  });
}

document.getElementById('btn-close-direction').addEventListener('click', () => {
  directionModal.classList.remove('active');
  setTimeout(() => directionModal.classList.add('hidden'), 450);
  synth.playBuzzer && synth.playBuzzer();
});


// --- 8. THE NICKNAME VAULT (SECRET ROOM) ---
const nicknameStories = {
  chia: {
    title: "🌱 Nickname Unlocked: Chia Seed",
    story: "The Worrier-in-Chief. You manage the anxiety workloads of 15 different people before you've even had morning tea. 'I am completely fine, do not worry,' you say while actively typing an emergency contingency email at 11:45 PM. You adopted a handful, Ma'am! You are the sibling who holds us down.",
    img: "assets/img6.jpg"
  },
  firefly: {
    title: "✨ Nickname Unlocked: Firefly",
    story: "The Memory Engine. The woman who somehow remembers everything. Keys, events, birthdays, file names, and what I said six weeks ago. Your brain is a library of care. You are my North Star—steady, guiding, and shining even during the darker nights.",
    img: "assets/img3.jpg"
  },
  skipper: {
    title: "⛵ Nickname Unlocked: Skipper",
    story: "Accidental Family. Navigating the messy challenges of life together. Without permissions or formal applications, you became my mom, sister, protector, and guide. The skipper navigating my chaotic boat through every wave.",
    img: "assets/img4.jpg"
  },
  chutkula: {
    title: "🃏 Nickname Unlocked: Chutkula",
    story: "The Laughter Loophole. For all the running jokes, mirror selfies, and sibling face-offs. 'Disha means Direction' is our eternal truth, so when Mitali gets lost, I am always here to orbit. Sibling adoption completed fully.",
    img: "assets/img5.jpg"
  }
};

const vaultTokens = document.querySelectorAll('.floating-token');
const memoryModal = document.getElementById('memory-modal');
let tokenAnimationFrames = [];

function initializeVault() {
  const container = document.querySelector('.tokens-container');
  const tokens = [];
  
  // Setup coordinates and vector velocities for token drift physics
  vaultTokens.forEach((tok, idx) => {
    const left = Math.random() * (container.clientWidth - 110) + 10;
    const top = Math.random() * (container.clientHeight - 110) + 10;
    
    tok.style.left = `${left}px`;
    tok.style.top = `${top}px`;
    
    tokens.push({
      element: tok,
      x: left,
      y: top,
      vx: (Math.random() * 0.5 + 0.2) * (Math.random() > 0.5 ? 1 : -1),
      vy: (Math.random() * 0.5 + 0.2) * (Math.random() > 0.5 ? 1 : -1),
      w: 90,
      h: 90
    });
  });
  
  function driftTokens() {
    tokens.forEach(t => {
      t.x += t.vx;
      t.y += t.vy;
      
      // Bounce checks
      if (t.x <= 0) { t.x = 0; t.vx *= -1; }
      if (t.x >= container.clientWidth - t.w) { t.x = container.clientWidth - t.w; t.vx *= -1; }
      
      if (t.y <= 0) { t.y = 0; t.vy *= -1; }
      if (t.y >= container.clientHeight - t.h) { t.y = container.clientHeight - t.h; t.vy *= -1; }
      
      t.element.style.left = `${t.x}px`;
      t.element.style.top = `${t.y}px`;
    });
    
    state.vaultAnimFrame = requestAnimationFrame(driftTokens);
  }
  driftTokens();
}

vaultTokens.forEach(tok => {
  tok.addEventListener('click', () => {
    const nick = tok.getAttribute('data-nickname');
    const data = nicknameStories[nick];
    
    // Set popup text
    document.getElementById('memory-title').textContent = data.title;
    document.getElementById('memory-story').textContent = data.story;
    
    memoryModal.classList.remove('hidden');
    setTimeout(() => memoryModal.classList.add('active'), 50);
    synth.playUnlockSparkle();
    
    if (!state.unlockedNicknames.has(nick)) {
      state.unlockedNicknames.add(nick);
      
      // Populate scrapbook slot
      const count = state.unlockedNicknames.size;
      document.getElementById('fragment-count').textContent = count;
      
      const slot = document.getElementById(`slot-${count}`);
      slot.classList.remove('empty');
      slot.innerHTML = `<img src="${data.img}" alt="${nick} unlocked">`;
      
      // Check vault milestone
      if (count === 4) {
        cancelAnimationFrame(state.vaultAnimFrame);
        setTimeout(() => {
          document.getElementById('vault-msg-box').classList.remove('hidden');
          document.getElementById('vault-msg-box').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 800);
      }
    }
  });
});

document.getElementById('btn-close-memory').addEventListener('click', () => {
  memoryModal.classList.remove('active');
  setTimeout(() => memoryModal.classList.add('hidden'), 450);
  synth.playBuzzer();
});

document.getElementById('btn-proceed-investigation').addEventListener('click', () => {
  transitionToScreen('investigation-screen');
});

// --- 9. THE INVESTIGATION ("WHO EXACTLY IS MITALI?") ---
const titleOptions = document.querySelectorAll('.btn-title-option');
const stampContainer = document.getElementById('stamp-container');

titleOptions.forEach(btn => {
  btn.addEventListener('click', () => {
    const title = btn.getAttribute('data-title');
    if (state.stampedTitles.has(title)) return;
    
    state.stampedTitles.add(title);
    btn.classList.add('stamped');
    
    // Create stamp element inside the button to tumble with it
    const stampEl = document.createElement('span');
    stampEl.className = 'stamp-label';
    stampEl.textContent = "WRONG";
    stampEl.style.position = 'absolute';
    stampEl.style.top = '50%';
    stampEl.style.left = '50%';
    stampEl.style.transform = 'translate(-50%, -50%) rotate(-15deg) scale(3.5)';
    stampEl.style.margin = '0';
    stampEl.style.pointerEvents = 'none';
    btn.appendChild(stampEl);
    
    setTimeout(() => {
      stampEl.style.transform = 'translate(-50%, -50%) rotate(-15deg) scale(1)';
      stampEl.style.opacity = '0.9';
    }, 20);
    
    // Play stamp thud and funny slide/boing sound
    synth.playStampThud();
    synth.playBoing();
    
    // Screen shake
    const panel = document.querySelector('.investigation-panel');
    panel.classList.add('stamp-shake');
    setTimeout(() => panel.classList.remove('stamp-shake'), 350);
    
    // Set random tilt, rotation, and falling direction variables
    const tilt = (Math.random() * 16 - 8).toFixed(2);
    const shiftX = (Math.random() * 120 - 60).toFixed(2);
    const rot = (Math.random() * 180 - 90).toFixed(2);
    btn.style.setProperty('--random-tilt', `${tilt}deg`);
    btn.style.setProperty('--random-x', `${shiftX}px`);
    btn.style.setProperty('--random-rot', `${rot}deg`);
    
    // Gravity fall after stamp hits
    setTimeout(() => {
      btn.classList.add('gravity-fall');
    }, 250);
    
    // Show Sister button when all 6 cards tumble off
    if (state.stampedTitles.size === 6) {
      setTimeout(() => {
        document.getElementById('investigation-climax').classList.remove('hidden');
        document.getElementById('btn-reveal-sister').classList.remove('hidden');
        document.getElementById('btn-reveal-sister').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 1500);
    }
  });
});

document.getElementById('btn-reveal-sister').addEventListener('click', () => {
  synth.playUnlockSparkle();
  transitionToScreen('says-screen');
  initializeSaysSection();
});

// --- 9.5. THINGS MITALI SAYS SECTION ---
function initializeSaysSection() {
  let flippedCount = 0;
  const totalCards = 6;

  document.querySelectorAll('.says-card').forEach((card, idx) => {
    // Reset flip state
    card.classList.remove('flipped');

    card.addEventListener('click', function handler() {
      if (card.classList.contains('flipped')) return;
      card.classList.add('flipped');
      synth.playUnlockSparkle();
      flippedCount++;

      // Mitali watching reaction on first flip
      if (flippedCount === 1) {
        setTimeout(() => showMitaliWatching("You finally understand. I was always watching.", 4200), 800);
      }

      if (flippedCount >= totalCards) {
        setTimeout(() => {
          document.getElementById('says-footer').classList.remove('hidden');
          document.getElementById('says-footer').scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Final watching message
          setTimeout(() => showMitaliWatching("And I always will be. 👁️", 4500), 1200);
        }, 600);
      }
    });
  });
}

document.getElementById('btn-from-says').addEventListener('click', () => {
  synth.playUnlockSparkle();
  transitionToScreen('orbit-screen');
  initializeOrbit();
});

// --- 10. THE ORBIT SECTION CANVAS ---
let orbitAnimFrame = null;
let orbitParticles = [];

function initializeOrbit() {
  state.orbitSpeedMultiplier = 1;
  orbitParticles = [];
  
  const canvas = document.getElementById('orbit-canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = 300;
  canvas.height = 300;
  
  const midX = canvas.width / 2;
  const midY = canvas.height / 2;
  const rx = 100; // orbit ellipse x radius
  const ry = 40;  // orbit ellipse y radius
  let angle = 0;
  
  function drawOrbit() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw orbit path ellipse line
    ctx.beginPath();
    ctx.ellipse(midX, midY, rx, ry, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(183, 110, 121, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Draw orbiting firefly
    const fx = midX + Math.cos(angle) * rx;
    const fy = midY + Math.sin(angle) * ry;
    
    // Sparkle spray particle system for elevated speeds
    if (state.orbitSpeedMultiplier > 1) {
      const spawnChance = state.orbitSpeedMultiplier === 99 ? 0.85 : 0.4;
      const count = state.orbitSpeedMultiplier === 99 ? 6 : 1;
      for (let i = 0; i < count; i++) {
        if (Math.random() < spawnChance) {
          orbitParticles.push({
            x: fx,
            y: fy,
            vx: (Math.random() - 0.5) * (state.orbitSpeedMultiplier * 0.15),
            vy: (Math.random() - 0.5) * (state.orbitSpeedMultiplier * 0.15),
            alpha: 1.0,
            size: Math.random() * 3 + 1.5,
            color: state.orbitSpeedMultiplier === 99 ? '#ffa4b6' : '#ffd5dd'
          });
        }
      }
    }
    
    // Draw/update sparkles
    for (let i = orbitParticles.length - 1; i >= 0; i--) {
      const p = orbitParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.025;
      if (p.alpha <= 0) {
        orbitParticles.splice(i, 1);
        continue;
      }
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
    
    // Firefly glow
    const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, 12);
    grad.addColorStop(0, 'rgba(255, 164, 182, 0.9)');
    grad.addColorStop(1, 'rgba(255, 164, 182, 0)');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(fx, fy, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Small center dot
    ctx.fillStyle = '#fffff3';
    ctx.beginPath();
    ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    angle += 0.035 * state.orbitSpeedMultiplier;
    orbitAnimFrame = requestAnimationFrame(drawOrbit);
  }
  
  drawOrbit();
  
  // Show orbit line text
  const lines = [
    document.getElementById('orbit-line-1'),
    document.getElementById('orbit-line-2'),
    document.getElementById('orbit-line-3'),
    document.getElementById('orbit-line-4')
  ];
  
  lines.forEach((line, idx) => {
    setTimeout(() => {
      if (line) line.classList.remove('hidden');
    }, idx * 1500);
  });
  
  setTimeout(() => {
    document.getElementById('orbit-actions').classList.remove('hidden');
    document.getElementById('orbit-dashboard').classList.remove('hidden');
  }, lines.length * 1500 + 400);
}

// Orbit Speed Controls
document.getElementById('btn-orbit-speedup').addEventListener('click', () => {
  if (state.orbitSpeedMultiplier === 1) {
    state.orbitSpeedMultiplier = 5;
    document.getElementById('orbit-status-log').textContent = "Status: Orbiting at Mach 5 (Annoying)";
    synth.playUnlockSparkle();
  } else if (state.orbitSpeedMultiplier === 5) {
    state.orbitSpeedMultiplier = 10;
    document.getElementById('orbit-status-log').textContent = "Status: Orbiting at Mach 10 (Very Annoying)";
    synth.playSqueak();
  } else if (state.orbitSpeedMultiplier === 10) {
    state.orbitSpeedMultiplier = 99;
    document.getElementById('orbit-status-log').textContent = "Status: Orbiting at Mach 99 (HYPERACTIVE FIREFLY!)";
    synth.startMach99Sound();
    
    const screen = document.getElementById('orbit-screen');
    screen.classList.add('stamp-shake');
  } else {
    showTeaseToast("Mach 99 is maximum sibling speed!");
    synth.playBoing();
  }
});

document.getElementById('btn-orbit-calibrate').addEventListener('click', () => {
  state.orbitSpeedMultiplier = 1;
  document.getElementById('orbit-status-log').textContent = "Status: Orbiting stably at Mach 1";
  synth.stopMach99Sound();
  synth.playUnlockSparkle();
  
  const screen = document.getElementById('orbit-screen');
  screen.classList.remove('stamp-shake');
  
  showTeaseToast("Calibration successful. Sister remains orbiting forever. 😌");
});

document.getElementById('btn-to-orders').addEventListener('click', () => {
  cancelAnimationFrame(orbitAnimFrame);
  synth.stopMach99Sound();
  const screen = document.getElementById('orbit-screen');
  screen.classList.remove('stamp-shake');
  transitionToScreen('orders-screen');
});

// --- 11. SIBLING COUNCIL ORDERS LOCK RULES ---
document.getElementById('btn-to-renewal').addEventListener('click', () => {
  transitionToScreen('renewal-screen');
});

const ordersChecks = document.querySelectorAll('.order-check');
ordersChecks.forEach(box => {
  // Checks are locked by default in HTML. In case browser overrides:
  box.addEventListener('change', (e) => {
    e.preventDefault();
    box.checked = true;
    synth.playBuzzer();
    
    const uncheckSass = [
      "Violation will result in: Persistent annoyance. 😈",
      "Orders cannot be unchecked by Elder Sister Decree Section 4B.",
      "Access Denied: Sibling Council rules are absolute.",
      "Nice try. This checkbox is permanently locked."
    ];
    showTeaseToast(uncheckSass[state.randomExcusesIndex]);
    state.randomExcusesIndex = (state.randomExcusesIndex + 1) % uncheckSass.length;
  });
});

// --- 12. FINAL CONTRACT RENEWAL & WAX SEAL ---
const renewalChecks = document.querySelectorAll('.renewal-check');
const btnRenew = document.getElementById('btn-renew-contract');

renewalChecks.forEach(box => {
  box.addEventListener('change', () => {
    const allChecked = Array.from(renewalChecks).every(c => c.checked);
    if (allChecked) {
      btnRenew.disabled = false;
      btnRenew.classList.add('pulse-btn');
    } else {
      btnRenew.disabled = true;
      btnRenew.classList.remove('pulse-btn');
    }
  });
});

btnRenew.addEventListener('click', () => {
  synth.playStampThud();
  
  // Shake panel
  const panel = document.querySelector('.renewal-panel');
  panel.classList.add('stamp-shake');
  setTimeout(() => panel.classList.remove('stamp-shake'), 400);
  
  btnRenew.style.display = 'none';
  
  const seal = document.getElementById('renewal-seal');
  seal.classList.remove('hidden');
  
  setTimeout(() => {
    document.getElementById('renewal-actions').classList.remove('hidden');
  }, 1500);
});

document.getElementById('btn-to-climax').addEventListener('click', () => {
  transitionToScreen('climax-screen');
  initializeClimaxTypewriter();
});

// --- 13. CLIMAX TYPEWRITER LETTER ---
function initializeClimaxTypewriter() {
  const container = document.getElementById('final-scroll-text');
  container.innerHTML = '';
  
  const paragraphs = [
    { type: 'p', text: "You once said: <strong>\"U tied rakhi now ur sister for life.\"</strong>" },
    { type: 'p', text: "You didn't have to say that. But you did. And I believed every word." },
    { type: 'p', text: "The world knows <strong>Mitali Ma'am</strong>." },
    { type: 'p', text: "I know <strong>Mitali</strong>." },
    { type: 'p', text: "The one who called me <em>Chia Seed</em> when I couldn't drive. The one who made me Skipper. The one who calls me Chutkula and means it as the highest compliment." },
    { type: 'p', text: "The one who said: <strong>\"You bring so much joy and love into our everyday mundane lives.\"</strong>" },
    { type: 'p', text: "Ma'am, the orbit never breaks. Even if you go to Mumbai. Even if we're in different cities. Even if you sleep ulta like a koala and screw up your knee." },
    { type: 'p', text: "Orbit will find a job in Mumbai. Around you. 🌸" },
    { type: 'h2', text: "Happy Birthday ❤️" },
    { type: 'signatures', text: "<p class='closing-love'>With loads and loads and loads of love,</p><div class='name'>Disha</div><p class='closing-sub'>Your Chia Seed. Your Chutkula. Your Skipper. Your Firefly.</p><p class='closing-sub' style='margin-top:8px;'>Still orbiting. Still annoying. Still yours. Forever.</p>" }
  ];
  
  let currentIdx = 0;
  
  function renderNextLine() {
    if (currentIdx >= paragraphs.length) {
      document.getElementById('final-actions-row').classList.remove('hidden');
      confetti.explode();
      return;
    }
    
    const data = paragraphs[currentIdx];
    const el = document.createElement(data.type === 'signatures' ? 'div' : data.type);
    
    if (data.type === 'signatures') {
      el.className = 'signatures';
      el.innerHTML = data.text;
    } else {
      el.innerHTML = data.text;
    }
    
    el.style.opacity = 0;
    el.style.transform = 'translateY(10px)';
    container.appendChild(el);
    
    // Trigger stardust chimes on climax typewriter
    if (skyEngine) {
      skyEngine.spawnFirefly(window.innerWidth / 2, window.innerHeight * 0.7);
    }
    
    setTimeout(() => {
      el.style.transition = 'all 1.2s ease';
      el.style.opacity = 1;
      el.style.transform = 'translateY(0)';
      
      currentIdx++;
      setTimeout(renderNextLine, data.type === 'h2' ? 2200 : 1600);
    }, 50);
  }
  
  setTimeout(renderNextLine, 1000);
}

// --- 14. PINK REVENGE TOAST & FALLING EMOJIS INTERACTION ---
const complaintsExcuses = [
  "We considered other colours. We rejected them.",
  "Complaint registered. Expected resolution: Never.",
  "There are millions of colours in the world. We chose pink. You know why. 😉",
  "Aesthetic design alignment approved by Younger Sister Council."
];
let excuseIdx = 0;
let fallingEmojis = [];
let isEmojiLoopRunning = false;

function spawnFallingEmoji(x, y) {
  const emojis = ['🌸', '💖', '🎀', '🐷', '🦄', '🧁', '🍒', '🍭', '🩰', '🏩'];
  const char = emojis[Math.floor(Math.random() * emojis.length)];
  
  const el = document.createElement('div');
  el.className = 'falling-emoji-particle';
  el.textContent = char;
  el.style.left = `${x - 20}px`;
  el.style.top = `${y - 20}px`;
  document.body.appendChild(el);
  
  fallingEmojis.push({
    element: el,
    x: x - 20,
    y: y - 20,
    vx: (Math.random() - 0.5) * 6,
    vy: -Math.random() * 4 - 3,
    rotation: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 12,
    gravity: 0.25
  });
  
  if (!isEmojiLoopRunning) {
    isEmojiLoopRunning = true;
    updateFallingEmojis();
  }
}

function updateFallingEmojis() {
  if (fallingEmojis.length === 0) {
    isEmojiLoopRunning = false;
    return;
  }
  
  const height = window.innerHeight;
  for (let i = fallingEmojis.length - 1; i >= 0; i--) {
    const p = fallingEmojis[i];
    p.vy += p.gravity;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.rotSpeed;
    
    p.element.style.left = `${p.x}px`;
    p.element.style.top = `${p.y}px`;
    p.element.style.transform = `rotate(${p.rotation}deg)`;
    
    if (p.y > height + 60 || p.x < -60 || p.x > window.innerWidth + 60) {
      p.element.remove();
      fallingEmojis.splice(i, 1);
    }
  }
  
  requestAnimationFrame(updateFallingEmojis);
}

document.addEventListener('click', (e) => {
  // If clicking anywhere that is NOT an interactive element
  const clickableTags = ['BUTTON', 'INPUT', 'LABEL', 'A', 'TEXTAREA'];
  if (
    clickableTags.includes(e.target.tagName) || 
    e.target.closest('.checkbox-container') || 
    e.target.closest('.floating-token') || 
    e.target.closest('#audio-toggle') ||
    e.target.closest('.btn-title-option')
  ) {
    return;
  }
  
  spawnFallingEmoji(e.clientX, e.clientY);
  
  // 35% chance of spawning tease toast on empty space click
  if (Math.random() < 0.35) {
    const msg = complaintsExcuses[excuseIdx];
    showTeaseToast(msg);
    synth.playBuzzer();
    excuseIdx = (excuseIdx + 1) % complaintsExcuses.length;
  }
});

// --- 15. RESET SYSTEM ---
function resetExperience() {
  state.currentScreen = 'welcome-screen';
  state.openingAttempts = 0;
  state.quizQuestionIndex = 1;
  state.unlockedNicknames.clear();
  state.stampedTitles.clear();
  state.ordersUncheckCount = 0;
  state.fleeCount = 0;
  state.orbitSpeedMultiplier = 1;
  
  synth.stopMach99Sound();
  
  // Clear watching notification
  const watchingNotif = document.getElementById('mitali-watching-notif');
  if (watchingNotif) {
    watchingNotif.classList.remove('slide-in');
    watchingNotif.classList.add('hidden');
  }
  if (watchingDismissTimeout) clearTimeout(watchingDismissTimeout);
  
  // Clear any active falling emojis
  fallingEmojis.forEach(p => p.element.remove());
  fallingEmojis = [];
  
  // Hide reset buttons
  document.getElementById('final-actions-row').classList.add('hidden');
  
  // Reset welcome screen elements
  document.querySelectorAll('.welcome-line').forEach(el => {
    el.classList.add('hidden');
  });
  document.getElementById('welcome-actions').classList.add('hidden');
  
  // Reset contract checks
  contractChecks.forEach(c => c.checked = false);
  btnAgree.disabled = true;
  btnNoChoice.disabled = true;
  btnAgree.classList.remove('pulse-btn');
  if (fleeingContainer) {
    fleeingContainer.style.transform = 'translate(0px, 0px)';
  }
  
  // Reset quiz items
  quizQuestions.forEach((q, idx) => {
    if (idx === 0) {
      q.classList.remove('hidden');
    } else {
      q.classList.add('hidden');
    }
  });
  document.querySelectorAll('.btn-option').forEach(btn => {
    btn.classList.remove('correct-choice', 'wrong-choice');
  });
  feedbackBox.classList.add('hidden');
  
  // Reset Nickname Vault
  document.getElementById('fragment-count').textContent = '0';
  document.querySelectorAll('.fragment-slot').forEach(slot => {
    slot.classList.add('empty');
    slot.textContent = '?';
  });
  document.getElementById('vault-msg-box').classList.add('hidden');
  
  // Reset Investigation
  titleOptions.forEach(btn => {
    btn.classList.remove('stamped', 'gravity-fall');
    btn.style.removeProperty('--random-tilt');
    btn.style.removeProperty('--random-x');
    btn.style.removeProperty('--random-rot');
    const stamps = btn.querySelectorAll('.stamp-label');
    stamps.forEach(s => s.remove());
  });
  stampContainer.innerHTML = '';
  document.getElementById('investigation-climax').classList.add('hidden');
  document.getElementById('btn-reveal-sister').classList.add('hidden');
  
  // Reset Says Section
  document.querySelectorAll('.says-card').forEach(c => c.classList.remove('flipped'));
  document.getElementById('says-footer').classList.add('hidden');
  
  // Reset Orbit
  document.querySelectorAll('.orbit-line').forEach(line => {
    line.classList.add('hidden');
  });
  document.getElementById('orbit-actions').classList.add('hidden');
  document.getElementById('orbit-dashboard').classList.add('hidden');
  document.getElementById('orbit-status-log').textContent = "Status: Orbiting stably at Mach 1";
  
  const orbitScreen = document.getElementById('orbit-screen');
  if (orbitScreen) {
    orbitScreen.classList.remove('stamp-shake');
  }
  
  // Reset Renewal checks
  renewalChecks.forEach(c => c.checked = false);
  btnRenew.style.display = 'inline-block';
  btnRenew.disabled = true;
  btnRenew.classList.remove('pulse-btn');
  
  document.getElementById('renewal-seal').classList.add('hidden');
  document.getElementById('renewal-actions').classList.add('hidden');
  
  // Load welcome screen
  const allScreens = document.querySelectorAll('.experience-screen');
  allScreens.forEach(scr => {
    scr.classList.remove('active');
    scr.classList.add('hidden');
  });
  
  const welcome = document.getElementById('welcome-screen');
  welcome.classList.remove('hidden');
  welcome.classList.add('active');
  welcome.style.opacity = 1;
  
  initializeWelcomeScreen();
}

// --- 16. BOOTSTRAP SITE ---
window.addEventListener('load', () => {
  skyEngine = new TwilightBackground('sky-canvas');
  skyEngine.start();
  
  initializeWelcomeScreen();
  
  // Setup audio loop controllers toggle
  document.getElementById('audio-toggle').addEventListener('click', (e) => {
    e.stopPropagation();
    if (state.isPlaying) {
      synth.stopAmbientMelody();
      document.querySelector('.music-text').textContent = "Music muted";
    } else {
      synth.startAmbientMelody();
      document.querySelector('.music-text').textContent = "Playing ambient melody";
    }
  });
});
