import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdministracionComponent } from "./administracion.component";

const routes: Routes = [
    {
        path:'',
        component:AdministracionComponent,
        data: {title:'Administracion'}
    },
    {
        path:'usuarios',
        loadChildren: () => import('./usuarios/usuarios.module').then(m => m.UsuariosModule),
        data: {title:'Usuarios'}
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdministracionRoutingModule { }