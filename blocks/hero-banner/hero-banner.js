
import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/* ─── Constants ─────────────────────────────────────────── */
const VALID_VARIANTS = ['text-only', 'image-bg', 'video-bg', 'split', 'gradient', 'carousel'];
const AUTOPLAY_INTERVAL = 5000;
const CAROUSEL_TRANSITION_MS = 500;

/* ─── Helpers ────────────────────────────────────────────── */

/**
 * Safely extract text content from a cell div by index.
 * Returns empty string when the cell is missing to avoid null errors.
 */
function getCellText(block, index) {
  const cell = block.querySelector(`:scope > div:nth-child(${index}) > div`);
  return cell ? cell.textContent.trim() : '';
}

/**
 * Safely extract innerHTML from a cell div by index.
 */
function getCellHtml(block, index) {
  const cell = block.querySelector(`:scope > div:nth-child(${index}) > div`);
  return cell ? cell.innerHTML.trim() : '';
}

/**
 * Extract an anchor element from a cell by index (field-collapse renders <a>).
 * Returns null when the anchor is absent.
 */
function getCellAnchor(block, index) {
  return block.querySelector(`:scope > div:nth-child(${index}) > div > a`) || null;
}

/**
 * Extract a picture element from a cell by index.
 */
function getCellPicture(block, index) {
  return block.querySelector(`:scope > div:nth-child(${index}) > div > picture`) || null;
}

/**
 * Build a CTA <a> element with appropriate class and attributes.
 * Returns null if href is missing so callers can guard safely.
 */
function buildCta(anchor, className) {
  if (!anchor || !anchor.href) return null;
  const a = document.createElement('a');
  a.href = anchor.href;
  if (anchor.title) a.title = anchor.title;
  a.textContent = anchor.textContent.trim() || anchor.href;
  a.className = className;
  return a;
}

/**
 * Build the CTA action row. Returns null when both CTAs are absent.
 */
function buildActions(primaryAnchor, secondaryAnchor) {
  const primaryCta = buildCta(primaryAnchor, 'hero-banner-cta hero-banner-cta--primary');
  const secondaryCta = buildCta(secondaryAnchor, 'hero-banner-cta hero-banner-cta--secondary');

  if (!primaryCta && !secondaryCta) return null;

  const actions = document.createElement('div');
  actions.className = 'hero-banner-actions';
  if (primaryCta) actions.append(primaryCta);
  if (secondaryCta) actions.append(secondaryCta);
  return actions;
}

/**
 * Build the text content block (eyebrow, heading, description, actions).
 */
function buildTextContent({ eyebrow, title, descHtml, primaryAnchor, secondaryAnchor }) {
  const content = document.createElement('div');
  content.className = 'hero-banner-content';

  if (eyebrow) {
    const eyebrowEl = document.createElement('p');
    eyebrowEl.className = 'hero-banner-eyebrow';
    eyebrowEl.textContent = eyebrow;
    content.append(eyebrowEl);
  }

  if (title) {
    const h1 = document.createElement('h1');
    h1.className = 'hero-banner-title';
    h1.textContent = title;
    content.append(h1);
  }

  if (descHtml) {
    const desc = document.createElement('div');
    desc.className = 'hero-banner-description';
    desc.innerHTML = descHtml;
    content.append(desc);
  }

  const actions = buildActions(primaryAnchor, secondaryAnchor);
  if (actions) content.append(actions);

  return content;
}

/**
 * Optimise a picture element in place and return it.
 * Guards against missing picture gracefully.
 */
function optimisePicture(picture, alt = '') {
  if (!picture) return null;
  const img = picture.querySelector('img');
  if (!img) return picture;
  const optimised = createOptimizedPicture(img.src, alt || img.alt, false, [
    { media: '(min-width: 900px)', width: '1440' },
    { width: '750' },
  ]);
  moveInstrumentation(img, optimised.querySelector('img'));
  picture.replaceWith(optimised);
  return optimised;
}

