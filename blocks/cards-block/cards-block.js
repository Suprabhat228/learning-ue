
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const cols = getColumns(block);
  if (!cols.length) return;

  // Handle style/variant row (none in this block)
  const BLOCK_FIELD_COUNT = 3; // section-label, section-heading, section-subtitle
  const fieldCols = cols.slice(0, BLOCK_FIELD_COUNT);
  const itemCols = cols.slice(BLOCK_FIELD_COUNT);

  // Section wrapper
  const section = document.createElement('section');
  section.className = 'cards-block';
  moveInstrumentation(block, section);

  // Section inner
  const inner = document.createElement('div');
  inner.className = 'cards-block-inner';

  // Section label
  if (fieldCols[0]) {
    const label = document.createElement('div');
    label.className = 'cards-block-label';
    moveInstrumentation(fieldCols[0], label);
    label.textContent = fieldCols[0].textContent.trim();
    inner.appendChild(label);
  }

  // Section heading (richtext)
  if (fieldCols[1]) {
    const heading = document.createElement('h2');
    moveInstrumentation(fieldCols[1], heading);
    const headingCell = getCell(fieldCols[1]);
    while (headingCell.firstChild) heading.appendChild(headingCell.firstChild);
    inner.appendChild(heading);
  }

  // Section subtitle (richtext)
  if (fieldCols[2]) {
    const subtitle = document.createElement('p');
    subtitle.className = 'cards-block-subtitle';
    moveInstrumentation(fieldCols[2], subtitle);
    const subtitleCell = getCell(fieldCols[2]);
    while (subtitleCell.firstChild) subtitle.appendChild(subtitleCell.firstChild);
    inner.appendChild(subtitle);
  }

  // Cards grid
  const grid = document.createElement('div');
  grid.className = 'cards-block-grid';

  itemCols.forEach((itemCol) => {
    const card = document.createElement('article');
    card.className = 'cards-block-card';
    moveInstrumentation(itemCol, card);

    const cardInner = document.createElement('div');
    cardInner.className = 'cards-block-card-inner';

    // Card rows in model order
    const [
      tagRow, titleRow,
      feature1Row, feature2Row, feature3Row, feature4Row,
      primaryCtaRow, secondaryCtaRow
    ] = [...itemCol.children];

    // Card tag
    if (tagRow) {
      const tag = document.createElement('div');
      tag.className = 'cards-block-tag';
      moveInstrumentation(tagRow, tag);
      tag.textContent = tagRow.textContent.trim();
      cardInner.appendChild(tag);
    }

    // Card title
    if (titleRow) {
      const title = document.createElement('div');
      title.className = 'cards-block-title';
      moveInstrumentation(titleRow, title);
      title.textContent = titleRow.textContent.trim();
      cardInner.appendChild(title);
    }

    // Features list
    const features = document.createElement('ul');
    features.className = 'cards-block-features';

    [feature1Row, feature2Row, feature3Row, feature4Row].forEach((featureRow, i) => {
      if (!featureRow) return;
      const li = document.createElement('li');
      const tick = document.createElement('div');
      tick.className = 'cards-block-tick';
      tick.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>';

      const featureText = document.createElement('div');
      moveInstrumentation(featureRow, featureText);
      const featureCell = getCell(featureRow);
      while (featureCell.firstChild) featureText.appendChild(featureCell.firstChild);

      li.append(tick, featureText);
      features.appendChild(li);
    });

    cardInner.appendChild(features);

    // CTA buttons
    const actions = document.createElement('div');
    actions.className = 'cards-block-actions';

    if (primaryCtaRow?.querySelector('a')) {
      const primaryBtn = primaryCtaRow.querySelector('a').cloneNode(true);
      primaryBtn.className = 'cards-block-btn-primary';
      actions.appendChild(primaryBtn);
    }

    if (secondaryCtaRow?.querySelector('a')) {
      const secondaryBtn = secondaryCtaRow.querySelector('a').cloneNode(true);
      secondaryBtn.className = 'cards-block-btn-ghost';
      actions.appendChild(secondaryBtn);
    }

    cardInner.appendChild(actions);
    card.appendChild(cardInner);
    grid.appendChild(card);
  });

  inner.appendChild(grid);
  section.appendChild(inner);
  block.appendChild(section);

  // Clean up old columns
  cols.forEach(col => col.remove());
}

// Helper to normalize columns
function getColumns(block) {
  const children = [...block.children];
  return children.length === 1 && children[0].children.length > 1
    ? [...children[0].children]
    : children;
}

// Helper to get cell content
function getCell(el) {
  const divs = el.querySelectorAll(':scope > div');
  return divs.length ? divs[divs.length - 1] : el;
}
