import { Injectable } from "@angular/core";
import { AntService } from "app/core/data/remote/ant/ant-service.class";
import { ModSysAdminService } from "app/core/data/remote/instances/mod-sys-admin.service";
import { IWinderResponse } from "app/core/data/remote/winder/winder.interface";
import { WinderService } from "app/core/data/remote/winder/winder.service";
import { StgAppLoaderService } from "app/shared/components/stg-app-loader/stg-app-loader.service";
import { UserService } from "app/pages/full-pages/layout/services/user.service";
import { Observable } from "rxjs";
import { environment } from "environments/environment";
import { printLog } from 'app/core/helpers/debug.util';

@Injectable()
export class   ModCorresponsalService extends AntService {
    profile: any;
    cod_bt: string;
    email: string;
    isAdmin: boolean;

    constructor(private winderService: WinderService, private user: UserService, private antAdmin: ModSysAdminService, private loader: StgAppLoaderService) {
        super({
            port: 6302,
            secret: environment.moduleSecrets.app,
            appId: "app"
        }, winderService);
        let profile = this.user.get('profile');
        this.cod_bt = profile.cod_bt;
        this.email = profile.email;
        this.isAdmin = profile.tip_use === 0;
    }

    public openMsg(msg: string) {
        this.loader.open(msg);
    }

    public closeMsg() {
        this.loader.close();
    }

    public getBaseHierarchy(cod_hierarchy: number): Observable<IWinderResponse> {
        //let currentDate = this.user.get('profile').curr_fec;
        return this.antAdmin.getBaseHierarchy(this.user.email, cod_hierarchy);
    }

    public getRegResultadosListProsp(): Observable<IWinderResponse> {
        return this.getSimpleResponseString("corresponsal.get_list_pro", { cod_bt: this.cod_bt }, "resultado");
    }

    public postRegResultadosProsp(ov: any): Observable<any> {
        printLog(ov);
        let params = { ov_json: JSON.stringify(ov) };
        printLog(params);
        return this.postSimpleResponseString("corresponsal.post_transac", params);
    }


}