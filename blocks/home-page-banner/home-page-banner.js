import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  console.log('home-page-banner',block)
  const banner = document.createElement('div');
  banner.className = 'home-page-banner-container';

  // Process block fields (main heading, subheading, description)
  const blockFields = block.querySelector(':scope > div');
  if (blockFields) {
    const heading = blockFields.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) {
      heading.className = 'home-page-banner-main-heading';
    }

    const subheading = blockFields.querySelector('p');
    if (subheading) {
      subheading.className = 'home-page-banner-subheading';
    }

    const description = blockFields.nextElementSibling?.querySelector('p');
    if (description) {
      description.className = 'home-page-banner-description';
    }
  }

  // Process banner items
  const items = [...block.children].slice(1); // Skip block fields
  items.forEach((row) => {
    const item = document.createElement('div');
    item.className = 'home-page-banner-item';

    const columns = row.querySelectorAll(':scope > div');
    if (columns.length >= 1) {
      const imageCol = columns[0];
      const contentCol = columns[1];

      // Process image
      const picture = imageCol.querySelector('picture');
      if (picture) {
        const img = picture.querySelector('img');
        if (img) {
          const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [
            { width: '800' },
            { width: '1200' },
            { width: '1600' }
          ]);
          moveInstrumentation(img, optimizedPic.querySelector('img'));
          picture.replaceWith(optimizedPic);
          item.appendChild(optimizedPic);
        }
      }

      // Process content
      if (contentCol) {
        const contentDiv = document.createElement('div');
        contentDiv.className = 'home-page-banner-content';

        const heading = contentCol.querySelector('h1, h2, h3, h4, h5, h6');
        if (heading) {
          heading.className = 'home-page-banner-item-heading';
          contentDiv.appendChild(heading);
        }

        const subheading = contentCol.querySelector('p');
        if (subheading) {
          subheading.className = 'home-page-banner-item-subheading';
          contentDiv.appendChild(subheading);
        }

        const description = contentCol.nextElementSibling?.querySelector('p');
        if (description) {
          description.className = 'home-page-banner-item-description';
          contentDiv.appendChild(description);
        }

        // Process CTAs
        const ctaContainer = document.createElement('div');
        ctaContainer.className = 'home-page-banner-cta-container';

        const ctaLink = contentCol.querySelector('a');
        if (ctaLink) {
          ctaLink.className = 'home-page-banner-cta primary';
          ctaContainer.appendChild(ctaLink);
        }

        const secondaryCtaLink = contentCol.nextElementSibling?.querySelector('a');
        if (secondaryCtaLink) {
          secondaryCtaLink.className = 'home-page-banner-cta secondary';
          ctaContainer.appendChild(secondaryCtaLink);
        }

        contentDiv.appendChild(ctaContainer);
        item.appendChild(contentDiv);
      }
    }

    banner.appendChild(item);
  });

  block.replaceWith(banner);
}