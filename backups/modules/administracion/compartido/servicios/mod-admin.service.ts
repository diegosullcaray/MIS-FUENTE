import { Injectable } from "@angular/core";
import { AntService } from "app/core/data/remote/ant/ant-service.class";
import { IWinderResponse } from "app/core/data/remote/winder/winder.interface";
import { WinderService } from "app/core/data/remote/winder/winder.service";
import { StgAppLoaderService } from "app/shared/components/stg-app-loader/stg-app-loader.service";
import { UserService } from "app/system/admin/services/user.service";
import { Observable } from "rxjs";
import { environment } from "environments/environment";

@Injectable()
export class ModAdminService extends AntService {
    cod_bt: string;
    //email: string;
    //isAdmin: boolean;

    constructor(private winderService: WinderService, private user: UserService, private loader: StgAppLoaderService) {
        super({
            port: 6301,
            secret: environment.moduleSecrets.admin,
            appId: "admin"
        }, winderService);
        let profile = this.user.get('profile');
        this.cod_bt = profile.cod_bt;
        //this.email = profile.email;
        //this.isAdmin = profile.tip_use === 0;
    }

    public getListaUsuarios(): Observable<IWinderResponse> {
        return this.getSimpleResponseStringNP("admin.list_users", "resultado");
    }

    public getConfig(cod_cfg:number): Observable<IWinderResponse> {
        return this.getSimpleResponseString("admin.cfg",{cod_cfg:cod_cfg}, "resultado");
    }

}