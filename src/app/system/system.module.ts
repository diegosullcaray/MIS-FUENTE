import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from 'app/system/admin/services/theme.service';
import { NavigationService } from 'app/system/admin/services/navigation.service';
import { RoutePartsService } from 'app/core/services/route-parts.service';
import { AdminDirectivesModule } from './admin/directives/admin-directives.module';
import { SystemComponentsModule } from './system-components';
import { AdminGuard } from './admin/guards/admin-guard.guard';
import { WinderService } from 'app/core/data/remote/winder/winder.service';
import { CypherService } from 'app/core/services/cypher.service';
import { RESTService } from 'app/core/data/remote/rest/rest.service';
import { ModSysAdminService } from 'app/core/data/remote/instances/mod-sys-admin.service';
import { DummyGuard } from './admin/guards/dummy-guard.guard';
import { RouteGuard } from './admin/guards/route-guard.guard';
import { TokenService } from 'app/core/services/token.service';

@NgModule({
  imports: [
    CommonModule,
    SystemComponentsModule,
    AdminDirectivesModule
  ],
  providers: [
    AdminGuard,
    RouteGuard,

    DummyGuard,

    ThemeService,
    NavigationService,
    RoutePartsService,

    WinderService,
    CypherService,
    TokenService,
    RESTService,
    ModSysAdminService
  ]
})
export class SystemModule { }
