# Quick Start Guide for UI System

This is a quick reference guide for using the unified UI system in Bilfora.

## 🚀 Getting Started

### 1. Import Components
```typescript
import { Heading, Text, Card, Button, Input, Select, Field, FormRow, Section, Container } from "@/components/ui";
import { layout } from "@/lib/ui/tokens";
import { cn } from "@/lib/utils";
```

### 2. Basic Usage

#### Typography
```tsx
<Heading variant="h1">Page Title</Heading>
<Heading variant="h2">Section Title</Heading>
<Heading variant="h3-subsection">Subsection</Heading>

<Text variant="body">Body text</Text>
<Text variant="body-large" color="muted">Large muted text</Text>
<Text variant="body-small">Small text</Text>
```

#### Buttons
```tsx
<Button variant="primary">Primary Button</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

#### Cards
```tsx
<Card padding="standard">Standard card</Card>
<Card padding="large">Large padding</Card>
<Card hover>With hover effect</Card>
<Card background="subtle">Subtle background</Card>
```

#### Forms
```tsx
<Field label="Name" required>
  <Input placeholder="Enter name" />
</Field>

<FormRow columns={2}>
  <Field label="First Name">
    <Input />
  </Field>
  <Field label="Last Name">
    <Input />
  </Field>
</FormRow>

<Field label="Status">
  <Select>
    <option>Active</option>
    <option>Inactive</option>
  </Select>
</Field>
```

#### Layout
```tsx
<Section padding="large" background="muted">
  <Container>
    <Heading variant="h2">Section Title</Heading>
    <Text>Content here</Text>
  </Container>
</Section>
```

### 3. Spacing with Tokens
```tsx
// Grid gaps
<div className={cn("grid grid-cols-2", layout.gap.standard)}>

// Stack spacing
<div className={layout.stack.medium}>

// Section padding
<Section padding="large">
```

## 📚 Common Patterns

### Page Header
```tsx
<div>
  <Heading variant="h1">Page Title</Heading>
  <Text variant="body-large" color="muted" className="mt-2">
    Page description
  </Text>
</div>
```

### Action Button
```tsx
<Button variant="primary" onClick={handleAction}>
  <Plus size={20} />
  Add New
</Button>
```

### Stats Card
```tsx
<Card hover>
  <Text variant="body-small" color="muted">Label</Text>
  <Heading variant="h3">Value</Heading>
</Card>
```

### Filter Section
```tsx
<Card padding="standard">
  <div className={cn("flex gap-4", layout.gap.standard)}>
    <Input placeholder="Search..." />
    <Select>
      <option>All</option>
    </Select>
    <Button variant="secondary">Filter</Button>
  </div>
</Card>
```

### Bulk Actions Bar
```tsx
<Card padding="standard" className="flex items-center justify-between">
  <div className={cn("flex items-center", layout.gap.standard)}>
    <div className="w-10 h-10 rounded-xl bg-purple-50">...</div>
    <div>
      <Text variant="body-small" className="font-bold">Selected: 5</Text>
      <Text variant="body-xs" color="muted">Choose an action</Text>
    </div>
  </div>
  <div className={cn("flex gap-2", layout.gap.tight)}>
    <Button variant="ghost" size="sm">Action 1</Button>
    <Button variant="ghost" size="sm">Action 2</Button>
  </div>
</Card>
```

## ⚠️ Common Mistakes to Avoid

### ❌ Don't use raw HTML elements
```tsx
// ❌ Bad
<h1 className="text-3xl font-bold">Title</h1>
<button className="px-6 py-3 bg-blue-500">Click</button>
<div className="bg-white p-6 rounded-2xl">Card</div>

// ✅ Good
<Heading variant="h1">Title</Heading>
<Button variant="primary">Click</Button>
<Card padding="standard">Card</Card>
```

### ❌ Don't use arbitrary spacing
```tsx
// ❌ Bad
<div className="gap-4">
<div className="space-y-6">

// ✅ Good
<div className={layout.gap.standard}>
<div className={layout.stack.medium}>
```

### ❌ Don't forget to use `cn()` for conditional classes
```tsx
// ❌ Bad
<div className={`base ${condition ? "extra" : ""}`}>

// ✅ Good
<div className={cn("base", condition && "extra")}>
```

## 📖 Full Documentation

- **Complete Guide:** `docs/ui-system.md`
- **Refactoring Status:** `docs/REFACTORING_COMPLETE.md`
- **Detailed Changes:** `docs/REFACTORING_CHANGES.md`
- **Migration Checklist:** `docs/refactor-checklist.md`
- **Guidelines:** `docs/ui-guidelines.md`

## 🔍 Examples

See these refactored files for real examples:
- `src/app/page.tsx` - Landing page
- `src/app/dashboard/page.tsx` - Dashboard
- `src/app/dashboard/invoices/page.tsx` - Invoices list
- `src/components/InvoiceCreationModal.tsx` - Complex form

---

**Need Help?** Check the full documentation or review the refactored files for examples.

