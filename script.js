const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const themeToggle = document.querySelector('.theme-toggle');

const setTheme = (isDark) => {
    document.documentElement.classList.toggle('dark-mode', isDark);
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
};

setTheme(document.documentElement.classList.contains('dark-mode'));

themeToggle.addEventListener('click', () => {
    const isDark = !document.documentElement.classList.contains('dark-mode');
    localStorage.setItem('roarly-theme', isDark ? 'dark' : 'light');
    setTheme(isDark);
});

const checkoutModal = document.querySelector('.checkout-modal');
const checkoutPlan = document.querySelector('[data-checkout-plan]');
const checkoutPrice = document.querySelector('[data-checkout-price]');
const checkoutTriggers = document.querySelectorAll('.checkout-trigger');
const checkoutCloseControls = document.querySelectorAll('[data-checkout-close]');
const checkoutContinue = document.querySelector('[data-checkout-continue]');
const checkoutForm = document.querySelector('[data-checkout-form]');
const checkoutFeedback = document.querySelector('[data-checkout-feedback]');
const paymentPanels = document.querySelectorAll('[data-payment-panel]');

const selectPaymentMethod = (methodName) => {
    paymentPanels.forEach((panel) => {
        const isActive = panel.dataset.paymentPanel === methodName;
        panel.hidden = !isActive;
        panel.querySelectorAll('input').forEach((input) => {
            input.disabled = !isActive;
            input.required = isActive;
        });
    });
};

const closeCheckout = () => {
    checkoutModal.classList.remove('is-open');
    checkoutModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
};

checkoutTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
        checkoutPlan.textContent = trigger.dataset.plan;
        checkoutPrice.textContent = trigger.dataset.price;
        checkoutModal.classList.add('is-open');
        checkoutModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        checkoutForm.reset();
        checkoutFeedback.hidden = true;
        checkoutContinue.disabled = false;
        checkoutContinue.innerHTML = 'Complete demo payment <span>↗</span>';
        document.querySelector('input[value="card"]').checked = true;
        document.querySelectorAll('.payment-method').forEach((item) => item.classList.toggle('is-selected', item.querySelector('input').value === 'card'));
        selectPaymentMethod('card');
        checkoutModal.querySelector('input:checked').focus();
    });
});

checkoutCloseControls.forEach((control) => control.addEventListener('click', closeCheckout));

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && checkoutModal.classList.contains('is-open')) closeCheckout();
});

document.querySelectorAll('.payment-method').forEach((method) => {
    method.addEventListener('click', () => {
        document.querySelectorAll('.payment-method').forEach((item) => item.classList.remove('is-selected'));
        method.classList.add('is-selected');
        selectPaymentMethod(method.querySelector('input').value);
    });
});

checkoutForm.addEventListener('submit', (event) => {
    event.preventDefault();
    checkoutContinue.textContent = 'Demo payment approved';
    checkoutContinue.disabled = true;
    checkoutFeedback.hidden = false;
});

if (!reduceMotion && 'IntersectionObserver' in window) {
    const revealTargets = document.querySelectorAll(
        '.workflow, .showcase, .feature-band, .pricing, .faq, .final-cta, .logo-strip',
    );

    revealTargets.forEach((target) => target.classList.add('reveal'));

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 },
    );

    revealTargets.forEach((target) => observer.observe(target));
}
