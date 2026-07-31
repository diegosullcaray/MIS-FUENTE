import { Component, OnInit, Input, OnDestroy, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LayoutService } from 'app/pages/full-pages/layout/services/layout.service';
import { ThemeService } from 'app/pages/full-pages/layout/services/theme.service';
import { UserService } from '../../services/user.service';
import { AuthService } from 'app/pages/full-pages/auth/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { environment } from 'environments/environment';
import { StgAppConfirmService } from 'app/shared/components/stg-app-confirm/stg-app-confirm.service';
import { ModuleSidenavService } from 'app/pages/full-pages/layout/services/module-sidenav.service';
import { TourService } from 'app/shared/services/tour.service';
import { DriveStep } from 'driver.js';

@Component({
  selector: 'app-header-top',
  templateUrl: './header-top.component.html',
  styleUrls:['./header-top.component.scss']
})
export class HeaderTopComponent implements OnInit, OnDestroy {
  layoutConf: any;
  menuItems: any;
  menuItemSub!: Subscription;
  egretThemes: any[] = [];
  currentLang = 'en';
  availableLangs = [{
    name: 'English',
    code: 'en',
  }, {
    name: 'Spanish',
    code: 'es',
  }]
  @Input() notificPanel;
  isDesktopHome: boolean = false;
  private routerEventsSub!: Subscription;
  constructor(
    public layout: LayoutService,
    public themeService: ThemeService,
    public user: UserService,
    public auth: AuthService,
    public router:Router,
    private confirm: StgAppConfirmService,
    public moduleSidenav: ModuleSidenavService,
    private tour: TourService
    //public translate: TranslateService,
    //private renderer: Renderer2,
    //public jwtAuth: JwtAuthService
  ) { }

  showDesktop(){
    this.router.navigateByUrl(environment.homePage);
  }

  confirmLogout() {
    this.confirm.open('¿Está seguro que desea cerrar sesión?').subscribe(x => {
      if (x.result == 1) {
        this.auth.logout();
      }
    });
  }

  startSystemTour() {
    const steps: DriveStep[] = [
      {
        element: '.tour-start-menu-btn',
        popover: {
          title: 'Menú de módulos',
          description: 'Desde acá accedés al listado de todos los módulos del sistema.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.tour-help-btn',
        popover: {
          title: 'Ayuda',
          description: 'Este botón inicia el recorrido guiado que estás viendo ahora.',
          side: 'bottom',
          align: 'end'
        }
      },
      {
        element: '.tour-notifications-btn',
        popover: {
          title: 'Notificaciones',
          description: 'Acá se muestran los avisos y notificaciones del sistema.',
          side: 'bottom',
          align: 'end'
        }
      },
      {
        element: '.tour-profile-btn',
        popover: {
          title: 'Tu perfil',
          description: 'Mostrá tu usuario, cambiá de usuario alterno o cerrá sesión desde acá.',
          side: 'bottom',
          align: 'end'
        }
      },
      {
        element: '#desktop-tour-shortcuts',
        popover: {
          title: 'Accesos directos',
          description: 'Acá encontrás los accesos directos a los módulos y reportes del sistema.',
          side: 'top',
          align: 'start'
        }
      }
    ];
    this.tour.start(steps);
  }

  ngOnInit() {
    this.layoutConf = this.layout.layoutConf;
    this.egretThemes = this.themeService.themes;
    this.isDesktopHome = this.router.url === environment.homePage;
    this.routerEventsSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isDesktopHome = event.urlAfterRedirects === environment.homePage;
    });
  }
  ngOnDestroy() {
    if(this.menuItemSub){
      this.menuItemSub.unsubscribe()
    }
    if(this.routerEventsSub){
      this.routerEventsSub.unsubscribe()
    }
  }
  setLang() {
    //this.translate.use(this.currentLang)
  }
  changeTheme(theme) {
    this.layout.publishLayoutChange({ matTheme: theme.name })
  }
  toggleNotific() {
    this.notificPanel.toggle();
  }
  toggleSidenav() {
    if (this.layoutConf.isMobile) {
      if (this.layoutConf.sidebarStyle === 'closed') {
        return this.layout.publishLayoutChange({
          sidebarStyle: 'full'
        })
      }
      this.layout.publishLayoutChange({
        sidebarStyle: 'closed'
      })
    }
  }
}
