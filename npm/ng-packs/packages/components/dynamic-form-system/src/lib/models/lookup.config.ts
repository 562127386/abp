import { FilterOperator } from './filter.config';

export interface LookupColumnConfig {
  field: string;
  headerName: string;
  displayName?: string;
  width?: number;
  sortable?: boolean;
  visible: boolean;
  order: number;
  align?: 'left' | 'center' | 'right';
}

export interface LookupSearchFilter {
  field: string;
  label: string;
  type: SearchFilterType;
  operators?: FilterOperator[];
  defaultOperator?: FilterOperator;
  order: number;
  width?: number;
  placeholder?: string;
}

export interface LookupConfigScheme {
  id: string;
  entityName: string;
  schemeName: string;
  description?: string;
  isDefault: boolean;
  isPublic: boolean;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  columns: LookupColumnConfig[];
  searchFilters: LookupSearchFilter[];
}

export type SearchFilterType =
  | 'text'
  | 'number'
  | 'select'
  | 'dateRange'
  | 'datetimeRange';

export interface LookupConfig {
  type: 'lookup' | 'multi-select';
  lookupApi: string;
  lookupDisplayField: string;
  lookupValueField: string;
}
