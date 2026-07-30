import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { IncentivosARoutingModule } from "./incentivos-a-routing.module";
import { IncentivosAComponent } from "./incentivos-a.component";
import { CabeceraComponent } from './cabecera/cabecera.component';
import { PrincipalComponent } from './principal/principal.component';
import { CalculadoraComponent } from './calculadora/calculadora.component';
import { CoberturaSComponent } from './cobertura-s/cobertura-s.component';
import { MonetizacionComponent } from './monetizacion/monetizacion.component';
import { HighchartsChartModule } from "highcharts-angular";
import { ModIncentivosAService } from "./compartido/servicios/mod-incentivos-a.service";
import { TblPickerDialogService } from "app/shared/services/tbl-picker-dialog.service";
import { IncentivosAService } from "./compartido/servicios/incentivos-a.service";
import { CoberturaComponent } from './cobertura/cobertura.component';
import { ComposicionComponent } from './composicion/composicion.component';
import { CalculadoraDialogComponent } from "./calculadora/calculadora-dialog.component";

@NgModule({
    imports:[
        IncentivosARoutingModule,
        SharedModule,
        HighchartsChartModule      
    ],
    declarations:[IncentivosAComponent, CabeceraComponent, PrincipalComponent, CalculadoraComponent,CalculadoraDialogComponent, 
        CoberturaSComponent, MonetizacionComponent, CoberturaComponent, ComposicionComponent],
    providers:[ModIncentivosAService,TblPickerDialogService,IncentivosAService]
})
export class IncentivosAModule{}