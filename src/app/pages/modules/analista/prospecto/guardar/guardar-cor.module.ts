import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { GuardarDialogCorComponent } from './guardar-dialog-cor.component';
import { GuardarRoutingCorModule } from "./guardar-routing-cor.module"; 
import { GuardarCorComponent } from './guardar-cor.component';
import { FormsModule } from '@angular/forms';  
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
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