// Base request interface
export interface BaseRequestParams {
  [key: string]: any;
}

export interface BaseRequest<T extends BaseRequestParams = BaseRequestParams> {
  requestType: string;
  requestParams: T;
}

// Load page
export interface LoadPageRequestParams extends BaseRequestParams {
  pageName: string;
}

export interface LoadPageRequest extends BaseRequest<LoadPageRequestParams> {
  requestType: 'loadPage';
}

// Fetch entities
export interface FilterOptions {
  [key: string]: any;
}

export interface SortOptions {
  [key: string]: 'asc' | 'desc';
}

export interface FetchEntitiesRequestParams extends BaseRequestParams {
  entityType: string;
  filterOptions?: FilterOptions;
  sort?: SortOptions;
  page?: number;
  limit?: number;
}

export interface FetchEntitiesRequest extends BaseRequest<FetchEntitiesRequestParams> {
  requestType: 'fetchEntities';
}

// Create entity
export interface CreateEntityRequestParams<T = any> extends BaseRequestParams {
  entityType: string;
  entityData: T;
}

export interface CreateEntityRequest<T = any> extends BaseRequest<CreateEntityRequestParams<T>> {
  requestType: 'createEntity';
}

// Update entity
export interface UpdateEntityRequestParams<T = any> extends BaseRequestParams {
  entityType: string;
  entityId: string;
  entityData: Partial<T>;
}

export interface UpdateEntityRequest<T = any> extends BaseRequest<UpdateEntityRequestParams<T>> {
  requestType: 'updateEntity';
}

// Delete entity
export interface DeleteEntityRequestParams extends BaseRequestParams {
  entityType: string;
  entityId: string;
}

export interface DeleteEntityRequest extends BaseRequest<DeleteEntityRequestParams> {
  requestType: 'deleteEntity';
}

// Type guards
export function isLoadPageRequest(req: BaseRequest): req is LoadPageRequest {
  return req.requestType === 'loadPage';
}

export function isFetchEntitiesRequest(req: BaseRequest): req is FetchEntitiesRequest {
  return req.requestType === 'fetchEntities';
}

export function isCreateEntityRequest(req: BaseRequest): req is CreateEntityRequest {
  return req.requestType === 'createEntity';
}

export function isUpdateEntityRequest(req: BaseRequest): req is UpdateEntityRequest {
  return req.requestType === 'updateEntity';
}

export function isDeleteEntityRequest(req: BaseRequest): req is DeleteEntityRequest {
  return req.requestType === 'deleteEntity';
}