
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

  // --- Layer 1: Data Extraction ---
  const titleCell = fieldCols[0] ? getCell(fieldCols[0]) : null;
  const subtitleCell = fieldCols[1] ? getCell(fieldCols[1]) : null;

  const items = itemCols.map((col) => {
    const rows = [...col.children];
    return {
      category: rows[0]?.textContent.trim() || 'Other',
      imageRow: rows[1],
      logoRow: rows[2],
      title: rows[3]?.textContent.trim() || '',
      desc: rows[4]?.textContent.trim() || '',
      ctaRow: rows[5],
      _col: col,
    };
  });

  // Extract unique categories for tabs
  const categories = [...new Set(items.map((item) => item.category))];

  // --- Layer 2: Structure Building ---
  
  // Header
  const header = document.createElement('header');
  header.className = 'tabbed-offers-header';
  
  if (titleCell && titleCell.textContent.trim()) {
    const titleEl = document.createElement('div');
    titleEl.className = 'tabbed-offers-title';
    while (titleCell.firstChild) titleEl.append(titleCell.firstChild);
    header.appendChild(titleEl);
  }

  if (subtitleCell && subtitleCell.textContent.trim()) {
    const subtitleEl = document.createElement('p');
    subtitleEl.className = 'tabbed-offers-subtitle';
    subtitleEl.textContent = subtitleCell.textContent.trim();
    header.appendChild(subtitleEl);
  }

  // Tabs Navigation
  const nav = document.createElement('nav');
  nav.className = 'tabbed-offers-tabs';
  nav.setAttribute('role', 'tablist');

  const tabButtons = [];

  categories.forEach((category, index) => {
    const btn = document.createElement('button');
    btn.className = 'tabbed-offers-tab';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    btn.setAttribute('aria-controls', `tabpanel-${category.replace(/\s+/g, '-').toLowerCase()}`);
    btn.textContent = category;
    btn.dataset.category = category;
    nav.appendChild(btn);
    tabButtons.push(btn);
  });

  // Cards Grid
  const grid = document.createElement('section');
  grid.className = 'tabbed-offers-grid';
  grid.setAttribute('role', 'region');
  grid.setAttribute('aria-live', 'polite');

  const cardElements = [];

  items.forEach((item) => {
    const article = document.createElement('article');
    article.className = 'tabbed-offers-card';
    article.dataset.category = item.category;
    // Initially show only cards matching the first category
    if (item.category !== categories[0]) {
      article.setAttribute('aria-hidden', 'true');
    }
    moveInstrumentation(item._col, article);

    // Hero Image
    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'tabbed-offers-card-image';
    const pic = item.imageRow?.querySelector('picture');
    if (pic) imgWrapper.appendChild(pic);
    article.appendChild(imgWrapper);

    // Content Container
    const content = document.createElement('div');
    content.className = 'tabbed-offers-card-content';

    // Brand Logo
    const logoWrapper = document.createElement('div');
    logoWrapper.className = 'tabbed-offers-brand-logo';
    const logoPic = item.logoRow?.querySelector('picture');
    if (logoPic) logoWrapper.appendChild(logoPic);
    content.appendChild(logoWrapper);

    // Text Content
    const textWrapper = document.createElement('div');
    textWrapper.className = 'tabbed-offers-card-text';

    if (item.title) {
      const h3 = document.createElement('h3');
      h3.className = 'tabbed-offers-card-title';
      h3.textContent = item.title;
      textWrapper.appendChild(h3);
    }

    if (item.desc) {
      const p = document.createElement('p');
      p.className = 'tabbed-offers-card-desc';
      p.textContent = item.desc;
      textWrapper.appendChild(p);
    }
    content.appendChild(textWrapper);

    // CTA Button
    const a = item.ctaRow?.querySelector('a');
    if (a) {
      a.className = 'tabbed-offers-cta';
      content.appendChild(a);
    }

    article.appendChild(content);
    grid.appendChild(article);
    cardElements.push(article);
  });

  // Tab Interaction Logic
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetCategory = btn.dataset.category;

      // Update tab states
      tabButtons.forEach((b) => b.setAttribute('aria-selected', 'false'));
      btn.setAttribute('aria-selected', 'true');

      // Update card visibility
      cardElements.forEach((card) => {
        if (card.dataset.category === targetCategory) {
          card.removeAttribute('aria-hidden');
        } else {
          card.setAttribute('aria-hidden', 'true');
        }
      });
    });
  });

  // --- Layer 3: DOM Swap ---
  block.append(header, nav, grid);
  cols.forEach((col) => col.remove());
}
  