import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: 'rda',
        loadChildren: () => import('./rda/rda.module').then(m => m.RDAModule),
        data: { title: "RDA" }
      },
      {
        path: 'rma',
        loadChildren: () => import('./rma/rma.module').then(m => m.RmaModule),
        data: { title: "RMA" }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComercialRoutingModule { }
