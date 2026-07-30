import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { PowerBIEmbedModule } from 'powerbi-client-angular'; 
import { ModKaypachaService } from "../kaypacha/compartido/servicio/mod-kaypacha.service"; 
import { ModFrameworkEsgService } from '../framework-esg/compartido/servicios/mod-framework-esg.service';
import { PrincipalComponent } from "./principal/principal.component";  
import { FilterPeoplePipe } from "./detalle/filter.pipe"; 
import { ModRepService } from '../reportes/compartido/servicios/mod-rep.service';
import { ProspectoCorService } from '../analista/prospecto/compartido/servicios/prospecto-cor.service';
import { ModProspectoCorService } from '../analista/prospecto/compartido/servicios/mod-prospecto-cor.service';
import { ModReportesEService } from './compartido/servicios/mod-reportes-e.service';
import { ReportesEService } from './compartido/servicios/reportes-e.service';
import { ReasignacionCartCapRoutingModule } from './reasignacion-cart-cap-routing.module';
import { ReasignacionCartCapComponent } from './reasignacion-cart-cap.component';
 
@NgModule({ 
    imports:[  
        ReasignacionCartCapRoutingModule,
        SharedModule, 
    ],
    declarations:[ReasignacionCartCapComponent,PrincipalComponent ], 
    providers:[ModReportesEService,ModRepService,ReportesEService]
})
export class ReasignacionCartCapModule{}