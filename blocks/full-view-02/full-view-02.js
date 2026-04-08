
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

  const parentFieldCount = 4;
  const fieldCols = cols.slice(0, parentFieldCount);
  const itemCols = cols.slice(parentFieldCount);

  // Block-level fields
  const blockIdText = fieldCols[0]?.textContent.trim() || '';
  const eyebrowText = fieldCols[1]?.textContent.trim() || '';
  const headingText = fieldCols[2]?.textContent.trim() || 'Highlights';
  const descriptionRow = fieldCols[3] ? getCell(fieldCols[3]) : null;

  if (blockIdText) {
    block.id = blockIdText;
  }

  // Extract items
  const items = itemCols.map((col) => {
    const rows = [...col.children];
    return {
      _col: col,
      title: rows[0]?.textContent.trim() || '',
      iconPicture: rows[1]?.querySelector('picture') || null,
      iconBg: rows[2]?.textContent.trim() || '',
      bodyRow: rows[3] || null,
      badge: rows[4]?.textContent.trim() || '',
      linkLabel: rows[5]?.textContent.trim() || '',
      linkUrl: rows[6]?.textContent.trim() || '',
    };
  });

  // Build structure
  const wrapper = document.createElement('div');
  wrapper.className = 'full-view-02-inner';

  const header = document.createElement('header');
  header.className = 'full-view-02-header';

  if (eyebrowText) {
    const eyebrowEl = document.createElement('p');
    eyebrowEl.className = 'full-view-02-eyebrow';
    eyebrowEl.textContent = eyebrowText;
    header.append(eyebrowEl);
  }

  const h2 = document.createElement('h2');
  h2.className = 'full-view-02-heading';
  h2.textContent = headingText;
  header.append(h2);

  if (descriptionRow && descriptionRow.textContent.trim()) {
    const desc = document.createElement('div');
    desc.className = 'full-view-02-description';
    while (descriptionRow.firstChild) {
      desc.append(descriptionRow.firstChild);
    }
    header.append(desc);
  }

  const grid = document.createElement('section');
  grid.className = 'full-view-02-grid';

  items.forEach((item) => {
    const { _col, title, iconPicture, iconBg, bodyRow, badge, linkLabel, linkUrl } = item;

    const card = document.createElement('article');
    card.className = 'full-view-02-card';
    moveInstrumentation(_col, card);

    const cardInner = document.createElement('div');
    cardInner.className = 'full-view-02-card-inner';

    // Icon container
    if (iconPicture) {
      const iconWrapper = document.createElement('div');
      iconWrapper.className = 'full-view-02-icon-wrapper';
      if (iconBg) {
        iconWrapper.style.setProperty('--full-view-02-icon-bg', iconBg);
      }
      iconWrapper.append(iconPicture);
      const img = iconWrapper.querySelector('img');
      if (img) {
        img.loading = 'lazy';
      }
      cardInner.append(iconWrapper);
    }

    // Text content
    const textWrapper = document.createElement('div');
    textWrapper.className = 'full-view-02-text';

    if (badge) {
      const badgeEl = document.createElement('p');
      badgeEl.className = 'full-view-02-badge';
      badgeEl.textContent = badge;
      textWrapper.append(badgeEl);
    }

    if (title) {
      const titleEl = document.createElement('h3');
      titleEl.className = 'full-view-02-title';
      titleEl.textContent = title;
      textWrapper.append(titleEl);
    }

    if (bodyRow && bodyRow.textContent.trim()) {
      const bodyEl = document.createElement('div');
      bodyEl.className = 'full-view-02-body';
      moveInstrumentation(bodyRow, bodyEl);
      while (bodyRow.firstChild) {
        bodyEl.append(bodyRow.firstChild);
      }
      textWrapper.append(bodyEl);
    }

    if (linkLabel && linkUrl) {
      const linkEl = document.createElement('a');
      linkEl.className = 'full-view-02-link';
      linkEl.href = linkUrl;
      linkEl.textContent = linkLabel;
      textWrapper.append(linkEl);
    }

    cardInner.append(textWrapper);
    card.append(cardInner);
    grid.append(card);
  });

  wrapper.append(header, grid);
  block.append(wrapper);

  cols.forEach((col) => col.remove());
}
  