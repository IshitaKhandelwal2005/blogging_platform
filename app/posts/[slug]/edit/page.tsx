"use client";

import { trpc } from '~/utils/trpc';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const utils = trpc.useContext();
  const { slug } = use(params);
  const { data: categories } = trpc.categories.list.useQuery();
  // Include drafts when fetching post for editing
  const { data: post, isLoading } = trpc.posts.get.useQuery({ slug, includeDrafts: true }, { enabled: !!slug });

  const updatePost = trpc.posts.update.useMutation({
    onSuccess: (data) => {
      // Invalidate cache to refresh post lists
      utils.posts.list.invalidate();
      utils.posts.get.invalidate();
      
      // Redirect based on published status
      if (data.published) {
        router.push(`/posts/${data.slug}`);
      } else {
        // If still a draft, redirect with draft parameter
        router.push(`/posts/${data.slug}?draft=true`);
      }
    },
    onError: (error) => {
      alert(`Error updating post: ${error.message}`);
    }
  });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [preview, setPreview] = useState(false);
  const [published, setPublished] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setContent(post.content || '');
      setImageUrl(post.image_url || '');
      setSelectedCategories((post.categories || []).map((c: any) => c.id));
      setPublished(!!post.published);
    }
  }, [post]);

  const toggleCategory = (id: number) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setImageUrl(data.imageUrl);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;
    updatePost.mutate({ id: post.id, data: { title, content, imageUrl: imageUrl || undefined, published, categoryIds: selectedCategories } });
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  if (!post) return <div className="p-8">Post not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Edit Post</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
        </div>

        {/* Cover Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Cover Image (optional)
          </label>
          
          {!imageUrl ? (
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="imageFile"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="imageFile"
                      name="imageFile"
                      type="file"
                      className="sr-only"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            </div>
          ) : (
            <div className="mt-1">
              <div className="relative group">
                <img
                  src={imageUrl}
                  alt="Cover preview"
                  className="max-w-full max-h-48 object-contain rounded-lg border border-gray-200 bg-white p-1"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Remove
                  </button>
                  <label
                    htmlFor="replaceImageFile"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                  >
                    Change
                    <input
                      id="replaceImageFile"
                      type="file"
                      className="sr-only"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>
              {uploading && (
                <div className="mt-2 text-sm text-blue-600">Uploading...</div>
              )}
            </div>
          )}
          {uploadError && (
            <p className="mt-2 text-sm text-red-600">{uploadError}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Categories</label>
          <div className="flex gap-2 flex-wrap">
            {categories?.map((cat) => (
              <button key={cat.id} type="button" onClick={() => toggleCategory(cat.id)} className={`px-3 py-1 rounded ${selectedCategories.includes(cat.id) ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="content" className="block text-sm font-medium">Content (Markdown)</label>
            <button type="button" onClick={() => setPreview(p => !p)} className="text-sm text-blue-500">{preview ? 'Edit' : 'Preview'}</button>
          </div>

            <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} className="w-full px-3 py-2 border rounded-lg min-h-[300px]" required />
    
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2"><input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Published</label>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => router.push(`/posts/${post.slug}`)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50" disabled={updatePost.isLoading}>{updatePost.isLoading ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}
