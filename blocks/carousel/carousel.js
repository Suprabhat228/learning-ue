
import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Returns the index of the currently active slide.
 * Falls back to 0 if no active slide is found (edge case guard).
 */
function getActiveIndex(track) {
  const slides = [...track.querySelectorAll('.carousel-slide')];
  const idx = slides.findIndex((s) => s.getAttribute('aria-hidden') === 'false');
  return idx >= 0 ? idx : 0;
}

/**
 * Moves the carousel to a target slide index.
 * Clamps index to valid range to prevent out-of-bound access.
 */
function goToSlide(track, dotsContainer, index) {
  const slides = [...track.querySelectorAll('.carousel-slide')];
  if (!slides.length) return;

  // Clamp index within valid bounds
  const clamped = Math.max(0, Math.min(index, slides.length - 1));

  slides.forEach((slide, i) => {
    const isActive = i === clamped;
    slide.setAttribute('aria-hidden', String(!isActive));
    slide.classList.toggle('is-active', isActive);
  });

  // Sync dot indicators
  if (dotsContainer) {
    [...dotsContainer.querySelectorAll('.carousel-dot')].forEach((dot, i) => {
      const isActive = i === clamped;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  // Scroll the track so the active slide is in view
  const activeSlide = slides[clamped];
  if (activeSlide) {
    track.scrollTo({ left: activeSlide.offsetLeft, behavior: 'smooth' });
  }
}

/**
 * Builds navigation arrow buttons for the carousel.
 */
function buildNavButtons(track, dotsContainer) {
  const prev = document.createElement('button');
  prev.className = 'carousel-btn carousel-btn-prev';
  prev.setAttribute('aria-label', 'Previous slide');
  prev.setAttribute('type', 'button');
  prev.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>`;

  const next = document.createElement('button');
  next.className = 'carousel-btn carousel-btn-next';
  next.setAttribute('aria-label', 'Next slide');
  next.setAttribute('type', 'button');
  next.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
  </svg>`;

  prev.addEventListener('click', () => {
    const slides = [...track.querySelectorAll('.carousel-slide')];
    const current = getActiveIndex(track);
    // Wrap around to the last slide when at the beginning
    goToSlide(track, dotsContainer, current === 0 ? slides.length - 1 : current - 1);
  });

  next.addEventListener('click', () => {
    const slides = [...track.querySelectorAll('.carousel-slide')];
    const current = getActiveIndex(track);
    // Wrap around to the first slide when at the end
    goToSlide(track, dotsContainer, current === slides.length - 1 ? 0 : current + 1);
  });

  return { prev, next };
}

/**
 * Builds the dot indicator list for the carousel.
 */
function buildDots(count, track) {
  if (count <= 1) return null;

  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'carousel-dots';
  dotsContainer.setAttribute('role', 'tablist');
  dotsContainer.setAttribute('aria-label', 'Slide indicators');

  for (let i = 0; i < count; i += 1) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('type', 'button');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.setAttribute('aria-current', i === 0 ? 'true' : 'false');
    if (i === 0) dot.classList.add('is-active');

    dot.addEventListener('click', () => goToSlide(track, dotsContainer, i));
    dotsContainer.append(dot);
  }

  return dotsContainer;
}

/**
 * Sets up keyboard navigation for the carousel.
 * Left/Right arrow keys navigate between slides.
 */
function setupKeyboardNav(block, track, dotsContainer) {
  block.addEventListener('keydown', (e) => {
    const slides = [...track.querySelectorAll('.carousel-slide')];
    if (!slides.length) return;
    const current = getActiveIndex(track);

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToSlide(track, dotsContainer, current === 0 ? slides.length - 1 : current - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToSlide(track, dotsContainer, current === slides.length - 1 ? 0 : current + 1);
    }
  });
}

/**
 * Sets up autoplay with pause-on-hover and pause-on-focus behaviour.
 * Respects the prefers-reduced-motion media query for accessibility.
 */
function setupAutoplay(block, track, dotsContainer, intervalMs = 5000) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  let timer = null;

  function play() {
    timer = setInterval(() => {
      const slides = [...track.querySelectorAll('.carousel-slide')];
      const current = getActiveIndex(track);
      goToSlide(track, dotsContainer, current === slides.length - 1 ? 0 : current + 1);
    }, intervalMs);
  }

  function pause() {
    clearInterval(timer);
    timer = null;
  }

  play();

  block.addEventListener('mouseenter', pause);
  block.addEventListener('mouseleave', play);
  block.addEventListener('focusin', pause);
  block.addEventListener('focusout', (e) => {
    // Only resume if focus left the block entirely
    if (!block.contains(e.relatedTarget)) play();
  });
}

/**
 * Extracts slide content from the raw EDS-generated column structure.
 *
 * EDS renders block-items as direct children (columns) of the block root.
 * Each column contains rows corresponding to each field in the model:
 *   Row 0: image (picture element — field-collapsed with imageAlt)
 *   Row 1: eyebrow (text)
 *   Row 2: title (text)
 *   Row 3: description (richtext)
 *   Row 4: link (anchor — field-collapsed with linkText, linkTitle)
 */
function buildSlide(column, slideIndex) {
  const rows = [...column.children];

  // Guard: a slide must have at least an image or title to be meaningful
  if (!rows.length) return null;

  const slide = document.createElement('div');
  slide.className = 'carousel-slide';
  slide.setAttribute('role', 'tabpanel');
  slide.setAttribute('aria-label', `Slide ${slideIndex + 1}`);
  // First slide is visible, rest are hidden
  slide.setAttribute('aria-hidden', slideIndex === 0 ? 'false' : 'true');
  if (slideIndex === 0) slide.classList.add('is-active');

  // --- Image (Row 0) ---
  const imageRow = rows[0];
  if (imageRow) {
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'carousel-slide-image';
    const picture = imageRow.querySelector('picture');
    if (picture) {
      imageWrapper.append(picture);
    }
    slide.append(imageWrapper);
  }

  // --- Content overlay ---
  const content = document.createElement('div');
  content.className = 'carousel-slide-content';

  // Eyebrow (Row 1)
  const eyebrowRow = rows[1];
  if (eyebrowRow) {
    const eyebrowText = eyebrowRow.textContent.trim();
    if (eyebrowText) {
      const eyebrow = document.createElement('span');
      eyebrow.className = 'carousel-slide-eyebrow';
      eyebrow.textContent = eyebrowText;
      content.append(eyebrow);
    }
  }

  // Title (Row 2)
  const titleRow = rows[2];
  if (titleRow) {
    const titleText = titleRow.textContent.trim();
    if (titleText) {
      const heading = document.createElement('h2');
      heading.className = 'carousel-slide-title';
      heading.textContent = titleText;
      content.append(heading);
    }
  }

  // Description (Row 3)
  const descRow = rows[3];
  if (descRow) {
    const descContent = descRow.innerHTML.trim();
    if (descContent) {
      const desc = document.createElement('div');
      desc.className = 'carousel-slide-description';
      desc.innerHTML = descContent;
      content.append(desc);
    }
  }

  // CTA Link (Row 4) — field-collapsed: renders as <a> with href, title, text
  const linkRow = rows[4];
  if (linkRow) {
    const anchor = linkRow.querySelector('a');
    if (anchor && anchor.href) {
      const ctaWrapper = document.createElement('div');
      ctaWrapper.className = 'carousel-slide-cta';
      anchor.className = 'carousel-cta-btn';
      ctaWrapper.append(anchor);
      content.append(ctaWrapper);
    }
  }

  slide.append(content);
  return slide;
}

export default function decorate(block) {
  const columns = [...block.children];

  // Edge case: no slides authored — render a minimal empty state
  if (!columns.length) {
    block.innerHTML = '<p class="carousel-empty">No slides have been added to this carousel.</p>';
    return;
  }

  // Build the carousel wrapper structure
  const carousel = document.createElement('div');
  carousel.className = 'carousel-container';
  carousel.setAttribute('role', 'region');
  carousel.setAttribute('aria-label', 'Image carousel');
  carousel.setAttribute('aria-roledescription', 'carousel');
  carousel.setAttribute('tabindex', '0');

  const track = document.createElement('div');
  track.className = 'carousel-track';

  const slides = [];

  columns.forEach((column, i) => {
    // Migrate Universal Editor instrumentation from the original column to
    // the new slide element so authors can still click-to-edit in UE.
    const slide = buildSlide(column, i);
    if (!slide) return;

    moveInstrumentation(column, slide);
    slides.push(slide);
    track.append(slide);
  });

  // Edge case: all columns produced empty/invalid slides
  if (!slides.length) {
    block.innerHTML = '<p class="carousel-empty">No valid slides found. Please add slide content.</p>';
    return;
  }

  // Build dot indicators first so nav buttons can reference the container
  const dotsContainer = buildDots(slides.length, track);

  const { prev, next } = buildNavButtons(track, dotsContainer);

  carousel.append(prev, track, next);

  // Optimise images after DOM is assembled
  track.querySelectorAll('picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [
      { width: '600' },
      { media: '(min-width: 600px)', width: '1200' },
      { media: '(min-width: 900px)', width: '1600' },
    ]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });

  // Replace raw EDS columns with the built carousel
  block.replaceChildren(carousel);

  if (dotsContainer) {
    block.append(dotsContainer);
  }

  // Wire up keyboard and autoplay after full DOM is in place
  setupKeyboardNav(block, track, dotsContainer);
  setupAutoplay(block, track, dotsContainer, 5000);
}
