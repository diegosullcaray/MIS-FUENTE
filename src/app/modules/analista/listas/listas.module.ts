import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { ListasRoutingModule } from "./listas-routing.module";
import { ListasComponent } from "./listas.component";

@NgModule({
    imports:[
        ListasRoutingModule,
        SharedModule,
    ],
    declarations:[ListasComponent]
})
export class ListasModule{}