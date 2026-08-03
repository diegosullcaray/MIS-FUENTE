import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { AnalistaRoutingModule } from "./analista-routing.module";
import { AnalistaComponent } from "./analista.component";
import { AnalistaService } from "./compartido/servicios/analista.service";
import { ModSecService } from "./compartido/servicios/mod-sec.service";
import { PrincipalComponent } from "./principal/principal.component";
import { HighchartsChartModule } from "highcharts-angular";

@NgModule({
    imports:[
        AnalistaRoutingModule,
        SharedModule,
        HighchartsChartModule
    ],
    declarations:[AnalistaComponent,PrincipalComponent],
    providers:[ModSecService,AnalistaService]
})
export class AnalistaModule{}