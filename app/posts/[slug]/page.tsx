import { Metadata } from 'next';
import { PostView } from '@/components/PostView';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Blog Post - ${slug}`,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  return <PostView slug={slug} />;
}