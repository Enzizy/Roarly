const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* Icons (Lucide) — swaps every [data-lucide] placeholder for its SVG */
window.lucide?.createIcons();

/* Hero title: each word gets its stagger index for the bounce-in */
document.querySelectorAll('.bounce-in .word').forEach((word, i) => word.style.setProperty('--i', i));

/* Menu */
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const setMenu = (open) => {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  siteNav.classList.toggle('is-open', open);
};
menuToggle?.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
siteNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

/* Only one video plays at a time, anywhere on the page */
const allVideos = [...document.querySelectorAll('video:not(.style-strip video)')];
const pauseOthers = (keep) => allVideos.forEach((video) => { if (video !== keep) video.pause(); });

/* Featured story cards */
const videoCards = [...document.querySelectorAll('.video-grid article')];
videoCards.forEach((card) => {
  const video = card.querySelector('video');
  const button = card.querySelector('button');
  const setLabel = (playing) => button.setAttribute('aria-label', button.getAttribute('aria-label').replace(playing ? 'Play' : 'Pause', playing ? 'Pause' : 'Play'));

  video.addEventListener('play', () => { pauseOthers(video); card.classList.add('is-playing'); setLabel(true); });
  video.addEventListener('pause', () => { card.classList.remove('is-playing'); setLabel(false); });
  // A deliberate click pins playback so moving the mouse away doesn't stop it; hover previews are not pinned.
  let pinned = false;
  const toggle = () => { pinned = video.paused; video.paused ? video.play().catch(() => {}) : video.pause(); };
  button.addEventListener('click', toggle);
  video.addEventListener('click', toggle);
  // Back to the clip's own first frame (the src is loaded at #t=0.1).
  const showPoster = () => { pinned = false; video.pause(); video.currentTime = 0.1; };
  video.addEventListener('ended', showPoster);

  if (finePointer && !reducedMotion) {
    card.addEventListener('pointerenter', () => { if (video.paused) video.play().catch(() => {}); });
    card.addEventListener('pointerleave', () => { if (!pinned) showPoster(); });
  }
});

document.querySelectorAll('.story-filters button').forEach((filterButton) => {
  filterButton.addEventListener('click', () => {
    const filter = filterButton.dataset.filter;
    document.querySelectorAll('.story-filters button').forEach((button) => button.classList.toggle('is-active', button === filterButton));
    videoCards.forEach((card) => {
      const matches = filter === 'all' || card.dataset.category.split(' ').includes(filter);
      card.hidden = !matches;
      if (!matches) card.querySelector('video').pause();
    });
  });
});

/* Style picker: thumbnails swap the clip in the big film frame */
const styleFrame = document.querySelector('.style-frame');
const styleVideo = document.querySelector('[data-style-video]');
const stylePlay = document.querySelector('[data-style-play]');
const styleButtons = [...document.querySelectorAll('.style-strip button')];

if (styleVideo) {
  styleVideo.addEventListener('play', () => { pauseOthers(styleVideo); styleFrame.classList.add('is-playing'); });
  styleVideo.addEventListener('pause', () => styleFrame.classList.remove('is-playing'));
  stylePlay.addEventListener('click', () => styleVideo.play().catch(() => {}));
  styleVideo.addEventListener('click', () => styleVideo.pause());

  const clapper = document.querySelector('[data-clapper]');
  const clapperTake = document.querySelector('[data-clapper-take]');
  const swapClip = (button, wasPlaying) => {
    styleVideo.src = button.dataset.clip + '#t=0.1';
    document.querySelector('[data-style-name]').textContent = button.dataset.name;
    document.querySelector('[data-style-tag]').textContent = button.dataset.tag;
    styleVideo.load();
    styleVideo.classList.remove('is-swapping');
    void styleVideo.offsetWidth;
    styleVideo.classList.add('is-swapping');
    if (wasPlaying || finePointer) styleVideo.play().catch(() => {});
  };

  styleButtons.forEach((button, index) => button.addEventListener('click', () => {
    if (button.classList.contains('is-active')) return;
    styleButtons.forEach((other) => other.classList.toggle('is-active', other === button));
    const wasPlaying = !styleVideo.paused;
    if (reducedMotion) { swapClip(button, wasPlaying); return; }
    // Clapperboard snaps shut over the frame, and the new clip is revealed underneath it.
    clapperTake.textContent = String(index + 1).padStart(2, '0');
    clapper.classList.remove('is-snapping');
    void clapper.offsetWidth;
    clapper.classList.add('is-snapping');
    setTimeout(() => swapClip(button, wasPlaying), 320);
  }));
}

