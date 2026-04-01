
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

  const BLOCK_FIELD_COUNT = 11;
  const fieldCols = cols.slice(0, BLOCK_FIELD_COUNT);
  const itemCols = cols.slice(BLOCK_FIELD_COUNT);

  // --- LAYER 1: Data Extraction ---
  const data = {
    bgImage: fieldCols[0] ? getCell(fieldCols[0]).querySelector('picture') : null,
    mainTitle: fieldCols[1] ? getCell(fieldCols[1]).textContent.trim() : '',
    subtitle: fieldCols[2] ? getCell(fieldCols[2]).textContent.trim() : '',
    elig1Icon: fieldCols[3] ? getCell(fieldCols[3]).querySelector('picture') : null,
    elig1Text: fieldCols[4] ? getCell(fieldCols[4]).textContent.trim() : '',
    elig2Icon: fieldCols[5] ? getCell(fieldCols[5]).querySelector('picture') : null,
    elig2Text: fieldCols[6] ? getCell(fieldCols[6]).textContent.trim() : '',
    cardTitle: fieldCols[7] ? getCell(fieldCols[7]).textContent.trim() : '',
    cardSubtext: fieldCols[8] ? getCell(fieldCols[8]).textContent.trim() : '',
    footerText: fieldCols[9] ? getCell(fieldCols[9]).textContent.trim() : '',
    footerCta: fieldCols[10] ? getCell(fieldCols[10]).querySelector('a') : null,
  };

  const steps = itemCols.map((col) => {
    const rows = [...col.children];
    return {
      _col: col,
      icon: rows[0] ? rows[0].querySelector('picture') : null,
      textRow: rows[1] || null,
    };
  });

  // --- LAYER 2: Structure Building ---
  
  // Background
  if (data.bgImage) {
    const bgWrapper = document.createElement('div');
    bgWrapper.className = 'info-card-bg';
    moveInstrumentation(fieldCols[0], bgWrapper);
    bgWrapper.appendChild(data.bgImage);
    block.appendChild(bgWrapper);
  }

  const container = document.createElement('div');
  container.className = 'info-card-container';

  // Header Section
  const header = document.createElement('header');
  header.className = 'info-card-header';

  if (data.mainTitle) {
    const h1 = document.createElement('h2'); // Using h2 for block level semantics, visually styled as h1
    h1.className = 'info-card-main-title';
    h1.textContent = data.mainTitle;
    if (fieldCols[1]) moveInstrumentation(fieldCols[1], h1);
    header.appendChild(h1);
  }

  if (data.subtitle) {
    const p = document.createElement('p');
    p.className = 'info-card-subtitle';
    p.textContent = data.subtitle;
    if (fieldCols[2]) moveInstrumentation(fieldCols[2], p);
    header.appendChild(p);
  }

  if (data.elig1Text || data.elig2Text) {
    const eligWrapper = document.createElement('div');
    eligWrapper.className = 'info-card-eligibility';

    if (data.elig1Text) {
      const item1 = document.createElement('div');
      item1.className = 'info-card-elig-item';
      if (data.elig1Icon) item1.appendChild(data.elig1Icon);
      const span1 = document.createElement('span');
      span1.textContent = data.elig1Text;
      item1.appendChild(span1);
      eligWrapper.appendChild(item1);
    }

    if (data.elig2Text) {
      const item2 = document.createElement('div');
      item2.className = 'info-card-elig-item';
      if (data.elig2Icon) item2.appendChild(data.elig2Icon);
      const span2 = document.createElement('span');
      span2.textContent = data.elig2Text;
      item2.appendChild(span2);
      eligWrapper.appendChild(item2);
    }
    header.appendChild(eligWrapper);
  }
  container.appendChild(header);

  // Card Section
  const card = document.createElement('div');
  card.className = 'info-card-box';

  const cardMain = document.createElement('div');
  cardMain.className = 'info-card-main';

  if (data.cardTitle) {
    const h3 = document.createElement('h3');
    h3.className = 'info-card-title';
    h3.textContent = data.cardTitle;
    if (fieldCols[7]) moveInstrumentation(fieldCols[7], h3);
    cardMain.appendChild(h3);
  }

  if (steps.length > 0) {
    const stepsWrapper = document.createElement('div');
    stepsWrapper.className = 'info-card-steps';
    
    steps.forEach((step) => {
      const stepEl = document.createElement('div');
      stepEl.className = 'info-card-step';
      moveInstrumentation(step._col, stepEl);

      const iconWrapper = document.createElement('div');
      iconWrapper.className = 'info-card-step-icon';
      if (step.icon) iconWrapper.appendChild(step.icon);
      stepEl.appendChild(iconWrapper);

      if (step.textRow) {
        const textWrapper = document.createElement('div');
        textWrapper.className = 'info-card-step-text';
        while (step.textRow.firstChild) {
          textWrapper.appendChild(step.textRow.firstChild);
        }
        stepEl.appendChild(textWrapper);
      }

      stepsWrapper.appendChild(stepEl);
    });
    cardMain.appendChild(stepsWrapper);
  }

  if (data.cardSubtext) {
    const divider = document.createElement('hr');
    divider.className = 'info-card-divider';
    cardMain.appendChild(divider);

    const subtext = document.createElement('p');
    subtext.className = 'info-card-subtext';
    subtext.textContent = data.cardSubtext;
    if (fieldCols[8]) moveInstrumentation(fieldCols[8], subtext);
    cardMain.appendChild(subtext);
  }

  card.appendChild(cardMain);

  // Footer Section
  if (data.footerText || data.footerCta) {
    const footer = document.createElement('div');
    footer.className = 'info-card-footer';

    if (data.footerText) {
      const fText = document.createElement('p');
      fText.className = 'info-card-footer-text';
      fText.textContent = data.footerText;
      if (fieldCols[9]) moveInstrumentation(fieldCols[9], fText);
      footer.appendChild(fText);
    }

    if (data.footerCta) {
      const ctaWrapper = document.createElement('div');
      ctaWrapper.className = 'info-card-footer-cta';
      data.footerCta.className = 'button outline';
      if (fieldCols[10]) moveInstrumentation(fieldCols[10], data.footerCta);
      ctaWrapper.appendChild(data.footerCta);
      footer.appendChild(ctaWrapper);
    }

    card.appendChild(footer);
  }

  container.appendChild(card);

  // --- LAYER 3: DOM Swap ---
  block.appendChild(container);
  cols.forEach(col => col.remove());
}
  