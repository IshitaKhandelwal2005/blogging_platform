'use client';

import React, { useState, useCallback } from 'react';
import { trpc } from '~/utils/trpc';
import Link from 'next/link';
import { useUIStore } from '~/store/ui';
import { Post, Category } from '~/types/schema';

// Category color mapping
const categoryColors: Record<string, string> = {
  'Architecture': 'bg-blue-100 text-blue-800',
  'Design': 'bg-purple-100 text-purple-800',
  'Backend': 'bg-green-100 text-green-800',
  'Career': 'bg-yellow-100 text-yellow-800',
  'Development': 'bg-red-100 text-red-800',
  'DevOps': 'bg-orange-100 text-orange-800',
  'Frontend': 'bg-pink-100 text-pink-800',
  'Tutorials': 'bg-gray-300 text-gray-800',
  'Default': 'bg-gray-500 text-gray-800'
};

// Loading skeleton for posts
function PostsSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((n) => (
        <div key={n} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="h-48 bg-gray-200 animate-pulse"></div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 w-20"></span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 w-16"></span>
            </div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PostsPage() {
  const { selectedCategoryId, setSelectedCategory } = useUIStore();
  const [showDrafts, setShowDrafts] = useState(false);
  
  const [page, setPage] = useState(1);
  const limit = 6; // Number of posts per page
  
  const { data: categories, isLoading: loadingCategories } = trpc.categories.list.useQuery();
  const { data, isLoading: loadingPosts } = trpc.posts.list.useQuery(
    { 
      categoryId: selectedCategoryId || undefined, 
      includeDrafts: showDrafts,
      page,
      limit
    },
    { keepPreviousData: true }
  );
  
  const { posts = [], pagination } = data || {};

  const handleCategoryClick = useCallback((id: number) => {
    setSelectedCategory(selectedCategoryId === id ? null : id);
    setPage(1); // Reset to first page when changing category
  }, [selectedCategoryId, setSelectedCategory]);

  if (loadingCategories) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12">Blog Posts</h1>
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-8 bg-gray-200 rounded-full w-24 animate-pulse"></div>
          ))}
        </div>
        <PostsSkeleton />
      </div>
    );
  }

  if (loadingPosts && !data) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12">Blog Posts</h1>
        <PostsSkeleton />
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold mb-6">No posts found</h1>
        {selectedCategoryId ? (
          <button 
            onClick={() => {
              setSelectedCategory(null);
              setPage(1);
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to all posts
          </button>
        ) : (
          <p>No posts have been published yet.</p>
        )}
      </div>
    );
  }

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
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
        {posts?.map((post: Post) => {
          // Get the first two categories or use an empty array if none
          const postCategories = post.categories?.slice(0, 2) || [];
          const remainingCategories = post.categories && post.categories.length > 2 ? post.categories.length - 2 : 0;
          
          return (
            <Link
              key={post.id}
              href={post.published ? `/posts/${post.slug}` : `/posts/${post.slug}?draft=true`}
              className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Cover Image */}
              <div className="h-48 bg-gray-100 overflow-hidden">
                {post.imageUrl ? (
                  <img 
                    src={post.imageUrl} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-6">
                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {postCategories.map((category: Category) => (
                    <span 
                      key={category.id}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        categoryColors[category.name] || 
                        categoryColors[Object.keys(categoryColors).find(key => 
                          key.toLowerCase() === category.name.toLowerCase()
                        ) as string] || 
                        categoryColors['Default']
                      }`}
                    >
                      {category.name}
                    </span>
                  ))}
                  {remainingCategories > 0 && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      +{remainingCategories} more
                    </span>
                  )}
                </div>
                
                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {post.title}
                </h2>
                
                {/* Excerpt */}
                <p className="text-gray-600 line-clamp-2 mb-4">
                  {post.content.replace(/[#*_`~>]/g, '')}
                </p>
                
                {/* Date */}
                <div className="text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={!pagination.hasPreviousPage}
            className={`px-4 py-2 rounded-md ${pagination.hasPreviousPage 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            // Calculate page numbers to show (current page in the middle when possible)
            let pageNum;
            if (pagination.totalPages <= 5) {
              pageNum = i + 1;
            } else if (pagination.currentPage <= 3) {
              pageNum = i + 1;
            } else if (pagination.currentPage >= pagination.totalPages - 2) {
              pageNum = pagination.totalPages - 4 + i;
            } else {
              pageNum = pagination.currentPage - 2 + i;
            }
            
            return (
              <button
                key={`page-${pageNum}`}
                onClick={() => setPage(pageNum)}
                className={`w-10 h-10 rounded-md ${
                  pageNum === pagination.currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}