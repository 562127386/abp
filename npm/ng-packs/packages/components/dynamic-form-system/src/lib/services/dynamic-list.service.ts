import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { QueryParams, PagedRequest, PagedResult } from '../models';

@Injectable({ providedIn: 'root' })
export class DynamicListService {
  private readonly defaultPageSize = 10;
  private readonly defaultPageSizeOptions = [10, 20, 50, 100];

  private filterParams = new BehaviorSubject<QueryParams>({});
  private sortParams = new BehaviorSubject<string>('');
  private pageParams = new BehaviorSubject<{ skipCount: number; maxResultCount: number }>({
    skipCount: 0,
    maxResultCount: this.defaultPageSize
  });

  readonly filters$ = this.filterParams.asObservable();
  readonly sort$ = this.sortParams.asObservable();
  readonly page$ = this.pageParams.asObservable();

  readonly currentFilters = signal<QueryParams>({});
  readonly currentSort = signal<string>('');
  readonly currentPage = signal<{ skipCount: number; maxResultCount: number }>({
    skipCount: 0,
    maxResultCount: this.defaultPageSize
  });

  constructor(private http: HttpClient) {
    this.filters$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(filters => {
      this.currentFilters.set(filters);
      this.pageParams.next({ skipCount: 0, maxResultCount: this.currentPage().maxResultCount });
    });

    this.page$.subscribe(page => {
      this.currentPage.set(page);
    });
  }

  updateFilters(params: QueryParams): void {
    this.filterParams.next(params);
  }

  updateFilter(key: string, value: any): void {
    const current = this.filterParams.value;
    this.filterParams.next({ ...current, [key]: value });
  }

  clearFilters(): void {
    this.filterParams.next({});
  }

  updateSort(sort: string): void {
    this.sortParams.next(sort);
    this.currentSort.set(sort);
  }

  updatePage(skipCount: number, maxResultCount: number): void {
    this.pageParams.next({ skipCount, maxResultCount });
  }

  loadData<T>(apiUrl: string, entityName: string): Observable<PagedResult<T>> {
    const filters = this.filterParams.value;
    const sort = this.sortParams.value;
    const page = this.pageParams.value;

    let params = new HttpParams()
      .set('SkipCount', page.skipCount.toString())
      .set('MaxResultCount', page.maxResultCount.toString());

    if (sort) {
      params = params.set('Sorting', sort);
    }

    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get<PagedResult<T>>(apiUrl, { params });
  }

  getPageSizeOptions(): number[] {
    return this.defaultPageSizeOptions;
  }

  getDefaultPageSize(): number {
    return this.defaultPageSize;
  }
}
