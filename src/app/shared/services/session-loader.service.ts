import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionLoaderService {
  private visibleSource = new BehaviorSubject<boolean>(false);
  public visible$ = this.visibleSource.asObservable();
  public message = 'Preparando espacio de trabajo...';

  show(message?: string) {
    if (message) {
      this.message = message;
    }
    this.visibleSource.next(true);
  }

  hide() {
    this.visibleSource.next(false);
  }
}
