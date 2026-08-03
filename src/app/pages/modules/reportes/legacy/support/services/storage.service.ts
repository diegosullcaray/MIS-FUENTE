import { Injectable } from '@angular/core';
import { isUndefined, isNull } from 'util';
import { CypherService } from 'app/core/services/cypher.service';
import { environment } from 'environments/environment';


@Injectable({ providedIn: 'root' })
export class StorageService {
    private keys:Set<string> = new Set<string>();

    constructor(private cypherService: CypherService) { }

    public setLocalItem(key: string, value: any) {
        let str = JSON.stringify(value);
        if (environment.production) {
            str = this.cypherService.encrypt(str);
        }
        localStorage.setItem(key, str);
        this.keys.add(key);
    }

    public getLocalItem<T = unknown>(key: string):T{
        let str = localStorage.getItem(key);
        try {
            if (environment.production) {
                str = this.cypherService.decrypt(str);
            }
            return JSON.parse(str);
        } catch (e) {
            return null;
        }
    }

    public removeLocalItem(key:string){
        localStorage.removeItem(key);
        this.keys.delete(key);
    }

    public clearAll(f?:boolean){
        /*console.log('holi');
        console.log(this.keys.size);
        if(f){
            localStorage.clear();
        }else{            
            this.keys.forEach(x=>{
                console.log(x);
                localStorage.removeItem(x);
            });
            this.keys = new Set<string>();

        }*/
        localStorage.clear();
    }
}