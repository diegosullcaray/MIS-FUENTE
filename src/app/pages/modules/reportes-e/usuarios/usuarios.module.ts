import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { UsuariosDialogComponent } from "./usuarios-dialog.component";
import { UsuariosRoutingModule } from "./usuarios-routing.module";
import { UsuariosComponent } from "./usuarios.component";

@NgModule({
    imports:[
        UsuariosRoutingModule,
        SharedModule,
    ],
    declarations:[UsuariosComponent,UsuariosDialogComponent]
})
export class UsuariosModule{}