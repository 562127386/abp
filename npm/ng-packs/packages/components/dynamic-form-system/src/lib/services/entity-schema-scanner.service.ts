import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormFieldConfig, ColumnConfig, LookupConfig } from '../models';

export interface EntityProperty {
  name: string;
  type: string;
  isNullable: boolean;
  maxLength?: number;
  precision?: number;
  scale?: number;
  isPrimaryKey?: boolean;
  isNavigationProperty?: boolean;
  relatedEntity?: string;
}

export interface ScanResult {
  scanned: string[];
  created: string[];
  updated: string[];
  errors: { entity: string; error: string }[];
}

export interface GeneratedSchema {
  entityName: string;
  formFields: FormFieldConfig[];
  columns: ColumnConfig[];
  lookups: LookupConfig[];
  generatedAt: Date;
}

@Injectable({ providedIn: 'root' })
export class EntitySchemaScannerService {
  private readonly apiUrl = '/api/dynamic-form/admin';

  constructor(private http: HttpClient) {}

  scanAllEntities(): Observable<ScanResult> {
    return this.http.post<ScanResult>(`${this.apiUrl}/scan`, {});
  }

  scanEntity(entityName: string): Observable<GeneratedSchema> {
    return this.http.post<GeneratedSchema>(`${this.apiUrl}/scan/${entityName}`, {});
  }

  regenerateSchema(entityName: string): Observable<GeneratedSchema> {
    return this.http.post<GeneratedSchema>(`${this.apiUrl}/regenerate/${entityName}`, {});
  }

  getScanHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/scan-history`);
  }

  mapCSharpTypeToFormType(property: EntityProperty): FormFieldConfig['type'] {
    const typeMap: Record<string, FormFieldConfig['type']> = {
      'string': 'text',
      'int': 'number',
      'long': 'number',
      'short': 'number',
      'byte': 'number',
      'decimal': 'number',
      'float': 'number',
      'double': 'number',
      'bool': 'switch',
      'boolean': 'switch',
      'DateTime': 'datetime',
      'DateOnly': 'date',
      'TimeOnly': 'time',
      'Guid': 'text',
    };

    const mappedType = typeMap[property.type];
    if (mappedType) return mappedType;

    if (property.type.toLowerCase().includes('enum')) {
      return 'select';
    }

    return 'text';
  }

  inferValidationRules(property: EntityProperty): FormFieldConfig['validation'] {
    const rules: FormFieldConfig['validation'] = [];

    if (!property.isNullable && property.type !== 'bool' && property.type !== 'boolean') {
      rules.push({ type: 'required', message: `${property.name}不能为空` });
    }

    if (property.maxLength && property.type === 'string') {
      rules.push({
        type: 'maxLength',
        value: property.maxLength,
        message: `${property.name}最多${property.maxLength}个字符`
      });
    }

    if (property.precision && property.scale) {
      rules.push({
        type: 'max',
        value: Math.pow(10, property.precision - property.scale) - Math.pow(10, -property.scale)
      });
    }

    return rules;
  }

  inferDefaultValue(property: EntityProperty): any {
    switch (property.type) {
      case 'bool':
      case 'boolean':
        return false;
      case 'int':
      case 'long':
      case 'short':
      case 'byte':
        return 0;
      case 'decimal':
      case 'float':
      case 'double':
        return 0.0;
      default:
        return null;
    }
  }

  inferColumnWidth(property: EntityProperty): number {
    const widthMap: Record<string, number> = {
      'id': 80,
      'code': 120,
      'name': 200,
      'description': 250,
      'remark': 250,
      'amount': 120,
      'price': 120,
      'quantity': 100,
      'status': 100,
      'type': 100,
      'creationTime': 150,
      'lastModificationTime': 150,
    };

    return widthMap[property.name.toLowerCase()] || 150;
  }

  isDisplayInList(property: EntityProperty): boolean {
    const excludedFields = ['id', 'extraProperties', 'concurrencyStamp', 'tenantId'];
    return !excludedFields.includes(property.name.toLowerCase());
  }

  isFormField(property: EntityProperty): boolean {
    const excludedFields = ['id', 'creationTime', 'creatorId', 'lastModificationTime', 'lastModifierId', 'concurrencyStamp', 'extraProperties'];
    return !excludedFields.includes(property.name.toLowerCase());
  }
}
