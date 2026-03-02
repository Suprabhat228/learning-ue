
# Carousel Block

The Carousel block displays a series of images with optional call-to-action buttons. It automatically scrolls every 4 seconds and works on both desktop and mobile devices.

## Authoring Guidelines

1. **Carousel Block**:
   - **Title**: Add a title for the carousel (optional).

2. **Carousel Item**:
   - **Image**: Select an image for the carousel slide.
   - **Image Alt**: Provide alternative text for the image.
   - **Link**: Add a URL for the call-to-action button.
   - **Link Text**: Specify the text for the call-to-action button.

## Example Usage

```html
<div class="carousel">
  <div>
    <picture>
      <img src="/content/dam/image1.jpg" alt="Image 1">
    </picture>
    <a href="https://example.com" title="Learn More">Learn More</a>
  </div>
  <div>
    <picture>
      <img src="/content/dam/image2.jpg" alt="Image 2">
    </picture>
    <a href="https://example.com" title="Discover More">Discover More</a>
  </div>
</div>
```

## CSS Classes

- `.carousel-container`: The main container for the carousel.
- `.carousel-slides`: The container for the carousel slides.
- `.carousel-slide`: Individual carousel slide.
- `.carousel-link-container`: Container for the call-to-action button.
- `.carousel-indicators`: Container for the carousel indicators.
- `.carousel-indicator`: Individual carousel indicator.
    