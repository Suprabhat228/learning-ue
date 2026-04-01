
# Info Card

A structural block that displays a step-by-step process inside a frosted glass card overlaying a background image. It includes a header with eligibility criteria and a footer with a call-to-action.

## Block Type
Structural

## Authoring (Universal Editor)
Authors configure the main background image, header text, and two eligibility criteria at the block level. Inside the card, they set a title, subtext, and footer CTA. The process steps are added as repeating child items, each requiring an icon and text.

## Fields
| Field | Type | Description |
|-----------|-----------------------------------------|---------------------|
| bg-image | reference | Full width background image behind the card. |
| bg-imageAlt | text | Alt text for background image. |
| main-title | text | The primary heading at the top. |
| subtitle | text | Text below the main title. |
| eligibility-1-icon | reference | Icon for the first eligibility criteria. |
| eligibility-1-text | text | Text for the first eligibility criteria. |
| eligibility-2-icon | reference | Icon for the second eligibility criteria. |
| eligibility-2-text | text | Text for the second eligibility criteria. |
| card-title | text | Heading inside the main card. |
| card-subtext | text | Text below the steps inside the card. |
| footer-text | text | Text in the card footer. |
| footer-cta | aem-content | Call to action button in the footer. |

## Block Items
Repeating items for the process steps (`info-card-step`). Each item has a `step-icon` (reference) and `step-text` (richtext).

## Variants
No variants.

## Dependencies
`moveInstrumentation` from `../../scripts/scripts.js`

## Image Analysis
Here is a developer-perspective analysis of the provided UI screenshot, tailored for building an AEM Edge Delivery Services (EDS) block.

## Layout Blueprint
- **Overall layout pattern:** Single-column, center-aligned layout with a prominent floating card overlaying a full-width background image.
- **Number of visual sections / rows:** 
  1. **Header:** Main title, subtitle, and inline eligibility criteria.
  2. **Main Card Body:** Card title, a 3-column flex/grid for the process steps connected by a dashed line, a divider, and subtext.
  3. **Card Footer:** A distinct bottom section with text and a Call-to-Action (CTA) button.
- **Alignment, spacing rhythm:** Strict center alignment for almost all text and elements. Generous vertical padding between the header, the card, and inside the card sections.
- **Responsive behavior expectations:** 
  - **Mobile:** The 3 process steps should stack vertically. The horizontal dashed line should either disappear or rotate 90 degrees to connect the stacked circles. The card footer text and button should stack vertically. The background image should scale and crop appropriately (object-fit: cover).

## Component Identification
- **Block type:** `info-card` (specifically acting as a step-by-step process/feature card).
- **Sub-components:**
  - Full-width background image.
  - Inline icon-text pairs (eligibility criteria).
  - Circular icon badges (process steps).
  - Dashed connector lines (CSS border or SVG).
  - Horizontal divider line (`<hr>`).
  - Outline CTA button.
  - Glassmorphism/gradient card background.
- **Number of repeating items:** 
  - 2 Eligibility criteria items.
  - 3 Process step items.

## Authoring Model (Field Suggestions)
Given the specific and mixed nature of this UI, a Key-Value table structure is the most robust way to author this in EDS, rather than a simple list.

**Block-level fields (appear once for the whole block):**
- `Background Image` (type: image) — The abstract wavy background.
- `Main Title` (type: text) — "How to get your credit card instantly?"
- `Subtitle` (type: text) — "Check credit card eligibility criteria"
- `Eligibility 1 Icon` (type: image/icon) — User icon.
- `Eligibility 1 Text` (type: text) — "Min. 18 years of age"
- `Eligibility 2 Icon` (type: image/icon) — Checkmark icon.
- `Eligibility 2 Text` (type: text) — "Resident of India"
- `Card Title` (type: text) — "Apply for a credit card online"
- `Card Subtext` (type: text) — "Get an assured credit card with FD."
- `Footer Text` (type: text) — "Check Your Credit Card Application Status"
- `Footer CTA` (type: reference/link) — Link for the "Track Now" button.

**Item-level fields (repeat per step):**
*(Authored as numbered keys in the table)*
- `Step [X] Icon` (type: image/icon) — The icon inside the black circle.
- `Step [X] Text` (type: richtext) — The description below the icon.

## Column Map
Exact mapping from EDS authored table columns to field names (using a Key-Value approach):

