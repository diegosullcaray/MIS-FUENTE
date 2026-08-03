import { Component, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
    selector: 'stg-alert',
    templateUrl: './stg-alert.component.html',
    styleUrls: ['./stg-alert.component.scss']
})
export class StgAlertComponent implements OnInit {
    title;
    message;
    constructor(public dialogRef: MatDialogRef<StgAlertComponent>) { }

    ngOnInit() {
    }

}