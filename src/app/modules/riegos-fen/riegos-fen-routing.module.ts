import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RiegosFenComponent } from './riegos-fen.component';

const routes: Routes = [
  {
    path: '',
    component: RiegosFenComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RiegosFenRoutingModule { }
