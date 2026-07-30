import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "app/shared/shared.module";
import { MaterialModule } from 'app/material/material.module';
import { ModRepService } from "app/modules/reportes/compartido/servicios/mod-rep.service";
import { PreActCarteraCreditosRoutingModule } from "./pre-act-cartera-creditos-routing.module";
import { PreActCarteraCreditosComponent } from "./pre-act-cartera-creditos.component";

@NgModule({
    imports:[
        PreActCarteraCreditosRoutingModule,
        CommonModule,
        FormsModule,
        FlexLayoutModule,
        MaterialModule,
        SharedModule,
    ],
    declarations:[PreActCarteraCreditosComponent], 
    //providers:[ModAppService]
})
export class PreActCarteraCreditosModule{}