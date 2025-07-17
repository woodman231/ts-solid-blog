# Modal Components Documentation

This document describes the reusable modal components available in the UI library.

## Components

### AlertModal

A modal for displaying information, warnings, errors, or success messages to the user.

**Props:**

- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Callback when modal is closed
- `title: string` - Modal title
- `message: string` - Modal message content
- `buttonText?: string` - Custom button text (default: "OK")
- `icon?: React.ReactNode` - Custom icon component
- `variant?: 'info' | 'warning' | 'error' | 'success'` - Visual variant (default: 'info')

**Example:**

```tsx
<AlertModal
  isOpen={showAlert}
  onClose={() => setShowAlert(false)}
  title="Success!"
  message="Operation completed successfully!"
  variant="success"
  buttonText="Great!"
/>
```

### ConfirmModal

A modal for getting user confirmation before performing actions.

**Props:**

- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Callback when modal is closed
- `onConfirm: () => void | Promise<void>` - Callback when user confirms
- `title: string` - Modal title
- `message: string` - Modal message content
- `confirmText?: string` - Custom confirm button text (default: "Confirm")
- `cancelText?: string` - Custom cancel button text (default: "Cancel")
- `icon?: React.ReactNode` - Custom icon component
- `variant?: 'warning' | 'danger' | 'info'` - Visual variant (default: 'warning')
- `isLoading?: boolean` - Shows loading state (default: false)
- `disabled?: boolean` - Disables confirm button (default: false)

**Example:**

```tsx
<ConfirmModal
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleConfirm}
  title="Delete Item"
  message="This will permanently delete the item. This action cannot be undone."
  variant="danger"
  confirmText="Delete"
  cancelText="Keep"
/>
```

### PromptModal

A modal for getting user input with various input types.

**Props:**

- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Callback when modal is closed
- `onSubmit: (value: string) => void | Promise<void>` - Callback when user submits
- `title: string` - Modal title
- `message: string` - Modal message content
- `placeholder?: string` - Input placeholder text (default: "Enter value...")
- `defaultValue?: string` - Default input value (default: "")
- `submitText?: string` - Custom submit button text (default: "Submit")
- `cancelText?: string` - Custom cancel button text (default: "Cancel")
- `icon?: React.ReactNode` - Custom icon component
- `isLoading?: boolean` - Shows loading state (default: false)
- `disabled?: boolean` - Disables form submission (default: false)
- `inputType?: 'text' | 'password' | 'email' | 'number'` - Input type (default: 'text')
- `required?: boolean` - Makes input required (default: false)
- `maxLength?: number` - Maximum input length
- `minLength?: number` - Minimum input length

**Example:**

```tsx
<PromptModal
  isOpen={showPrompt}
  onClose={() => setShowPrompt(false)}
  onSubmit={handlePromptSubmit}
  title="Enter your name"
  message="Please provide your full name for the registration."
  placeholder="Your name..."
  required={true}
  minLength={2}
  maxLength={50}
/>
```

### DeleteDialog

A specialized confirm modal for delete operations with built-in API integration.

**Props:**

- `entityType: string` - The type of entity to delete (e.g., "posts", "users")
- `entityId: string` - The ID of the entity to delete
- `entityName?: string` - Human-readable name for the entity (default: entityType)
- `title?: string` - Custom modal title
- `message?: string` - Custom modal message
- `onClose: () => void` - Callback when modal is closed
- `onSuccess: () => void` - Callback when deletion is successful

**Example:**

```tsx
<DeleteDialog
  entityType="posts"
  entityId={postId}
  entityName="post"
  onClose={() => setShowDelete(false)}
  onSuccess={handleDeleteSuccess}
/>
```

### FormModal

A modal for displaying forms with custom content and scrollable body.

**Props:**

- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Callback when modal is closed
- `title: string` - Modal title
- `children: ReactNode` - Form content to display
- `maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'` - Modal width (default: 'lg')
- `maxHeight?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full'` - Modal height (default: 'full')
- `icon?: ReactNode` - Custom icon component
- `showCloseButton?: boolean` - Show close button in header (default: true)
- `closeOnOverlayClick?: boolean` - Allow closing by clicking overlay (default: true)
- `className?: string` - Additional CSS classes

**Example:**

```tsx
<FormModal
  isOpen={showForm}
  onClose={() => setShowForm(false)}
  title="User Registration"
  maxWidth="md"
  icon={<UserIcon className="h-6 w-6" />}
>
  <form onSubmit={handleSubmit}>
    <div className="space-y-4">
      <input name="name" placeholder="Name" />
      <input name="email" placeholder="Email" />
      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => setShowForm(false)}>
          Cancel
        </button>
        <button type="submit">Submit</button>
      </div>
    </div>
  </form>
</FormModal>
```

### FormModalWithActions

A modal with built-in form handling and action buttons (submit/cancel) in a sticky footer.

**Props:**

- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Callback when modal is closed
- `onSubmit?: (e: FormEvent) => void | Promise<void>` - Form submission handler
- `title: string` - Modal title
- `children: ReactNode` - Form content to display
- `maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'` - Modal width (default: 'lg')
- `maxHeight?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full'` - Modal height (default: 'full')
- `icon?: ReactNode` - Custom icon component
- `showCloseButton?: boolean` - Show close button in header (default: true)
- `closeOnOverlayClick?: boolean` - Allow closing by clicking overlay (default: true)
- `className?: string` - Additional CSS classes
- `submitText?: string` - Submit button text (default: 'Submit')
- `cancelText?: string` - Cancel button text (default: 'Cancel')
- `submitButtonVariant?: 'primary' | 'secondary' | 'danger' | 'success'` - Submit button style (default: 'primary')
- `isSubmitting?: boolean` - Shows loading state (default: false)
- `submitDisabled?: boolean` - Disables submit button (default: false)
- `showSubmitButton?: boolean` - Show submit button (default: true)
- `showCancelButton?: boolean` - Show cancel button (default: true)
- `customActions?: ReactNode` - Custom action buttons to replace default ones

