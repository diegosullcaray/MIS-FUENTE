import { Component, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
    selector: 'stg-app-confirm',
    templateUrl: './stg-app-confirm.component.html',
    styleUrls: ['./stg-app-confirm.component.scss']
})
export class StgAppConfirmComponent implements OnInit {
    title;
    message;
    constructor(public dialogRef: MatDialogRef<StgAppConfirmComponent>) { }

    ngOnInit() {
    }

    confirm(){
        this.dialogRef.close({result:1});
    }

    cancel(){
        this.dialogRef.close({result:0});
    }

}