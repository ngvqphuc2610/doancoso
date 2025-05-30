# Banner System Documentation

## Overview
Dynamic banner system that uses movie posters from the database as hero banners, with fallback to hardcoded images when no movie data is available.

## Architecture

### Data Flow
```
1. Load movies from database
2. Filter movies with valid posters
3. Create banners from movie data
4. Fallback to hardcoded banners if needed
5. Display in carousel component
```

### Components

#### 1. HeroBanner (`src/components/home/HeroBanner.tsx`)
Main wrapper component that receives banner data and passes to Carousel.

```typescript
interface BannerItem {
  id: string;
  image: StaticImageData | string; // Supports both static imports and URLs
  title: string;
  link: string;
}
```

#### 2. Carousel (`src/components/home/Carousel.tsx`)
Swiper-based carousel that displays banners with:
- Auto-play functionality
- Navigation arrows
- Responsive design
- Error handling for failed images
- Overlay gradients for text readability

#### 3. Banner Creation Logic (`src/app/page.tsx`)
Smart banner creation with prioritization and fallbacks.

## Banner Creation Logic

### Priority System
1. **Movies with valid posters** - Prioritized for banners
2. **All movies** - Used if no valid posters found
3. **Fallback banners** - Used when no movie data available

### Poster Validation
```typescript
const moviesWithPosters = movies.filter(movie => 
  movie.poster && 
  movie.poster !== '/images/movie-placeholder.jpg' && 
  movie.poster !== '/images/movie-placeholder.svg' &&
  !movie.poster.includes('placeholder')
);
```

### Image Source Handling
```typescript
image: movie.poster && movie.poster.startsWith('http') 
  ? movie.poster  // External URL
  : movie.poster || fallbackBanners[index % fallbackBanners.length].image // Local or fallback
```

## Fallback System

### Hardcoded Banners
```typescript
const fallbackBanners: BannerItem[] = [
  { id: '1', image: bannerImage1, title: 'Banner 1', link: '/movie' },
  { id: '2', image: bannerImage2, title: 'Banner 2', link: '/movie' },
];
```

### Loading State
- During initial load: Shows fallback banners
- After data load: Shows movie-based banners
- On error: Falls back to hardcoded banners

### Image Error Handling
```typescript
onError={(e) => {
  const target = e.target as HTMLImageElement;
  target.src = '/images/movie-placeholder.svg';
}}
```

## Responsive Design

### Carousel Sizing
```css
.mySwiper {
  width: 1200px;
  height: 361px;
}
```

### Text Overlays
```jsx
{/* Movie title - responsive positioning */}
<div className="absolute left-4 sm:left-8 bottom-16 sm:bottom-20 z-20">
  <h3 className="text-white text-lg sm:text-xl md:text-2xl font-bold">

{/* Button - responsive sizing */}
<div className="absolute right-4 sm:right-8 md:right-[100px] bottom-4 sm:bottom-[10px]">
  <Link className="text-xs sm:text-sm md:text-base">
```

## Image Requirements

### Movie Posters
- **Format**: JPG, PNG, WebP
- **Recommended size**: 1200x361px (banner aspect ratio)
- **Source**: Database `poster_image` field
- **Fallback**: SVG placeholder

### Static Banners
- **Location**: `public/images/banner.png`, `public/images/banner2.jpg`
- **Usage**: Fallback when no movie data available
- **Format**: StaticImageData (Next.js imports)

## Configuration

### Banner Count
```typescript
// Maximum banners from movies
const selectedMovies = moviesWithPosters.slice(0, 5);

// Minimum banners (with fallbacks)
if (movieBanners.length < 2) {
  const remainingFallbacks = fallbackBanners.slice(movieBanners.length);
  return [...movieBanners, ...remainingFallbacks];
}
```

### Auto-play Settings
```typescript
autoplay={{
  delay: 3000,
  disableOnInteraction: false,
}}
```

## Links and Navigation

### Movie Links
```typescript
link: `/movie/${movie.id}` // Links to individual movie pages
```

### Fallback Links
```typescript
link: '/movie' // Links to general movie listing page
```

## Error Handling

### Image Loading Errors
1. **onError handler**: Switches to SVG placeholder
2. **Poster validation**: Filters out invalid poster URLs
3. **Fallback cascade**: Movie posters → All movies → Hardcoded banners

### Data Loading Errors
1. **Loading state**: Shows fallback banners during load
2. **Empty data**: Uses hardcoded banners
3. **Network errors**: Graceful degradation to static content

## Performance Optimizations

### Image Loading
```typescript
priority={index === 0} // Prioritize first banner
className='object-cover' // Proper image scaling
```

### Lazy Loading
- First banner loads with priority
- Subsequent banners load normally
- Error handling prevents broken images

## Customization

### Adding New Fallback Banners
```typescript
const fallbackBanners: BannerItem[] = [
  { id: '1', image: bannerImage1, title: 'Banner 1', link: '/movie' },
  { id: '2', image: bannerImage2, title: 'Banner 2', link: '/movie' },
  { id: '3', image: bannerImage3, title: 'Banner 3', link: '/movie' }, // New banner
];
```

### Modifying Banner Selection Logic
```typescript
// Example: Prioritize by release date
const selectedMovies = moviesWithPosters
  .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
  .slice(0, 5);
```

### Styling Customization
```css
/* Custom overlay gradients */
.banner-overlay {
  background: linear-gradient(45deg, rgba(0,0,0,0.7) 0%, transparent 100%);
}

/* Custom button styles */
.custom-banner-button {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
}
```

## Future Enhancements

### Potential Improvements
1. **Admin banner management** - Allow admins to select featured movies
2. **Banner scheduling** - Time-based banner rotation
3. **A/B testing** - Different banner sets for different users
4. **Analytics** - Track banner click-through rates
5. **Video banners** - Support for video backgrounds
6. **Dynamic text** - Movie descriptions, ratings, etc.

### Database Integration
```sql
-- Potential banner_featured table
CREATE TABLE banner_featured (
  id INT PRIMARY KEY AUTO_INCREMENT,
  movie_id INT,
  priority INT,
  start_date DATE,
  end_date DATE,
  active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (movie_id) REFERENCES movies(id_movie)
);
```

This banner system provides a robust, responsive, and maintainable solution for displaying dynamic movie-based hero banners with proper fallback mechanisms.
