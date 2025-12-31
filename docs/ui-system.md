# UI System Documentation - Bilfora Invoicing SaaS

This document defines the unified UI system based on the best existing patterns in the codebase.

---

## 📚 Table of Contents

1. [Design Tokens](#design-tokens)
2. [Spacing Scale](#spacing-scale)
3. [Typography System](#typography-system)
4. [Component Patterns](#component-patterns)
5. [Usage Guidelines](#usage-guidelines)
6. [Migration Guide](#migration-guide)

---

## 🎨 Design Tokens

All design tokens are centralized in `src/lib/ui/tokens.ts`. Import and use them consistently:

```tsx
import { layout, surface, typography, interactive, colors } from "@/lib/ui/tokens";
```

---

## 📏 Spacing Scale

### Allowed Spacing Values

**Vertical Spacing (py, my, space-y):**
- `2` - Very tight (between related elements)
- `4` - Tight (between form fields)
- `6` - Standard (between sections)
- `8` - Medium (between major sections)
- `12` - Large (small sections)
- `16` - Extra large (standard sections)
- `20` - Standard sections
- `24` - Large sections (most common)
- `32` - Extra large sections (hero, pricing)

**Horizontal Spacing (px, mx, gap-x):**
- `3` - Tight
- `4` - Standard (mobile default)
- `6` - Medium (tablet)
- `8` - Large (desktop)

**Gap Spacing (gap):**
- `3` - Tight spacing
- `4` - Standard spacing (most common)
- `5` - Medium spacing
- `6` - Large spacing (common in dashboards)
- `8` - Extra large spacing

### Usage Rules

1. **Section Padding:** Use `py-16 md:py-24` for standard sections
2. **Container Padding:** Use `px-4 sm:px-6 lg:px-8` for containers
3. **Card Padding:** Use `p-5 sm:p-6` for standard cards
4. **Gap:** Use `gap-4` for standard, `gap-6` for large layouts

---

## ✍️ Typography System

### Heading Variants

```tsx
// H1 - Page titles (dashboard)
<h1 className="text-3xl font-bold text-[#012d46]">Page Title</h1>

// H1 - Hero (landing)
<h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold">Hero Title</h1>

// H2 - Section titles
<h2 className="text-4xl md:text-5xl font-bold text-[#012d46]">Section Title</h2>

// H3 - Card titles
<h3 className="text-2xl font-bold">Card Title</h3>

// H3 - Subsections
<h3 className="text-lg font-bold">Subsection</h3>
```

### Body Text Variants

```tsx
// Large body
<p className="text-lg text-gray-600">Description text</p>

// Standard body
<p className="text-base text-gray-700">Body text</p>

// Small body
<p className="text-sm text-gray-500">Metadata, labels</p>

// Extra small
<span className="text-xs text-gray-400">Timestamps, badges</span>
```

### When to Use Each

- **H1 (page):** Main page title in dashboard/content pages
- **H1 (hero):** Landing page hero titles only
- **H2:** Major section titles
- **H3:** Card titles, subsections
- **Body large:** Hero descriptions, important descriptions
- **Body standard:** Default body text
- **Body small:** Labels, metadata, secondary text
- **Body xs:** Badges, timestamps, fine print

---

## 🧩 Component Patterns

### Section/Container vs Custom Wrappers

**Use `Section` component for:**
- Major content sections
- Landing page sections
- Dashboard page sections

**Use `Container` component for:**
- Wrapping page content
- Limiting max width
- Applying responsive padding

**Use custom wrappers only when:**
- You need specific layout that doesn't fit Section/Container
- You're building a unique layout pattern

### Typography Variants

Always use the typography system components or tokens:

```tsx
// ✅ Good
<h1 className={typography.heading.h1.page}>Title</h1>
<p className={typography.body.standard}>Text</p>

// ❌ Bad
<h1 className="text-2xl">Title</h1> // Wrong size
<p className="text-base text-black">Text</p> // Wrong color
```

### Component Conventions

1. **Use shadcn/ui components only** - No raw HTML buttons/inputs in pages
2. **Use tokens** - Import from `@/lib/ui/tokens` for consistency
3. **Use foundation components** - `Container`, `Section`, `PageShell` when applicable
4. **Follow spacing scale** - Use allowed values only

---

## 🎴 Card Styles

### Standard Card

```tsx
<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
  {/* content */}
</div>
```

### Elevated Card

```tsx
<div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5 sm:p-6">
  {/* content */}
</div>
```

### Card with Hover

```tsx
<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 hover:shadow-md hover:border-gray-200 transition-all duration-300">
  {/* content */}
</div>
```

### Border Radius Rules

- **`rounded-xl`:** Inputs, small cards
- **`rounded-2xl`:** Standard cards (most common)
- **`rounded-3xl`:** Feature cards, modals, large cards
- **`rounded-full`:** Buttons, badges

---

## 🔘 Button Styles

### Primary Button

```tsx
<button className="bg-[#7f2dfb] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-200 hover:bg-[#6a1fd8] hover:shadow-xl transition-all">
  Button Text
</button>
```

### Secondary Button

```tsx
<button className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium">
  Button Text
</button>
```

### Button Sizes

- **Small:** `px-3 py-1.5 text-sm`
- **Medium:** `px-6 py-3 text-base` (standard)
- **Large:** `px-8 py-4 text-lg`

---

## 📝 Form Styles

### Input Field

```tsx
<input
  type="text"
  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-[#7f2dfb] focus:ring-2 focus:ring-[#7f2dfb]/20"
/>
```

### Select/Dropdown

```tsx
<div className="relative">
  <select className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-2 text-sm bg-white focus:outline-none focus:border-[#7f2dfb] focus:ring-2 focus:ring-[#7f2dfb]/20">
    {/* options */}
  </select>
  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
</div>
```

### Label

```tsx
<label className="text-sm font-medium text-gray-700 mb-2 block">
  Label Text
</label>
```

---

## 🚫 What NOT to Do

### ❌ Avoid Arbitrary Values

```tsx
// ❌ Bad
<div className="p-[13px]"> // Use p-3 or p-4
<div className="gap-[7px]"> // Use gap-2 or gap-3
<div className="rounded-[11px]"> // Use rounded-xl or rounded-2xl
```

### ❌ Avoid Inconsistent Patterns

```tsx
// ❌ Bad - mixing patterns
<div className="p-4 rounded-lg"> // Should be rounded-xl or rounded-2xl
<div className="p-6 rounded-3xl"> // Should be p-5 sm:p-6 for cards
```

### ❌ Avoid Raw HTML Elements

```tsx
// ❌ Bad
<button>Click</button> // Use shadcn Button or styled button

// ✅ Good
<Button variant="primary">Click</Button>
```

---

## 📋 UI Checklist

Before submitting code, ensure:

- [ ] Using tokens from `@/lib/ui/tokens` where applicable
- [ ] Spacing values are from allowed scale (2, 4, 6, 8, 12, 16, 20, 24, 32)
- [ ] Border radius follows rules (xl/2xl/3xl/full)
- [ ] Typography uses defined heading/body variants
- [ ] Buttons use standard button styles
- [ ] Inputs use standard input styles
- [ ] Cards use standard card patterns
- [ ] No arbitrary values (px-[...], gap-[...], etc.)
- [ ] Responsive patterns used correctly
- [ ] RTL support maintained

---

## 🔄 Migration Guide

### Step 1: Replace Arbitrary Values

```tsx
// Before
<div className="p-[13px] rounded-[11px]">

// After
<div className="p-4 rounded-xl">
```

### Step 2: Standardize Card Patterns

```tsx
// Before
<div className="bg-white p-6 rounded-lg shadow">

// After
<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
```

### Step 3: Use Typography Tokens

```tsx
// Before
<h1 className="text-2xl font-bold text-gray-900">

// After
<h1 className={typography.heading.h1.page}>
```

### Step 4: Use Foundation Components

```tsx
// Before
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">

// After
<Section>
  <Container>
    {/* content */}
  </Container>
</Section>
```

---

## 📖 Code Examples

### Complete Page Example

```tsx
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { typography, surface } from "@/lib/ui/tokens";

export default function ExamplePage() {
  return (
    <Section>
      <Container>
        <h1 className={typography.heading.h1.page}>Page Title</h1>
        <p className={typography.body.standard}>Description</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className={surface.card.default}>
            <h3 className={typography.heading.h3.card}>Card Title</h3>
            <p className={typography.body.small}>Card content</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
```

---

## 🎯 Summary

- **Spacing:** Use allowed scale values only (2, 4, 6, 8, 12, 16, 20, 24, 32)
- **Typography:** Use defined heading/body variants
- **Components:** Use foundation components (Container, Section, PageShell) when applicable
- **Tokens:** Import from `@/lib/ui/tokens` for consistency
- **No Arbitrary Values:** Avoid px-[...], gap-[...], etc.
- **shadcn/ui Only:** Use shadcn components, no raw HTML buttons/inputs

For questions or clarifications, refer to the baseline report (`docs/ui-baseline-report.md`) or the token definitions (`src/lib/ui/tokens.ts`).

