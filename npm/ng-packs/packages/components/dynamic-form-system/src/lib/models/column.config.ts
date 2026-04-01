export interface ColumnConfig {
  field: string;
  headerName: string;
  displayName?: string;
  width?: number;
  sortable?: boolean;
  visible: boolean;
  frozen?: 'left' | 'right' | null;
  align?: 'left' | 'center' | 'right';
  order: number;
  formatter?: ColumnFormatter;
}

export interface TableConfigScheme {
  id: string;
  name: string;
  entityName: string;
  isPublic: boolean;
  columns: ColumnConfig[];
  pageSize: number;
  pageSizeOptions: number[];
  isDefault?: boolean;
  createdBy?: string;
  createdAt?: Date;
}

export type ColumnFormatter = (value: any, row: any) => string;
