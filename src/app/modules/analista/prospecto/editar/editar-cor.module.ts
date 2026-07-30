import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { EditarDialogCorComponent } from './editar-dialog-cor.component';
import { EditarRoutingCorModule } from "./editar-routing-cor.module"; 
import { EditarCorComponent } from './editar-cor.component';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports:[
        EditarRoutingCorModule,
        SharedModule,
    ],
   
    declarations:[EditarCorComponent,EditarDialogCorComponent]
})
export class EditarCorModule{}