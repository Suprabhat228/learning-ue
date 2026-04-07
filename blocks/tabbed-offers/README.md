
# Tabbed Offers

An interactive block that displays a grid of offer cards categorized by tabs. Clicking a tab filters the visible cards.

## Block Type
Interactive

## Authoring (Universal Editor)
Authors provide a main title and subtitle for the block. Then, they add repeating "Offer Card" items. Each item requires a `tab-category` text field. The block automatically groups cards by this category and generates the tab navigation buttons.

## Fields
| Field | Type | Description |
|-------|------|-------------|
| title | richtext | Main heading for the block. |
| subtitle | text | Text displayed below the title. |

## Block Items
Repeating "Offer Card" items.

| Field | Type | Description |
|-------|------|-------------|
| tab-category | text | The tab under which this card should appear (e.g., "Dining"). |
| card-image | reference | Background image for the top half of the card. |
| card-imageAlt | text | Accessible description for the card image. |
| brand-logo | reference | Circular logo image overlapping the card image. |
| brand-logoAlt | text | Accessible description for the brand logo. |
| offer-title | text | Main offer text (e.g., Get up to ₹2,000 Off). |
| offer-description | text | Details below the title. |
| cta | aem-content | URL for the button. |
| ctaText | text | Label for the button. |

## Variants
No variants.

## Dependencies
`moveInstrumentation` from `../../scripts/scripts.js`

## Image Analysis
- **Overall layout pattern:** Single-column container with three distinct vertical sections: Header (text), Tab Navigation (horizontal flexbox), and Content Grid (multi-column card grid).
- **Number of visual sections / rows:** 
  1. Section Header (Title & Subtitle)
  2. Tab Navigation Row
  3. Card Grid Row (currently showing 1 row of 3 cards)
- **Alignment, spacing rhythm:** Center-aligned header and tabs. Left-aligned text within the cards. Consistent gap spacing between tabs (~12px) and between cards (~24px).
- **Responsive behavior expectations:** 
  - **Mobile:** Tabs should become a horizontally scrollable row with hidden scrollbars. Cards should stack vertically (1 column).
  - **Tablet:** Cards should transition to a 2-column grid.
  - **Desktop:** Cards display in a 3-column grid (as shown).
- **Block type:** `tabs` (specifically, a tabbed-card-grid).
- **Sub-components:** Pill-shaped tab buttons, Card container, Card hero image, Circular brand logo badge, Card typography, Full-width pill-shaped CTA button.
- **Visual Design Tokens:**
  - Page Background: `#000000`
  - Card Background: `#2A2A2A`
  - Active Tab Background: `#FFFFFF`
  - Inactive Tab Background: `#000000`
  - Card CTA Button: `#000000`
  - Logo Badge Background: `#FFFFFF`
  - Main Headings & Card Titles: `#FFFFFF`
  - Subheading & Card Descriptions: `#A0A0A0`
  - Active Tab Text: `#000000`
  - Inactive Tab Text: `#FFFFFF`
  - CTA Button Text: `#FFFFFF`
  - Border radius: Tabs `999px`, Card `16px`, Logo `50%`, CTA `999px`
  - Borders: Inactive Tabs `1px solid #444444`

## Content

```json
{
  "title": "<h2>Credit card offers from your favourite brands</h2>",
  "subtitle": "Available across multiple categories",
  "_itemCount": 5,
  "_items": [
    {
      "tab-category": "Dining",
      "card-image": "https://picsum.photos/seed/dining1/600/400",
      "card-imageAlt": "Healthy food bowls",
      "brand-logo": "https://picsum.photos/seed/logo1/100/100",
      "brand-logoAlt": "Swiggy Instamart Logo",
      "offer-title": "Get up to ₹2,000 Off",
      "offer-description": "on Swiggy Instamart with your Credit Card EMI transactions only",
      "cta": "/offers/swiggy",
      "ctaText": "Know More"
    },
    {
      "tab-category": "Dining",
      "card-image": "https://picsum.photos/seed/dining2/600/400",
      "card-imageAlt": "Fresh vegetables in a paper bag",
      "brand-logo": "https://picsum.photos/seed/logo2/100/100",
      "brand-logoAlt": "Zepto Logo",
      "offer-title": "Get up to ₹4,000 Off",
      "offer-description": "on Zepto with your Credit Card EMI transactions only",
      "cta": "/offers/zepto",
      "ctaText": "Know More"
    },
    {
      "tab-category": "Dining",
      "card-image": "https://picsum.photos/seed/dining3/600/400",
      "card-imageAlt": "Pizza Margherita",
      "brand-logo": "https://picsum.photos/seed/logo3/100/100",
      "brand-logoAlt": "Zomato Logo",
      "offer-title": "Flat ₹75 Off",
      "offer-description": "on Zomato with your Credit Card transactions only",
      "cta": "/offers/zomato",
      "ctaText": "Know More"
    },
    {
      "tab-category": "Shopping",
      "card-image": "https://picsum.photos/seed/shop1/600/400",
      "card-imageAlt": "Shopping bags",
      "brand-logo": "https://picsum.photos/seed/logo4/100/100",
      "brand-logoAlt": "Shopping Brand Logo",
      "offer-title": "10% Cashback",
      "offer-description": "on top fashion brands with your Credit Card",
      "cta": "/offers/shopping",
      "ctaText": "Know More"
    },
    {
      "tab-category": "Health & Wellness",
      "card-image": "https://picsum.photos/seed/health1/600/400",
      "card-imageAlt": "Yoga mat and weights",
      "brand-logo": "https://picsum.photos/seed/logo5/100/100",
      "brand-logoAlt": "Health Brand Logo",
      "offer-title": "Free Health Checkup",
      "offer-description": "Complimentary annual checkup with premium cards",
      "cta": "/offers/health",
      "ctaText": "Know More"
    }
  ]
}
```
  