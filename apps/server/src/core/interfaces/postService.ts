import { Post, PostWithAuthor } from '@blog/shared/src/models/Post';
import { QueryOptions, PaginatedResult } from '@blog/shared/src/types/pagination';
import { IBaseService, ServiceContext } from '../BaseService';

export interface IPostService extends IBaseService<PostWithAuthor> { }