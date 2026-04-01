export * from './lib/models';
export * from './lib/services';

export * from './dynamic-form-system.module';

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

export const COMPONENTS = [
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
];

export {
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
};
