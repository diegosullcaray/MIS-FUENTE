import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportCraV4Component } from './report-cra-v4.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SelectModule } from '../../../select/select.module';
import { TableModule } from '../../../table/table.module';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SharedModule } from 'app/shared/shared.module';
const components = [
    ReportCraV4Component
  ]

@NgModule({
    imports: [
      //CommonModule,
      SharedModule,
      SelectModule,
      TableModule,
      
      FormsModule, ReactiveFormsModule,
      //FlexLayoutModule,
      
    ],
    declarations: components,
    exports:components

  })
  export class ReportCraV4Module {

  }