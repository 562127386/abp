import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import {
  DynamicListService,
  ConfigSchemeService,
  ColumnConfig,
  FilterConfigScheme,
  TableConfigScheme,
  QueryParams,
  PagedResult
} from '../../public-api';

@Component({
  selector: 'abp-dynamic-list',
  template: `
    <nz-card [nzBordered]="false">
      <!-- Filter Section -->
      <nz-collapse nzBordered="false">
        <nz-collapse-panel nzHeader="高级查询" [nzActive]="true">
          <div class="filter-container">
            <form nz-form [nzLayout]="'inline'" (ngSubmit)="search()">
              <nz-form-item *ngFor="let filter of activeFilters">
                <nz-form-label>{{ filter.label }}</nz-form-label>
                <nz-form-control>
                  <nz-select
                    *ngIf="filter.type === 'select'"
                    [(ngModel)]="filterParams[filter.field]"
                    [nzPlaceHolder]="filter.placeholder || '请选择'"
                    nzAllowClear
                    style="width: 150px;">
                    <nz-option
                      *ngFor="let opt of filter.options"
                      [nzValue]="opt.value"
                      [nzLabel]="opt.label">
                    </nz-option>
                  </nz-select>

                  <input
                    *ngIf="filter.type === 'text'"
                    nz-input
                    [(ngModel)]="filterParams[filter.field]"
                    [placeholder]="filter.placeholder || '请输入'"
                    style="width: 150px;" />

                  <nz-range-picker
                    *ngIf="filter.type === 'dateRange'"
                    [(ngModel)]="filterParams[filter.field]"
                    style="width: 250px;">
                  </nz-range-picker>
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-control>
                  <button nz-button nzType="primary" type="submit">
                    <span nz-icon nzType="search"></span>
                    查询
                  </button>
                  <button nz-button type="button" (click)="reset()" style="margin-left: 8px;">
                    重置
                  </button>
                </nz-form-control>
              </nz-form-item>
            </form>
          </div>
        </nz-collapse-panel>
      </nz-collapse>

      <!-- Table Toolbar -->
      <div class="table-toolbar" style="margin: 16px 0;">
        <nz-space>
          <button *nzSpaceItem nz-button nzType="primary" (click)="create()">
            <span nz-icon nzType="plus"></span>
            新增
          </button>
          <button *nzSpaceItem nz-button (click)="refresh()">
            <span nz-icon nzType="reload"></span>
            刷新
          </button>
          <button *nzSpaceItem nz-button nz-dropdown [nzDropdownMenu]="columnMenu">
            <span nz-icon nzType="setting"></span>
            列配置
          </button>
          <button *nzSpaceItem nz-button nz-dropdown [nzDropdownMenu]="filterMenu">
            <span nz-icon nzType="filter"></span>
            查询方案
          </button>
        </nz-space>

        <nz-dropdown-menu #columnMenu="nzDropdownMenu">
          <ul nz-menu>
            <li nz-menu-item *ngFor="let col of columns">
              <label nz-checkbox [(ngModel)]="col.visible" (ngModelChange)="updateColumnVisibility()">
                {{ col.headerName }}
              </label>
            </li>
          </ul>
        </nz-dropdown-menu>

        <nz-dropdown-menu #filterMenu="nzDropdownMenu">
          <ul nz-menu>
            <li nz-menu-item *ngFor="let scheme of filterSchemes" (click)="applyFilterScheme(scheme)">
              <span>{{ scheme.name }}</span>
              <span *ngIf="scheme.isDefault" nz-icon nzType="check" style="margin-left: 8px;"></span>
            </li>
          </ul>
        </nz-dropdown-menu>
      </div>

      <!-- Data Table -->
      <nz-table
        #nzTable
        [nzData]="data"
        [nzTotal]="totalCount"
        [(nzPageIndex)]="pageIndex"
        [(nzPageSize)]="pageSize"
        [nzPageSizeOptions]="pageSizeOptions"
        [nzLoading]="loading"
        [nzShowSizeChanger]="true"
        [nzShowQuickJumper]="true"
        [nzFrontPagination]="false"
        (nzQueryParams)="onQueryParamsChange($event)"
        (nzPageIndexChange)="loadData()"
        (nzPageSizeChange)="loadData()">
        <thead>
          <tr>
            <th
              *ngFor="let col of visibleColumns"
              [nzWidth]="col.width"
              [nzLeft]="col.frozen === 'left'"
              [nzRight]="col.frozen === 'right'"
              [nzSortFn]="col.sortable ? sortFn : null"
              [nzAlign]="col.align || 'left'">
              {{ col.headerName }}
            </th>
            <th nzWidth="150px" nzAlign="center">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of nzTable.data" (dblclick)="edit(row)">
            <td
              *ngFor="let col of visibleColumns"
              [nzLeft]="col.frozen === 'left'"
              [nzRight]="col.frozen === 'right'"
              [nzAlign]="col.align || 'left'">
              <ng-container [ngSwitch]="col.formatter">
                <span *ngSwitchDefault>{{ row[col.field] }}</span>
              </ng-container>
            </td>
            <td nzAlign="center">
              <a (click)="edit(row)">编辑</a>
              <nz-divider nzType="vertical"></nz-divider>
              <a nz-popconfirm nzPopconfirmTitle="确认删除?" (nzOnConfirm)="delete(row)">删除</a>
            </td>
          </tr>
        </tbody>
      </nz-table>

      <nz-empty *ngIf="!loading && data.length === 0" nzNotFoundContent="暂无数据"></nz-empty>
    </nz-card>
  `,
  styles: [`
    .filter-container {
      padding: 8px 0;
    }
    .table-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  `]
})
export class DynamicListComponent implements OnInit, OnDestroy {
  @Input() entityName: string = '';
  @Input() apiUrl: string = '';
  @Input() columns: ColumnConfig[] = [];
  @Input() filterSchemes: FilterConfigScheme[] = [];
  @Input() tableSchemes: TableConfigScheme[] = [];

