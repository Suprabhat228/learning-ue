
# Full View 02

A responsive 3×2 feature grid block with a centered heading and icon-based cards, matching the provided Figma “Highlights” design.

## Block Type
Structural

## Authoring (Universal Editor)

Authors add the **Full View 02** block to a section and configure the block-level properties (optional block ID, eyebrow, heading, and description) in the Properties panel. Feature cards are added as **Full View 02 Item** entries; each item represents one card in the grid with an icon, optional background color override, and title text. The grid automatically lays out cards into 1, 2, or 3 columns depending on viewport width.

## Fields

| Field                  | Type      | Description                                                                 |
|------------------------|-----------|-----------------------------------------------------------------------------|
| block-id               | text      | Optional anchor/id for in-page linking.                                     |
| eyebrow                | text      | Optional small label above the main heading.                                |
| heading                | text      | Main section heading (e.g., “Highlights”).                                  |
| description            | richtext  | Optional short paragraph under the heading.                                 |
| title                  | text      | Card title shown under the icon.                                            |
| icon                   | reference | Icon asset displayed in the colored square.                                 |
| iconAlt                | text      | Accessible description for the icon image.                                  |
| icon-background-color  | text      | Hex or gradient token for the icon container background (e.g., `#a259ff`). |
| body                   | richtext  | Optional supporting copy under the title.                                   |
| badge                  | text      | Optional small label above the title.                                       |
| link-label             | text      | Optional CTA label (not used in this design).                               |
| link-url               | text      | Optional CTA URL.                                                           |

## Block Items

Each **Full View 02 Item** represents a single feature card in the grid. Items are rendered in authoring order, left-to-right and top-to-bottom. Only the `icon` and `title` fields are required to match the current design; other fields are optional for future use.

## Variants

No variants.

## Dependencies

None.

## Image Analysis

## Layout Blueprint

- **Overall layout pattern:**  
  - Single section with a centered heading and a **3×2 feature card grid**.  
  - Grid is symmetric; each card has identical dimensions and internal layout.

- **Visual sections / rows:**  
  1. **Row 1:** Section heading “Highlights” (centered).  
  2. **Row 2–3:** Feature grid (6 cards, 3 columns × 2 rows).

- **Alignment & spacing rhythm:**  
  - Section content centered within page.  
  - Heading centered horizontally with generous top/bottom padding (~64px above grid, ~32–48px below).  
  - Cards: equal horizontal and vertical gaps (~32–48px).  
  - Inside each card:  
    - Icon container centered horizontally, top padding (~32px).  
    - Text centered below icon with vertical gap (~16px).

- **Responsive behavior expectations:**  
  - **Desktop (≥1024px):** 3 columns × 2 rows.  
  - **Tablet (~768–1023px):** 2 columns × 3 rows.  
  - **Mobile (<768px):** 1 column, 6 stacked cards; heading remains centered above.

---

## Component Identification

- **Block type:** `feature-grid` (marketing highlights).  
- **Block name:** `full-view-02`.

- **Sub-components:**
  - Section heading (text).  
  - Feature cards (6):  
    - Card background panel.  
    - Icon container (rounded square with gradient or solid color).  
    - Icon (SVG/graphic).  
    - Feature title (single-line text; in design it’s the only text per card).

- **Number of repeating items:** 6 feature cards.

---

## Authoring Model (Field Suggestions)

### Block-level fields (once per block)

- `block-id` (text) — Optional anchor/id for in-page linking.  
- `eyebrow` (text) — Optional small label above heading (not used in design but useful).  
- `heading` (text) — Main section heading (e.g., “Highlights”).  
- `description` (richtext) — Optional short paragraph under heading (not present in design; can be empty).  
- `background-color` (text) — Hex token for section background; default `#ffffff` (Full View_02).  
- `columns-desktop` (text) — Number of columns on desktop; default `3`.  
- `columns-tablet` (text) — Number of columns on tablet; default `2`.  
- `columns-mobile` (text) — Number of columns on mobile; default `1`.  
- `card-background-color` (text) — Default card background; `#f0f5fa` (Rectangle 1581).  
- `icon-style` (text) — Optional style hint (e.g., `gradient-square`, `solid-square`).

### Item-level fields (per card)

- `icon` (reference) — Icon asset (SVG/PNG).  
- `icon-background-color` (text) — Hex or gradient token for icon container; defaults can map to Figma colors (see tokens).  
- `title` (text) — Feature title.  
- `body` (richtext) — Optional supporting copy (not in design but future-proof).  
- `badge` (text) — Optional small label above title (not used in design).  
- `link-label` (text) — Optional CTA label (e.g., “Learn more”).  
- `link-url` (text) — Optional CTA URL.  

---

## Column Map (EDS Authored Table)

Assuming a single EDS table for items; block-level fields are configured as block properties.

**Item table columns → fields**

- **Column 0 → `title` (text)**  
- **Column 1 → `icon` (reference)**  
- **Column 2 → `icon-background-color` (text)**  
- **Column 3 → `body` (richtext)**  
- **Column 4 → `badge` (text)**  
- **Column 5 → `link-label` (text)**  
- **Column 6 → `link-url` (text)**  

If you prefer a minimal model strictly matching the design, you can omit `body`, `badge`, and link fields.

---

## OCR Content Inventory

### Section heading

- **Heading:** `Highlights`

### Card titles (6 items, left-to-right, top row then bottom row)

1. `Well Organized layer & Elemnets`  
2. `Send Font Family Used`  
3. `Global Guidestyle`  
4. `50+ Clean UI Crafted screens`  
5. `Responsive Resizing Screens`  
6. `Trendy Design & Colors`

*(Note: “Elemnets” and “Guidestyle” are spelled as in the design.)*

