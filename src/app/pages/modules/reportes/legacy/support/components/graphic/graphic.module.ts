import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlexLayoutModule } from '@angular/flex-layout';
import { GraphicBasicComponent } from './graphic-basic/graphic-basic.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { PipeModule } from '../../pipes/pipe.module';


const components = [
    GraphicBasicComponent,
  ]

@NgModule({
    imports: [
      CommonModule,
      MatProgressSpinnerModule,
      MatCardModule,
      MatChipsModule,
      MatButtonModule,
      MatIconModule,
      FlexLayoutModule,
      HighchartsChartModule,
      PipeModule
    ],
    declarations: components,
    exports:components

  })
  export class GraphicModule {}