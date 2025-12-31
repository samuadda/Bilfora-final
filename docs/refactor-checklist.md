# UI System Refactor Checklist

This checklist tracks the migration of pages and components to use the unified UI system.

---

## ✅ Completed Foundation

- [x] Phase 0: UI Baseline Report created
- [x] Phase 1: Token system created (`src/lib/ui/tokens.ts`)
- [x] Phase 2: Foundation components created (Container, Section, PageShell)
- [x] Phase 3: Typography system created
- [x] Phase 4: Form and surface components created

---

## 📋 Migration Priority Order

### Priority 1: Landing Page (Lowest Risk)
**File:** `src/app/page.tsx`

- [ ] Replace section wrappers with `<Section>` component
- [ ] Replace container divs with `<Container>` component
- [ ] Replace heading elements with `<Heading>` component
- [ ] Replace text elements with `<Text>` component
- [ ] Standardize card components to use `<Card>` component
- [ ] Replace buttons with `<Button>` component
- [ ] Verify spacing uses tokens (py-16 md:py-24, gap-4, etc.)
- [ ] Remove arbitrary values (px-[...], gap-[...], etc.)

**Estimated Impact:** Low risk, high visibility

---

### Priority 2: Dashboard Main Page
**File:** `src/app/dashboard/page.tsx`

- [ ] Wrap page content with `<PageShell>` or ensure consistent layout
- [ ] Replace card divs with `<Card>` component
- [ ] Replace headings with `<Heading>` component
- [ ] Standardize spacing using tokens
- [ ] Replace buttons with `<Button>` component
- [ ] Verify stats cards use consistent styling

**Estimated Impact:** Medium risk, high usage

---

### Priority 3: Dashboard Components
**Files:**
- `src/components/dashboard/DashboardKpiCard.tsx`
- `src/components/dashboard/MonthlyStatsCards.tsx`
- `src/components/dashboard/StatsCard.tsx`

- [ ] Standardize card styling to use `<Card>` component
- [ ] Use typography tokens for text
- [ ] Standardize spacing and padding
- [ ] Ensure consistent border radius (rounded-2xl for cards)

**Estimated Impact:** Medium risk, affects multiple pages

---

### Priority 4: Invoices Page
**File:** `src/app/dashboard/invoices/page.tsx`

- [ ] Replace filter bar with standardized form components
- [ ] Replace stats cards with `<Card>` component
- [ ] Standardize table styling
- [ ] Replace buttons with `<Button>` component
- [ ] Use `<Input>` and `<Select>` for filters
- [ ] Standardize spacing

**Estimated Impact:** Medium risk, complex page

---

### Priority 5: Invoice Creation Modal
**File:** `src/components/InvoiceCreationModal.tsx`

- [ ] Replace form inputs with `<Input>` component
- [ ] Replace selects with `<Select>` component
- [ ] Use `<Field>` wrapper for form fields
- [ ] Use `<FormRow>` for multi-column layouts
- [ ] Replace buttons with `<Button>` component
- [ ] Standardize modal card styling

**Estimated Impact:** Medium risk, important feature

---

### Priority 6: Other Dashboard Pages
**Files:**
- `src/app/dashboard/clients/page.tsx`
- `src/app/dashboard/products/page.tsx`
- `src/app/dashboard/analytics/page.tsx`
- `src/app/dashboard/settings/page.tsx`

- [ ] Apply same patterns as Priority 2-5
- [ ] Use foundation components
- [ ] Standardize spacing and typography
- [ ] Replace buttons and inputs

**Estimated Impact:** Low-Medium risk, lower priority

---

### Priority 7: Landing Page Components
**Files:**
- `src/components/landing-page/Features.tsx`
- `src/components/landing-page/Pricing.tsx`
- `src/components/landing-page/FAQ.tsx`

- [ ] Use `<Card>` component for feature cards
- [ ] Use typography components
- [ ] Standardize spacing
- [ ] Replace buttons

