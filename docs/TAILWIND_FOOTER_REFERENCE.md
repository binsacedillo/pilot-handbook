# Tailwind CSS Sticky Footer Classes Reference

## Quick Implementation Guide

### Core Classes Used

| Class | Purpose | Tailwind Definition |
|-------|---------|-------------------|
| `min-h-screen` | Minimum height = viewport height | `min-height: 100vh` |
| `flex` | Enable flexbox | `display: flex` |
| `flex-col` | Stack items vertically | `flex-direction: column` |
| `flex-1` | Grow to fill available space | `flex: 1 1 0%` |
| `w-full` | Full width | `width: 100%` |

### CSS Equivalent
```css
/* Container */
.page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Main content - pushes footer down */
.page-main {
  flex: 1;
}

/* Footer already has */
.page-footer {
  margin-top: auto; /* Tailwind: mt-auto */
}
```

## Layout Hierarchy

### Level 1: HTML Body (Root Layout)
```tsx
<body className="flex flex-col min-h-screen">
  {/* All content flows through this flex container */}
</body>
```

### Level 2: Page Container
```tsx
<div className="min-h-screen bg-background text-foreground flex flex-col">
  <AppHeader />
  <main className="flex-1"> {/* This pushes content */}
    {/* Content goes here */}
  </main>
  <AppFooter />
</div>
```

## Flexbox Algorithm Explanation

When you set up the structure like this:

```
Container: display: flex; flex-direction: column; min-height: 100vh;
├─ Header: (takes natural height)
├─ Main: flex-1 (takes ALL remaining space)
└─ Footer: (takes natural height)
```

**The browser does this:**
1. Calculates total available height (100vh)
2. Subtracts header height
3. Subtracts footer height
4. Gives remaining space to `flex-1` element (main)
5. Result: Footer always at bottom of viewport (if content is short)

## Applied to All Pages

### Page Structure Template
```tsx
export default function PageName() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader />
      <main className="flex-1 max-w-6xl mx-auto p-6 md:p-8 w-full">
        {/* Content */}
      </main>
      <AppFooter />
    </div>
  );
}
```

### Breakdown of Classes
- `min-h-screen` - Page takes full viewport height minimum
- `bg-background` - Uses theme background color
- `text-foreground` - Uses theme text color  
- `flex` - Enables flexbox layout
- `flex-col` - Vertical stacking
- `flex-1` on main - Content expands to fill space
- `max-w-6xl` - Content width constraint
- `mx-auto` - Centers content horizontally
- `p-6 md:p-8` - Responsive padding
- `w-full` - Main takes full width

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Flexbox | ✅ 29+ | ✅ 28+ | ✅ 9+ | ✅ 11+ |
| min-h-screen | ✅ All | ✅ All | ✅ All | ✅ All |
| CSS Grid | ✅ 57+ | ✅ 52+ | ✅ 10.1+ | ✅ 16+ |

**Result**: Works on 99.9%+ of modern browsers

## Responsive Behavior

### Mobile (< 768px)
- Content takes full width with side padding
- Footer stays pinned to bottom
- No horizontal scrolling

### Tablet (768px - 1024px)
- Content constrained but responsive
- Flexbox adapts naturally
- Footer remains at bottom

### Desktop (> 1024px)
- Full max-w-6xl constraint
- Centered content
- Footer behavior consistent

## Common Issues & Solutions

### Issue: Footer not sticking
**Solution**: Ensure `flex-1` is on main element (done ✅)

### Issue: Content overlapping footer
**Solution**: Verify `flex-col` on container (done ✅)

### Issue: Layout breaks on mobile
**Solution**: `w-full` on main element ensures full width (done ✅)

### Issue: Content too narrow
**Solution**: Added `w-full` to main to ensure full width usage (done ✅)

## Performance Metrics

- **Repaints**: ~0 additional repaints (pure CSS layout)
- **Reflows**: ~0 additional reflows (stable flex layout)
- **JavaScript**: 0 lines of JS required
- **CSS Specificity**: Low (using utility classes)
- **Bundle Size Impact**: 0 bytes (Tailwind already included)

## Future Enhancements

1. **Settings pages**: Can use this pattern for nested layouts
2. **Modal overlays**: Consider applying to modal containers
3. **Sidebar layouts**: Extend pattern to multi-column layouts
4. **Dynamic heights**: Works with dynamic content (forms, tables, etc.)

