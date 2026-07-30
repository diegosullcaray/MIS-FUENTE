import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SharedModule } from "app/shared/shared.module";
import {  EditarRoutingPmModule } from './editar-routing-cor.module';  
import { FormsModule } from '@angular/forms';
import { EditarDialogPmComponent } from './editar-dialog-pm.component';
import { EditarPmComponent } from './editar-pm.component';

@NgModule({
    imports:[
        EditarRoutingPmModule,
        SharedModule,
 
    ],
     
    declarations:[EditarPmComponent,EditarDialogPmComponent] 
})
export class EditarPmModule{}