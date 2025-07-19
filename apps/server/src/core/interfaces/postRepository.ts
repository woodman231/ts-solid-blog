import { PostWithAuthor } from '@blog/shared/src/models/Post';
import { IRepository } from './repository';

export interface IPostRepository extends IRepository<PostWithAuthor> {
  findByAuthorId(authorId: string): Promise<PostWithAuthor[]>;
}