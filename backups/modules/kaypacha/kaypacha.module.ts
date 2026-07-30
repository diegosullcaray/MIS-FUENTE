import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "app/shared/shared.module";
import { MaterialModule } from 'app/material/material.module';
import { KaypachaRoutingModule } from "./kaypacha-routing.module";
import { KaypachaComponent } from "./kaypacha.component";
import { PreguntasKaypachaComponent } from "./preguntas/preguntas.component";
import { PuntajeKaypachaComponent } from "./puntaje/puntaje.component";
import { DesempenioKaypachaComponent } from './desempenio/desempenio.component';
import { DinamizadoresKaypachaComponent } from './dinamizadores/dinamizadores.component';
import { BonosKaypachaComponent } from './bonos/bonos.component';
import { HighchartsChartModule } from "highcharts-angular";
import { ModKaypachaService } from "app/core/data/remote/instances/mod-kaypacha.service";
import { BuscadorKaypachaComponent } from './buscador/buscador.component';

@NgModule({
    imports: [
        KaypachaRoutingModule,
        CommonModule,
        FormsModule,
        FlexLayoutModule,
        MaterialModule,
        SharedModule,
        HighchartsChartModule
    ],
    declarations: [KaypachaComponent, PreguntasKaypachaComponent, PuntajeKaypachaComponent,
        DesempenioKaypachaComponent, DinamizadoresKaypachaComponent, BonosKaypachaComponent, BuscadorKaypachaComponent],
    providers: [ModKaypachaService]
})
export class KaypachaModule { }