export interface Post {
  id: string;
  title: string;
  description: string;
  body: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostWithAuthor extends Post {
  author: {
    id: string;
    displayName: string;
  };
}

export type CreatePost = Omit<Post, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>; // Server will generate id and timestamps