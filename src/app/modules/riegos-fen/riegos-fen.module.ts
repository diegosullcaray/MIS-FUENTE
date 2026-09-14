import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedCWCModule } from 'app/core/screen/components/shared-cwc.module';
import { SharedCMCModule } from '../shared/shared-cmc.module';
import { SharedMaterialModule } from 'app/core/screen/components/shared-material.module';
import { RiegosFenComponent } from './riegos-fen.component';
import { RiegosFenRoutingModule } from './riegos-fen-routing.module';

@NgModule({
  declarations: [
    RiegosFenComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    SharedCWCModule,
    SharedCMCModule,
    SharedMaterialModule,
    RiegosFenRoutingModule
  ]
})
export class RiegosFenModule { }
