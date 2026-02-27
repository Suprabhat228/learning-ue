import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // 1. Tag the main block - DO NOT replace it
  block.classList.add('home-page-banner-container');

  // 2. Identify Rows
  const rows = [...block.children];
  
  rows.forEach((row, index) => {
    if (index === 0) {
      // --- HEADER ROW ---
      row.classList.add('home-page-banner-header-row');
      const content = row.querySelector(':scope > div');
      if (content) {
        content.classList.add('home-page-banner-header-content');
        
        // Use class assignment rather than moving nodes
        const h = content.querySelector('h1, h2, h3, h4, h5, h6');
        if (h) h.classList.add('home-page-banner-main-heading');
        
        const ps = content.querySelectorAll('p');
        if (ps[0]) ps[0].classList.add('home-page-banner-subheading');
        if (ps[1]) ps[1].classList.add('home-page-banner-description');
      }
    } else {
      // --- ITEM ROWS ---
      row.classList.add('home-page-banner-item');
      const cols = [...row.children];

      // Column 0: Image
      const imageCol = cols[0];
      if (imageCol) {
        imageCol.classList.add('home-page-banner-image-wrapper');
        const img = imageCol.querySelector('img');
        if (img) {
          const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [
            { width: '800' }, { width: '1200' }, { width: '1600' }
          ]);
          // This is the ONLY safe place to replace an element 
          // because moveInstrumentation handles the UE metadata transfer
          moveInstrumentation(img.closest('picture'), optimizedPic);
          img.closest('picture').replaceWith(optimizedPic);
        }
      }

      // Column 1: Content
      const contentCol = cols[1];
      if (contentCol) {
        contentCol.classList.add('home-page-banner-content');
        
        const itemH = contentCol.querySelector('h1, h2, h3, h4, h5, h6');
        if (itemH) itemH.classList.add('home-page-banner-item-heading');

        const itemPs = contentCol.querySelectorAll('p');
        itemPs.forEach((p, pIdx) => {
          // Identify if it's a link container or text
          if (p.querySelector('a')) {
            p.classList.add('home-page-banner-cta-container');
            const links = p.querySelectorAll('a');
            links.forEach((a, aIdx) => {
              a.classList.add('home-page-banner-cta');
              a.classList.add(aIdx === 0 ? 'primary' : 'secondary');
            });
          } else {
            // Map remaining paragraphs to subhead/desc based on order
            if (pIdx === 0) p.classList.add('home-page-banner-item-subheading');
            else p.classList.add('home-page-banner-item-description');
          }
        });
      }
    }
  });
}