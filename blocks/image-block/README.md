
# Image Block

A standalone image block for highlighting a single visual element with responsive scaling, optional caption, overlay text, lazy-load reveal, and zoom interaction — built for performance, accessibility, and clean presentation across all screen sizes.

## Block Type
Structural

## Authoring (Universal Editor)

Add the **Image Block** to a page using the Universal Editor block picker. In the Properties panel, select an image from the DAM, provide alt text for accessibility, and optionally enter a caption or overlay text. Apply one or more variant class names (e.g., `image-block full-width zoom-on-hover`) directly on the block to enable the desired visual treatment.

## Fields

| Field       | Type      | Description                                                                                    |
|-------------|-----------|------------------------------------------------------------------------------------------------|
| image       | reference | Image asset selected from the DAM; field-collapsed with imageAlt into `<picture><img>`        |
| imageAlt    | text      | Accessible alt text for the image (collapsed into the `<img alt="">` attribute by EDS)        |
| caption     | text      | Short descriptive text displayed below the image inside a `<figcaption>` element               |
| overlayText | text      | Headline or short statement layered over the image using an absolute-positioned overlay div    |

## Block Items

No repeating items. This block renders a single image with its associated metadata fields.

## Variants

Apply variant class names alongside `image-block` on the block wrapper. Multiple variants can be combined (e.g., `image-block rounded-corners zoom-on-hover lazy-loaded`):

| Variant Class    | Description                                                                                      |
|------------------|--------------------------------------------------------------------------------------------------|
| `full-width`     | Removes max-width and padding for an edge-to-edge image; loads eagerly with high fetch priority  |
| `rounded-corners`| Applies a `1rem` border radius to the image wrapper for a modern, soft-edged appearance         |
| `with-caption`   | No extra class needed — caption renders automatically when the Caption field is populated        |
| `with-overlay-text` | No extra class needed — overlay renders automatically when the Overlay Text field is filled   |
| `lazy-loaded`    | Adds an IntersectionObserver-driven fade-in and translate reveal as the image enters the viewport|
| `zoom-on-hover`  | Applies a subtle `scale(1.05)` transform on the image when the wrapper is hovered or focused     |

## Dependencies

- `createOptimizedPicture` — from `../../scripts/aem.js` — generates responsive `<picture>` elements with WebP `<source>` sets and a fallback `<img>`.
- `moveInstrumentation` — from `../../scripts/scripts.js` — migrates Universal Editor instrumentation attributes when DOM nodes are restructured during decoration.
