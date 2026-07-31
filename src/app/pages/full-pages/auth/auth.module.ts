import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { OAuthModule } from 'angular-oauth2-oidc';
import { MaterialModule } from 'app/material/material.module';
import { ModSysLoginService } from 'app/core/data/remote/instances/mod-sys-login.service';

import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';
import { LoginComponent } from './components/login/login.component';
import { SigninComponent } from './components/signin/signin.component';

import { LoginService } from './services/login.service';

import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';

const components = [
  AuthLayoutComponent,
  LoginComponent,
  SigninComponent
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FlexLayoutModule,
    RouterModule,
    OAuthModule.forRoot()
  ],
  declarations: components,
  exports: components,
  providers: [
    AuthGuard,
    LoginGuard,
    LoginService,
    ModSysLoginService
  ]
})
export class AuthModule { }
