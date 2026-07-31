import { Injectable } from "@angular/core";
import { AntService } from "app/core/data/remote/ant/ant-service.class";
import { IWinderResponse } from "app/core/data/remote/winder/winder.interface";
import { WinderService } from "app/core/data/remote/winder/winder.service";
import { StgAppLoaderService } from "app/shared/components/stg-app-loader/stg-app-loader.service";
import { isNullOrUndefined } from "app/core/helpers/functions.util";
import { ReportType } from "app/pages/modules/reportes/legacy/support/data/ant-mod-rep.service";
import { UserService } from "app/pages/full-pages/layout/services/user.service";
import { Observable } from "rxjs";
import { environment } from "environments/environment";  
import { ModRepService } from '../../../../reportes/compartido/servicios/mod-rep.service';
import { printLog } from 'app/core/helpers/debug.util';

@Injectable()
export class ModProspectoCorService extends AntService {
    cod_bt: string;
    is_admin: number;

    constructor(private winderService: WinderService, private user: UserService, private loader: StgAppLoaderService, private datosReporte: ModRepService) {
        super({ 
            port: 5301,
            secret: environment.moduleSecrets.secciones,
            appId: "secciones"
        }, winderService);
        let profile = this.user.get('profile');
        this.cod_bt = profile.cod_bt; 
        this.is_admin = profile.tip_use === 0?1:0;
    }

    public getRegResultadosListProsp(cod_met:string): Observable<IWinderResponse> {
        return this.getSimpleResponseString("corresponsal.get_list_pro", { cod_bt: cod_met }, "resultado");
    } //

     
    public getConfiguracionMod(): Observable<IWinderResponse> {
        return this.getSimpleResponseString("corresponsal.cfg_mod", { cod_bt: this.cod_bt }, "resultado");
    }// 
    
    public postActualizaCor(cod_numdoc:number,cfg:any): Observable<IWinderResponse> {
        printLog(this.cod_bt,cod_numdoc,JSON.stringify(cfg))
        return this.postSimpleResponseString("corresponsal.act_corr", { cod_bt: this.cod_bt,cod_numdoc:cod_numdoc,cfg:JSON.stringify(cfg) });
    }//

    public postAddUsuarioCor(cod_numdoc:number,cfg:any): Observable<IWinderResponse> {
        printLog(this.cod_bt,cod_numdoc,JSON.stringify(cfg))
        return this.postSimpleResponseString("corresponsal.add_asesor", { cod_bt: this.cod_bt,cod_numdoc:cod_numdoc,cfg:JSON.stringify(cfg) });
    } //

     

}