**Example:**

```tsx
<FormModalWithActions
  isOpen={showForm}
  onClose={() => setShowForm(false)}
  onSubmit={handleSubmit}
  title="Edit Post"
  maxWidth="2xl"
  submitText="Save Changes"
  cancelText="Discard"
  submitButtonVariant="primary"
  isSubmitting={isLoading}
  icon={<PencilIcon className="h-6 w-6" />}
>
  <div className="space-y-4">
    <input name="title" placeholder="Title" />
    <textarea name="content" rows={8} placeholder="Content" />
  </div>
</FormModalWithActions>
```

## Usage Patterns

### Basic Alert

```tsx
const [showAlert, setShowAlert] = useState(false);

// Show alert
setShowAlert(true);

// Component
<AlertModal
  isOpen={showAlert}
  onClose={() => setShowAlert(false)}
  title="Information"
  message="This is an informational message."
/>;
```

### Async Confirmation

```tsx
const [showConfirm, setShowConfirm] = useState(false);
const [isLoading, setIsLoading] = useState(false);

const handleConfirm = async () => {
  setIsLoading(true);
  try {
    await performAction();
    setShowConfirm(false);
  } catch (error) {
    // Handle error
  } finally {
    setIsLoading(false);
  }
};

// Component
<ConfirmModal
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleConfirm}
  title="Confirm Action"
  message="Are you sure you want to proceed?"
  isLoading={isLoading}
  variant="warning"
/>;
```

### User Input

```tsx
const [showPrompt, setShowPrompt] = useState(false);

const handleSubmit = async (value: string) => {
  // Process the input value
  await processInput(value);
  setShowPrompt(false);
};

// Component
<PromptModal
  isOpen={showPrompt}
  onClose={() => setShowPrompt(false)}
  onSubmit={handleSubmit}
  title="Enter Value"
  message="Please enter the required information."
  inputType="email"
  required={true}
/>;
```

### Basic Form Modal

```tsx
const [showForm, setShowForm] = useState(false);

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  // Handle form submission
  const formData = new FormData(e.target as HTMLFormElement);
  // Process form data
  setShowForm(false);
};

// Component
<FormModal
  isOpen={showForm}
  onClose={() => setShowForm(false)}
  title="Create User"
  maxWidth="md"
>
  <form onSubmit={handleSubmit} className="space-y-4">
    <input name="name" placeholder="Name" required />
    <input name="email" type="email" placeholder="Email" required />
    <div className="flex justify-end gap-3 pt-4">
      <button type="button" onClick={() => setShowForm(false)}>
        Cancel
      </button>
      <button type="submit">Create</button>
    </div>
  </form>
</FormModal>;
```

### Form Modal with Actions

```tsx
const [showForm, setShowForm] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  try {
    const formData = new FormData(e.target as HTMLFormElement);
    await submitData(formData);
    setShowForm(false);
  } catch (error) {
    // Handle error
  } finally {
    setIsSubmitting(false);
  }
};

// Component
<FormModalWithActions
  isOpen={showForm}
  onClose={() => setShowForm(false)}
  onSubmit={handleSubmit}
  title="Edit Profile"
  maxWidth="lg"
  submitText="Save Changes"
  isSubmitting={isSubmitting}
  submitButtonVariant="primary"
>
  <div className="space-y-4">
    <input name="name" placeholder="Name" required />
    <textarea name="bio" rows={4} placeholder="Bio" />
  </div>
</FormModalWithActions>;
```

### Long Scrollable Form

```tsx
<FormModalWithActions
  isOpen={showLongForm}
  onClose={() => setShowLongForm(false)}
  onSubmit={handleSubmit}
  title="Application Form"
  maxWidth="2xl"
  maxHeight="2xl"
  submitText="Submit Application"
>
  <div className="space-y-8">
    <section>
      <h3 className="text-lg font-medium mb-4">Personal Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <input name="firstName" placeholder="First Name" />
        <input name="lastName" placeholder="Last Name" />
      </div>
    </section>

    <section>
      <h3 className="text-lg font-medium mb-4">Contact Information</h3>
      <div className="space-y-4">
        <input name="email" type="email" placeholder="Email" />
        <input name="phone" type="tel" placeholder="Phone" />
        <textarea name="address" rows={3} placeholder="Address" />
      </div>
    </section>

    {/* More sections... */}
  </div>
</FormModalWithActions>
```

## Features

- **Accessibility**: All modals support keyboard navigation and focus management
- **Animations**: Smooth enter/exit transitions using Headless UI
- **Loading States**: Built-in loading indicators for async operations
- **Variants**: Multiple visual styles for different use cases
- **Customization**: Custom icons, button text, and styling options
- **Type Safety**: Full TypeScript support with proper typing

## Import

```tsx
import {
  AlertModal,
  ConfirmModal,
  PromptModal,
  DeleteDialog,
  FormModal,
  FormModalWithActions,
} from "../ui/modals";
```

## Notes

- All modals use Headless UI for accessibility and behavior
- The DeleteDialog automatically handles API calls via the socket store
- Modals prevent closing during loading operations
- Error states are handled gracefully with user-friendly messages
