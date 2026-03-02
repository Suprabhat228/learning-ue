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

function getCellText(block, index) {
  const cell = block.querySelector(`:scope > div:nth-child(${index}) > div`);
  return cell ? cell.textContent.trim() : '';
}

function getCellHtml(block, index) {
  const cell = block.querySelector(`:scope > div:nth-child(${index}) > div`);
  return cell ? cell.innerHTML.trim() : '';
}

function getCellAnchor(block, index) {
  return block.querySelector(`:scope > div:nth-child(${index}) > div a`) || null;
}

function getCellPicture(block, index) {
  return block.querySelector(`:scope > div:nth-child(${index}) > div picture`) || null;
}

export default function decorate(block) {
  const variant = getCellText(block, FIELD.VARIANT);
  const eyebrow = getCellText(block, FIELD.EYEBROW);
  const title = getCellText(block, FIELD.TITLE);
  const descHtml = getCellHtml(block, FIELD.DESCRIPTION);
  const primaryAnchor = getCellAnchor(block, FIELD.PRIMARY_LINK);
  const secondaryAnchor = getCellAnchor(block, FIELD.SECONDARY_LINK);
  const picture = getCellPicture(block, FIELD.IMAGE);

  console.log('=== PARSED VALUES ===');
  console.log('variant:', variant);
  console.log('eyebrow:', eyebrow);
  console.log('title:', title);
  console.log('descHtml:', descHtml);
  console.log('primaryAnchor href:', primaryAnchor?.href);
  console.log('primaryAnchor text:', primaryAnchor?.textContent);
  console.log('secondaryAnchor href:', secondaryAnchor?.href);
  console.log('picture found:', picture);
  console.log('=====================');
}