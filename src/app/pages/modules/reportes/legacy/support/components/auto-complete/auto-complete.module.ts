import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteSecComponent } from './auto-complete-sec/auto-complete-sec.component';

const components = [
  AutoCompleteSecComponent
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    MatAutocompleteModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule, 
    FlexLayoutModule,
  ],
  declarations: components,
  exports: components

})
export class AutoCompleteModule { }
