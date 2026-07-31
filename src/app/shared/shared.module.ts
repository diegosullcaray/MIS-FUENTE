import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'app/material/material.module';
import { StgTableComponent } from './components/stg-table/stg-table.component';
import { StgLoading1 } from './components/stg-loading-1/stg-loading-1.component';
import { StgWindowBarComponent } from './components/stg-window-bar/stg-window-bar.component';
import { StgPaginatorComponent } from './components/stg-paginator/stg-paginator.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StgAppLoaderComponent } from './components/stg-app-loader/stg-app-loader.component';
import { StgBasicTreeSidenavComponent } from './components/stg-basic-tree-sidenav/stg-basic-tree-sidenav.component';
import { StgAlertComponent } from './components/stg-alert/stg-alert.component';
import { StgToolbarComponent } from './components/stg-toolbar/stg-toolbar.component';
import { StgProgressComponent } from './components/stg-progress/stg-progress.component';
import { StgTable2Component } from './components/stg-table2/stg-table2.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { DynamicFormatPipe } from './pipes/dynamic-format-pipe';
import { StgButtonComponent } from './components/stg-button/stg-button.component';
import { StgListComponent } from './components/stg-list/stg-list.component';
import { StgFormComponent } from './components/stg-form/stg-form.component';
import { StgBinputComponent } from './components/stg-binput/stg-binput.component';
import { TruncatePipe } from './pipes/truncate-pipe';
import { StgBinputDialogComponent } from './components/stg-binput/dialog/stg-binput-dialog.component';
import { StgAppConfirmComponent } from './components/stg-app-confirm/stg-app-confirm.component';
import { StgFinputComponent } from './components/stg-finput/stg-finput.component';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { StgPinputComponent } from './components/stg-pinput/stg-pinput.component';
import { StgNinputComponent } from './components/stg-ninput/stg-ninput.component';
import { StgTable3Component } from './components/stg-table3/stg-table3.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { StgMenuFilterComponent } from './components/stg-menu-filter/stg-menu-filter.component';
import { StgWindowBarMComponent } from './components/stg-window-bar-m/stg-window-bar-m.component';
import { StgTable4Component } from './components/stg-table4/stg-table4.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { HierRemSelectorComponent } from './ui/hier-rem-selector/hier-rem-selector.component';
import { HierRemSelector2Component } from './ui/hier-rem-selector2/hier-rem-selector2.component';
import { TblPickerDialogComponent } from './ui/tbl-picker-dialog/tbl-picker-dialog.component';
import { SecPickerDialogComponent } from './ui/sec-picker-dialog/sec-picker-dialog.component';
import { SingLocSelectorComponent } from './ui/sing-loc-selector/sing-loc-selector.component';
import { InFormDialogComponent } from './ui/in-form-dialog/in-form-dialog.component';
import { BlankLoaderComponent } from './ui/blank-loader/blank-loader.component';
import { ClientSummaryComponent } from './ui/client-summary/client-summary.component';
import { SessionLoaderComponent } from './components/session-loader/session-loader.component';
import { ModuleSwitcherComponent } from './components/module-switcher/module-switcher.component';
import { TblPickerDialogService } from './services/tbl-picker-dialog.service';
import { SecPickerDialog2Service } from './services/sec-picker-dialog2.service';
import { InFormDialogService } from './services/in-form-dialog.service';
import { ClientSummaryAntService } from './services/client-summary-ant.service';
import { ClientSummaryService } from './services/client-summary.service';

const components = [
    StgTableComponent,
    StgLoading1,
    StgWindowBarComponent,
    StgWindowBarMComponent,
    StgPaginatorComponent,
    StgAppLoaderComponent,
    StgAppConfirmComponent,
    StgBasicTreeSidenavComponent,
    StgAlertComponent,
    StgToolbarComponent,
    StgProgressComponent,
    StgTable2Component,
    StgTable4Component,
    StgButtonComponent,
    StgListComponent,
    StgFormComponent,
    StgBinputComponent,
    StgBinputDialogComponent,
    StgFinputComponent,
    StgPinputComponent,
    StgNinputComponent,
    StgTable3Component,
    StgMenuFilterComponent,
    HierRemSelectorComponent,
    HierRemSelector2Component,
    TblPickerDialogComponent,
    SecPickerDialogComponent,
    SingLocSelectorComponent,
    InFormDialogComponent,
    BlankLoaderComponent,
    ClientSummaryComponent,
    SessionLoaderComponent,
    ModuleSwitcherComponent
];

const pipes = [
    DynamicFormatPipe,
    TruncatePipe
]

const services = [
    TblPickerDialogService,
    SecPickerDialog2Service,
    InFormDialogService,
    ClientSummaryAntService,
    ClientSummaryService
]

const libraries = [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    FlexLayoutModule,
    NgScrollbarModule,
    MaterialModule,
    RxReactiveFormsModule,
    ScrollingModule,
    GoogleMapsModule
]

const exports = [...components,...pipes,...libraries];

const imports = libraries;

const declarations = [...components,...pipes];

@NgModule({
    imports:imports,
    declarations:declarations,
    exports:exports,
    providers:services,
})
export class SharedModule {}
