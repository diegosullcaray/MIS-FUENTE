import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModAppService } from 'app/core/data/remote/instances/mod-app-service';
import { LayoutService } from 'app/pages/full-pages/layout/services/layout.service';
import { IMenuItem, NavigationService } from 'app/pages/full-pages/layout/services/navigation.service';
import { UserService } from 'app/pages/full-pages/layout/services/user.service';
import { ModuleSidenavService } from 'app/pages/full-pages/layout/services/module-sidenav.service';
import { Subscription } from 'rxjs';
import { isNullOrUndefined } from 'app/core/helpers/functions.util';

@Component({
    selector: 'app-actividades',
    templateUrl: './actividades.component.html',
    styleUrls: ['./actividades.component.scss']
})
export class ActividadesComponent implements OnInit, OnDestroy {
    openExplorerDesk: boolean;
    openExplorerMob: boolean;
    menuItems: IMenuItem[];
    menuItems2: IMenuItem[];
    activeGes:boolean;

    private menuItemsSub: Subscription;
    private moduleSidenavSub: Subscription;



    constructor(
        private nav: NavigationService,
        public layout: LayoutService,
        private antApp: ModAppService,
        public user: UserService,
        private moduleSidenav: ModuleSidenavService
    ) { }

    ngOnInit(): void {
        //this.openExplorer=this.layout.isMobile?false:true;
        this.openExplorerDesk = true;
        this.openExplorerMob = false;

        this.menuItemsSub = this.nav.menuItems$.subscribe(items => {
            let b: any = items.filter(e => e.cod === 'A_MOD_TAR')[0];
            //this.menuItems = b.sub;
            let lin = b.sub[0];
            let ges = b.sub[1];
            this.menuItems = lin.sub;
            if(!isNullOrUndefined(ges)){
                this.activeGes=true;
                this.menuItems2 = ges.sub;
            }
        });
        this.moduleSidenav.register(this.layout.isMobile ? this.openExplorerMob : this.openExplorerDesk);
        this.moduleSidenavSub = this.moduleSidenav.toggle$.subscribe(() => this.toggleExplorer());
    }

    ngOnDestroy(): void {
        if (this.menuItemsSub) {
            this.menuItemsSub.unsubscribe();
        }
        this.moduleSidenav.unregister();
        if (this.moduleSidenavSub) {
            this.moduleSidenavSub.unsubscribe();
        }
    }


    selectSec(evt) {
        if (this.layout.isMobile) {
            this.openExplorerMob = false;
            this.moduleSidenav.setOpen(false);
        }
    }

    toggleExplorer() {
        if (!this.layout.isMobile) {
            this.openExplorerDesk = !this.openExplorerDesk;
            this.moduleSidenav.setOpen(this.openExplorerDesk);
        } else {
            this.openExplorerMob = !this.openExplorerMob;
            this.moduleSidenav.setOpen(this.openExplorerMob);
        }

    }

    calcWidth(): string {
        return this.layout.isMobile ? "width: 100%;" : "width: 260px";
    }
}