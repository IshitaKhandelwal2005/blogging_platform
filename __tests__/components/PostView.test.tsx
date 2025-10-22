import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PostView } from '@/components/PostView';

// Mock the trpc module used by the component
jest.mock('~/utils/trpc', () => ({
  trpc: {
    useContext: () => ({ posts: { list: { invalidate: jest.fn() } } }),
    posts: {
      get: {
        useQuery: jest.fn()
      },
      publish: { useMutation: () => ({ mutate: jest.fn() }) },
      unpublish: { useMutation: () => ({ mutate: jest.fn() }) }
    }
  }
}));

// Mock marked to avoid ESM issues during tests
jest.mock('marked', () => ({ marked: (s: string) => `<p>${s}</p>` }));

const { trpc } = require('~/utils/trpc');

describe('PostView', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('shows loading state', () => {
    trpc.posts.get.useQuery.mockReturnValue({ data: undefined, isLoading: true, error: null });
    render(<PostView slug="test-post" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows post not found state', () => {
    trpc.posts.get.useQuery.mockReturnValue({ data: null, isLoading: false, error: null });
    render(<PostView slug="test-post" />);
    expect(screen.getByText('Post not found')).toBeInTheDocument();
  });

  it('renders post content', () => {
    const mockPost = {
      id: 1,
      title: 'Test Post',
      content: '# Test Content',
      slug: 'test-post',
      created_at: new Date().toISOString(),
      categories: [{ id: 1, name: 'Test Category', slug: 'test-category' }],
      published: true
    };

    trpc.posts.get.useQuery.mockReturnValue({ data: mockPost, isLoading: false, error: null });
    render(<PostView slug="test-post" />);
    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('Test Category')).toBeInTheDocument();
  });
});