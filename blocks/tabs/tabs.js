
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

  // Block model has 2 fields: section-title, tabs-heading
  const BLOCK_FIELD_COUNT = 2;
  const fieldCols = cols.slice(0, BLOCK_FIELD_COUNT);
  const itemCols = cols.slice(BLOCK_FIELD_COUNT);

  const [sectionTitleCol, tabsHeadingCol] = fieldCols;

  // Root wrapper for the whole component
  const section = document.createElement('section');
  section.className = 'tabs-section';

  // Header
  const header = document.createElement('header');
  header.className = 'tabs-header';

  if (sectionTitleCol) {
    const h1 = document.createElement('h2');
    h1.className = 'tabs-title';
    const cell = getCell(sectionTitleCol);
    while (cell.firstChild) h1.append(cell.firstChild);
    header.append(h1);
  }

  // Nav (tablist)
  const nav = document.createElement('nav');
  nav.className = 'tabs-nav';
  nav.setAttribute('role', 'tablist');

  if (tabsHeadingCol) {
    const labelCell = getCell(tabsHeadingCol);
    const ariaLabel = labelCell.textContent.trim();
    if (ariaLabel) {
      nav.setAttribute('aria-label', ariaLabel);
    }
  }

  // Collect items by type based on model expectations:
  // tabs-item: 2 rows
  // tabs-card: 9 rows
  // tabs-meta-pill: 2 rows
  // tabs-feature: 2 rows
  const tabItems = [];
  const cards = [];
  const metaPills = [];
  const features = [];

  itemCols.forEach((col) => {
    const rows = [...col.children];
    const rowCount = rows.length;

    if (rowCount === 2) {
      // Could be tabs-item, tabs-meta-pill, or tabs-feature
      const firstCell = getCell(rows[0]);
      const secondCell = getCell(rows[1]);
      const firstText = firstCell.textContent.trim();
      const secondText = secondCell.textContent.trim();

      // Heuristic: if second row is short (label-like) and first row looks like an ID, treat as meta-pill or feature
      if (firstText && secondText) {
        // If second row contains spaces and is longer, likely a feature
        if (secondText.length > 40 || secondText.split(' ').length > 6) {
          features.push({ col, rows });
        } else if (secondText.length <= 40) {
          // meta pill (short label)
          metaPills.push({ col, rows });
        } else {
          tabItems.push({ col, rows });
        }
      } else {
        // default to tab item
        tabItems.push({ col, rows });
      }
    } else if (rowCount === 9) {
      cards.push({ col, rows });
    }
  });

  // Build tab buttons
  const tabConfig = [];

  tabItems.forEach(({ col, rows }, index) => {
    const [labelRow, idRow] = rows;
    const labelCell = getCell(labelRow);
    const idCell = getCell(idRow);
    const label = labelCell.textContent.trim();
    const id = idCell.textContent.trim() || `tab-${index + 1}`;

    const button = document.createElement('button');
    button.className = 'tabs-tab-button';
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.setAttribute('data-tab-id', id);
    button.id = `tab-${id}`;
    button.textContent = label || id;

    nav.append(button);
    tabConfig.push({ id, label, button });
  });

  header.append(nav);
  section.append(header);

  // Panels container
  const panelsWrapper = document.createElement('div');
  panelsWrapper.className = 'tabs-panels';

  // Group cards, meta pills, and features by tab-id
  const cardsByTab = new Map();
  cards.forEach(({ rows }) => {
    const [
      tabIdRow,
      headingRow,
      subtitleRow,
      cardNameRow,
      cardTagRow,
      primaryLinkRow,
      primaryTextRow,
      secondaryLinkRow,
      secondaryTextRow,
    ] = rows;

    const tabId = getCell(tabIdRow).textContent.trim();
    if (!tabId) return;

    const cardData = {
      headingRow,
      subtitleRow,
      cardNameRow,
      cardTagRow,
      primaryLinkRow,
      primaryTextRow,
      secondaryLinkRow,
      secondaryTextRow,
    };

    cardsByTab.set(tabId, cardData);
  });

  const metaByTab = new Map();
  metaPills.forEach(({ rows }) => {
    const [tabIdRow, pillRow] = rows;
    const tabId = getCell(tabIdRow).textContent.trim();
    const pillText = getCell(pillRow).textContent.trim();
    if (!tabId || !pillText) return;
    if (!metaByTab.has(tabId)) metaByTab.set(tabId, []);
    metaByTab.get(tabId).push(pillText);
  });

  const featuresByTab = new Map();
  features.forEach(({ rows }) => {
    const [tabIdRow, featureRow] = rows;
    const tabId = getCell(tabIdRow).textContent.trim();
    if (!tabId) return;
    if (!featuresByTab.has(tabId)) featuresByTab.set(tabId, []);
    featuresByTab.get(tabId).push(featureRow);
  });

  // Build panels for each tab
  tabConfig.forEach(({ id }, index) => {
    const panel = document.createElement('div');
    panel.className = 'tabs-panel';
    panel.id = `panel-${id}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `tab-${id}`);

    const inner = document.createElement('div');
    inner.className = 'tabs-panel-inner';

    const left = document.createElement('div');
    left.className = 'tabs-panel-left';

    const right = document.createElement('div');
    right.className = 'tabs-panel-right';

    const cardData = cardsByTab.get(id);

    // Left side: heading, subtitle, card list (single primary card for now)
    if (cardData?.headingRow) {
      const h2 = document.createElement('h3');
      h2.className = 'tabs-panel-heading';
      const cell = getCell(cardData.headingRow);
      while (cell.firstChild) h2.append(cell.firstChild);
      left.append(h2);
    }

    if (cardData?.subtitleRow) {
      const p = document.createElement('p');
      p.className = 'tabs-panel-subtitle';
      const cell = getCell(cardData.subtitleRow);
      while (cell.firstChild) p.append(cell.firstChild);
      left.append(p);
    }

    const cardList = document.createElement('ul');
    cardList.className = 'tabs-card-list';
    cardList.setAttribute('role', 'list');

    if (cardData?.cardNameRow) {
      const li = document.createElement('li');
      li.className = 'tabs-card-list-item is-selected';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'tabs-card-name';
      nameSpan.textContent = getCell(cardData.cardNameRow).textContent.trim();
      li.append(nameSpan);

      if (cardData.cardTagRow) {
        const tagText = getCell(cardData.cardTagRow).textContent.trim();
        if (tagText) {
          const tagSpan = document.createElement('span');
          tagSpan.className = 'tabs-card-tag';
          tagSpan.textContent = tagText;
          li.append(tagSpan);
        }
      }

      cardList.append(li);
    }

    left.append(cardList);

    // Right side: image placeholder, meta pills, features, CTAs
    const imagePlaceholder = document.createElement('div');
    imagePlaceholder.className = 'tabs-card-image-placeholder';
    imagePlaceholder.setAttribute('aria-hidden', 'true');
    right.append(imagePlaceholder);

    const metaWrapper = document.createElement('div');
    metaWrapper.className = 'tabs-card-meta';

    const pills = metaByTab.get(id) || [];
    pills.forEach((pillText) => {
      const span = document.createElement('span');
      span.className = 'tabs-meta-pill';
      span.textContent = pillText;
      metaWrapper.append(span);
    });

    right.append(metaWrapper);

    const featuresList = document.createElement('ul');
    featuresList.className = 'tabs-card-features';

    const featureRows = featuresByTab.get(id) || [];
    featureRows.forEach((featureRow) => {
      const li = document.createElement('li');
      const cell = getCell(featureRow);
      while (cell.firstChild) li.append(cell.firstChild);
      featuresList.append(li);
    });

    right.append(featuresList);

    const actions = document.createElement('div');
    actions.className = 'tabs-card-actions';

    if (cardData?.secondaryLinkRow && cardData?.secondaryTextRow) {
      const linkCell = getCell(cardData.secondaryLinkRow);
      const textCell = getCell(cardData.secondaryTextRow);
      const href = linkCell.textContent.trim();
      const text = textCell.textContent.trim();
      if (href && text) {
        const a = document.createElement('a');
        a.className = 'tabs-btn tabs-btn-outline';
        a.href = href;
        a.textContent = text;
        actions.append(a);
      }
    }

    if (cardData?.primaryLinkRow && cardData?.primaryTextRow) {
      const linkCell = getCell(cardData.primaryLinkRow);
      const textCell = getCell(cardData.primaryTextRow);
      const href = linkCell.textContent.trim();
      const text = textCell.textContent.trim();
      if (href && text) {
        const a = document.createElement('a');
        a.className = 'tabs-btn tabs-btn-primary';
        a.href = href;
        a.textContent = text;
        actions.append(a);
      }
    }

    right.append(actions);

    inner.append(left, right);
    panel.append(inner);
    panelsWrapper.append(panel);

    // Instrumentation: move from first contributing column to panel
    const sourceCol = cardsByTab.get(id)
      ? cards.find(({ rows }) => rows[0] === cardsByTab.get(id).headingRow?.previousElementSibling)?.col
      : null;
    if (sourceCol) {
      moveInstrumentation(sourceCol, panel);
    }
  });

  section.append(panelsWrapper);

  // Insert new structure and remove old columns
  block.textContent = '';
  block.append(section);
  cols.forEach((col) => col.remove());

  // Interactivity: tabs behavior
  const buttons = nav.querySelectorAll('.tabs-tab-button');
  const panels = panelsWrapper.querySelectorAll('.tabs-panel');

  if (!buttons.length || !panels.length) return;

  // Set initial active tab
  buttons.forEach((btn, index) => {
    const tabId = btn.getAttribute('data-tab-id');
    const panel = panelsWrapper.querySelector(`#panel-${tabId}`);
    const isActive = index === 0;
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    btn.setAttribute('tabindex', isActive ? '0' : '-1');
    btn.classList.toggle('is-active', isActive);
    if (panel) {
      panel.classList.toggle('is-active', isActive);
      panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    }
  });

  function activateTab(targetId) {
    buttons.forEach((btn) => {
      const tabId = btn.getAttribute('data-tab-id');
      const isActive = tabId === targetId;
      const panel = panelsWrapper.querySelector(`#panel-${tabId}`);
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      btn.setAttribute('tabindex', isActive ? '0' : '-1');
      if (panel) {
        panel.classList.toggle('is-active', isActive);
        panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      }
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab-id');
      if (targetId) activateTab(targetId);
    });

    btn.addEventListener('keydown', (event) => {
      const currentIndex = [...buttons].indexOf(btn);
      let newIndex = currentIndex;

      if (event.key === 'ArrowRight') {
        newIndex = (currentIndex + 1) % buttons.length;
      } else if (event.key === 'ArrowLeft') {
        newIndex = (currentIndex - 1 + buttons.length) % buttons.length;
      } else if (event.key === 'Home') {
        newIndex = 0;
      } else if (event.key === 'End') {
        newIndex = buttons.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      const newBtn = buttons[newIndex];
      const targetId = newBtn.getAttribute('data-tab-id');
      if (targetId) {
        activateTab(targetId);
        newBtn.focus();
      }
    });
  });
}
  