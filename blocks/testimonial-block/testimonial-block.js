
import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Field row order per testimonial item (models[].fields in _testimonial-block.json).
 *
 * EDS field-collapse rules applied:
 *   - imageAlt collapses into image → no separate row for imageAlt
 *
 * Effective rendered rows inside each block-item column:
 *   Row 0 — quote         (richtext)
 *   Row 1 — authorName    (text)
 *   Row 2 — authorTitle   (text)
 *   Row 3 — authorCompany (text)
 *   Row 4 — image         (picture > img, alt from imageAlt via field-collapse)
 *   Row 5 — rating        (number: 1–5)
 *   Row 6 — videoUrl      (text)
 *   Row 7 — videoCaption  (text)
 */

/** Maximum stars rendered for a rating. */
const MAX_STARS = 5;

/** Minimum/maximum valid rating values. */
const RATING_MIN = 1;
const RATING_MAX = 5;

/** YouTube URL patterns used to detect and transform embed URLs. */
const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
];

/**
 * Extracts a clean text value from a row element.
 * Guards against null rows and pure-whitespace content.
 *
 * @param {HTMLElement|undefined} row
 * @returns {string}
 */
function rowText(row) {
  return row ? row.textContent.trim() : '';
}

/**
 * Builds an accessible star-rating element.
 * Clamps the value to [1, 5] to guard against out-of-range author input.
 * Non-numeric or missing values are treated as unrated (returns null).
 *
 * @param {string} rawValue
 * @returns {HTMLElement|null}
 */
function buildStars(rawValue) {
  if (!rawValue) return null;

  const parsed = parseFloat(rawValue);
  // Guard: non-numeric input (e.g., "five", "") — skip rating silently
  if (Number.isNaN(parsed)) return null;

  // Clamp to valid range — guard against values like 0, 6, -1
  const clamped = Math.min(RATING_MAX, Math.max(RATING_MIN, Math.round(parsed)));

  const wrapper = document.createElement('div');
  wrapper.className = 'testimonial-block-rating';
  wrapper.setAttribute('role', 'img');
  wrapper.setAttribute('aria-label', `Rated ${clamped} out of ${MAX_STARS} stars`);

  for (let i = 1; i <= MAX_STARS; i += 1) {
    const star = document.createElement('span');
    star.className = i <= clamped
      ? 'testimonial-block-star testimonial-block-star--filled'
      : 'testimonial-block-star testimonial-block-star--empty';
    star.setAttribute('aria-hidden', 'true');
    star.textContent = i <= clamped ? '★' : '☆';
    wrapper.append(star);
  }

  return wrapper;
}

/**
 * Resolves a YouTube watch/share URL to its embed equivalent.
 * Returns the original URL unchanged if it is not a YouTube URL,
 * allowing direct video file URLs (mp4, webm) to pass through.
 *
 * @param {string} url
 * @returns {string}
 */
function resolveVideoUrl(url) {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      // Use privacy-enhanced domain and enable JS API for future extensibility
      return `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0`;
    }
  }
  return url;
}

/**
 * Determines whether a URL points to a native video file rather than
 * an iframe-embeddable service.
 *
 * @param {string} url
 * @returns {boolean}
 */
function isDirectVideoUrl(url) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

/**
 * Builds the video testimonial widget.
 * Supports YouTube embeds (via iframe) and direct video files (via <video>).
 * Uses a click-to-play poster pattern to avoid auto-loading heavy iframes.
 *
 * @param {string} rawUrl
 * @param {string} caption
 * @returns {HTMLElement|null}
 */
