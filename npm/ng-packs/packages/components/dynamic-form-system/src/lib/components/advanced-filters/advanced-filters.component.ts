import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FilterConfig, FilterOperator, QueryParams } from '../../models';

export interface FilterItem {
  field: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'datetime' | 'select' | 'dateRange' | 'boolean';
  placeholder?: string;
  options?: { label: string; value: any }[];
  defaultOperator?: FilterOperator;
}

@Component({
  selector: 'abp-advanced-filters',
  template: `
    <div class="advanced-filters">
      <nz-collapse nzBordered="false">
        <nz-collapse-panel nzHeader="高级查询" [nzActive]="isExpanded">
          <div class="filter-container">
            <div class="filter-groups">
              <nz-card *ngFor="let group of filterGroups" nzSize="small" style="margin-bottom: 8px;">
                <div class="filter-group-header">
                  <span>{{ group.label }}</span>
                  <button nz-button nzType="link" nzSize="small" (click)="addFilter(group)">
                    <span nz-icon nzType="plus"></span>
                  </button>
                </div>

                <div class="filter-items">
                  <div *ngFor="let filter of group.filters; let i = index" class="filter-item">
                    <nz-select
                      [(ngModel)]="filter.field"
                      (ngModelChange)="onFieldChange(filter)"
                      style="width: 120px;">
                      <nz-option
                        *ngFor="let field of group.availableFields"
                        [nzValue]="field.field"
                        [nzLabel]="field.label">
                      </nz-option>
                    </nz-select>

                    <nz-select
                      [(ngModel)]="filter.operator"
                      style="width: 100px;">
                      <nz-option nzValue="eq" nzLabel="等于"></nz-option>
                      <nz-option nzValue="ne" nzLabel="不等于"></nz-option>
                      <nz-option nzValue="contains" nzLabel="包含"></nz-option>
                      <nz-option nzValue="startsWith" nzLabel="开头是"></nz-option>
                      <nz-option nzValue="endsWith" nzLabel="结尾是"></nz-option>
                      <nz-option nzValue="gt" nzLabel="大于"></nz-option>
                      <nz-option nzValue="ge" nzLabel="大于等于"></nz-option>
                      <nz-option nzValue="lt" nzLabel="小于"></nz-option>
                      <nz-option nzValue="le" nzLabel="小于等于"></nz-option>
                    </nz-select>

                    <!-- Text Input -->
                    <input
                      *ngIf="getFilterType(filter.field, group) === 'text'"
                      nz-input
                      [(ngModel)]="filter.value"
                      [placeholder]="'请输入'"
                      style="width: 150px;" />

                    <!-- Number Input -->
                    <nz-input-number
                      *ngIf="getFilterType(filter.field, group) === 'number'"
                      [(ngModel)]="filter.value"
                      [placeholder]="'请输入'"
                      style="width: 150px;">
                    </nz-input-number>

                    <!-- Select -->
                    <nz-select
                      *ngIf="getFilterType(filter.field, group) === 'select'"
                      [(ngModel)]="filter.value"
                      [placeholder]="'请选择'"
                      style="width: 150px;">
                      <nz-option
                        *ngFor="let opt of getFieldOptions(filter.field, group)"
                        [nzValue]="opt.value"
                        [nzLabel]="opt.label">
                      </nz-option>
                    </nz-select>

                    <!-- Date Picker -->
                    <nz-date-picker
                      *ngIf="getFilterType(filter.field, group) === 'date'"
                      [(ngModel)]="filter.value"
                      style="width: 150px;">
                    </nz-date-picker>

                    <!-- Date Range Picker -->
                    <nz-range-picker
                      *ngIf="getFilterType(filter.field, group) === 'dateRange'"
                      [(ngModel)]="filter.value"
                      style="width: 250px;">
                    </nz-range-picker>

                    <!-- Boolean -->
                    <nz-select
                      *ngIf="getFilterType(filter.field, group) === 'boolean'"
                      [(ngModel)]="filter.value"
                      style="width: 150px;">
                      <nz-option nzValue="true" nzLabel="是"></nz-option>
                      <nz-option nzValue="false" nzLabel="否"></nz-option>
                    </nz-select>

                    <button nz-button nzType="text" nzDanger (click)="removeFilter(group, i)">
                      <span nz-icon nzType="delete"></span>
                    </button>
                  </div>
                </div>
              </nz-card>
            </div>

            <div class="filter-actions">
              <button nz-button nzType="primary" (click)="search()">
                <span nz-icon nzType="search"></span>
                查询
              </button>
              <button nz-button (click)="reset()">
                重置
              </button>
              <button nz-button nz-dropdown [nzDropdownMenu]="saveMenu">
                <span nz-icon nzType="save"></span>
                保存方案
              </button>
              <nz-dropdown-menu #saveMenu="nzDropdownMenu">
                <ul nz-menu>
                  <li nz-menu-item (click)="openSaveSchemeDialog('private')">保存为私有方案</li>
                  <li nz-menu-item (click)="openSaveSchemeDialog('public')">保存为公共方案</li>
                </ul>
              </nz-dropdown-menu>
              <button nz-button nz-dropdown [nzDropdownMenu]="loadMenu">
                <span nz-icon nzType="folder-open"></span>
                加载方案
              </button>
              <nz-dropdown-menu #loadMenu="nzDropdownMenu">
                <ul nz-menu>
                  <li nz-menu-item *ngFor="let scheme of filterSchemes" (click)="loadScheme(scheme)">
                    {{ scheme.name }}
                    <nz-tag *ngIf="scheme.isDefault" nzColor="blue">默认</nz-tag>
                    <nz-tag *ngIf="scheme.isPublic" nzColor="green">公共</nz-tag>
                  </li>
                </ul>
              </nz-dropdown-menu>
            </div>
          </div>
        </nz-collapse-panel>
      </nz-collapse>

      <!-- Save Scheme Dialog -->
      <nz-modal
        [(nzVisible)]="saveDialogVisible"
        nzTitle="保存查询方案"
        (nzOnCancel)="saveDialogVisible = false"
        (nzOnOk)="saveScheme()">
        <ng-container *nzModalContent>
          <nz-form-item>
            <nz-form-label>方案名称</nz-form-label>
            <nz-form-control>
              <input nz-input [(ngModel)]="newSchemeName" placeholder="请输入方案名称" />
            </nz-form-control>
          </nz-form-item>
        </ng-container>
      </nz-modal>
    </div>
  `,
  styles: [`
    .advanced-filters {
      margin-bottom: 16px;
    }
    .filter-container {
      padding: 8px 0;
    }
    .filter-groups {
      margin-bottom: 16px;
    }
    .filter-group-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-weight: 500;
    }
    .filter-items {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .filter-item {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .filter-actions {
      display: flex;
      gap: 8px;
    }
  `]
})
export class AdvancedFiltersComponent implements OnInit, OnDestroy {
  @Input() entityName: string = '';
  @Input() filterItems: FilterItem[] = [];
  @Input() filterSchemes: any[] = [];
  @Input() isExpanded: boolean = true;

