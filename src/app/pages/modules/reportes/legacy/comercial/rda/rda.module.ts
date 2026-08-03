
import { NgModule } from '@angular/core';
import { SelectModule } from '../../support/components/select/select.module';
import { RDARoutingModule } from './rda-routing.module'; 
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { AddProspecomponent } from './sectorista/crs-prospe/add-prospe.component';
import { FlexLayoutModule } from '@angular/flex-layout';  
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

// import { CommonDirectivesModule } from './sdirectives/common/common-directives.module';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
@NgModule({
    imports: [
        RDARoutingModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        FlexLayoutModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule
    ],
    declarations: [AddProspecomponent]
})
 
export class RDAModule { }