/* ============================================
   Mercado Livre Clone - JavaScript
   ============================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initCarousel();
  initProductSliders();
  initCategoriesDropdown();
  initSearchAutocomplete();
  initCartBadge();
});

/* ============================================
   Hero Banner Carousel
   ============================================ */
function initCarousel() {
  const track = document.getElementById('carousel-track');
  const slides = track ? track.querySelectorAll('.carousel__slide') : [];
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dots = document.querySelectorAll('.carousel__dot');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  let autoplayTimer = null;

  function goToSlide(index) {
    // Wrap around
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    currentIndex = index;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('carousel__dot--active', i === currentIndex);
      dot.setAttribute('aria-selected', String(i === currentIndex));
    });
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => goToSlide(currentIndex + 1), 5000);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToSlide(currentIndex - 1);
      stopAutoplay();
      startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToSlide(currentIndex + 1);
      stopAutoplay();
      startAutoplay();
    });
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.getAttribute('data-index'), 10);
      goToSlide(index);
      stopAutoplay();
      startAutoplay();
    });
  });

  // Keyboard navigation
  document.getElementById('hero-carousel')?.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goToSlide(currentIndex - 1);
    if (e.key === 'ArrowRight') goToSlide(currentIndex + 1);
  });

  // Touch / swipe support
  const carousel = document.getElementById('hero-carousel');
  if (carousel) {
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        goToSlide(diff > 0 ? currentIndex + 1 : currentIndex - 1);
        stopAutoplay();
        startAutoplay();
      }
    }, { passive: true });
  }

  startAutoplay();
}

/* ============================================
   Horizontal Product Sliders
   ============================================ */
function initProductSliders() {
  const sliders = document.querySelectorAll('.products-slider');

  sliders.forEach((slider) => {
    const track = slider.querySelector('.products-slider__track');
    const prevBtn = slider.querySelector('.products-slider__control--prev');
    const nextBtn = slider.querySelector('.products-slider__control--next');

    if (!track) return;

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const card = track.querySelector('.product-card');
        const scrollAmount = card ? card.offsetWidth + 12 : 212;
        track.scrollBy({ left: -scrollAmount * 2, behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const card = track.querySelector('.product-card');
        const scrollAmount = card ? card.offsetWidth + 12 : 212;
        track.scrollBy({ left: scrollAmount * 2, behavior: 'smooth' });
      });
    }

    // Show/hide controls based on scroll position
    function updateControls() {
      if (!prevBtn || !nextBtn) return;
      prevBtn.style.opacity = track.scrollLeft > 10 ? '1' : '0.4';
      prevBtn.style.pointerEvents = track.scrollLeft > 10 ? 'auto' : 'none';
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 10;
      nextBtn.style.opacity = atEnd ? '0.4' : '1';
      nextBtn.style.pointerEvents = atEnd ? 'none' : 'auto';
    }

    track.addEventListener('scroll', updateControls, { passive: true });
    updateControls();
  });
}

/* ============================================
   Categories Dropdown
   ============================================ */
function initCategoriesDropdown() {
  const menuWrapper = document.getElementById('categories-menu');
  if (!menuWrapper) return;

  const btn = menuWrapper.querySelector('.subheader__nav-btn');
  const menu = menuWrapper.querySelector('.dropdown-menu');

  if (!btn || !menu) return;

  function openMenu() {
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.hidden ? openMenu() : closeMenu();
  });

  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      menu.hidden ? openMenu() : closeMenu();
    }
    if (e.key === 'Escape') closeMenu();
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!menuWrapper.contains(e.target)) closeMenu();
  });

  // Close on Escape anywhere
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

/* ============================================
   Search Autocomplete
   ============================================ */
function initSearchAutocomplete() {
  const input = document.getElementById('search-input');
  const list = document.getElementById('autocomplete-list');

  if (!input || !list) return;

  const suggestions = [
    'Celular Samsung',
    'Celular iPhone',
    'Notebook gamer',
    'Notebook Dell',
    'Televisão 55 polegadas',
    'Televisão 4K',
    'Tênis Nike',
    'Tênis Adidas',
    'Fone bluetooth',
    'Smart watch',
    'Cadeira gamer',
    'Air fryer',
    'Micro-ondas',
    'Geladeira',
    'Máquina de lavar',
    'Bicicleta elétrica',
    'PS5',
    'Xbox Series X',
    'Monitor gamer',
    'Sofá',
  ];

  let debounceTimer = null;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = input.value.trim().toLowerCase();

      if (query.length < 2) {
        hideList();
        return;
      }

      const matches = suggestions.filter((s) => s.toLowerCase().includes(query)).slice(0, 6);

      if (matches.length === 0) {
        hideList();
        return;
      }

      list.innerHTML = matches
        .map(
          (match) => `
          <li role="option" tabindex="0" data-value="${escapeHtml(match)}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            ${escapeHtml(match)}
          </li>`
        )
        .join('');

      list.hidden = false;

      list.querySelectorAll('li').forEach((item) => {
        item.addEventListener('click', () => {
          input.value = item.getAttribute('data-value') || '';
          hideList();
        });

        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            input.value = item.getAttribute('data-value') || '';
            hideList();
          }
        });
      });
    }, 150);
  });

  input.addEventListener('blur', () => {
    setTimeout(hideList, 200);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideList();
  });

  function hideList() {
    list.hidden = true;
    list.innerHTML = '';
  }

  // Prevent XSS in autocomplete
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

/* ============================================
   Cart Badge (demo increment)
   ============================================ */
function initCartBadge() {
  const cartLinks = document.querySelectorAll('.header__nav-link--cart');
  const badge = document.getElementById('cart-badge');

  if (!badge) return;

  let count = 0;

  cartLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      count = (count + 1) % 10;
      badge.textContent = String(count);
      badge.style.display = count === 0 ? 'none' : 'flex';
    });
  });

  // Initially hide badge if 0
  badge.style.display = count === 0 ? 'none' : 'flex';
}
