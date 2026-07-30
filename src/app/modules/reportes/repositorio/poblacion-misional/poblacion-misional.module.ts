import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule } from "@angular/forms";
import { SharedCWCModule } from "app/core/screen/components/shared-cwc.module";
import { MaterialModule } from 'app/material/material.module';
import { SharedCMCModule } from "app/modules/shared/shared-cmc.module";   
import { poblacionMisionalComponent } from "./poblacion-misional.component";
import { poblacionMisionalRoutingModule } from "./poblacion-misional-routing.module";

@NgModule({
    imports:[
        poblacionMisionalRoutingModule,
        CommonModule,
        FormsModule,
        FlexLayoutModule,
        MaterialModule,
        SharedCWCModule,
        SharedCMCModule 
    ],
    declarations:[poblacionMisionalComponent],
    //providers:[ModAppService]
})  
export class poblacionMisionalModule{}