function buildVideo(rawUrl, caption) {
  if (!rawUrl) return null;

  const url = rawUrl.trim();
  // Guard: completely empty or whitespace-only URL
  if (!url) return null;

  // Guard: basic URL validity check before building DOM
  try {
    // Relative URLs (direct files) won't parse as URL objects — allow them
    if (url.startsWith('http') || url.startsWith('//')) {
      // eslint-disable-next-line no-new
      new URL(url);
    }
  } catch {
    // Malformed URL — degrade gracefully by not rendering the video widget
    return null;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'testimonial-block-video';

  if (isDirectVideoUrl(url)) {
    // Native video element — more accessible and avoids third-party iframes
    const video = document.createElement('video');
    video.className = 'testimonial-block-video-player';
    video.setAttribute('controls', '');
    video.setAttribute('preload', 'metadata');
    // preload="metadata" loads only duration/dimensions, not the full file
    video.setAttribute('playsinline', '');

    const source = document.createElement('source');
    source.src = url;
    video.append(source);

    // Accessible fallback text for browsers that don't support <video>
    video.append(document.createTextNode('Your browser does not support the video element.'));
    wrapper.append(video);
  } else {
    // Iframe-embeddable service (YouTube, Vimeo, etc.)
    // Use a click-to-play facade: show a play button overlay, load iframe on click.
    // This avoids heavy third-party script until the user explicitly requests playback.
    const facade = document.createElement('div');
    facade.className = 'testimonial-block-video-facade';

    const playBtn = document.createElement('button');
    playBtn.className = 'testimonial-block-video-play';
    playBtn.setAttribute('aria-label', 'Play video testimonial');
    playBtn.setAttribute('type', 'button');
    playBtn.innerHTML = '<span aria-hidden="true"></span>';
    facade.append(playBtn);

    const embedUrl = resolveVideoUrl(url);

    // Replace facade with iframe only when the user clicks play
    facade.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.className = 'testimonial-block-video-iframe';
      iframe.src = `${embedUrl}${embedUrl.includes('?') ? '&' : '?'}autoplay=1`;
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('title', caption || 'Video testimonial');
      iframe.setAttribute('loading', 'lazy');
      // Replace the facade with the live iframe
      facade.replaceWith(iframe);
    }, { once: true });

    wrapper.append(facade);
  }

  if (caption) {
    const cap = document.createElement('p');
    cap.className = 'testimonial-block-video-caption';
    cap.textContent = caption;
    wrapper.append(cap);
  }

  return wrapper;
}

/**
 * Parses a single EDS block-item column into a structured testimonial card.
 * All row accesses are guarded for missing/empty fields so partially
 * authored items degrade gracefully rather than throwing.
 *
 * @param {HTMLElement} item - instrumented EDS block-item column div
 * @param {boolean} isCarousel - true when multiple testimonials are present
 * @returns {HTMLElement} fully decorated testimonial card
 */
