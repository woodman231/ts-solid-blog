import { RESPONSE_TYPES } from '../constants/responseTypes';

// Base response interface
export interface BaseResponseParams {
  [key: string]: any;
}

export interface BaseResponse<T extends BaseResponseParams = BaseResponseParams> {
  responseType: string;
  responseParams: T;
}

// Entity data response
export interface EntityDataResponseParams<T = any> extends BaseResponseParams {
  entities: {
    data: {
      [entityType: string]: T[];
    };
    total: number;
    filteredTotal: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EntityDataResponse<T = any> extends BaseResponse<EntityDataResponseParams<T>> {
  responseType: typeof RESPONSE_TYPES.SET_ENTITY_DATA;
}

// Error response
export interface ErrorResponseParams extends BaseResponseParams {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface ErrorResponse extends BaseResponse<ErrorResponseParams> {
  responseType: typeof RESPONSE_TYPES.ERROR;
}

// Success response
export interface SuccessResponseParams extends BaseResponseParams {
  message: string;
  data?: any;
}

export interface SuccessResponse extends BaseResponse<SuccessResponseParams> {
  responseType: typeof RESPONSE_TYPES.SUCCESS;
}

// Search authors response
export interface SearchAuthorsResponseParams extends BaseResponseParams {
  authors: Array<{
    id: string;
    displayName: string;
  }>;
}

export interface SearchAuthorsResponse extends BaseResponse<SearchAuthorsResponseParams> {
  responseType: typeof RESPONSE_TYPES.SEARCH_AUTHORS;
}