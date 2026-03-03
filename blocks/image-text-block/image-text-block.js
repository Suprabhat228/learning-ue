import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Utility: find a row by its data-aue-prop
 */
function getRow(rows, prop) {
  return rows.find((row) =>
    row.querySelector(`[data-aue-prop="${prop}"]`)
  );
}

export default function decorate(block) {
  const column = block.firstElementChild;
  if (!column) return;

  const rows = [...column.children];

  // Find rows safely (no index destructuring)
  const imageRow = rows.find((row) => row.querySelector('picture'));
  const eyebrowRow = getRow(rows, 'eyebrow');
  const headingRow = getRow(rows, 'heading');
  const descriptionRow = getRow(rows, 'description');
  const linkRow = getRow(rows, 'link');
  const linkTextRow = getRow(rows, 'linkText');
  const linkTitleRow = getRow(rows, 'linkTitle');
  const linkTypeRow = getRow(rows, 'linkType');

  /* =========================================================
     OUTER LAYOUT WRAPPER (SAFE)
  ========================================================= */

  const inner = document.createElement('div');
  inner.className = 'image-text-block-inner';

  moveInstrumentation(column, inner);

  /* =========================================================
     IMAGE PANE (PRESERVE ORIGINAL ROW)
  ========================================================= */

  if (imageRow) {
    const picture = imageRow.querySelector('picture');
    const img = picture?.querySelector('img');

    if (picture && img) {
      const optimizedPic = createOptimizedPicture(
        img.src,
        img.alt || '',
        false,
        [
          { media: '(min-width: 900px)', width: '800' },
          { media: '(min-width: 600px)', width: '600' },
          { width: '480' },
        ],
      );

      const optimizedImg = optimizedPic.querySelector('img');
      moveInstrumentation(img, optimizedImg);
      optimizedImg.setAttribute('loading', 'lazy');

      const imagePane = document.createElement('div');
      imagePane.className = 'image-text-block-image-pane';
      imagePane.append(optimizedPic);

      inner.append(imagePane);
    }

    imageRow.remove(); // safe: content migrated
  }

  /* =========================================================
     TEXT PANE (REUSE ORIGINAL FIELD ROWS)
  ========================================================= */

  const textPane = document.createElement('div');
  textPane.className = 'image-text-block-text-pane';

  // Eyebrow
  if (eyebrowRow) {
    eyebrowRow.classList.add('image-text-block-eyebrow');
    textPane.append(eyebrowRow);
  }

  // Heading
  if (headingRow) {
    headingRow.classList.add('image-text-block-heading');
    textPane.append(headingRow);
  }

  // Description
  if (descriptionRow) {
    descriptionRow.classList.add('image-text-block-description');
    textPane.append(descriptionRow);
  }

  /* =========================================================
     CTA BUILD (SAFE — DO NOT RECREATE FIELDS)
  ========================================================= */

  if (linkRow) {
    const url = linkRow.textContent.trim();
    const text = linkTextRow?.textContent.trim();
    const title = linkTitleRow?.textContent.trim();
    const type = linkTypeRow?.textContent.trim() || 'primary';

    if (url && text) {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.textContent = text;
      anchor.className = `image-text-block-cta image-text-block-cta--${type}`;

      if (title) anchor.title = title;

      const wrapper = document.createElement('div');
      wrapper.className = 'image-text-block-cta-wrapper';
      wrapper.append(anchor);

      textPane.append(wrapper);
    }
  }

  inner.append(textPane);

  /* =========================================================
     FINAL STRUCTURE UPDATE (SAFE)
     Replace only column content, not block root
  ========================================================= */

  column.replaceChildren(inner);

  /* =========================================================
     CLEANUP ORIGINAL RAW CTA ROWS
  ========================================================= */

  linkRow?.remove();
  linkTextRow?.remove();
  linkTitleRow?.remove();
  linkTypeRow?.remove();
}