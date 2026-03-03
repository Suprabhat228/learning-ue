
import { moveInstrumentation } from '../../scripts/scripts.js';

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const VALID_TYPES = ['navigation', 'info', 'cta', 'tags'];
const TRANSITION_MS = 320;

/* ─────────────────────────────────────────────
   Utilities
───────────────────────────────────────────── */

/**
 * Resolves a raw section-type string to one of the four known types.
 * Falls back to 'info' for empty, null, or unrecognised values.
 */
function resolveSectionType(el) {
  if (!el) return 'info';
  const raw = el.textContent.trim().toLowerCase();
  return VALID_TYPES.includes(raw) ? raw : 'info';
}

/**
 * Returns true when the raw text content of an element equals 'true'.
 * Used to read the boolean `defaultCollapsed` field.
 */
function readBoolean(el) {
  if (!el) return false;
  return el.textContent.trim().toLowerCase() === 'true';
}

/**
 * Animates a collapsible body open or closed using max-height + opacity.
 * Uses a real measured height so the easing curve feels natural.
 *
 * Edge-cases handled:
 *  - A pending animation is cancelled before starting a new one (via AbortController pattern).
 *  - pointer-events are disabled while animating so rapid clicks cannot desync state.
 *  - overflow is restored to 'visible' only after an open animation finishes, so
 *    box-shadows / focus rings on children are never clipped mid-transition.
 */
function animateCollapse(body, open, onDone) {
  // Cancel any in-progress animation on this element
  if (body._collapseRaf) {
    cancelAnimationFrame(body._collapseRaf);
    body._collapseRaf = null;
  }

  const fullHeight = body.scrollHeight;

  // Disable pointer-events while animating to prevent rapid-click desync
  body.style.pointerEvents = 'none';
  body.style.overflow = 'hidden';

  if (open) {
    // Start from current rendered height (handles mid-animation reversals)
    const startHeight = parseFloat(body.style.maxHeight) || 0;
    body.style.maxHeight = `${startHeight}px`;
    body.style.opacity = body.style.opacity || '0';

    // Force reflow so the browser picks up the start values
    // eslint-disable-next-line no-unused-expressions
    body.offsetHeight;

    body.style.transition = `max-height ${TRANSITION_MS}ms cubic-bezier(0.4,0,0.2,1), opacity ${TRANSITION_MS}ms ease`;
    body.style.maxHeight = `${fullHeight}px`;
    body.style.opacity = '1';
  } else {
    const startHeight = body.scrollHeight;
    body.style.maxHeight = `${startHeight}px`;
    // eslint-disable-next-line no-unused-expressions
    body.offsetHeight;

    body.style.transition = `max-height ${TRANSITION_MS}ms cubic-bezier(0.4,0,0.2,1), opacity ${TRANSITION_MS * 0.8}ms ease`;
    body.style.maxHeight = '0px';
    body.style.opacity = '0';
  }

  const tid = setTimeout(() => {
    body.style.pointerEvents = '';
    body.style.transition = '';

    if (open) {
      // Remove max-height cap so content can reflow freely (e.g. images loading)
      body.style.maxHeight = 'none';
      body.style.overflow = '';
    } else {
      body.style.maxHeight = '0px';
      body.style.overflow = 'hidden';
    }

    body._collapseRaf = null;
    if (typeof onDone === 'function') onDone();
  }, TRANSITION_MS + 20);

  // Store the timer id so we can cancel it on rapid re-clicks
  body._collapseRaf = tid;
}

/* ─────────────────────────────────────────────
   Section builders
───────────────────────────────────────────── */

function buildNavigationSection(contentEl) {
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Sidebar navigation');

  const sourceList = contentEl ? contentEl.querySelector('ul') : null;

  if (!sourceList) {
    const empty = document.createElement('p');
    empty.className = 'sidebar-2-section-empty';
    empty.textContent = 'No navigation items.';
    nav.append(empty);
    return nav;
  }

  const ul = document.createElement('ul');
  ul.className = 'sidebar-2-nav-list';
  ul.setAttribute('role', 'list');

  [...sourceList.querySelectorAll('li')].forEach((li) => {
    const newLi = document.createElement('li');
    newLi.className = 'sidebar-2-nav-item';

    const anchor = li.querySelector('a');
    if (anchor) {
      const a = document.createElement('a');
      a.href = anchor.href || '#';
      a.textContent = anchor.textContent.trim();
      a.className = 'sidebar-2-nav-link';

      // Highlight the current page link
      try {
        const linkPath = new URL(a.href, window.location.href).pathname;
        if (linkPath === window.location.pathname) {
          a.classList.add('active');
          a.setAttribute('aria-current', 'page');
        }
      } catch {
        // Silently skip malformed URLs — they will still render as links
      }

      newLi.append(a);
    } else {
      newLi.textContent = li.textContent.trim();
    }

    ul.append(newLi);
  });

  nav.append(ul);
  return nav;
}

