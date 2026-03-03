import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Checks whether block has lazy-loaded variant.
 */
function isLazyLoaded(block) {
  return block.classList.contains('lazy-loaded');
}

/**
 * Fade-in reveal using IntersectionObserver
 */
function setupLazyReveal(figure, img) {
  figure.classList.add('image-block-figure--pending');

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      figure.classList.remove('image-block-figure--pending');
      figure.classList.add('image-block-figure--revealed');
      obs.disconnect();
    });
  }, { rootMargin: '0px 0px 120px 0px' });

  if (img.complete) {
    figure.classList.remove('image-block-figure--pending');
    figure.classList.add('image-block-figure--revealed');
  } else {
    observer.observe(figure);
    img.addEventListener('load', () => {
      figure.classList.remove('image-block-figure--pending');
      figure.classList.add('image-block-figure--revealed');
      observer.disconnect();
    }, { once: true });
  }
}

/**
 * Builds overlay element
 */
function buildOverlay(text) {
  const overlay = document.createElement('div');
  overlay.className = 'image-block-overlay';

  const p = document.createElement('p');
  p.className = 'image-block-overlay-text';
  p.textContent = text;

  overlay.append(p);
  return overlay;
}

export default function decorate(block) {
  console.log('block >>> ',block);
  const column = block;
  if (!column) return;

  const rows = [...column.children];
  if (!rows.length) return;

  const [imageRow, captionRow, overlayRow] = rows;

  /* ---------------- IMAGE ---------------- */

  const picture = imageRow?.querySelector('picture');
  if (!picture) {
    block.textContent = '';
    return;
  }

  const img = picture.querySelector('img');
  if (!img) {
    block.textContent = '';
    return;
  }

  const isFullWidth = block.classList.contains('full-width');

  const widths = isFullWidth
    ? [
        { media: '(min-width: 900px)', width: '1600' },
        { width: '800' },
      ]
    : [
        { media: '(min-width: 900px)', width: '1200' },
        { media: '(min-width: 600px)', width: '800' },
        { width: '480' },
      ];

  const optimizedPic = createOptimizedPicture(
    img.src,
    img.alt || '',
    false,
    widths
  );

  const optimizedImg = optimizedPic.querySelector('img');

  moveInstrumentation(img, optimizedImg);

  if (isLazyLoaded(block)) {
    optimizedImg.setAttribute('loading', 'lazy');
  } else if (isFullWidth) {
    optimizedImg.setAttribute('loading', 'eager');
    optimizedImg.setAttribute('fetchpriority', 'high');
  } else {
    optimizedImg.setAttribute('loading', 'lazy');
  }

  /* ---------------- FIGURE ---------------- */

  const figure = document.createElement('figure');
  figure.className = 'image-block-figure';

  moveInstrumentation(column, figure);

  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'image-block-image-wrapper';
  imageWrapper.append(optimizedPic);

  /* ---------------- OVERLAY ---------------- */

  if (overlayRow) {
    const overlayText = overlayRow.textContent.trim();
    if (overlayText) {
      const overlay = buildOverlay(overlayText);
      imageWrapper.append(overlay);
    }
  }

  figure.append(imageWrapper);

  /* ---------------- CAPTION ---------------- */

  if (captionRow) {
    const captionText = captionRow.textContent.trim();
    if (captionText) {
      const figcaption = document.createElement('figcaption');
      figcaption.className = 'image-block-caption';
      figcaption.textContent = captionText;
      figure.append(figcaption);
    }
  }

  /* ---------------- LAZY REVEAL ---------------- */

  if (isLazyLoaded(block)) {
    setupLazyReveal(figure, optimizedImg);
  }

  /* ---------------- REPLACE CONTENT ---------------- */

  block.replaceChildren(figure);
}