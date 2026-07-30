import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { DetalleDialogComponent } from "./detalle-dialog.component";
import { DetalleRoutingModule } from "./detalle-routing.module";
import { DetalleComponent } from "./detalle.component";

@NgModule({
    imports:[
        DetalleRoutingModule,
        SharedModule,
    ],
    declarations:[DetalleComponent,DetalleDialogComponent]
})
export class DetalleModule{}