
import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Field row order per carousel-slide item (models[].fields).
 *
 * EDS field-collapse rules applied:
 *   - imageAlt       collapses into image        → no separate row
 *   - linkTitle      collapses into link anchor   → no separate row
 *   - linkText       collapses into link anchor   → no separate row
 *   - linkType       collapses into link anchor   → no separate row
 *   - thumbnailAlt   collapses into thumbnail     → no separate row
 *
 * Effective rendered rows inside each block-item column:
 *   Row 0 — image       (picture > img, alt from imageAlt)
 *   Row 1 — heading     (text)
 *   Row 2 — description (richtext)
 *   Row 3 — link        (<a href title>linkText</a>, type in class)
 *   Row 4 — price       (text)
 *   Row 5 — thumbnail   (picture > img, alt from thumbnailAlt)
 */

/** Variants recognized from block class list. */
const VARIANTS = new Set(['auto-play', 'manual', 'thumbnail-nav', 'full-screen', 'product']);

/** Default autoplay interval in milliseconds. */
const AUTOPLAY_INTERVAL = 5000;

/** Touch/pointer drag threshold in pixels before a swipe is registered. */
const SWIPE_THRESHOLD = 50;

/**
 * Resolves the active variant.
 * Falls back to 'manual' when no recognized variant class is present.
 *
 * @param {HTMLElement} block
 * @returns {string}
 */
function resolveVariant(block) {
  return [...block.classList].find((c) => VARIANTS.has(c)) || 'manual';
}

/**
 * Extracts trimmed text from a row element.
 * Guards against null/undefined rows.
 *
 * @param {HTMLElement|undefined} row
 * @returns {string}
 */
function rowText(row) {
  return row ? row.textContent.trim() : '';
}

/**
 * Extracts the EDS field-collapsed anchor element from a link row.
 * Returns null when the row is absent or contains no usable href.
 *
 * @param {HTMLElement|undefined} row
 * @returns {HTMLAnchorElement|null}
 */
function extractAnchor(row) {
  if (!row) return null;
  const a = row.querySelector('a[href]');
  if (!a || !a.getAttribute('href')?.trim()) return null;
  return a;
}

/**
 * Extracts and optimizes a picture element from a row.
 * Returns null when the row contains no picture/img.
 *
 * @param {HTMLElement|undefined} row
 * @param {string}  alt
 * @param {boolean} eager  - true for the first (above-the-fold) slide
 * @param {Array}   widths
 * @returns {HTMLPictureElement|null}
 */
function extractPicture(row, alt, eager, widths) {
  if (!row) return null;
  const img = row.querySelector('img');
  if (!img) return null;

  const src = img.src || img.getAttribute('data-src') || '';
  if (!src) return null;

  const optimized = createOptimizedPicture(src, alt || img.alt || '', eager, widths);
  // Migrate instrumentation from the original img to the new one
  moveInstrumentation(img, optimized.querySelector('img'));
  return optimized;
}

/**
 * Builds a CTA button/anchor from an EDS-collapsed anchor element.
 * Applies the linkType class as a style modifier.
 *
 * @param {HTMLAnchorElement|null} anchor
 * @returns {HTMLAnchorElement|null}
 */
function buildCta(anchor) {
  if (!anchor) return null;

  const cta = document.createElement('a');
  cta.href = anchor.href;

  const title = anchor.getAttribute('title');
  if (title) cta.setAttribute('title', title);

  const text = anchor.textContent.trim();
  cta.textContent = text || 'Learn More';

  // Extract linkType from anchor classes set by EDS field-collapse
  const typeClass = [...anchor.classList].find((c) =>
    ['primary', 'secondary', 'outline'].includes(c)
  );
  cta.className = [
    'carousel-slider-cta',
    typeClass ? `carousel-slider-cta--${typeClass}` : 'carousel-slider-cta--primary',
  ].join(' ');

  return cta;
}

