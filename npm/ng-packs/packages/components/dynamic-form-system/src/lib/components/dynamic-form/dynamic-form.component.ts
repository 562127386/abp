import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormFieldConfig } from '../../models';

@Component({
  selector: 'abp-dynamic-form',
  template: `
    <form nz-form [formGroup]="form" (ngSubmit)="submit()">
      <nz-card>
        <div nz-row [nzGutter]="16">
          <ng-container *ngFor="let field of sortedFields">
            <div
              *ngIf="isFieldVisible(field)"
              [nzSpan]="field.colSpan ? field.colSpan * 12 : 12"
              nz-col>
              <nz-form-item>
                <nz-form-label
                  [nzRequired]="field.required"
                  [nzFor]="field.key">
                  {{ field.label }}
                </nz-form-label>
                <nz-form-control [nzErrorTip]="getErrorTip(field)">
                  <!-- Text Input -->
                  <input
                    *ngIf="field.type === 'text'"
                    nz-input
                    [formControlName]="field.key"
                    [id]="field.key"
                    [placeholder]="field.placeholder || ''"
                    [disabled]="field.disabled" />

                  <!-- Textarea -->
                  <textarea
                    *ngIf="field.type === 'textarea'"
                    nz-input
                    [formControlName]="field.key"
                    [id]="field.key"
                    [placeholder]="field.placeholder || ''"
                    [disabled]="field.disabled"
                    rows="3">
                  </textarea>

                  <!-- Number Input -->
                  <nz-input-number
                    *ngIf="field.type === 'number'"
                    [formControlName]="field.key"
                    [id]="field.key"
                    [placeholder]="field.placeholder || ''"
                    [disabled]="field.disabled"
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
                    [disabled]="field.disabled" />

                  <!-- Password Input -->
                  <input
                    *ngIf="field.type === 'password'"
                    nz-input
                    type="password"
                    [formControlName]="field.key"
                    [id]="field.key"
                    [placeholder]="field.placeholder || ''"
                    [disabled]="field.disabled" />

                  <!-- Date Picker -->
                  <nz-date-picker
                    *ngIf="field.type === 'date'"
                    [formControlName]="field.key"
                    [id]="field.key"
                    [disabled]="field.disabled"
                    style="width: 100%;">
                  </nz-date-picker>

                  <!-- DateTime Picker -->
                  <nz-date-picker
                    *ngIf="field.type === 'datetime'"
                    nzShowTime
                    [formControlName]="field.key"
                    [id]="field.key"
                    [disabled]="field.disabled"
                    style="width: 100%;">
                  </nz-date-picker>

                  <!-- Select -->
                  <nz-select
                    *ngIf="field.type === 'select'"
                    [formControlName]="field.key"
                    [id]="field.key"
                    [disabled]="field.disabled"
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
                    [disabled]="field.disabled"
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
                    [disabled]="field.disabled">
                  </nz-switch>

                  <!-- Checkbox -->
                  <nz-checkbox-wrapper
                    *ngIf="field.type === 'checkbox'"
                    [formControlName]="field.key"
                    (nzOnChange)="onCheckboxChange($event, field)">
                    <label nz-checkbox
                           *ngFor="let opt of field.options"
                           [nzValue]="opt.value"
                           [nzDisabled]="opt.disabled || false">
                      {{ opt.label }}
                    </label>
                  </nz-checkbox-wrapper>

                  <!-- Radio Group -->
                  <nz-radio-group
                    *ngIf="field.type === 'radio'"
                    [formControlName]="field.key"
                    [id]="field.key"
                    [disabled]="field.disabled">
                    <label nz-radio *ngFor="let opt of field.options" [nzValue]="opt.value">
                      {{ opt.label }}
                    </label>
                  </nz-radio-group>

                  <!-- Lookup (Entity Reference) -->
                  <div *ngIf="field.type === 'lookup'" class="lookup-container">
                    <nz-input-group [nzSuffix]="suffixIcon">
                      <input
                        nz-input
                        [formControlName]="field.key + '_display'"
                        [id]="field.key"
                        [placeholder]="field.placeholder || '请选择'"
                        [readonly]="true"
                        (click)="openLookup(field)" />
                    </nz-input-group>
                    <ng-template #suffixIcon>
                      <span nz-icon nzType="search" (click)="openLookup(field)"></span>
                    </ng-template>
                  </div>

                  <!-- Typeahead -->
                  <nz-auto-complete
                    *ngIf="field.type === 'typeahead'"
                    [formControlName]="field.key"
                    [nzDataSource]="typeaheadData[field.key]"
                    (nzSearch)="onTypeaheadSearch($event, field)"
                    (nzSelect)="onTypeaheadSelect($event, field)"
                    [nzPlaceHolder]="field.placeholder || '请输入'"
                    [disabled]="field.disabled">
                  </nz-auto-complete>

                </nz-form-control>
              </nz-form-item>
            </div>
          </ng-container>
        </div>

        <!-- Form Actions -->
        <div class="form-actions" style="margin-top: 24px; text-align: center;">
          <button nz-button nzType="primary" type="submit" [nzLoading]="submitting">
            {{ submitButtonText }}
          </button>
          <button
            *ngIf="showCancelButton"
            nz-button
            type="button"
            (click)="cancel()"
            style="margin-left: 8px;">
            取消
          </button>
        </div>
      </nz-card>
    </form>
  `,
  styles: [`
    .lookup-container {
      display: flex;
      align-items: center;
    }
    .lookup-container input {
      cursor: pointer;
    }
  `]
})
export class DynamicFormComponent implements OnInit, OnChanges {
  @Input() fields: FormFieldConfig[] = [];
  @Input() values: Record<string, any> = {};
  @Input() submitButtonText: string = '提交';
  @Input() showCancelButton: boolean = false;
  @Input() submitting: boolean = false;

  @Output() onSubmit = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onFieldChange = new EventEmitter<{ field: string; value: any }>();

  form!: FormGroup;
  typeaheadData: Record<string, string[]> = {};

  constructor(private fb: FormBuilder) {}

  get sortedFields(): FormFieldConfig[] {
    return this.fields.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

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
      group[field.key] = [this.values?.[field?.key] ?? field?.defaultValue ?? null, validators];
    });

    this.form = this.fb.group(group);

    this.form.valueChanges.subscribe(value => {
      this.evaluateConditionalLogic();
    });
  }

  patchValues(): void {
    if (this.form && this.values) {
      this.form.patchValue(this.values, { emitEvent: false });
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

        if (shouldShow && this.form.get(field.key)?.disabled) {
          this.form.get(field.key)?.enable();
        } else if (!shouldShow && this.form.get(field.key)?.enabled) {
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

  openLookup(field: FormFieldConfig): void {
    // Emit event to open lookup modal
    this.onFieldChange.emit({ field: field.key, value: 'lookup' });
  }

  onTypeaheadSearch(value: string, field: FormFieldConfig): void {
    if (field.lookupApi) {
      // Call API to get suggestions
      this.typeaheadData[field.key] = ['Option 1', 'Option 2', 'Option 3'];
    }
  }

  onTypeaheadSelect(value: any, field: FormFieldConfig): void {
    this.onFieldChange.emit({ field: field.key, value });
  }

  onCheckboxChange(values: string[], field: FormFieldConfig): void {
    this.onFieldChange.emit({ field: field.key, value: values });
  }
}
