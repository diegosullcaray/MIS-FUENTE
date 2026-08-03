import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectBasicComponent } from './select-basic/select-basic.component';
import { SelectGroupComponent } from './select-group/select-group.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SelectMultipleComponent } from './select-multiple/select-multiple.component';
import { CacheService } from '../../services/cache.service';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';

const components = [
    SelectBasicComponent,
    SelectGroupComponent,
    SelectMultipleComponent
  ]

@NgModule({
    imports: [
      CommonModule,
      FormsModule, ReactiveFormsModule,
      FlexLayoutModule,
      MatFormFieldModule,
      MatSelectModule,
      MatInputModule,
      MatCardModule
    ],
    declarations: components,
    exports:components,
    providers:[CacheService]

  })
  export class SelectModule {}