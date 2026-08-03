import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportCraV7Component } from './report-cra-v7.component';
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
import { SharedModule } from 'app/shared/shared.module';
const components = [
    ReportCraV7Component
  ]

@NgModule({
    imports: [
      CommonModule,
      SelectModule,
      TableModule,
      MatTabsModule,
      MatInputModule,
      MatFormFieldModule,
      MatCardModule,
      MatIconModule,
      MatButtonModule,
      FormsModule, ReactiveFormsModule,
      FlexLayoutModule,
      SharedModule,
    ],
    declarations: components,
    exports:components

  })
  export class ReportCraV7Module {

  }