import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { PriorizacionLeadsRoutingModule } from "./priorizacion-leads-routing.module";
import { PriorizacionLeadsComponent } from "./priorizacion-leads.component";

@NgModule({
    imports:[
        PriorizacionLeadsRoutingModule,
        SharedModule,
    ],
    declarations:[PriorizacionLeadsComponent],
    //providers:[]
})
export class PriorizacionLeadsModule{}