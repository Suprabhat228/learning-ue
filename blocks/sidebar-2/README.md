
# Sidebar 2

A vertical sidebar panel with rich collapsible animations — featuring accordion section toggling with animated chevrons, staggered navigation item entrances, smooth max-height/opacity transitions, and a panel-level collapse toggle.

## Block Type
Interactive

## Authoring (Universal Editor)

Insert the **Sidebar 2** block on any page and add **Sidebar 2 Section** child items beneath it. Each section has a title, content area, optional CTA link, a type selector, and a "Collapsed by Default" toggle. Apply variant class names (`collapsible`, `left`, `right`, `sticky`, `floating`) via the block's style panel to control layout and animation behaviour.

## Fields

### Sidebar 2 Section (child item)

| Field            | Type        | Description                                                                                       |
|------------------|-------------|---------------------------------------------------------------------------------------------------|
| sectionTitle     | text        | Heading displayed in the section header and used as the accordion trigger label                   |
| sectionContent   | richtext    | Body content. For `navigation` and `tags` types, author a bulleted list of links here             |
| ctaLink          | aem-content | Target URL for the CTA button (used only when `sectionType` is `cta`)                            |
| ctaText          | text        | Label for the CTA button (field-collapsed with ctaLink)                                           |
| sectionType      | select      | Render mode: `navigation`, `info`, `cta`, or `tags`                                              |
| defaultCollapsed | boolean     | When enabled and the sidebar uses the `collapsible` variant, this section starts collapsed        |

## Block Items

Each **Sidebar 2 Section** is a repeating child item rendered as an accordion panel. Section types:

- **navigation** — Styled nav list with active-page detection and staggered item entrance animations.
- **info** — Formatted richtext prose with styled links and emphasis.
- **tags** — Pill/chip tags with scale-on-hover animation; author a bulleted list of labels or links.
- **cta** — Description block plus a prominent gradient button with lift-on-hover effect.

## Variants

| Variant       | Class         | Description                                                                      |
|---------------|---------------|----------------------------------------------------------------------------------|
| Left sidebar  | _(default)_   | Sidebar on the left with entrance slide-in from the left                         |
| Right sidebar | `right`       | Sidebar on the right with entrance slide-in from the right                       |
| Collapsible   | `collapsible` | Enables panel-level toggle and per-section accordion with chevron + animation    |
| Sticky        | `sticky`      | Panel sticks to the viewport top during scroll                                   |
| Floating      | `floating`    | Slide-in overlay panel; mobile toggle button appears fixed on the screen         |

Variants can be combined, e.g., `sidebar-2 collapsible sticky` or `sidebar-2 right floating`.

## Animation Details

| Animation                  | Trigger                          | Technique                                             |
|----------------------------|----------------------------------|-------------------------------------------------------|
| Panel entrance             | On first render                  | Slide + fade via double-rAF CSS class swap            |
| Panel collapse/expand      | Toggle button click              | `max-height` + `opacity` JS animation with easing     |
| Section accordion open     | Section header click / keyboard  | `max-height` + `opacity` JS animation with easing     |
| Chevron rotation           | Section open/close               | CSS `transform: rotate` on `.sidebar-2-section-chevron` |
| Nav item stagger           | Section opens                    | CSS `@keyframes` with `nth-child` animation-delay     |
| Floating panel slide       | Mobile toggle click              | CSS `transform: translateX` transition                |
| Overlay fade               | Floating panel opens             | CSS `@keyframes sidebar2-overlay-in`                  |
| Rapid-click safety         | Multiple quick toggles           | Pending timer cancelled before new animation starts   |

## Dependencies

- `moveInstrumentation` from `../../scripts/scripts.js`
