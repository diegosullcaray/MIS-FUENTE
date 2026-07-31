import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { ClienteDetalleComponent } from "./cliente/cliente.component";
import { DetalleDialogComponent } from "./detalle-dialog.component";
import { DetalleRoutingModule } from "./detalle-routing.module";
import { DetalleComponent } from "./detalle.component";
import { OperacionDetalleComponent } from "./operacion/operacion.component";

@NgModule({
    imports:[
        DetalleRoutingModule,
        SharedModule,
    ],
    declarations:[DetalleComponent,DetalleDialogComponent,ClienteDetalleComponent,OperacionDetalleComponent]
})
export class DetalleModule{}