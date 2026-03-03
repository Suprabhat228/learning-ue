
# Sidebar

A vertical panel displayed alongside main content, supporting navigation, informational content, tags, and call-to-action sections. Supports left, right, collapsible, sticky, and floating layout variants.

## Block Type
Interactive

## Authoring (Universal Editor)

Insert the **Sidebar** block on any page and add **Sidebar Section** child items beneath it. Each section has a title, content, optional CTA link, and a type selector that controls how the content is rendered. Apply block variant classes (`left`, `right`, `collapsible`, `sticky`, `floating`) via the block's style panel to change the sidebar's position and behaviour.

## Fields

### Sidebar Section (child item)

| Field           | Type        | Description                                                                                      |
|-----------------|-------------|--------------------------------------------------------------------------------------------------|
| sectionTitle    | text        | Heading displayed above the section (e.g., "Main Navigation", "About", "Quick Links")           |
| sectionContent  | richtext    | Body content. For `navigation` and `tags` types, author a bulleted list of links here.           |
| ctaLink         | aem-content | Target URL for the CTA button (used only when `sectionType` is `cta`)                           |
| ctaText         | text        | Label text for the CTA button (field-collapsed with ctaLink)                                     |
| sectionType     | select      | Controls rendering mode: `navigation`, `info`, `cta`, or `tags`                                 |

## Block Items

Each **Sidebar Section** is a repeating child item. Add as many sections as needed. Each section renders differently depending on its `sectionType`:

- **navigation** — Renders `sectionContent` as a styled nav list. Author a bulleted list of links in the richtext field (e.g., `- [Home](/)`). Active page link is highlighted automatically.
- **info** — Renders `sectionContent` as formatted prose with styled paragraphs and inline links.
- **tags** — Renders `sectionContent` as pill/chip tags. Author a bulleted list of labels or links in the richtext field.
- **cta** — Renders `sectionContent` as a description and `ctaLink`/`ctaText` as a prominent button.

## Variants

Apply these class names alongside `sidebar` in the block's style panel:

| Variant      | Class         | Description                                                          |
|--------------|---------------|----------------------------------------------------------------------|
| Left sidebar | _(default)_   | Sidebar appears on the left side with a right border accent          |
| Right sidebar| `right`       | Sidebar appears on the right side with a left border accent          |
| Collapsible  | `collapsible` | Adds a toggle button to collapse/expand the sidebar body             |
| Sticky       | `sticky`      | Sidebar sticks to the viewport top while scrolling                   |
| Floating     | `floating`    | Sidebar slides in as an overlay panel; a mobile toggle button appears|

Variants can be combined, e.g., `sidebar right sticky` or `sidebar collapsible sticky`.

## Dependencies

- `moveInstrumentation` from `../../scripts/scripts.js`
