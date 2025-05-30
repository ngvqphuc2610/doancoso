# Responsive Design Documentation

## Overview
Comprehensive responsive design implementation for the CineStar cinema booking application, ensuring optimal user experience across all device sizes.

## Breakpoints
Following Tailwind CSS standard breakpoints:

```css
/* Mobile First Approach */
sm: 640px   /* Small devices (landscape phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (desktops) */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X Extra large devices */
```

## Layout Components

### 1. Main Layout (`src/components/layout/Layout.tsx`)
```jsx
// Mobile: Full width
// Desktop: Centered with side margins
<div className="grid grid-cols-12 gap-2 sm:gap-4 lg:gap-6">
  <div className="col-span-0 lg:col-span-1 hidden lg:block"></div>
  <main className="col-span-12 lg:col-span-10">
    {children}
  </main>
  <div className="col-span-0 lg:col-span-1 hidden lg:block"></div>
</div>
```

### 2. Admin Layout (`src/app/admin/layout.tsx`)
```jsx
// Mobile: Collapsible sidebar with overlay
// Desktop: Fixed sidebar
<div className={`
  fixed lg:static inset-y-0 left-0 z-40 w-64 
  transform transition-transform duration-300 ease-in-out
  ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
`}>
```

## Component Responsive Patterns

### 1. QuickBookingForm
```jsx
// Mobile: Stacked vertically
// Tablet: 2 columns
// Desktop: 4 columns in a row
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
```

### 2. MovieForm
```jsx
// Mobile: Single column
// Desktop: Two columns
<div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
```

### 3. CinemaList
```jsx
// Responsive showtime buttons
<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
```

### 4. BookingBar
```jsx
// Mobile: Compact vertical layout
// Desktop: Horizontal layout with full info
<div className="block lg:hidden"> {/* Mobile layout */}
<div className="hidden lg:flex"> {/* Desktop layout */}
```

## Typography Responsive Classes

### Custom Responsive Text Utilities
```css
.text-responsive-xs   /* 12px → 14px */
.text-responsive-sm   /* 14px → 16px */
.text-responsive-base /* 16px → 18px */
.text-responsive-lg   /* 18px → 20px → 24px */
```

### Usage Examples
```jsx
<h1 className="text-xl sm:text-2xl lg:text-3xl">
<p className="text-sm sm:text-base">
<span className="text-xs sm:text-sm">
```

## Spacing & Sizing

### Responsive Padding/Margin
```jsx
className="p-3 sm:p-4 lg:p-6"
className="mb-4 sm:mb-6 lg:mb-8"
className="space-y-3 sm:space-y-4 lg:space-y-6"
```

### Responsive Gaps
```jsx
className="gap-3 sm:gap-4 lg:gap-6"
className="space-x-2 sm:space-x-4 lg:space-x-6"
```

## Button & Interactive Elements

### Touch-Friendly Sizing
```css
.btn-touch {
  min-height: 44px;
  min-width: 44px;
}
```

### Responsive Button Layout
```jsx
// Mobile: Full width stacked
// Desktop: Inline
<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
  <button className="w-full sm:w-auto">
```

## Grid Systems

### Admin Dashboard
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
```

### Movie Grid
```jsx
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-8">
```

## Mobile-Specific Features

### Mobile Menu
```jsx
// Hamburger menu for mobile
<div className="lg:hidden fixed top-4 left-4 z-50">
  <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
```

### Mobile Overlay
```jsx
// Dark overlay when mobile menu is open
{mobileMenuOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" />
)}
```

### Safe Area Support
```css
.safe-area-top { padding-top: env(safe-area-inset-top); }
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
```

## Text Handling

### Truncation
```jsx
className="truncate"           // Single line
className="line-clamp-2"       // 2 lines
className="line-clamp-3"       // 3 lines
```

### Responsive Text Alignment
```jsx
className="text-center lg:text-left"
className="text-left sm:text-center"
```

## Container Patterns

### Standard Container
```jsx
<div className="container mx-auto px-2 sm:px-4 lg:px-6">
```

### Custom Responsive Container
```jsx
<div className="container-responsive">
```

## Form Elements

### Responsive Form Layout
```jsx
// Mobile: Stacked
// Desktop: Side by side
<div className="space-y-4 lg:space-y-0 lg:space-x-4 lg:flex">
```

### Input Sizing
```jsx
className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
```

## Image Handling

### Responsive Images
```jsx
<img 
  className="w-full h-auto object-cover"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

### Preview Images
```jsx
<div className="w-32 h-48 sm:w-40 sm:h-60 overflow-hidden rounded">
```

## Testing Responsive Design

### Breakpoint Testing
1. **Mobile (320px - 639px)**: iPhone SE, small phones
2. **Tablet (640px - 1023px)**: iPad, large phones landscape
3. **Desktop (1024px+)**: Laptops, desktops

### Key Testing Points
- Navigation usability on mobile
- Form input accessibility
- Button touch targets (min 44px)
- Text readability at all sizes
- Image scaling and quality
- Performance on mobile devices

## Performance Considerations

### Mobile Optimization
- Smaller image sizes for mobile
- Reduced animations on mobile
- Touch-optimized interactions
- Faster loading times

### CSS Optimization
- Mobile-first approach
- Progressive enhancement
- Minimal layout shifts
- Efficient media queries

## Best Practices

1. **Mobile First**: Design for mobile, enhance for desktop
2. **Touch Targets**: Minimum 44px for interactive elements
3. **Content Priority**: Most important content visible first
4. **Performance**: Optimize for slower mobile connections
5. **Accessibility**: Ensure usability across all devices
6. **Testing**: Test on real devices, not just browser dev tools

## Common Patterns

### Hide/Show Elements
```jsx
className="hidden sm:block"     // Hide on mobile
className="block sm:hidden"     // Show only on mobile
className="lg:hidden xl:block"  // Complex visibility
```

### Responsive Flexbox
```jsx
className="flex flex-col lg:flex-row"
className="items-center lg:items-start"
className="justify-center lg:justify-between"
```

### Responsive Grid
```jsx
className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
className="col-span-full md:col-span-1"
```

This responsive design system ensures the CineStar application provides an optimal user experience across all device types and screen sizes.
