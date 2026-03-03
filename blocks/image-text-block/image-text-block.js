import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Utility: safely extract row by data-aue-prop
 */
function getRowByProp(rows, prop) {
  return rows.find((row) =>
    row.querySelector(`[data-aue-prop="${prop}"]`)
  );
}

/**
 * Build CTA manually from individual fields
 */
function buildCta(linkRow, linkTextRow, linkTitleRow, linkTypeRow) {
  if (!linkRow) return null;

  const url = linkRow.textContent.trim();
  const text = linkTextRow?.textContent.trim();
  const title = linkTitleRow?.textContent.trim();
  const type = linkTypeRow?.textContent.trim() || 'primary';

  if (!url || !text) return null;

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.textContent = text;
  anchor.className = `image-text-block-cta image-text-block-cta--${type}`;

  if (title) anchor.title = title;

  const wrapper = document.createElement('div');
  wrapper.className = 'image-text-block-cta-wrapper';
  wrapper.append(anchor);

  return wrapper;
}

export default function decorate(block) {
  const column = block.firstElementChild;
  if (!column) return;

  const rows = [...column.children];

  // Extract rows safely by property name
  const imageRow = rows.find((row) => row.querySelector('picture'));
  const eyebrowRow = getRowByProp(rows, 'eyebrow');
  const headingRow = getRowByProp(rows, 'heading');
  const descriptionRow = getRowByProp(rows, 'description');
  const linkRow = getRowByProp(rows, 'link');
  const linkTextRow = getRowByProp(rows, 'linkText');
  const linkTitleRow = getRowByProp(rows, 'linkTitle');
  const linkTypeRow = getRowByProp(rows, 'linkType');

  const inner = document.createElement('div');
  inner.className = 'image-text-block-inner';
  moveInstrumentation(column, inner);

  /* =========================================================
     IMAGE SECTION
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

    imageRow.remove();
  }

  /* =========================================================
     TEXT SECTION
  ========================================================= */

  const textPane = document.createElement('div');
  textPane.className = 'image-text-block-text-pane';

  // Eyebrow
  if (eyebrowRow) {
    const text = eyebrowRow.textContent.trim();
    if (text) {
      const span = document.createElement('span');
      span.className = 'image-text-block-eyebrow';
      span.textContent = text;
      textPane.append(span);
    }
    eyebrowRow.remove();
  }

  // Heading
  if (headingRow) {
    const existingHeading =
      headingRow.querySelector('h1,h2,h3,h4,h5,h6');

    if (existingHeading) {
      existingHeading.className = 'image-text-block-heading';
      textPane.append(existingHeading);
    } else {
      const text = headingRow.textContent.trim();
      if (text) {
        const h2 = document.createElement('h2');
        h2.className = 'image-text-block-heading';
        h2.textContent = text;
        textPane.append(h2);
      }
    }

    headingRow.remove();
  }

  // Description (richtext)
  if (descriptionRow) {
    if (descriptionRow.textContent.trim()) {
      descriptionRow.className = 'image-text-block-description';
      textPane.append(descriptionRow);
    } else {
      descriptionRow.remove();
    }
  }

  // CTA
  const cta = buildCta(
    linkRow,
    linkTextRow,
    linkTitleRow,
    linkTypeRow,
  );

  if (cta) {
    textPane.append(cta);
  }

  // Remove raw CTA rows
  linkRow?.remove();
  linkTextRow?.remove();
  linkTitleRow?.remove();
  linkTypeRow?.remove();

  inner.append(textPane);

  block.replaceChildren(inner);
}