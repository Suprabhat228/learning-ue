import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  console.log('=== HERO BANNER DEBUG ===');
  console.log('Full block HTML:', block.innerHTML);
  console.log('=========================');
}