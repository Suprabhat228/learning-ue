
import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Determines column count based on block variant classes.
 * Defaults to 3-column if no variant is specified.
 * @param {HTMLElement} block
 * @returns {number}
 */
function getColumnCount(block) {
  if (block.classList.contains('four-column')) return 4;
  if (block.classList.contains('two-column')) return 2;
  if (block.classList.contains('masonry')) return 0; // masonry uses CSS columns
  return 3; // default 3-column
}

/**
 * Determines if the block is in masonry variant mode.
 * @param {HTMLElement} block
 * @returns {boolean}
 */
function isMasonry(block) {
  return block.classList.contains('masonry');
}

/**
 * Determines if list-view toggle is enabled.
 * @param {HTMLElement} block
 * @returns {boolean}
 */
function hasListToggle(block) {
  return block.classList.contains('list-view-toggle');
}

/**
 * Determines if infinite scroll is enabled.
 * @param {HTMLElement} block
 * @returns {boolean}
 */
function hasInfiniteScroll(block) {
  return block.classList.contains('infinite-scroll');
}

/**
 * Builds the grid toolbar (view toggle button) above the card grid.
 * @param {HTMLElement} grid - The ul.grid-card-grid element
 * @param {HTMLElement} block
 */
function buildViewToggle(grid, block) {
  const toolbar = document.createElement('div');
  toolbar.className = 'grid-card-toolbar';
  toolbar.setAttribute('aria-label', 'View toggle toolbar');

  const gridBtn = document.createElement('button');
  gridBtn.className = 'grid-card-toggle-btn grid-card-toggle-btn--active';
  gridBtn.setAttribute('aria-label', 'Switch to grid view');
  gridBtn.setAttribute('aria-pressed', 'true');
  gridBtn.title = 'Grid view';
  gridBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z"/></svg>`;

  const listBtn = document.createElement('button');
  listBtn.className = 'grid-card-toggle-btn';
  listBtn.setAttribute('aria-label', 'Switch to list view');
  listBtn.setAttribute('aria-pressed', 'false');
  listBtn.title = 'List view';
  listBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 5h18v2H3zm0 6h18v2H3zm0 6h18v2H3z"/></svg>`;

  toolbar.append(gridBtn, listBtn);
  block.insertBefore(toolbar, grid.closest ? grid : grid.parentElement);

  gridBtn.addEventListener('click', () => {
    grid.classList.remove('grid-card-grid--list');
    gridBtn.classList.add('grid-card-toggle-btn--active');
    listBtn.classList.remove('grid-card-toggle-btn--active');
    gridBtn.setAttribute('aria-pressed', 'true');
    listBtn.setAttribute('aria-pressed', 'false');
  });

  listBtn.addEventListener('click', () => {
    grid.classList.add('grid-card-grid--list');
    listBtn.classList.add('grid-card-toggle-btn--active');
    gridBtn.classList.remove('grid-card-toggle-btn--active');
    listBtn.setAttribute('aria-pressed', 'true');
    gridBtn.setAttribute('aria-pressed', 'false');
  });
}

/**
 * Sets up IntersectionObserver-based infinite scroll sentinel.
 * Reveals hidden cards in batches as user scrolls to the bottom.
 * @param {HTMLElement} grid - ul.grid-card-grid
 * @param {HTMLElement} block
 * @param {number} batchSize - How many items to reveal per scroll trigger
 */
function setupInfiniteScroll(grid, block, batchSize = 6) {
  const allItems = [...grid.querySelectorAll('.grid-card-item')];

  // Guard: if total items <= batchSize, no infinite scroll needed
  if (allItems.length <= batchSize) return;

  // Hide items beyond the initial batch
  allItems.slice(batchSize).forEach((item) => {
    item.classList.add('grid-card-item--hidden');
  });

  let visibleCount = batchSize;

  const sentinel = document.createElement('div');
  sentinel.className = 'grid-card-sentinel';
  sentinel.setAttribute('aria-hidden', 'true');
  block.append(sentinel);

  const loader = document.createElement('div');
  loader.className = 'grid-card-loader';
  loader.setAttribute('aria-live', 'polite');
  loader.setAttribute('aria-label', 'Loading more cards');
  loader.innerHTML = `<span class="grid-card-loader__dot"></span><span class="grid-card-loader__dot"></span><span class="grid-card-loader__dot"></span>`;
  block.append(loader);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        // Reveal next batch
        const nextBatch = allItems.slice(visibleCount, visibleCount + batchSize);
        nextBatch.forEach((item) => item.classList.remove('grid-card-item--hidden'));
        visibleCount += batchSize;

        // Stop observing if all items are visible
        if (visibleCount >= allItems.length) {
          observer.disconnect();
          sentinel.remove();
          loader.remove();
        }
      });
    },
    { rootMargin: '200px' }
  );

  observer.observe(sentinel);
}

