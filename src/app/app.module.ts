import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';
import { AuthModule } from './pages/full-pages/auth/auth.module';
import { LayoutModule } from './pages/full-pages/layout/layout.module';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { AppRoutingModule } from './app-routing.module';
import { httpInterceptorProviders } from './pages/full-pages/layout/interceptors/http-interceptors';
import { RouteTrackerService } from './pages/full-pages/layout/services/route-tracker.service';
import { DatePipe } from '@angular/common';
import { RoutePartsService } from 'app/core/services/route-parts.service';
import { WinderService } from 'app/core/data/remote/winder/winder.service';
import { CypherService } from 'app/core/services/cypher.service';
import { RESTService } from 'app/core/data/remote/rest/rest.service';
import { ModSysAdminService } from 'app/core/data/remote/instances/mod-sys-admin.service';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,  
    AuthModule,
    LayoutModule,
    HttpClientModule,
    AppRoutingModule
  ],
  declarations: [AppComponent],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' },
    DatePipe,
    httpInterceptorProviders,
    RoutePartsService,
    WinderService,
    CypherService,
    RESTService,
    ModSysAdminService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private tracker: RouteTrackerService) {
    tracker.init();
  }
}
