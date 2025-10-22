'use client';

import React, { useState } from 'react';
import { trpc } from '~/utils/trpc';
import Link from 'next/link';
import { useUIStore } from '~/store/ui';
import { Post, Category } from '~/types/schema';

// Loading skeleton for posts
function PostsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((n) => (
        <div key={n} className="p-6 border rounded-lg animate-pulse">
          <div className="h-7 bg-gray-200 rounded mb-4 w-3/4" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PostsPage() {
  const { selectedCategoryId, setSelectedCategory } = useUIStore();
  const [showDrafts, setShowDrafts] = useState(false);
  
  const { data: categories, isLoading: loadingCategories } = trpc.categories.list.useQuery();
  const { data: posts, isLoading: loadingPosts } = trpc.posts.list.useQuery(
    selectedCategoryId ? { categoryId: selectedCategoryId, includeDrafts: showDrafts } : { includeDrafts: showDrafts }
  );

  const handleCategoryClick = (id: number) => {
    setSelectedCategory(selectedCategoryId === id ? null : id);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="form-checkbox" checked={showDrafts} onChange={(e) => setShowDrafts(e.target.checked)} />
            Show drafts
          </label>
          <Link
          href="/posts/new"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          New Post
        </Link>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2">
        {loadingCategories ? (
          <div className="flex gap-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {categories?.map((cat: Category) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`px-3 py-1 border rounded transition-colors ${
                  selectedCategoryId === cat.id
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Posts Grid */}
      {loadingPosts ? (
        <PostsSkeleton />
      ) : posts?.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No posts found
          {selectedCategoryId && (
            <>
              {' '}
              for this category.{' '}
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-blue-500 hover:underline"
              >
                Show all posts
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts?.map((post: Post) => (
            <Link
              key={post.id}
              href={post.published ? `/posts/${post.slug}` : `/posts/${post.slug}?draft=true`}
              className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p className="text-gray-600 line-clamp-3">{post.content}</p>
              <div className="mt-4 text-sm text-gray-500">
                {new Date(post.created_at).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}