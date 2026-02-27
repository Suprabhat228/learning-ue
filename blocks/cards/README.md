# Cards Block

A responsive cards block for displaying home loan options with search functionality.

## Features

- Displays a title and search input at the top
- Grid layout of loan option cards
- Each card contains an image, title, and description
- Responsive design that adapts to different screen sizes
- Hover effects on cards for better user interaction
- Optimized images using AEM's createOptimizedPicture

## Authoring

### Block Fields

- **Title**: Main heading for the cards section (e.g., "All home loans")
- **Search Link**: Link for the search functionality (optional)
- **Search Text**: Text for the search label (optional)
- **Search Placeholder**: Placeholder text for the search input (e.g., "Search account")

### Card Fields

- **Image**: Image for the card
- **Image Alt**: Alt text for the image
- **Title**: Title for the loan option
- **Description**: Description text for the loan option

## Edge Cases Handled

- Empty block or missing rows
- Missing block fields (title, search)
- Missing card fields (image, content)
- Invalid or missing images
- Responsive layout for all screen sizes

## Dependencies

- `createOptimizedPicture` from AEM scripts for image optimization
- `moveInstrumentation` from scripts.js for Universal Editor compatibility

## Usage

1. Add the cards block to your page
2. Configure the block-level fields (title, search)
3. Add card items with images, titles, and descriptions
4. The block will automatically render a responsive grid of loan options