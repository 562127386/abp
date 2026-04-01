import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { FormFieldConfig, ConditionalRule } from '../../models';

@Component({
  selector: 'abp-dynamic-detail-form',
  template: `
    <form nz-form [formGroup]="form" (ngSubmit)="submit()">
      <nz-card [nzTitle]="cardTitle" [nzExtra]="cardExtra">
        <div nz-row [nzGutter]="16">
          <ng-container *ngFor="let field of sortedFields">
            <div
              *ngIf="isFieldVisible(field)"
              [nzSpan]="getColSpan(field)"
              nz-col>
              <nz-form-item>
                <nz-form-label
                  [nzRequired]="field.required"
                  [nzFor]="field.key"
                  [nzSm]="getLabelSpan(field)"
                  [nzXs]="24">
                  {{ field.label }}
                </nz-form-label>
                <nz-form-control
                  [nzSm]="getControlSpan(field)"
                  [nzXs]="24"
                  [nzErrorTip]="getErrorTip(field)">
                  <!-- Text Input -->
                  <input
                    *ngIf="field.type === 'text'"
                    nz-input
                    [formControlName]="field.key"
                    [id]="field.key"
                    [placeholder]="field.placeholder || ''"
                    [disabled]="isFieldDisabled(field)" />

                  <!-- Textarea -->
                  <textarea
                    *ngIf="field.type === 'textarea'"
                    nz-input
                    [formControlName]="field.key"
                    [id]="field.key"
                    [placeholder]="field.placeholder || ''"
                    [disabled]="isFieldDisabled(field)"
                    [nzAutosize]="{ minRows: 2, maxRows: 6 }">
                  </textarea>

                  <!-- Number Input -->
                  <nz-input-number
                    *ngIf="field.type === 'number'"
                    [formControlName]="field.key"
                    [id]="field.key"
                    [placeholder]="field.placeholder || ''"
                    [disabled]="isFieldDisabled(field)"
                    [nzMin]="getValidationValue(field, 'min')"
                    [nzMax]="getValidationValue(field, 'max')"
                    [nzPrecision]="getPrecision(field)"
                    style="width: 100%;">
                  </nz-input-number>

                  <!-- Currency -->
                  <nz-input-number
                    *ngIf="field.type === 'currency'"
                    [formControlName]="field.key"
                    [id]="field.key"
                    [nzPrecision]="2"
                    nzPrefix="¥"
                    style="width: 100%;">
                  </nz-input-number>

                  <!-- Percentage -->
                  <nz-input-number
                    *ngIf="field.type === 'percentage'"
                    [formControlName]="field.key"
                    [id]="field.key"
                    [nzMin]="0"
                    [nzMax]="100"
                    [nzPrecision]="2"
                    nzSuffix="%"
                    style="width: 100%;">
                  </nz-input-number>

                  <!-- Email Input -->
                  <input
                    *ngIf="field.type === 'email'"
                    nz-input
                    type="email"
                    [formControlName]="field.key"
                    [id]="field.key"
                    [placeholder]="field.placeholder || ''"
                    [disabled]="isFieldDisabled(field)" />

                  <!-- Password Input -->
                  <nz-input-group *ngIf="field.type === 'password'" [nzSuffix]="suffixTemplate">
                    <input
                      nz-input
                      [type]="passwordVisible ? 'text' : 'password'"
                      [formControlName]="field.key"
                      [id]="field.key"
                      [placeholder]="field.placeholder || ''"
                      [disabled]="isFieldDisabled(field)" />
                  </nz-input-group>
                  <ng-template #suffixTemplate>
                    <span
                      nz-icon
                      [nzType]="passwordVisible ? 'eye' : 'eye-invisible'"
                      (click)="passwordVisible = !passwordVisible"
                      style="cursor: pointer;">
                    </span>
                  </ng-template>

                  <!-- Date Picker -->
                  <nz-date-picker
                    *ngIf="field.type === 'date'"
                    [formControlName]="field.key"
                    [id]="field.key"
                    [disabled]="isFieldDisabled(field)"
                    style="width: 100%;">
                  </nz-date-picker>

                  <!-- DateTime Picker -->
                  <nz-date-picker
                    *ngIf="field.type === 'datetime'"
                    nzShowTime
                    [formControlName]="field.key"
                    [id]="field.key"
                    [disabled]="isFieldDisabled(field)"
                    style="width: 100%;">
                  </nz-date-picker>

                  <!-- Time Picker -->
                  <nz-time-picker
                    *ngIf="field.type === 'time'"
                    [formControlName]="field.key"
                    [id]="field.key"
                    [disabled]="isFieldDisabled(field)"
                    style="width: 100%;">
                  </nz-time-picker>

                  <!-- Select -->
                  <nz-select
                    *ngIf="field.type === 'select'"
                    [formControlName]="field.key"
                    [id]="field.key"
                    [disabled]="isFieldDisabled(field)"
                    [nzPlaceHolder]="field.placeholder || '请选择'"
                    nzAllowClear
                    style="width: 100%;">
                    <nz-option
                      *ngFor="let opt of field.options"
                      [nzValue]="opt.value"
                      [nzLabel]="opt.label"
                      [nzDisabled]="opt.disabled || false">
                    </nz-option>
                  </nz-select>

                  <!-- Multi Select -->
                  <nz-select
                    *ngIf="field.type === 'multi-select'"
                    [formControlName]="field.key"
                    [id]="field.key"
                    [disabled]="isFieldDisabled(field)"
                    [nzPlaceHolder]="field.placeholder || '请选择'"
                    nzMode="multiple"
                    nzAllowClear
                    style="width: 100%;">
                    <nz-option
                      *ngFor="let opt of field.options"
                      [nzValue]="opt.value"
                      [nzLabel]="opt.label"
                      [nzDisabled]="opt.disabled || false">
                    </nz-option>
                  </nz-select>

                  <!-- Switch -->
                  <nz-switch
                    *ngIf="field.type === 'switch'"
                    [formControlName]="field.key"
                    [id]="field.key"
                    [nzDisabled]="isFieldDisabled(field)"
                    [nzCheckedChildren]="checkedChildren"
                    [nzUnCheckedChildren]="unCheckedChildren">
                  </nz-switch>
                  <ng-template #checkedChildren>
                    <span nz-icon nzType="check"></span>
                  </ng-template>
                  <ng-template #unCheckedChildren>
                    <span nz-icon nzType="close"></span>
                  </ng-template>

                  <!-- Checkbox -->
                  <nz-checkbox-wrapper
                    *ngIf="field.type === 'checkbox'"
                    [formControlName]="field.key"
                    (nzOnChange)="onCheckboxChange($event, field)">
                    <label nz-checkbox
                           *ngFor="let opt of field.options"
                           [nzValue]="opt.value"
                           [nzDisabled]="(opt.disabled || false) || isFieldDisabled(field)">
                      {{ opt.label }}
                    </label>
                  </nz-checkbox-wrapper>

                  <!-- Radio Group -->
                  <nz-radio-group
                    *ngIf="field.type === 'radio'"
                    [formControlName]="field.key"
                    [id]="field.key"
                    [nzDisabled]="isFieldDisabled(field)">
                    <label nz-radio *ngFor="let opt of field.options" [nzValue]="opt.value">
                      {{ opt.label }}
                    </label>
                  </nz-radio-group>

                  <!-- Lookup (Entity Reference) -->
                  <div *ngIf="field.type === 'lookup'" class="lookup-container">
                    <nz-input-group [nzSuffix]="lookupSuffix">
                      <input
                        nz-input
                        [formControlName]="field.key + '_display'"
                        [id]="field.key"
                        [placeholder]="field.placeholder || '请选择'"
                        [readonly]="true"
                        [disabled]="isFieldDisabled(field)"
                        (click)="!isFieldDisabled(field) && openLookup(field)" />
                    </nz-input-group>
                    <ng-template #lookupSuffix>
                      <span
                        nz-icon
                        nzType="search"
                        (click)="!isFieldDisabled(field) && openLookup(field)"
                        style="cursor: pointer;">
                      </span>
                    </ng-template>
                    <input type="hidden" [formControlName]="field.key" />
                  </div>

                  <!-- Typeahead -->
                  <nz-autocomplete
                    *ngIf="field.type === 'typeahead'"
                    [formControlName]="field.key"
                    [nzDataSource]="typeaheadData[field.key]"
                    (nzSearch)="onTypeaheadSearch($event, field)"
                    (nzSelect)="onTypeaheadSelect($event, field)"
                    [nzPlaceHolder]="field.placeholder || '请输入'"
                    [nzDisabled]="isFieldDisabled(field)"
                    style="width: 100%;">
                  </nz-autocomplete>

                  <!-- File Upload -->
                  <div *ngIf="field.type === 'upload'" class="upload-container">
                    <nz-upload
                      [nzAction]="uploadUrl"
                      [nzHeaders]="uploadHeaders"
                      [nzAccept]="uploadAccept"
                      [nzFileList]="fileList[field.key] || []"
                      (nzChange)="onFileChange($event, field)"
                      [nzDisabled]="isFieldDisabled(field)">
                      <button nz-button type="button">
                        <span nz-icon nzType="upload"></span>
                        上传文件
                      </button>
                    </nz-upload>
                    <input type="hidden" [formControlName]="field.key" />
                  </div>

                  <!-- Tooltip -->
                  <nz-form-explain *ngIf="field.tooltip">
                    <nz-tooltip [nzTooltipTitle]="field.tooltip">
                      <span nz-icon nzType="info-circle" style="margin-left: 8px;"></span>
                    </nz-tooltip>
                  </nz-form-explain>

                </nz-form-control>
              </nz-form-item>
            </div>
          </ng-container>
        </div>

        <!-- Form Actions -->
        <div class="form-actions" style="margin-top: 24px; text-align: center;">
          <nz-space>
            <button
              *nzSpaceItem
              nz-button
              nzType="primary"
              type="submit"
              [nzLoading]="submitting"
              [disabled]="form.invalid && !submitting">
              {{ submitButtonText }}
            </button>
            <button
              *nzSpaceItem
              *ngIf="showCancelButton"
              nz-button
              type="button"
              (click)="cancel()">
              取消
            </button>
            <button
              *nzSpaceItem
              *ngIf="showResetButton"
              nz-button
              type="button"
              (click)="reset()">
              重置
            </button>
          </nz-space>
        </div>
      </nz-card>

      <ng-template #cardExtra>
        <nz-space>
          <button
            *nzSpaceItem
            nz-button
            nzType="link"
            (click)="toggleAdvanced()">
            {{ advancedVisible ? '收起高级' : '展开高级' }}
            <span nz-icon [nzType]="advancedVisible ? 'up' : 'down'"></span>
          </button>
        </nz-space>
      </ng-template>
    </form>
  `,
  styles: [`
    .lookup-container {
      display: flex;
      align-items: center;
    }
    .lookup-container input[readonly] {
      cursor: pointer;
    }
    .upload-container {
      display: block;
    }
    .ant-form-item {
      margin-bottom: 16px;
    }
  `]
})
export class DynamicDetailFormComponent implements OnInit, OnChanges {
  @Input() fields: FormFieldConfig[] = [];
  @Input() values: Record<string, any> = {};
  @Input() submitButtonText: string = '保存';
  @Input() showCancelButton: boolean = true;
  @Input() showResetButton: boolean = false;
  @Input() submitting: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() cardTitle: string = '';

