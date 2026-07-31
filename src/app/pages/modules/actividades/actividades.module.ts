import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'app/material/material.module';
import { ActividadesRoutingModule } from './actividades-routing.module';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ActividadesComponent } from './actividades.component';
import { SharedModule } from 'app/shared/shared.module';
import { ModAppService } from 'app/core/data/remote/instances/mod-app-service';
import { ModActividadesService } from './servicios/mod-actividades.service';
import { ModCorresponsalService } from '../corresponsales/servicio/mod-corresponsal.service';
import { ComercialService } from '../reportes/legacy/comercial/comercial.service';
import { ModSecService } from '../reportes/legacy/support/data/ant-mod-sec.service';
import { ModRepService } from '../reportes/legacy/support/data/ant-mod-rep.service';

/*const components =[
  AppComfirmComponent,
  AppLoaderComponent
]*/

@NgModule({
  declarations: [ActividadesComponent],
  imports: [
    CommonModule,
    ActividadesRoutingModule,
    FormsModule,
    RouterModule,
    FlexLayoutModule,
    MaterialModule,
    SharedModule,
  ],
  providers: [ModAppService, ModActividadesService,ModCorresponsalService,ComercialService,ModRepService],
  //exports: components
})
export class ActividadesModule { }
