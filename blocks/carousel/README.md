
# Product Carousel

An interactive horizontal scrolling carousel designed to display product cards with images, color swatches, details, and call-to-action buttons.

## Block Type
Interactive

## Authoring (Universal Editor)
Authors add the main section heading and an optional "Compare" link at the block level. They then add repeating "Carousel Item" blocks for each product. Each product card requires an image, a comma-separated list of hex colors for swatches, rich text for the content (use Bold for the top badge), and rich text for the actions (the first link becomes a solid button, the second becomes a text link). For swatch-driven image changes, authors can configure alternate image URLs as `data-image0`, `data-image1`, etc. on the product image `<picture>` element (and optional `data-imageAlt0`, `data-imageAlt1`, etc. for alt text).

## Fields
| Field        | Type       | Description                              |
|--------------|------------|------------------------------------------|
| heading      | richtext   | Main heading for the carousel section.  |
| compare-link | aem-content| Link displayed next to the heading.     |

## Block Items
Repeating `carousel-item` blocks.

| Field    | Type      | Description                                                                 |
|----------|-----------|-----------------------------------------------------------------------------|
| image    | reference | Main image for the product card.                                           |
| imageAlt | text      | Accessible description for the product image.                              |
| swatches | text      | Comma-separated hex codes (e.g., `#ff0000, #00ff00`) for color swatches.   |
| content  | richtext  | Badge (use Bold), Title (H3), Description, and Pricing.                    |
| actions  | richtext  | Links for the card. First link becomes a button, second becomes a text link.|

## Variants
No variants.

## Dependencies
`moveInstrumentation` from `../../scripts/scripts.js`

## Content

```json
{
  "heading": "<h2>Explore the line-up.</h2>",
  "compare-link": "Compare all models >",
  "_itemCount": 4,
  "_items": [
    {
      "image": "iPhone 17 Pro in Desert Titanium",
      "imageAlt": "iPhone 17 Pro in Desert Titanium",
      "swatches": "#f09a37, #3b3b40, #e3e4e5",
      "content": "<h3>iPhone 17 Pro</h3><p>Innovative design for ultimate performance and battery life.</p><p>From ₹134900.00*</p><p>or ₹21650.00/mo. for 6 mo.‡</p>",
      "actions": "<p><a href=\"#\">Learn more</a> <a href=\"#\">Buy ></a></p>"
    },
    {
      "image": "iPhone Air in Silver",
      "imageAlt": "iPhone Air in Silver",
      "swatches": "#e3e4e5, #f0f0f0, #1d1d1f",
      "content": "<h3>iPhone Air</h3><p>The thinnest iPhone ever. With the power of pro inside.</p><p>From ₹119900.00*</p><p>or ₹19150.00/mo. for 6 mo.‡</p>",
      "actions": "<p><a href=\"#\">Learn more</a> <a href=\"#\">Buy ></a></p>"
    },
    {
      "image": "iPhone 17 in Purple",
      "imageAlt": "iPhone 17 in Purple",
      "swatches": "#d8c8e8, #a0b0d0, #e3e4e5, #1d1d1f",
      "content": "<h3>iPhone 17</h3><p>Even more delightful. Even more durable.</p><p>From ₹82900.00*</p><p>or ₹14468.00/mo. for 6 mo.‡‡</p>",
      "actions": "<p><a href=\"#\">Learn more</a> <a href=\"#\">Buy ></a></p>"
    },
    {
      "image": "iPhone 17e in Pink",
      "imageAlt": "iPhone 17e in Pink",
      "swatches": "#f8d8d8, #e3e4e5, #1d1d1f",
      "content": "<p><strong>New</strong></p><h3>iPhone 17e</h3><p>Feature stacked. Value packed.</p><p>From ₹64900.00*</p><p>or ₹11327.00/mo. for 6 mo.‡‡</p>",
      "actions": "<p><a href=\"#\">Learn more</a> <a href=\"#\">Buy ></a></p>"
    }
  ]
}
```
  