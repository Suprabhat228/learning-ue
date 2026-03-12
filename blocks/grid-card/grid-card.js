
import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Field row order (matches models[].fields in _grid-card.json).
 * EDS field-collapse rules:
 *   - imageAlt collapses into image → no separate row for imageAlt
 *   - linkText, linkTitle, linkType collapse into link → no separate rows
 *
 * Effective rendered rows:
 *   Row 0 — style       (multiselect; variant class names applied to block)
 *   Row 1 — image       (picture > img, alt from imageAlt via field-collapse)
 *   Row 2 — eyebrow     (text)
 *   Row 3 — heading     (text)
 *   Row 4 — description (richtext)
 *   Row 5 — link        (anchor, text/title/type collapsed in)
 */

/**
 * Resolves the CTA button style class from the link's field-collapsed
 * data. EDS renders linkType as a data attribute or class on the <a>.
 * We normalise it to a predictable CSS class here.
 * @param {HTMLAnchorElement} anchor
 * @returns {string} one of: primary | secondary | ghost
 */
function resolveLinkType(anchor) {
  if (!anchor) return 'primary';

  // EDS may surface linkType as a class on the anchor (field-collapse)
  const knownTypes = ['primary', 'secondary', 'ghost'];
  const matched = knownTypes.find((t) => anchor.classList.contains(t));
  if (matched) return matched;

  // Fallback: check the parent wrapper's text for the raw value
  // (some EDS versions render it as a sibling text node)
  return 'primary';
}

/**
 * Promotes the anchor inside the link row to a styled CTA button.
 * Removes EDS default classes and applies block-scoped BEM classes.
 * @param {HTMLElement} linkRow
 * @returns {HTMLElement|null} decorated wrapper div or null if no anchor
 */
