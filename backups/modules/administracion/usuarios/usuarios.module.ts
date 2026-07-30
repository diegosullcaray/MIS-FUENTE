import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { UsuariosRoutingModule } from "./usuarios-routing.module";
import { UsuariosComponent } from "./usuarios.component";


@NgModule({
    imports:[
        UsuariosRoutingModule,
        SharedModule,
        //HighchartsChartModule      
    ],
    declarations:[UsuariosComponent],
    providers:[]
})
export class UsuariosModule{}