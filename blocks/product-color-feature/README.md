
# Product Color Feature Block

An interactive product color selector block for AEM Edge Delivery Services. It displays a product image at the top with a set of color swatches below. Selecting a swatch changes the displayed product image to match the chosen color variant, with smooth transitions and full accessibility support.

---

## Features

- **Dynamic color-based image swapping** — each swatch can point to a unique product image
- **Smooth fade transitions** on image change
- **Active swatch indicator** — ring + checkmark with auto-contrast (light/dark)
- **Screen reader announcements** via ARIA live region
- **Keyboard navigation** — full keyboard support (Tab, Enter, Space)
- **Mobile-first responsive layout** — stacked on mobile, side-by-side on desktop
- **WCAG 2.1 AA compliant** — 44×44px touch targets, focus-visible rings, forced-colors support
- **Reduced motion support** — respects `prefers-reduced-motion`

---

## Block Structure

```
product-color-feature/
├── _product-color-feature.json   ← Authoring schema (Universal Editor)
├── product-color-feature.js      ← Decoration / interaction logic
├── product-color-feature.css     ← Block styles
└── README.md
```

---

## Authoring Guide (Universal Editor)

### Step 1 — Add the Block

Insert the **Product Color Feature** block on your page via the Universal Editor component picker.

### Step 2 — Fill in Block-Level Fields

These fields apply to the entire product card:

| Field | Description | Example |
|---|---|---|
| **Product Name** | Main product heading | `AirMax Pro Sneaker` |
| **Product Subtitle** | Short descriptor below the name | `Lightweight performance running shoe` |
| **Product Image** | Default/fallback product image (DAM reference) | `/content/dam/products/airmax-default.webp` |
| **Product Image Alt Text** | Accessibility alt text for the default image | `AirMax Pro Sneaker in default colorway` |
| **Product Price** | Displayed price string | `$189.99` |
| **Color Section Label** | Label shown above the swatches | `Select Color` |
| **CTA Link** | URL the Add to Cart button points to | `/shop/airmax-pro/add-to-cart` |
| **CTA Button Text** | Text displayed on the button | `Add to Cart` |
| **CTA Button Title** | Tooltip / accessible title for the button | `Add AirMax Pro to your cart` |

### Step 3 — Add Color Swatches

Click **Add** inside the block to insert **Color Swatch** child items. Add one item per color variant.

Each **Color Swatch** item has these fields:

| Field | Description | Example |
|---|---|---|
| **Color Name** | Human-readable name shown on hover / selection | `Midnight Black` |
| **Color Hex Code** | Valid CSS hex color — shown as the swatch circle | `#1a1a2e` |
| **Product Image for this Color** | DAM reference to the product image for this variant | `/content/dam/products/airmax-black.webp` |
| **Color Image Alt Text** | Alt text for the variant image | `AirMax Pro Sneaker in Midnight Black` |
| **Set as Default Color** | Check this to make this swatch pre-selected on load | ✅ (checked) |

> **Tip:** Only one swatch should have **Set as Default Color** checked. If multiple are checked, the first one wins. If none are checked, the first swatch is used as the default.

---

## Example Authoring Content

Using the content of the provided design, author the block as follows:

### Block-Level Fields

- **Product Name:** `AirMax Pro Sneaker`
- **Product Subtitle:** `Lightweight performance running shoe with responsive cushioning`
- **Product Image:** `/content/dam/products/airmax-coral.webp`
- **Product Image Alt Text:** `AirMax Pro Sneaker`
- **Product Price:** `$189.99`
- **Color Section Label:** `Select Color`
- **CTA Link:** `/shop/airmax-pro`
- **CTA Button Text:** `Add to Cart`
- **CTA Button Title:** `Add AirMax Pro Sneaker to your cart`

### Color Swatches

| Color Name | Hex Code | Image | Default |
|---|---|---|---|
| Midnight Black | `#1a1a2e` | `/content/dam/products/airmax-black.webp` | ✅ |
| Coral Flame | `#ff6b6b` | `/content/dam/products/airmax-coral.webp` | — |
| Ocean Blue | `#0077b6` | `/content/dam/products/airmax-blue.webp` | — |
| Forest Green | `#2d6a4f` | `/content/dam/products/airmax-green.webp` | — |
| Pearl White | `#f8f9fa` | `/content/dam/products/airmax-white.webp` | — |
| Sunset Gold | `#ffd166` | `/content/dam/products/airmax-gold.webp` | — |

---

## Technical Notes

### Color Hex Validation

The block validates each hex code on page load. Invalid or missing codes (e.g., `rgb(...)`, named colors, or empty values) are skipped with a console warning. Always use 3- or 6-character hex codes: `#fff` or `#ffffff`.

### Image Fallback

If a color swatch does not have a variant image, the product image will **not change** when that swatch is selected — only the swatch ring and color name label update. The default product image remains visible.

### Instrumentation Preservation

All Universal Editor instrumentation (`data-aue-*` attributes) is preserved during decoration using `moveInstrumentation()`. In-context editing and overlay interactions remain fully functional.

### Performance

Product images are loaded using `createOptimizedPicture()` from `aem.js`, which generates responsive `<picture>` elements with WebP support and appropriate breakpoints:
- Mobile: 400px width
- Desktop (≥768px): 800px width

The initial/default image is loaded with `loading="eager"` for LCP optimization. Subsequent swatch-swap images use the default lazy loading behavior.

---

## Accessibility

| Feature | Implementation |
|---|---|
| Screen reader announcements | `aria-live="polite"` region updates on swatch change |
| Swatch toggle state | `aria-pressed="true/false"` on each button |
| Swatch group label | `role="group"` + `aria-label` on the swatch container |
| Keyboard activation | Enter and Space key handlers on swatch buttons |
| Focus visibility | `:focus-visible` outline on all interactive elements |
| Touch target size | All swatches are minimum 44×44px per WCAG 2.5.5 |
| High contrast mode | `@media (forced-colors: active)` overrides |
| Reduced motion | All CSS transitions disabled via `prefers-reduced-motion` |
| Image alt text | Per-swatch alt text provided via field-collapse |
| Price label | `aria-label="Price: $189.99"` on price element |

---

## CSS Custom Properties

Override these in your site's theme to adapt the block to your brand:

```css
.product-color-feature {
  --pcf-color-accent: #0055cc;          /* CTA button + focus rings */
  --pcf-color-text-primary: #1a1a2e;    /* Headings and active states */
  --pcf-color-text-secondary: #555e6e;  /* Subtitle text */
  --pcf-color-bg-soft: #f4f6f9;         /* Image section background */
  --pcf-color-price: #0055cc;           /* Price color */
  --pcf-swatch-size: 2.5rem;            /* Swatch circle diameter */
  --pcf-radius-card: 1rem;              /* Card corner radius */
}
```

---

## Browser Support

Supports all modern browsers (Chrome, Firefox, Safari, Edge). Uses standard CSS features with no experimental APIs. CSS custom properties (`var()`) are used throughout — ensure your browser target supports them (all modern browsers do).
  