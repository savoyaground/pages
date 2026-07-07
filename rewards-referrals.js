/*
  ==================================================
  SAVOYA REWARDS + REFERRALS JS
  ==================================================

  Includes:
  1. Lordicon card icon animation
  2. Reward ladder reveal animation
  3. Rewards point number counters
  4. SaaSQuatch referral form cookie injection
  ==================================================
*/

(function () {
  /*
    ==================================================
    LORDICON: CARD ICON BLOCKS
    ==================================================
  */

  const CARD_CONFIG = {
    icons: ['dpehoexm', 'mqhjyzfv', 'sepigrhi', 'grrojrkv'],

    colors: {
      primary: '#c56129',
      secondary: '#f5ad59',
    },

    startDelay: 250,
    stagger: 180,
  };

  let cardObserver;

  function initCardIcons() {
    const blocks = document.querySelectorAll('.card-icon-block');

    if (!blocks.length || !('IntersectionObserver' in window)) return;

    if (!cardObserver) {
      cardObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;

            observer.unobserve(entry.target);
            playCardIcons(entry.target);
          });
        },
        {
          threshold: 0.2,
          rootMargin: '0px 0px -8% 0px',
        }
      );
    }

    blocks.forEach(function (block) {
      if (block.dataset.lordiconInitialized === 'true') return;

      const icons = block.querySelectorAll('.lordicon-dynamic');

      if (!icons.length) return;

      block.dataset.lordiconInitialized = 'true';

      icons.forEach(function (icon, iconIndex) {
        const iconName = CARD_CONFIG.icons[iconIndex];

        if (!iconName) return;

        icon.removeAttribute('trigger');
        icon.removeAttribute('delay');

        icon.setAttribute('src', `https://cdn.lordicon.com/${iconName}.json`);
        icon.setAttribute(
          'colors',
          `primary:${CARD_CONFIG.colors.primary},secondary:${CARD_CONFIG.colors.secondary}`
        );

        icon.style.opacity = '1';
      });

      cardObserver.observe(block);
    });
  }

  function playCardIcons(block) {
    if (block.dataset.lordiconPlayed === 'true') return;

    block.dataset.lordiconPlayed = 'true';

    const icons = block.querySelectorAll('.lordicon-dynamic');

    icons.forEach(function (icon, iconIndex) {
      const fadeElement = findFadeElement(icon, block);

      waitUntilVisible(fadeElement).then(function () {
        const delay = CARD_CONFIG.startDelay + iconIndex * CARD_CONFIG.stagger;

        window.setTimeout(function () {
          playIcon(icon);
        }, delay);
      });
    });
  }

  function findFadeElement(icon, block) {
    const iconFadeWrapper = icon.closest('.fade-in');

    if (iconFadeWrapper) return iconFadeWrapper;

    if (block.classList.contains('fade-in')) return block;

    return block.closest('.fade-in');
  }

  function waitUntilVisible(element) {
    return new Promise(function (resolve) {
      if (!element) {
        resolve();
        return;
      }

      const startTime = performance.now();
      const maximumWait = 5000;

      function checkVisibility(currentTime) {
        const styles = window.getComputedStyle(element);
        const opacity = parseFloat(styles.opacity) || 0;

        const isVisible =
          opacity >= 0.99 &&
          styles.visibility !== 'hidden' &&
          styles.display !== 'none';

        const hasTimedOut = currentTime - startTime >= maximumWait;

        if (isVisible || hasTimedOut) {
          resolve();
          return;
        }

        window.requestAnimationFrame(checkVisibility);
      }

      window.requestAnimationFrame(checkVisibility);
    });
  }

  function playIcon(icon) {
    waitForIconReady(icon).then(function () {
      if (!icon.playerInstance) return;

      icon.playerInstance.play();
    });
  }

  function waitForIconReady(icon) {
    return new Promise(function (resolve) {
      if (icon.playerInstance) {
        resolve();
        return;
      }

      let resolved = false;
      const startTime = performance.now();
      const maximumWait = 3000;

      function finish() {
        if (resolved) return;

        resolved = true;
        icon.removeEventListener('ready', handleReady);

        resolve();
      }

      function handleReady() {
        finish();
      }

      function checkPlayer(currentTime) {
        if (resolved) return;

        if (icon.playerInstance || currentTime - startTime >= maximumWait) {
          finish();
          return;
        }

        window.requestAnimationFrame(checkPlayer);
      }

      icon.addEventListener('ready', handleReady, {
        once: true,
      });

      window.requestAnimationFrame(checkPlayer);
    });
  }

  /*
    ==================================================
    REWARD LADDER
    ==================================================
  */

  function initRewardLadder() {
    const rewardLadders = document.querySelectorAll('.reward-ladder-block');

    if (!rewardLadders.length) return;

    if (!('IntersectionObserver' in window)) {
      rewardLadders.forEach(function (ladder) {
        ladder.classList.add('is-revealed');
      });

      return;
    }

    const rewardLadderObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    rewardLadders.forEach(function (ladder) {
      rewardLadderObserver.observe(ladder);
    });
  }

  /*
    ==================================================
    REWARDS POINT COUNTERS
    ==================================================
  */

  function initRewardsCounters() {
    const counterSection = document.getElementById('counter-section');
    const pointsCounter = document.getElementById('points-count');
    const rewardsCounter = document.getElementById('rewards-count');

    if (!counterSection || !pointsCounter || !rewardsCounter) return;

    if (!('IntersectionObserver' in window)) {
      pointsCounter.textContent = '100';
      rewardsCounter.textContent = '$1';
      return;
    }

    let hasAnimated = false;

    function animateCounter(options) {
      const element = options.element;
      const target = options.target;
      const duration = options.duration || 1600;
      const prefix = options.prefix || '';
      const suffix = options.suffix || '';
      const decimals = options.decimals || 0;
      const finalText = options.finalText || null;

      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = target * easedProgress;

        element.textContent = prefix + currentValue.toFixed(decimals) + suffix;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          element.textContent =
            finalText || prefix + target.toFixed(decimals) + suffix;
        }
      }

      requestAnimationFrame(updateCounter);
    }

    const counterObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || hasAnimated) return;

          hasAnimated = true;

          animateCounter({
            element: pointsCounter,
            target: 100,
            duration: 1600,
            decimals: 0,
            finalText: '100',
          });

          animateCounter({
            element: rewardsCounter,
            target: 1,
            duration: 1600,
            prefix: '$',
            decimals: 2,
            finalText: '$1',
          });

          observer.disconnect();
        });
      },
      {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    counterObserver.observe(counterSection);
  }

  /*
    ==================================================
    SAASQUATCH FORM
    ==================================================
  */

  function initSaaSQuatch() {
    window.squatchTenant = 'a9ftzd03ppwim';

    loadSaaSQuatchScript(function () {
      if (!window.squatch) {
        console.warn('Squatch is not loaded.');
        return;
      }

      window.squatch.ready(function () {
        const input = document.querySelector(
          'input[name="impact_referral_by"]'
        );

        if (!input) return;

        window.squatch
          .api()
          .squatchReferralCookie()
          .then(function (data) {
            const code = data && data.codes ? data.codes['23119'] : '';

            input.value = code || '';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          })
          .catch(console.error);
      });
    });
  }

  function loadSaaSQuatchScript(callback) {
    const existingScript = document.querySelector(
      'script[src*="fast.ssqt.io/squatch-js"]'
    );

    if (existingScript) {
      existingScript.addEventListener('load', callback, {
        once: true,
      });

      if (window.squatch) callback();

      return;
    }

    const script = document.createElement('script');

    script.src = 'https://fast.ssqt.io/squatch-js@2';
    script.async = true;

    script.onload = callback;

    document.head.appendChild(script);
  }

  /*
    ==================================================
    START
    ==================================================
  */

  function startRewardsReferralsJS() {
    initCardIcons();
    initRewardLadder();
    initRewardsCounters();
    initSaaSQuatch();

    const mutationObserver = new MutationObserver(function () {
      initCardIcons();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startRewardsReferralsJS);
  } else {
    startRewardsReferralsJS();
  }
})();