/**
 * Parses one EDS block-item column into a fully decorated slide element.
 * All field rows are guarded against absent/empty content.
 *
 * @param {HTMLElement} item     - instrumented EDS block-item column
 * @param {string}      variant
 * @param {number}      index    - 0-based slide index
 * @returns {{ slide: HTMLElement, thumb: HTMLPictureElement|null }}
 */
function buildSlide(item, variant, index) {
  const rows = [...item.children];
  const [imageRow, headingRow, descriptionRow, linkRow, priceRow, thumbnailRow] = rows;

  const isEager = index === 0;

  /* =========================
     IMAGE
  ========================== */

  let picture = null;
  if (imageRow) {
    const img = imageRow.querySelector('img');
    if (img) {
      picture = createOptimizedPicture(
        img.src,
        img.alt || '',
        isEager,
        variant === 'full-screen'
          ? [{ width: '2000' }, { width: '1200' }, { width: '750' }]
          : [{ width: '1200' }, { width: '750' }, { width: '400' }]
      );

      const optimizedImg = picture.querySelector('img');

      // 🔥 Preserve UE instrumentation
      moveInstrumentation(img, optimizedImg);
    }
  }

  /* =========================
     THUMBNAIL
  ========================== */

  let thumbPicture = null;
  if (thumbnailRow) {
    const thumbImg = thumbnailRow.querySelector('img');
    if (thumbImg) {
      thumbPicture = createOptimizedPicture(
        thumbImg.src,
        thumbImg.alt || '',
        false,
        [{ width: '120' }]
      );

      const optimizedThumb = thumbPicture.querySelector('img');

      // 🔥 Preserve instrumentation
      moveInstrumentation(thumbImg, optimizedThumb);
    }
  }

  /* =========================
     CTA
  ========================== */

  let cta = null;
  if (linkRow) {
    const anchor = linkRow.querySelector('a[href]');
    if (anchor && anchor.getAttribute('href')?.trim()) {
      cta = document.createElement('a');
      cta.href = anchor.href;
      cta.textContent = anchor.textContent.trim() || 'Learn More';

      const title = anchor.getAttribute('title');
      if (title) cta.setAttribute('title', title);

      const typeClass = [...anchor.classList].find((c) =>
        ['primary', 'secondary', 'outline'].includes(c)
      );

      cta.className = [
        'carousel-slider-cta',
        typeClass
          ? `carousel-slider-cta--${typeClass}`
          : 'carousel-slider-cta--primary',
      ].join(' ');

      // 🔥 VERY IMPORTANT
      moveInstrumentation(anchor, cta);
    }
  }

  /* =========================
     SLIDE WRAPPER
  ========================== */

  const slide = document.createElement('li');
  slide.className = 'carousel-slider-slide';
  slide.setAttribute('role', 'tabpanel');
  slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');

  // 🔥 Move instrumentation from block-item column
  moveInstrumentation(item, slide);

  /* =========================
     IMAGE WRAPPER
  ========================== */

  if (picture) {
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'carousel-slider-image';
    imageWrapper.append(picture);
    slide.append(imageWrapper);
  }

  /* =========================
     CONTENT WRAPPER
  ========================== */

  const content = document.createElement('div');
  content.className = 'carousel-slider-content';

  // HEADING
  if (headingRow?.textContent.trim()) {
    const h = document.createElement(
      variant === 'product' ? 'h3' : 'h2'
    );
    h.className = 'carousel-slider-heading';
    h.textContent = headingRow.textContent.trim();

    // 🔥 Preserve instrumentation
    moveInstrumentation(headingRow, h);

    content.append(h);
  }

  // PRICE
  if (variant === 'product' && priceRow?.textContent.trim()) {
    const priceEl = document.createElement('p');
    priceEl.className = 'carousel-slider-price';
    priceEl.textContent = priceRow.textContent.trim();

    // 🔥 Preserve instrumentation
    moveInstrumentation(priceRow, priceEl);

    content.append(priceEl);
  }

  // DESCRIPTION
  if (descriptionRow) {
    descriptionRow.classList.add('carousel-slider-description');

    // 🔥 Preserve instrumentation automatically since we append original node
    content.append(descriptionRow);
  }

  // CTA
  if (cta) content.append(cta);

  if (content.children.length) {
    slide.append(content);
  }

  /* =========================
     CLEANUP ORIGINAL ROWS
     (Only after instrumentation moved)
  ========================== */

  imageRow?.remove();
  headingRow?.remove();
  linkRow?.remove();
  priceRow?.remove();
  thumbnailRow?.remove();

  return { slide, thumb: thumbPicture };
}