**Estimated Impact:** Low risk, already polished

---

### Priority 8: Other Pages
**Files:**
- `src/app/login/page.tsx`
- `src/app/register/page.tsx`
- `src/app/contact/page.tsx`
- Other static pages

- [ ] Apply foundation components
- [ ] Standardize forms
- [ ] Use typography system
- [ ] Standardize spacing

**Estimated Impact:** Low risk, lower visibility

---

## 🔍 Code Review Checklist

For each file being refactored, verify:

- [ ] No arbitrary values (px-[...], gap-[...], rounded-[...])
- [ ] Spacing uses allowed scale (2, 4, 6, 8, 12, 16, 20, 24, 32)
- [ ] Typography uses `<Heading>`, `<Text>`, or tokens
- [ ] Cards use `<Card>` component or tokens
- [ ] Buttons use `<Button>` component
- [ ] Inputs use `<Input>` or `<Select>` components
- [ ] Forms use `<Field>` and `<FormRow>` where applicable
- [ ] Responsive patterns are correct
- [ ] RTL support maintained
- [ ] Visual appearance matches original (no regressions)

---

## 📝 Migration Steps (Per File)

1. **Import components:**
   ```tsx
   import { Container, Section, Heading, Text, Card, Button } from "@/components/ui";
   import { layout, surface, typography } from "@/lib/ui/tokens";
   ```

2. **Replace section wrappers:**
   ```tsx
   // Before
   <section className="py-24 px-4 sm:px-6 lg:px-8">
   
   // After
   <Section>
     <Container>
   ```

3. **Replace headings:**
   ```tsx
   // Before
   <h1 className="text-3xl font-bold text-[#012d46]">
   
   // After
   <Heading variant="h1">
   ```

4. **Replace cards:**
   ```tsx
   // Before
   <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
   
   // After
   <Card>
   ```

5. **Replace buttons:**
   ```tsx
   // Before
   <button className="bg-[#7f2dfb] text-white px-6 py-3 rounded-xl...">
   
   // After
   <Button variant="primary">
   ```

6. **Replace inputs:**
   ```tsx
   // Before
   <input className="w-full rounded-xl border border-gray-200...">
   
   // After
   <Input type="text" />
   ```

7. **Test visually** - Ensure no regressions
8. **Test responsive** - Check mobile, tablet, desktop
9. **Test RTL** - Verify RTL layout still works

---

## 🚨 Common Issues to Watch For

1. **Arbitrary values:** Search for `px-[`, `gap-[`, `rounded-[` and replace
2. **Inconsistent spacing:** Use tokens instead of hardcoded values
3. **Mixed patterns:** Ensure all cards use same radius/padding pattern
4. **Typography:** Replace all heading/text with typography components
5. **Button styles:** Ensure all buttons use `<Button>` component
6. **Form fields:** Use `<Field>` wrapper for consistency

---

## 📊 Progress Tracking

**Total Files to Refactor:** ~20-25 files

**Completed:** 0/25 (0%)

**In Progress:** 0/25 (0%)

**Blocked:** 0/25 (0%)

---

## 🎯 Success Criteria

- [ ] All pages use foundation components (Container, Section, PageShell)
- [ ] All typography uses typography system
- [ ] All cards use Card component or tokens
- [ ] All buttons use Button component
- [ ] All inputs use Input/Select components
- [ ] No arbitrary values in className
- [ ] Consistent spacing throughout
- [ ] No visual regressions
- [ ] RTL support maintained
- [ ] Responsive design works correctly

---

## 📚 Reference

- **Tokens:** `src/lib/ui/tokens.ts`
- **UI System Docs:** `docs/ui-system.md`
- **Baseline Report:** `docs/ui-baseline-report.md`
- **Components:** `src/components/ui/`

---

**Last Updated:** Phase 5 - Migration Plan Created

