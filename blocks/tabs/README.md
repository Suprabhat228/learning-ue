
# Tabs

An interactive tabs block that lets visitors switch between credit card categories and view a rich detail panel for each tab.

## Block Type
Interactive

## Authoring (Universal Editor)
Add the **Tabs** block to a section, then set the section title and an accessible label for the tab list. Create one or more **Tabs Item** children to define each tab's label and ID. For each tab ID, add a **Tabs Card** (main panel content), optional **Tabs Meta Pill** items, and **Tabs Feature** items; all of these must reference the same Tab ID to appear together in that tab's panel.

## Fields
| Field                | Type        | Description                                                                 |
|----------------------|-------------|-----------------------------------------------------------------------------|
| section-title        | richtext    | Main heading for the tabs section.                                         |
| tabs-heading         | richtext    | Accessible label for the tab list navigation (used as `aria-label`).      |
| tab-label            | text        | Visible label for a tab button (Tabs Item).                                |
| tab-id               | text        | Unique identifier linking a tab button and its panel (used across items).  |
| panel-heading        | richtext    | Heading shown in the panel for a given tab (Tabs Card).                    |
| panel-subtitle       | richtext    | Subtitle/description under the panel heading (Tabs Card).                  |
| card-name            | text        | Primary card name shown in the list and detail area (Tabs Card).           |
| card-tag             | text        | Optional pill/tag for the primary card (Tabs Card).                        |
| meta-pill            | text        | Short pill label such as “Low interest” (Tabs Meta Pill).                  |
| feature              | richtext    | Feature or benefit text shown in the feature list (Tabs Feature).          |
| primaryCtaLink       | aem-content | URL or content reference for the primary CTA button (Tabs Card).           |
| primaryCtaLinkText   | text        | Visible text for the primary CTA button (Tabs Card).                       |
| secondaryCtaLink     | aem-content | URL or content reference for the secondary CTA button (Tabs Card).         |
| secondaryCtaLinkText | text        | Visible text for the secondary CTA button (Tabs Card).                     |

## Block Items
- **Tabs Item**: Defines a single tab button via `tab-label` and `tab-id`. One Tabs Item per tab.
- **Tabs Card**: Defines the main panel content for a specific tab (heading, subtitle, primary card, CTAs). Exactly one Tabs Card per `tab-id` is recommended.
- **Tabs Meta Pill**: Optional repeating items that add pill labels (e.g. “Low interest”) to a tab's panel; multiple per `tab-id` allowed.
- **Tabs Feature**: Optional repeating items that add feature list entries to a tab's panel; multiple per `tab-id` allowed.

## Variants
No variants.

## Dependencies
- `moveInstrumentation` from `../../scripts/scripts.js`.
  