/**
 * Builds an individual card <li> from a raw EDS block-item column.
 * @param {HTMLElement} row - The instrumented block-item column div
 * @returns {HTMLElement} li.grid-card-item
 */
function buildCard(row) {
  const li = document.createElement('li');
  li.className = 'grid-card-item';
  moveInstrumentation(row, li);

  // EDS renders fields as rows inside the block-item column.
  // Field order (from models): image, title, description, link (collapsed with linkText/linkTitle)
  const rows = [...row.children];

  // Row 0: image (field-collapsed: image + imageAlt → <picture><img></picture>)
  const imageRow = rows[0];
  // Row 1: title
  const titleRow = rows[1];
  // Row 2: description
  const descRow = rows[2];
  // Row 3: link (field-collapsed: link + linkText + linkTitle → <a>)
  const linkRow = rows[3];

  // Build image wrapper
  if (imageRow) {
    const picture = imageRow.querySelector('picture');
    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'grid-card-image';

    if (picture) {
      const img = picture.querySelector('img');
      if (img) {
        // Optimize image; migrate instrumentation if present
        const optimizedPic = createOptimizedPicture(img.src, img.alt || '', false, [
          { media: '(min-width: 900px)', width: '600' },
          { width: '400' },
        ]);
        moveInstrumentation(img, optimizedPic.querySelector('img'));
        imgWrapper.append(optimizedPic);
      } else {
        imgWrapper.append(picture);
      }
    }
    li.append(imgWrapper);
  }

  // Build card body
  const body = document.createElement('div');
  body.className = 'grid-card-body';

  // Title
  if (titleRow) {
    const titleText = titleRow.textContent.trim();
    if (titleText) {
      const h3 = document.createElement('h3');
      h3.className = 'grid-card-title';
      h3.textContent = titleText;
      body.append(h3);
    }
  }

  // Description
  if (descRow) {
    const descEl = document.createElement('div');
    descEl.className = 'grid-card-description';
    // Move all child nodes to preserve richtext markup
    while (descRow.firstChild) {
      descEl.append(descRow.firstChild);
    }
    body.append(descEl);
  }

  // CTA Link (field-collapsed: link + linkText + linkTitle → <a>)
  if (linkRow) {
    const anchor = linkRow.querySelector('a');
    if (anchor && anchor.href) {
      const ctaWrapper = document.createElement('div');
      ctaWrapper.className = 'grid-card-cta';
      anchor.className = 'grid-card-link';
      // Ensure link text has a fallback
      if (!anchor.textContent.trim()) {
        anchor.textContent = 'Learn more';
      }
      ctaWrapper.append(anchor);
      body.append(ctaWrapper);
    }
  }

  li.append(body);
  return li;
}

export default function decorate(block) {
  const masonry = isMasonry(block);
  const listToggle = hasListToggle(block);
  const infiniteScroll = hasInfiniteScroll(block);
  const colCount = getColumnCount(block);

  // Build grid ul
  const ul = document.createElement('ul');
  ul.className = 'grid-card-grid';

  // Apply column count as a CSS custom property for flexible grid control
  if (!masonry && colCount > 0) {
    ul.style.setProperty('--grid-card-columns', colCount);
  }

  // Guard: block must have at least one child to render
  if (!block.children.length) {
    block.textContent = '';
    return;
  }

  [...block.children].forEach((row) => {
    // Guard: skip completely empty rows (e.g., accidental empty block-items)
    if (!row.textContent.trim() && !row.querySelector('picture, img, a')) return;

    const li = buildCard(row);
    ul.append(li);
  });

  // Guard: don't render empty grid
  if (!ul.children.length) {
    block.textContent = '';
    return;
  }

  // Clear block and append transformed structure
  block.replaceChildren(ul);

  // Apply list view toggle UI
  if (listToggle) {
    buildViewToggle(ul, block);
  }

  // Apply infinite scroll behavior
  if (infiniteScroll) {
    setupInfiniteScroll(ul, block, 6);
  }
}
