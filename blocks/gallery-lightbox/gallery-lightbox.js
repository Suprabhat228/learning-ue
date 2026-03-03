
import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Field row order per gallery-item (matches models[].fields).
 *
 * EDS field-collapse rules applied:
 *   - imageAlt collapses into image → no separate row for imageAlt
 *
 * Effective rendered rows inside each block-item column:
 *   Row 0 — image   (picture > img, alt from imageAlt via field-collapse)
 *   Row 1 — caption (text)
 *   Row 2 — category (text)
 */

/**
 * Variant identifiers resolved from the block's class list.
 * A block may carry at most one layout variant and optionally
 * the 'filter' variant alongside any layout variant.
 */
const LAYOUT_VARIANTS = new Set(['masonry', 'uniform', 'hover']);
const DEFAULT_LAYOUT = 'uniform';

/**
 * Minimum swipe distance (px) to register a lightbox swipe gesture.
 */
const SWIPE_THRESHOLD = 50;

/**
 * Resolves the active layout variant and whether category filtering is enabled.
 *
 * @param {HTMLElement} block
 * @returns {{ layout: string, hasFilter: boolean }}
 */
function resolveVariants(block) {
  const classes = [...block.classList];
  const layout = classes.find((c) => LAYOUT_VARIANTS.has(c)) || DEFAULT_LAYOUT;
  const hasFilter = classes.includes('filter');
  return { layout, hasFilter };
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
 * Sanitises a category string into a consistent CSS-safe token.
 * Lowercases, trims, and replaces non-alphanumeric runs with hyphens.
 *
 * @param {string} raw
 * @returns {string}
 */
function toToken(raw) {
  return raw.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Builds the category filter bar from the unique categories found
 * across all gallery items. Returns null when fewer than two
 * distinct categories exist (filtering would be meaningless).
 *
 * @param {string[]} categories - raw category values from each item
 * @param {Function} onFilter   - callback(token|'all') called on selection
 * @returns {HTMLElement|null}
 */
function buildFilterBar(categories, onFilter) {
  const unique = [...new Set(categories.filter(Boolean))];
  // Guard: need at least one category to show the bar
  if (!unique.length) return null;

  const bar = document.createElement('div');
  bar.className = 'gallery-lightbox-filter-bar';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', 'Filter gallery by category');

  const allBtn = document.createElement('button');
  allBtn.className = 'gallery-lightbox-filter-btn gallery-lightbox-filter-btn--active';
  allBtn.setAttribute('type', 'button');
  allBtn.setAttribute('aria-pressed', 'true');
  allBtn.textContent = 'All';
  allBtn.dataset.filter = 'all';

  bar.append(allBtn);

  unique.forEach((cat) => {
    const btn = document.createElement('button');
    btn.className = 'gallery-lightbox-filter-btn';
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-pressed', 'false');
    btn.textContent = cat;
    btn.dataset.filter = toToken(cat);
    bar.append(btn);
  });

  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('.gallery-lightbox-filter-btn');
    if (!btn) return;

    // Update pressed states on all buttons
    bar.querySelectorAll('.gallery-lightbox-filter-btn').forEach((b) => {
      const active = b === btn;
      b.classList.toggle('gallery-lightbox-filter-btn--active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    onFilter(btn.dataset.filter);
  });

  return bar;
}

/**
 * Applies category filtering to gallery items.
 * Hidden items are removed from tab order via inert to prevent
 * keyboard users from reaching invisible content.
 *
 * @param {HTMLElement[]} items  - all .gallery-lightbox-item elements
 * @param {string}        filter - category token or 'all'
 */
function applyFilter(items, filter) {
  items.forEach((item) => {
    const match = filter === 'all' || item.dataset.category === filter;
    item.classList.toggle('gallery-lightbox-item--hidden', !match);
    // inert prevents focus reaching hidden items without display:none side-effects
    if (match) {
      item.removeAttribute('inert');
    } else {
      item.setAttribute('inert', '');
    }
  });
}

/**
 * Builds and manages the lightbox overlay.
 * Returns an object with an `open(index)` method.
 *
 * The lightbox is a single shared overlay — it is created once and
 * reused across all image clicks to avoid repeated DOM creation costs.
 *
 * @param {{ src: string, alt: string, caption: string }[]} slides
 * @returns {{ open: Function }}
 */
function buildLightbox(slides) {
  // Guard: no slides — return no-op to avoid errors downstream
  if (!slides.length) return { open: () => {} };

  let current = 0;
  let touchStartX = 0;

  // ── Overlay shell ────────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.className = 'gallery-lightbox-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Image lightbox');
  // Hidden by default — opened on demand
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('inert', '');

  // ── Close button ─────────────────────────────────────────────────
  const closeBtn = document.createElement('button');
  closeBtn.className = 'gallery-lightbox-close';
  closeBtn.setAttribute('type', 'button');
  closeBtn.setAttribute('aria-label', 'Close lightbox');
  closeBtn.innerHTML = '<span aria-hidden="true">&times;</span>';

  // ── Image stage ──────────────────────────────────────────────────
  const stage = document.createElement('div');
  stage.className = 'gallery-lightbox-stage';

  const img = document.createElement('img');
  img.className = 'gallery-lightbox-img';
  img.setAttribute('loading', 'lazy');

  const captionEl = document.createElement('p');
  captionEl.className = 'gallery-lightbox-caption';

  stage.append(img, captionEl);

  // ── Counter ──────────────────────────────────────────────────────
  const counter = document.createElement('span');
  counter.className = 'gallery-lightbox-counter';
  counter.setAttribute('aria-live', 'polite');
  counter.setAttribute('aria-atomic', 'true');

  // ── Navigation buttons ───────────────────────────────────────────
  const prevBtn = document.createElement('button');
  prevBtn.className = 'gallery-lightbox-nav gallery-lightbox-nav--prev';
  prevBtn.setAttribute('type', 'button');
  prevBtn.setAttribute('aria-label', 'Previous image');
  prevBtn.innerHTML = '<span aria-hidden="true">&#8592;</span>';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'gallery-lightbox-nav gallery-lightbox-nav--next';
  nextBtn.setAttribute('type', 'button');
  nextBtn.setAttribute('aria-label', 'Next image');
  nextBtn.innerHTML = '<span aria-hidden="true">&#8594;</span>';

  overlay.append(closeBtn, prevBtn, stage, counter, nextBtn);
  document.body.append(overlay);

  // ── Render slide ─────────────────────────────────────────────────
  function renderSlide(index) {
    const slide = slides[index];
    if (!slide) return;

    img.src = slide.src;
    img.alt = slide.alt || '';
    captionEl.textContent = slide.caption || '';
    captionEl.hidden = !slide.caption;
    counter.textContent = `${index + 1} / ${slides.length}`;

    // Hide prev/next when at boundaries (single-slide guard)
    prevBtn.disabled = slides.length <= 1;
    nextBtn.disabled = slides.length <= 1;
  }

  function goTo(index) {
    // Wrap-around: keeps navigation feeling infinite
    const total = slides.length;
    current = ((index % total) + total) % total;
    renderSlide(current);
  }

  // ── Open / Close ─────────────────────────────────────────────────
  let previousFocus = null;

  function open(index) {
    previousFocus = document.activeElement;
    current = index;
    renderSlide(current);
    overlay.removeAttribute('inert');
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('gallery-lightbox-overlay--visible');
    document.body.classList.add('gallery-lightbox-body--locked');
    // Move focus to close button for keyboard users
    closeBtn.focus();
  }

  function close() {
    overlay.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('inert', '');
    overlay.classList.remove('gallery-lightbox-overlay--visible');
    document.body.classList.remove('gallery-lightbox-body--locked');
    // Return focus to the triggering element
    previousFocus?.focus();
  }

  // ── Event listeners ──────────────────────────────────────────────
  closeBtn.addEventListener('click', close);

  // Click outside the stage to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Keyboard navigation
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    else if (e.key === 'ArrowRight') goTo(current + 1);
    else if (e.key === 'Escape') close();
  });

  // Touch/swipe support for mobile
  overlay.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  overlay.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta < 0) goTo(current + 1);
    else goTo(current - 1);
  }, { passive: true });

  // Focus trap: keep focus inside the lightbox while open
  overlay.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = [...overlay.querySelectorAll(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )];
    // Guard: no focusable elements (should never happen)
    if (!focusable.length) { e.preventDefault(); return; }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  return { open };
}

