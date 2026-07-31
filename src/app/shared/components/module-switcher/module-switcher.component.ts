import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IMenuItem, NavigationService } from 'app/pages/full-pages/layout/services/navigation.service';

@Component({
  selector: 'app-module-switcher',
  templateUrl: './module-switcher.component.html',
  styleUrls: ['./module-switcher.component.scss']
})
export class ModuleSwitcherComponent implements OnInit, OnDestroy {
  modules: IMenuItem[] = [];
  currentModule: IMenuItem;

  private menuItemsSub: Subscription;
  private routerEventsSub: Subscription;

  constructor(private nav: NavigationService, private router: Router) { }

  ngOnInit(): void {
    this.menuItemsSub = this.nav.menuItems$.subscribe(items => {
      this.modules = (items || []).filter(i => !!i.state);
      this.updateCurrentModule();
    });
    this.routerEventsSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => this.updateCurrentModule());
  }

  ngOnDestroy(): void {
    if (this.menuItemsSub) {
      this.menuItemsSub.unsubscribe();
    }
    if (this.routerEventsSub) {
      this.routerEventsSub.unsubscribe();
    }
  }

  private updateCurrentModule(): void {
    const url = this.router.url;
    this.currentModule = this.modules.find(m => url.indexOf('/' + m.state) !== -1) || null;
  }
}
