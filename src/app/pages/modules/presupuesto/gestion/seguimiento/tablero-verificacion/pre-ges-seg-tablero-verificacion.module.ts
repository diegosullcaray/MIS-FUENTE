import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "app/shared/shared.module";
import { MaterialModule } from 'app/material/material.module';
import { PreGesSegTableroVerificacionRoutingModule } from "./pre-ges-seg-tablero-verificacion-routing.module";
import { PreGesSegTableroVerificacionComponent } from "./pre-ges-seg-tablero-verificacion.component";

@NgModule({
    imports:[
        PreGesSegTableroVerificacionRoutingModule,
        CommonModule,
        FormsModule,
        FlexLayoutModule,
        MaterialModule,
        SharedModule,
    ],
    declarations:[PreGesSegTableroVerificacionComponent],
    //providers:[ModAppService]
})
export class PreGesSegTableroVerificacionModule{}