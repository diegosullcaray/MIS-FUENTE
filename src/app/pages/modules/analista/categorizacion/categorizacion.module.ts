import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { CategorizacionRoutingModule } from "./categorizacion-routing.module";
import { CategorizacionComponent } from "./categorizacion.component";

@NgModule({
    imports:[
        CategorizacionRoutingModule,
        SharedModule,
    ],
    declarations:[CategorizacionComponent]
})
export class CategorizacionModule{}