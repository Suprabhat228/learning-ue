
# Image-Text Block

A responsive split-section block that places an image on one side and structured text content — eyebrow label, bold heading, rich description, and an optional CTA button — on the other, with five layout variants for editorial and marketing layouts.

## Block Type
Structural

## Authoring (Universal Editor)

Add the **Image-Text Block** to a page via the Universal Editor block picker. In the Properties panel, select a DAM image and provide alt text, then fill in the Eyebrow Label, Heading, Description, and optional CTA fields. Apply one or more variant class names (e.g., `image-text-block image-right overlapping`) on the block to control the visual treatment. On mobile the layout always stacks vertically regardless of variant.

## Fields

| Field       | Type        | Description                                                                                              |
|-------------|-------------|----------------------------------------------------------------------------------------------------------|
| image       | reference   | Image asset selected from the DAM; field-collapsed with imageAlt into `<picture><img>`                  |
| imageAlt    | text        | Accessible alt text collapsed into the `<img alt="">` attribute by EDS field-collapse                   |
| eyebrow     | text        | Small uppercase label rendered above the heading for category or topic context                           |
| heading     | text        | Primary section heading; preserves any `h1`–`h6` element the author used, defaults to `h2`             |
| description | richtext    | Supporting body copy; supports paragraphs, ordered/unordered lists, bold, italic, and inline links       |
| link        | aem-content | CTA destination URL; field-collapsed with linkText, linkTitle, and linkType into a styled `<a>` element |
| linkText    | text        | Visible CTA button label (collapsed into the anchor's text content by EDS field-collapse)               |
| linkTitle   | text        | Accessible title attribute on the anchor (collapsed via EDS field-collapse)                             |
| linkType    | select      | Button style: `primary`, `secondary`, or `ghost` (collapsed as a class on the rendered anchor)         |

## Block Items

No repeating items. Each Image-Text Block renders a single split section. For alternating-row page layouts, place multiple Image-Text Block instances on the page and apply the `alternating` variant class to each.

## Variants

Apply variant class names alongside `image-text-block` on the block wrapper. Variants may be combined (e.g., `image-text-block image-right angled-split`):

| Variant Class  | Description                                                                                                      |
|----------------|------------------------------------------------------------------------------------------------------------------|
| `image-left`   | Default behaviour — image occupies the left column, text the right                                              |
| `image-right`  | Swaps pane order — image on the right, text on the left                                                          |
| `alternating`  | Every even `.image-text-block` on the page automatically flips image alignment for natural visual rhythm         |
| `overlapping`  | Text pane slides over the image pane with a white card surface and shadow, creating a layered dynamic feel       |
| `angled-split` | Applies a diagonal `clip-path` polygon to the image pane, producing a slanted divider between the two areas     |
| `above-fold`   | Marks the block as above-the-fold; image loads with `loading="eager"` and `fetchpriority="high"` for LCP        |

## Dependencies

- `createOptimizedPicture` — from `../../scripts/aem.js` — generates responsive `<picture>` elements with WebP `<source>` sets and a fallback `<img>`.
- `moveInstrumentation` — from `../../scripts/scripts.js` — migrates Universal Editor instrumentation attributes when DOM nodes are restructured during decoration.
