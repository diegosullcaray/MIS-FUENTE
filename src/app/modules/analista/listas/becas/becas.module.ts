import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { BecasRoutingModule } from "./becas-routing.module";
import { BecasComponent } from "./becas.component";

@NgModule({
    imports:[
        BecasRoutingModule,
        SharedModule,
    ],
    declarations:[BecasComponent],
    //providers:[]
})
export class BecasModule{}