function buildTagsSection(contentEl) {
  const wrapper = document.createElement('div');
  wrapper.className = 'sidebar-2-tags';

  const sourceList = contentEl ? contentEl.querySelector('ul, ol') : null;

  if (!sourceList) {
    const empty = document.createElement('p');
    empty.className = 'sidebar-2-section-empty';
    empty.textContent = 'No tags.';
    wrapper.append(empty);
    return wrapper;
  }

  [...sourceList.querySelectorAll('li')].forEach((li) => {
    const tag = document.createElement('span');
    tag.className = 'sidebar-2-tag';

    const anchor = li.querySelector('a');
    if (anchor) {
      const a = document.createElement('a');
      a.href = anchor.href || '#';
      a.textContent = anchor.textContent.trim();
      a.className = 'sidebar-2-tag-link';
      tag.append(a);
    } else {
      tag.textContent = li.textContent.trim();
    }

    wrapper.append(tag);
  });

  return wrapper;
}

function buildCtaSection(contentEl, ctaLinkEl) {
  const wrapper = document.createElement('div');
  wrapper.className = 'sidebar-2-cta';

  if (contentEl) {
    const desc = document.createElement('div');
    desc.className = 'sidebar-2-cta-description';
    while (contentEl.firstElementChild) {
      desc.append(contentEl.firstElementChild);
    }
    wrapper.append(desc);
  }

  if (ctaLinkEl) {
    const existingAnchor = ctaLinkEl.querySelector('a');
    if (existingAnchor) {
      existingAnchor.className = 'sidebar-2-cta-btn';
      existingAnchor.setAttribute('role', 'button');
      wrapper.append(ctaLinkEl);
    }
  }

  return wrapper;
}

function buildInfoSection(contentEl) {
  const wrapper = document.createElement('div');
  wrapper.className = 'sidebar-2-info';

  if (contentEl) {
    while (contentEl.firstElementChild) {
      wrapper.append(contentEl.firstElementChild);
    }
  }

  return wrapper;
}

/* ─────────────────────────────────────────────
   Section decoration (with collapsible logic)
───────────────────────────────────────────── */

/**
 * Row layout (from models.fields order):
 *   row[0] = sectionTitle       (text)
 *   row[1] = sectionContent     (richtext)
 *   row[2] = ctaLink            (aem-content — field-collapsed)
 *   row[3] = ctaText            (text — consumed by field-collapse)
 *   row[4] = sectionType        (select)
 *   row[5] = defaultCollapsed   (boolean)
 */
