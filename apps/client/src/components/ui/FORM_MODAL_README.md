# FormModal Components

Two powerful modal components for displaying forms with scrollable content.

## Components

### FormModal

A basic modal that wraps form content with scrollable body. You manage form submission and actions manually.

**Best for:**

- Simple forms with custom action buttons
- Forms that need custom validation handling
- When you need full control over form submission

### FormModalWithActions

A modal with built-in form handling and sticky action buttons (submit/cancel) in the footer.

**Best for:**

- Standard forms with submit/cancel actions
- Forms with loading states
- When you want consistent action button styling

## Key Features

✅ **Scrollable Content**: Long forms scroll while header and footer stay fixed  
✅ **Responsive Design**: Configurable width and height for different screen sizes  
✅ **Loading States**: Built-in loading indicators and disabled states  
✅ **Keyboard Navigation**: Full accessibility support  
✅ **Custom Icons**: Support for custom icons in the header  
✅ **Form Integration**: Works with any form library (React Hook Form, Formik, etc.)  
✅ **TypeScript Support**: Full type safety

## Quick Start

```tsx
import { FormModalWithActions } from "../ui/modals";

function MyComponent() {
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    // Process form data
    setShowForm(false);
  };

  return (
    <FormModalWithActions
      isOpen={showForm}
      onClose={() => setShowForm(false)}
      onSubmit={handleSubmit}
      title="Edit Post"
      maxWidth="2xl"
      submitText="Save Changes"
    >
      <div className="space-y-4">
        <input name="title" placeholder="Post Title" />
        <textarea name="content" rows={8} placeholder="Content" />
      </div>
    </FormModalWithActions>
  );
}
```

## Size Options

### Width Options

- `sm`: 384px (24rem)
- `md`: 448px (28rem)
- `lg`: 512px (32rem) - default
- `xl`: 576px (36rem)
- `2xl`: 672px (42rem)
- `3xl`: 768px (48rem)
- `4xl`: 896px (56rem)
- `5xl`: 1024px (64rem)
- `6xl`: 1152px (72rem)
- `7xl`: 1280px (80rem)

### Height Options

- `sm`: 384px (24rem)
- `md`: 512px (32rem)
- `lg`: 640px (40rem)
- `xl`: 768px (48rem)
- `2xl`: 896px (56rem)
- `3xl`: 1024px (64rem)
- `4xl`: 1152px (72rem)
- `5xl`: 1280px (80rem)
- `6xl`: 1408px (88rem)
- `full`: calc(100vh - 4rem) - default

## Examples

See `FormModalExamples.tsx` for comprehensive usage examples including:

- Basic form modals
- Advanced forms with actions
- Long scrollable forms
- User profile forms
- Application forms with multiple sections

## Integration with Form Libraries

Works seamlessly with popular form libraries:

### React Hook Form

```tsx
const { handleSubmit, register } = useForm();

<FormModalWithActions
  onSubmit={handleSubmit(onSubmit)}
  // ... other props
>
  <input {...register("name")} />
</FormModalWithActions>;
```

### Formik

```tsx
<Formik onSubmit={handleSubmit} initialValues={{}}>
  {({ handleSubmit }) => (
    <FormModalWithActions
      onSubmit={handleSubmit}
      // ... other props
    >
      <Field name="name" />
    </FormModalWithActions>
  )}
</Formik>
```

### TanStack Form

```tsx
<FormModalWithActions
  onSubmit={() => form.handleSubmit()}
  // ... other props
>
  <form.Field name="name">{(field) => <input {...field} />}</form.Field>
</FormModalWithActions>
```
