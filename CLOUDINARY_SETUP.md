# Cloudinary Setup Guide

## Why Cloudinary?

Cloudinary provides cloud-based image storage with automatic optimization, transformations, and a global CDN. This means:
- ✅ Images are stored in the cloud (not on your server)
- ✅ Automatic image optimization for faster loading
- ✅ Responsive image delivery
- ✅ Global CDN for fast access worldwide
- ✅ Free tier available (25 GB storage, 25 GB bandwidth/month)

## Setup Steps

### 1. Create a Cloudinary Account

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your Credentials

1. Log in to your Cloudinary dashboard
2. Go to the **Dashboard** (home page)
3. You'll see your credentials in the **Account Details** section:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 3. Add Credentials to Your Project

Add these three environment variables to your `.env` or `.env.local` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Important:** Replace the placeholder values with your actual Cloudinary credentials.

### 4. Restart Your Development Server

After adding the environment variables, restart your Next.js server:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

## How It Works

When a user uploads an image:

1. **File is selected** → Validated on frontend (type & size)
2. **Uploaded to API** → Sent to `/api/upload` endpoint
3. **Sent to Cloudinary** → Uploaded to your Cloudinary account
4. **Optimized automatically** → Cloudinary optimizes the image
5. **URL returned** → Secure HTTPS URL from Cloudinary
6. **Saved to database** → Only the URL is stored

## Image Transformations

The upload API automatically applies these transformations:
- **Max dimensions**: 1200x630 pixels (maintains aspect ratio)
- **Quality**: Auto-optimized for web
- **Format**: Auto-selected (WebP for modern browsers)

## Folder Structure

All blog post images are uploaded to the `blog_posts` folder in your Cloudinary account for easy organization.

## Free Tier Limits

Cloudinary's free tier includes:
- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month
- **Images**: Unlimited

This is more than enough for most blogs!

## Troubleshooting

### Error: "Cloudinary is not configured"

**Solution:** Make sure you've added all three environment variables to your `.env` file:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Then restart your server.

### Upload fails with no error message

**Solution:** Check your Cloudinary dashboard to ensure:
1. Your account is active
2. You haven't exceeded free tier limits
3. Your API credentials are correct

### Images not displaying

**Solution:** 
1. Check the browser console for errors
2. Verify the Cloudinary URL is correct
3. Ensure your Cloudinary account settings allow public access to images

## Security Notes

- ✅ Never commit your `.env` file to Git
- ✅ API Secret is kept server-side only
- ✅ Uploads are validated before being sent to Cloudinary
- ✅ File size and type restrictions are enforced

## Next Steps

Once configured, you can:
1. Upload images when creating posts
2. View uploaded images in your Cloudinary dashboard
3. Manage and organize images in the `blog_posts` folder
4. Use Cloudinary's built-in image editor if needed

For more advanced features, check out the [Cloudinary documentation](https://cloudinary.com/documentation).
