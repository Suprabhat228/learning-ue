
import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Field row order (matches models[].fields in _image-text-block.json).
 *
 * EDS field-collapse rules applied:
 *   - imageAlt  → collapsed into image's <img alt="">   → no separate row
 *   - linkText  → collapsed into link's anchor text     → no separate row
 *   - linkTitle → collapsed into link's title attribute → no separate row
 *   - linkType  → collapsed as a class on the anchor    → no separate row
 *
 * Effective rendered rows inside the single EDS column:
 *   Row 0 — image       (picture > img, alt injected via field-collapse)
 *   Row 1 — eyebrow     (plain text)
 *   Row 2 — heading     (plain text, may contain h1–h6)
 *   Row 3 — description (richtext: paragraphs, lists, inline elements)
 *   Row 4 — link        (anchor with text/title/type collapsed in)
 */

/** Valid CTA button style values — used to guard against unknown linkType. */
const VALID_LINK_TYPES = new Set(['primary', 'secondary', 'ghost']);

/**
 * Extracts the linkType value from the field-collapsed anchor element.
 * EDS surfaces linkType as a CSS class on the rendered <a>.
 * Falls back to "primary" if the class is absent or unrecognised.
 *
 * @param {HTMLAnchorElement} anchor
 * @returns {'primary'|'secondary'|'ghost'}
 */
function resolveLinkType(anchor) {
  if (!anchor) return 'primary';
  const matched = [...anchor.classList].find((cls) => VALID_LINK_TYPES.has(cls));
  return matched || 'primary';
}

/**
 * Promotes the raw link row into a polished CTA button wrapper.
 * Strips EDS-injected utility classes and applies block-scoped BEM classes.
 * Returns null when the row contains no usable anchor (empty field).
 *
 * @param {HTMLElement|undefined} linkRow
 * @returns {HTMLElement|null}
 */
