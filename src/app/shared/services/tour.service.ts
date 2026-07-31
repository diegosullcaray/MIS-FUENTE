import { Injectable } from '@angular/core';
import { driver, Config, DriveStep, Driver } from 'driver.js';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  // Color de marca del sistema (ver $blue-base en assets/styles/scss/_colors.scss),
  // usado tambien en assets/styles/scss/main/_driver-tour.scss para el popover.
  private static readonly BRAND_COLOR = '#1d396e';

  private driverObj!: Driver;

  start(steps: DriveStep[], config: Config = {}): void {
    this.driverObj = driver({
      showProgress: true,
      allowClose: true,
      skipMissingElement: true,
      overlayColor: TourService.BRAND_COLOR,
      overlayOpacity: 0.6,
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
