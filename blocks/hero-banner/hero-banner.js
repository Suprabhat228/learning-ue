import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/* ─── Constants ─────────────────────────────────────────── */
const VALID_VARIANTS = ['text-only', 'image-bg', 'video-bg', 'split', 'gradient'];
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
 * Extract a picture element from a cell by index.
 */
function getCellPicture(block, index) {
  return block.querySelector(`:scope > div:nth-child(${index}) > div > picture`) || null;
}

/**
 * Build an anchor element from separate path, text, and title cells.
 * Used because aem-content fields render as plain text path strings,
 * not as <a> elements in the DOM.
 */
function buildAnchorFromFields(block, linkIndex, textIndex, titleIndex) {
  const href = getCellText(block, linkIndex);
  if (!href) return null;

  const a = document.createElement('a');
  a.href = href;

  const text = getCellText(block, textIndex);
  const title = getCellText(block, titleIndex);

  a.textContent = text || href;
  if (title) a.title = title;

  return a;
}

/**
 * Build a picture element from a reference field path string or existing <picture>.
 * Used because reference component fields render as plain text path strings,
 * not as <picture> elements in the DOM.
 */
function buildPictureFromPath(block, imageIndex, altIndex) {
  // First try native <picture> element (works in preview/publish rendering)
  let picture = getCellPicture(block, imageIndex);
  if (picture) {
    return optimisePicture(picture, getCellText(block, altIndex));
  }

  // Fallback: reference component gives us a plain DAM path string
  const imgPath = getCellText(block, imageIndex);
  if (!imgPath) return null;

  const alt = getCellText(block, altIndex);
  return createOptimizedPicture(imgPath, alt, false, [
    { media: '(min-width: 900px)', width: '1440' },
    { width: '750' },
  ]);
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
// 5: primaryLink (aem-content → plain path string) | 6: primaryLinkText
// 7: primaryLinkTitle | 8: secondaryLink | 9: secondaryLinkText
// 10: secondaryLinkTitle | 11: image (reference → plain path string)
// 12: imageAlt | 13: videoUrl | 14: slides
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
  // ✅ Fixed: use buildPictureFromPath instead of getCellPicture
  const picture = buildPictureFromPath(block, FIELD.IMAGE, FIELD.IMAGE + 1);

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
      // ✅ Fixed: fallback to image using buildPictureFromPath
      const picture = buildPictureFromPath(block, FIELD.IMAGE, FIELD.IMAGE + 1);
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

  // ✅ Fixed: use buildPictureFromPath instead of getCellPicture
  const picture = buildPictureFromPath(block, FIELD.IMAGE, FIELD.IMAGE + 1);
  if (picture) imgCol.append(picture);

  inner.append(textCol, imgCol);
}

function buildGradient(inner, data) {
  inner.classList.add('hero-banner-inner--gradient');
  inner.append(buildTextContent(data));
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

  // ✅ Fixed: use buildAnchorFromFields instead of getCellAnchor
  // aem-content fields render as plain path strings, not <a> elements
  const primaryAnchor = buildAnchorFromFields(
    block,
    FIELD.PRIMARY_LINK,     // index 5 → href path
    FIELD.PRIMARY_LINK + 1, // index 6 → link text
    FIELD.PRIMARY_LINK + 2, // index 7 → link title
  );
  const secondaryAnchor = buildAnchorFromFields(
    block,
    FIELD.SECONDARY_LINK,     // index 8 → href path
    FIELD.SECONDARY_LINK + 1, // index 9 → link text
    FIELD.SECONDARY_LINK + 2, // index 10 → link title
  );

  const data = {
    eyebrow, title, descHtml, primaryAnchor, secondaryAnchor,
  };

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
    case 'text-only':
    default:
      buildTextOnly(inner, data);
      break;
  }

  // Replace all raw EDS column divs with the composed inner element
  block.replaceChildren(inner);
}