import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LookupConfigScheme, LookupColumnConfig, LookupSearchFilter } from '../../models';

@Component({
  selector: 'abp-lookup-modal',
  template: `
    <nz-modal
      [(nzVisible)]="visible"
      [nzTitle]="title"
      [nzWidth]="800"
      [nzOkText]="'确认'"
      [nzCancelText]="'取消'"
      [nzOkLoading]="loading"
      (nzOnCancel)="handleCancel()"
      (nzOnOk)="handleOk()">
      <ng-container *nzModalContent>
        <!-- Search Filters -->
        <div class="lookup-search" style="margin-bottom: 16px;">
          <form nz-form [nzLayout]="'inline'">
            <nz-form-item *ngFor="let filter of searchFilters">
              <nz-form-label>{{ filter.label }}</nz-form-label>
              <nz-form-control>
                <nz-select
                  *ngIf="filter.type === 'select'"
                  [(ngModel)]="searchParams[filter.field + '_operator']"
                  style="width: 80px;">
                  <nz-option nzValue="eq" nzLabel="="></nz-option>
                  <nz-option nzValue="contains" nzLabel="包含"></nz-option>
                </nz-select>

                <input
                  *ngIf="filter.type === 'text'"
                  nz-input
                  [(ngModel)]="searchParams[filter.field]"
                  [placeholder]="filter.placeholder || '请输入'"
                  style="width: 150px;" />

                <nz-range-picker
                  *ngIf="filter.type === 'dateRange'"
                  [(ngModel)]="searchParams[filter.field]"
                  style="width: 250px;">
                </nz-range-picker>
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-control>
                <button nz-button nzType="primary" (click)="search()">
                  <span nz-icon nzType="search"></span>
                  查询
                </button>
                <button nz-button (click)="reset()" style="margin-left: 8px;">
                  重置
                </button>
              </nz-form-control>
            </nz-form-item>
          </form>
        </div>

        <!-- Data Table -->
        <nz-table
          #lookupTable
          [nzData]="data"
          [nzTotal]="totalCount"
          [(nzPageIndex)]="pageIndex"
          [(nzPageSize)]="pageSize"
          [nzShowSizeChanger]="true"
          [nzFrontPagination]="false"
          (nzQueryParams)="onQueryParamsChange($event)">
          <thead>
            <tr>
              <th
                *ngIf="isMultiSelect"
                nzWidth="50px"
                nzAlign="center">
                <label nz-checkbox
                       [(ngModel)]="allChecked"
                       (ngModelChange)="checkAll($event)"
                       [nzIndeterminate]="indeterminate">
                </label>
              </th>
              <th
                *ngFor="let col of visibleColumns"
                [nzWidth]="col.width"
                [nzAlign]="col.align || 'left'">
                {{ col.headerName }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of lookupTable.data"
                [nzSelected]="isSelected(row)"
                (click)="selectRow(row)">
              <td *ngIf="isMultiSelect" nzAlign="center">
                <label nz-checkbox
                       [(ngModel)]="row._checked"
                       (click)="$event.stopPropagation()">
                </label>
              </td>
              <td *ngFor="let col of visibleColumns" [nzAlign]="col.align || 'left'">
                {{ row[col.field] }}
              </td>
            </tr>
          </tbody>
        </nz-table>
      </ng-container>
    </nz-modal>
  `,
  styles: [`
    .lookup-search {
      padding: 16px;
      background: #fafafa;
      border-radius: 4px;
    }
  `]
})
export class LookupModalComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() title: string = '选择';
  @Input() apiUrl: string = '';
  @Input() schemes: LookupConfigScheme[] = [];
  @Input() isMultiSelect: boolean = false;
  @Input() valueField: string = 'id';
  @Input() displayField: string = 'name';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() selectChange = new EventEmitter<any | any[]>();

  data: any[] = [];
  totalCount = 0;
  pageIndex = 1;
  pageSize = 10;
  loading = false;

  searchParams: Record<string, any> = {};
  searchFilters: LookupSearchFilter[] = [];
  columns: LookupColumnConfig[] = [];

  selectedRows: any[] = [];

  allChecked = false;
  indeterminate = false;

  get visibleColumns(): LookupColumnConfig[] {
    return this.columns.filter(col => col.visible);
  }

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    if (!this.apiUrl) return;

    this.loading = true;
    let params = new HttpParams()
      .set('SkipCount', ((this.pageIndex - 1) * this.pageSize).toString())
      .set('MaxResultCount', this.pageSize.toString());

    Object.keys(this.searchParams).forEach(key => {
      if (this.searchParams[key] !== null && this.searchParams[key] !== undefined && this.searchParams[key] !== '') {
        params = params.set(key, this.searchParams[key]);
      }
    });

    this.http.get<{ items: any[]; totalCount: number }>(this.apiUrl, { params }).subscribe({
      next: (result) => {
        this.data = result.items;
        this.totalCount = result.totalCount;
        this.loading = false;

        if (this.isMultiSelect) {
          this.data.forEach(row => {
            row._checked = this.selectedRows.some(r => r[this.valueField] === row[this.valueField]);
          });
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  search(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  reset(): void {
    this.searchParams = {};
    this.search();
  }

  selectRow(row: any): void {
    if (this.isMultiSelect) {
      row._checked = !row._checked;
      if (row._checked) {
        if (!this.selectedRows.some(r => r[this.valueField] === row[this.valueField])) {
          this.selectedRows.push(row);
        }
      } else {
        this.selectedRows = this.selectedRows.filter(r => r[this.valueField] !== row[this.valueField]);
      }
      this.updateCheckStatus();
    } else {
      this.selectedRows = [row];
      this.handleOk();
    }
  }

  isSelected(row: any): boolean {
    return this.selectedRows.some(r => r[this.valueField] === row[this.valueField]);
  }

  checkAll(checked: boolean): void {
    this.data.forEach(row => {
      row._checked = checked;
    });
    this.selectedRows = checked ? [...this.data] : [];
    this.indeterminate = false;
  }

  updateCheckStatus(): void {
    const checkedCount = this.data.filter(row => row._checked).length;
    this.allChecked = checkedCount === this.data.length;
    this.indeterminate = checkedCount > 0 && checkedCount < this.data.length;
  }

  handleOk(): void {
    this.selectChange.emit(this.isMultiSelect ? this.selectedRows : this.selectedRows[0]);
    this.handleCancel();
  }

  handleCancel(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onQueryParamsChange(params: any): void {
    if (params.pageIndex) {
      this.pageIndex = params.pageIndex;
    }
    if (params.pageSize) {
      this.pageSize = params.pageSize;
    }
    this.loadData();
  }
}