  @Output() onCreate = new EventEmitter<void>();
  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() onQueryChange = new EventEmitter<QueryParams>();

  data: any[] = [];
  totalCount = 0;
  pageIndex = 1;
  pageSize = 10;
  pageSizeOptions = [10, 20, 50, 100];
  loading = false;

  filterParams: QueryParams = {};
  activeFilters: any[] = [];

  private searchSubject = new Subject<QueryParams>();
  private subscription?: Subscription;

  get visibleColumns(): ColumnConfig[] {
    return this.columns.filter(col => col.visible);
  }

  sortFn = (a: any, b: any) => {
    return a.value > b.value ? 1 : -1;
  };

  constructor(
    private dynamicListService: DynamicListService,
    private configSchemeService: ConfigSchemeService
  ) {
    this.subscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(params => {
      this.loadData();
    });
  }

  ngOnInit(): void {
    this.loadData();
    this.loadFilterSchemes();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  loadData(): void {
    if (!this.apiUrl) return;

    this.loading = true;
    const skipCount = (this.pageIndex - 1) * this.pageSize;

    this.dynamicListService.updateFilters(this.filterParams);
    this.dynamicListService.updatePage(skipCount, this.pageSize);

    this.dynamicListService.loadData(this.apiUrl, this.entityName).subscribe({
      next: (result: PagedResult) => {
        this.data = result.items;
        this.totalCount = result.totalCount;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadFilterSchemes(): void {
    if (!this.entityName) return;

    this.configSchemeService.getFilterSchemes(this.entityName).subscribe(schemes => {
      this.filterSchemes = schemes;
      const defaultScheme = schemes.find(s => s.isDefault);
      if (defaultScheme) {
        this.applyFilterScheme(defaultScheme);
      }
    });
  }

  search(): void {
    this.searchSubject.next(this.filterParams);
  }

  reset(): void {
    this.filterParams = {};
    this.search();
  }

  refresh(): void {
    this.loadData();
  }

  create(): void {
    this.onCreate.emit();
  }

  edit(row: any): void {
    this.onEdit.emit(row);
  }

  delete(row: any): void {
    this.onDelete.emit(row);
  }

  applyFilterScheme(scheme: FilterConfigScheme): void {
    this.filterParams = {};
    scheme.filters.forEach(filter => {
      this.filterParams[filter.field] = filter.value;
    });
    this.search();
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    if (params.sort.length > 0) {
      const sort = params.sort[0];
      const sortStr = `${sort.key} ${sort.value === 'ascend' ? 'asc' : 'desc'}`;
      this.dynamicListService.updateSort(sortStr);
    }
    this.loadData();
  }

  updateColumnVisibility(): void {
    // Save column visibility to config
  }
}
