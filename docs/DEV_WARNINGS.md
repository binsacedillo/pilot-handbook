# Development Warnings Implementation

## Overview
This project includes components to warn users that the site is still under development.

## Components Created

### 1. `DevWarningBanner` - Global Site Banner
**Location:** `components/DevWarningBanner.tsx`  
**Added to:** `app/layout.tsx` (shows on all pages)

**Features:**
- Dismissible banner that persists for the session
- Shows a yellow warning bar at the top of every page
- Responsive design for mobile and desktop
- Dark mode support

**Props:**
```tsx
interface DevWarningBannerProps {
  productionOnly?: boolean;  // Only show in production (default: false)
  message?: string;          // Custom warning message
}
```

**Usage Examples:**
```tsx
// Default - shows everywhere, all environments
<DevWarningBanner />

// Only show in production
<DevWarningBanner productionOnly={true} />

// Custom message
<DevWarningBanner message="New features coming soon! Some pages are still being built." />
```

### 2. `DevBadge` - Inline Feature Badge
**Location:** `components/DevBadge.tsx`

**Use for:** Marking specific features, pages, or sections as "Beta" or "In Development"

**Props:**
```tsx
interface DevBadgeProps {
  label?: string;      // Default: "Beta"
  className?: string;  // Additional Tailwind classes
}
```

**Usage Examples:**
```tsx
import DevBadge from "@/components/DevBadge";

// In a page title
<h1 className="flex items-center gap-2">
  Analytics Dashboard
  <DevBadge />
</h1>

// Custom labels
<DevBadge label="Coming Soon" />
<DevBadge label="In Development" />
<DevBadge label="Experimental" />

// In navigation
<Link href="/analytics">
  Analytics <DevBadge label="New" />
</Link>
```

## Current Implementation

✅ **Global banner is active** in `app/layout.tsx`
- Appears at the very top of all pages
- Users can dismiss it (reappears on refresh)
- Stored in session storage (clears when browser closes)

## Recommended Usage

### When to Use Global Banner:
- ✅ **Entire site is in beta/development** (current implementation)
- ✅ **Before public launch**
- ✅ **When collecting user feedback**
- ❌ Remove after official launch

### When to Use Page-Specific Badges:
- ✅ **Individual features still in progress** (e.g., analytics page)
- ✅ **Experimental features**
- ✅ **New features you're testing**

## Customization Options

### Change Banner Colors
Edit `components/DevWarningBanner.tsx`:
```tsx
// Current: Yellow (warning)
className="bg-yellow-50 dark:bg-yellow-900/20"

// Blue (info):
className="bg-blue-50 dark:bg-blue-900/20"

// Orange (alert):
className="bg-orange-50 dark:bg-orange-900/20"
```

### Make Banner Permanent (No Dismiss)
Remove the X button and dismiss logic from `DevWarningBanner.tsx`

### Add Link to Feedback Form
```tsx
<p className="text-sm text-yellow-700">
  Under development. <a href="/feedback" className="underline">Report issues</a>
</p>
```

## Environment-Based Display

To only show the warning in production (not in development):

**In `app/layout.tsx`:**
```tsx
<DevWarningBanner productionOnly={true} />
```

This is useful if you want to:
- Test without the banner locally
- Only warn production users
- Remove banner from staging environment

## Example: Adding Badge to Analytics Page

```tsx
// app/dashboard/analytics/page.tsx
import DevBadge from "@/components/DevBadge";

export default function AnalyticsPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <DevBadge label="Beta" />
      </div>
      {/* rest of page */}
    </div>
  );
}
```

## Removing Warnings

When ready to launch:

1. **Remove global banner** from `app/layout.tsx`:
   ```tsx
   // Remove this line:
   <DevWarningBanner />
   ```

2. **Remove individual badges** from pages

3. **Optional:** Delete the components if no longer needed

## Is This Needed?

### ✅ YES - Highly Recommended For:
- **Legal protection** - Sets user expectations
- **User experience** - Prevents confusion about missing features
- **Feedback collection** - Encourages users to report issues
- **Professional appearance** - Shows transparency
- **Beta testing** - Manages expectations during testing phase

### ❌ NOT NEEDED For:
- Internal development sites (not public)
- Localhost/development environment only
- Fully completed production sites

## Best Practices

1. **Be specific** - "Analytics feature in beta" vs "Site under construction"
2. **Keep it visible** - Top banner is best for site-wide warnings
3. **Make it dismissible** - Don't annoy users with permanent banners
4. **Remove when done** - Don't leave warnings up forever
5. **Consider environment** - Use `productionOnly` flag wisely

## Current Status

✅ Global banner implemented and active  
✅ Badge component available for per-page use  
✅ Dark mode support  
✅ Responsive design  
✅ Dismissible functionality  

**Next Steps:**
1. Test the banner on your deployed site
2. Add badges to specific incomplete features
3. Remove banner when site is production-ready
