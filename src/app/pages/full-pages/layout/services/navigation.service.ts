import { Injectable } from '@angular/core';
import { LocalStoreService } from 'app/core/data/local/local-store.service';
import { isNullOrUndefined } from 'app/core/helpers/functions.util';
import { AuthService } from 'app/pages/full-pages/auth/services/auth.service';
import { system_keys } from 'app/pages/full-pages/system-keys.config';
import { BehaviorSubject } from 'rxjs';
import { IMenuItem, IChildItem } from '../interfaces/menu-item.interface';
import { IShortcut, IBadge } from '../interfaces/shortcut.interface';

export { IMenuItem, IChildItem, IShortcut, IBadge };

@Injectable()
export class NavigationService {
  /*
    // Icon menu TITLE at the very top of navigation.
    // This title will appear if any icon type item is present in menu.
    iconTypeMenuTitle = 'Frequently Accessed';
    // sets iconMenu as default;
    menuItems = new BehaviorSubject<IMenuItem[]>(this.iconMenu);
    // navigation component has subscribed to this Observable
    menuItems$ = this.menuItems.asObservable();
  */
  public menuItemsBuffer: IMenuItem[];
  public shortcutItemsBuffer: IShortcut[]=[];

  public routesArray: string[]=[];

  private menuItems = new BehaviorSubject<IMenuItem[]>([]);
  public menuItems$ = this.menuItems.asObservable();
  private shortcutItems = new BehaviorSubject<IShortcut[]>([]);
  public shortcutItems$ = this.shortcutItems.asObservable();

  constructor(
    private storage: LocalStoreService,
    private auth: AuthService
  ) {
    if (this.auth.isLoged) {
      this.menu(this.storage.getItem(system_keys.user_mr));
      this.publishMenuChanges();
    }
  }

  private compareItems(a: any, b: any) {
    if (a.order_sec === b.order_sec) {
      return 0;
    } else if (a.order_sec > b.order_sec) {
      return 1
    }
    return -1;
  }

  private shortcut(e){
    if([1,2].includes(e.tip_sec)){
      let s:IShortcut ={
        name:e.desc_sec,
        state:e.act_sec,
        icon:e.icon_sec,
        type:e.tip_sec,
        info:e.info
      }
      this.shortcutItemsBuffer.push(s);
    }
  }

  private menu(mr: any[]) {
    this.menuItemsBuffer=[];
    this.shortcutItemsBuffer=[];
    mr.filter(e => isNullOrUndefined(e.cod_par))
      .sort(this.compareItems)
      .forEach(e => {
        let a: IMenuItem = {
          type: e.menu_sec===0 || e.menu_sec === undefined?'link':'dropDown',
          name: e.desc_sec,
          state: e.act_sec,
          icon: e.icon_sec,
          info:e.info,
          cod: e.cod_sec
        }
        if(!isNullOrUndefined(e.act_sec)){
          this.routesArray.push(e.act_sec);
        }

        this.shortcut(e);
        this.generateChilds(a,mr,false);
        this.menuItemsBuffer.push(a);
      });
  }

  private generateChilds(epar: any, mr: any[],f:boolean) {
    let childs: IChildItem[] = [];
    mr.filter(e => e.cod_par === epar.cod)
      .sort(this.compareItems)
      .forEach(v => {
        let child: IChildItem = {
          type: 'link',
          name: v.desc_sec,
          state: v.act_sec,
          cod: v.cod_sec,
          icon:v.icon_sec,
          info:v.info
        }
        if(!isNullOrUndefined(v.act_sec)){
          this.routesArray.push(v.act_sec);
        }
        this.shortcut(v);
        this.generateChilds(child, mr,true);
        childs.push(child);
      });
    epar.sub = childs;
    if (childs.length > 0 && f) {
      epar.type = 'dropDown';
    }
  }

  public initMenu(mr: any,isAlt:boolean) {
    this.menu(mr);
    this.storage.setItem(system_keys.user_mr,mr);
    if(!isAlt){
      this.storage.setItem(system_keys.user_menu_items_ori,this.menuItemsBuffer);
      this.storage.setItem(system_keys.user_shortcut_items_ori,this.shortcutItemsBuffer);
    }
    this.publishMenuChanges();
  }

  public original(){
    let omi = this.storage.getItem(system_keys.user_menu_items_ori);
    let osi = this.storage.getItem(system_keys.user_shortcut_items_ori);
    this.menuItems.next(omi);
    this.shortcutItems.next(osi);
  }

  private publishMenuChanges(){
    this.menuItems.next(this.menuItemsBuffer);
    this.shortcutItems.next(this.shortcutItemsBuffer);
  }

  // Customizer component uses this method to change menu.
  // You can remove this method and customizer component.
  // Or you can customize this method to supply different menu for
  // different user type.
  /*publishNavigationChange(menuType: string) {
    switch (menuType) {
      case 'separator-menu':
        this.menuItems.next(this.separatorMenu);
        break;
      case 'icon-menu':
        this.menuItems.next(this.iconMenu);
        break;
      default:
        this.menuItems.next(this.plainMenu);
    }
  }*/
}
