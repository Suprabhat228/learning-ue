
# Gallery / Lightbox

A responsive image gallery block where users can browse a grid of images and click any image to open a full-screen lightbox view with keyboard, touch, and arrow navigation.

## Block Type
Interactive

## Authoring (Universal Editor)

Add the **Gallery Lightbox** block to a page via the Universal Editor block picker. Use the block-item picker to add one or more **Gallery Item** child items. For each item, upload an image, fill in the alt text, optionally add a caption, and optionally assign a category for the filter variant. Apply a layout variant class (e.g., `gallery-lightbox masonry`) and optionally combine it with `filter` (e.g., `gallery-lightbox hover filter`) to enable category filtering alongside any layout.

## Fields

| Field    | Type      | Description                                                                                                 |
|----------|-----------|-------------------------------------------------------------------------------------------------------------|
| image    | reference | The gallery image selected from the DAM; field-collapsed with imageAlt into `<picture><img>`               |
| imageAlt | text      | Accessible alt text for the image, collapsed into `<img alt="">` by EDS field-collapse                     |
| caption  | text      | Optional short caption shown below the image (non-hover variants) or in the hover overlay (hover variant)  |
| category | text      | Optional category label used by the `filter` variant to group and filter images by topic or type           |

## Block Items

Each **Gallery Item** child represents one image in the gallery grid. Items are rendered in authored order. All items are clickable and open the lightbox at their respective position with full prev/next cycling across all items in the grid.

## Variants

Apply variant classes alongside `gallery-lightbox` on the parent block wrapper. One layout variant and the `filter` modifier can be combined:

| Variant Class | Description                                                                                                          |
|---------------|----------------------------------------------------------------------------------------------------------------------|
| _(default)_   | Uniform grid — evenly sized images in a clean auto-fit column layout (alias: `uniform`)                             |
| `masonry`     | Staggered CSS column layout — images retain their natural aspect ratios for a dynamic, Pinterest-style effect        |
| `hover`       | Hover overlay variant — captions and a zoom icon appear on hover/focus; no below-image caption is rendered           |
| `filter`      | Adds a category filter bar above the grid; combinable with any layout variant (e.g., `gallery-lightbox hover filter`) |

## Lightbox Features

- Full-screen overlay with dark background and image centred within viewport constraints
- Previous / Next arrow buttons with wrap-around navigation
- Slide counter (e.g., `3 / 12`) announced via `aria-live` for screen readers
- Swipe left/right gesture support on touch devices
- Keyboard navigation: `ArrowLeft`, `ArrowRight` to navigate; `Escape` to close
- Click outside the image stage to close
- Focus trap keeps keyboard focus inside the overlay while open
- Focus returns to the triggering gallery item on close
- Body scroll is locked while the lightbox is visible

## Dependencies

- `createOptimizedPicture` — from `../../scripts/aem.js` — generates responsive `<picture>` elements with WebP `<source>` sets and a fallback `<img>` for grid thumbnails.
- `moveInstrumentation` — from `../../scripts/scripts.js` — migrates Universal Editor instrumentation attributes when DOM nodes are restructured during decoration.
