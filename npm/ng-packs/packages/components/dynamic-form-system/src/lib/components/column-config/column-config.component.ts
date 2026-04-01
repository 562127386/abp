import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ColumnConfig, TableConfigScheme } from '../../models';

@Component({
  selector: 'abp-column-config',
  template: `
    <nz-modal
      [(nzVisible)]="visible"
      nzTitle="表格列配置"
      [nzWidth]="700"
      [nzOkText]="'确定'"
      [nzCancelText]="'取消'"
      (nzOnCancel)="handleCancel()"
      (nzOnOk)="handleOk()">
      <ng-container *nzModalContent>
        <nz-tabset>
          <nz-tab nzTitle="列设置">
            <div class="column-list">
              <div
                *ngFor="let col of columns; let i = index"
                class="column-item"
                cdkDrag
                cdkDropList
                (cdkDropListDropped)="drop($event)">
                <div class="drag-handle" cdkDragHandle>
                  <span nz-icon nzType="holder"></span>
                </div>
                <div class="column-content">
                  <div class="column-row">
                    <span class="column-field">{{ col.field }}</span>
                    <input
                      nz-input
                      [(ngModel)]="col.headerName"
                      placeholder="显示名称"
                      style="width: 120px;" />
                    <nz-input-number
                      [(ngModel)]="col.width"
                      [nzMin]="50"
                      [nzMax]="500"
                      placeholder="宽度"
                      style="width: 80px;">
                    </nz-input-number>
                    <nz-select [(ngModel)]="col.align" style="width: 80px;">
                      <nz-option nzValue="left" nzLabel="左"></nz-option>
                      <nz-option nzValue="center" nzLabel="中"></nz-option>
                      <nz-option nzValue="right" nzLabel="右"></nz-option>
                    </nz-select>
                    <nz-switch [(ngModel)]="col.visible" nzSize="small"></nz-switch>
                    <span>显示</span>
                    <nz-switch [(ngModel)]="col.sortable" nzSize="small"></nz-switch>
                    <span>排序</span>
                  </div>
                </div>
                <button nz-button nzType="text" nzDanger (click)="removeColumn(i)">
                  <span nz-icon nzType="delete"></span>
                </button>
              </div>
            </div>
          </nz-tab>

          <nz-tab nzTitle="方案管理">
            <div class="scheme-management">
              <div class="scheme-actions" style="margin-bottom: 16px;">
                <button nz-button nzType="primary" (click)="createScheme()">
                  <span nz-icon nzType="plus"></span>
                  新建方案
                </button>
              </div>

              <nz-table
                #schemeTable
                [nzData]="schemes"
                [nzShowPagination]="false"
                nzSize="small">
                <thead>
                  <tr>
                    <th nzWidth="30%">方案名称</th>
                    <th nzWidth="15%">类型</th>
                    <th nzWidth="15%">默认</th>
                    <th nzWidth="40%">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let scheme of schemeTable.data">
                    <td>{{ scheme.name }}</td>
                    <td>
                      <nz-tag [nzColor]="scheme.isPublic ? 'blue' : 'default'">
                        {{ scheme.isPublic ? '公共' : '私有' }}
                      </nz-tag>
                    </td>
                    <td>
                      <nz-switch
                        [(ngModel)]="scheme.isDefault"
                        (ngModelChange)="setAsDefault(scheme)">
                      </nz-switch>
                    </td>
                    <td>
                      <button nz-button nzType="link" (click)="editScheme(scheme)">编辑</button>
                      <button nz-button nzType="link" (click)="cloneScheme(scheme)">克隆</button>
                      <button
                        nz-button
                        nzType="link"
                        nzDanger
                        [disabled]="scheme.isDefault"
                        (click)="deleteScheme(scheme)">
                        删除
                      </button>
                    </td>
                  </tr>
                </tbody>
              </nz-table>
            </div>
          </nz-tab>
        </nz-tabset>
      </ng-container>
    </nz-modal>
  `,
  styles: [`
    .column-list {
      max-height: 400px;
      overflow-y: auto;
    }
    .column-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background: #fafafa;
      border-radius: 4px;
      margin-bottom: 8px;
    }
    .drag-handle {
      cursor: move;
      color: #999;
    }
    .column-content {
      flex: 1;
    }
    .column-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .column-field {
      font-weight: 500;
      min-width: 100px;
    }
  `]
})
export class ColumnConfigComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() columns: ColumnConfig[] = [];
  @Input() schemes: TableConfigScheme[] = [];
  @Input() entityName: string = '';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() columnsChange = new EventEmitter<ColumnConfig[]>();
  @Output() schemeChange = new EventEmitter<{ type: 'save' | 'delete' | 'default'; scheme?: TableConfigScheme }>();

  ngOnInit(): void {
    if (this.columns.length === 0) {
      this.initDefaultColumns();
    }
  }

  private initDefaultColumns(): void {
    this.columns = [
      { field: 'id', headerName: 'ID', width: 80, sortable: true, visible: true, order: 1 },
      { field: 'name', headerName: '名称', width: 200, sortable: true, visible: true, order: 2 },
      { field: 'code', headerName: '编码', width: 120, sortable: true, visible: true, order: 3 },
      { field: 'creationTime', headerName: '创建时间', width: 150, sortable: true, visible: true, order: 4 },
    ];
  }

  drop(event: CdkDragDrop<ColumnConfig[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
    this.columns.forEach((col, index) => {
      col.order = index + 1;
    });
  }

  removeColumn(index: number): void {
    this.columns.splice(index, 1);
  }

  handleCancel(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  handleOk(): void {
    this.columnsChange.emit(this.columns);
    this.visible = false;
    this.visibleChange.emit(false);
  }

  createScheme(): void {
    const newScheme: TableConfigScheme = {
      id: '',
      name: '新方案',
      entityName: this.entityName,
      isPublic: false,
      columns: [...this.columns],
      pageSize: 10,
      pageSizeOptions: [10, 20, 50, 100],
      isDefault: false
    };
    this.schemeChange.emit({ type: 'save', scheme: newScheme });
  }

  editScheme(scheme: TableConfigScheme): void {
    this.columns = [...scheme.columns];
  }

  cloneScheme(scheme: TableConfigScheme): void {
    const cloned: TableConfigScheme = {
      ...scheme,
      id: '',
      name: scheme.name + '(副本)',
      isDefault: false,
      columns: [...scheme.columns]
    };
    this.schemeChange.emit({ type: 'save', scheme: cloned });
  }

  deleteScheme(scheme: TableConfigScheme): void {
    this.schemeChange.emit({ type: 'delete', scheme });
  }

  setAsDefault(scheme: TableConfigScheme): void {
    this.schemeChange.emit({ type: 'default', scheme });
  }
}
