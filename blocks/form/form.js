
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Field row order (matches models[].fields in _form.json).
 * Block-level fields (form model):
 *   Row 0 — style (multiselect)
 *   Row 1 — formTitle (text)
 *   Row 2 — formDescription (richtext)
 *   Row 3 — submitText (text)
 *   Row 4 — successMessage (text)
 *   Row 5 — errorMessage (text)
 *
 * Form-field items (form-field model):
 *   Row 0 — fieldType (select)
 *   Row 1 — fieldName (text)
 *   Row 2 — fieldLabel (text)
 *   Row 3 — fieldPlaceholder (text)
 *   Row 4 — required (boolean)
 *   Row 5 — fieldOptions (richtext)
 *   Row 6 — fieldPattern (text)
 *   Row 7 — fieldErrorMessage (text)
 */

/** Variant class names allowed from the style field */
const VARIANT_CLASSES = new Set([
  'standard', 'pinterest', 'minimal', 'floating-labels'
]);

/**
 * Gets the content from a field row
 */
function getFieldContent(row) {
  if (!row) return '';
  const cell = row.querySelector('div:last-child');
  return cell ? cell.textContent.trim() : '';
}

/**
 * Applies variant classes from the style row to the block.
 */
function applyStyleRow(block, styleRow) {
  if (!styleRow) return;
  const raw = getFieldContent(styleRow);
  raw.split(/[\s,]+/).forEach((token) => {
    const cls = token.toLowerCase();
    if (VARIANT_CLASSES.has(cls)) block.classList.add(cls);
  });
}

/**
 * Builds a form field based on the field type and configuration.
 */
function buildField(fieldRow) {
  if (!fieldRow) return null;

  const [typeRow, nameRow, labelRow, placeholderRow, requiredRow, optionsRow, patternRow, errorRow] =
    [...fieldRow.children].map(row => row.querySelector('div:last-child'));

  const fieldType = typeRow?.textContent?.trim() || 'text';
  const fieldName = nameRow?.textContent?.trim() || '';
  const fieldLabel = labelRow?.textContent?.trim() || '';
  const fieldPlaceholder = placeholderRow?.textContent?.trim() || '';
  const isRequired = requiredRow?.textContent?.trim() === 'true';
  const fieldOptions = optionsRow?.textContent?.trim() || '';
  const fieldPattern = patternRow?.textContent?.trim() || '';
  const fieldErrorMessage = errorRow?.textContent?.trim() || '';

  const fieldWrapper = document.createElement('div');
  fieldWrapper.className = `form-field form-field--${fieldType}`;

  // Label
  if (fieldLabel) {
    const label = document.createElement('label');
    label.className = 'form-field-label';
    label.textContent = fieldLabel;

    if (isRequired) {
      const requiredMarker = document.createElement('span');
      requiredMarker.className = 'form-field-required';
      requiredMarker.textContent = '*';
      label.append(' ', requiredMarker);
    }

    if (fieldType !== 'checkbox' && fieldType !== 'radio') {
      label.htmlFor = fieldName;
    }

    fieldWrapper.append(label);
  }

  // Input/Field based on type
  let input;
  switch (fieldType) {
    case 'textarea':
      input = document.createElement('textarea');
      input.className = 'form-field-input form-field-textarea';
      input.rows = 4;
      if (fieldPlaceholder) input.placeholder = fieldPlaceholder;
      break;

    case 'select':
      input = document.createElement('select');
      input.className = 'form-field-input form-field-select';
      if (fieldOptions) {
        fieldOptions.split('
').forEach(option => {
          const opt = document.createElement('option');
          const trimmedOption = option.trim();
          opt.value = trimmedOption;
          opt.textContent = trimmedOption;
          input.append(opt);
        });
      }
      break;

    case 'checkbox':
    case 'radio':
      if (fieldOptions) {
        fieldOptions.split('
').forEach((option, index) => {
          const optionWrapper = document.createElement('div');
          optionWrapper.className = `form-field-option form-field-option--${fieldType}`;

          const optionInput = document.createElement('input');
          optionInput.type = fieldType;
          optionInput.id = `${fieldName}-${index}`;
          optionInput.name = fieldName;
          optionInput.value = option.trim();
          optionInput.className = `form-field-input form-field-${fieldType}`;

          if (isRequired) optionInput.required = true;

          const optionLabel = document.createElement('label');
          optionLabel.htmlFor = `${fieldName}-${index}`;
          optionLabel.textContent = option.trim();

          optionWrapper.append(optionInput, optionLabel);
          fieldWrapper.append(optionWrapper);
        });
      }
      break;

    case 'file':
      input = document.createElement('input');
      input.type = 'file';
      input.className = 'form-field-input form-field-file';
      break;

    default:
      input = document.createElement('input');
      input.type = fieldType;
      input.className = 'form-field-input';
      if (fieldPlaceholder) input.placeholder = fieldPlaceholder;
  }

  if (input && fieldType !== 'checkbox' && fieldType !== 'radio') {
    input.name = fieldName;
    input.id = fieldName;
    if (isRequired) input.required = true;
    if (fieldPattern) input.pattern = fieldPattern;
    if (fieldErrorMessage) input.dataset.error = fieldErrorMessage;

    // For floating labels variant
    if (fieldPlaceholder && fieldWrapper.closest('.floating-labels')) {
      input.dataset.placeholder = fieldPlaceholder;
    }

    fieldWrapper.append(input);

    // Add floating label for floating-labels variant
    if (fieldWrapper.closest('.floating-labels') && fieldLabel) {
      const floatingLabel = document.createElement('label');
      floatingLabel.className = 'form-field-label';
      floatingLabel.htmlFor = fieldName;
      floatingLabel.textContent = fieldLabel;
      if (isRequired) {
        const requiredMarker = document.createElement('span');
        requiredMarker.className = 'form-field-required';
        requiredMarker.textContent = '*';
        floatingLabel.append(' ', requiredMarker);
      }
      fieldWrapper.append(floatingLabel);
    }
  }

  return fieldWrapper;
}