/**
 * Parses one EDS block-item column into a gallery item card.
 *
 * @param {HTMLElement} item        - instrumented EDS block-item column div
 * @param {number}      index       - 0-based index in the slide array
 * @param {string}      layout      - resolved layout variant
 * @param {Function}    openLightbox - callback(index) to open lightbox
 * @returns {{ el: HTMLElement, slide: object, category: string }}
 */
function buildGalleryItem(item, index, layout, openLightbox) {
  const rows = [...item.children];
  const [imageRow, captionRow, categoryRow] = rows;

  const picture = imageRow?.querySelector('picture');
  const img = picture?.querySelector('img');
  const caption = rowText(captionRow);
  const category = rowText(categoryRow);

  // ── Card element ─────────────────────────────────────────────────
  const card = document.createElement('div');
  card.className = 'gallery-lightbox-item';
  moveInstrumentation(item, card);

  // Attach category token for CSS and JS filtering
  if (category) {
    card.dataset.category = toToken(category);
  }

  // ── Image wrapper ─────────────────────────────────────────────────
  const imgWrapper = document.createElement('div');
  imgWrapper.className = 'gallery-lightbox-img-wrapper';

  if (picture && img) {
    // Build optimised picture for grid thumbnail
    const optimizedPic = createOptimizedPicture(
      img.src,
      img.alt || caption || '',
      false,
      [{ width: '600' }, { media: '(min-width: 900px)', width: '800' }],
    );
    const optimizedImg = optimizedPic.querySelector('img');
    moveInstrumentation(img, optimizedImg);
    optimizedImg.setAttribute('loading', 'lazy');
    optimizedImg.setAttribute('decoding', 'async');

    imgWrapper.append(optimizedPic);
  } else {
    // Guard: no image authored — render a placeholder to preserve layout
    const placeholder = document.createElement('div');
    placeholder.className = 'gallery-lightbox-placeholder';
    placeholder.setAttribute('aria-hidden', 'true');
    imgWrapper.append(placeholder);
  }

  // ── Hover overlay (shown in hover variant or on all items for lightbox) ──
  const hoverOverlay = document.createElement('div');
  hoverOverlay.className = 'gallery-lightbox-hover-overlay';
  hoverOverlay.setAttribute('aria-hidden', 'true');

  const zoomIcon = document.createElement('span');
  zoomIcon.className = 'gallery-lightbox-zoom-icon';
  zoomIcon.textContent = '+';

  hoverOverlay.append(zoomIcon);

  if (caption && layout === 'hover') {
    const hoverCaption = document.createElement('span');
    hoverCaption.className = 'gallery-lightbox-hover-caption';
    hoverCaption.textContent = caption;
    hoverOverlay.append(hoverCaption);
  }

  imgWrapper.append(hoverOverlay);
  card.append(imgWrapper);

  // ── Below-image caption (non-hover variants) ─────────────────────
  if (caption && layout !== 'hover') {
    const capEl = document.createElement('p');
    capEl.className = 'gallery-lightbox-item-caption';
    capEl.textContent = caption;
    card.append(capEl);
  }

  // ── Category label ───────────────────────────────────────────────
  if (category) {
    const catEl = document.createElement('span');
    catEl.className = 'gallery-lightbox-item-category';
    catEl.textContent = category;
    card.append(catEl);
  }

  // ── Click handler — open lightbox ────────────────────────────────
  // Make the card keyboard-accessible as a button-like element
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `View image${caption ? ': ' + caption : ''}`);

  const activate = () => openLightbox(index);
  card.addEventListener('click', activate);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activate();
    }
  });

  // ── Slide data for lightbox ───────────────────────────────────────
  const src = img?.src || '';
  const alt = img?.alt || caption || '';
  const slide = { src, alt, caption };

  // Clean up raw EDS rows
  imageRow?.remove();
  captionRow?.remove();
  categoryRow?.remove();

  return { el: card, slide, category };
}