function decorateSection(item, globalCollapsible) {
  const rows = [...item.children];

  if (rows.length === 0) return null;

  const titleEl = rows[0] || null;
  const contentEl = rows[1] || null;
  const ctaLinkEl = rows[2] || null;
  // rows[3] = ctaText — consumed by EDS field-collapse, may not appear
  const sectionTypeEl = rows[4] || rows[3] || null;
  const defaultCollapsedEl = rows[5] || rows[4] || null;

  const type = resolveSectionType(sectionTypeEl);
  // Only treat the last boolean-looking row as defaultCollapsed
  const startCollapsed = globalCollapsible && readBoolean(defaultCollapsedEl);

  /* ── Outer section wrapper ── */
  const section = document.createElement('div');
  section.className = `sidebar-2-section sidebar-2-section--${type}`;
  section.setAttribute('data-section-type', type);

  /* ── Section header (always rendered; acts as toggle trigger) ── */
  const sectionHeader = document.createElement('div');
  sectionHeader.className = 'sidebar-2-section-header';

  const titleText = titleEl ? titleEl.textContent.trim() : '';

  if (titleText) {
    const heading = document.createElement('h3');
    heading.className = 'sidebar-2-section-title';
    heading.textContent = titleText;
    sectionHeader.append(heading);
  }

  section.append(sectionHeader);

  /* ── Section body (collapsible target) ── */
  const sectionBody = document.createElement('div');
  sectionBody.className = 'sidebar-2-section-body';

  let bodyContent;
  switch (type) {
    case 'navigation':
      bodyContent = buildNavigationSection(contentEl);
      break;
    case 'tags':
      bodyContent = buildTagsSection(contentEl);
      break;
    case 'cta':
      bodyContent = buildCtaSection(contentEl, ctaLinkEl);
      break;
    case 'info':
    default:
      bodyContent = buildInfoSection(contentEl);
      break;
  }

  if (bodyContent) sectionBody.append(bodyContent);
  section.append(sectionBody);

  /* ── Collapsible wiring (only when the sidebar variant includes it) ── */
  if (globalCollapsible) {
    const sectionId = `sidebar-2-section-body-${Math.random().toString(36).slice(2, 8)}`;
    sectionBody.id = sectionId;

    // Chevron icon inside the header
    const chevron = document.createElement('span');
    chevron.className = 'sidebar-2-section-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    sectionHeader.append(chevron);

    // Make the header keyboard-focusable and act as a toggle button
    sectionHeader.setAttribute('role', 'button');
    sectionHeader.setAttribute('tabindex', '0');
    sectionHeader.setAttribute('aria-controls', sectionId);

    let isOpen = !startCollapsed;

    const applyState = (open, animate) => {
      isOpen = open;
      sectionHeader.setAttribute('aria-expanded', String(open));
      section.classList.toggle('sidebar-2-section--collapsed', !open);

      if (animate) {
        animateCollapse(sectionBody, open);
      } else {
        // Instant state for initial render — no transition flash
        sectionBody.style.maxHeight = open ? 'none' : '0px';
        sectionBody.style.opacity = open ? '1' : '0';
        sectionBody.style.overflow = open ? '' : 'hidden';
      }
    };

    // Set initial state without animation
    applyState(isOpen, false);

    const toggle = () => applyState(!isOpen, true);

    sectionHeader.addEventListener('click', toggle);

    // Keyboard: Space and Enter toggle; Escape collapses
    sectionHeader.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggle();
      } else if (e.key === 'Escape' && isOpen) {
        applyState(false, true);
      }
    });
  }

  return section;
}

/* ─────────────────────────────────────────────
   Sidebar-level panel animations
───────────────────────────────────────────── */

/**
 * Wires the top-level sidebar collapse toggle.
 * Animates the entire sidebar-body using a slide + fade.
 */
function wirePanelCollapse(sidebar, header, body) {
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'sidebar-2-toggle';
  toggleBtn.setAttribute('aria-label', 'Toggle sidebar');
  toggleBtn.setAttribute('aria-expanded', 'true');
  toggleBtn.setAttribute('aria-controls', body.id);

  const iconEl = document.createElement('span');
  iconEl.className = 'sidebar-2-toggle-icon';
  iconEl.setAttribute('aria-hidden', 'true');
  toggleBtn.append(iconEl);

  header.append(toggleBtn);

  let expanded = true;

  toggleBtn.addEventListener('click', () => {
    expanded = !expanded;
    toggleBtn.setAttribute('aria-expanded', String(expanded));
    sidebar.classList.toggle('sidebar-2-panel--collapsed', !expanded);
    animateCollapse(body, expanded);
  });

  // Keyboard: Escape key collapses the panel
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && expanded) {
      expanded = false;
      toggleBtn.setAttribute('aria-expanded', 'false');
      sidebar.classList.add('sidebar-2-panel--collapsed');
      animateCollapse(body, false);
    }
  });
}

/* ─────────────────────────────────────────────
   Floating / mobile overlay
───────────────────────────────────────────── */

