import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LookupConfigScheme, LookupColumnConfig, LookupSearchFilter, SearchFilterType, FilterOperator } from '../../models';

@Component({
  selector: 'abp-lookup-config',
  template: `
    <nz-modal
      [(nzVisible)]="visible"
      [nzTitle]="isEdit ? '编辑Lookup方案' : '新建Lookup方案'"
      [nzWidth]="900"
      [nzOkText]="'确定'"
      [nzCancelText]="'取消'"
      [nzOkLoading]="saving"
      (nzOnCancel)="handleCancel()"
      (nzOnOk)="handleOk()">
      <ng-container *nzModalContent>
        <nz-form-item>
          <nz-form-label [nzRequired]="true">方案名称</nz-form-label>
          <nz-form-control>
            <input nz-input [(ngModel)]="currentScheme.schemeName" placeholder="请输入方案名称" />
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label>描述</nz-form-label>
          <nz-form-control>
            <textarea nz-input [(ngModel)]="currentScheme.description" placeholder="请输入描述" rows="2"></textarea>
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label>是否公共方案</nz-form-label>
          <nz-form-control>
            <nz-switch [(ngModel)]="currentScheme.isPublic"></nz-switch>
          </nz-form-control>
        </nz-form-item>

        <nz-divider nzText="列配置"></nz-divider>

        <div class="column-config">
          <div class="config-header">
            <button nz-button nzType="primary" nzSize="small" (click)="addColumn()">
              <span nz-icon nzType="plus"></span>
              添加列
            </button>
          </div>

          <nz-table
            #columnTable
            [nzData]="currentScheme.columns"
            [nzShowPagination]="false"
            nzSize="small">
            <thead>
              <tr>
                <th nzWidth="30px"></th>
                <th nzWidth="25%">字段</th>
                <th nzWidth="25%">列名</th>
                <th nzWidth="15%">宽度</th>
                <th nzWidth="10%">可见</th>
                <th nzWidth="10%">排序</th>
                <th nzWidth="50px">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let col of columnTable.data; let i = index">
                <td><span nz-icon nzType="holder"></span></td>
                <td>
                  <nz-select [(ngModel)]="col.field" style="width: 100%;">
                    <nz-option
                      *ngFor="let field of availableFields"
                      [nzValue]="field"
                      [nzLabel]="field">
                    </nz-option>
                  </nz-select>
                </td>
                <td>
                  <input nz-input [(ngModel)]="col.headerName" />
                </td>
                <td>
                  <nz-input-number [(ngModel)]="col.width" [nzMin]="50" [nzMax]="300" style="width: 100%;"></nz-input-number>
                </td>
                <td>
                  <nz-switch [(ngModel)]="col.visible" nzSize="small"></nz-switch>
                </td>
                <td>
                  <nz-input-number [(ngModel)]="col.order" [nzMin]="0" nzSize="small" style="width: 100%;"></nz-input-number>
                </td>
                <td>
                  <button nz-button nzType="text" nzDanger nzSize="small" (click)="removeColumn(i)">
                    <span nz-icon nzType="delete"></span>
                  </button>
                </td>
              </tr>
            </tbody>
          </nz-table>
        </div>

        <nz-divider nzText="搜索条件配置"></nz-divider>

        <div class="filter-config">
          <div class="config-header">
            <button nz-button nzType="primary" nzSize="small" (click)="addFilter()">
              <span nz-icon nzType="plus"></span>
              添加搜索条件
            </button>
          </div>

          <nz-table
            #filterTable
            [nzData]="currentScheme.searchFilters"
            [nzShowPagination]="false"
            nzSize="small">
            <thead>
              <tr>
                <th nzWidth="25%">字段</th>
                <th nzWidth="25%">标签</th>
                <th nzWidth="20%">类型</th>
                <th nzWidth="10%">顺序</th>
                <th nzWidth="10%">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let filter of filterTable.data; let i = index">
                <td>
                  <nz-select [(ngModel)]="filter.field" style="width: 100%;">
                    <nz-option
                      *ngFor="let field of availableFields"
                      [nzValue]="field"
                      [nzLabel]="field">
                    </nz-option>
                  </nz-select>
                </td>
                <td>
                  <input nz-input [(ngModel)]="filter.label" />
                </td>
                <td>
                  <nz-select [(ngModel)]="filter.type" style="width: 100%;">
                    <nz-option nzValue="text" nzLabel="文本"></nz-option>
                    <nz-option nzValue="number" nzLabel="数字"></nz-option>
                    <nz-option nzValue="select" nzLabel="下拉"></nz-option>
                    <nz-option nzValue="dateRange" nzLabel="日期范围"></nz-option>
                  </nz-select>
                </td>
                <td>
                  <nz-input-number [(ngModel)]="filter.order" [nzMin]="0" nzSize="small" style="width: 100%;"></nz-input-number>
                </td>
                <td>
                  <button nz-button nzType="text" nzDanger nzSize="small" (click)="removeFilter(i)">
                    <span nz-icon nzType="delete"></span>
                  </button>
                </td>
              </tr>
            </tbody>
          </nz-table>
        </div>
      </ng-container>
    </nz-modal>
  `,
  styles: [`
    .config-header {
      margin-bottom: 8px;
    }
  `]
})
export class LookupConfigComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() schemes: LookupConfigScheme[] = [];
  @Input() availableFields: string[] = [];
  @Input() entityName: string = '';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() schemeSave = new EventEmitter<LookupConfigScheme>();

  currentScheme: LookupConfigScheme = this.createEmptyScheme();
  isEdit: boolean = false;
  saving = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  createEmptyScheme(): LookupConfigScheme {
    return {
      id: '',
      entityName: this.entityName,
      schemeName: '',
      description: '',
      isDefault: false,
      isPublic: false,
      columns: [],
      searchFilters: []
    };
  }

  editScheme(scheme: LookupConfigScheme): void {
    this.currentScheme = { ...scheme };
    this.isEdit = true;
    this.visible = true;
  }

  addColumn(): void {
    this.currentScheme.columns.push({
      field: this.availableFields[0] || '',
      headerName: '',
      visible: true,
      order: this.currentScheme.columns.length + 1
    });
  }

  removeColumn(index: number): void {
    this.currentScheme.columns.splice(index, 1);
  }

  addFilter(): void {
    this.currentScheme.searchFilters.push({
      field: this.availableFields[0] || '',
      label: '',
      type: 'text',
      order: this.currentScheme.searchFilters.length + 1
    });
  }

  removeFilter(index: number): void {
    this.currentScheme.searchFilters.splice(index, 1);
  }

  handleCancel(): void {
    this.visible = false;
    this.currentScheme = this.createEmptyScheme();
    this.isEdit = false;
    this.visibleChange.emit(false);
  }

  handleOk(): void {
    if (!this.currentScheme.schemeName) {
      return;
    }

    this.saving = true;
    this.schemeSave.emit(this.currentScheme);

    setTimeout(() => {
      this.saving = false;
      this.handleCancel();
    }, 500);
  }
}