/* ─── Field index map (matches block.json field order) ───── */
// 1: variant | 2: eyebrow | 3: title | 4: description
// 5: primaryLink (field-collapse → <a>) | 6: primaryLinkText (collapsed)
// 7: primaryLinkTitle (collapsed) | 8: secondaryLink | 9: secondaryLinkText
// 10: secondaryLinkTitle | 11: image | 12: imageAlt (collapsed)
// 13: videoUrl | 14: slides
const FIELD = {
  VARIANT: 1,
  EYEBROW: 2,
  TITLE: 3,
  DESCRIPTION: 4,
  PRIMARY_LINK: 5,
  SECONDARY_LINK: 8,
  IMAGE: 11,
  VIDEO_URL: 13,
  SLIDES: 14,
};

/* ─── Variant builders ───────────────────────────────────── */

function buildTextOnly(inner, data) {
  inner.classList.add('hero-banner-inner--text-only');
  inner.append(buildTextContent(data));
}

function buildImageBg(block, inner, data) {
  let picture = getCellPicture(block, FIELD.IMAGE);

  // Fallback: try to build picture from DAM path string
  if (!picture) {
    const imgPath = getCellText(block, FIELD.IMAGE);
    if (imgPath && imgPath.startsWith('/content/')) {
      const altText = getCellText(block, FIELD.IMAGE + 1);
      picture = createOptimizedPicture(imgPath, altText, false, [
        { media: '(min-width: 900px)', width: '1440' },
        { width: '750' },
      ]);
    }
  } else {
    picture = optimisePicture(picture, getCellText(block, FIELD.IMAGE + 1));
  }

  if (picture) {
    const bg = document.createElement('div');
    bg.className = 'hero-banner-bg';
    bg.append(picture);
    block.prepend(bg);
  }

  inner.classList.add('hero-banner-inner--image-bg');
  inner.append(buildTextContent(data));
}

function buildVideoBg(block, inner, data) {
  const videoUrl = getCellText(block, FIELD.VIDEO_URL);

  if (videoUrl) {
    const videoBg = document.createElement('div');
    videoBg.className = 'hero-banner-bg hero-banner-bg--video';

    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('aria-hidden', 'true');

    // Guard: only set src for recognisable video formats
    const safeVideoUrl = videoUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i) ? videoUrl : '';
    if (safeVideoUrl) {
      const source = document.createElement('source');
      source.src = safeVideoUrl;
      video.append(source);
      videoBg.append(video);
      block.prepend(videoBg);
    } else {
      // Fallback to image background when URL is unrecognised
      let picture = getCellPicture(block, FIELD.IMAGE);
      picture = optimisePicture(picture, '');
      if (picture) {
        const imgBg = document.createElement('div');
        imgBg.className = 'hero-banner-bg';
        imgBg.append(picture);
        block.prepend(imgBg);
      }
    }
  }

  inner.classList.add('hero-banner-inner--video-bg');
  inner.append(buildTextContent(data));
}

function buildSplit(block, inner, data) {
  inner.classList.add('hero-banner-inner--split');

  const textCol = document.createElement('div');
  textCol.className = 'hero-banner-split-text';
  textCol.append(buildTextContent(data));

  const imgCol = document.createElement('div');
  imgCol.className = 'hero-banner-split-media';

  let picture = getCellPicture(block, FIELD.IMAGE);
  picture = optimisePicture(picture, getCellText(block, FIELD.IMAGE + 1));
  if (picture) imgCol.append(picture);

  inner.append(textCol, imgCol);
}

function buildGradient(inner, data) {
  inner.classList.add('hero-banner-inner--gradient');
  inner.append(buildTextContent(data));
}

/**
 * Parse carousel slides from richtext field.
 * Expected pipe-delimited format per paragraph:
 *   Title | Description | PrimaryLinkUrl | PrimaryLinkText | ImagePath
 * Gracefully handles missing columns.
 */
