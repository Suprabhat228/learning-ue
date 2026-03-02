import { moveInstrumentation } from '../../scripts/scripts.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Safely reads text content from an element, returning a fallback if not found.
 * @param {Element} el
 * @param {string} fallback
 * @returns {string}
 */
function getText(el, fallback = '') {
  return el?.textContent?.trim() || fallback;
}

/**
 * Reads a src attribute from a picture > img within an element.
 * @param {Element} el
 * @returns {string}
 */
function getImageSrc(el) {
  return el?.querySelector('img')?.getAttribute('src') || '';
}

/**
 * Reads alt text from a picture > img within an element.
 * @param {Element} el
 * @returns {string}
 */
function getImageAlt(el) {
  return el?.querySelector('img')?.getAttribute('alt') || '';
}

/**
 * Validates a hex color code (e.g. #1a1a2e or #fff).
 * @param {string} code
 * @returns {boolean}
 */
function isValidHex(code) {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(code.trim());
}

/**
 * Determines whether a color is light or dark to set appropriate contrast text.
 * @param {string} hex
 * @returns {'light'|'dark'}
 */
function getLuminance(hex) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  // Standard luminance formula for contrast determination
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? 'light' : 'dark';
}

/**
 * Parses block-level fields from the first 7 children (columns).
 * Field order follows models[].fields order defined in _product-color-feature.json:
 *   0: productName, 1: productSubtitle, 2: productImage (field-collapsed with productImageAlt),
 *   3: productPrice, 4: colorSectionLabel, 5: ctaLink (field-collapsed with ctaLinkText, ctaLinkTitle)
 *
 * NOTE: field-collapse merges imageAlt into the <img alt>, so productImageAlt is NOT a separate column.
 * Similarly, ctaLinkText and ctaLinkTitle collapse into the <a> tag attributes — no extra columns.
 * That leaves us columns: 0=productName, 1=productSubtitle, 2=productImage, 3=productPrice,
 *   4=colorSectionLabel, 5=ctaLink
 */
function parseBlockFields(block) {
  const cols = [...block.children];

  // Guard: block must have at least 5 columns for core fields
  if (cols.length < 5) {
    console.warn('[product-color-feature] Insufficient block columns. Check authoring.');
  }

  return {
    productNameEl: cols[0] || null,
    productSubtitleEl: cols[1] || null,
    productImageEl: cols[2] || null,   // picture already built by EDS field-collapse
    productPriceEl: cols[3] || null,
    colorSectionLabelEl: cols[4] || null,
    ctaLinkEl: cols[5] || null,        // <a> already built by EDS field-collapse
    swatchCols: cols.slice(6),         // remaining columns = color-swatch block-items
  };
}

/**
 * Parses a single color-swatch block-item column.
 * Field order (rows inside the column):
 *   row 0: colorName, row 1: colorCode, row 2: colorImage (+ colorImageAlt collapsed),
 *   row 3: isDefault (checkbox renders as "true"/"false" text)
 */
function parseSwatchItem(col) {
  const rows = [...col.children];

  // Each row is a <div> wrapping the field value
  const colorName = getText(rows[0]);
  const rawCode = getText(rows[1]);
  const imageSrc = getImageSrc(rows[2]);
  const imageAlt = getImageAlt(rows[2]);
  const isDefaultRaw = getText(rows[3], 'false');

  // Validate hex code; fall back to transparent if invalid
  const colorCode = isValidHex(rawCode) ? rawCode.trim() : '';

  const isDefault = isDefaultRaw.toLowerCase() === 'true';

  return {
    colorName,
    colorCode,
    imageSrc,
    imageAlt,
    isDefault,
    // Keep original instrumented col for moveInstrumentation
    originalCol: col,
  };
}

/**
 * Updates the product image display and active swatch state.
 * @param {HTMLElement} imageWrapper - The container holding the product picture
 * @param {string} imageSrc - New image src
 * @param {string} imageAlt - New image alt text
 * @param {string} colorName - Name of selected color (for ARIA live region)
 * @param {HTMLElement} liveRegion - ARIA live region for screen reader announcements
 * @param {NodeList} allButtons - All swatch buttons
 * @param {HTMLElement} activeButton - Currently selected button
 * @param {HTMLElement} colorLabel - Element showing current color name
 */
