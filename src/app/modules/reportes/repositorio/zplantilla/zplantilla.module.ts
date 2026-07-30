import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule } from "@angular/forms";
import { SharedCWCModule } from "app/core/screen/components/shared-cwc.module";
import { MaterialModule } from 'app/material/material.module';
import { SharedCMCModule } from "app/modules/shared/shared-cmc.module";   
import { zplantillaComponent } from "./zplantilla.component";
import { zplantillaRoutingModule } from "./zplantilla-routing.module";

@NgModule({
    imports:[
        zplantillaRoutingModule,
        CommonModule,
        FormsModule,
        FlexLayoutModule,
        MaterialModule,
        SharedCWCModule,
        SharedCMCModule 
    ],
    declarations:[zplantillaComponent],
    //providers:[ModAppService]
})  
export class zplantillaModule{}