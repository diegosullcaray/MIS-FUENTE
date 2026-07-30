import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { FrameworkEsgService } from "./compartido/servicios/framework-esg.service";
import { ModFrameworkEsgService } from "./compartido/servicios/mod-framework-esg.service";
import { FrameworkEsgRoutingModule } from "./framework-esg-routing.module";
import { FrameworkEsgComponent } from "./framework-esg.component";
import { PrincipalComponent } from "./principal/principal.component";

@NgModule({
    imports:[
        FrameworkEsgRoutingModule,
        SharedModule,
    ],
    declarations:[FrameworkEsgComponent,PrincipalComponent],
    providers:[ModFrameworkEsgService,FrameworkEsgService]
})
export class FrameworkEsgModule{}