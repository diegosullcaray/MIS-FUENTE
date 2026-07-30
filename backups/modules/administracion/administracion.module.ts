import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { AdministracionComponent } from "./administracion.component";
import { AdministracionRoutingModule } from "./administracion-routing.module";
import { ModAdminService } from "./compartido/servicios/mod-admin.service";
import { AdministracionService } from "./compartido/servicios/administracion.service";

@NgModule({
    imports:[
        AdministracionRoutingModule,
        SharedModule,
        //HighchartsChartModule      
    ],
    declarations:[AdministracionComponent],
    providers:[ModAdminService,AdministracionService]
})
export class AdministracionModule{}