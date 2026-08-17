const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

requestAnimationFrame(() => document.body.classList.add('page-ready'));

const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
  siteNav.classList.toggle('is-open', !isOpen);
});

siteNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');
  siteNav.classList.remove('is-open');
}));

const videoCards = [...document.querySelectorAll('.video-grid article')];

videoCards.forEach((card) => {
  const video = card.querySelector('video');
  const button = card.querySelector('button');

  const pauseVideo = () => {
    video.pause();
    card.classList.remove('is-playing');
    button.setAttribute('aria-label', button.getAttribute('aria-label').replace('Pause', 'Play'));
  };

  button.addEventListener('click', async () => {
    videoCards.forEach((otherCard) => {
      if (otherCard !== card) {
        otherCard.querySelector('video').pause();
        otherCard.classList.remove('is-playing');
      }
    });

    if (video.paused) {
      try {
        await video.play();
        card.classList.add('is-playing');
        button.setAttribute('aria-label', button.getAttribute('aria-label').replace('Play', 'Pause'));
      } catch (error) {
        card.classList.remove('is-playing');
      }
    } else {
      pauseVideo();
    }
  });

  video.addEventListener('click', () => {
    if (!video.paused) pauseVideo();
  });
  video.addEventListener('ended', pauseVideo);
});

document.querySelectorAll('.story-filters button').forEach((filterButton) => {
  filterButton.addEventListener('click', () => {
    const filter = filterButton.dataset.filter;
    document.querySelectorAll('.story-filters button').forEach((button) => button.classList.toggle('is-active', button === filterButton));

    videoCards.forEach((card) => {
      const matches = filter === 'all' || card.dataset.category.split(' ').includes(filter);
      card.hidden = !matches;
      if (!matches) {
        card.querySelector('video').pause();
        card.classList.remove('is-playing');
      }
    });
  });
});

const styleTrack = document.querySelector('.style-track');
document.querySelector('.carousel-arrow.prev')?.addEventListener('click', () => styleTrack.scrollBy({ left: -360, behavior: reducedMotion ? 'auto' : 'smooth' }));
document.querySelector('.carousel-arrow.next')?.addEventListener('click', () => styleTrack.scrollBy({ left: 360, behavior: reducedMotion ? 'auto' : 'smooth' }));

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

const revealElements = [...document.querySelectorAll('[data-reveal]')];
revealElements.forEach((element) => element.style.setProperty('--reveal-delay', `${Number(element.dataset.delay || 0)}ms`));

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px' });

  revealElements.forEach((element) => observer.observe(element));
}

if (finePointer && !reducedMotion) {
  document.querySelectorAll('.tilt-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      card.style.setProperty('--rx', `${(-y * 7).toFixed(2)}deg`);
      card.style.setProperty('--ry', `${(x * 7).toFixed(2)}deg`);
      card.style.setProperty('--scale', '1.025');
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--scale', '1');
    });
  });

  document.querySelectorAll('[data-magnetic]').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      const bounds = element.getBoundingClientRect();
      const moveX = (event.clientX - bounds.left - bounds.width / 2) / 6;
      const moveY = (event.clientY - bounds.top - bounds.height / 2) / 6;
      element.style.setProperty('--mx', `${moveX.toFixed(1)}px`);
      element.style.setProperty('--my', `${moveY.toFixed(1)}px`);
    });
    element.addEventListener('pointerleave', () => {
      element.style.setProperty('--mx', '0px');
      element.style.setProperty('--my', '0px');
    });
  });

  document.querySelectorAll('[data-spark]').forEach((element) => {
    element.addEventListener('click', (event) => {
      const bounds = element.getBoundingClientRect();
      const spark = document.createElement('span');
      spark.className = 'click-spark';
      spark.style.setProperty('--spark-x', `${event.clientX - bounds.left}px`);
      spark.style.setProperty('--spark-y', `${event.clientY - bounds.top}px`);
      spark.addEventListener('animationend', () => spark.remove());
      element.append(spark);
    });
  });
}
