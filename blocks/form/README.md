
# Form Block

A flexible form block with various field types and styling options, including a Pinterest-style variant.

## Block Type
Form

## Authoring (Universal Editor)
1. Add the "Form" block to your page.
2. Configure the form title, description, and submit button text in the block properties.
3. Add "Form Field" items to create form fields.
4. For each field, select the field type and configure its properties (label, placeholder, validation, etc.).
5. Choose a variant style (Standard, Pinterest, Minimal, or Floating Labels).

## Fields

### Form Block Fields
| Field            | Type       | Description                                      |
|------------------|------------|--------------------------------------------------|
| style            | multiselect| Form layout style (Standard, Pinterest, etc.)    |
| formTitle        | text       | Main heading for the form                        |
| formDescription  | richtext   | Introductory text for the form                   |
| submitText       | text       | Text displayed on the submit button              |
| successMessage   | text       | Message shown after successful submission        |
| errorMessage     | text       | Message shown when submission fails              |

### Form Field Item Fields
| Field            | Type       | Description                                      |
|------------------|------------|--------------------------------------------------|
| fieldType        | select     | Type of form field (text, email, select, etc.)   |
| fieldName        | text       | Internal name for the field                      |
| fieldLabel       | text       | Label displayed to users                         |
| fieldPlaceholder | text       | Placeholder text for input fields                |
| required         | boolean    | Whether this field is required                   |
| fieldOptions     | richtext   | Options for select, radio, or checkbox fields    |
| fieldPattern     | text       | Regex pattern for field validation               |
| fieldErrorMessage| text       | Custom error message for validation failures     |

## Block Items
This block contains repeating "Form Field" items. Each item represents one form field (input, select, checkbox, etc.).

## Variants
- **Standard**: Default form layout with clear labels and inputs
- **Pinterest**: Pinterest-inspired design with rounded corners and bold accent colors
- **Minimal**: Clean, borderless design with subtle interactions
- **Floating Labels**: Labels that animate into placeholders when focused

## Dependencies
- `moveInstrumentation` from '../../scripts/scripts.js'
- Form submission handling (simulated in this implementation)
