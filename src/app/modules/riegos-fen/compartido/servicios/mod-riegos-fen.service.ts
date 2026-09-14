import { Injectable } from '@angular/core';
import { AntService } from 'app/core/data/remote/ant/ant-service.class';
import { WinderService } from 'app/core/data/remote/winder/winder.service';
import { IWinderResponse } from 'app/core/data/remote/winder/winder.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModRiegosFenService extends AntService {

  constructor(private winderService: WinderService) {
    super({
      port: 5304,
      secret: 'B0ECE459601D3577F7408D5C8DEA314A',
      appId: 'riesgos'
    }, winderService);
  }

  public getResultados(col: 0 | 1 | 2 | 3, val: string): Observable<IWinderResponse> {
    return this.getSimpleResponseString('mod_rep.com.[REXPAGRO01]', {
      '@col': col,
      '@val': val
    }, 'resultado');
  }

  /**
   * Obtiene el detalle de un riesgo fenológico específico
   * @param payload objeto con identificador y parámetros
   * @returns Observable con la respuesta del backend
   */
  public getDetalle(payload: any): Observable<IWinderResponse> {
    return this.getSimpleResponseString('riegos_fen.detalle', payload, 'resultado');
  }
}
