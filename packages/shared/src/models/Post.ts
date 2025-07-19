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

export type CreatePost = Omit<PostWithAuthor, 'id' | 'authorId' | 'createdAt' | 'updatedAt' | 'author'>; // Server will generate id and timestamps