  @Output() onSubmit = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onFieldChange = new EventEmitter<{ field: string; value: any }>();
  @Output() onLookupOpen = new EventEmitter<FormFieldConfig>();

  form!: FormGroup;
  typeaheadData: Record<string, string[]> = {};
  fileList: Record<string, any[]> = {};
  passwordVisible = false;
  advancedVisible = false;

  get sortedFields(): FormFieldConfig[] {
    const advancedFields = this.fields.filter(f => f.colSpan && f.colSpan >= 2);
    const basicFields = this.fields.filter(f => !f.colSpan || f.colSpan < 2);

    if (this.advancedVisible) {
      return this.fields.sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    return basicFields.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fields'] && !changes['fields'].firstChange) {
      this.buildForm();
    }
    if (changes['values'] && !changes['values'].firstChange && this.values) {
      this.patchValues();
    }
  }

  buildForm(): void {
    const group: any = {};

    this.fields.forEach(field => {
      const validators = this.getValidators(field);
      let defaultValue = this.values?.[field.key];

      if (defaultValue === undefined || defaultValue === null) {
        defaultValue = field.defaultValue;
      }

      if (field.type === 'multi-select' || field.type === 'checkbox') {
        defaultValue = defaultValue || [];
      }

      group[field.key] = [defaultValue, validators];
    });

    this.form = this.fb.group(group);

    this.form.valueChanges.subscribe(value => {
      this.evaluateConditionalLogic();
      this.onFieldChange.emit({ field: '', value });
    });
  }

