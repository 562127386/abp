import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ConfigSchemeService } from '../../services';
import { FormFieldConfig } from '../../models';

export type ConfigType = 'filter' | 'table' | 'lookup';

@Component({
  selector: 'app-dynamic-config-detail',
  template: `
    <nz-card [nzTitle]="isEdit ? '编辑配置方案' : '新建配置方案'">
      <abp-dynamic-detail-form
        [fields]="formFields"
        [values]="initialValues"
        [submitButtonText]="'保存'"
        [showCancelButton]="true"
        [isEditMode]="isEdit"
        (onSubmit)="handleSubmit($event)"
        (onCancel)="handleCancel()">
      </abp-dynamic-detail-form>
    </nz-card>
  `
})
export class DynamicConfigDetailComponent implements OnInit, OnChanges {
  @Input() configType: ConfigType = 'filter';
  @Input() id: string = '';
  @Input() entityName: string = '';

  @Output() onSaved = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();

  formFields: FormFieldConfig[] = [];
  initialValues: Record<string, any> = {};
  isEdit: boolean = false;

  constructor(
    private fb: FormBuilder,
    private configSchemeService: ConfigSchemeService,
    private message: NzMessageService
  ) {
    this.initFormFields();
  }

  ngOnInit(): void {
    this.isEdit = !!this.id;
    if (this.isEdit) {
      this.loadData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id'] && !changes['id'].firstChange) {
      this.isEdit = !!this.id;
      if (this.isEdit) {
        this.loadData();
      }
    }
  }

  private initFormFields(): void {
    this.formFields = [
      {
        key: 'schemeName',
        label: '方案名称',
        type: 'text',
        required: true,
        placeholder: '请输入方案名称',
        validation: [
          { type: 'required', message: '方案名称不能为空' },
          { type: 'maxLength', value: 100, message: '最多100个字符' }
        ],
        order: 1
      },
      {
        key: 'entityName',
        label: '实体名称',
        type: 'text',
        required: true,
        placeholder: '请输入实体名称',
        order: 2
      },
      {
        key: 'description',
        label: '描述',
        type: 'textarea',
        placeholder: '请输入描述',
        order: 3,
        colSpan: 2
      },
      {
        key: 'isPublic',
        label: '公共方案',
        type: 'switch',
        defaultValue: false,
        order: 4
      },
      {
        key: 'isDefault',
        label: '默认方案',
        type: 'switch',
        defaultValue: false,
        order: 5
      }
    ];
  }

  private loadData(): void {
    if (!this.id) return;

    let loadObservable;
    if (this.configType === 'filter') {
      loadObservable = this.configSchemeService.getFilterScheme(this.id);
    } else if (this.configType === 'table') {
      loadObservable = this.configSchemeService.getTableScheme(this.id);
    } else {
      loadObservable = this.configSchemeService.getLookupScheme(this.id);
    }

    loadObservable.subscribe({
      next: (data) => {
        this.initialValues = data as any;
      },
      error: () => {
        this.message.error('加载数据失败');
      }
    });
  }

  handleSubmit(values: any): void {
    let saveObservable;

    if (this.configType === 'filter') {
      saveObservable = this.isEdit
        ? this.configSchemeService.updateFilterScheme(this.id, values)
        : this.configSchemeService.createFilterScheme(values);
    } else if (this.configType === 'table') {
      saveObservable = this.isEdit
        ? this.configSchemeService.updateTableScheme(this.id, values)
        : this.configSchemeService.createTableScheme(values);
    } else {
      saveObservable = this.isEdit
        ? this.configSchemeService.updateLookupScheme(this.id, values)
        : this.configSchemeService.createLookupScheme(values);
    }

    saveObservable.subscribe({
      next: () => {
        this.message.success('保存成功');
        this.onSaved.emit(values);
      },
      error: () => {
        this.message.error('保存失败');
      }
    });
  }

  handleCancel(): void {
    this.onCancel.emit();
  }
}