/* "Try it" box: a tiny pretend director */
const tryInput = document.querySelector('#idea');
const tryButton = document.querySelector('[data-try-play]');
const tryOutput = document.querySelector('[data-try-output]');
const styleNames = ['2D Cartoon', '3D Animation', 'Anime', 'Claymation', 'Realistic'];
const scenes = ['opens on a sunny hill', 'zooms through fluffy clouds', 'cuts to a cozy treehouse', 'pans across a glittering city', 'dives into a coral reef'];
tryButton?.addEventListener('click', () => {
  const idea = tryInput.value.trim();
  if (!idea) { tryOutput.textContent = 'Type an idea first. Anything goes!'; tryInput.focus(); return; }
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  tryOutput.textContent = 'Lights... camera... drawing...';
  tryOutput.classList.add('is-cooking');
  setTimeout(() => {
    tryOutput.classList.remove('is-cooking');
    tryOutput.textContent = `Scene 1 (${pick(styleNames)}): "${idea}" — ${pick(scenes)}. Ready in 4 min!`;
  }, reducedMotion ? 0 : 900);
});
tryInput?.addEventListener('keydown', (event) => { if (event.key === 'Enter') tryButton.click(); });

/* Counters in the hero */
document.querySelectorAll('[data-count]').forEach((el) => {
  const target = Number(el.dataset.count);
  const decimals = Number(el.dataset.decimals || 0);
  const format = (n) => (decimals ? n.toFixed(decimals) : Math.round(n).toLocaleString()) + (target >= 1000 ? '+' : '');
  if (reducedMotion) { el.textContent = format(target); return; }
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min(1, (now - start) / 1400);
    el.textContent = format(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

/* Billing toggle */
const billingToggle = document.querySelector('[data-billing-toggle]');
billingToggle?.addEventListener('click', () => {
  const yearly = billingToggle.getAttribute('aria-checked') !== 'true';
  billingToggle.setAttribute('aria-checked', String(yearly));
  document.querySelectorAll('.price strong').forEach((price) => {
    price.textContent = `$${yearly ? price.dataset.yearly : price.dataset.monthly}`;
    price.classList.remove('is-bumping');
    void price.offsetWidth;
    price.classList.add('is-bumping');
  });
  document.querySelectorAll('.checkout-trigger[data-plan]').forEach((trigger) => {
    const price = trigger.closest('.plan-card')?.querySelector('.price strong');
    if (price) trigger.dataset.price = `${price.textContent}/month${yearly ? ', billed yearly' : ''}`;
  });
});

/* Confetti burst */
const colors = ['#ffc21f', '#1f6ff0', '#ff4d4d', '#4fc25b', '#ff8ad8', '#ffffff'];
const burst = (x, y) => {
  if (reducedMotion) return;
  for (let i = 0; i < 22; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    const angle = Math.random() * Math.PI * 2;
    const distance = 70 + Math.random() * 120;
    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
    piece.style.setProperty('--dy', `${Math.sin(angle) * distance + 80}px`);
    piece.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);
    piece.addEventListener('animationend', () => piece.remove());
    document.body.append(piece);
  }
};
document.querySelectorAll('[data-confetti]').forEach((el) => el.addEventListener('click', (event) => burst(event.clientX, event.clientY)));

/* Hero parallax: clouds and stars lean with the mouse */
const scene = document.querySelector('[data-parallax-scene]');
if (scene && finePointer && !reducedMotion) {
  const layers = [...scene.querySelectorAll('[data-depth]')];
  scene.addEventListener('pointermove', (event) => {
    const bounds = scene.getBoundingClientRect();
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    layers.forEach((layer) => {
      const depth = Number(layer.dataset.depth);
      layer.style.translate = `${(x * depth).toFixed(1)}px ${(y * depth).toFixed(1)}px`;
    });
  });
  scene.addEventListener('pointerleave', () => layers.forEach((layer) => { layer.style.translate = ''; }));
}

/* Checkout modal (demo only) */
const checkoutModal = document.querySelector('.checkout-modal');
const checkoutForm = checkoutModal?.querySelector('[data-checkout-form]');
const checkoutFeedback = checkoutModal?.querySelector('[data-checkout-feedback]');
let checkoutOpener = null;

const closeCheckout = () => {
  checkoutModal.classList.remove('is-open');
  checkoutModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  checkoutOpener?.focus();
};

document.querySelectorAll('.checkout-trigger').forEach((trigger) => trigger.addEventListener('click', () => {
  checkoutOpener = trigger;
  checkoutModal.querySelector('[data-checkout-plan]').textContent = trigger.dataset.plan;
  checkoutModal.querySelector('[data-checkout-price]').textContent = trigger.dataset.price;
  checkoutForm.reset();
  checkoutForm.hidden = false;
  checkoutFeedback.hidden = true;
  checkoutModal.classList.add('is-open');
  checkoutModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  checkoutForm.querySelector('input').focus();
}));

checkoutModal?.querySelectorAll('[data-checkout-close]').forEach((control) => control.addEventListener('click', closeCheckout));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && checkoutModal?.classList.contains('is-open')) closeCheckout();
});
checkoutForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  checkoutForm.hidden = true;
  checkoutFeedback.hidden = false;
  checkoutModal.querySelector('.checkout-close').focus();
});

