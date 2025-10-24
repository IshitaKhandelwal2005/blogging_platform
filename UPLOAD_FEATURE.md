# Image Upload Feature with Cloudinary

## Quick Start

The blog now supports **two ways** to add images to posts:

### 1. Upload Files Directly (Cloudinary)
- Click "Choose File" in the image section
- Select an image (JPEG, PNG, GIF, WebP)
- Max size: 5MB
- Files are uploaded to Cloudinary cloud storage
- Automatic optimization and CDN delivery

### 2. Use Image URLs
- Paste any image URL
- Great for using images from external sources

## ⚙️ Setup Required

Before using image uploads, you need to configure Cloudinary:

1. **Sign up** at [cloudinary.com](https://cloudinary.com/users/register/free) (free tier available)
2. **Get credentials** from your dashboard
3. **Add to `.env`**:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. **Restart server**: `npm run dev`

📖 See [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md) for detailed instructions

## Files Added

```
app/api/upload/route.ts          # Upload API endpoint
public/uploads/.gitkeep           # Upload directory
```

## Files Modified

```
app/posts/new/page.tsx            # Added upload to create form
app/posts/[slug]/edit/page.tsx    # Added upload to edit form
.gitignore                        # Exclude uploaded files from git
IMAGE_FEATURE_GUIDE.md            # Updated documentation
```

## How It Works

1. **User selects a file** → File is validated (type & size)
2. **File is uploaded** → Sent to Cloudinary cloud storage
3. **Cloudinary processes** → Auto-optimizes and stores in `blog_posts` folder
4. **URL is returned** → Secure Cloudinary URL automatically set
5. **Preview appears** → User sees the uploaded image
6. **Post is saved** → Cloudinary URL is stored in database

## Security & Validation

- ✅ File type validation (images only)
- ✅ File size limit (5MB max)
- ✅ Unique filenames (timestamp-based)
- ✅ Error handling for failed uploads
- ✅ Frontend and backend validation

## Storage Notes

- ✅ **Cloud Storage**: Images are stored in Cloudinary (not on your server)
- ✅ **Free Tier**: 25 GB storage, 25 GB bandwidth/month
- ✅ **Auto Optimization**: Images are automatically optimized for web
- ✅ **CDN Delivery**: Fast loading via global CDN
- ✅ **Database**: Only the Cloudinary URL is stored (not the file itself)
- ✅ **Folder Organization**: All blog images in `blog_posts` folder

## Example Usage

### Creating a Post with Upload
1. Go to "Create New Post"
2. Fill in title and content
3. Click "Choose File" under Featured Image
4. Select an image from your computer
5. Wait for upload (you'll see "Uploading...")
6. Preview appears automatically
7. Submit the post

### Using an External URL Instead
1. Skip the file upload
2. Paste an image URL in the "Image URL" field
3. Preview appears if URL is valid
4. Submit the post

Both methods work seamlessly!
