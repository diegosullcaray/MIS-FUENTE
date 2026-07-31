import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DestinoCreditoRoutingModule } from './destino-credito-routing.module';
import { DestinoCreditoComponent } from './destino-credito.component';
import { SharedModule } from 'app/shared/shared.module';
import { MaterialModule } from 'app/material/material.module';
import { DestinoCreditoPopupComponent } from './destino-credito-popup/destino-credito-popup.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [DestinoCreditoComponent, DestinoCreditoPopupComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DestinoCreditoRoutingModule,
    MaterialModule,
    SharedModule,
    FlexLayoutModule
  ]
})
export class DestinoCreditoModule { }
