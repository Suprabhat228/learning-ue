
# Carousel

A full-width, accessible image carousel block with autoplay, keyboard navigation, dot indicators, and CTA support — built for AEM Edge Delivery Services.

## Block Type
Interactive

## Authoring (Universal Editor)

To add this block to a page, insert a **Carousel** block and add one or more **Carousel Slide** child items. Each slide is independently authored with an image, optional eyebrow label, title, description, and a call-to-action link. The carousel supports autoplay (5 seconds), pauses on hover or focus, and can be navigated via arrow buttons or keyboard arrow keys.

## Fields

| Field       | Type        | Description                                                              |
|-------------|-------------|--------------------------------------------------------------------------|
| image       | reference   | Background image for the slide (required for visual impact)              |
| imageAlt    | text        | Accessible alt text for the slide image                                  |
| eyebrow     | text        | Small label displayed above the title (e.g., "New Arrival", "Featured")  |
| title       | text        | Main heading for the slide (e.g., "Discover the Peak Collection")        |
| description | richtext    | Supporting body text displayed below the title                           |
| link        | aem-content | URL the CTA button points to                                             |
| linkText    | text        | Visible CTA button label (e.g., "Shop Now", "Learn More")                |
| linkTitle   | text        | Tooltip / title attribute for the CTA anchor (for accessibility)         |

## Block Items

Each **Carousel Slide** is a repeating child item within the Carousel block. Authors can add as many slides as needed. Each slide renders as a full-width panel with an image background, gradient overlay, and a content region anchored to the bottom of the slide. Slides cycle automatically every 5 seconds (paused on hover/focus) and can be navigated manually via previous/next arrow buttons or left/right keyboard arrow keys.

**Example Slide Content:**
- **Image:** `/content/dam/hero-landscape.jpg`
- **Image Alt:** `A panoramic mountain landscape at sunrise`
- **Eyebrow:** `Featured`
- **Title:** `Discover the Peak Collection`
- **Description:** `Explore our latest range of outdoor gear crafted for every adventure, from base camp to summit.`
- **Link:** `https://example.com/collection`
- **Link Text:** `Shop Now`
- **Link Title:** `Browse the Peak Collection`

## Variants

No variants. The carousel adapts its aspect ratio automatically across breakpoints (mobile portrait → tablet landscape → cinema widescreen).

## Dependencies

- `createOptimizedPicture` — from `../../scripts/aem.js`; generates responsive `<picture>` elements with WebP sources.
- `moveInstrumentation` — from `../../scripts/scripts.js`; migrates Universal Editor instrumentation attributes when DOM nodes are replaced.
