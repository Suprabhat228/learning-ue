import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Editorial Cards Block
 *
 * GDoc / SharePoint table structure (one row per card):
 *
 * | editorial-cards            |                                         |
 * |----------------------------|------------------------------------------|
 * | Category (e.g. "Design")   | Image (picture) OR icon char (e.g. "✦") |
 * | Badge color class          | Title                                    |
 * | Tag1, Tag2, Tag3           | Description paragraph                    |
 * | Author Name                | Author date (e.g. "Apr 10")              |
 * | Stat1Label:Stat1Value, ... | (optional stats row, leave blank if none) |
 *
 * Block variants (added as extra classes in table header):
 *   "editorial-cards (featured)"   → first card spans 2 columns
 *   "editorial-cards (horizontal)" → cards render side-by-side (image left)
 *
 * Section variants (via Section Metadata "Style" field):
 *   "dark-bg"  → dark surface cards
 *   "light-bg" → explicit light override
 *
 * Category → badge color map:
 *   design   → badge-accent (terracotta)
 *   tech     → badge-blue
 *   nature   → badge-green
 *   business → badge-yellow
 */

const CATEGORY_BADGE_MAP = {
  design: 'badge-accent',
  tech: 'badge-blue',
  nature: 'badge-green',
  business: 'badge-yellow',
};

const HEART_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5
  0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
</svg>`;

const BOOKMARK_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
</svg>`;

/**
 * Parse the author text cell: expects "Author Name | Date" or two separate lines.
 */
function parseAuthor(cell) {
  const text = cell ? cell.textContent.trim() : '';
  const parts = text.split('|').map((s) => s.trim());
  return {
    name: parts[0] || '',
    date: parts[1] || '',
    initials: parts[0]
      ? parts[0].split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
      : '??',
  };
}

/**
 * Parse stats string: "Views:4.2k, Saves:312, Comments:48"
 */
function parseStats(cell) {
  if (!cell) return [];
  const text = cell.textContent.trim();
  if (!text) return [];
  return text.split(',').map((pair) => {
    const [label, value] = pair.split(':').map((s) => s.trim());
    return { label: label || '', value: value || '' };
  }).filter((s) => s.label && s.value);
}

/**
 * Parse tags string: "Layout, Visual Design, Typography"
 */
function parseTags(cell) {
  if (!cell) return [];
  return cell.textContent.trim().split(',').map((t) => t.trim()).filter(Boolean);
}

/**
 * Build the decorative image placeholder (used when no real picture provided).
 */
function buildIconImage(iconChar, bgColor, textColor) {
  const wrap = document.createElement('div');
  wrap.className = 'editorial-cards-card-image editorial-cards-card-image--icon';
  wrap.style.background = bgColor || 'var(--accent-light)';
  wrap.style.color = textColor || 'var(--accent)';

  const pattern = document.createElement('div');
  pattern.className = 'image-pattern';
  wrap.append(pattern);

  const icon = document.createElement('span');
  icon.className = 'image-icon';
  icon.textContent = iconChar || '◈';
  wrap.append(icon);

  return wrap;
}

/**
 * Build the real picture image wrapper.
 */
function buildPictureImage(picture) {
  const wrap = document.createElement('div');
  wrap.className = 'editorial-cards-card-image';
  wrap.append(picture);
  return wrap;
}

/**
 * Build badge element.
 */
function buildBadge(category) {
  const cls = CATEGORY_BADGE_MAP[category.toLowerCase()] || 'badge-accent';
  const badge = document.createElement('span');
  badge.className = `badge ${cls}`;

  const dot = document.createElement('span');
  dot.className = 'badge-dot';
  badge.append(dot);
  badge.append(document.createTextNode(category));
  return badge;
}

/**
 * Build card body (badge + title + desc + tags).
 */
function buildCardBody(category, title, desc, tags) {
  const body = document.createElement('div');
  body.className = 'editorial-cards-card-body';

  body.append(buildBadge(category));

  const h3 = document.createElement('h3');
  h3.className = 'editorial-cards-card-title';
  h3.textContent = title;
  body.append(h3);

  if (desc) {
    const p = document.createElement('p');
    p.className = 'editorial-cards-card-desc';
    p.textContent = desc;
    body.append(p);
  }

  if (tags.length) {
    const tagsWrap = document.createElement('div');
    tagsWrap.className = 'editorial-cards-card-tags';
    tags.forEach((tag) => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = tag;
      tagsWrap.append(span);
    });
    body.append(tagsWrap);
  }

  return body;
}

