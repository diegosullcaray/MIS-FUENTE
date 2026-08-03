import { Component, OnInit } from "@angular/core";
import { StgAppLoaderService } from "app/shared/components/stg-app-loader/stg-app-loader.service";
import { ModRepService } from "../../compartido/servicios/mod-rep.service";
import { finalize } from "rxjs/operators";

@Component({
    selector: 'app-reporte-demo',
    templateUrl: './reporte-demo.component.html',
    styleUrls: ['./reporte-demo.component.scss']
})
export class ReporteDemoComponent implements OnInit{

    body:string;
    loading:boolean;

    constructor(private antRep:ModRepService,private loader:StgAppLoaderService){

    }

    ngOnInit(): void {
        this.loader.open();
        this.loading=true;
        this.antRep.getRegularTableResult('reporte-demo',{fecha:'2023-03-21',cod_user_bt:'TMPAM001'}).pipe(
            finalize(() => {
                this.loading=false;
                this.loader.close();
            })
        ).subscribe((x:any)=>{
            this.body = x.body.resultado.data[0].msg;
            //console.log(x.body.resultado.data)
        });
    }

}