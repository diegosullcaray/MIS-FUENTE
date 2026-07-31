import { Injectable } from '@angular/core';
import { driver, Config, DriveStep, Driver } from 'driver.js';
import 'driver.js/dist/driver.css';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private driverObj: Driver;

  start(steps: DriveStep[], config: Config = {}): void {
    this.driverObj = driver({
      showProgress: true,
      allowClose: true,
      skipMissingElement: true,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Finalizar',
      progressText: 'Paso {{current}} de {{total}}',
      ...config,
      steps
    });
    this.driverObj.drive();
  }

  destroy(): void {
    if (this.driverObj) {
      this.driverObj.destroy();
    }
  }
}
