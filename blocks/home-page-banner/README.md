# Home Page Banner Block

## Overview
The Home Page Banner block is a responsive hero component designed for the home page. It displays a series of banner items with background images, headings, descriptions, and call-to-action buttons.

## Features
- Responsive design (mobile, tablet, desktop)
- Background images with overlay
- Multiple banner items
- Primary and secondary call-to-action buttons
- Pixel-perfect implementation matching Figma design

## Authoring
The block provides the following authoring fields:

### Block-level fields:
- Main Heading
- Subheading
- Description

### Banner Item fields:
- Background Image (with alt text)
- Heading
- Subheading
- Description
- Primary Call to Action (text, link, type)
- Secondary Call to Action (text, link)

## Styling
The block uses the following design tokens from the Figma design:
- Colors: #c84418 (primary CTA), #ffffff (text), #f2f2f5 (background)
- Typography: Noto Sans (headings and body)
- Spacing: 11px, 12px, 20px, 24px, 40px, 60px
- Border radius: 8px, 30px

## JavaScript Behavior
The block.js file:
1. Creates optimized responsive images
2. Structures the banner items with proper semantic HTML
3. Applies appropriate classes for styling
4. Handles the responsive layout changes

## CSS
The block uses mobile-first responsive design with media queries for tablet and desktop breakpoints.

## Accessibility
- Proper contrast ratios for text on images
- Semantic HTML structure
- Alt text for images
- Keyboard-navigable buttons