/**
 * Validates a form field
 */
function validateField(field) {
  const input = field.querySelector('.form-field-input');
  if (!input) return true;

  // Check required
  if (input.required && !input.value.trim()) {
    field.classList.add('form-field--error');
    return false;
  }

  // Check pattern
  if (input.pattern && !new RegExp(input.pattern).test(input.value)) {
    field.classList.add('form-field--error');
    return false;
  }

  field.classList.remove('form-field--error');
  return true;
}

/**
 * Handles form submission.
 */
async function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formBlock = form.closest('.form');
  const submitButton = form.querySelector('.form-submit');
  const successMessage = formBlock.dataset.successMessage || 'Form submitted successfully!';
  const errorMessage = formBlock.dataset.errorMessage || 'Submission failed. Please try again.';

  // Validate all fields
  const fields = form.querySelectorAll('.form-field');
  let isValid = true;

  fields.forEach(field => {
    if (!validateField(field)) {
      isValid = false;
    }
  });

  if (!isValid) {
    // Scroll to first error
    const firstError = form.querySelector('.form-field--error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Submitting...';

  try {
    // In a real implementation, this would be an actual form submission
    // For demo purposes, we'll simulate a successful submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Show success message
    const successEl = document.createElement('div');
    successEl.className = 'form-success';
    successEl.textContent = successMessage;

    // Create a container for the success message
    const messageContainer = document.createElement('div');
    messageContainer.className = 'form-message-container';
    messageContainer.append(successEl);

    form.replaceWith(messageContainer);
  } catch (error) {
    const errorEl = document.createElement('div');
    errorEl.className = 'form-error';
    errorEl.textContent = errorMessage;
    form.prepend(errorEl);

    submitButton.disabled = false;
    submitButton.textContent = formBlock.dataset.submitText || 'Submit';
  }
}

/**
 * Handles input events for validation
 */
function handleInput(event) {
  const field = event.target.closest('.form-field');
  if (field) {
    validateField(field);
  }
}

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  // Block-level fields: style, formTitle, formDescription, submitText, successMessage, errorMessage
  const styleRow = rows[0];
  const titleRow = rows[1];
  const descriptionRow = rows[2];
  const submitTextRow = rows[3];
  const successMessageRow = rows[4];
  const errorMessageRow = rows[5];
  const fieldRows = rows.slice(6);

  // Apply variant classes
  if (styleRow) {
    applyStyleRow(block, styleRow);
    styleRow.remove();
  }

  // Build form structure
  const form = document.createElement('form');
  form.className = 'form-form';
  form.noValidate = true;
  moveInstrumentation(block, form);

  // Form title
  const title = getFieldContent(titleRow);
  if (title) {
    const h2 = document.createElement('h2');
    h2.className = 'form-title';
    h2.textContent = title;
    form.append(h2);
  }

  // Form description
  const description = descriptionRow?.querySelector('div:last-child');
  if (description) {
    const descEl = document.createElement('div');
    descEl.className = 'form-description';
    // Move all child nodes (richtext may contain inline elements)
    while (description.firstChild) {
      descEl.append(description.firstChild);
    }
    form.append(descEl);
  }

  // Form fields container
  const fieldsContainer = document.createElement('div');
  fieldsContainer.className = 'form-fields';

  // Build each field
  fieldRows.forEach(fieldRow => {
    const field = buildField(fieldRow);
    if (field) fieldsContainer.append(field);
  });

  form.append(fieldsContainer);

  // Submit button
  const submitText = getFieldContent(submitTextRow) || 'Submit';
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = 'form-submit';
  submitButton.textContent = submitText;
  form.append(submitButton);

  // Store messages in dataset for use in handleSubmit
  form.dataset.successMessage = getFieldContent(successMessageRow) || '';
  form.dataset.errorMessage = getFieldContent(errorMessageRow) || '';

  // Add event listeners
  form.addEventListener('submit', handleSubmit);
  form.addEventListener('input', handleInput);

  // Replace block content with form
  block.replaceChildren(form);
}
