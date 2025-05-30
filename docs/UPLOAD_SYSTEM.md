# Upload System Documentation

## Overview
Unified image upload system for the cinema booking application with organized file structure and consistent API.

## Directory Structure
```
public/uploads/
├── movies/           # Movie poster images
├── products/         # Product images (food, drinks, etc.)
├── entertainment/    # Entertainment facility images
└── [legacy files]    # Old product_* files (deprecated)
```

## API Endpoint
**POST** `/api/upload/image`

### Request
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Body**:
  - `file`: Image file (required)
  - `type`: Upload type (required) - one of: `movies`, `products`, `entertainment`

### Response
```json
{
  "success": true,
  "message": "Upload ảnh thành công",
  "url": "/uploads/movies/1735567890123_poster.jpg",
  "fileName": "1735567890123_poster.jpg",
  "type": "movies"
}
```

### Error Response
```json
{
  "success": false,
  "message": "File phải là ảnh (jpg, png, gif, etc.)"
}
```

## Validation Rules
- **File Type**: Must be image/* (jpg, png, gif, webp, etc.)
- **File Size**: Maximum 5MB
- **File Name**: Automatically sanitized and made unique

## Usage Examples

### 1. Movie Poster Upload
```typescript
import { uploadImage } from '@/lib/uploadHelpers';

const handleUpload = async (file: File) => {
  const result = await uploadImage(file, 'movies');
  if (result.success) {
    console.log('Uploaded to:', result.url);
  }
};
```

### 2. Product Image Upload
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('type', 'products');

const response = await fetch('/api/upload/image', {
  method: 'POST',
  body: formData,
});
```

### 3. Entertainment Image Upload
```typescript
const result = await uploadImage(file, 'entertainment');
```

## Helper Functions

### `uploadImage(file: File, type: UploadType)`
High-level function that handles validation and upload.

### `validateImageFile(file: File)`
Validates file type and size before upload.

### `generateUniqueFilename(originalName: string)`
Generates timestamp-based unique filename.

## File Naming Convention
- **Format**: `{timestamp}_{sanitized_original_name}.{ext}`
- **Example**: `1735567890123_movie_poster.jpg`
- **Sanitization**: Non-alphanumeric characters replaced with underscores

## Migration from Legacy System
Legacy product files (`product_*.ext`) have been migrated to the new structure:
- **From**: `/uploads/product_1747931133287.png`
- **To**: `/uploads/products/1747931133287_product.png`

## Security Features
- File type validation (server & client)
- File size limits
- Filename sanitization
- Directory traversal prevention
- Organized storage structure

## Git Configuration
Upload directories are tracked but uploaded files are ignored:
```gitignore
/public/uploads/movies/*
!/public/uploads/movies/.gitkeep
/public/uploads/products/*
!/public/uploads/products/.gitkeep
/public/uploads/entertainment/*
!/public/uploads/entertainment/.gitkeep
```

## Error Handling
- Invalid file types → Clear error message
- File too large → Size limit message
- Upload failure → Network/server error message
- Missing type parameter → Validation error

## Performance Considerations
- Files stored locally in public directory
- Direct serving via Next.js static files
- No database storage of file content
- Unique filenames prevent caching issues

## Future Enhancements
- [ ] Image resizing/optimization
- [ ] Cloud storage integration (AWS S3, Cloudinary)
- [ ] Bulk upload support
- [ ] Image compression
- [ ] Progress tracking for large files
