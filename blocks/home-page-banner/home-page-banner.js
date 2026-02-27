import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // 1. Setup the main container
  block.classList.add('home-page-banner-container');

  // 2. Separate the first row (Header) from the rest (Items)
  const rows = [...block.children];
  const headerRow = rows[0];
  const itemRows = rows.slice(1);

  // --- Process Header Section ---
  if (headerRow) {
    headerRow.classList.add('home-page-banner-header');
    const headerCol = headerRow.querySelector(':scope > div');
    
    if (headerCol) {
      // Find heading and description in the header
      const heading = headerCol.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) heading.classList.add('home-page-banner-main-heading');

      const subheading = headerCol.querySelector('p');
      if (subheading) subheading.classList.add('home-page-banner-subheading');
      
      // If there's a second paragraph, it's the description
      const description = headerCol.querySelectorAll('p')[1];
      if (description) description.classList.add('home-page-banner-description');
    }
  }

  // --- Process Banner Items ---
  itemRows.forEach((row) => {
    row.classList.add('home-page-banner-item');
    const cols = [...row.children];
    
    // Column 0: Image
    const imageCol = cols[0];
    if (imageCol) {
      imageCol.classList.add('home-page-banner-image-wrapper');
      const img = imageCol.querySelector('img');
      if (img) {
        const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [
          { width: '800' },
          { width: '1200' },
          { width: '1600' }
        ]);
        // Critical for UE: Move instrumentation from old picture to new one
        const oldPic = img.closest('picture');
        if (oldPic) {
          moveInstrumentation(oldPic, optimizedPic);
          oldPic.replaceWith(optimizedPic);
        }
      }
    }

    // Column 1: Content
    const contentCol = cols[1];
    if (contentCol) {
      contentCol.classList.add('home-page-banner-content');

      // Style Heading
      const itemHeading = contentCol.querySelector('h1, h2, h3, h4, h5, h6');
      if (itemHeading) itemHeading.classList.add('home-page-banner-item-heading');

      // Style Paragraphs (Subheading & Description)
      const paragraphs = contentCol.querySelectorAll('p:not(.button-container)');
      if (paragraphs[0]) paragraphs[0].classList.add('home-page-banner-item-subheading');
      if (paragraphs[1]) paragraphs[1].classList.add('home-page-banner-item-description');

      // Style CTAs (AEM naturally wraps links in .button-container)
      const ctaContainer = document.createElement('div');
      ctaContainer.className = 'home-page-banner-cta-container';
      
      const links = contentCol.querySelectorAll('a');
      links.forEach((link, index) => {
        link.classList.add('home-page-banner-cta');
        link.classList.add(index === 0 ? 'primary' : 'secondary');
        // We wrap links in a container for styling, but keep the link elements themselves
        ctaContainer.appendChild(link.closest('.button-container') || link);
      });
      contentCol.appendChild(ctaContainer);
    }
  });
}