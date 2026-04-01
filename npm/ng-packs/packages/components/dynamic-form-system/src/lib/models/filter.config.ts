export interface FilterConfig {
  field: string;
  operator: FilterOperator;
  value: any;
  logic?: 'and' | 'or';
}

export interface FilterConfigScheme {
  id: string;
  name: string;
  entityName: string;
  isPublic: boolean;
  filters: FilterConfig[];
  createdBy?: string;
  createdAt?: Date;
  isDefault?: boolean;
}

export type FilterOperator =
  | 'eq'
  | 'ne'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'ge'
  | 'lt'
  | 'le'
  | 'in';

export interface QueryParams {
  [key: string]: any;
}

export interface PagedRequest {
  skipCount: number;
  maxResultCount: number;
  sorting?: string;
  filter?: string;
}

export interface PagedResult<T = any> {
  items: T[];
  totalCount: number;
}