function buildCta(linkRow) {
  if (!linkRow) return null;

  const anchor = linkRow.querySelector('a');
  // Guard: field was empty or href was not published — skip CTA entirely
  if (!anchor) return null;

  // Guard: href must be a non-empty string to avoid broken links
  const href = anchor.getAttribute('href');
  if (!href || !href.trim()) return null;

  const type = resolveLinkType(anchor);

  // Remove all EDS-injected classes to prevent style bleed
  anchor.removeAttribute('class');
  anchor.classList.add('image-text-block-cta', `image-text-block-cta--${type}`);

  // Fallback accessible title when author left linkTitle empty
  if (!anchor.title && anchor.textContent.trim()) {
    anchor.setAttribute('title', anchor.textContent.trim());
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'image-text-block-cta-wrapper';
  wrapper.append(anchor);
  return wrapper;
}

/**
 * Builds the decorative angle-clip overlay div used by the angled-split
 * variant. The clip-path on the picture element creates the wedge; this
 * div adds a coordinated shadow layer behind it.
 *
 * @returns {HTMLElement}
 */
function buildAngleClip() {
  const clip = document.createElement('div');
  clip.className = 'image-text-block-angle-clip';
  clip.setAttribute('aria-hidden', 'true');
  return clip;
}

export default function decorate(block) {
  // Guard: EDS must have rendered at least one column wrapper
  const column = block.firstElementChild;
  if (!column) return;

  // Rows are direct <div> children of the single EDS column
  const rows = [...column.children];

  // Guard: no field rows rendered — nothing meaningful to decorate
  if (!rows.length) return;

  // Destructure by effective rendered row index
  const [imageRow, eyebrowRow, headingRow, descriptionRow, linkRow] = rows;

  // ── Validate image (Row 0) ───────────────────────────────────────
  // Image is the primary visual anchor of this block. If missing we
  // degrade gracefully to a text-only layout rather than throwing.
  const picture = imageRow?.querySelector('picture');
  const img = picture?.querySelector('img');
  const hasImage = Boolean(picture && img);

  if (!hasImage) {
    // Signal CSS to render a centred text-only single-column layout
    block.classList.add('image-text-block--no-image');
  }

  // ── Outer wrapper ────────────────────────────────────────────────
  const inner = document.createElement('div');
  inner.className = 'image-text-block-inner';
  // Migrate Universal Editor instrumentation from the EDS column to
  // our semantic wrapper so authors can still select this block item
  moveInstrumentation(column, inner);

  // ════════════════════════════════════════════════════════════════
  // IMAGE PANE
  // ════════════════════════════════════════════════════════════════
  if (hasImage) {
    const isAboveFold = block.classList.contains('above-fold');

    // Generate responsive WebP picture set. Above-fold images get
    // eager loading + high fetch priority to optimise LCP.
    const optimizedPic = createOptimizedPicture(
      img.src,
      img.alt || '',
      isAboveFold,
      [
        { media: '(min-width: 900px)', width: '800' },
        { media: '(min-width: 600px)', width: '600' },
        { width: '480' },
      ],
    );

    const optimizedImg = optimizedPic.querySelector('img');
    // Preserve any existing UE instrumentation from the original img
    moveInstrumentation(img, optimizedImg);
    optimizedImg.setAttribute('loading', isAboveFold ? 'eager' : 'lazy');
    if (isAboveFold) optimizedImg.setAttribute('fetchpriority', 'high');

    const imagePane = document.createElement('div');
    imagePane.className = 'image-text-block-image-pane';
    imagePane.append(optimizedPic);

    // Angled split variant — append decorative clip helper
    if (block.classList.contains('angled-split')) {
      imagePane.append(buildAngleClip());
    }

    inner.append(imagePane);
    // Remove the raw EDS row — its content has been migrated
    imageRow.remove();
  } else if (imageRow) {
    imageRow.remove();
  }

  // ════════════════════════════════════════════════════════════════
  // TEXT PANE
  // ════════════════════════════════════════════════════════════════
  const textPane = document.createElement('div');
  textPane.className = 'image-text-block-text-pane';

  // ── Eyebrow (Row 1) ──────────────────────────────────────────────
  if (eyebrowRow) {
    const eyebrowText = eyebrowRow.textContent.trim();
    if (eyebrowText) {
      const eyebrow = document.createElement('span');
      eyebrow.className = 'image-text-block-eyebrow';
      eyebrow.textContent = eyebrowText;
      textPane.append(eyebrow);
    }
    // Always remove raw row — either content was moved or field was empty
    eyebrowRow.remove();
  }

  // ── Heading (Row 2) ──────────────────────────────────────────────
  if (headingRow) {
    const headingText = headingRow.textContent.trim();
    if (headingText) {
      // Honour any semantic heading element the author placed (h1–h6);
      // fall back to h2 as the default document hierarchy level.
      const existingHeading = headingRow.querySelector('h1,h2,h3,h4,h5,h6');
      if (existingHeading) {
        existingHeading.className = 'image-text-block-heading';
        textPane.append(existingHeading);
      } else {
        const h2 = document.createElement('h2');
        h2.className = 'image-text-block-heading';
        h2.textContent = headingText;
        textPane.append(h2);
      }
    }
    headingRow.remove();
  }

  // ── Description (Row 3) ──────────────────────────────────────────
  if (descriptionRow) {
    // Richtext rows may contain only whitespace nodes — check before keeping
    const hasDescContent = descriptionRow.textContent.trim()
      || descriptionRow.querySelector('ul,ol,img,picture,table');
    if (hasDescContent) {
      descriptionRow.className = 'image-text-block-description';
      textPane.append(descriptionRow);
    } else {
      descriptionRow.remove();
    }
  }

  // ── CTA Link (Row 4) ─────────────────────────────────────────────
  if (linkRow) {
    const cta = buildCta(linkRow);
    if (cta) textPane.append(cta);
    // Raw row is consumed regardless — anchor was extracted or field empty
    linkRow.remove();
  }

  inner.append(textPane);

  // Replace all EDS-generated column markup with our semantic layout
  block.replaceChildren(inner);
}
