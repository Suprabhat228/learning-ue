
# Grid Card

A responsive, multi-variant grid/card layout block that organizes content in structured rows and columns. Each card supports an image, bold title, short description, and an optional call-to-action link. Supports six layout variants: 2-column, 3-column (default), 4-column, masonry, list-view toggle, and infinite scroll.

## Block Type
Interactive

## Authoring (Universal Editor)

Add the **Grid Card** block to a page using the Universal Editor. Insert one or more **Grid Card Item** child components inside the block. For each item, fill in the image, title, description, and optional CTA link fields in the Properties panel. Apply a variant class (e.g., `grid-card two-column`) directly on the block to change the layout.

## Fields

| Field       | Type        | Description                                                              |
|-------------|-------------|--------------------------------------------------------------------------|
| image       | reference   | Card image selected from the DAM                                         |
| imageAlt    | text        | Accessible alt text for the card image                                   |
| title       | text        | Bold card heading displayed below the image                              |
| description | richtext    | Short descriptive text for the card content area                         |
| link        | aem-content | CTA link destination URL                                                 |
| linkText    | text        | Visible label for the CTA link (e.g., "Learn more", "View details")      |
| linkTitle   | text        | Tooltip title attribute for the CTA anchor element                       |

## Block Items

Each **Grid Card Item** is a repeating child of the Grid Card block. Authors add as many items as needed. Every item renders as an individual card in the grid. Items must have at minimum a title or image to avoid rendering an empty card.

## Variants

Apply variant class names alongside `grid-card` on the block wrapper to change layout behaviour:

| Variant Class      | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| `two-column`       | 2-column grid — ideal for featured or detailed content pairs                |
| *(default)*        | 3-column grid — balanced layout for services or blog posts (no extra class) |
| `four-column`      | 4-column compact grid — suited for products or portfolios                   |
| `masonry`          | CSS multi-column staggered layout for visual-heavy content                  |
| `list-view-toggle` | Adds a toolbar with grid/list toggle buttons above the card grid            |
| `infinite-scroll`  | Reveals cards in batches of 6 as the user scrolls to the bottom             |

Variants can be combined where it makes sense, e.g., `grid-card list-view-toggle infinite-scroll`.

## Dependencies

- `createOptimizedPicture` — from `../../scripts/aem.js` — generates responsive `<picture>` elements with WebP sources.
- `moveInstrumentation` — from `../../scripts/scripts.js` — migrates Universal Editor instrumentation attributes when DOM nodes are moved during decoration.