/**
 * Determines whether a richtext row has meaningful content.
 *
 * @param {HTMLElement|undefined} row
 * @returns {boolean}
 */
function hasRichContent(row) {
  if (!row) return false;
  if (row.textContent.trim()) return true;
  return Boolean(row.querySelector('ul,ol,img,picture,strong,em,a,table'));
}

/**
 * Wires up all carousel interactivity: navigation buttons, dot indicators,
 * thumbnail nav, touch/pointer swipe, keyboard control, autoplay,
 * reduced-motion support, and visibility-based pause.
 *
 * @param {HTMLElement}   block
 * @param {HTMLElement[]} slides
 * @param {string}        variant
 * @param {Array<HTMLPictureElement|null>} thumbs
 */
function initCarousel(block, slides, variant, thumbs) {
  const total = slides.length;
  // Guard: single slide needs no carousel controls
  if (total < 2) return;

  let current = 0;
  let autoplayTimer = null;
  let isAnimating = false;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isAutoPlay = variant === 'auto-play';

  // ── State machine ────────────────────────────────────────────────
  /**
   * Transitions to a target slide index.
   * Guards against rapid repeated calls via isAnimating flag.
   *
   * @param {number} targetIndex
   * @param {'next'|'prev'|'jump'} direction
   */
  function goTo(targetIndex, direction = 'jump') {
    // Guard: no-op if already on this slide or mid-transition
    if (targetIndex === current || isAnimating) return;

    const prev = current;
    // Wrap-around: keep index within [0, total-1]
    current = ((targetIndex % total) + total) % total;

    isAnimating = true;

    // Update slides
    slides[prev].classList.remove('carousel-slider-slide--active');
    slides[prev].classList.add(
      direction === 'next' ? 'carousel-slider-slide--exit-left' : 'carousel-slider-slide--exit-right',
    );
    slides[prev].setAttribute('aria-hidden', 'true');

    slides[current].classList.add(
      direction === 'next' ? 'carousel-slider-slide--enter-right' : 'carousel-slider-slide--enter-left',
    );

    // Trigger reflow so enter class is painted before active class
    // eslint-disable-next-line no-unused-expressions
    slides[current].offsetWidth;

    slides[current].classList.add('carousel-slider-slide--active');
    slides[current].classList.remove(
      'carousel-slider-slide--enter-right',
      'carousel-slider-slide--enter-left',
    );
    slides[current].setAttribute('aria-hidden', 'false');

    // Clean exit classes after transition
    const duration = prefersReducedMotion ? 0 : 420;
    setTimeout(() => {
      slides[prev].classList.remove(
        'carousel-slider-slide--exit-left',
        'carousel-slider-slide--exit-right',
      );
      isAnimating = false;
    }, duration);

    // Sync dots
    syncDots();
    // Sync thumbnails
    syncThumbs();
    // Update live region label
    updateLiveRegion();
  }

  function goNext() { goTo(current + 1, 'next'); }
  function goPrev() { goTo(current - 1, 'prev'); }

  // ── Activate first slide ─────────────────────────────────────────
  slides[0].classList.add('carousel-slider-slide--active');

  // ── Build track wrapper ──────────────────────────────────────────
  const track = document.createElement('ul');
  track.className = 'carousel-slider-track';
  track.setAttribute('role', 'list');
  slides.forEach((s) => track.append(s));

  // ── Viewport ─────────────────────────────────────────────────────
  const viewport = document.createElement('div');
  viewport.className = 'carousel-slider-viewport';
  // aria-live polite: announce slide label changes to screen readers
  viewport.setAttribute('aria-live', 'polite');
  viewport.setAttribute('aria-atomic', 'false');
  viewport.setAttribute('aria-roledescription', 'carousel');
  viewport.setAttribute('aria-label', 'Content slider');
  viewport.append(track);

  // ── Live region (screen-reader announcer) ────────────────────────
  const liveRegion = document.createElement('div');
  liveRegion.className = 'carousel-slider-sr-only';
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');

  function updateLiveRegion() {
    const label = slides[current].getAttribute('aria-label') || `Slide ${current + 1}`;
    liveRegion.textContent = `${label} — ${current + 1} of ${total}`;
  }

  // ── Navigation arrows ────────────────────────────────────────────
  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'carousel-slider-btn carousel-slider-btn--prev';
  prevBtn.setAttribute('aria-label', 'Previous slide');
  prevBtn.innerHTML = '<span aria-hidden="true">&#8592;</span>';

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'carousel-slider-btn carousel-slider-btn--next';
  nextBtn.setAttribute('aria-label', 'Next slide');
  nextBtn.innerHTML = '<span aria-hidden="true">&#8594;</span>';

  prevBtn.addEventListener('click', () => { stopAutoplay(); goPrev(); });
  nextBtn.addEventListener('click', () => { stopAutoplay(); goNext(); });

  // ── Dot indicators ───────────────────────────────────────────────
  const dotsWrapper = document.createElement('div');
  dotsWrapper.className = 'carousel-slider-dots';
  dotsWrapper.setAttribute('role', 'tablist');
  dotsWrapper.setAttribute('aria-label', 'Slide navigation');

  const dots = slides.map((slide, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-slider-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => { stopAutoplay(); goTo(i, i > current ? 'next' : 'prev'); });
    dotsWrapper.append(dot);
    return dot;
  });

  dots[0].classList.add('carousel-slider-dot--active');

  function syncDots() {
    dots.forEach((dot, i) => {
      dot.classList.toggle('carousel-slider-dot--active', i === current);
      dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });
  }

  // ── Thumbnail navigation ─────────────────────────────────────────
  let thumbsWrapper = null;

  if (variant === 'thumbnail-nav' && thumbs.some(Boolean)) {
    thumbsWrapper = document.createElement('div');
    thumbsWrapper.className = 'carousel-slider-thumbs';
    thumbsWrapper.setAttribute('role', 'tablist');
    thumbsWrapper.setAttribute('aria-label', 'Slide thumbnails');

    thumbs.forEach((thumb, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'carousel-slider-thumb-btn';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', `Preview slide ${i + 1}`);
      btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');

      if (thumb) {
        btn.append(thumb);
      } else {
        // Fallback when no thumbnail image was authored
        const fallback = document.createElement('span');
        fallback.className = 'carousel-slider-thumb-fallback';
        fallback.textContent = String(i + 1);
        btn.append(fallback);
      }

      btn.addEventListener('click', () => {
        stopAutoplay();
        goTo(i, i > current ? 'next' : 'prev');
        syncThumbBtns(i);
      });

      thumbsWrapper.append(btn);
    });
  }

  function syncThumbBtns(index) {
    if (!thumbsWrapper) return;
    [...thumbsWrapper.querySelectorAll('.carousel-slider-thumb-btn')].forEach((btn, i) => {
      btn.classList.toggle('carousel-slider-thumb-btn--active', i === index);
      btn.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
  }

  function syncThumbs() { syncThumbBtns(current); }
  syncThumbBtns(0);

  // ── Touch / Pointer swipe ────────────────────────────────────────
  let pointerStartX = null;
  let pointerStartY = null;
  let isDragging = false;

  viewport.addEventListener('pointerdown', (e) => {
    // Only track primary pointer (finger or mouse button 0)
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    pointerStartX = e.clientX;
    pointerStartY = e.clientY;
    isDragging = true;
    viewport.setPointerCapture(e.pointerId);
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!isDragging || pointerStartX === null) return;
    // Prevent page scroll when horizontal drag is clearly intended
    const dx = Math.abs(e.clientX - pointerStartX);
    const dy = Math.abs(e.clientY - pointerStartY);
    if (dx > dy && dx > 10) e.preventDefault();
  }, { passive: false });

  viewport.addEventListener('pointerup', (e) => {
    if (!isDragging || pointerStartX === null) return;
    isDragging = false;

    const dx = e.clientX - pointerStartX;
    const dy = Math.abs(e.clientY - (pointerStartY ?? e.clientY));

    // Guard: ignore mostly-vertical swipes (user scrolling, not swiping)
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > dy) {
      stopAutoplay();
      if (dx < 0) goNext();
      else goPrev();
    }

    pointerStartX = null;
    pointerStartY = null;
  });

  viewport.addEventListener('pointercancel', () => {
    isDragging = false;
    pointerStartX = null;
    pointerStartY = null;
  });

  // ── Keyboard navigation ──────────────────────────────────────────
  viewport.setAttribute('tabindex', '0');
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { stopAutoplay(); goPrev(); }
    else if (e.key === 'ArrowRight') { stopAutoplay(); goNext(); }
    else if (e.key === 'Home') { stopAutoplay(); goTo(0, 'prev'); }
    else if (e.key === 'End') { stopAutoplay(); goTo(total - 1, 'next'); }
  });

  // ── Autoplay ─────────────────────────────────────────────────────
  function startAutoplay() {
    // Guard: don't stack multiple timers
    if (autoplayTimer || !isAutoPlay) return;
    autoplayTimer = setInterval(goNext, AUTOPLAY_INTERVAL);
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  // Pause on hover and focus
  block.addEventListener('mouseenter', stopAutoplay);
  block.addEventListener('mouseleave', () => { if (isAutoPlay) startAutoplay(); });
  block.addEventListener('focusin', stopAutoplay);
  block.addEventListener('focusout', () => { if (isAutoPlay) startAutoplay(); });

  // Pause when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay();
    else if (isAutoPlay) startAutoplay();
  });

  // Only autoplay if motion is not reduced
  if (isAutoPlay && !prefersReducedMotion) startAutoplay();

  // ── Assemble DOM ─────────────────────────────────────────────────
  const controls = document.createElement('div');
  controls.className = 'carousel-slider-controls';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Slider controls');
  controls.append(prevBtn, dotsWrapper, nextBtn);

  block.append(viewport, controls, liveRegion);
  if (thumbsWrapper) block.append(thumbsWrapper);

  updateLiveRegion();
}

export default function decorate(block) {

  if (block.dataset.carouselDecorated) return;
  block.dataset.carouselDecorated = 'true';

  const variant = resolveVariant(block);
  const items = [...block.children];

  // Guard: no slides authored — hide the containing section
  if (!items.length) {
    block.closest('.section')?.classList.add('carousel-slider-section--empty');
    return;
  }

  const slides = [];
  const thumbs = [];

  items.forEach((item, index) => {
    const { slide, thumb } = buildSlide(item, variant, index);
    slides.push(slide);
    thumbs.push(thumb);
  });

  // Clear EDS-generated columns before rebuilding
  block.replaceChildren();

  // Carousel requires at least one slide
  if (!slides.length) return;

  initCarousel(block, slides, variant, thumbs);
}