/**
 * Build stats row.
 */
function buildStats(stats) {
  if (!stats.length) return null;
  const row = document.createElement('div');
  row.className = 'editorial-cards-card-stats';
  stats.forEach(({ label, value }) => {
    const stat = document.createElement('div');
    stat.className = 'stat';

    const val = document.createElement('span');
    val.className = 'stat-value';
    val.textContent = value;

    const lbl = document.createElement('span');
    lbl.className = 'stat-label';
    lbl.textContent = label;

    stat.append(val, lbl);
    row.append(stat);
  });
  return row;
}

/**
 * Build card footer (avatar + author info + action buttons).
 */
function buildCardFooter(author, cardId) {
  const footer = document.createElement('div');
  footer.className = 'editorial-cards-card-footer';

  const meta = document.createElement('div');
  meta.className = 'card-meta';

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.setAttribute('aria-hidden', 'true');
  avatar.textContent = author.initials;

  const metaText = document.createElement('div');
  metaText.className = 'card-meta-text';

  const nameSpan = document.createElement('span');
  nameSpan.className = 'meta-name';
  nameSpan.textContent = author.name;

  const dateSpan = document.createElement('span');
  dateSpan.className = 'meta-date';
  dateSpan.textContent = author.date;

  metaText.append(nameSpan, dateSpan);
  meta.append(avatar, metaText);

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const likeBtn = document.createElement('button');
  likeBtn.className = 'icon-btn like-btn';
  likeBtn.type = 'button';
  likeBtn.setAttribute('aria-label', 'Like this card');
  likeBtn.setAttribute('aria-pressed', 'false');
  likeBtn.dataset.id = cardId;
  likeBtn.innerHTML = HEART_SVG;
  likeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const pressed = likeBtn.getAttribute('aria-pressed') === 'true';
    likeBtn.setAttribute('aria-pressed', String(!pressed));
    likeBtn.classList.toggle('liked', !pressed);
  });

  const saveBtn = document.createElement('button');
  saveBtn.className = 'icon-btn save-btn';
  saveBtn.type = 'button';
  saveBtn.setAttribute('aria-label', 'Save this card');
  saveBtn.setAttribute('aria-pressed', 'false');
  saveBtn.innerHTML = BOOKMARK_SVG;
  saveBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const pressed = saveBtn.getAttribute('aria-pressed') === 'true';
    saveBtn.setAttribute('aria-pressed', String(!pressed));
    saveBtn.classList.toggle('saved', !pressed);
  });

  actions.append(likeBtn, saveBtn);
  footer.append(meta, actions);
  return footer;
}

/**
 * Build a single <li> card from a block row.
 * Row columns expected:
 *   col[0]: category text (first line) + icon char (second line, optional)
 *   col[1]: picture OR icon char
 *   col[2]: badge color hint (optional) | title
 *   col[3]: tags (csv) | description
 *   col[4]: author "Name | Date"
 *   col[5]: stats "Label:Value, ..." (optional)
 *
 * Simplified two-column table layout (the most common EDS pattern):
 *   col[0]: picture / icon + category
 *   col[1]: title, description, tags, author, stats (paragraphs in order)
 */
