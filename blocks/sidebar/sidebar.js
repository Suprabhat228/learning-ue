
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Determines the section type from the sectionType field rendered as a <p> tag.
 * Falls back to 'info' if not found or unrecognised.
 */
function resolveSectionType(sectionTypeEl) {
  const validTypes = ['navigation', 'info', 'cta', 'tags'];
  if (!sectionTypeEl) return 'info';
  const raw = sectionTypeEl.textContent.trim().toLowerCase();
  return validTypes.includes(raw) ? raw : 'info';
}

/**
 * Builds a navigation section from an unordered list rendered inside richtext.
 * Expects <ul><li><a href="...">Label</a></li></ul> structure from richtext field.
 */
function buildNavigationSection(contentEl) {
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Sidebar navigation');

  const sourceList = contentEl ? contentEl.querySelector('ul') : null;

  if (!sourceList) {
    // Guard: richtext had no list — render empty nav with a hint
    const empty = document.createElement('p');
    empty.className = 'sidebar-section-empty';
    empty.textContent = 'No navigation items.';
    nav.append(empty);
    return nav;
  }

  const ul = document.createElement('ul');
  ul.className = 'sidebar-nav-list';
  ul.setAttribute('role', 'list');

  [...sourceList.querySelectorAll('li')].forEach((li) => {
    const newLi = document.createElement('li');
    newLi.className = 'sidebar-nav-item';

    const anchor = li.querySelector('a');
    if (anchor) {
      const a = document.createElement('a');
      a.href = anchor.href || '#';
      a.textContent = anchor.textContent.trim();
      a.className = 'sidebar-nav-link';

      // Mark active if href matches current path
      try {
        const linkPath = new URL(a.href, window.location.href).pathname;
        if (linkPath === window.location.pathname) {
          a.classList.add('active');
          a.setAttribute('aria-current', 'page');
        }
      } catch {
        // Silently skip malformed URLs
      }

      newLi.append(a);
    } else {
      // Plain text list item fallback
      newLi.textContent = li.textContent.trim();
    }

    ul.append(newLi);
  });

  nav.append(ul);
  return nav;
}

/**
 * Builds a tags/chips section from a richtext list.
 */
function buildTagsSection(contentEl) {
  const wrapper = document.createElement('div');
  wrapper.className = 'sidebar-tags';

  const sourceList = contentEl ? contentEl.querySelector('ul, ol') : null;

  if (!sourceList) {
    const empty = document.createElement('p');
    empty.className = 'sidebar-section-empty';
    empty.textContent = 'No tags.';
    wrapper.append(empty);
    return wrapper;
  }

  [...sourceList.querySelectorAll('li')].forEach((li) => {
    const tag = document.createElement('span');
    tag.className = 'sidebar-tag';
    const anchor = li.querySelector('a');
    if (anchor) {
      const a = document.createElement('a');
      a.href = anchor.href || '#';
      a.textContent = anchor.textContent.trim();
      a.className = 'sidebar-tag-link';
      tag.append(a);
    } else {
      tag.textContent = li.textContent.trim();
    }
    wrapper.append(tag);
  });

  return wrapper;
}

/**
 * Builds a CTA section with a prominent button/link.
 */
function buildCtaSection(contentEl, ctaLinkEl) {
  const wrapper = document.createElement('div');
  wrapper.className = 'sidebar-cta';

  // Render any richtext description above the CTA button
  if (contentEl) {
    const desc = document.createElement('div');
    desc.className = 'sidebar-cta-description';
    while (contentEl.firstElementChild) {
      desc.append(contentEl.firstElementChild);
    }
    wrapper.append(desc);
  }

  // The CTA link is field-collapsed: rendered as an <a> tag
  if (ctaLinkEl) {
    const existingAnchor = ctaLinkEl.querySelector('a');
    if (existingAnchor) {
      existingAnchor.className = 'sidebar-cta-btn';
      existingAnchor.setAttribute('role', 'button');
      wrapper.append(ctaLinkEl);
    }
  }

  return wrapper;
}

/**
 * Builds a generic info section with richtext content.
 */
function buildInfoSection(contentEl) {
  const wrapper = document.createElement('div');
  wrapper.className = 'sidebar-info';

  if (contentEl) {
    while (contentEl.firstElementChild) {
      wrapper.append(contentEl.firstElementChild);
    }
  }

  return wrapper;
}

/**
 * Decorates a single sidebar section item.
 * Row order (from block.json models.fields):
 *   row[0] = sectionTitle (text)
 *   row[1] = sectionContent (richtext)
 *   row[2] = ctaLink (aem-content — field-collapsed <a>)
 *   row[3] = ctaText (text — consumed by field-collapse; may not appear as separate row)
 *   row[4] = sectionType (select)
 */
