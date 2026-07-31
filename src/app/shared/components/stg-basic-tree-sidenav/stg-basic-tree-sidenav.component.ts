import { NestedTreeControl } from "@angular/cdk/tree";
import { EventEmitter, Host, OnDestroy, OnInit, Output } from "@angular/core";
import { Component, Input } from "@angular/core";
import { MatTreeNestedDataSource } from "@angular/material/tree";
import { NavigationEnd, Router } from "@angular/router";
import { isNullOrUndefined } from "app/core/helpers/functions.util";
import { LayoutService } from "app/system/admin/services/layout.service";
import { IMenuItem } from "app/system/admin/services/navigation.service";
import { Subscription } from "rxjs";
import { filter } from "rxjs/operators";

interface IBasicSideNavTreeItem {
    name: string,
    state?: string,
    children?: IBasicSideNavTreeItem[];
    meta?: any
}

@Component({
    selector: 'stg-basic-tree-sidenav',
    templateUrl: './stg-basic-tree-sidenav.component.html',
    styleUrls: ['./stg-basic-tree-sidenav.component.scss']
})
export class StgBasicTreeSidenavComponent implements OnInit, OnDestroy {
    @Input() menuItems: IMenuItem[];

    treeControl = new NestedTreeControl<IBasicSideNavTreeItem>(node => node.children);
    dataSource = new MatTreeNestedDataSource<IBasicSideNavTreeItem>();

    activeUrl: string;

    @Output() onSelectMenuItem = new EventEmitter<any>();

    private routerSub: Subscription;

    constructor(private router: Router, private layout: LayoutService) {

    }

    ngOnInit(): void {
        let ds: IBasicSideNavTreeItem[] = [];
        this.menuItems.forEach(e => {
            let m: IBasicSideNavTreeItem = {
                name: e.name,
                state: e.state,
                children: this.genChilds(e.sub)
                //meta: e.meta
            }
            ds.push(m);
        });
        this.dataSource.data = ds;

        this.updateActiveUrl(this.router.url);
        this.routerSub = this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: NavigationEnd) => {
            this.updateActiveUrl(e.urlAfterRedirects);
        });
    }

    ngOnDestroy(): void {
        if (this.routerSub) {
            this.routerSub.unsubscribe();
        }
    }

    public onClick(a) {
        this.onSelectMenuItem.emit(a);
        this.router.navigateByUrl(a.state);
        //this.router.navigateByUrl('/app/reportes/leg/dummy');
        this.updateActiveUrl(a.state);
    }

    public isActive(node: IBasicSideNavTreeItem): boolean {
        return !!node.state && !!this.activeUrl && this.activeUrl.indexOf(node.state) !== -1;
    }

    private updateActiveUrl(url: string): void {
        this.activeUrl = url;
        const path = this.findActivePath(this.dataSource.data, url);
        if (!path) {
            return;
        }
        path.forEach(ancestor => this.treeControl.expand(ancestor));
    }

    private findActivePath(nodes: IBasicSideNavTreeItem[], url: string): IBasicSideNavTreeItem[] {
        for (const node of nodes) {
            if (node.state && url.indexOf(node.state) !== -1) {
                return [node];
            }
            if (node.children && node.children.length) {
                const childPath = this.findActivePath(node.children, url);
                if (childPath) {
                    return [node, ...childPath];
                }
            }
        }
        return null;
    }

    private genChilds(sub: any[]): IBasicSideNavTreeItem[] {
        let mi: IBasicSideNavTreeItem[] = [];
        if(sub){
            sub.forEach(e => {
                let m: IBasicSideNavTreeItem = {
                    name: e.name,
                    state: e.state,
                    children: this.genChilds(e.sub)
                    //meta: e.meta
                }
                mi.push(m);
            });
        }
        return mi;
    }

    hasChild = (_: number, node: IBasicSideNavTreeItem) => !!node.children && node.children.length > 0;

}