function parseSlides(slidesHtml) {
  if (!slidesHtml) return [];
  const temp = document.createElement('div');
  temp.innerHTML = slidesHtml;
  const paragraphs = [...temp.querySelectorAll('p')];

  return paragraphs
    .map((p) => {
      const parts = p.textContent.split('|').map((s) => s.trim());
      // Require at minimum a title
      if (!parts[0]) return null;
      return {
        title: parts[0] || '',
        description: parts[1] || '',
        linkHref: parts[2] || '',
        linkText: parts[3] || '',
        imagePath: parts[4] || '',
      };
    })
    .filter(Boolean);
}

function buildCarousel(block, inner, data) {
  inner.classList.add('hero-banner-inner--carousel');

  const slidesHtml = getCellHtml(block, FIELD.SLIDES);
  const slides = parseSlides(slidesHtml);

  // Fallback: render as text-only when no slides are authored
  if (!slides.length) {
    buildTextOnly(inner, data);
    return;
  }

  const track = document.createElement('div');
  track.className = 'hero-banner-carousel-track';
  track.setAttribute('role', 'region');
  track.setAttribute('aria-label', 'Hero carousel');
  track.setAttribute('aria-live', 'polite');

  slides.forEach((slide, idx) => {
    const slideEl = document.createElement('div');
    slideEl.className = 'hero-banner-slide';
    if (idx === 0) slideEl.classList.add('hero-banner-slide--active');
    slideEl.setAttribute('aria-label', `Slide ${idx + 1} of ${slides.length}`);

    if (slide.imagePath) {
      const bg = document.createElement('div');
      bg.className = 'hero-banner-bg';
      const optimised = createOptimizedPicture(slide.imagePath, slide.title, false, [
        { media: '(min-width: 900px)', width: '1440' },
        { width: '750' },
      ]);
      bg.append(optimised);
      slideEl.append(bg);
    }

    const slideContent = document.createElement('div');
    slideContent.className = 'hero-banner-content';

    if (slide.title) {
      const h = document.createElement('h2');
      h.className = 'hero-banner-title';
      h.textContent = slide.title;
      slideContent.append(h);
    }

    if (slide.description) {
      const desc = document.createElement('p');
      desc.className = 'hero-banner-description';
      desc.textContent = slide.description;
      slideContent.append(desc);
    }

    if (slide.linkHref) {
      const actions = document.createElement('div');
      actions.className = 'hero-banner-actions';
      const a = document.createElement('a');
      a.href = slide.linkHref;
      a.textContent = slide.linkText || slide.linkHref;
      a.className = 'hero-banner-cta hero-banner-cta--primary';
      actions.append(a);
      slideContent.append(actions);
    }

    slideEl.append(slideContent);
    track.append(slideEl);
  });

  // Dot indicators
  const dots = document.createElement('div');
  dots.className = 'hero-banner-dots';
  dots.setAttribute('role', 'tablist');
  dots.setAttribute('aria-label', 'Slide indicators');

  // Prev / next controls
  const prevBtn = document.createElement('button');
  prevBtn.className = 'hero-banner-nav hero-banner-nav--prev';
  prevBtn.setAttribute('aria-label', 'Previous slide');
  prevBtn.innerHTML = '&#8249;';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'hero-banner-nav hero-banner-nav--next';
  nextBtn.setAttribute('aria-label', 'Next slide');
  nextBtn.innerHTML = '&#8250;';

  slides.forEach((_, idx) => {
    const dot = document.createElement('button');
    dot.className = 'hero-banner-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
    dot.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
    if (idx === 0) dot.classList.add('hero-banner-dot--active');
    dots.append(dot);
  });

  inner.append(prevBtn, track, nextBtn, dots);

  /* ── Carousel logic ── */
  const allSlides = [...track.querySelectorAll('.hero-banner-slide')];
  const allDots = [...dots.querySelectorAll('.hero-banner-dot')];
  let current = 0;
  let autoplayTimer = null;
  let isTransitioning = false;

  function goTo(index) {
    // Guard: prevent interaction during transition or out-of-bound index
    if (isTransitioning) return;
    if (index < 0 || index >= allSlides.length) return;

    isTransitioning = true;
    allSlides[current].classList.remove('hero-banner-slide--active');
    allDots[current].classList.remove('hero-banner-dot--active');
    allDots[current].setAttribute('aria-selected', 'false');

    current = index;

    allSlides[current].classList.add('hero-banner-slide--active');
    allDots[current].classList.add('hero-banner-dot--active');
    allDots[current].setAttribute('aria-selected', 'true');

    track.setAttribute('aria-live', 'polite');

    setTimeout(() => {
      isTransitioning = false;
    }, CAROUSEL_TRANSITION_MS);
  }

  function startAutoplay() {
    stopAutoplay();
    // Only autoplay when multiple slides exist
    if (allSlides.length > 1) {
      autoplayTimer = setInterval(() => {
        goTo((current + 1) % allSlides.length);
      }, AUTOPLAY_INTERVAL);
    }
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  prevBtn.addEventListener('click', () => {
    stopAutoplay();
    goTo((current - 1 + allSlides.length) % allSlides.length);
    startAutoplay();
  });

  nextBtn.addEventListener('click', () => {
    stopAutoplay();
    goTo((current + 1) % allSlides.length);
    startAutoplay();
  });

  allDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      stopAutoplay();
      goTo(idx);
      startAutoplay();
    });
  });

  // Pause autoplay when user focuses inside carousel (accessibility)
  inner.addEventListener('focusin', stopAutoplay);
  inner.addEventListener('focusout', startAutoplay);

  // Keyboard navigation support
  inner.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { stopAutoplay(); goTo((current - 1 + allSlides.length) % allSlides.length); startAutoplay(); }
    if (e.key === 'ArrowRight') { stopAutoplay(); goTo((current + 1) % allSlides.length); startAutoplay(); }
  });

  startAutoplay();
}

