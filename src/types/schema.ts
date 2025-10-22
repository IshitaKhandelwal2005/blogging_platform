export interface Post {
  id: number;
  title: string;
  content: string;
  slug: string;
  published: boolean;
  created_at: string | Date;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface PostWithCategories extends Post {
  categories: Category[];
}