function buildCard(item, isCarousel) {
  const rows = [...item.children];

  const [
    quoteRow,
    authorNameRow,
    authorTitleRow,
    authorCompanyRow,
    imageRow,
    ratingRow,
    videoUrlRow,
    videoCaptionRow,
  ] = rows;

  // ── Card shell ───────────────────────────────────────────────────
  const card = document.createElement('article');
  card.className = 'testimonial-block-card';
  // Migrate UE instrumentation from the raw EDS item column to our card
  moveInstrumentation(item, card);

  if (isCarousel) {
    card.setAttribute('role', 'tabpanel');
    card.setAttribute('aria-hidden', 'true');
    // Visible cards will have aria-hidden set to false by the carousel controller
  }

  // ── Video (rendered first inside the card when present) ──────────
  const videoUrl = rowText(videoUrlRow);
  const videoCaption = rowText(videoCaptionRow);
  if (videoUrl) {
    const videoWidget = buildVideo(videoUrl, videoCaption);
    if (videoWidget) card.append(videoWidget);
  }
  videoUrlRow?.remove();
  videoCaptionRow?.remove();

  // ── Opening quote mark (decorative) ─────────────────────────────
  const quoteIcon = document.createElement('span');
  quoteIcon.className = 'testimonial-block-quote-icon';
  quoteIcon.setAttribute('aria-hidden', 'true');
  quoteIcon.textContent = '\u201C'; // Unicode left double quotation mark
  card.append(quoteIcon);

  // ── Quote body ───────────────────────────────────────────────────
  if (quoteRow) {
    const hasContent = quoteRow.textContent.trim()
      || quoteRow.querySelector('p,ul,ol,strong,em');
    if (hasContent) {
      quoteRow.className = 'testimonial-block-quote';
      // Wrap in <blockquote> for semantic correctness
      const blockquote = document.createElement('blockquote');
      blockquote.className = 'testimonial-block-blockquote';
      blockquote.append(quoteRow);
      card.append(blockquote);
    } else {
      quoteRow.remove();
    }
  }

  // ── Star rating ──────────────────────────────────────────────────
  const ratingValue = rowText(ratingRow);
  if (ratingValue) {
    const stars = buildStars(ratingValue);
    if (stars) card.append(stars);
  }
  ratingRow?.remove();

  // ── Author row: avatar + attribution ────────────────────────────
  const authorName = rowText(authorNameRow);
  const authorTitle = rowText(authorTitleRow);
  const authorCompany = rowText(authorCompanyRow);
  const picture = imageRow?.querySelector('picture');
  const img = picture?.querySelector('img');

  // Only render the author section if at least one attribution field exists
  if (authorName || authorTitle || authorCompany || (picture && img)) {
    const authorRow = document.createElement('footer');
    authorRow.className = 'testimonial-block-author';

    // Avatar
    if (picture && img) {
      const optimizedPic = createOptimizedPicture(
        img.src,
        img.alt || authorName || '',
        false,
        [{ width: '120' }],
      );
      const optimizedImg = optimizedPic.querySelector('img');
      moveInstrumentation(img, optimizedImg);
      optimizedImg.setAttribute('loading', 'lazy');

      const avatarWrapper = document.createElement('div');
      avatarWrapper.className = 'testimonial-block-avatar';
      avatarWrapper.append(optimizedPic);
      authorRow.append(avatarWrapper);
    }
    imageRow?.remove();

    // Attribution text
    if (authorName || authorTitle || authorCompany) {
      const attribution = document.createElement('div');
      attribution.className = 'testimonial-block-attribution';

      if (authorName) {
        const name = document.createElement('strong');
        name.className = 'testimonial-block-author-name';
        name.textContent = authorName;
        attribution.append(name);
      }

      // Combine title and company into a single line for compact display
      const metaParts = [authorTitle, authorCompany].filter(Boolean);
      if (metaParts.length) {
        const meta = document.createElement('span');
        meta.className = 'testimonial-block-author-meta';
        meta.textContent = metaParts.join(', ');
        attribution.append(meta);
      }

      authorRow.append(attribution);
    }

    authorNameRow?.remove();
    authorTitleRow?.remove();
    authorCompanyRow?.remove();

    card.append(authorRow);
  } else {
    // Clean up rows even if the author section is not rendered
    imageRow?.remove();
    authorNameRow?.remove();
    authorTitleRow?.remove();
    authorCompanyRow?.remove();
  }

  return card;
}

/**
 * Wires up the carousel: prev/next buttons, dot indicators,
 * keyboard navigation, and auto-advance with pause-on-hover.
 * All state is local to this closure — no global variables.
 *
 * @param {HTMLElement} block
 * @param {HTMLElement[]} cards
 */
