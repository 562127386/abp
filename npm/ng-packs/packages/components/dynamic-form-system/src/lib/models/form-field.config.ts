export interface FormFieldConfig {
  key: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required?: boolean;
  validation?: ValidationRule[];
  defaultValue?: any;
  options?: SelectOption[];
  disabled?: boolean;
  hidden?: boolean;
  order?: number;
  colSpan?: number;
  conditionalLogic?: ConditionalRule[];
  tooltip?: string;
  lookupApi?: string;
  lookupDisplayField?: string;
  lookupValueField?: string;
}

export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'password'
  | 'date'
  | 'datetime'
  | 'time'
  | 'select'
  | 'multi-select'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'upload'
  | 'lookup'
  | 'typeahead'
  | 'currency'
  | 'percentage';

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message?: string;
}

export interface ConditionalRule {
  dependsOn: string;
  condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
  action: 'show' | 'hide' | 'enable' | 'disable';
}

export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
}
