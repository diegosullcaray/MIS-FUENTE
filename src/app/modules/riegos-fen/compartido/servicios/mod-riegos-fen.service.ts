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
      secret: "B0ECE459601D3577F7408D5C8DEA314A",
      appId: "reporting"
    }, winderService);
  }

  public getResultados(col: 0 | 1 | 2 | 3, val: string): Observable<IWinderResponse> {
    return this.getSimpleResponseString('riegos_fen.resultados', {
      col,
      val
    }, 'resultado');
  }
}
