import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { PrincipalComponent } from "./principal/principal.component";
import { HighchartsChartModule } from "highcharts-angular";
import { SistematicaRoutingModule } from "./sistematica-routing.module";
import { SistematicaComponent } from "./sistematica.component";
import { DialogDemoComponent } from "./demo-dialog/dialog-demo.component";
import { MapDemoComponent } from "./demo-map/map-demo.component";
import { ModSistematicaService } from "./compartido/servicios/mod-sistematica.service";
import { DesembolsosComponent } from "./desembolsos/desembolsos.component";
import { SistematicaService } from "./compartido/servicios/sistematica.service";

@NgModule({
    imports:[
        SistematicaRoutingModule,
        SharedModule,
        HighchartsChartModule
    ],
    declarations:[SistematicaComponent,PrincipalComponent,
        DesembolsosComponent,
        DialogDemoComponent,MapDemoComponent],
    providers:[ModSistematicaService,SistematicaService]
})
export class SistematicaModule{}