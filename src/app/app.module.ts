import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';
import { SystemModule } from './system/system.module';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { AppRoutingModule } from './app-routing.module';
import { httpInterceptorProviders } from './system/admin/interceptors/http-interceptors';
import { RouteTrackerService } from './system/admin/services/route-tracker.service';
import { DatePipe } from '@angular/common';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SystemModule,
    HttpClientModule,
    AppRoutingModule
  ],
  declarations: [AppComponent],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' },
    DatePipe,
    httpInterceptorProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private tracker: RouteTrackerService) {
    tracker.init();
  }
}