function buildCardFromRow(row, index) {
  const cols = [...row.children];
  const li = document.createElement('li');
  moveInstrumentation(row, li);

  // --- Image column (col 0) ---
  const imageCol = cols[0];
  const picture = imageCol ? imageCol.querySelector('picture') : null;

  // Category from first <p> or <strong> in image col, or data attribute
  const categoryEl = imageCol ? imageCol.querySelector('p, strong') : null;
  const category = categoryEl ? categoryEl.textContent.trim() : 'design';

  // Icon char: second <p> in image col (if no picture)
  const iconEls = imageCol ? [...imageCol.querySelectorAll('p')] : [];
  const iconChar = (!picture && iconEls[1]) ? iconEls[1].textContent.trim() : '◈';

  let imageWrap;
  if (picture) {
    // Optimize the picture
    const img = picture.querySelector('img');
    if (img) {
      const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
      moveInstrumentation(img, optimizedPic.querySelector('img'));
      img.closest('picture').replaceWith(optimizedPic);
      imageWrap = buildPictureImage(imageCol.querySelector('picture'));
    } else {
      imageWrap = buildIconImage(iconChar);
    }
  } else {
    imageWrap = buildIconImage(iconChar);
  }

  // --- Content column (col 1) ---
  const contentCol = cols[1];
  const paragraphs = contentCol ? [...contentCol.querySelectorAll('p')] : [];

  const title = paragraphs[0] ? paragraphs[0].textContent.trim() : `Card ${index + 1}`;
  const desc = paragraphs[1] ? paragraphs[1].textContent.trim() : '';
  const tagsText = paragraphs[2] ? paragraphs[2].textContent.trim() : '';
  const tags = tagsText ? tagsText.split(',').map((t) => t.trim()).filter(Boolean) : [];
  const authorText = paragraphs[3] ? paragraphs[3].textContent.trim() : '';
  const statsText = paragraphs[4] ? paragraphs[4].textContent.trim() : '';

  // Parse author "Name | Date"
  const authorParts = authorText.split('|').map((s) => s.trim());
  const author = {
    name: authorParts[0] || 'Author',
    date: authorParts[1] || '',
    initials: authorParts[0]
      ? authorParts[0].split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
      : 'AU',
  };

  // Parse stats "Views:4.2k, Saves:312"
  const stats = statsText
    ? statsText.split(',').map((pair) => {
      const [label, value] = pair.split(':').map((s) => s.trim());
      return { label, value };
    }).filter((s) => s.label && s.value)
    : [];

  const body = buildCardBody(category, title, desc, tags);
  const statsRow = buildStats(stats);
  const footer = buildCardFooter(author, index);

  li.append(imageWrap, body);
  if (statsRow) li.append(statsRow);
  li.append(footer);

  // Store category for filtering
  li.dataset.category = category.toLowerCase();

  return li;
}

/**
 * Build the filter bar from unique categories found in the card list.
 */
function buildFilterBar(ul) {
  const categories = new Set();
  ul.querySelectorAll('li[data-category]').forEach((li) => {
    categories.add(li.dataset.category);
  });

  if (categories.size < 2) return null;

  const bar = document.createElement('div');
  bar.className = 'editorial-cards-filter-bar';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', 'Filter cards by category');

  const allBtn = document.createElement('button');
  allBtn.type = 'button';
  allBtn.className = 'filter-btn active';
  allBtn.dataset.filter = 'all';
  allBtn.textContent = 'All';
  bar.append(allBtn);

  [...categories].sort().forEach((cat) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'filter-btn';
    btn.dataset.filter = cat;
    btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    bar.append(btn);
  });

  bar.addEventListener('click', (e) => {
    if (!e.target.matches('.filter-btn')) return;
    bar.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    e.target.classList.add('active');
    const filter = e.target.dataset.filter;

    ul.querySelectorAll('li').forEach((li) => {
      const match = filter === 'all' || li.dataset.category === filter;
      li.hidden = !match;
    });
  });

  return bar;
}

export default function decorate(block) {
  // Determine variants from block classes
  const isFeatured = block.classList.contains('featured');
  const isHorizontal = block.classList.contains('horizontal');

  // Build <ul>
  const ul = document.createElement('ul');
  ul.className = 'editorial-cards-list';
  if (isFeatured) ul.classList.add('has-featured');
  if (isHorizontal) ul.classList.add('is-horizontal');

  [...block.children].forEach((row, index) => {
    const li = buildCardFromRow(row, index);
    if (index === 0 && isFeatured) li.classList.add('card-featured');
    if (isHorizontal) li.classList.add('card-horizontal');
    ul.append(li);
  });

  // Build filter bar
  const filterBar = buildFilterBar(ul);

  // Replace block content
  block.textContent = '';
  if (filterBar) block.append(filterBar);
  block.append(ul);
}