function initCarousel(block, cards) {
  // Guard: carousel needs at least two slides to be meaningful
  if (cards.length < 2) return;

  let currentIndex = 0;
  let autoplayTimer = null;
  const AUTOPLAY_DELAY = 5000;

  /**
   * Moves the carousel to the target slide index.
   * Wraps around at boundaries (infinite loop behaviour).
   *
   * @param {number} targetIndex
   */
  function goTo(targetIndex) {
    const total = cards.length;
    // Wrap-around guard: keep index within [0, total-1]
    const next = ((targetIndex % total) + total) % total;

    cards[currentIndex].classList.remove('testimonial-block-card--active');
    cards[currentIndex].setAttribute('aria-hidden', 'true');

    currentIndex = next;

    cards[currentIndex].classList.add('testimonial-block-card--active');
    cards[currentIndex].setAttribute('aria-hidden', 'false');

    // Sync dot indicators
    const dots = block.querySelectorAll('.testimonial-block-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('testimonial-block-dot--active', i === currentIndex);
      dot.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
    });
  }

  // Activate first slide
  cards[0].classList.add('testimonial-block-card--active');
  cards[0].setAttribute('aria-hidden', 'false');

  // ── Navigation controls ──────────────────────────────────────────
  const nav = document.createElement('div');
  nav.className = 'testimonial-block-nav';
  nav.setAttribute('role', 'group');
  nav.setAttribute('aria-label', 'Testimonial navigation');

  const prevBtn = document.createElement('button');
  prevBtn.className = 'testimonial-block-nav-btn testimonial-block-nav-btn--prev';
  prevBtn.setAttribute('type', 'button');
  prevBtn.setAttribute('aria-label', 'Previous testimonial');
  prevBtn.innerHTML = '<span aria-hidden="true">&#8592;</span>';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'testimonial-block-nav-btn testimonial-block-nav-btn--next';
  nextBtn.setAttribute('type', 'button');
  nextBtn.setAttribute('aria-label', 'Next testimonial');
  nextBtn.innerHTML = '<span aria-hidden="true">&#8594;</span>';

  prevBtn.addEventListener('click', () => {
    stopAutoplay();
    goTo(currentIndex - 1);
  });

  nextBtn.addEventListener('click', () => {
    stopAutoplay();
    goTo(currentIndex + 1);
  });

  // ── Dot indicators ───────────────────────────────────────────────
  const dotsWrapper = document.createElement('div');
  dotsWrapper.className = 'testimonial-block-dots';
  dotsWrapper.setAttribute('role', 'tablist');
  dotsWrapper.setAttribute('aria-label', 'Testimonials');

  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testimonial-block-dot';
    dot.setAttribute('type', 'button');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => {
      stopAutoplay();
      goTo(i);
    });
    dotsWrapper.append(dot);
  });

  // Mark the first dot active
  dotsWrapper.firstElementChild?.classList.add('testimonial-block-dot--active');

  nav.append(prevBtn, dotsWrapper, nextBtn);

  // ── Keyboard navigation ──────────────────────────────────────────
  // Arrow keys allow keyboard users to navigate slides without a mouse
  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      stopAutoplay();
      goTo(currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      stopAutoplay();
      goTo(currentIndex + 1);
    }
  });

  // ── Autoplay ─────────────────────────────────────────────────────
  function startAutoplay() {
    // Guard: don't stack multiple timers if called repeatedly
    if (autoplayTimer) return;
    autoplayTimer = setInterval(() => goTo(currentIndex + 1), AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  // Pause autoplay when the user hovers or focuses inside the block
  block.addEventListener('mouseenter', stopAutoplay);
  block.addEventListener('mouseleave', startAutoplay);
  block.addEventListener('focusin', stopAutoplay);
  block.addEventListener('focusout', startAutoplay);

  // Pause autoplay on page visibility change (tab switch, screen lock)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  // Only autoplay if the user has not requested reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) startAutoplay();

  block.append(nav);
}

export default function decorate(block) {
  // Each direct child of the block is an EDS block-item column (one testimonial)
  const items = [...block.children];

  // Guard: no items authored — render nothing and hide the block region
  if (!items.length) {
    block.closest('.section')?.classList.add('testimonial-block-section--empty');
    return;
  }

  const isCarousel = items.length > 1 && block.classList.contains('carousel');
  const cards = items.map((item) => buildCard(item, isCarousel));

  // ── Build track wrapper ──────────────────────────────────────────
  const track = document.createElement('div');
  track.className = 'testimonial-block-track';

  if (isCarousel) {
    track.setAttribute('aria-live', 'polite');
    track.setAttribute('aria-atomic', 'false');
    // aria-live="polite" announces slide changes to screen readers
    // without interrupting ongoing speech
  }

  cards.forEach((card) => track.append(card));

  // Replace all EDS-generated columns with the decorated track
  block.replaceChildren(track);

  // Initialise carousel controls only for the carousel variant
  if (isCarousel) {
    initCarousel(block, cards);
  }
}
