
export default function decorate(block) {
  // const carousel = document.createElement('div');
  // carousel.className = 'carousel-container';

  // const slidesContainer = document.createElement('div');
  // slidesContainer.className = 'carousel-slides';

  // const indicatorsContainer = document.createElement('div');
  // indicatorsContainer.className = 'carousel-indicators';

  // [...block.children].forEach((slide, index) => {
  //   const slideElement = document.createElement('div');
  //   slideElement.className = 'carousel-slide';

  //   const image = slide.querySelector('picture');
  //   if (image) {
  //     slideElement.appendChild(image);
  //   }

  //   const link = slide.querySelector('a');
  //   if (link) {
  //     const linkContainer = document.createElement('div');
  //     linkContainer.className = 'carousel-link-container';
  //     linkContainer.appendChild(link);
  //     slideElement.appendChild(linkContainer);
  //   }

  //   slidesContainer.appendChild(slideElement);

  //   const indicator = document.createElement('button');
  //   indicator.className = 'carousel-indicator';
  //   indicator.setAttribute('data-index', index);
  //   indicatorsContainer.appendChild(indicator);
  // });

  // carousel.appendChild(slidesContainer);
  // carousel.appendChild(indicatorsContainer);

  // block.replaceChildren(carousel);

  // let currentIndex = 0;
  // const slides = slidesContainer.querySelectorAll('.carousel-slide');
  // const indicators = indicatorsContainer.querySelectorAll('.carousel-indicator');

  // function updateCarousel() {
  //   slides.forEach((slide, index) => {
  //     slide.style.display = index === currentIndex ? 'block' : 'none';
  //   });

  //   indicators.forEach((indicator, index) => {
  //     indicator.classList.toggle('active', index === currentIndex);
  //   });
  // }

  // function nextSlide() {
  //   currentIndex = (currentIndex + 1) % slides.length;
  //   updateCarousel();
  // }

  // indicators.forEach((indicator) => {
  //   indicator.addEventListener('click', () => {
  //     currentIndex = parseInt(indicator.getAttribute('data-index'));
  //     updateCarousel();
  //   });
  // });

  // updateCarousel();
  // setInterval(nextSlide, 4000);
}
    