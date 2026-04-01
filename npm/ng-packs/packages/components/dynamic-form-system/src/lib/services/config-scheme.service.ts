import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import {
  FilterConfigScheme,
  TableConfigScheme,
  LookupConfigScheme,
  QueryParams,
  PagedRequest,
  PagedResult
} from '../models';

@Injectable({ providedIn: 'root' })
export class ConfigSchemeService {
  private readonly apiUrl = '/api/dynamic-form/schemes';
  private readonly filterSchemeApiUrl = '/api/dynamic-form/filter-schemes';
  private readonly tableColumnApiUrl = '/api/dynamic-form/table-columns';
  private readonly lookupSchemeApiUrl = '/api/dynamic-form/lookup-schemes';

  constructor(private http: HttpClient) {}

  getFilterSchemes(entityName: string): Observable<FilterConfigScheme[]> {
    return this.http.get<FilterConfigScheme[]>(`${this.filterSchemeApiUrl}`, {
      params: { entityName }
    });
  }

  getFilterScheme(id: string): Observable<FilterConfigScheme> {
    return this.http.get<FilterConfigScheme>(`${this.filterSchemeApiUrl}/${id}`);
  }

  createFilterScheme(scheme: FilterConfigScheme): Observable<FilterConfigScheme> {
    return this.http.post<FilterConfigScheme>(this.filterSchemeApiUrl, scheme);
  }

  updateFilterScheme(id: string, scheme: FilterConfigScheme): Observable<FilterConfigScheme> {
    return this.http.put<FilterConfigScheme>(`${this.filterSchemeApiUrl}/${id}`, scheme);
  }

  deleteFilterScheme(id: string): Observable<void> {
    return this.http.delete<void>(`${this.filterSchemeApiUrl}/${id}`);
  }

  setDefaultFilterScheme(id: string): Observable<void> {
    return this.http.put<void>(`${this.filterSchemeApiUrl}/${id}/default`, {});
  }

  getTableSchemes(entityName: string): Observable<TableConfigScheme[]> {
    return this.http.get<TableConfigScheme[]>(`${this.tableColumnApiUrl}`, {
      params: { entityName }
    });
  }

  getTableScheme(id: string): Observable<TableConfigScheme> {
    return this.http.get<TableConfigScheme>(`${this.tableColumnApiUrl}/${id}`);
  }

  createTableScheme(scheme: TableConfigScheme): Observable<TableConfigScheme> {
    return this.http.post<TableConfigScheme>(this.tableColumnApiUrl, scheme);
  }

  updateTableScheme(id: string, scheme: TableConfigScheme): Observable<TableConfigScheme> {
    return this.http.put<TableConfigScheme>(`${this.tableColumnApiUrl}/${id}`, scheme);
  }

  deleteTableScheme(id: string): Observable<void> {
    return this.http.delete<void>(`${this.tableColumnApiUrl}/${id}`);
  }

  setDefaultTableScheme(id: string): Observable<void> {
    return this.http.put<void>(`${this.tableColumnApiUrl}/${id}/default`, {});
  }

  getLookupSchemes(entityName: string): Observable<LookupConfigScheme[]> {
    return this.http.get<LookupConfigScheme[]>(`${this.lookupSchemeApiUrl}`, {
      params: { entityName }
    });
  }

  getLookupScheme(id: string): Observable<LookupConfigScheme> {
    return this.http.get<LookupConfigScheme>(`${this.lookupSchemeApiUrl}/${id}`);
  }

  createLookupScheme(scheme: LookupConfigScheme): Observable<LookupConfigScheme> {
    return this.http.post<LookupConfigScheme>(this.lookupSchemeApiUrl, scheme);
  }

  updateLookupScheme(id: string, scheme: LookupConfigScheme): Observable<LookupConfigScheme> {
    return this.http.put<LookupConfigScheme>(`${this.lookupSchemeApiUrl}/${id}`, scheme);
  }

  deleteLookupScheme(id: string): Observable<void> {
    return this.http.delete<void>(`${this.lookupSchemeApiUrl}/${id}`);
  }

  setDefaultLookupScheme(id: string): Observable<void> {
    return this.http.put<void>(`${this.lookupSchemeApiUrl}/${id}/default`, {});
  }
}
