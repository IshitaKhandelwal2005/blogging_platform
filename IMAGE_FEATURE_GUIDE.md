# Image Feature for Blog Posts

## Overview
This feature adds support for including images in blog posts. Users can now add a featured image URL when creating or editing posts.

## Changes Made

### 1. Database Schema
- **File**: `src/db/schema.ts`
- Added `image_url` column (text, nullable) to the `posts` table

### 2. Database Migration
- **File**: `drizzle/0001_add_image_url.sql`
- SQL migration to add the `image_url` column to existing database
- **File**: `scripts/migrate.js`
- Migration script to apply database changes

### 3. API Layer
- **File**: `src/server/router/posts.ts`
- Updated `postInput` schema to include optional `imageUrl` field
- Modified `create` mutation to handle image URLs
- Modified `update` mutation to handle image URLs

### 3.5. Upload API
- **File**: `app/api/upload/route.ts`
- Created POST endpoint for file uploads
- Validates file type (JPEG, PNG, GIF, WebP) and size (max 5MB)
- Saves files to `public/uploads/` with timestamped filenames
- Returns the public URL path

### 4. UI Components

#### New Post Form
- **File**: `app/posts/new/page.tsx`
- Added file upload input with drag-and-drop support
- Added image URL input field (alternative option)
- Added live image preview for both upload and URL
- Upload progress indicator and error handling
- Image is included when creating posts (both published and drafts)

#### Edit Post Form
- **File**: `app/posts/[slug]/edit/page.tsx`
- Added file upload input with drag-and-drop support
- Added image URL input field (alternative option)
- Added live image preview for both upload and URL
- Upload progress indicator and error handling
- Loads existing image URL when editing
- Image is included when updating posts

#### Post View
- **File**: `components/PostView.tsx`
- Displays featured image (if provided) below the title and above categories
- Image is responsive with rounded corners and shadow

## How to Use

### 1. Setup Cloudinary (Required for Image Upload)

To enable image uploads, you need to configure Cloudinary:

1. Create a free account at [Cloudinary](https://cloudinary.com/users/register/free)
2. Get your credentials from the dashboard
3. Add them to your `.env` file:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Restart your development server

📖 **See [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md) for detailed setup instructions**

### 2. Run the Migration
Before using the feature, apply the database migration:

```bash
npm run db:migrate
```

### 3. Adding Images to Posts

When creating or editing a post, you have **two options**:

#### Option A: Upload an Image File
1. Click "Choose File" under the "Upload Image" section
2. Select an image file (JPEG, PNG, GIF, or WebP)
3. Maximum file size: 5MB
4. The image will be uploaded to Cloudinary (cloud storage)
5. A preview will appear automatically with the Cloudinary URL

#### Option B: Use an Image URL
1. Enter a valid image URL in the "Image URL" field
2. The image will preview below the input field
3. If the URL is invalid, the preview won't display

**Note:** The image field is optional - posts without images will work as before

### 4. Viewing Posts with Images

Posts with images will display the featured image:
- Below the post title
- Above the categories
- Full width with responsive sizing
- Rounded corners and shadow for visual appeal

## Technical Details

### Image Upload API
- **Endpoint**: `/api/upload` (POST)
- **Cloud Storage**: Cloudinary
- **Accepted Formats**: JPEG, JPG, PNG, GIF, WebP
- **Max File Size**: 5MB
- **Auto Optimization**: Images are automatically optimized for web
- **CDN Delivery**: Global CDN for fast loading

### Image Storage
- **Uploaded Images**: Stored in Cloudinary cloud storage (folder: `blog_posts`)
- **URL Images**: Referenced by external URL
- **Database**: Only the image URL is stored (text field)
- **Transformations**: Auto-applied (max 1200x630, quality optimization, format selection)

### Features
- **Validation**: File type and size validation on both frontend and backend
- **Error Handling**: Images that fail to load won't break the page
- **Responsive**: Images scale appropriately on different screen sizes
- **Optional**: The feature is backward compatible - existing posts without images continue to work
- **Preview**: Live preview for both uploaded and URL-based images

## Future Enhancements

Potential improvements for this feature:
- Multiple images per post (gallery support)
- Image optimization and resizing
- CDN integration for better performance
- Alt text field for accessibility
- Image cropping/editing tools
- Cloud storage integration (AWS S3, Cloudinary, etc.)
