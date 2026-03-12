
# Cards Block

A responsive cards block for displaying product or service offerings with features, tags, and call-to-action buttons.

## Block Type
Structural

## Authoring (Universal Editor)
1. Add the "Cards Block" to your page.
2. Configure the section label, heading, and subtitle in the block properties.
3. Add individual card items, each with a tag, title, features, and CTA buttons.

## Fields
| Field            | Type       | Description                                                                 |
|------------------|------------|-----------------------------------------------------------------------------|
| section-label    | text       | Small uppercase label above the heading (e.g., "Our offerings").            |
| section-heading  | richtext   | Main heading for the section (supports `<em>` for italics).                 |
| section-subtitle | richtext   | Supporting text below the heading.                                          |

## Block Items
Each card item contains:
- **Card Tag**: Small badge text (e.g., "⭐ Award Winning").
- **Card Title**: Main title for the card.
- **Features 1-4**: List of features (supports `<strong>` for highlights).
- **Primary CTA**: Primary button link and text.
- **Secondary CTA**: Secondary button link and text.

## Variants
No variants.

## Dependencies
- `moveInstrumentation` from '../../scripts/scripts.js'
