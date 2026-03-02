import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const FIELD = {
  VARIANT: 1,
  EYEBROW: 2,
  TITLE: 3,
  DESCRIPTION: 4,
  PRIMARY_LINK: 5,
  SECONDARY_LINK: 6,
  IMAGE: 7,
  VIDEO_URL: 8,
  SLIDES: 9,
};

export default function decorate(block) {
  console.log('=== FIELD VALUES ===');
  Object.entries(FIELD).forEach(([name, index]) => {
    const cell = block.querySelector(`:scope > div:nth-child(${index}) > div`);
    console.log(`${name} (row ${index}):`, cell?.innerHTML);
  });
  console.log('===================');
}