  patchValues(): void {
    if (this.form && this.values) {
      this.form.patchValue(this.values, { emitEvent: false });

      Object.keys(this.values).forEach(key => {
        const field = this.fields.find(f => f.key === key);
        if (field?.type === 'lookup') {
          const displayField = key + '_display';
          const displayValue = this.values[displayField] || this.values[field.lookupDisplayField] || '';
          this.form.patchValue({ [displayField]: displayValue }, { emitEvent: false });
        }
      });
    }
  }

  getValidators(field: FormFieldConfig): Validators[] {
    const validators: Validators[] = [];

    if (field.required) {
      validators.push(Validators.required);
    }

    if (field.validation) {
      field.validation.forEach(validation => {
        switch (validation.type) {
          case 'minLength':
            validators.push(Validators.minLength(validation.value));
            break;
          case 'maxLength':
            validators.push(Validators.maxLength(validation.value));
            break;
          case 'min':
            validators.push(Validators.min(validation.value));
            break;
          case 'max':
            validators.push(Validators.max(validation.value));
            break;
          case 'pattern':
            validators.push(Validators.pattern(validation.value));
            break;
        }
      });
    }

    return validators;
  }

  getValidationValue(field: FormFieldConfig, type: 'min' | 'max'): number | undefined {
    const rule = field.validation?.find(v => v.type === type);
    return rule?.value;
  }

