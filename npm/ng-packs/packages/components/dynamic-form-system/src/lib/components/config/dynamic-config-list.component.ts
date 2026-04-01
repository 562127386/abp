import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ConfigSchemeService } from '../../services';
import {
  FilterConfigScheme,
  TableConfigScheme,
  LookupConfigScheme,
  ColumnConfig,
  QueryParams,
  PagedResult
} from '../../models';

export type ConfigType = 'filter' | 'table' | 'lookup';

@Component({
  selector: 'app-dynamic-config-list',
  template: `
    <nz-card [nzBordered]="false">
      <!-- Filter Section -->
      <nz-collapse nzBordered="false">
        <nz-collapse-panel nzHeader="查询条件" [nzActive]="true">
          <form nz-form [nzLayout]="'inline'" (ngSubmit)="search()">
            <nz-form-item>
              <nz-form-label>方案名称</nz-form-label>
              <nz-form-control>
                <input nz-input [(ngModel)]="filterParams.name" name="name" placeholder="请输入方案名称" style="width: 150px;" />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label>是否公共</nz-form-label>
              <nz-form-control>
                <nz-select [(ngModel)]="filterParams.isPublic" name="isPublic" style="width: 100px;" nzAllowClear>
                  <nz-option [nzValue]="true" nzLabel="是"></nz-option>
                  <nz-option [nzValue]="false" nzLabel="否"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-control>
                <button nz-button nzType="primary" type="submit">
                  <span nz-icon nzType="search"></span>
                  查询
                </button>
                <button nz-button type="button" (click)="reset()" style="margin-left: 8px;">重置</button>
              </nz-form-control>
            </nz-form-item>
          </form>
        </nz-collapse-panel>
      </nz-collapse>

      <!-- Table Toolbar -->
      <div class="table-toolbar">
        <button nz-button nzType="primary" (click)="create()">
          <span nz-icon nzType="plus"></span>
          新建方案
        </button>
        <button nz-button (click)="refresh()">
          <span nz-icon nzType="reload"></span>
          刷新
        </button>
      </div>

      <!-- Data Table -->
      <nz-table
        #nzTable
        [nzData]="data"
        [nzTotal]="totalCount"
        [(nzPageIndex)]="pageIndex"
        [(nzPageSize)]="pageSize"
        [nzPageSizeOptions]="[10, 20, 50, 100]"
        [nzLoading]="loading"
        (nzQueryParams)="onQueryParamsChange($event)">
        <thead>
          <tr>
            <th nzWidth="25%">方案名称</th>
            <th nzWidth="20%">实体名称</th>
            <th nzWidth="15%">类型</th>
            <th nzWidth="10%">默认</th>
            <th nzWidth="15%">创建时间</th>
            <th nzWidth="15%">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of nzTable.data">
            <td>{{ row.schemeName || row.name }}</td>
            <td>{{ row.entityName }}</td>
            <td>
              <nz-tag [nzColor]="row.isPublic ? 'blue' : 'default'">
                {{ row.isPublic ? '公共' : '私有' }}
              </nz-tag>
            </td>
            <td>
              <nz-tag *ngIf="row.isDefault" nzColor="green">默认</nz-tag>
            </td>
            <td>{{ row.createdAt | date: 'yyyy-MM-dd HH:mm' }}</td>
            <td>
              <button nz-button nzType="link" (click)="edit(row)">编辑</button>
              <button nz-button nzType="link" (click)="clone(row)">克隆</button>
              <button
                nz-button
                nzType="link"
                nzDanger
                [disabled]="row.isDefault"
                (click)="delete(row)">
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </nz-card>
  `,
  styles: [`
    .table-toolbar {
      margin: 16px 0;
      display: flex;
      gap: 8px;
    }
  `]
})
export class DynamicConfigListComponent implements OnInit {
  @Input() configType: ConfigType = 'filter';
  @Input() entityName: string = '';

  @Output() onCreate = new EventEmitter<void>();
  @Output() onEdit = new EventEmitter<any>();

  data: any[] = [];
  totalCount = 0;
  pageIndex = 1;
  pageSize = 10;
  loading = false;

  filterParams: { name?: string; isPublic?: boolean } = {};

  constructor(
    private router: Router,
    private configSchemeService: ConfigSchemeService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    const loadObservable = this.configType === 'filter'
      ? this.configSchemeService.getFilterSchemes(this.entityName)
      : this.configType === 'table'
        ? this.configSchemeService.getTableSchemes(this.entityName)
        : this.configSchemeService.getLookupSchemes(this.entityName);

    loadObservable.subscribe({
      next: (result) => {
        this.data = result as any[];
        this.totalCount = this.data.length;
        this.loading = false;
      },
      error: () => {
        this.message.error('加载数据失败');
        this.loading = false;
      }
    });
  }

  search(): void {
    this.pageIndex = 1;
    this.loadData();
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

  clone(row: any): void {
    const cloned = {
      ...row,
      id: '',
      schemeName: row.schemeName ? row.schemeName + '(副本)' : row.name + '(副本)',
      isDefault: false,
      createdAt: undefined
    };

    if (this.configType === 'filter') {
      this.configSchemeService.createFilterScheme(cloned).subscribe({
        next: () => {
          this.message.success('克隆成功');
          this.loadData();
        },
        error: () => this.message.error('克隆失败')
      });
    } else if (this.configType === 'table') {
      this.configSchemeService.createTableScheme(cloned).subscribe({
        next: () => {
          this.message.success('克隆成功');
          this.loadData();
        },
        error: () => this.message.error('克隆失败')
      });
    } else {
      this.configSchemeService.createLookupScheme(cloned).subscribe({
        next: () => {
          this.message.success('克隆成功');
          this.loadData();
        },
        error: () => this.message.error('克隆失败')
      });
    }
  }

  delete(row: any): void {
    if (this.configType === 'filter') {
      this.configSchemeService.deleteFilterScheme(row.id).subscribe({
        next: () => {
          this.message.success('删除成功');
          this.loadData();
        },
        error: () => this.message.error('删除失败')
      });
    } else if (this.configType === 'table') {
      this.configSchemeService.deleteTableScheme(row.id).subscribe({
        next: () => {
          this.message.success('删除成功');
          this.loadData();
        },
        error: () => this.message.error('删除失败')
      });
    } else {
      this.configSchemeService.deleteLookupScheme(row.id).subscribe({
        next: () => {
          this.message.success('删除成功');
          this.loadData();
        },
        error: () => this.message.error('删除失败')
      });
    }
  }

  onQueryParamsChange(params: any): void {
    if (params.pageIndex) this.pageIndex = params.pageIndex;
    if (params.pageSize) this.pageSize = params.pageSize;
    this.loadData();
  }
}
