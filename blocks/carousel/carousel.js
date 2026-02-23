
export default function decorate(block) {
  // Create the main carousel container
  const carouselContainer = document.createElement('div');
  carouselContainer.className = 'carousel-container';

  // Create the slides container
  const slidesContainer = document.createElement('div');
  slidesContainer.className = 'carousel-slides';

  // Create the indicators container
  const indicatorsContainer = document.createElement('div');
  indicatorsContainer.className = 'carousel-indicators';

  // Create navigation buttons
  const prevButton = document.createElement('button');
  prevButton.className = 'carousel-nav carousel-prev';
  prevButton.innerHTML = '&#10094;';
  prevButton.setAttribute('aria-label', 'Previous slide');

  const nextButton = document.createElement('button');
  nextButton.className = 'carousel-nav carousel-next';
  nextButton.innerHTML = '&#10095;';
  nextButton.setAttribute('aria-label', 'Next slide');

  // Initialize current index and interval
  let currentIndex = 0;
  let intervalId;

  // Process each slide
  [...block.children].forEach((slide, index) => {
    const slideElement = document.createElement('div');
    slideElement.className = 'carousel-slide';
    if (index === 0) slideElement.classList.add('active');

    // Add image to slide
    const image = slide.querySelector('picture');
    if (image) {
      slideElement.appendChild(image);
    }

    // Add link to slide if exists
    const link = slide.querySelector('a');
    if (link) {
      const linkContainer = document.createElement('div');
      linkContainer.className = 'carousel-link-container';
      linkContainer.appendChild(link);
      slideElement.appendChild(linkContainer);
    }

    slidesContainer.appendChild(slideElement);

    // Create indicator
    const indicator = document.createElement('button');
    indicator.className = 'carousel-indicator';
    if (index === 0) indicator.classList.add('active');
    indicator.setAttribute('data-index', index);
    indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
    indicatorsContainer.appendChild(indicator);
  });

  // Assemble the carousel
  carouselContainer.appendChild(slidesContainer);
  carouselContainer.appendChild(prevButton);
  carouselContainer.appendChild(nextButton);
  carouselContainer.appendChild(indicatorsContainer);

  // Replace the original block content
  block.replaceChildren(carouselContainer);

  // Get all slides and indicators
  const slides = slidesContainer.querySelectorAll('.carousel-slide');
  const indicators = indicatorsContainer.querySelectorAll('.carousel-indicator');

  // Update carousel display
  function updateCarousel() {
    slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === currentIndex);
    });

    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === currentIndex);
    });
  }

  // Go to next slide
  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel();
  }

  // Go to previous slide
  function prevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateCarousel();
  }

  // Start auto-scrolling
  function startAutoScroll() {
    intervalId = setInterval(nextSlide, 4000);
  }

  // Stop auto-scrolling
  function stopAutoScroll() {
    clearInterval(intervalId);
  }

  // Event listeners for navigation buttons
  nextButton.addEventListener('click', () => {
    nextSlide();
    stopAutoScroll();
    startAutoScroll();
  });

  prevButton.addEventListener('click', () => {
    prevSlide();
    stopAutoScroll();
    startAutoScroll();
  });

  // Event listeners for indicators
  indicators.forEach((indicator) => {
    indicator.addEventListener('click', () => {
      currentIndex = parseInt(indicator.getAttribute('data-index'));
      updateCarousel();
      stopAutoScroll();
      startAutoScroll();
    });
  });

  // Pause on hover
  carouselContainer.addEventListener('mouseenter', stopAutoScroll);
  carouselContainer.addEventListener('mouseleave', startAutoScroll);

  // Keyboard navigation
  carouselContainer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      nextSlide();
      stopAutoScroll();
      startAutoScroll();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
      stopAutoScroll();
      startAutoScroll();
    }
  });

  // Initialize carousel
  updateCarousel();
  startAutoScroll();

  // Make carousel focusable for keyboard navigation
  carouselContainer.setAttribute('tabindex', '0');
}
    