  getPrecision(field: FormFieldConfig): number | undefined {
    if (field.type === 'currency') return 2;
    if (field.type === 'percentage') return 2;
    return undefined;
  }

  getColSpan(field: FormFieldConfig): number {
    if (field.type === 'textarea') return 24;
    return field.colSpan ? field.colSpan * 12 : 12;
  }

  getLabelSpan(field: FormFieldConfig): number {
    return 6;
  }

  getControlSpan(field: FormFieldConfig): number {
    if (field.type === 'textarea') return 18;
    return field.colSpan ? field.colSpan * 12 : 18;
  }

  isFieldVisible(field: FormFieldConfig): boolean {
    if (field.hidden === true) return false;

    if (field.conditionalLogic && field.conditionalLogic.length > 0) {
      return field.conditionalLogic.every(rule => {
        const dependValue = this.form.get(rule.dependsOn)?.value;
        return this.evaluateCondition(dependValue, rule.condition, rule.value);
      });
    }

    return true;
  }

  isFieldDisabled(field: FormFieldConfig): boolean {
    if (field.disabled) return true;

    if (field.conditionalLogic && field.conditionalLogic.length > 0) {
      return !field.conditionalLogic.every(rule => {
        const dependValue = this.form.get(rule.dependsOn)?.value;
        return this.evaluateCondition(dependValue, rule.condition, rule.value);
      });
    }

    return false;
  }

