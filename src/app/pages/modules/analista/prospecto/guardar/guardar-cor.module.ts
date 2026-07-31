import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { GuardarDialogCorComponent } from './guardar-dialog-cor.component';
import { GuardarRoutingCorModule } from "./guardar-routing-cor.module"; 
import { GuardarCorComponent } from './guardar-cor.component';
import { FormsModule } from '@angular/forms';  
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { RxReactiveFormsModule } from "@rxweb/reactive-form-validators";

@NgModule({
    imports:[
        GuardarRoutingCorModule,
        SharedModule,
        RxReactiveFormsModule  
    ],
   
    declarations:[GuardarCorComponent,GuardarDialogCorComponent]
})
export class GuardarCorModule{}