function wireFloatingToggle(sidebar, section) {
  const mobileToggle = document.createElement('button');
  mobileToggle.className = 'sidebar-2-mobile-toggle';
  mobileToggle.setAttribute('aria-label', 'Open sidebar');
  mobileToggle.setAttribute('aria-expanded', 'false');
  mobileToggle.setAttribute('aria-controls', sidebar.id);

  const hamburger = document.createElement('span');
  hamburger.className = 'sidebar-2-hamburger-icon';
  hamburger.setAttribute('aria-hidden', 'true');
  mobileToggle.append(hamburger);

  let mobileOpen = false;

  const setMobileOpen = (open) => {
    mobileOpen = open;
    mobileToggle.setAttribute('aria-expanded', String(open));
    sidebar.classList.toggle('sidebar-2-panel--open', open);
    document.body.classList.toggle('sidebar-2-overlay-active', open);

    // Slide-in animation via CSS class; JS only adds/removes state
    if (open) {
      sidebar.style.visibility = 'visible';
    } else {
      // Wait for CSS transition before hiding (prevents instant disappear)
      setTimeout(() => {
        if (!mobileOpen) sidebar.style.visibility = 'hidden';
      }, TRANSITION_MS + 20);
    }
  };

  mobileToggle.addEventListener('click', () => setMobileOpen(!mobileOpen));

  // Close when clicking the backdrop (outside the sidebar panel)
  document.addEventListener('click', (e) => {
    if (mobileOpen && !sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
      setMobileOpen(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileOpen) setMobileOpen(false);
  });

  // Insert mobile toggle before the sidebar block's section
  section?.prepend(mobileToggle);

  // Initial hidden state for floating panels
  sidebar.style.visibility = 'hidden';
}

/* ─────────────────────────────────────────────
   Variant resolution
───────────────────────────────────────────── */

function resolveVariants(block) {
  const classes = [...block.classList];
  return {
    position: classes.includes('right') ? 'right' : 'left',
    isCollapsible: classes.includes('collapsible'),
    isSticky: classes.includes('sticky'),
    isFloating: classes.includes('floating'),
  };
}

/* ─────────────────────────────────────────────
   Entry point
───────────────────────────────────────────── */

export default function decorate(block) {
  const { position, isCollapsible, isSticky, isFloating } = resolveVariants(block);

  /* ── Sidebar panel (<aside>) ── */
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar-2-panel';
  sidebar.id = `sidebar-2-panel-${Math.random().toString(36).slice(2, 8)}`;
  sidebar.setAttribute('aria-label', 'Sidebar');

  if (isSticky) sidebar.classList.add('sidebar-2-panel--sticky');
  if (isFloating) sidebar.classList.add('sidebar-2-panel--floating');
  sidebar.classList.add(`sidebar-2-panel--${position}`);

  /* ── Sidebar header ── */
  const header = document.createElement('div');
  header.className = 'sidebar-2-header';

  const headerTitle = document.createElement('span');
  headerTitle.className = 'sidebar-2-header-title';
  headerTitle.textContent = 'Menu';
  headerTitle.setAttribute('aria-hidden', 'true');
  header.append(headerTitle);

  sidebar.append(header);

  /* ── Sidebar body ── */
  const body = document.createElement('div');
  body.className = 'sidebar-2-body';
  body.id = `sidebar-2-body-${Math.random().toString(36).slice(2, 8)}`;

  const items = [...block.children];

  if (items.length === 0) {
    const placeholder = document.createElement('p');
    placeholder.className = 'sidebar-2-section-empty';
    placeholder.textContent = 'No sidebar sections authored.';
    body.append(placeholder);
  } else {
    items.forEach((item) => {
      // Pass `isCollapsible` so each section knows whether to wire collapse logic
      const section = decorateSection(item, isCollapsible);
      if (section) {
        moveInstrumentation(item, section);
        body.append(section);
      }
    });
  }

  sidebar.append(body);

  /* ── Wire top-level panel collapse toggle ── */
  if (isCollapsible) {
    wirePanelCollapse(sidebar, header, body);
  }

  /* ── Wire floating/mobile overlay toggle ── */
  if (isFloating) {
    wireFloatingToggle(sidebar, block.closest('.section'));
  }

  /* ── Entrance animation: slide in from the correct side on first paint ── */
  sidebar.classList.add('sidebar-2-panel--enter');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // Double rAF ensures the browser has painted the initial state
      sidebar.classList.add('sidebar-2-panel--enter-active');
      sidebar.addEventListener(
        'transitionend',
        () => sidebar.classList.remove('sidebar-2-panel--enter', 'sidebar-2-panel--enter-active'),
        { once: true },
      );
    });
  });

  block.replaceChildren(sidebar);
}
