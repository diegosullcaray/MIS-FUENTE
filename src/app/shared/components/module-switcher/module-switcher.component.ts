import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IChildItem, IMenuItem, NavigationService } from 'app/pages/full-pages/layout/services/navigation.service';
import { UserService } from 'app/pages/full-pages/layout/services/user.service';
import { AdminService } from 'app/pages/full-pages/layout/services/admin.service';
import { LoginService } from 'app/pages/full-pages/auth/services/login.service';

@Component({
  selector: 'app-module-switcher',
  templateUrl: './module-switcher.component.html',
  styleUrls: ['./module-switcher.component.scss']
})
export class ModuleSwitcherComponent implements OnInit, OnChanges, OnDestroy {
  // Cod del modulo actual (ej. 'A_MOD_RCOM' para reportes). Si se pasa, se usa
  // para identificar el modulo activo en vez de intentar adivinarlo por la URL.
  @Input() currentModuleCod: string;

  modules: IMenuItem[] = [];
  currentModule: IMenuItem;

  private menuItemsSub: Subscription;
  private routerEventsSub: Subscription;

  constructor(
    private nav: NavigationService,
    private router: Router,
    public user: UserService,
    public admin: AdminService,
    public login: LoginService
  ) { }

  ngOnInit(): void {
    this.menuItemsSub = this.nav.menuItems$.subscribe(items => {
      this.modules = (items || []).filter(i => !!i.state);
      this.updateCurrentModule();
    });
    this.routerEventsSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => this.updateCurrentModule());
  }

  ngOnChanges(): void {
    this.updateCurrentModule();
  }

  ngOnDestroy(): void {
    if (this.menuItemsSub) {
      this.menuItemsSub.unsubscribe();
    }
    if (this.routerEventsSub) {
      this.routerEventsSub.unsubscribe();
    }
  }

  // Dentro de un modulo muestra el arbol de carpetas/reportes propio del modulo;
  // en el desktop (sin modulo activo) muestra el listado de modulos disponibles.
  get treeItems(): IChildItem[] | IMenuItem[] {
    return this.currentModuleCod ? (this.currentModule?.sub || []) : this.modules;
  }

  private updateCurrentModule(): void {
    if (this.currentModuleCod) {
      this.currentModule = this.modules.find(m => m.cod === this.currentModuleCod) || null;
      return;
    }
    const url = this.router.url;
    this.currentModule = this.modules.find(m => url.indexOf('/' + m.state) !== -1) || null;
  }
}
