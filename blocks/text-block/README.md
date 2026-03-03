
# Text Block

A clean, typographically rich text content section for headings, body copy, pull quotes, and editorial layouts — built for readability, accessibility, and responsive behaviour across all screen sizes.

## Block Type
Static

## Authoring (Universal Editor)

Add the **Text Block** to a page via the Universal Editor block picker. In the Properties panel, fill in any combination of the Eyebrow Label, Heading, Body Content, and Pull Quote fields. Apply one or more variant class names (e.g., `text-block two-column`) directly on the block to change the layout or typographic treatment.

## Fields

| Field     | Type      | Description                                                                              |
|-----------|-----------|------------------------------------------------------------------------------------------|
| eyebrow   | text      | Small uppercase label displayed above the heading (e.g., category name or section tag)  |
| heading   | text      | Primary heading rendered as an `<h2>` by the author's richtext or document heading level |
| body      | richtext  | Main body content supporting paragraphs, lists, links, bold, italic, images, and code   |
| pullQuote | richtext  | Highlighted key statement rendered with accent styling in the pull-quote treatment       |

## Block Items

No repeating items. This block renders a single content section using its four field slots.

## Variants

Apply variant class names alongside `text-block` on the block wrapper:

| Variant Class  | Description                                                                               |
|----------------|-------------------------------------------------------------------------------------------|
| `single-column`| Centered, max-width constrained long-form reading column (also the default behaviour)     |
| `centered`     | Combines with `single-column` to center-align all text within the column                  |
| `two-column`   | Splits body content into a two-column magazine-style grid with a vertical divider rule    |
| `drop-cap`     | Applies an oversized styled first letter to the opening paragraph for editorial impact    |
| `pull-quote`   | Promotes the Pull Quote field to a large, accented block-quote treatment                  |
| `large-display`| Renders headings and body text at oversized scale for hero or impact statement sections   |

## Dependencies

None.