function buildCta(linkRow) {
  if (!linkRow) return null;

  const anchor = linkRow.querySelector('a');
  // Guard: no anchor rendered by EDS — field was empty or unpublished
  if (!anchor) return null;

  const type = resolveLinkType(anchor);

  // Strip EDS-injected button classes to avoid style conflicts
  anchor.className = '';
  anchor.classList.add('grid-card-cta', `grid-card-cta--${type}`);

  // Ensure accessible title falls back to visible text if not set
  if (!anchor.title && anchor.textContent.trim()) {
    anchor.setAttribute('title', anchor.textContent.trim());
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'grid-card-cta-wrapper';
  wrapper.append(anchor);
  return wrapper;
}

/** Variant class names allowed from the style field (must match _grid-card.json options). */
const VARIANT_CLASSES = new Set([
  'image-left', 'image-right', 'alternating', 'overlapping', 'angled-split', 'above-fold',
]);

/**
 * Applies variant classes from the style row to the block.
 * @param {HTMLElement} block
 * @param {Element} styleRow First content row (style multiselect)
 */
function applyStyleRow(block, styleRow) {
  if (!styleRow) return;
  const cell = styleRow.querySelector('div:last-child');
  const raw = cell?.textContent?.trim() || '';
  raw.split(/[\s,]+/).forEach((token) => {
    const cls = token.toLowerCase().replace(/\s+/g, '-');
    if (cls && VARIANT_CLASSES.has(cls)) block.classList.add(cls);
  });
}

export default function decorate(block) {
  const column = block.firstElementChild;
  if (!column) return;

  // EDS can render either: block > column > rows, or block > rows (rows as direct children).
  // If the first child has few children, rows are likely the block's direct children.
  const columnRows = [...column.children];
  const directRows = [...block.children];
  const rows = columnRows.length >= 5 ? columnRows : directRows;

  if (!rows.length) return;

  // When style field exists: row 0 = style, rows 1–5 = image, eyebrow, heading, description, link.
  // When no style row (5 rows): rows 0–4 = image, eyebrow, heading, description, link.
  const hasStyleRow = rows.length >= 6;
  const styleRow = hasStyleRow ? rows[0] : null;
  const imageRow = hasStyleRow ? rows[1] : rows[0];
  const eyebrowRow = hasStyleRow ? rows[2] : rows[1];
  const headingRow = hasStyleRow ? rows[3] : rows[2];
  const descriptionRow = hasStyleRow ? rows[4] : rows[3];
  const linkRow = hasStyleRow ? rows[5] : rows[4];

  if (styleRow) {
    applyStyleRow(block, styleRow);
    styleRow.remove();
  }

  // ── Image (Row 0) ────────────────────────────────────────────────
  // Guard: image is the primary visual — abort gracefully if missing
  const picture = imageRow?.querySelector('picture');
  const img = picture?.querySelector('img');

  if (!picture || !img) {
    // No image: render as a text-only split section by flagging the block
    block.classList.add('grid-card--no-image');
  }

  // ── Build semantic structure ─────────────────────────────────────
  const section = document.createElement('div');
  section.className = 'grid-card-inner';
  const instrumentSource = columnRows.length >= 5 ? column : imageRow;
  if (instrumentSource) moveInstrumentation(instrumentSource, section);

  // ── Image pane ───────────────────────────────────────────────────
  if (picture && img) {
    const isAboveFold = block.classList.contains('above-fold');

    const optimizedPic = createOptimizedPicture(
      img.src,
      img.alt || '',
      isAboveFold,
      [
        { media: '(min-width: 900px)', width: '800' },
        { media: '(min-width: 600px)', width: '600' },
        { width: '480' },
      ]
    );

    const optimizedImg = optimizedPic.querySelector('img');
    moveInstrumentation(img, optimizedImg);

    // Above-fold images load eagerly for LCP; everything else lazy
    optimizedImg.setAttribute('loading', isAboveFold ? 'eager' : 'lazy');
    if (isAboveFold) optimizedImg.setAttribute('fetchpriority', 'high');

    const imagePane = document.createElement('div');
    imagePane.className = 'grid-card-image-pane';
    imagePane.append(optimizedPic);

    // Angled split variant injects a decorative SVG clip overlay
    if (block.classList.contains('angled-split')) {
      const clip = document.createElement('div');
      clip.className = 'grid-card-angle-clip';
      clip.setAttribute('aria-hidden', 'true');
      imagePane.append(clip);
    }

    section.append(imagePane);
    imageRow.remove();
  } else if (imageRow) {
    imageRow.remove();
  }

  // ── Text pane ────────────────────────────────────────────────────
  const textPane = document.createElement('div');
  textPane.className = 'grid-card-text-pane';

  // Eyebrow (Row 1)
  if (eyebrowRow) {
    const eyebrowText = eyebrowRow.textContent.trim();
    if (eyebrowText) {
      const eyebrow = document.createElement('span');
      eyebrow.className = 'grid-card-eyebrow';
      eyebrow.textContent = eyebrowText;
      textPane.append(eyebrow);
    }
    eyebrowRow.remove();
  }

  // Heading (Row 2)
  if (headingRow) {
    const headingText = headingRow.textContent.trim();
    if (headingText) {
      // Preserve any existing heading element the author used (h1–h6)
      const existingHeading = headingRow.querySelector('h1, h2, h3, h4, h5, h6');
      if (existingHeading) {
        existingHeading.className = 'grid-card-heading';
        textPane.append(existingHeading);
      } else {
        const h2 = document.createElement('h2');
        h2.className = 'grid-card-heading';
        h2.textContent = headingText;
        textPane.append(h2);
      }
    }
    headingRow.remove();
  }

  // Description (Row 3)
  if (descriptionRow) {
    const hasContent = descriptionRow.textContent.trim()
      || descriptionRow.querySelector('img, picture, ul, ol');
    if (hasContent) {
      descriptionRow.className = 'grid-card-description';
      textPane.append(descriptionRow);
    } else {
      descriptionRow.remove();
    }
  }

  // CTA Link (Row 4)
  if (linkRow) {
    const cta = buildCta(linkRow);
    if (cta) {
      textPane.append(cta);
    }
    linkRow.remove();
  }

  section.append(textPane);

  // Replace all EDS column content with the semantic split layout
  block.replaceChildren(section);
}
