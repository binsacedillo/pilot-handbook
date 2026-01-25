# Responsive Design Standards

## Overview
This document defines the responsive design patterns and mobile-first approach used in Pilot Handbook. All UI components should follow these standards to ensure consistent experience across devices.

---

## Breakpoint Strategy

### Tailwind Default Breakpoints
We use Tailwind's standard breakpoints with mobile-first approach:

```css
/* Mobile first - no prefix needed */
Default:  0px - 639px   (phones)

/* Apply styles from these widths and up */
sm:       640px+        (large phones, small tablets)
md:       768px+        (tablets, landscape phones)
lg:       1024px+       (desktop, laptops)
xl:       1280px+       (large desktops)
2xl:      1536px+       (extra large screens)
```

### Mobile-First Principle
**Always style for mobile first, then layer responsive breakpoints:**

✅ **Correct:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Stacks on mobile, 2 cols on tablet, 3 cols on desktop */}
</div>
```

❌ **Incorrect:**
```tsx
<div className="grid grid-cols-3 md:grid-cols-1">
  {/* Desktop-first approach - harder to maintain */}
</div>
```

---

## Touch Target Sizing

### Minimum Sizes (WCAG 2.1 Level AAA)
- **Buttons/Links:** Minimum `h-10` (40px) for mobile touch targets
- **Icons/Icon Buttons:** Minimum `h-10 w-10` (40x40px)
- **Input Fields:** Minimum `h-10` (40px) for comfortable mobile typing

### Responsive Touch Targets
For space-constrained layouts, use responsive sizing:

```tsx
<Button className="h-8 sm:h-10">
  {/* 32px mobile (acceptable), 40px desktop (comfortable) */}
</Button>
```

---

## Common Patterns

### Navigation
**Desktop:** Horizontal nav with full labels
**Mobile:** Hamburger menu with dropdown

```tsx
// Desktop nav
<nav className="hidden md:flex gap-6">
  <Link href="/">Dashboard</Link>
</nav>

// Mobile menu
<nav className="md:hidden">
  <Button onClick={toggleMenu}>
    <Menu className="h-6 w-6" />
  </Button>
</nav>
```

### Grid Layouts
**Pattern:** Single column → Multi-column progression

```tsx
{/* Dashboard stats cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>...</Card>
</div>

{/* Features section */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <FeatureCard>...</FeatureCard>
</div>
```

### Forms
**Pattern:** Stack inputs on mobile, side-by-side on desktop

```tsx
<form className="space-y-6">
  {/* 2-column form fields */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input label="Date" />
    <Select label="Aircraft" />
  </div>

  {/* 3-column layout for smaller inputs */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Input label="PIC Time" />
    <Input label="Dual Time" />
    <Input label="Day Landings" />
  </div>
</form>
```

### Text & Spacing
**Pattern:** Smaller text/spacing on mobile, larger on desktop

```tsx
{/* Responsive padding */}
<div className="px-4 md:px-6 lg:px-8">

{/* Responsive text size */}
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  
{/* Responsive gap */}
<div className="flex gap-2 sm:gap-4 lg:gap-6">
```

### Component Width
**Pattern:** Full width on mobile, constrained on desktop

```tsx
{/* Filter dropdown */}
<Select className="w-full sm:w-45">

{/* Form container */}
<form className="w-full max-w-2xl mx-auto">

{/* Page container */}
<main className="container mx-auto px-4 md:px-8">
```

---

## Viewport Configuration

**Required in layout.tsx:**
```tsx
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};
```

This ensures proper mobile scaling and prevents iOS auto-zoom on input focus.

---

## Component Checklist

When creating/updating components, verify:

- [ ] Mobile-first class ordering (base → sm: → md: → lg:)
- [ ] Touch targets ≥40px for interactive elements
- [ ] Grid layouts stack properly on mobile
- [ ] Text remains readable on small screens (min 14px)
- [ ] Images/media have responsive sizing
- [ ] Forms stack inputs vertically on mobile
- [ ] Navigation collapses to hamburger menu below md:
- [ ] Tables scroll horizontally or reformat on mobile
- [ ] Modals are full-screen on mobile, centered on desktop

---

## Testing

### Manual Testing Viewports
Test all UI changes at these critical breakpoints:

- **375px:** iPhone SE (smallest common phone)
- **425px:** Standard mobile phone
- **768px:** iPad portrait (tablet breakpoint)
- **1024px:** iPad landscape (desktop breakpoint)
- **1280px:** Standard desktop

### Browser DevTools
Use responsive mode in Chrome/Firefox DevTools:
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test each breakpoint
4. Verify touch target sizes with "Show rulers"

---

## Common Anti-Patterns to Avoid

❌ **Fixed widths without responsive variants:**
```tsx
<div className="w-96"> {/* Breaks on mobile */}
```

❌ **Desktop-first breakpoints:**
```tsx
<div className="flex lg:block"> {/* Confusing logic */}
```

❌ **Horizontal scroll on mobile:**
```tsx
<nav className="flex gap-6"> {/* Overflows with many items */}
```

❌ **Tiny touch targets:**
```tsx
<Button className="h-6 w-6"> {/* Too small for mobile */}
```

---

## Resources

- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [WCAG 2.1 Touch Target Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Mobile-First CSS](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Responsive/Mobile_first)

---

**Last Updated:** January 20, 2026  
**Status:** Active - follow these patterns for all new components
