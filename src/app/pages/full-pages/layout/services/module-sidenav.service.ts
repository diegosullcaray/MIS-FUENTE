import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModuleSidenavService {
  public active = false;
  private toggleSource = new Subject<void>();
  public toggle$ = this.toggleSource.asObservable();

  public register() {
    this.active = true;
  }

  public unregister() {
    this.active = false;
  }

  public toggle() {
    this.toggleSource.next();
  }
}
