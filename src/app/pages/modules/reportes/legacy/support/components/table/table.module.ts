import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableBasicComponent } from './table-basic/table-basic.component';
import { TableMultiheaderComponent } from './table-multiheader/table-multiheader.component';
import { CdkTableModule } from '@angular/cdk/table';

import { FlexLayoutModule } from '@angular/flex-layout';
import { TableAjaxComponent } from './table-ajax/table-ajax.component';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { PipeModule } from '../../pipes/pipe.module';

const components = [
    TableBasicComponent,
    TableMultiheaderComponent,
    TableAjaxComponent
  ]

@NgModule({
    imports: [
      CommonModule,
      CdkTableModule,
      MatPaginatorModule,
      MatTableModule,
      MatProgressSpinnerModule,
      MatCardModule,
      MatIconModule,
      MatTooltipModule,
      MatButtonModule,
      MatRadioModule,
      MatCheckboxModule,
      MatTableModule,
      
      MatFormFieldModule,
      MatInputModule,
      FlexLayoutModule,
      PipeModule
    ],
    declarations: components,
    exports:components

  })
  export class TableModule {}