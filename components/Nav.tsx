import Link from 'next/link';

export default function Nav() {
  return (
    <nav className="border-b">
      <div className="max-w-5xl mx-auto p-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          Blog
        </Link>
        <div className="space-x-4">
          <Link href="/posts">Posts</Link>
          <Link href="/dashboard">Dashboard</Link>
        </div>
      </div>
    </nav>
  );
}
