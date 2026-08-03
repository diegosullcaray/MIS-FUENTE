import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from 'app/material/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { TransaccionRoutingModule } from './transaccion-routing.module';
import { ModAppService } from '../../../../core/data/remote/instances/mod-app-service';
//import { ModCorresponsalService } from '../servicio/mod-corresponsal.service';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatGridListModule } from '@angular/material/grid-list';
import { HighchartsChartModule } from 'highcharts-angular';
import { SelectModule } from '../../reportes/legacy/support/components/select/select.module';
import { TableModule } from '../../reportes/legacy/support/components/table/table.module';
import { GraphicModule } from '../../reportes/legacy/support/components/graphic/graphic.module';
import { TransaccionComponent } from './transaccion.component';
import { ComercialService } from '../../reportes/legacy/comercial/comercial.service';
import { TransaccionPopupComponent } from './transaccion-popup/transaccion-popup.component';
import { ModCorresponsalService } from '../../corresponsales/servicio/mod-corresponsal.service';
import { ModSecService } from '../../reportes/legacy/support/data/ant-mod-sec.service';
import { ModRepService } from '../../reportes/compartido/servicios/mod-rep.service';

@NgModule({
  imports: [ 
    TransaccionRoutingModule,
    MaterialModule, //
    FormsModule, //
    ReactiveFormsModule,
    CommonModule,//    
    FlexLayoutModule,//
    SharedModule,//
    MaterialModule,
    FormsModule, ReactiveFormsModule,
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatButtonModule,
    MatChipsModule,
    MatListModule,
    MatTabsModule,
    MatTableModule,
    MatGridListModule,
    FlexLayoutModule,
    HighchartsChartModule,
    SelectModule,
    TableModule,
    GraphicModule, 
    
  ],
  declarations: [TransaccionComponent,TransaccionPopupComponent],
  providers: [ModSecService,ComercialService]
  /*,
  providers: [ModAppService, ModCorresponsalService],*/
})
export class TransaccionModule { } 