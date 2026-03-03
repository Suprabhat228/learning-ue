
# Carousel / Slider

A horizontally navigable content slider supporting images, text overlays, CTAs, and product cards — with smooth slide transitions, arrow/dot/thumbnail navigation, touch swipe, keyboard control, autoplay, and full accessibility.

## Block Type
Interactive

## Authoring (Universal Editor)

Add the **Carousel Slider** block to a page via the Universal Editor block picker. Use the block-item picker to add one or more **Carousel Slide** child items. For each slide, upload an image, provide a heading, optional description, and a CTA link. Apply a variant class to the parent block to change the slider behaviour (e.g., `carousel-slider auto-play`). For the product variant, populate the Price field. For thumbnail navigation, upload a separate thumbnail image per slide.

## Fields

| Field         | Type        | Description                                                                                                          |
|---------------|-------------|----------------------------------------------------------------------------------------------------------------------|
| image         | reference   | Main slide image from the DAM; field-collapsed with imageAlt into `<picture><img>`                                  |
| imageAlt      | text        | Accessible alt text for the main slide image (collapsed by EDS field-collapse)                                       |
| heading       | text        | Slide title; rendered as `<h2>` (or `<h3>` in product variant)                                                      |
| description   | richtext    | Optional body text displayed in the content overlay                                                                  |
| link          | aem-content | CTA button destination URL; field-collapsed with linkTitle, linkText, and linkType                                   |
| linkTitle     | text        | Accessible `title` attribute on the CTA anchor (collapsed by EDS field-collapse)                                    |
| linkText      | text        | CTA button label text (collapsed by EDS field-collapse)                                                              |
| linkType      | select      | CTA button style: `primary`, `secondary`, or `outline` (collapsed by EDS field-collapse)                            |
| price         | text        | Product price string (used only in the `product` variant, e.g., `$49.99`)                                           |
| thumbnail     | reference   | Small preview image for thumbnail-nav variant; field-collapsed with thumbnailAlt                                     |
| thumbnailAlt  | text        | Alt text for the thumbnail image (collapsed by EDS field-collapse)                                                   |

## Block Items

Each **Carousel Slide** child item represents one slide. Add as many slides as needed. A single slide renders without navigation controls. All slides are individually keyboard-focusable and announced to screen readers via `aria-roledescription="slide"` and an `aria-live` region.

## Variants

Apply a single variant class alongside `carousel-slider` on the parent block wrapper:

| Variant Class     | Description                                                                                                              |
|-------------------|--------------------------------------------------------------------------------------------------------------------------|
| _(default)_       | Manual slider — users advance via arrows, dots, or swipe; no autoplay                                                   |
| `manual`          | Explicit alias for the default manual behaviour                                                                          |
| `auto-play`       | Slides advance automatically every 5 seconds; paused on hover, focus, or when the browser tab is hidden                |
| `thumbnail-nav`   | Displays a scrollable thumbnail strip below the viewport for direct slide selection; uses the thumbnail image field     |
| `full-screen`     | Edge-to-edge viewport (removes border-radius and max-width cap) with a taller aspect ratio for immersive visuals        |
| `product`         | Shorter aspect ratio, lighter overlay, and a visible price field for product showcase layouts                           |

## Dependencies

- `createOptimizedPicture` — from `../../scripts/aem.js` — generates responsive `<picture>` elements with WebP sources and fallback `<img>`.
- `moveInstrumentation` — from `../../scripts/scripts.js` — migrates Universal Editor instrumentation attributes when DOM nodes are restructured during decoration.