There are no visible buttons, prices, badges, or captions in this block.

---

## Visual Design Tokens

### Colors

From provided tokens and visual mapping:

- **Section background:**  
  - `#ffffff` — Full View_02.

- **Card background:**  
  - `#f0f5fa` — Rectangle 1581.

- **Primary text:**  
  - Heading and card titles appear near-black:  
    - Likely `#222228` — “Well Organized layer & Elemnets” token.  

- **Icon container / accent colors**  
  (each card uses a different accent; mapping to provided tokens):

  1. Card 1 (purple): `#a259ff` — Rectangle 1585.  
  2. Card 2 (blue): `#1c95ff` — Rectangle 1584.  
  3. Card 3 (orange): `#fc7f5d` — Rectangle 1587.  
  4. Card 4 (green): `#0acf83` or `#09cf83` — Rectangle 1585/1584 (green variants).  
  5. Card 5 (red/pink): `#fd527d` — Rectangle 1587.  
  6. Card 6 (pink/magenta): `#ff61f6` — Rectangle 1587.

- **Shadow / subtle border color:**  
  - Likely `#eaedf1` — Frame 7492, used in soft card shadows or borders.  
  - Neutral gray for icon inner shapes: `#c4c4c4` — Ellipse 1516.

### Typography

- **Heading (“Highlights”):**  
  - Font: Gilroy.  
  - Size: ~38px (token: Well Organized layer & Elemnets 38px, but visually heading is slightly larger; could be 40px).  
  - Weight: Semibold/Bold.  
  - Alignment: center.

- **Card titles:**  
  - Font: Gilroy or Poppins (design system uses both; titles visually closer to Gilroy).  
  - Size: ~18–20px.  
  - Weight: Medium.  
  - Alignment: center.  
  - Line-height: ~1.4.

### Border radius

- **Cards:**  
  - Large radius, approx 16–24px (matches 16px or 24px from spacing scale).  
- **Icon containers:**  
  - Rounded square, radius ~16px (almost pill-like but still square).

### Box shadows

- Cards and icon containers have soft drop shadows:

- **Card shadow (approx):**  
  - `0 24px 48px rgba(0, 0, 0, 0.04)` or using `#eaedf1` as shadow color with low opacity.

- **Icon shadow (approx):**  
  - `0 16px 32px rgba(0, 0, 0, 0.12)` or colored glow matching icon background.

### Gradients

- Icon backgrounds appear as subtle radial/linear gradients from a saturated color to a lighter tint. Example:

  - Purple: `linear-gradient(135deg, #a259ff 0%, #ff61f6 100%)`  
  - Green: `linear-gradient(135deg, #0acf83 0%, #09cf83 100%)`

Exact gradient stops can be approximated or configured as design tokens.

### Spacing / gaps

Using provided scale (4, 8, 12, 16, 24, 32, 48, 64):

- Section padding top/bottom: **64px**.  
- Space between heading and grid: **48px**.  
- Grid column/row gap: **32px** (could be 32–48; 32 is on scale).  
- Card internal padding: **32px**.  
- Space between icon and title: **24px**.

### Icon style

- Icons are **filled custom SVGs** inside rounded squares.  
- Simple, flat glyphs (stack, text tool, diamond grid, phone, browser, palette).  
- White icon glyphs on colored gradient backgrounds.

---

## Interaction Hints

- **Layout type:** Static feature grid; no carousel or tabs.  
- **Interactivity:**  
  - Each card likely has a hover state:  
    - Slight elevation (stronger shadow).  
    - Maybe subtle scale-up or background lightening.  
  - Icon container may glow more intensely on hover.

- **Animations:**  
  - No explicit animation cues in static design, but cards could fade/slide in on scroll in implementation.

---

This defines the `full-view-02` block as a reusable, responsive 3×2 feature grid with configurable heading and per-card icon/title content, aligned with the provided Figma tokens.

## Content

```json
{
  "block-id": "highlights",
  "eyebrow": "",
  "heading": "Highlights",
  "description": "",
  "_itemCount": 6,
  "_items": [
    {
      "title": "Well Organized layer & Elemnets",
      "icon": "/icons/stack.svg",
      "iconAlt": "Stacked layers icon",
      "icon-background-color": "#a259ff",
      "body": "",
      "badge": "",
      "link-label": "",
      "link-url": ""
    },
    {
      "title": "Send Font Family Used",
      "icon": "/icons/text-tool.svg",
      "iconAlt": "Text tool icon",
      "icon-background-color": "#1c95ff",
      "body": "",
      "badge": "",
      "link-label": "",
      "link-url": ""
    },
    {
      "title": "Global Guidestyle",
      "icon": "/icons/grid-diamond.svg",
      "iconAlt": "Diamond grid icon",
      "icon-background-color": "#fc7f5d",
      "body": "",
      "badge": "",
      "link-label": "",
      "link-url": ""
    },
    {
      "title": "50+ Clean UI Crafted screens",
      "icon": "/icons/phone.svg",
      "iconAlt": "Phone icon",
      "icon-background-color": "#0acf83",
      "body": "",
      "badge": "",
      "link-label": "",
      "link-url": ""
    },
    {
      "title": "Responsive Resizing Screens",
      "icon": "/icons/browser.svg",
      "iconAlt": "Browser window icon",
      "icon-background-color": "#fd527d",
      "body": "",
      "badge": "",
      "link-label": "",
      "link-url": ""
    },
    {
      "title": "Trendy Design & Colors",
      "icon": "/icons/palette.svg",
      "iconAlt": "Color palette icon",
      "icon-background-color": "#ff61f6",
      "body": "",
      "badge": "",
      "link-label": "",
      "link-url": ""
    }
  ]
}
```
  