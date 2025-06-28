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
  responseType: 'setEntityData';
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
  responseType: 'error';
}

// Success response
export interface SuccessResponseParams extends BaseResponseParams {
  message: string;
  data?: any;
}

export interface SuccessResponse extends BaseResponse<SuccessResponseParams> {
  responseType: 'success';
}