  private evaluateCondition(value: any, condition: string, ruleValue: any): boolean {
    switch (condition) {
      case 'equals':
        return value === ruleValue;
      case 'notEquals':
        return value !== ruleValue;
      case 'contains':
        return value && typeof value === 'string' && value.includes(ruleValue);
      case 'greaterThan':
        return Number(value) > Number(ruleValue);
      case 'lessThan':
        return Number(value) < Number(ruleValue);
      default:
        return true;
    }
  }

  private evaluateConditionalLogic(): void {
    this.fields.forEach(field => {
      if (field.conditionalLogic && field.conditionalLogic.length > 0) {
        const shouldShow = this.isFieldVisible(field);
        const shouldEnable = !this.isFieldDisabled(field);

        if (shouldShow && !shouldEnable) {
          this.form.get(field.key)?.enable();
        } else if (!shouldShow || !shouldEnable) {
          this.form.get(field.key)?.disable();
        }
      }
    });
  }

  getErrorTip(field: FormFieldConfig): string {
    const control = this.form.get(field.key);
    if (!control || !control.errors) return '';

    if (control.errors['required']) {
      return `${field.label}不能为空`;
    }
    if (control.errors['minlength']) {
      return `${field.label}至少${control.errors['minlength'].requiredLength}个字符`;
    }
    if (control.errors['maxlength']) {
      return `${field.label}最多${control.errors['maxlength'].requiredLength}个字符`;
    }
    if (control.errors['min']) {
      return `${field.label}最小值为${control.errors['min'].min}`;
    }
    if (control.errors['max']) {
      return `${field.label}最大值为${control.errors['max'].max}`;
    }
    if (control.errors['pattern']) {
      return `${field.label}格式不正确`;
    }

    return '';
  }

  submit(): void {
    if (this.form.valid) {
      const formValue = { ...this.form.getRawValue() };

      Object.keys(formValue).forEach(key => {
        const field = this.fields.find(f => f.key === key);
        if (field?.type === 'lookup') {
          const displayKey = key + '_display';
          delete formValue[displayKey];
        }
      });

      this.onSubmit.emit(formValue);
    } else {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }

  cancel(): void {
    this.onCancel.emit();
  }

  reset(): void {
    this.form.reset();
    this.fileList = {};
  }

  toggleAdvanced(): void {
    this.advancedVisible = !this.advancedVisible;
  }

  openLookup(field: FormFieldConfig): void {
    this.onLookupOpen.emit(field);
  }

  onTypeaheadSearch(value: string, field: FormFieldConfig): void {
    if (field.lookupApi) {
      this.typeaheadData[field.key] = ['选项1', '选项2', '选项3'];
    }
  }

  onTypeaheadSelect(value: any, field: FormFieldConfig): void {
    this.onFieldChange.emit({ field: field.key, value });
  }

  onCheckboxChange(values: string[], field: FormFieldConfig): void {
    this.onFieldChange.emit({ field: field.key, value: values });
  }

  onFileChange(event: any, field: FormFieldConfig): void {
    const fileList = event.fileList.map((file: any) => {
      if (file.response) {
        return file.response.url || file.name;
      }
      return file.name;
    });

    this.fileList[field.key] = event.fileList;
    this.form.get(field.key)?.setValue(fileList.join(','));
    this.onFieldChange.emit({ field: field.key, value: fileList.join(',') });
  }

  get uploadUrl(): string {
    return '/api/upload';
  }

  get uploadHeaders(): any {
    return {};
  }

  get uploadAccept(): string {
    return '.png,.jpg,.jpeg,.pdf,.doc,.docx,.xls,.xlsx';
  }
}
