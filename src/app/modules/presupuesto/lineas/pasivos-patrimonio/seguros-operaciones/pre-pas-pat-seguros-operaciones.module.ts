import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "app/shared/shared.module";
import { MaterialModule } from 'app/material/material.module';
import { PrePasPatSegurosOperacionesRoutingModule } from "./pre-pas-pat-seguros-operaciones-routing.module";
import { PrePasPatSegurosOperacionesComponent } from "./pre-pas-pat-seguros-operaciones.component";

@NgModule({
    imports:[
        PrePasPatSegurosOperacionesRoutingModule,
        CommonModule,
        FormsModule,
        FlexLayoutModule,
        MaterialModule,
        SharedModule,
    ],
    declarations:[PrePasPatSegurosOperacionesComponent]
})
export class PrePasPatSegurosOperacionesModule{}