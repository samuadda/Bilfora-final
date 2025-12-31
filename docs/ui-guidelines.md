# UI Guidelines & Best Practices

Quick reference guide for maintaining UI consistency.

---

## 🚫 Avoid Arbitrary Values

**Never use arbitrary Tailwind values unless absolutely necessary.**

```tsx
// ❌ Bad
<div className="p-[13px] rounded-[11px] gap-[7px]">

// ✅ Good
<div className="p-4 rounded-xl gap-3">
```

**Allowed spacing values:** 2, 4, 6, 8, 12, 16, 20, 24, 32

**Allowed radius values:** xl, 2xl, 3xl, full

---

## 📏 Spacing Rules

### Use Tokens for Spacing

```tsx
// ❌ Bad
<div className="py-13 px-7 gap-5">

// ✅ Good
import { layout } from "@/lib/ui/tokens";
<div className={layout.section.responsive}>
<div className={layout.gap.standard}>
```

### Common Patterns

- **Section padding:** `py-16 md:py-24` (use `<Section>` component)
- **Container padding:** `px-4 sm:px-6 lg:px-8` (use `<Container>` component)
- **Card padding:** `p-5 sm:p-6` (use `<Card>` component)
- **Gap:** `gap-4` (standard), `gap-6` (large)

---

## ✍️ Typography Rules

### Always Use Typography Components

```tsx
// ❌ Bad
<h1 className="text-2xl font-bold text-gray-900">
<p className="text-base text-black">

// ✅ Good
import { Heading, Text } from "@/components/ui";
<Heading variant="h1">Title</Heading>
<Text>Body text</Text>
```

### Heading Hierarchy

- **H1 (page):** Dashboard/page titles
- **H1 (hero):** Landing page hero only
- **H2:** Major section titles
- **H3:** Card titles, subsections
- **H4:** Minor subsections

---

## 🎴 Card Rules

### Always Use Card Component

```tsx
// ❌ Bad
<div className="bg-white p-6 rounded-lg shadow">

// ✅ Good
import { Card } from "@/components/ui";
<Card>Content</Card>
```

### Border Radius Rules

- **`rounded-xl`:** Inputs, small cards
- **`rounded-2xl`:** Standard cards (most common)
- **`rounded-3xl`:** Feature cards, modals
- **`rounded-full`:** Buttons, badges

---

## 🔘 Button Rules

### Always Use Button Component

```tsx
// ❌ Bad
<button className="bg-[#7f2dfb] text-white px-6 py-3...">

// ✅ Good
import { Button } from "@/components/ui";
<Button variant="primary">Click</Button>
```

---

## 📝 Form Rules

### Use Form Components

```tsx
// ❌ Bad
<div>
  <label>Email</label>
  <input type="email" className="..." />
</div>

// ✅ Good
import { Field, Input } from "@/components/ui";
<Field label="Email">
  <Input type="email" />
</Field>
```

### Multi-Column Forms

```tsx
// ✅ Good
import { FormRow, Field, Input } from "@/components/ui";
<FormRow columns={2}>
  <Field label="First Name">
    <Input />
  </Field>
  <Field label="Last Name">
    <Input />
  </Field>
</FormRow>
```

---

## 🎨 Color Rules

### Use Brand Colors

```tsx
// ✅ Good
className="text-[#012d46]" // Brand dark
className="text-[#7f2dfb]" // Brand purple
className="bg-[#7f2dfb]" // Brand purple background
```

### Use Status Colors from Tokens

```tsx
// ✅ Good
import { colors } from "@/lib/ui/tokens";
className={colors.status.success.bg}
className={colors.status.warning.text}
```

---

## 📐 Layout Rules

### Use Foundation Components

```tsx
// ❌ Bad
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">

// ✅ Good
import { Section, Container } from "@/components/ui";
<Section>
  <Container>
    Content
  </Container>
</Section>
```

### Page Layout

```tsx
// ✅ Good
import { PageShell } from "@/components/ui";
<PageShell>
  <h1>Page Title</h1>
  Content
</PageShell>
```

---

## 🔍 Code Review Checklist

Before submitting code:

- [ ] No arbitrary values (`px-[...]`, `gap-[...]`, etc.)
- [ ] Using tokens from `@/lib/ui/tokens`
- [ ] Using foundation components (Container, Section, PageShell)
- [ ] Using typography components (Heading, Text, Label)
- [ ] Using form components (Field, Input, Select, FormRow)
- [ ] Using surface components (Card, Button)
- [ ] Spacing follows allowed scale
- [ ] Border radius follows rules
- [ ] Responsive patterns correct
- [ ] RTL support maintained

---

## 📚 Quick Reference

### Import All Components

```tsx
import {
  Container,
  Section,
  PageShell,
  Heading,
  Text,
  Label,
  Field,
  FormRow,
  Input,
  Select,
  Card,
  Button,
} from "@/components/ui";
```

### Import Tokens

```tsx
import { layout, surface, typography, interactive, colors } from "@/lib/ui/tokens";
```

---

## 🆘 When to Break the Rules

Only use arbitrary values or custom styles when:

1. **Design requirement:** Specific pixel-perfect requirement
2. **Third-party component:** Styling external library component
3. **Unique layout:** One-off layout that doesn't fit patterns
4. **Animation:** Specific animation requirements

**Always add a comment explaining why:**

```tsx
// Using arbitrary value for pixel-perfect alignment with design
<div className="p-[13px]">
```

---

## 📖 Documentation

- **Full UI System:** `docs/ui-system.md`
- **Baseline Report:** `docs/ui-baseline-report.md`
- **Refactor Checklist:** `docs/refactor-checklist.md`
- **Tokens:** `src/lib/ui/tokens.ts`

---

**Remember:** Consistency > Perfection. Use the system, don't fight it.

