# 🚀 Quick Start: Cloudinary Setup

## What You Need to Do

Your image upload feature is ready, but you need to configure Cloudinary first!

### ✅ Step-by-Step Checklist

- [ ] **1. Create Cloudinary Account**
  - Go to: https://cloudinary.com/users/register/free
  - Sign up (it's free!)
  - Verify your email

- [ ] **2. Get Your Credentials**
  - Log in to Cloudinary dashboard
  - Find "Account Details" section
  - Copy these three values:
    - Cloud Name
    - API Key
    - API Secret

- [ ] **3. Add to Environment Variables**
  - Open your `.env` file (or create `.env.local`)
  - Add these lines:
    ```env
    CLOUDINARY_CLOUD_NAME=your_cloud_name_here
    CLOUDINARY_API_KEY=your_api_key_here
    CLOUDINARY_API_SECRET=your_api_secret_here
    ```
  - Replace the placeholder values with your actual credentials

- [ ] **4. Restart Your Server**
  - Stop the current server (Ctrl+C in terminal)
  - Run: `npm run dev`
  - Wait for server to start

- [ ] **5. Test Upload**
  - Go to "Create New Post"
  - Click "Choose File" under Featured Image
  - Upload a test image
  - You should see a Cloudinary URL (starts with `https://res.cloudinary.com/`)

## ✨ That's It!

Once configured, your images will:
- ✅ Upload to Cloudinary cloud storage
- ✅ Be automatically optimized
- ✅ Load fast via global CDN
- ✅ Work on all devices

## 🆘 Need Help?

See the detailed guide: [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md)

## 🔍 How to Verify It's Working

After uploading an image, check the "Image URL" field:
- ❌ Wrong: `/uploads/1234567890-image.jpg` (local path)
- ✅ Correct: `https://res.cloudinary.com/your-cloud/image/upload/...` (Cloudinary URL)

If you see the Cloudinary URL, you're all set! 🎉
