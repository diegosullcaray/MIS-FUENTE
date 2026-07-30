import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "app/shared/shared.module";
import { MaterialModule } from 'app/material/material.module';
import { Kaypacha2RoutingModule } from "./kaypacha2-routing.module"; 
import { HighchartsChartModule } from "highcharts-angular"; 
import { Kaypacha2Component } from './kaypacha2.component'; 
import { ModKaypachaService } from '../kaypacha/compartido/servicio/mod-kaypacha.service';
import { HistoricoKaypachaComponent } from './historico/historico.component'; 
import { BuscadorKaypachaComponent } from "./buscador/buscador.component";
import { VariableKaypachaComponent } from './variable/variable.component';

@NgModule({
    imports: [
        Kaypacha2RoutingModule,
        CommonModule,
        FormsModule,
        FlexLayoutModule,
        MaterialModule,
        SharedModule,
        HighchartsChartModule
    ],
    declarations: [Kaypacha2Component,HistoricoKaypachaComponent,VariableKaypachaComponent,BuscadorKaypachaComponent],
    providers: [ModKaypachaService]
})
export class Kaypacha2Module { }