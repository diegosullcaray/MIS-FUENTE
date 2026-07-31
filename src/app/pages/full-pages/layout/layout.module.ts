import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'app/material/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { SharedModule } from 'app/shared/shared.module';

import { HeaderTopComponent } from './components/header-top/header-top.component';
import { SidebarTopComponent } from './components/sidebar-top/sidebar-top.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { StartMenuComponent } from './components/start-menu/start-menu.component';
import { AltUserDialogComponent } from './components/alt-user-dialog/alt-user-dialog.component';
import { AdDialogComponent } from './components/ad-dialog/ad-dialog.component';
import { SessionEndDialogComponent } from './components/session-end-dialog/session-end-dialog.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { DesktopComponent } from './components/desktop/desktop.component';

import { AdminDirectivesModule } from './directives/admin-directives.module';

import { AdminGuard } from './guards/admin-guard.guard';
import { RouteGuard } from './guards/route-guard.guard';
import { DummyGuard } from './guards/dummy-guard.guard';
import { ThemeService } from './services/theme.service';
import { NavigationService } from './services/navigation.service';

const components = [
    HeaderTopComponent,
    SidebarTopComponent,
    SidenavComponent,
    NotificationsComponent,
    StartMenuComponent,
    AltUserDialogComponent,
    AdDialogComponent,
    SessionEndDialogComponent,
    AdminLayoutComponent,
    DesktopComponent
]

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        FlexLayoutModule,
        NgScrollbarModule,
        AdminDirectivesModule,
        MaterialModule,
        SharedModule
    ],
    declarations: components,
    exports: components,
    providers: [
        AdminGuard,
        RouteGuard,
        DummyGuard,
        ThemeService,
        NavigationService
    ]
})
export class LayoutModule { }
