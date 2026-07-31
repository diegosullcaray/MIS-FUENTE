import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "app/shared/shared.module";
import { MaterialModule } from 'app/material/material.module';
import { PreGesSisResponsablesRoutingModule } from "./pre-ges-sis-responsables-routing.module";
import { PreGesSisResponsablesComponent } from "./pre-ges-sis-responsables.component";

@NgModule({
    imports:[
        PreGesSisResponsablesRoutingModule,
        CommonModule,
        FormsModule,
        FlexLayoutModule,
        MaterialModule,
        SharedModule,
    ],
    declarations:[PreGesSisResponsablesComponent],
    //providers:[ModAppService]
})
export class PreGesSisResponsablesModule{}