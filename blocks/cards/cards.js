import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // Edge Case: Empty block or no rows
  if (!block || !block.children || block.children.length === 0) {
    console.warn('Cards block is empty or malformed.');
    return;
  }

  // Extract block-level fields (title, search)
  const rows = [...block.children];
  const blockFieldsRow = rows.shift(); // First row is block fields
  const blockFields = blockFieldsRow ? [...blockFieldsRow.children] : [];

  // Edge Case: Missing block fields row
  if (!blockFieldsRow || blockFields.length < 2) {
    console.warn('Cards block is missing required block fields.');
  }

  // Create container for cards
  const container = document.createElement('div');
  container.className = 'cards-container';

  // Process block title and search
  if (blockFields.length >= 1) {
    const titleDiv = blockFields[0];
    const title = titleDiv.textContent.trim();
    if (title) {
      const h1 = document.createElement('h1');
      h1.textContent = title;
      container.appendChild(h1);
    }
  }

  // Process search field
  if (blockFields.length >= 2) {
    const searchDiv = blockFields[1];
    const searchLink = searchDiv.querySelector('a');
    const searchText = searchDiv.textContent.trim();

    const searchContainer = document.createElement('div');
    searchContainer.className = 'cards-search';

    if (searchLink) {
      const searchInput = document.createElement('div');
      searchInput.className = 'cards-search-input';

      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = searchDiv.dataset.placeholder || 'Search account';
      input.ariaLabel = 'Search home loans';

      const searchIcon = document.createElement('span');
      searchIcon.className = 'cards-search-icon';
      searchIcon.innerHTML = '🔍';

      const micIcon = document.createElement('span');
      micIcon.className = 'cards-mic-icon';
      micIcon.innerHTML = '🎤';

      searchInput.appendChild(input);
      searchInput.appendChild(searchIcon);
      searchInput.appendChild(micIcon);

      searchContainer.appendChild(searchInput);
    }

    container.appendChild(searchContainer);
  }

  // Process card items
  const cardsGrid = document.createElement('div');
  cardsGrid.className = 'cards-grid';

  rows.forEach((row) => {
    const card = document.createElement('div');
    card.className = 'cards-card';
    moveInstrumentation(row, card);

    const columns = [...row.children];
    if (columns.length >= 2) {
      const imageCol = columns[0];
      const contentCol = columns[1];

      // Process image
      const picture = imageCol.querySelector('picture');
      if (picture) {
        const img = picture.querySelector('img');
        if (img) {
          const optimizedPic = createOptimizedPicture(
            img.src,
            img.alt || '',
            false,
            [{ width: '400' }]
          );
          moveInstrumentation(img, optimizedPic.querySelector('img'));
          card.appendChild(optimizedPic);
        }
      }

      // Process content
      const contentDiv = document.createElement('div');
      contentDiv.className = 'cards-card-content';

      const title = contentCol.querySelector('h3, h4, h5, h6, p:first-child');
      if (title) {
        const cardTitle = document.createElement('h3');
        cardTitle.textContent = title.textContent.trim();
        contentDiv.appendChild(cardTitle);
      }

      const description = contentCol.querySelector('p:not(:first-child)');
      if (description) {
        const cardDesc = document.createElement('p');
        cardDesc.textContent = description.textContent.trim();
        contentDiv.appendChild(cardDesc);
      }

      card.appendChild(contentDiv);
    }

    cardsGrid.appendChild(card);
  });

  container.appendChild(cardsGrid);
  block.textContent = '';
  block.appendChild(container);
}