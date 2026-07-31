import { Component, OnInit, Input, OnDestroy, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { LayoutService } from 'app/pages/full-pages/layout/services/layout.service';
import { ThemeService } from 'app/pages/full-pages/layout/services/theme.service';
import { UserService } from '../../services/user.service';
import { AuthService } from 'app/pages/full-pages/auth/services/auth.service';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { StgAppConfirmService } from 'app/shared/components/stg-app-confirm/stg-app-confirm.service';

@Component({
  selector: 'app-header-top',
  templateUrl: './header-top.component.html',
  styleUrls:['./header-top.component.scss']
})
export class HeaderTopComponent implements OnInit, OnDestroy {
  layoutConf: any;
  menuItems: any;
  menuItemSub: Subscription;
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
  constructor(
    public layout: LayoutService,
    public themeService: ThemeService,
    public user: UserService,
    public auth: AuthService,
    public router:Router,
    private confirm: StgAppConfirmService
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

  ngOnInit() {
    this.layoutConf = this.layout.layoutConf;
    this.egretThemes = this.themeService.themes;
  }
  ngOnDestroy() {
    if(this.menuItemSub){
      this.menuItemSub.unsubscribe()
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
