
# Hero Banner

Full-width introductory section that supports six visual variants: Text Only, Image Background, Video Background, Split (Text + Image), Animated Gradient, and Carousel.

## Block Type
Interactive

## Authoring (Universal Editor)

Add the **Hero Banner** block to any page using the Universal Editor. Select a **Variant** from the dropdown to change the visual layout. Fill in the relevant fields for that variant — all fields are optional so you can compose exactly what you need.

## Fields

| Field              | Type        | Description                                                                                                  |
|--------------------|-------------|--------------------------------------------------------------------------------------------------------------|
| variant            | select      | Visual variant: `text-only`, `image-bg`, `video-bg`, `split`, `gradient`, `carousel`                         |
| eyebrow            | text        | Small label above the heading (e.g. "New Release")                                                           |
| title              | text        | Main heading (e.g. "Build Faster. Ship Smarter.")                                                            |
| description        | richtext    | Supporting paragraph beneath the heading                                                                     |
| primaryLink        | aem-content | URL for the primary CTA button (field-collapsed with primaryLinkText and primaryLinkTitle)                   |
| primaryLinkText    | text        | Label for the primary CTA button (e.g. "Get Started")                                                       |
| primaryLinkTitle   | text        | Tooltip / accessible title for the primary CTA                                                               |
| secondaryLink      | aem-content | URL for the secondary CTA button (field-collapsed with secondaryLinkText and secondaryLinkTitle)             |
| secondaryLinkText  | text        | Label for the secondary CTA (e.g. "Learn More")                                                             |
| secondaryLinkTitle | text        | Tooltip / accessible title for the secondary CTA                                                             |
| image              | reference   | Background image (used by `image-bg` and `split`) or fallback image for `video-bg`                          |
| imageAlt           | text        | Accessible alt text for the image (field-collapsed with image)                                              |
| videoUrl           | text        | Direct URL to an `.mp4`, `.webm`, or `.ogg` video file for the `video-bg` variant                           |
| slides             | richtext    | Carousel slides — one slide per paragraph, pipe-delimited: `Title \| Description \| LinkUrl \| LinkText \| ImagePath` |

## Block Items

No repeating items. All content is authored through the single block's fields. Carousel slides are encoded as pipe-delimited paragraphs inside the `slides` richtext field.

## Variants

| Variant Class          | Description                                                        |
|------------------------|--------------------------------------------------------------------|
| `hero-banner text-only`  | Centered heading and text on a light background; no media         |
| `hero-banner image-bg`   | Full-bleed background image with dark overlay and left-aligned text |
| `hero-banner video-bg`   | Autoplaying muted looping video background, centered text          |
| `hero-banner split`      | Two-column layout: text on the left, image on the right            |
| `hero-banner gradient`   | Animated colour-cycling gradient background, centered text         |
| `hero-banner carousel`   | Auto-advancing slide show with dot indicators and arrow controls   |

## Dependencies

- `createOptimizedPicture` — from `../../scripts/aem.js` — optimises background and split images with responsive `srcset`.
- `moveInstrumentation` — from `../../scripts/scripts.js` — migrates Universal Editor data attributes when DOM nodes are moved during decoration.
