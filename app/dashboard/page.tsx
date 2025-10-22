'use client';

import React, { useState } from 'react';
import { trpc } from '~/utils/trpc';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Post, Category } from '~/types/schema';

export default function DashboardPage() {
  const router = useRouter();
  const utils = trpc.useContext();
  const [activeTab, setActiveTab] = useState<'posts' | 'categories'>('posts');

  // Fetch all posts (published + drafts)
  const { data: publishedPosts, isLoading: loadingPublished } = trpc.posts.list.useQuery({ includeDrafts: false });
  const { data: draftPosts, isLoading: loadingDrafts } = trpc.posts.list.useQuery({ includeDrafts: true });
  const { data: categories, isLoading: loadingCategories } = trpc.categories.list.useQuery();

  const deleteMutation = trpc.posts.delete.useMutation({
    onSuccess: () => {
      utils.posts.list.invalidate();
    }
  });

  const publishMutation = trpc.posts.publish.useMutation({
    onSuccess: () => {
      utils.posts.list.invalidate();
    }
  });

  const unpublishMutation = trpc.posts.unpublish.useMutation({
    onSuccess: () => {
      utils.posts.list.invalidate();
    }
  });

  const deleteCategoryMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const handleDeletePost = (post: Post) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${post.title}"? This action cannot be undone.`);
    if (confirmed) {
      deleteMutation.mutate({ id: post.id });
    }
  };

  const handlePublishPost = (post: Post) => {
    publishMutation.mutate({ id: post.id });
  };

  const handleUnpublishPost = (post: Post) => {
    unpublishMutation.mutate({ id: post.id });
  };

  const handleDeleteCategory = (category: Category) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${category.name}"?`);
    if (confirmed) {
      deleteCategoryMutation.mutate({ id: category.id });
    }
  };

  const allPosts = [...(publishedPosts || []), ...(draftPosts || [])];
  const totalPosts = allPosts.length;
  const publishedCount = publishedPosts?.length || 0;
  const draftCount = draftPosts?.length || 0;
  const categoryCount = categories?.length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link
          href="/posts/new"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          New Post
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Total Posts</div>
          <div className="text-3xl font-bold">{totalPosts}</div>
        </div>
        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Published</div>
          <div className="text-3xl font-bold text-green-600">{publishedCount}</div>
        </div>
        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Drafts</div>
          <div className="text-3xl font-bold text-yellow-600">{draftCount}</div>
        </div>
        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Categories</div>
          <div className="text-3xl font-bold text-blue-600">{categoryCount}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'posts'
                ? 'border-blue-500 text-blue-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'categories'
                ? 'border-blue-500 text-blue-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Categories
          </button>
        </div>
      </div>

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {loadingPublished || loadingDrafts ? (
            <div className="text-center py-8 text-gray-500">Loading posts...</div>
          ) : allPosts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">No posts yet</p>
              <Link
                href="/posts/new"
                className="text-blue-500 hover:underline"
              >
                Create your first post
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-4 font-semibold">Title</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Created</th>
                    <th className="text-right p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allPosts.map((post: Post) => (
                    <tr key={post.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <Link
                          href={post.published ? `/posts/${post.slug}` : `/posts/${post.slug}?draft=true`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {post.title}
                        </Link>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            post.published
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(post.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/posts/${post.slug}/edit`}
                            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                          >
                            Edit
                          </Link>
                          {post.published ? (
                            <button
                              onClick={() => handleUnpublishPost(post)}
                              disabled={unpublishMutation.isLoading}
                              className="px-3 py-1 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded disabled:opacity-50"
                            >
                              Unpublish
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePublishPost(post)}
                              disabled={publishMutation.isLoading}
                              className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-800 rounded disabled:opacity-50"
                            >
                              Publish
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePost(post)}
                            disabled={deleteMutation.isLoading}
                            className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          {loadingCategories ? (
            <div className="text-center py-8 text-gray-500">Loading categories...</div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Manage Categories</h2>
                <button
                  onClick={() => {
                    const name = prompt('Enter category name:');
                    if (name) {
                      const description = prompt('Enter category description (optional):');
                      trpc.categories.create.useMutation({
                        onSuccess: () => utils.categories.list.invalidate()
                      });
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Add Category
                </button>
              </div>

              {categories?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No categories yet
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories?.map((category: Category) => (
                    <div
                      key={category.id}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          disabled={deleteCategoryMutation.isLoading}
                          className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                      {category.description && (
                        <p className="text-sm text-gray-600">{category.description}</p>
                      )}
                      <div className="mt-2 text-xs text-gray-400">
                        Slug: {category.slug}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
