import { Post } from '@blog/shared/src/models/Post';
import { IRepository } from './repository';

export interface IPostRepository extends IRepository<Post> {
  findByAuthorId(authorId: string): Promise<Post[]>;
}