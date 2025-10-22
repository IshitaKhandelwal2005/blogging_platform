"use client";

import { trpc } from '~/utils/trpc';
import { parseMarkdown } from '~/utils/markdown';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: post, isLoading } = trpc.posts.get.useQuery({ slug }, { enabled: !!slug });

  const updatePost = trpc.posts.update.useMutation({
    onSuccess: (data) => {
      router.push(`/posts/${data.slug}`);
    }
  });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [preview, setPreview] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setContent(post.content || '');
      setSelectedCategories((post.categories || []).map((c: any) => c.id));
      setPublished(!!post.published);
    }
  }, [post]);

  const toggleCategory = (id: number) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;
    updatePost.mutate({ id: post.id, data: { title, content, published, categoryIds: selectedCategories } });
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

          {preview ? (
            <div className="prose max-w-none p-4 border rounded-lg min-h-[300px]" dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }} />
          ) : (
            <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} className="w-full px-3 py-2 border rounded-lg min-h-[300px]" required />
          )}
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