| Column 0 (Key) | Column 1 (Value) |
| :--- | :--- |
| `Background Image` | [Image] |
| `Main Title` | How to get your credit card instantly? |
| `Subtitle` | Check credit card eligibility criteria |
| `Eligibility 1` | [Icon] Min. 18 years of age |
| `Eligibility 2` | [Icon] Resident of India |
| `Card Title` | Apply for a credit card online |
| `Step 1` | [Icon] Enter personal details |
| `Step 2` | [Icon] Choose your credit card |
| `Step 3` | [Icon] Complete your VKYC |
| `Card Subtext` | Get an assured credit card with FD. |
| `Footer Text` | Check Your Credit Card Application Status |
| `Footer CTA` | [Link: Track Now] |

*(Note: Eligibility and Steps can be authored as a single cell containing an image and text, which the EDS block JS will parse and separate).*

## OCR Content Inventory
**Section headings / sub-headings:**
- How to get your credit card instantly?
- Check credit card eligibility criteria
- Apply for a credit card online

**Eligibility Criteria:**
- Min. 18 years of age
- Resident of India

**Card/item titles and body text (Steps):**
- Enter personal details
- Choose your credit card
- Complete your VKYC

**Subtext:**
- Get an assured credit card with FD.

**Footer Text & Button / CTA labels:**
- Check Your Credit Card Application Status
- Track Now

## Visual Design Tokens
- **Background colors (hex):**
  - Step Icon Background: `#222222` (Dark Gray/Black)
  - Card Background: `rgba(255, 255, 255, 0.6)` (Approximate: semi-transparent white/cream with a backdrop-filter blur, or a subtle linear gradient).
  - Card Footer Background: `#F4F5F7` (Solid light gray).
- **Text colors (hex):**
  - Primary Text: `#000000` (Black)
  - Step Icon Color: `#FFFFFF` (White)
- **Accent / CTA colors (hex):**
  - Dashed Line: `#A62A22` (Dark Red/Maroon)
  - Button Border: `#000000` (Black)
- **Font sizes (px or rem estimates):**
  - Main Title: `40px` (2.5rem)
  - Subtitle & Card Title: `18px` (1.125rem)
  - Body/Step Text: `14px` (0.875rem)
- **Font weights:**
  - Bold (700): Main Title, Subtitle, Card Title, Button Text.
  - Regular (400): Step text, Eligibility text, Subtext.
- **Border radius values:**
  - Main Card: `16px`
  - Step Icons: `50%` (Circular)
  - CTA Button: `24px` (Pill shape)
- **Box shadows:**
  - Main Card: Subtle drop shadow, e.g., `0 10px 30px rgba(0,0,0,0.05)`
- **Spacing / gap values:**
  - Card internal padding: `40px` top/bottom, `48px` left/right.
  - Gap between steps: `~80px` (handled via flex-grow or fixed margins).
- **Icon style:** Solid/Filled white icons inside dark circular backgrounds. Outline icons for eligibility criteria.

## Interaction Hints
- **Static layout or interactive:** Primarily static layout.
- **Visible hover states or transitions:** 
  - The "Track Now" button should have a hover state (likely inverting to black background with white text, `transition: all 0.3s ease`).
  - Step icons might have a subtle scale effect on hover (`transform: scale(1.05)`).
- **Any animation cues:** The dashed line could potentially animate (draw itself) on scroll into view, though a static CSS `border-top: 2px dashed #A62A22` is the baseline expectation.

## Content
```json
{
  "bg-image": "https://picsum.photos/seed/waves/1920/600",
  "bg-imageAlt": "Abstract waves background",
  "main-title": "How to get your credit card instantly?",
  "subtitle": "Check credit card eligibility criteria",
  "eligibility-1-icon": "https://picsum.photos/seed/user/24/24",
  "eligibility-1-iconAlt": "User icon",
  "eligibility-1-text": "Min. 18 years of age",
  "eligibility-2-icon": "https://picsum.photos/seed/check/24/24",
  "eligibility-2-iconAlt": "Checkmark icon",
  "eligibility-2-text": "Resident of India",
  "card-title": "Apply for a credit card online",
  "card-subtext": "Get an assured credit card with FD.",
  "footer-text": "Check Your Credit Card Application Status",
  "footer-cta": "Track Now",
  "_itemCount": 3,
  "_items": [
    {
      "step-icon": "https://picsum.photos/seed/form/64/64",
      "step-iconAlt": "Form icon",
      "step-text": "<p>Enter personal details</p>"
    },
    {
      "step-icon": "https://picsum.photos/seed/card/64/64",
      "step-iconAlt": "Card icon",
      "step-text": "<p>Choose your credit card</p>"
    },
    {
      "step-icon": "https://picsum.photos/seed/video/64/64",
      "step-iconAlt": "Video KYC icon",
      "step-text": "<p>Complete your VKYC</p>"
    }
  ]
}
```
  