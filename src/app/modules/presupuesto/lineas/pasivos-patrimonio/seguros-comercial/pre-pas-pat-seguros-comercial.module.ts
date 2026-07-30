import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "app/shared/shared.module";
import { MaterialModule } from 'app/material/material.module';
import { PrePasPatSegurosComercialRoutingModule } from "./pre-pas-pat-seguros-comercial-routing.module";
import { PrePasPatSegurosComercialComponent } from "./pre-pas-pat-seguros-comercial.component";

@NgModule({
    imports:[
        PrePasPatSegurosComercialRoutingModule,
        CommonModule,
        FormsModule,
        FlexLayoutModule,
        MaterialModule,
        SharedModule,
    ],
    declarations:[PrePasPatSegurosComercialComponent]
})
export class PrePasPatSegurosComercialModule{}