  @Output() filterChange = new EventEmitter<FilterConfig[]>();
  @Output() schemeChange = new EventEmitter<{ type: 'save' | 'load'; scheme?: any }>();

  filterGroups: {
    label: string;
    filters: FilterConfig[];
    availableFields: FilterItem[];
  }[] = [];

  saveDialogVisible = false;
  newSchemeName = '';
  newSchemeType: 'private' | 'public' = 'private';

  private searchSubject = new Subject<FilterConfig[]>();
  private subscription?: Subscription;

  ngOnInit(): void {
    this.initFilterGroup();

    this.subscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    ).subscribe(filters => {
      this.filterChange.emit(filters);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private initFilterGroup(): void {
    this.filterGroups = [
      {
        label: '查询条件',
        filters: [],
        availableFields: this.filterItems
      }
    ];
  }

  getFilterType(field: string, group: any): string {
    const filterItem = group.availableFields.find((f: FilterItem) => f.field === field);
    return filterItem?.type || 'text';
  }

  getFieldOptions(field: string, group: any): { label: string; value: any }[] {
    const filterItem = group.availableFields.find((f: FilterItem) => f.field === field);
    return filterItem?.options || [];
  }

  onFieldChange(filter: FilterConfig): void {
    filter.value = null;
  }

  addFilter(group: any): void {
    group.filters.push({
      field: group.availableFields[0]?.field || '',
      operator: 'eq',
      value: null,
      logic: 'and'
    });
  }

  removeFilter(group: any, index: number): void {
    group.filters.splice(index, 1);
  }

  search(): void {
    const filters = this.filterGroups
      .flatMap(g => g.filters)
      .filter(f => f.field && f.value !== null && f.value !== undefined);

    this.searchSubject.next(filters);
  }

  reset(): void {
    this.filterGroups.forEach(group => {
      group.filters = [];
    });
    this.search();
  }

  openSaveSchemeDialog(type: 'private' | 'public'): void {
    this.newSchemeType = type;
    this.newSchemeName = '';
    this.saveDialogVisible = true;
  }

  saveScheme(): void {
    const filters = this.filterGroups
      .flatMap(g => g.filters)
      .filter(f => f.field && f.value !== null);

    this.schemeChange.emit({
      type: 'save',
      scheme: {
        name: this.newSchemeName,
        isPublic: this.newSchemeType === 'public',
        filters: filters
      }
    });

    this.saveDialogVisible = false;
  }

  loadScheme(scheme: any): void {
    const filters = scheme.filters || [];
    this.filterGroups[0].filters = [...filters];
    this.schemeChange.emit({
      type: 'load',
      scheme: scheme
    });
    this.search();
  }
}