function activateSwatch(imageWrapper, imageSrc, imageAlt, colorName, liveRegion, allButtons, activeButton, colorLabel) {
  // Update active state on swatch buttons
  allButtons.forEach((btn) => {
    btn.setAttribute('aria-pressed', 'false');
    btn.classList.remove('is-active');
  });
  activeButton.setAttribute('aria-pressed', 'true');
  activeButton.classList.add('is-active');

  // Update color name label
  if (colorLabel) {
    colorLabel.textContent = colorName;
  }

  // Update product image if a variant image is provided
  if (imageSrc && imageWrapper) {
    // Remove old picture and replace with optimized version
    const existingPicture = imageWrapper.querySelector('picture');
    const newPicture = createOptimizedPicture(imageSrc, imageAlt || colorName, false, [
      { media: '(min-width: 768px)', width: '800' },
      { width: '400' },
    ]);
    newPicture.classList.add('product-color-feature-product-image');

    if (existingPicture) {
      existingPicture.replaceWith(newPicture);
    } else {
      imageWrapper.appendChild(newPicture);
    }

    // Smooth fade transition
    newPicture.style.opacity = '0';
    requestAnimationFrame(() => {
      newPicture.style.transition = 'opacity 0.3s ease';
      newPicture.style.opacity = '1';
    });
  }

  // Announce to screen readers
  if (liveRegion) {
    liveRegion.textContent = `Color changed to ${colorName}`;
  }
}

