import { isNullOrUndefined } from "app/core/helpers/functions.util";
import { AnalistaService } from "app/pages/modules/analista/compartido/servicios/analista.service";
import { ModSecService } from "app/pages/modules/analista/compartido/servicios/mod-sec.service";

export abstract class DetalleBaseComponent {
    dataSource:any;
    show:boolean;

    constructor(public antSec: ModSecService, public analista: AnalistaService) { }

    init(): void {
        this.dataSource = this.analista.selectedRow;
        this.show=false;
        if(isNullOrUndefined(this.dataSource)){
            this.navMain();
        }else{
            this.show=true;
        }
    }

    abstract navMain(): void;
}