export default function decorate(block) {
  const items = [...block.children];

  // Guard: no items — hide the section
  if (!items.length) {
    block.closest('.section')?.classList.add('gallery-lightbox-section--empty');
    return;
  }

  const { layout, hasFilter } = resolveVariants(block);

  // Add layout class to root so CSS knows which grid to apply
  block.classList.add(`gallery-lightbox--${layout}`);

  const slides = [];
  const cardEls = [];
  const categories = [];

  // ── Build lightbox with placeholder slides array ─────────────────
  // We pass the slides array by reference — it will be populated
  // as items are processed below, before any click can trigger open().
  const lightbox = buildLightbox(slides);

  // ── Build grid ───────────────────────────────────────────────────
  const grid = document.createElement('div');
  grid.className = 'gallery-lightbox-grid';

  items.forEach((item, index) => {
    const { el, slide, category } = buildGalleryItem(
      item,
      index,
      layout,
      (i) => lightbox.open(i),
    );

    slides.push(slide);
    cardEls.push(el);
    categories.push(category);
    grid.append(el);
  });

  // ── Category filter bar ──────────────────────────────────────────
  if (hasFilter) {
    const filterBar = buildFilterBar(categories, (token) => applyFilter(cardEls, token));
    if (filterBar) block.append(filterBar);
  }

  block.replaceChildren(...(hasFilter
    ? [block.querySelector('.gallery-lightbox-filter-bar'), grid].filter(Boolean)
    : [grid]));
}
