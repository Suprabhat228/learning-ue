
import { moveInstrumentation } from '../../scripts/scripts.js';

function getColumns(block) {
  const children = [...block.children];
  return children.length === 1 && children[0].children.length > 1
    ? [...children[0].children]
    : children;
}

function getCell(el) {
  const divs = el.querySelectorAll(':scope > div');
  return divs.length ? divs[divs.length - 1] : el;
}

export default function decorate(block) {
  const cols = getColumns(block);
  if (!cols.length) return;

  const BLOCK_FIELD_COUNT = 2;
  const fieldCols = cols.slice(0, BLOCK_FIELD_COUNT);
  const itemCols = cols.slice(BLOCK_FIELD_COUNT);

  // ── LAYER 1: Data Extraction ─────────────────────────────────────────────
  
  // Extract Header Data
  const headingCell = fieldCols[0] ? getCell(fieldCols[0]) : null;
  const linkCell = fieldCols[1] ? getCell(fieldCols[1]) : null;

  // Extract Item Data
  const items = itemCols.map((col) => {
    const rows = [...col.children];
    return {
      _col: col,
      imageRow: rows[0],
      swatchesRow: rows[1],
      contentRow: rows[2],
      actionsRow: rows[3],
    };
  });

  // ── LAYER 2: Structure Building ──────────────────────────────────────────

  // Build Header
  const headerEl = document.createElement('div');
  headerEl.className = 'carousel-header';

  if (headingCell && headingCell.textContent.trim()) {
    const headingWrapper = document.createElement('div');
    headingWrapper.className = 'carousel-heading';
    if (fieldCols[0]) moveInstrumentation(fieldCols[0], headingWrapper);
    while (headingCell.firstChild) headingWrapper.append(headingCell.firstChild);
    headerEl.appendChild(headingWrapper);
  }

  if (linkCell && linkCell.querySelector('a')) {
    const linkWrapper = document.createElement('div');
    linkWrapper.className = 'carousel-compare-link';
    if (fieldCols[1]) moveInstrumentation(fieldCols[1], linkWrapper);
    const a = linkCell.querySelector('a');
    linkWrapper.appendChild(a);
    headerEl.appendChild(linkWrapper);
  }

  // Build Track
  const trackContainer = document.createElement('div');
  trackContainer.className = 'carousel-track-container';
  
  const track = document.createElement('ul');
  track.className = 'carousel-track';

  items.forEach(({ _col, imageRow, swatchesRow, contentRow, actionsRow }) => {
    const card = document.createElement('li');
    card.className = 'carousel-card';
    moveInstrumentation(_col, card);

    // Image
    let mainPicture = null;
    if (imageRow && imageRow.querySelector('picture')) {
      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'carousel-card-image';
      mainPicture = imageRow.querySelector('picture');
      imgWrapper.appendChild(mainPicture);
      card.appendChild(imgWrapper);
    }

    // Swatches
    if (swatchesRow && swatchesRow.textContent.trim()) {
      const swatchesText = swatchesRow.textContent.trim();
      const swatchList = document.createElement('ul');
      swatchList.className = 'carousel-swatches';
      
      swatchesText.split(',').forEach((color, index) => {
        const hex = color.trim();
        if (hex) {
          const li = document.createElement('li');
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'carousel-swatch';
          button.style.backgroundColor = hex;
          button.setAttribute('aria-label', `Select color ${hex}`);
          button.dataset.swatchIndex = index.toString();
          li.appendChild(button);
          swatchList.appendChild(li);
        }
      });
      card.appendChild(swatchList);

      // Swatch interaction: on click, change image based on swatch index
      if (mainPicture) {
        const img = mainPicture.querySelector('img');
        const originalSrc = img?.getAttribute('src') || '';
        const originalAlt = img?.getAttribute('alt') || '';

        const swatchButtons = swatchList.querySelectorAll('.carousel-swatch');
        swatchButtons.forEach((btn, idx) => {
          btn.addEventListener('click', () => {
            // Expect data-image-0, data-image-1, ... on the picture for alternate images
            const dataAttr = `image${idx}`;
            const newSrc = mainPicture.dataset[dataAttr] || originalSrc;
            if (img && newSrc) {
              img.setAttribute('src', newSrc);
            }
            // Optional: update alt if provided via data-alt-*
            const altAttr = `imageAlt${idx}`;
            const newAlt = mainPicture.dataset[altAttr] || originalAlt;
            if (img && newAlt) {
              img.setAttribute('alt', newAlt);
            }

            // Visual selected state
            swatchButtons.forEach((b) => b.classList.remove('is-active'));
            btn.classList.add('is-active');
          });
        });
      }
    }

    // Content (Badge, Title, Desc, Price)
    if (contentRow) {
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'carousel-card-content';
      while (contentRow.firstChild) contentWrapper.append(contentRow.firstChild);
      card.appendChild(contentWrapper);
    }

    // Actions (Buttons/Links)
    if (actionsRow) {
      const actionsWrapper = document.createElement('div');
      actionsWrapper.className = 'carousel-card-actions';
      while (actionsRow.firstChild) actionsWrapper.append(actionsRow.firstChild);
      card.appendChild(actionsWrapper);
    }

    track.appendChild(card);
  });

  trackContainer.appendChild(track);

  // Build Controls
  const controlsEl = document.createElement('div');
  controlsEl.className = 'carousel-controls';
  
  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-btn carousel-btn-prev';
  prevBtn.setAttribute('aria-label', 'Previous');
  prevBtn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
  
  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-btn carousel-btn-next';
  nextBtn.setAttribute('aria-label', 'Next');
  nextBtn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';

  controlsEl.appendChild(prevBtn);
  controlsEl.appendChild(nextBtn);

  // ── LAYER 3: DOM Swap & Interaction ──────────────────────────────────────

  block.append(headerEl, trackContainer, controlsEl);
  cols.forEach((col) => col.remove());

  // Carousel Interaction Logic
  const updateButtons = () => {
    // Disable prev if at start
    prevBtn.disabled = track.scrollLeft <= 0;
    // Disable next if at end (allow 1px rounding tolerance)
    nextBtn.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
  };

  track.addEventListener('scroll', updateButtons, { passive: true });
  
  // Initial check after a short delay to ensure layout is calculated
  setTimeout(updateButtons, 100);
  window.addEventListener('resize', updateButtons);

  const scrollTrack = (direction) => {
    const firstCard = track.querySelector('.carousel-card');
    if (!firstCard) return;
    
    const cardWidth = firstCard.offsetWidth;
    const gap = parseInt(window.getComputedStyle(track).gap, 10) || 0;
    const scrollAmount = cardWidth + gap;
    
    track.scrollBy({
      left: direction === 'next' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  };

  prevBtn.addEventListener('click', () => scrollTrack('prev'));
  nextBtn.addEventListener('click', () => scrollTrack('next'));
}
  