/**
 * Main decorate function for the product-color-feature block.
 * Transforms EDS-generated column/row HTML into a product color selector UI.
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  // Clear block content before rebuilding
  block.textContent = '';

  // ── 1. Parse all block-level fields and swatch items ──────────────────────
  const {
    productNameEl,
    productSubtitleEl,
    productImageEl,
    productPriceEl,
    colorSectionLabelEl,
    ctaLinkEl,
    swatchCols,
  } = parseBlockFields(block);

  // Extract values from parsed columns
  const productName = getText(productNameEl);
  const productSubtitle = getText(productSubtitleEl);
  const productPrice = getText(productPriceEl);
  const colorSectionLabel = getText(colorSectionLabelEl, 'Select Color');

  // Extract the EDS-rendered picture element (field-collapsed image + alt)
  const productPicture = productImageEl?.querySelector('picture') || null;

  // Extract the EDS-rendered <a> tag (field-collapsed link)
  const ctaAnchor = ctaLinkEl?.querySelector('a') || null;

  // Guard: warn if no product image is provided
  if (!productPicture) {
    console.warn('[product-color-feature] No product image found. Check block authoring.');
  }

  // ── 2. Parse swatch items ─────────────────────────────────────────────────
  const swatches = swatchCols.map(parseSwatchItem).filter((s) => {
    // Only include swatches with valid color codes
    if (!s.colorCode) {
      console.warn(`[product-color-feature] Swatch "${s.colorName}" has an invalid or missing hex code. Skipping.`);
      return false;
    }
    return true;
  });

  // Guard: block is unusable without at least one valid swatch
  if (swatches.length === 0) {
    console.error('[product-color-feature] No valid color swatches found. Block will render without color selection.');
  }

  // Determine default swatch (explicitly marked, or first available)
  const defaultSwatchIndex = swatches.findIndex((s) => s.isDefault);
  const activeIndex = defaultSwatchIndex !== -1 ? defaultSwatchIndex : 0;

  // ── 3. Build the new DOM structure ────────────────────────────────────────

  // ARIA live region for screen reader announcements (hidden visually)
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'product-color-feature-live-region sr-only';

  // ── 3a. Product Image Section ─────────────────────────────────────────────
  const imageSection = document.createElement('div');
  imageSection.className = 'product-color-feature-image-section';

  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'product-color-feature-image-wrapper';
  imageWrapper.setAttribute('role', 'img');
  imageWrapper.setAttribute('aria-label', productName || 'Product image');

  if (productPicture) {
    // Move the EDS-rendered picture into the wrapper
    // Migrate instrumentation from the original container to the picture element
    if (productImageEl) moveInstrumentation(productImageEl, imageWrapper);
    productPicture.classList.add('product-color-feature-product-image');
    imageWrapper.appendChild(productPicture);
  }

  // If default swatch has its own image, swap to it on init
  const defaultSwatch = swatches[activeIndex];
  if (defaultSwatch?.imageSrc && productPicture) {
    const initPicture = createOptimizedPicture(
      defaultSwatch.imageSrc,
      defaultSwatch.imageAlt || defaultSwatch.colorName,
      true, // eager load for above-the-fold product image
      [
        { media: '(min-width: 768px)', width: '800' },
        { width: '400' },
      ],
    );
    initPicture.classList.add('product-color-feature-product-image');
    productPicture.replaceWith(initPicture);
  }

  imageSection.appendChild(imageWrapper);

  // ── 3b. Product Info Section ──────────────────────────────────────────────
  const infoSection = document.createElement('div');
  infoSection.className = 'product-color-feature-info-section';

  // Product name
  if (productName) {
    // Migrate instrumentation from the original column
    const nameEl = document.createElement('h1');
    nameEl.className = 'product-color-feature-product-name';
    if (productNameEl) moveInstrumentation(productNameEl, nameEl);
    nameEl.textContent = productName;
    infoSection.appendChild(nameEl);
  }

  // Product subtitle
  if (productSubtitle) {
    const subtitleEl = document.createElement('p');
    subtitleEl.className = 'product-color-feature-product-subtitle';
    if (productSubtitleEl) moveInstrumentation(productSubtitleEl, subtitleEl);
    subtitleEl.textContent = productSubtitle;
    infoSection.appendChild(subtitleEl);
  }

  // Product price
  if (productPrice) {
    const priceEl = document.createElement('p');
    priceEl.className = 'product-color-feature-product-price';
    if (productPriceEl) moveInstrumentation(productPriceEl, priceEl);
    priceEl.setAttribute('aria-label', `Price: ${productPrice}`);
    priceEl.textContent = productPrice;
    infoSection.appendChild(priceEl);
  }

  // Divider
  const divider = document.createElement('hr');
  divider.className = 'product-color-feature-divider';
  infoSection.appendChild(divider);

  // ── 3c. Color Selector Section ────────────────────────────────────────────
  const colorSection = document.createElement('div');
  colorSection.className = 'product-color-feature-color-section';

  // Color section header row (label + selected color name)
  const colorHeader = document.createElement('div');
  colorHeader.className = 'product-color-feature-color-header';

  const colorLabelEl = document.createElement('span');
  colorLabelEl.className = 'product-color-feature-color-label';
  if (colorSectionLabelEl) moveInstrumentation(colorSectionLabelEl, colorLabelEl);
  colorLabelEl.textContent = colorSectionLabel;

  const selectedColorName = document.createElement('span');
  selectedColorName.className = 'product-color-feature-selected-color-name';
  selectedColorName.setAttribute('aria-live', 'polite');
  selectedColorName.textContent = defaultSwatch?.colorName || '';

  colorHeader.appendChild(colorLabelEl);
  colorHeader.appendChild(selectedColorName);
  colorSection.appendChild(colorHeader);

  // Swatch button group
  const swatchGroup = document.createElement('div');
  swatchGroup.className = 'product-color-feature-swatch-group';
  swatchGroup.setAttribute('role', 'group');
  swatchGroup.setAttribute('aria-label', colorSectionLabel);

  const swatchButtons = [];

  swatches.forEach((swatch, index) => {
    const swatchBtn = document.createElement('button');
    swatchBtn.type = 'button';
    swatchBtn.className = 'product-color-feature-swatch-btn';
    swatchBtn.setAttribute('aria-label', swatch.colorName);
    swatchBtn.setAttribute('aria-pressed', index === activeIndex ? 'true' : 'false');
    swatchBtn.setAttribute('title', swatch.colorName);

    // Apply the color as background via CSS custom property
    swatchBtn.style.setProperty('--swatch-color', swatch.colorCode);

    // Determine contrast for the active check mark
    const luminanceClass = getLuminance(swatch.colorCode) === 'light'
      ? 'swatch-light'
      : 'swatch-dark';
    swatchBtn.classList.add(luminanceClass);

    if (index === activeIndex) {
      swatchBtn.classList.add('is-active');
    }

    // Migrate instrumentation from the original swatch column to the button
    moveInstrumentation(swatch.originalCol, swatchBtn);

    swatchButtons.push(swatchBtn);
    swatchGroup.appendChild(swatchBtn);
  });

  colorSection.appendChild(swatchGroup);
  infoSection.appendChild(colorSection);

  // ── 3d. CTA Button ────────────────────────────────────────────────────────
  if (ctaAnchor) {
    const ctaWrapper = document.createElement('div');
    ctaWrapper.className = 'product-color-feature-cta-wrapper';
    ctaAnchor.className = 'product-color-feature-cta-btn';
    ctaAnchor.setAttribute('role', 'button');

    // Guard: ensure href is valid before rendering CTA
    if (!ctaAnchor.href || ctaAnchor.href === window.location.href) {
      console.warn('[product-color-feature] CTA link href appears invalid or missing.');
    }

    if (ctaLinkEl) moveInstrumentation(ctaLinkEl, ctaAnchor);
    ctaWrapper.appendChild(ctaAnchor);
    infoSection.appendChild(ctaWrapper);
  }

  // ── 4. Wire up event listeners ────────────────────────────────────────────
  swatchButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      const swatch = swatches[index];
      activateSwatch(
        imageWrapper,
        swatch.imageSrc,
        swatch.imageAlt,
        swatch.colorName,
        liveRegion,
        swatchButtons,
        btn,
        selectedColorName,
      );
    });

    // Keyboard: allow Space and Enter to activate (buttons handle Enter natively,
    // but explicit handling ensures consistent behavior across all browsers)
    btn.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // ── 5. Build final block layout ───────────────────────────────────────────
  const wrapper = document.createElement('div');
  wrapper.className = 'product-color-feature-wrapper';
  wrapper.appendChild(imageSection);
  wrapper.appendChild(infoSection);

  // Replace entire block content with the new structure
  block.appendChild(liveRegion);
  block.appendChild(wrapper);
}