/* ─── Main decorate ──────────────────────────────────────── */

export default function decorate(block) {
  // Read variant; fallback to 'text-only' for unrecognised or missing values
  const rawVariant = getCellText(block, FIELD.VARIANT);
  const variant = VALID_VARIANTS.includes(rawVariant) ? rawVariant : 'text-only';

  // Apply variant as block modifier class for CSS targeting
  block.classList.add(`hero-banner--${variant}`);

  // Collect shared data used by most variants
  const eyebrow = getCellText(block, FIELD.EYEBROW);
  const title = getCellText(block, FIELD.TITLE);
  const descHtml = getCellHtml(block, FIELD.DESCRIPTION);
  const primaryAnchor = getCellAnchor(block, FIELD.PRIMARY_LINK);
  const secondaryAnchor = getCellAnchor(block, FIELD.SECONDARY_LINK);

  const data = { eyebrow, title, descHtml, primaryAnchor, secondaryAnchor };

  // Preserve Universal Editor instrumentation on the first direct child
  const firstInstrumented = block.firstElementChild;
  const inner = document.createElement('div');
  inner.className = 'hero-banner-inner';

  if (firstInstrumented) {
    moveInstrumentation(firstInstrumented, inner);
  }

  // Build variant-specific structure
  switch (variant) {
    case 'image-bg':
      buildImageBg(block, inner, data);
      break;
    case 'video-bg':
      buildVideoBg(block, inner, data);
      break;
    case 'split':
      buildSplit(block, inner, data);
      break;
    case 'gradient':
      buildGradient(inner, data);
      break;
    case 'carousel':
      buildCarousel(block, inner, data);
      break;
    case 'text-only':
    default:
      buildTextOnly(inner, data);
      break;
  }

  // Replace all raw EDS column divs with the composed inner element
  block.replaceChildren(inner);
}