/* Reveal on first sight */
const revealElements = [...document.querySelectorAll('[data-reveal]')];
revealElements.forEach((element) => element.style.setProperty('--reveal-delay', `${Number(element.dataset.delay || 0)}ms`));
if (reducedMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px' });
  revealElements.forEach((element) => observer.observe(element));
}

/* Magnetic buttons */
if (finePointer && !reducedMotion) {
  document.querySelectorAll('[data-magnetic]').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      const bounds = element.getBoundingClientRect();
      element.style.setProperty('--mx', `${((event.clientX - bounds.left - bounds.width / 2) / 7).toFixed(1)}px`);
      element.style.setProperty('--my', `${((event.clientY - bounds.top - bounds.height / 2) / 7).toFixed(1)}px`);
    });
    element.addEventListener('pointerleave', () => { element.style.setProperty('--mx', '0px'); element.style.setProperty('--my', '0px'); });
  });
}

/* Blue cartoon cursor */
const toonCursor = document.querySelector('.toon-cursor');
if (toonCursor && finePointer && !reducedMotion) {
  document.body.classList.add('has-toon-cursor');
  let targetX = -100, targetY = -100, x = targetX, y = targetY, frame = 0;

  const render = () => {
    x += (targetX - x) * .35;
    y += (targetY - y) * .35;
    toonCursor.style.setProperty('--cx', `${x.toFixed(1)}px`);
    toonCursor.style.setProperty('--cy', `${y.toFixed(1)}px`);
    frame = Math.abs(targetX - x) + Math.abs(targetY - y) > .2 ? requestAnimationFrame(render) : 0;
  };

  document.addEventListener('pointermove', (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    toonCursor.classList.add('is-awake');
    toonCursor.classList.toggle('is-hover', Boolean(event.target.closest('a, button, summary, label, video, [role="button"]')));
    toonCursor.classList.toggle('is-text', Boolean(event.target.closest('input, textarea, select')));
    if (!frame) frame = requestAnimationFrame(render);
  }, { passive: true });
  document.addEventListener('pointerdown', () => toonCursor.classList.add('is-down'));
  document.addEventListener('pointerup', () => toonCursor.classList.remove('is-down'));
  document.documentElement.addEventListener('mouseleave', () => toonCursor.classList.remove('is-awake'));
}

/* Cursor sparkle trail: little stars fall off the cursor when it moves fast */
if (toonCursor && finePointer && !reducedMotion) {
  let lastX = 0, lastY = 0, lastSpark = 0;
  const starSvg = '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.8 6 6.5.7-4.9 4.4 1.4 6.4L12 16.8 6.2 20l1.4-6.4L2.7 9.2l6.5-.7z"/></svg>';
  document.addEventListener('pointermove', (event) => {
    const speed = Math.hypot(event.clientX - lastX, event.clientY - lastY);
    lastX = event.clientX;
    lastY = event.clientY;
    const now = performance.now();
    if (speed < 18 || now - lastSpark < 45) return;
    lastSpark = now;
    const spark = document.createElement('span');
    spark.className = 'cursor-spark';
    spark.innerHTML = starSvg;
    spark.style.left = `${event.clientX + (Math.random() * 16 - 8)}px`;
    spark.style.top = `${event.clientY + (Math.random() * 16 - 8)}px`;
    spark.style.color = colors[Math.floor(Math.random() * 4)];
    spark.style.setProperty('--sx', `${Math.random() * 30 - 15}px`);
    spark.addEventListener('animationend', () => spark.remove());
    document.body.append(spark);
  }, { passive: true });
}

/* Scroll-to-top rocket */
const toTop = document.querySelector('[data-to-top]');
if (toTop) {
  const updateToTop = () => toTop.classList.toggle('is-shown', window.scrollY > window.innerHeight * 0.8 && !toTop.classList.contains('is-launching'));
  window.addEventListener('scroll', updateToTop, { passive: true });
  updateToTop();
  toTop.addEventListener('click', () => {
    if (reducedMotion) { window.scrollTo(0, 0); return; }
    toTop.classList.add('is-launching');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => { toTop.classList.remove('is-launching', 'is-shown'); }, 1100);
  });
}
