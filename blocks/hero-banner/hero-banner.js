import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const VALID_VARIANTS = ['text-only', 'image-bg', 'video-bg', 'split', 'gradient'];

const FIELD = {
  VARIANT: 1,
  EYEBROW: 2,
  TITLE: 3,
  DESCRIPTION: 4,
  PRIMARY_LINK: 5,
  SECONDARY_LINK: 6,
  IMAGE: 7,
  VIDEO_URL: 8,
  SLIDES: 9,
};

function getCellText(block, index) {
  const cell = block.querySelector(`:scope > div:nth-child(${index}) > div`);
  return cell ? cell.textContent.trim() : '';
}

function getCellHtml(block, index) {
  const cell = block.querySelector(`:scope > div:nth-child(${index}) > div`);
  return cell ? cell.innerHTML.trim() : '';
}

function getCellAnchor(block, index) {
  return block.querySelector(`:scope > div:nth-child(${index}) > div a`) || null;
}

function getCellPicture(block, index) {
  return block.querySelector(`:scope > div:nth-child(${index}) > div picture`) || null;
}

function optimisePicture(picture, alt = '') {
  if (!picture) return null;
  const img = picture.querySelector('img');
  if (!img) return picture;
  const optimised = createOptimizedPicture(img.src, alt || img.alt, false, [
    { media: '(min-width: 900px)', width: '1440' },
    { width: '750' },
  ]);
  moveInstrumentation(img, optimised.querySelector('img'));
  picture.replaceWith(optimised);
  return optimised;
}

function buildCta(anchor, className) {
  if (!anchor || !anchor.href) return null;
  const a = document.createElement('a');
  a.href = anchor.href;
  if (anchor.title) a.title = anchor.title;
  a.textContent = anchor.textContent.trim() || anchor.href;
  a.className = className;
  return a;
}

function buildActions(primaryAnchor, secondaryAnchor) {
  const primaryCta = buildCta(primaryAnchor, 'hero-banner-cta hero-banner-cta--primary');
  const secondaryCta = buildCta(secondaryAnchor, 'hero-banner-cta hero-banner-cta--secondary');
  if (!primaryCta && !secondaryCta) return null;
  const actions = document.createElement('div');
  actions.className = 'hero-banner-actions';
  if (primaryCta) actions.append(primaryCta);
  if (secondaryCta) actions.append(secondaryCta);
  return actions;
}

function buildTextContent({ eyebrow, title, descHtml, primaryAnchor, secondaryAnchor }) {
  const content = document.createElement('div');
  content.className = 'hero-banner-content';

  if (eyebrow) {
    const el = document.createElement('p');
    el.className = 'hero-banner-eyebrow';
    el.textContent = eyebrow;
    content.append(el);
  }

  if (title) {
    const h1 = document.createElement('h1');
    h1.className = 'hero-banner-title';
    h1.textContent = title;
    content.append(h1);
  }

  if (descHtml) {
    const desc = document.createElement('div');
    desc.className = 'hero-banner-description';
    desc.innerHTML = descHtml;
    content.append(desc);
  }

  const actions = buildActions(primaryAnchor, secondaryAnchor);
  if (actions) content.append(actions);

  return content;
}

export default function decorate(block) {
  const rawVariant = getCellText(block, FIELD.VARIANT);
  const variant = VALID_VARIANTS.includes(rawVariant) ? rawVariant : 'text-only';
  block.classList.add(`hero-banner--${variant}`);

  const eyebrow = getCellText(block, FIELD.EYEBROW);
  const title = getCellText(block, FIELD.TITLE);
  const descHtml = getCellHtml(block, FIELD.DESCRIPTION);
  const primaryAnchor = getCellAnchor(block, FIELD.PRIMARY_LINK);
  const secondaryAnchor = getCellAnchor(block, FIELD.SECONDARY_LINK);
  const data = { eyebrow, title, descHtml, primaryAnchor, secondaryAnchor };

  const firstInstrumented = block.firstElementChild;
  const inner = document.createElement('div');
  inner.className = 'hero-banner-inner';
  if (firstInstrumented) moveInstrumentation(firstInstrumented, inner);

  // image-bg variant
  if (variant === 'image-bg') {
    let picture = getCellPicture(block, FIELD.IMAGE);
    picture = optimisePicture(picture, getCellText(block, FIELD.IMAGE));

    console.log('picture after optimise:', picture);

    if (picture) {
      const bg = document.createElement('div');
      bg.className = 'hero-banner-bg';
      bg.append(picture);
      block.prepend(bg);
    }
    inner.classList.add('hero-banner-inner--image-bg');
  } else {
    inner.classList.add(`hero-banner-inner--${variant}`);
  }

  inner.append(buildTextContent(data));
  [...block.children].forEach((row) => {
    row.style.display = 'none';
  });
  block.append(inner);
}