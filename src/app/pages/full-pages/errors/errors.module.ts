import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from 'app/material/material.module';
import { ErrorPageComponent } from './error-page/error-page.component';

const routes: Routes = [
  {
    path: ':code',
    component: ErrorPageComponent
  },
  {
    path: '',
    component: ErrorPageComponent
  }
];

@NgModule({
  declarations: [
    ErrorPageComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule.forChild(routes)
  ]
})
export class ErrorsModule { }
