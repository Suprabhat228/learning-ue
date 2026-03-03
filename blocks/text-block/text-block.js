
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Field row order (matches models[].fields order in _text-block.json):
 *   Row 0 — eyebrow   (text)
 *   Row 1 — heading   (text)
 *   Row 2 — body      (richtext)
 *   Row 3 — pullQuote (richtext)
 *
 * EDS renders each field as a <div> row inside the single block column.
 * This decorator adds semantic class names so CSS variants can target
 * them reliably, and moves the eyebrow into the heading row for
 * correct document order and visual hierarchy.
 */
export default function decorate(block) {
  // Guard: block must have at least one column rendered by EDS
  const column = block.firstElementChild;
  if (!column) return;

  // Rows are direct <div> children of the single column wrapper
  const rows = [...column.children];

  // Guard: nothing to decorate if EDS rendered no rows
  if (!rows.length) return;

  // Destructure rows by field position (missing fields produce undefined)
  const [eyebrowRow, headingRow, bodyRow, pullQuoteRow] = rows;

  // ── Eyebrow (Row 0) ──────────────────────────────────────────────
  // The eyebrow is plain text; wrap its content in a <span> so CSS
  // can style it independently without relying on bare tag selectors.
  if (eyebrowRow) {
    const eyebrowText = eyebrowRow.textContent.trim();

    if (eyebrowText) {
      const span = document.createElement('span');
      span.className = 'text-block-eyebrow';
      moveInstrumentation(eyebrowRow, span);
      span.textContent = eyebrowText;

      // Inject the eyebrow span above the heading so the DOM order
      // matches visual rendering — heading row becomes the natural anchor.
      if (headingRow) {
        headingRow.parentElement.insertBefore(span, headingRow);
      } else {
        // Fallback: no heading row present, prepend to column
        column.prepend(span);
      }

      // Remove the original plain row — its content was moved to span
      eyebrowRow.remove();
    } else {
      // Empty eyebrow field — remove to avoid ghost spacing
      eyebrowRow.remove();
    }
  }

  // ── Heading (Row 1) ──────────────────────────────────────────────
  // Add a semantic class so CSS can scope heading styles without
  // relying on nth-child positional selectors (fragile after DOM edits).
  if (headingRow) {
    const hasContent = headingRow.textContent.trim() || headingRow.querySelector('h1, h2, h3, h4, h5, h6');
    if (hasContent) {
      headingRow.classList.add('text-block-heading');
    } else {
      // Empty heading field — remove to avoid layout gaps
      headingRow.remove();
    }
  }

  // ── Body (Row 2) ─────────────────────────────────────────────────
  // Add a semantic class required by the drop-cap CSS variant
  // (targets `.text-block-body > p:first-of-type::first-letter`).
  if (bodyRow) {
    const hasContent = bodyRow.textContent.trim() || bodyRow.querySelector('img, picture');
    if (hasContent) {
      bodyRow.classList.add('text-block-body');
    } else {
      bodyRow.remove();
    }
  }

  // ── Pull Quote (Row 3) ───────────────────────────────────────────
  // Promote the pull quote row into a styled <blockquote> so it
  // renders with the correct semantic element and CSS hook.
  if (pullQuoteRow) {
    const hasContent = pullQuoteRow.textContent.trim();
    if (hasContent) {
      const blockquote = document.createElement('blockquote');
      blockquote.className = 'text-block-pull-quote';
      moveInstrumentation(pullQuoteRow, blockquote);

      // Move all child nodes (richtext may contain <p>, <strong>, etc.)
      while (pullQuoteRow.firstChild) {
        blockquote.append(pullQuoteRow.firstChild);
      }

      // Replace the raw row with the semantic blockquote
      pullQuoteRow.replaceWith(blockquote);
    } else {
      // Empty pull quote field — remove to avoid ghost spacing
      pullQuoteRow.remove();
    }
  }
}