function decorateSection(item) {
  const rows = [...item.children];

  // Guard: ensure minimum rows exist
  if (rows.length === 0) return null;

  const titleEl = rows[0] || null;
  const contentEl = rows[1] || null;
  const ctaLinkEl = rows[2] || null;
  // rows[3] = ctaText consumed by field-collapse — skip
  const sectionTypeEl = rows[4] || rows[3] || null;

  const type = resolveSectionType(sectionTypeEl);

  const section = document.createElement('div');
  section.className = `sidebar-section sidebar-section--${type}`;
  section.setAttribute('data-section-type', type);

  // Section heading
  if (titleEl) {
    const titleText = titleEl.textContent.trim();
    if (titleText) {
      const heading = document.createElement('h3');
      heading.className = 'sidebar-section-title';
      heading.textContent = titleText;
      section.append(heading);
    }
  }

  // Section body based on type
  let body;
  switch (type) {
    case 'navigation':
      body = buildNavigationSection(contentEl);
      break;
    case 'tags':
      body = buildTagsSection(contentEl);
      break;
    case 'cta':
      body = buildCtaSection(contentEl, ctaLinkEl);
      break;
    case 'info':
    default:
      body = buildInfoSection(contentEl);
      break;
  }

  if (body) section.append(body);

  return section;
}

/**
 * Reads the block variant classes to determine sidebar position and behaviour.
 * Supports: left (default), right, collapsible, sticky, floating.
 */
function resolveVariants(block) {
  const classes = [...block.classList];
  const position = classes.includes('right') ? 'right' : 'left';
  const isCollapsible = classes.includes('collapsible');
  const isSticky = classes.includes('sticky');
  const isFloating = classes.includes('floating');
  return { position, isCollapsible, isSticky, isFloating };
}

/**
 * Injects a collapsible toggle button into the sidebar header.
 */
function addCollapseToggle(sidebar, header) {
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'sidebar-toggle';
  toggleBtn.setAttribute('aria-expanded', 'true');
  toggleBtn.setAttribute('aria-controls', 'sidebar-body');
  toggleBtn.setAttribute('aria-label', 'Toggle sidebar');
  toggleBtn.innerHTML = '<span class="sidebar-toggle-icon" aria-hidden="true"></span>';

  let expanded = true;

  toggleBtn.addEventListener('click', () => {
    expanded = !expanded;
    toggleBtn.setAttribute('aria-expanded', String(expanded));
    sidebar.classList.toggle('sidebar--collapsed', !expanded);
  });

  header.append(toggleBtn);
}

/**
 * Main decorate function — transforms EDS raw HTML into a polished sidebar.
 */
export default function decorate(block) {
  const { position, isCollapsible, isSticky, isFloating } = resolveVariants(block);

  // Build outer sidebar shell
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar-panel';
  sidebar.setAttribute('aria-label', 'Sidebar');
  sidebar.setAttribute('id', 'sidebar-panel');

  if (isSticky) sidebar.classList.add('sidebar-panel--sticky');
  if (isFloating) sidebar.classList.add('sidebar-panel--floating');
  sidebar.classList.add(`sidebar-panel--${position}`);

  // Sidebar header (always present; houses toggle if collapsible)
  const header = document.createElement('div');
  header.className = 'sidebar-header';

  const headerTitle = document.createElement('span');
  headerTitle.className = 'sidebar-header-title';
  headerTitle.textContent = 'Menu';
  headerTitle.setAttribute('aria-hidden', 'true');
  header.append(headerTitle);

  if (isCollapsible) {
    addCollapseToggle(sidebar, header);
  }

  sidebar.append(header);

  // Sidebar body — wraps all sections
  const body = document.createElement('div');
  body.className = 'sidebar-body';
  body.id = 'sidebar-body';

  // Process each block-item (direct children of block = sidebar sections)
  const items = [...block.children];

  if (items.length === 0) {
    // Guard: empty block — render placeholder
    const placeholder = document.createElement('p');
    placeholder.className = 'sidebar-section-empty';
    placeholder.textContent = 'No sidebar sections authored.';
    body.append(placeholder);
  } else {
    items.forEach((item) => {
      const section = decorateSection(item);
      if (section) {
        // Migrate Universal Editor instrumentation from original item to new section wrapper
        moveInstrumentation(item, section);
        body.append(section);
      }
    });
  }

  sidebar.append(body);

  // Add mobile overlay toggle (floating/collapsible variants on small screens)
  if (isCollapsible || isFloating) {
    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'sidebar-mobile-toggle';
    mobileToggle.setAttribute('aria-label', 'Open sidebar');
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.setAttribute('aria-controls', 'sidebar-panel');
    mobileToggle.innerHTML = '<span class="sidebar-hamburger-icon" aria-hidden="true"></span>';

    let mobileOpen = false;

    mobileToggle.addEventListener('click', () => {
      mobileOpen = !mobileOpen;
      mobileToggle.setAttribute('aria-expanded', String(mobileOpen));
      sidebar.classList.toggle('sidebar-panel--open', mobileOpen);
      document.body.classList.toggle('sidebar-overlay-active', mobileOpen);
    });

    // Close sidebar when clicking outside (floating/overlay scenario)
    document.addEventListener('click', (e) => {
      if (
        mobileOpen
        && !sidebar.contains(e.target)
        && !mobileToggle.contains(e.target)
      ) {
        mobileOpen = false;
        mobileToggle.setAttribute('aria-expanded', 'false');
        sidebar.classList.remove('sidebar-panel--open');
        document.body.classList.remove('sidebar-overlay-active');
      }
    });

    block.closest('.section')?.prepend(mobileToggle);
  }

  // Keyboard: close collapsible sidebar with Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('sidebar-panel--open')) {
      sidebar.classList.remove('sidebar-panel--open');
      document.body.classList.remove('sidebar-overlay-active');
    }
  });

  // Replace block content with the composed sidebar
  block.replaceChildren(sidebar);
}
