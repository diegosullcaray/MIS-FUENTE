import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule } from "@angular/forms";
import { SharedCWCModule } from "app/core/screen/components/shared-cwc.module";
import { MaterialModule } from 'app/material/material.module';
import { SharedCMCModule } from "app/modules/shared/shared-cmc.module";   
import { imrComponent } from "./imr.component";
import { imrRoutingModule } from "./imr-routing.module";

@NgModule({
    imports:[
        imrRoutingModule,
        CommonModule,
        FormsModule,
        FlexLayoutModule,
        MaterialModule,
        SharedCWCModule,
        SharedCMCModule 
    ],
    declarations:[imrComponent],
    //providers:[ModAppService]
})  
export class imrModule{}