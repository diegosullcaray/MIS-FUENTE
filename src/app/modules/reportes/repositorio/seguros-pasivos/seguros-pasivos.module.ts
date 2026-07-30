import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule } from "@angular/forms";
import { SharedCWCModule } from "app/core/screen/components/shared-cwc.module";
import { MaterialModule } from 'app/material/material.module';
import { SharedCMCModule } from "app/modules/shared/shared-cmc.module"; 
import { SegurosPasivosComponent } from "./seguros-pasivos.component";
import { SegurosPasivosRoutingModule } from "./seguros-pasivos-routing.module";

@NgModule({
    imports:[
        SegurosPasivosRoutingModule,
        CommonModule,
        FormsModule,
        FlexLayoutModule,
        MaterialModule, 
        SharedCWCModule,
        SharedCMCModule
    ],
    declarations:[SegurosPasivosComponent],
    //providers:[ModAppService]
})
export class SegurosPasivosModule{}