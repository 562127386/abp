import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LookupConfigScheme, LookupColumnConfig, LookupSearchFilter } from '../../models';

@Component({
  selector: 'abp-lookup-select',
  template: `
    <nz-select
      [ngModel]="value"
      (ngModelChange)="onValueChange($event)"
      [nzShowSearch]="true"
      [nzServerSearch]="serverSearch"
      (nzOnSearch)="onSearch($event)"
      [nzDisabled]="disabled"
      [nzPlaceHolder]="placeholder"
      [nzMode]="isMulti ? 'multiple' : 'default'"
      [nzAllowClear]="true"
      (nzOpenChange)="onOpenChange($event)"
      style="width: 100%;">
      <nz-option
        *ngFor="let option of options"
        [nzValue]="option[valueField]"
        [nzLabel]="option[displayField]">
      </nz-option>
      <nz-option *ngIf="loading" nzDisabled nzCustomContent>
        <span nz-icon nzType="loading" class="loading-icon"></span>
        加载中...
      </nz-option>
    </nz-select>
  `,
  styles: [`
    .loading-icon {
      display: inline-block;
      animation: rotating 1s linear infinite;
    }
    @keyframes rotating {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class LookupSelectComponent implements OnInit, OnChanges {
  @Input() value: any | any[] = null;
  @Input() apiUrl: string = '';
  @Input() displayField: string = 'name';
  @Input() valueField: string = 'id';
  @Input() placeholder: string = '请选择';
  @Input() disabled: boolean = false;
  @Input() isMulti: boolean = false;
  @Input() serverSearch: boolean = true;
  @Input() params: Record<string, any> = {};

  @Output() valueChange = new EventEmitter<any | any[]>();

  options: any[] = [];
  loading = false;
  searchValue = '';

  private lastSearchValue = '';

  ngOnInit(): void {
    if (!this.serverSearch && this.apiUrl) {
      this.loadOptions();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && !changes['value'].firstChange) {
      if (this.value && !this.serverSearch) {
        this.loadSelectedValue();
      }
    }
  }

  onSearch(value: string): void {
    this.searchValue = value;

    if (value !== this.lastSearchValue) {
      this.lastSearchValue = value;
      this.loadOptions();
    }
  }

  onValueChange(value: any | any[]): void {
    this.valueChange.emit(value);
  }

  onOpenChange(open: boolean): void {
    if (open && this.options.length === 0) {
      this.loadOptions();
    }
  }

  private loadOptions(): void {
    if (!this.apiUrl) return;

    this.loading = true;
    let params = new HttpParams();

    if (this.searchValue) {
      params = params.set('Filter', this.searchValue);
      params = params.set(`${this.displayField}.contains`, this.searchValue);
    }

    Object.keys(this.params).forEach(key => {
      params = params.set(key, this.params[key]);
    });

    this.http.get<{ items: any[] }>(this.apiUrl, { params }).subscribe({
      next: (response) => {
        this.options = response.items || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private loadSelectedValue(): void {
    if (!this.value || !this.apiUrl) return;

    const ids = Array.isArray(this.value) ? this.value : [this.value];
    if (ids.length === 0) return;

    let params = new HttpParams();
    params = params.set('ids', ids.join(','));

    this.http.get<{ items: any[] }>(this.apiUrl, { params }).subscribe({
      next: (response) => {
        this.options = response.items || [];
      }
    });
  }
}

@Component({
  selector: 'abp-lookup-typeahead',
  template: `
    <nz-autocomplete
      [nzDataSource]="filteredData"
      [nzBackfill]="true"
      (nzSelect)="onSelect($event)"
      (nzSearch)="onSearch($event)"
      [nzDisabled]="disabled"
      style="width: 100%;">
      <nz-auto-option
        *ngFor="let item of filteredData"
        [nzValue]="item[valueField]"
        [nzLabel]="item[displayField]">
        {{ item[displayField] }}
      </nz-auto-option>
    </nz-autocomplete>
  `
})
export class LookupTypeaheadComponent implements OnInit {
  @Input() value: any = null;
  @Input() apiUrl: string = '';
  @Input() displayField: string = 'name';
  @Input() valueField: string = 'id';
  @Input() placeholder: string = '请输入搜索';
  @Input() disabled: boolean = false;
  @Input() minChars: number = 2;

  @Output() valueChange = new EventEmitter<any>();

  filteredData: any[] = [];
  private searchSubject: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (this.value) {
      this.loadSelectedValue();
    }
  }

  onSearch(value: string): void {
    if (value.length < this.minChars) {
      this.filteredData = [];
      return;
    }

    this.search(value);
  }

  onSelect(event: any): void {
    const selected = this.filteredData.find(item => item[this.valueField] === event.nzValue);
    if (selected) {
      this.valueChange.emit(selected);
    }
  }

  private search(value: string): void {
    if (!this.apiUrl) return;

    let params = new HttpParams();
    params = params.set('Filter', value);
    params = params.set(`${this.displayField}.contains`, value);

    this.http.get<{ items: any[] }>(this.apiUrl, { params }).subscribe({
      next: (response) => {
        this.filteredData = response.items || [];
      }
    });
  }

  private loadSelectedValue(): void {
    if (!this.value || !this.apiUrl) return;

    const params = new HttpParams().set('id', this.value);

    this.http.get<any>(this.apiUrl, { params }).subscribe({
      next: (item) => {
        this.filteredData = item ? [item] : [];
      }
    });
  }
}
