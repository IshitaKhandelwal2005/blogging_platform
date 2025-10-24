'use client';

import { trpc } from '~/utils/trpc';
import { marked } from 'marked';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Category } from '~/types/schema';
import { useSearchParams } from 'next/navigation';

interface PostViewProps {
  slug: string;
}

export function PostView({ slug }: PostViewProps) {
  const utils = trpc.useContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const includeDrafts = searchParams?.get('draft') === 'true';
  const { data: post, isLoading, error } = trpc.posts.get.useQuery({ slug, includeDrafts });

  const publishMutation = trpc.posts.publish.useMutation({
    onSuccess: (data) => {
      utils.posts.list.invalidate();
      // if we're viewing a draft, redirect to the published post URL
      if (includeDrafts && data?.slug) {
        router.push(`/posts/${data.slug}`);
      }
    },
  });

  const unpublishMutation = trpc.posts.unpublish.useMutation({
    onSuccess: () => utils.posts.list.invalidate(),
  });

  const deleteMutation = trpc.posts.delete.useMutation({
    onSuccess: () => {
      // invalidate list and navigate away
      utils.posts.list.invalidate();
      router.push('/posts');
    }
  });

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto" role="status" aria-label="loading post">
        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-8" /> {/* Back button */}
        <div className="h-12 bg-gray-200 rounded animate-pulse mb-4" /> {/* Title */}
        <div className="flex gap-2 mb-8">
          {[1, 2].map((n) => (
            <div key={n} className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-4 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Error loading post</h1>
        <p className="text-red-500 mb-4">{error.message}</p>
        <Link href="/posts" className="text-blue-500 hover:underline">
          Back to posts
        </Link>
      </div>
    );
  }

  // Not found state
  if (!post) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <Link href="/posts" className="text-blue-500 hover:underline">
          Back to posts
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto">
      <Link
        href="/posts"
        className="inline-block mb-8 text-blue-500 hover:underline"
      >
        ← Back to posts
      </Link>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-4xl font-bold">{post.title}</h1>
        <div>
          <Link href={`/posts/${post.slug}/edit`} className="mr-3">
            <button className="px-3 py-1 border rounded bg-gray-100 text-gray-800" aria-label="Edit post">
              Edit
            </button>
          </Link>
          {post.published ? (
            <button
              onClick={() => {
                const ok = window.confirm('Are you sure you want to delete this blog? This action cannot be undone.');
                if (ok) deleteMutation.mutate({ id: post.id });
              }}
              className="px-3 py-1 border rounded bg-yellow-100 text-yellow-800"
              aria-label="Delete post (via unpublish)"
            >
              Unpublish
            </button>
          ) : (
            <button
              onClick={() => {
                if (includeDrafts) {
                  const ok = window.confirm('Are you sure you want to publish this blog?');
                  if (!ok) return;
                }
                publishMutation.mutate({ id: post.id });
              }}
              className="px-3 py-1 border rounded bg-green-100 text-green-800"
              aria-label="Publish post"
            >
              Publish
            </button>
          )}
        </div>
      </div>

      {/* Featured Image */}
      {post.image_url && (
        <div className="mb-8">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      )}

      {/* Categories */}
      <div className="flex gap-2 mb-8">
        {post.categories?.map((cat: Category) => (
          <span
            key={cat.id}
            className="px-3 py-1 bg-gray-100 rounded-full text-sm"
          >
            {cat.name}
          </span>
        ))}
      </div>

      {/* Markdown content */}
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: marked(post.content) }}
      />

      <div className="mt-8 text-sm text-gray-500">
        Posted on {new Date(post.created_at).toLocaleDateString()}
      </div>
    </article>
  );
}