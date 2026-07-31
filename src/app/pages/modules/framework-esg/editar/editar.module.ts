import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { EditarDialogComponent } from "./editar-dialog.component";
import { EditarRoutingModule } from "./editar-routing.module";
import { EditarComponent } from "./editar.component";

@NgModule({
    imports:[
        EditarRoutingModule,
        SharedModule,
    ],
    declarations:[EditarComponent,EditarDialogComponent]
})
export class EditarModule{}