import { Metadata } from 'next';
import { PostView } from '@/components/PostView';

// Use loose typing for Next.js PageProps compatibility
type Props = any;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params?.slug ?? 'post';
  return {
    title: `Blog Post - ${slug}`,
  };
}

export default function PostPage({ params }: Props) {
  return <PostView slug={params?.slug} />;
}