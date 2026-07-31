import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModuleSidenavService {
  public active = false;
  public isOpen = true;
  private toggleSource = new Subject<void>();
  public toggle$ = this.toggleSource.asObservable();

  public register(isOpen: boolean = true) {
    this.active = true;
    this.isOpen = isOpen;
  }

  public unregister() {
    this.active = false;
  }

  public setOpen(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  public toggle() {
    this.toggleSource.next();
  }
}
