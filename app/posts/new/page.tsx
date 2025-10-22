'use client';

import { trpc } from '~/utils/trpc';
import { marked } from 'marked';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPostPage() {
  const router = useRouter();
  const { data: categories } = trpc.categories.list.useQuery();
  const createPost = trpc.posts.create.useMutation({
    onSuccess: (data) => {
      router.push(`/posts/${data.slug}`);
    }
  });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [preview, setPreview] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPost.mutate({
      title,
      content,
      published: true,
      categoryIds: selectedCategories
    });
  };

  const toggleCategory = (id: number) => {
    setSelectedCategories(prev =>
      prev.includes(id)
        ? prev.filter(cid => cid !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create New Post</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium mb-2">Categories</label>
          <div className="flex gap-2 flex-wrap">
            {categories?.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`px-3 py-1 rounded ${
                  selectedCategories.includes(cat.id)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="content" className="block text-sm font-medium">
              Content (Markdown)
            </label>
            <button
              type="button"
              onClick={() => setPreview(p => !p)}
              className="text-sm text-blue-500"
            >
              {preview ? 'Edit' : 'Preview'}
            </button>
          </div>

          {preview ? (
            <div
              className="prose max-w-none p-4 border rounded-lg min-h-[300px]"
              dangerouslySetInnerHTML={{ __html: marked(content) }}
            />
          ) : (
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg min-h-[300px]"
              required
            />
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => {
              // Ask the user whether to save as draft or discard
              const saveAsDraft = window.confirm('Do you want to save this post as a draft? Press OK to save as draft, Cancel to discard.');
              if (saveAsDraft) {
                // create as unpublished draft and return to posts list so drafts can be viewed
                createPost.mutate({ title, content, published: false, categoryIds: selectedCategories }, {
                  onSuccess: () => {
                    router.push('/posts');
                  }
                });
              } else {
                router.push('/posts');
              }
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={createPost.isLoading}
          >
            {createPost.isLoading ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
}