import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTransferModule } from 'ng-zorro-antd/transfer';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

import { ConfigSchemeService } from './lib/services/config-scheme.service';
import { DynamicListService } from './lib/services/dynamic-list.service';
import { DynamicListComponent } from './lib/components/dynamic-list/dynamic-list.component';
import { DynamicFormComponent } from './lib/components/dynamic-form/dynamic-form.component';
import { DynamicDetailFormComponent } from './lib/components/dynamic-detail-form/dynamic-detail-form.component';
import { LookupModalComponent } from './lib/components/lookup-modal/lookup-modal.component';
import { AdvancedFiltersComponent } from './lib/components/advanced-filters/advanced-filters.component';
import { ColumnConfigComponent } from './lib/components/column-config/column-config.component';
import { LookupSelectComponent } from './lib/components/lookup/lookup-select.component';
import { LookupTypeaheadComponent } from './lib/components/lookup/lookup-select.component';
import { LookupConfigComponent } from './lib/components/lookup/lookup-config.component';
import { DynamicConfigListComponent } from './lib/components/config/dynamic-config-list.component';
import { DynamicConfigDetailComponent } from './lib/components/config/dynamic-config-detail.component';

const NZ_MODULES = [
  NzButtonModule,
  NzTableModule,
  NzFormModule,
  NzInputModule,
  NzSelectModule,
  NzDatePickerModule,
  NzSwitchModule,
  NzCardModule,
  NzModalModule,
  NzPopconfirmModule,
  NzSpaceModule,
  NzDividerModule,
  NzIconModule,
  NzTagModule,
  NzCollapseModule,
  NzDropDownModule,
  NzTooltipModule,
  NzSpinModule,
  NzEmptyModule,
  NzCheckboxModule,
  NzRadioModule,
  NzInputNumberModule,
  NzAutocompleteModule,
  NzTreeModule,
  NzTransferModule,
  NzTreeSelectModule,
  NzDrawerModule,
  NzTabsModule,
  NzBadgeModule,
  NzPaginationModule,
];

export interface DynamicFormSystemOptions {
  autoScanOnStartup?: boolean;
  defaultPageSize?: number;
}

@NgModule({
  declarations: [
    DynamicListComponent,
    DynamicFormComponent,
    DynamicDetailFormComponent,
    LookupModalComponent,
    AdvancedFiltersComponent,
    ColumnConfigComponent,
    LookupSelectComponent,
    LookupTypeaheadComponent,
    LookupConfigComponent,
    DynamicConfigListComponent,
    DynamicConfigDetailComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    ...NZ_MODULES
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DynamicListComponent,
    DynamicFormComponent,
    DynamicDetailFormComponent,
    LookupModalComponent,
    AdvancedFiltersComponent,
    ColumnConfigComponent,
    LookupSelectComponent,
    LookupTypeaheadComponent,
    LookupConfigComponent,
    DynamicConfigListComponent,
    DynamicConfigDetailComponent,
    ...NZ_MODULES
  ],
})
export class DynamicFormSystemModule {
  static forRoot(options?: DynamicFormSystemOptions): ModuleWithProviders<DynamicFormSystemModule> {
    return {
      ngModule: DynamicFormSystemModule,
      providers: [
        ConfigSchemeService,
        DynamicListService,
        NzMessageService,
        {
          provide: 'DYNAMIC_FORM_SYSTEM_OPTIONS',
          useValue: options || {},
        },
      ],
    };
  }
}
