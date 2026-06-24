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
