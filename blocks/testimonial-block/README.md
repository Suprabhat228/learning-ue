
# Testimonial Block

A visually distinct block for showcasing customer quotes and testimonials, supporting single-card, multi-card grid, and carousel layouts with optional avatars, star ratings, and video testimonials.

## Block Type
Interactive

## Authoring (Universal Editor)

Add the **Testimonial Block** to a page via the Universal Editor block picker. Use the block-item picker to add one or more **Testimonial** child items. For each item, fill in the Quote Text, Author Name, Job Title, Company, and optionally upload an avatar image, set a star rating (1–5), or provide a video URL. Apply the `carousel` variant class on the parent block to enable rotating navigation when multiple items are present. On mobile, cards always stack vertically.

## Fields

| Field         | Type        | Description                                                                                              |
|---------------|-------------|----------------------------------------------------------------------------------------------------------|
| quote         | richtext    | The testimonial or review body text; supports paragraphs, bold, italic, and inline elements              |
| authorName    | text        | Full name of the person giving the testimonial                                                           |
| authorTitle   | text        | Job title of the author (e.g., "Senior Engineer")                                                       |
| authorCompany | text        | Company or organisation the author belongs to                                                            |
| image         | reference   | Author avatar image from the DAM; field-collapsed with imageAlt into `<picture><img>`                   |
| imageAlt      | text        | Accessible alt text for the avatar, collapsed into `<img alt="">` by EDS field-collapse                 |
| rating        | number      | Numeric star rating from 1 to 5; values outside this range are clamped automatically                    |
| videoUrl      | text        | YouTube, YouTube Nocookie, or direct video file URL (.mp4 / .webm); renders a click-to-play facade      |
| videoCaption  | text        | Short caption displayed below the video player                                                           |

## Block Items

Each **Testimonial** child item represents one review card. Add as many as needed. When the `carousel` variant is applied and two or more items exist, the block renders a single-slide rotating carousel with previous/next buttons, dot indicators, keyboard navigation, and auto-advance (paused on hover/focus and when the page tab is hidden).

## Variants

Apply variant class names alongside `testimonial-block` on the parent block wrapper:

| Variant Class       | Description                                                                                                   |
|---------------------|---------------------------------------------------------------------------------------------------------------|
| _(default)_         | Single card or multi-card auto-fit grid depending on the number of items authored                             |
| `carousel`          | Activates single-slide carousel mode with prev/next buttons, dot indicators, and autoplay (5 s interval)     |

Feature combinations via field population (no extra class needed):

| Feature             | How to activate                                                                                               |
|---------------------|---------------------------------------------------------------------------------------------------------------|
| Avatar + Quote      | Populate the **image** and **imageAlt** fields on a Testimonial item                                         |
| Star Rating + Review| Set the **rating** field to a number between 1 and 5                                                          |
| Video Testimonial   | Provide a **videoUrl** (YouTube or direct file); optionally add a **videoCaption**                            |

## Dependencies

- `createOptimizedPicture` — from `../../scripts/aem.js` — generates responsive `<picture>` elements with WebP `<source>` sets and a fallback `<img>`.
- `moveInstrumentation` — from `../../scripts/scripts.js` — migrates Universal Editor instrumentation attributes when DOM nodes are restructured during decoration.
