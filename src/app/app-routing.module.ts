import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminLayoutComponent } from './pages/full-pages/layout/components/admin-layout/admin-layout.component';
import { AuthGuard } from './pages/full-pages/auth/guards/auth.guard';
import { LoginGuard } from './pages/full-pages/auth/guards/login.guard';
import { AuthLayoutComponent } from './pages/full-pages/auth/components/auth-layout/auth-layout.component';
import { LoginComponent } from './pages/full-pages/auth/components/login/login.component';
import { SigninComponent } from './pages/full-pages/auth/components/signin/signin.component';
import { DesktopComponent } from './pages/full-pages/layout/components/desktop/desktop.component';
import { DummyComponent } from './modules/reportes/components/dummy/dummy.component';
import { RouteGuard } from './pages/full-pages/layout/guards/route-guard.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'session/signin',
    pathMatch: 'full'
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'session',
        children: [
          {
            path: '',
            redirectTo: 'signin',
            pathMatch: 'full'
          },
          {
            path: 'signin',
            component: SigninComponent,
            data: { title: 'Inicio Sesion' }
          }
        ],
        data: { title: 'Session' }
      }
    ]
  },
  {
    path: 'login',
    canActivate: [LoginGuard],
    component: LoginComponent
  },
  {
    path: 'app',
    redirectTo: 'app/desktop',
    pathMatch: 'full'
  },
  {
    path: 'app',
    canActivate: [AuthGuard],
    component: AdminLayoutComponent,
    children: [
      {
        path: 'desktop',
        component: DesktopComponent,
        data: { title: 'Desktop' }
      },
      {
        path: 'reportes',
        loadChildren: () => import('app/modules/reportes/rep01.module').then(m => m.Rep01Module),
        data: { title: 'Reportes' }
      },
      {
        path: 'incentivos3',
        loadChildren: () => import('app/modules/incentivos3/incentivos3.module').then(m => m.Incentivos3Module),
        data: { title: 'Incentivos' }
      },
      {
        path: 'ranking-k',
        loadChildren: () => import('app/modules/ranking-k/ranking-k.module').then(m => m.RankingKModule)
      },
      {
        path: 'dashboards',
        loadChildren: () => import('app/modules/reportes-e/reportes-e.module').then(m => m.ReportesEModule)
      },
      {
        path: 'esg',
        loadChildren: () => import('app/modules/framework-esg/framework-esg.module').then(m => m.FrameworkEsgModule)
      },
      {
        path: 'imparables',
        component: DummyComponent
      },
      {
        path: 'analista',
        loadChildren: () => import('app/modules/analista/analista.module').then(m => m.AnalistaModule)
      },
      //categorizacion
      {
        path: 'presupuesto',
        canActivate: [RouteGuard],
        loadChildren: () => import('app/modules/presupuesto/presupuesto.module').then(m => m.PresupuestoModule),
        data: { title: 'Presupuesto' }
      },
      {
        path: 'cons_base_negativa',
        loadChildren: () => import('app/modules/basenegativa/basenegativa.module').then(m => m.BaseNegativaModule),
        data: { title: 'Kaypacha' }
      },
      {
        path: 'actividades',
        canActivate: [RouteGuard],
        loadChildren: () => import('app/modules/actividades/actividades.module').then(m => m.ActividadesModule),
        data: { title: 'Actividades' }
      },
      {
        path: 'Kaypacha__',
        // canActivate:[RouteGuard],
        loadChildren: () => import('app/modules/Kaypacha3/kaypacha3.module').then(m => m.Kaypacha3Module),
        data: { title: 'Kaypacha' }
      },
      {
        path: 'corresponsales',
        //canActivate: [AuthGuard],
        //loadChildren: () => import('app/modules/reportes/legacy/banca-electronica/banca-electronica.module').then(m => m.BancaElectronicaModule),
        loadChildren: () => import('app/modules/corresponsales/corresponsales.module').then(m => m.CorresponsalesModule),
        data: { title: 'Corresponsales' }
      },
      {
        path: 'prospecto',
        loadChildren: () => import('app/modules/analista/prospecto/prospecto-cor.module').then(m => m.ProspectoCorModule)
      },

    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
